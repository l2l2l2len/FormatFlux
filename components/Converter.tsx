import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileType, Image as ImageIcon, FileText, Download, X, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { useToast } from './ui/toast';
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

  useEffect(() => {
    resetState();
    if (activeTab === 'image') setTargetFormat('png');
    if (activeTab === 'data') setTargetFormat('json');
    if (activeTab === 'document') setTargetFormat('');
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
    const sizeLimit = 50 * 1024 * 1024;
    if (file.size > sizeLimit) {
      setFileError('File size exceeds 50MB limit.');
      return false;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (type === 'image' && !file.type.startsWith('image/') && ext !== 'ico') {
      setFileError('Please upload a valid image file.');
      return false;
    }
    if (type === 'data' && !['json', 'csv', 'txt'].includes(ext)) {
      setFileError('Please upload a .json, .csv, or .txt file.');
      return false;
    }
    if (type === 'document' && !['pdf', 'docx', 'xlsx', 'xls'].includes(ext)) {
      setFileError('Supported formats: PDF, Word (DOCX), Excel (XLSX).');
      return false;
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
    setConvertedBlob(null);
    setProgress(0);
    if (activeTab === 'document') {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') setTargetFormat('csv');
      if (ext === 'docx') setTargetFormat('pdf');
      if (ext === 'pdf') setTargetFormat('txt');
    }
    if (activeTab === 'image') {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleConvert = async () => {
    if (!file || !targetFormat) return;
    setIsConverting(true);
    setProgress(10);
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      let blob: Blob;
      if (activeTab === 'image') {
        blob = await convertImage(file, targetFormat as ImageFormat, quality[0] / 100);
      } else if (activeTab === 'data') {
        blob = await convertData(file, targetFormat as DataFormat);
      } else {
        blob = await convertDocument(file, targetFormat as DocumentFormat);
      }
      clearInterval(progressInterval);
      setProgress(100);
      setConvertedBlob(blob);
      addToast('Conversion successful!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Conversion failed', 'error');
      setProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    let ext = targetFormat;
    if (targetFormat === 'docx' && file.name.endsWith('.pdf')) ext = 'doc';
    downloadBlob(convertedBlob, `${nameWithoutExt}.${ext}`);
  };

  const getAvailableFormats = () => {
    if (!file) return [];
    const currentExt = file.name.split('.').pop()?.toLowerCase();
    if (activeTab === 'image') return IMAGE_FORMATS.filter(f => f !== currentExt);
    if (activeTab === 'data') return DATA_FORMATS.filter(f => f !== currentExt);
    if (activeTab === 'document') {
      if (currentExt === 'xlsx' || currentExt === 'xls') return ['csv', 'json', 'html'];
      if (currentExt === 'docx') return ['pdf', 'txt', 'html'];
      if (currentExt === 'pdf') return ['txt', 'docx', 'jpg', 'png'];
    }
    return [];
  };

  const getFormatLabel = (fmt: string) => fmt === 'docx' ? 'WORD (Text)' : fmt.toUpperCase();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <CategoryToggle activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="bg-white/90 backdrop-blur-xl shadow-lg border border-ink/5 rounded-3xl p-8 md:p-10">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
              fileError ? "border-red-400/50 bg-red-50 hover:bg-red-100" : "border-ink/10 bg-paper-dark/30 hover:border-accent-indigo/50 hover:bg-paper-dark/50"
            )}
          >
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.15)_1px,_transparent_0)] bg-[length:24px_24px]" />
            <div className="relative z-10 flex flex-col items-center space-y-5 text-center p-6">
              <div className={cn("p-5 rounded-2xl transition-all duration-300 group-hover:scale-110", fileError ? "bg-red-500/20 text-red-400" : "bg-gradient-to-br from-accent-indigo/10 to-accent-blue/10 text-accent-indigo")}>
                {fileError ? <AlertCircle size={40} /> : activeTab === 'image' ? <ImageIcon size={40} /> : activeTab === 'document' ? <FileText size={40} /> : <Upload size={40} />}
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-ink tracking-tight">{fileError ? 'Invalid File' : 'Drop your file here'}</p>
                <p className="text-sm text-ink-light font-medium">{fileError || 'or click to browse'}</p>
              </div>
              <div className="mt-2 px-4 py-1.5 bg-paper-dark rounded-full text-xs font-medium text-slate uppercase tracking-wider">
                Max 50MB • {activeTab === 'image' ? 'JPG, PNG, GIF, BMP, WEBP' : activeTab === 'document' ? 'PDF, DOCX, XLSX' : 'JSON, CSV, TXT'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-5 p-5 rounded-2xl bg-paper-dark/50 border border-ink/5">
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-white border border-ink/10 flex items-center justify-center shrink-0">
                {activeTab === 'image' && previewUrl ? <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" /> : activeTab === 'document' ? <FileText size={32} className="text-slate" /> : <FileType size={32} className="text-slate" />}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-semibold text-lg text-ink truncate" title={file.name}>{file.name}</h3>
                <p className="text-sm font-medium text-slate mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button onClick={resetState} className="text-xs text-red-400 hover:text-red-500 mt-3 font-semibold flex items-center gap-1 uppercase tracking-wide transition-colors"><X size={14} strokeWidth={3} /> Remove</button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-semibold text-ink-light flex items-center gap-2 uppercase tracking-wide"><Settings2 size={16} /> Target Format</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {getAvailableFormats().map(fmt => (
                    <button key={fmt} onClick={() => setTargetFormat(fmt)} className={cn("px-4 py-3 rounded-xl text-sm font-semibold transition-all border", targetFormat === fmt ? "bg-gradient-to-r from-accent-indigo to-accent-blue text-white border-transparent shadow-glow-sm scale-105" : "bg-paper-dark text-ink-light border-ink/10 hover:border-accent-indigo/50 hover:text-ink")}>{getFormatLabel(fmt)}</button>
                  ))}
                </div>
              </div>
              {activeTab === 'image' && ['jpg', 'webp'].includes(targetFormat) && (
                <div className="space-y-4 p-5 bg-paper-dark/50 rounded-2xl border border-ink/10">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-ink-light uppercase tracking-wide">Quality</label>
                    <span className="px-3 py-1 bg-gradient-to-r from-accent-indigo to-accent-blue rounded-lg text-sm text-white font-semibold">{quality[0]}%</span>
                  </div>
                  <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={1} />
                </div>
              )}
              {!convertedBlob ? (
                <Button size="lg" className="w-full text-base shadow-glow" onClick={handleConvert} disabled={isConverting || !targetFormat}>{isConverting ? 'Processing...' : 'Convert Now'}</Button>
              ) : (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col items-center gap-5">
                  <div className="flex items-center gap-2 text-ink font-semibold text-lg"><CheckCircle2 size={24} className="text-emerald-500" /> Conversion Complete</div>
                  <Button size="lg" className="w-full" onClick={handleDownload}><Download className="mr-2" size={20} /> Download Result</Button>
                  <button onClick={() => setConvertedBlob(null)} className="text-sm font-medium text-slate hover:text-ink underline underline-offset-2 transition-colors">Convert another file</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept={activeTab === 'image' ? "image/*" : activeTab === 'data' ? ".json,.csv,.txt" : ".pdf,.docx,.xlsx,.xls"} onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} />
      {isConverting && (
        <div className="fixed inset-0 bg-paper/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white shadow-2xl border border-ink/5 p-10 rounded-3xl max-w-sm w-full space-y-6 text-center mx-4">
            <div className="w-16 h-16 border-4 border-accent-indigo border-t-accent-blue rounded-full animate-spin mx-auto" />
            <div className="space-y-2"><h3 className="text-2xl font-bold text-ink">Converting</h3><p className="text-slate font-medium">Processing your file...</p></div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
};
