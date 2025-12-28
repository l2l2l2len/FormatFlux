import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileType, Image as ImageIcon, FileText, Download, X, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { useToast } from './ui/toast';
import { useTheme } from './ThemeProvider';
import { cn } from '../utils/cn';
import {
  convertImage,
  convertData,
  convertDocument,
  downloadBlob,
  IMAGE_FORMATS,
  DATA_FORMATS,
  type ImageFormat,
  type DataFormat,
  type DocumentFormat
} from '../utils/fileConverter';

type ConverterMode = 'image' | 'data' | 'document';

// Category Toggle Pill Buttons
interface CategoryToggleProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CategoryToggle: React.FC<CategoryToggleProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const categories = [
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'data', label: 'Data', icon: FileType },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeTab === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onTabChange(category.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-gradient-to-r from-accent-indigo to-accent-blue text-white shadow-glow-sm"
                : isDark
                  ? "glass text-text-secondary hover:text-text-primary hover:bg-white/10"
                  : "bg-white/80 text-ink-light hover:text-ink hover:bg-white shadow-soft border border-ink/5"
            )}
          >
            <Icon size={16} />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Converter: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('image');

  // File State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Conversion State
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [quality, setQuality] = useState<number[]>([90]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when tab changes
  useEffect(() => {
    resetState();
    // Set default target formats based on tab
    if (activeTab === 'image') setTargetFormat('png');
    if (activeTab === 'data') setTargetFormat('json');
    if (activeTab === 'document') setTargetFormat(''); // Depends on input
  }, [activeTab]);

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setConvertedBlob(null);
    setProgress(0);
    setIsConverting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File, type: ConverterMode): boolean => {
    const sizeLimit = 50 * 1024 * 1024; // 50MB
    if (file.size > sizeLimit) {
      setFileError('File size exceeds 50MB limit.');
      return false;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (type === 'image' && !file.type.startsWith('image/') && ext !== 'ico') {
      setFileError('Please upload a valid image file (jpg, png, webp, gif, bmp).');
      return false;
    }

    if (type === 'data') {
      if (!['json', 'csv', 'txt'].includes(ext)) {
        setFileError('Please upload a .json, .csv, or .txt file.');
        return false;
      }
    }

    if (type === 'document') {
        if (!['pdf', 'docx', 'xlsx', 'xls'].includes(ext)) {
            setFileError('Supported formats: PDF, Word (DOCX), Excel (XLSX).');
            return false;
        }
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFileError(null);
    if (!validateFile(selectedFile, activeTab as ConverterMode)) return;

    setFile(selectedFile);
    setConvertedBlob(null); // Clear previous result
    setProgress(0);

    // Auto-select sensible default target for docs
    if (activeTab === 'document') {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'xlsx' || ext === 'xls') setTargetFormat('csv');
        if (ext === 'docx') setTargetFormat('pdf');
        if (ext === 'pdf') setTargetFormat('txt');
    }

    // Generate preview for images
    if (activeTab === 'image') {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
        setPreviewUrl(null);
    }
  };

  const handleConvert = async () => {
    if (!file || !targetFormat) return;

    setIsConverting(true);
    setProgress(10);

    try {
      // Simulate progress steps for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      let blob: Blob;

      if (activeTab === 'image') {
        blob = await convertImage(file, targetFormat as ImageFormat, quality[0] / 100);
      } else if (activeTab === 'data') {
        blob = await convertData(file, targetFormat as DataFormat);
      } else if (activeTab === 'document') {
        blob = await convertDocument(file, targetFormat as DocumentFormat);
      } else {
        throw new Error('Unknown mode');
      }

      clearInterval(progressInterval);
      setProgress(100);
      setConvertedBlob(blob);
      addToast('Conversion successful!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Conversion failed', 'error');
      setProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    // Handle special doc case where we return HTML as doc/docx
    let ext = targetFormat;
    if (targetFormat === 'docx' && file.name.endsWith('.pdf')) {
        ext = 'doc'; // Use .doc for the html-in-word hack
    }
    downloadBlob(convertedBlob, `${nameWithoutExt}.${ext}`);
  };

  // Helper to get compatible formats excluding current
  const getAvailableFormats = () => {
    if (!file) return [];
    const currentExt = file.name.split('.').pop()?.toLowerCase();

    if (activeTab === 'image') {
      return IMAGE_FORMATS.filter(f => f !== currentExt);
    }
    if (activeTab === 'data') {
      return DATA_FORMATS.filter(f => f !== currentExt);
    }
    if (activeTab === 'document') {
        if (currentExt === 'xlsx' || currentExt === 'xls') return ['csv', 'json', 'html'];
        if (currentExt === 'docx') return ['pdf', 'txt', 'html'];
        if (currentExt === 'pdf') return ['txt', 'docx', 'jpg', 'png']; // docx here is text-only
    }
    return [];
  };

  const getFormatLabel = (fmt: string) => {
      if (fmt === 'docx') return 'WORD (Text)';
      return fmt.toUpperCase();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Category Toggle Pills */}
      <CategoryToggle activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Glass-morphic Converter Card */}
      <div className={cn(
        "rounded-3xl p-8 md:p-10 transition-all duration-300",
        isDark
          ? "glass-strong shadow-premium"
          : "bg-white/90 backdrop-blur-xl shadow-lg border border-ink/5"
      )}>
        {/* Upload Area */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
              fileError
                ? isDark
                  ? "border-red-400/50 bg-red-500/5 hover:bg-red-500/10"
                  : "border-red-400/50 bg-red-50 hover:bg-red-100"
                : isDark
                  ? "border-white/10 bg-white/5 hover:border-accent-indigo/50 hover:bg-white/10"
                  : "border-ink/10 bg-paper-dark/30 hover:border-accent-indigo/50 hover:bg-paper-dark/50"
            )}
          >
            {/* Subtle pattern overlay */}
            <div className={cn(
              "absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[length:24px_24px]",
              isDark ? "opacity-5" : "opacity-[0.02]"
            )} />

            <div className="relative z-10 flex flex-col items-center space-y-5 text-center p-6">
              <div className={cn(
                "p-5 rounded-2xl transition-all duration-300 group-hover:scale-110",
                fileError
                  ? "bg-red-500/20 text-red-400"
                  : isDark
                    ? "bg-gradient-to-br from-accent-indigo/20 to-accent-blue/20 text-accent-indigo"
                    : "bg-gradient-to-br from-accent-indigo/10 to-accent-blue/10 text-accent-indigo"
              )}>
                {fileError ? <AlertCircle size={40} /> :
                   activeTab === 'image' ? <ImageIcon size={40} /> :
                   activeTab === 'document' ? <FileText size={40} /> :
                   <Upload size={40} />
                }
              </div>
              <div className="space-y-2">
                <p className={cn(
                  "text-xl font-semibold tracking-tight",
                  isDark ? "text-text-primary" : "text-ink"
                )}>
                  {fileError ? 'Invalid File' : 'Drop your file here'}
                </p>
                <p className={cn(
                  "text-sm font-medium",
                  isDark ? "text-text-secondary" : "text-ink-light"
                )}>
                  {fileError || 'or click to browse'}
                </p>
              </div>
              <div className={cn(
                "mt-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider",
                isDark ? "glass text-text-muted" : "bg-paper-dark text-slate"
              )}>
                Max 50MB • {
                  activeTab === 'image' ? 'JPG, PNG, GIF, BMP, WEBP' :
                  activeTab === 'document' ? 'PDF, DOCX, XLSX' :
                  'JSON, CSV, TXT'
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* File Info Card */}
            <div className={cn(
              "flex items-start gap-5 p-5 rounded-2xl border",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-paper-dark/50 border-ink/5"
            )}>
              <div className={cn(
                "h-20 w-20 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border",
                isDark
                  ? "bg-midnight-lighter border-white/10"
                  : "bg-white border-ink/10"
              )}>
                {activeTab === 'image' && previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                   activeTab === 'document' ? <FileText size={32} className={isDark ? "text-text-muted" : "text-slate"} /> :
                   <FileType size={32} className={isDark ? "text-text-muted" : "text-slate"} />
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className={cn(
                  "font-semibold text-lg truncate",
                  isDark ? "text-text-primary" : "text-ink"
                )} title={file.name}>
                  {file.name}
                </h3>
                <p className={cn(
                  "text-sm font-medium mt-1",
                  isDark ? "text-text-muted" : "text-slate"
                )}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={resetState}
                  className="text-xs text-red-400 hover:text-red-300 mt-3 font-semibold flex items-center gap-1 uppercase tracking-wide transition-colors"
                >
                  <X size={14} strokeWidth={3} /> Remove
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="space-y-4">
                <label className={cn(
                  "text-sm font-semibold flex items-center gap-2 uppercase tracking-wide",
                  isDark ? "text-text-secondary" : "text-ink-light"
                )}>
                   <Settings2 size={16} /> Target Format
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {getAvailableFormats().map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-semibold transition-all border",
                        targetFormat === fmt
                          ? "bg-gradient-to-r from-accent-indigo to-accent-blue text-white border-transparent shadow-glow-sm scale-105"
                          : isDark
                            ? "bg-white/5 text-text-secondary border-white/10 hover:border-accent-indigo/50 hover:text-text-primary"
                            : "bg-paper-dark text-ink-light border-ink/10 hover:border-accent-indigo/50 hover:text-ink"
                      )}
                    >
                      {getFormatLabel(fmt)}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'image' && ['jpg', 'webp'].includes(targetFormat) && (
                <div className={cn(
                  "space-y-4 p-5 rounded-2xl border",
                  isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-paper-dark/50 border-ink/10"
                )}>
                   <div className="flex justify-between items-center">
                      <label className={cn(
                        "text-sm font-semibold uppercase tracking-wide",
                        isDark ? "text-text-secondary" : "text-ink-light"
                      )}>
                        Quality
                      </label>
                      <span className="px-3 py-1 bg-gradient-to-r from-accent-indigo to-accent-blue rounded-lg text-sm text-white font-semibold">
                        {quality[0]}%
                      </span>
                   </div>
                   <Slider
                      value={quality}
                      onValueChange={setQuality}
                      min={10}
                      max={100}
                      step={1}
                   />
                </div>
              )}

              {!convertedBlob ? (
                  <Button
                    size="lg"
                    className="w-full text-base shadow-glow"
                    onClick={handleConvert}
                    disabled={isConverting || !targetFormat}
                  >
                    {isConverting ? 'Processing...' : 'Convert Now'}
                  </Button>
              ) : (
                   <div className={cn(
                     "p-6 rounded-2xl border flex flex-col items-center gap-5",
                     isDark
                       ? "bg-emerald-500/10 border-emerald-500/30"
                       : "bg-emerald-50 border-emerald-200"
                   )}>
                      <div className={cn(
                        "flex items-center gap-2 font-semibold text-lg",
                        isDark ? "text-text-primary" : "text-ink"
                      )}>
                          <CheckCircle2 size={24} className="text-emerald-500" /> Conversion Complete
                      </div>
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleDownload}
                      >
                        <Download className="mr-2" size={20} /> Download Result
                      </Button>
                      <button
                          onClick={() => setConvertedBlob(null)}
                          className={cn(
                            "text-sm font-medium underline underline-offset-2 transition-colors",
                            isDark
                              ? "text-text-muted hover:text-text-primary"
                              : "text-slate hover:text-ink"
                          )}
                      >
                          Convert another file
                      </button>
                   </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={
            activeTab === 'image' ? "image/*" :
            activeTab === 'data' ? ".json,.csv,.txt" :
            activeTab === 'document' ? ".pdf,.docx,.xlsx,.xls" :
            "*"
        }
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
        }}
      />

      {/* Loading Overlay */}
      {isConverting && (
         <div className={cn(
           "fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center",
           isDark ? "bg-midnight/90" : "bg-paper/90"
         )}>
             <div className={cn(
               "p-10 rounded-3xl max-w-sm w-full space-y-6 text-center mx-4",
               isDark ? "glass-strong shadow-premium" : "bg-white shadow-2xl border border-ink/5"
             )}>
                 <div className="w-16 h-16 border-4 border-accent-indigo border-t-accent-blue rounded-full animate-spin mx-auto" />
                 <div className="space-y-2">
                    <h3 className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-text-primary" : "text-ink"
                    )}>
                      Converting
                    </h3>
                    <p className={cn(
                      "font-medium",
                      isDark ? "text-text-muted" : "text-slate"
                    )}>
                      Processing your file...
                    </p>
                 </div>
                 <Progress value={progress} className="h-2" />
             </div>
         </div>
      )}
    </div>
  );
};
