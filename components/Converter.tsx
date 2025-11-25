import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileType, Image as ImageIcon, FileText, Download, X, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { TabsContainer, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
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
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Card className="border-0 shadow-premium bg-white">
        <CardContent className="p-6 md:p-10">
          <TabsContainer value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-10 bg-cream-100 p-1.5 h-14 border border-cream-200">
              <TabsTrigger value="image" className="gap-2 text-base">
                <ImageIcon size={18} /> Images
              </TabsTrigger>
              <TabsTrigger value="document" className="gap-2 text-base">
                <FileText size={18} /> Documents
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-2 text-base">
                <FileType size={18} /> Data
              </TabsTrigger>
            </TabsList>

            {['image', 'data', 'document'].includes(activeTab) && (
              <TabsContent value={activeTab} className="space-y-8">
                {/* Upload Area */}
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "group relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
                      fileError 
                        ? "border-red-300 bg-red-50 hover:bg-red-100" 
                        : "border-brand-black/20 bg-cream-50 hover:border-brand-yellow hover:bg-cream-100"
                    )}
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
                    <div className="relative z-10 flex flex-col items-center space-y-5 text-center p-6">
                      <div className={cn(
                        "p-5 rounded-full transition-transform duration-300 group-hover:scale-110 shadow-sm",
                        fileError ? "bg-red-100 text-red-500" : "bg-brand-yellow text-brand-black border-2 border-brand-black"
                      )}>
                        {fileError ? <AlertCircle size={40} /> : 
                           activeTab === 'image' ? <ImageIcon size={40} /> :
                           activeTab === 'document' ? <FileText size={40} /> :
                           <Upload size={40} />
                        }
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-brand-black tracking-tight">
                          {fileError ? 'Invalid File' : 'Drop your file here'}
                        </p>
                        <p className="text-base text-brand-black/60 font-medium">
                          {fileError || 'or click to browse'}
                        </p>
                      </div>
                      <div className="mt-4 px-4 py-1 bg-white border border-cream-200 rounded-full text-xs font-semibold text-brand-black/50 uppercase tracking-wider">
                        Max 50MB • {
                          activeTab === 'image' ? 'JPG, PNG, GIF, BMP, WEBP' : 
                          activeTab === 'document' ? 'PDF, DOCX, XLSX' :
                          'JSON, CSV, TXT'
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-4 duration-500">
                    {/* File Info Card */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-start gap-5 p-5 rounded-2xl bg-cream-50 border border-cream-200">
                        <div className="h-24 w-24 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm border border-cream-200">
                          {activeTab === 'image' && previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                             activeTab === 'document' ? <FileText size={40} className="text-brand-black/40" /> :
                             <FileType size={40} className="text-brand-black/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <h3 className="font-bold text-lg text-brand-black truncate" title={file.name}>{file.name}</h3>
                          <p className="text-sm font-medium text-brand-black/50 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button 
                            onClick={resetState}
                            className="text-xs text-red-600 hover:text-red-700 mt-3 font-bold flex items-center gap-1 uppercase tracking-wide"
                          >
                            <X size={14} strokeWidth={3} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-brand-black/70 flex items-center gap-2 uppercase tracking-wide">
                             <Settings2 size={16} /> Target Format
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {getAvailableFormats().map(fmt => (
                              <button
                                key={fmt}
                                onClick={() => setTargetFormat(fmt)}
                                className={cn(
                                  "px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 break-words",
                                  targetFormat === fmt
                                    ? "bg-brand-black text-brand-yellow border-brand-black shadow-lg scale-105"
                                    : "bg-white text-brand-black/60 border-cream-200 hover:border-brand-yellow hover:text-brand-black"
                                )}
                              >
                                {getFormatLabel(fmt)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {activeTab === 'image' && ['jpg', 'webp'].includes(targetFormat) && (
                          <div className="space-y-4 p-5 bg-cream-50 rounded-2xl border border-cream-200">
                             <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-brand-black/70 uppercase tracking-wide">Quality</label>
                                <span className="px-2 py-0.5 bg-brand-yellow rounded text-sm text-brand-black font-bold border border-brand-black/10">{quality[0]}%</span>
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
                              className="w-full text-lg shadow-xl shadow-brand-yellow/20"
                              onClick={handleConvert}
                              disabled={isConverting || !targetFormat}
                            >
                              {isConverting ? 'Processing...' : 'CONVERT NOW'}
                            </Button>
                        ) : (
                             <div className="p-6 bg-brand-yellow/10 rounded-2xl border-2 border-brand-yellow flex flex-col items-center gap-5 animate-in zoom-in-95">
                                <div className="flex items-center gap-2 text-brand-black font-bold text-lg">
                                    <CheckCircle2 size={24} className="text-green-600" /> Conversion Complete
                                </div>
                                <Button 
                                  size="lg" 
                                  className="w-full bg-brand-black text-brand-yellow hover:bg-black shadow-xl"
                                  onClick={handleDownload}
                                >
                                  <Download className="mr-2" size={20} /> Download Result
                                </Button>
                                <button 
                                    onClick={() => setConvertedBlob(null)}
                                    className="text-sm font-semibold text-brand-black/50 hover:text-brand-black underline"
                                >
                                    Convert another file
                                </button>
                             </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
          </TabsContainer>
        </CardContent>
      </Card>

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
         <div className="fixed inset-0 bg-cream-50/90 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="bg-white p-10 rounded-3xl border border-cream-200 shadow-2xl max-w-sm w-full space-y-6 text-center mx-4">
                 <div className="w-16 h-16 border-4 border-brand-yellow border-t-brand-black rounded-full animate-spin mx-auto" />
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-brand-black">CONVERTING</h3>
                    <p className="text-brand-black/50 font-medium">Processing your file...</p>
                 </div>
                 <Progress value={progress} className="h-3" />
             </div>
         </div>
      )}
    </div>
  );
};