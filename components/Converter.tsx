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
      <Card className="border-slate-200 shadow-xl bg-white/50 backdrop-blur-md">
        <CardContent className="p-6 md:p-8">
          <TabsContainer value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8 bg-slate-100 p-1.5 h-14 border-slate-200">
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
                        ? "border-red-500/50 bg-red-50 hover:bg-red-100" 
                        : "border-slate-300 bg-slate-50/50 hover:border-blue-500 hover:bg-slate-100"
                    )}
                  >
                    <div className="absolute inset-0 bg-grid-black/[0.02] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                    <div className="relative z-10 flex flex-col items-center space-y-4 text-center p-6">
                      <div className={cn(
                        "p-4 rounded-full transition-transform duration-300 group-hover:scale-110 shadow-sm",
                        fileError ? "bg-red-100 text-red-500" : "bg-white text-blue-500 border border-slate-100"
                      )}>
                        {fileError ? <AlertCircle size={40} /> : 
                           activeTab === 'image' ? <ImageIcon size={40} /> :
                           activeTab === 'document' ? <FileText size={40} /> :
                           <Upload size={40} />
                        }
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-semibold text-slate-800">
                          {fileError ? 'Invalid File' : 'Drop your file here'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {fileError || 'or click to browse'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 mt-4">
                        Max 50MB • {
                          activeTab === 'image' ? 'JPG, PNG, GIF, BMP, WEBP' : 
                          activeTab === 'document' ? 'PDF, DOCX, XLSX' :
                          'JSON, CSV, TXT'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-4 duration-500">
                    {/* File Info Card */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                          {activeTab === 'image' && previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                             activeTab === 'document' ? <FileText size={32} className="text-slate-400" /> :
                             <FileType size={32} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate" title={file.name}>{file.name}</h3>
                          <p className="text-sm text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button 
                            onClick={resetState}
                            className="text-xs text-red-500 hover:text-red-700 mt-2 font-medium flex items-center gap-1"
                          >
                            <X size={12} /> Remove File
                          </button>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                             <Settings2 size={16} /> Target Format
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {getAvailableFormats().map(fmt => (
                              <button
                                key={fmt}
                                onClick={() => setTargetFormat(fmt)}
                                className={cn(
                                  "px-3 py-2 rounded-lg text-sm font-semibold transition-all border break-words",
                                  targetFormat === fmt
                                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-105"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-500"
                                )}
                              >
                                {getFormatLabel(fmt)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {activeTab === 'image' && ['jpg', 'webp'].includes(targetFormat) && (
                          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-700">Quality</label>
                                <span className="text-sm text-blue-600 font-bold">{quality[0]}%</span>
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
                              className="w-full text-lg shadow-lg shadow-blue-500/20"
                              onClick={handleConvert}
                              disabled={isConverting || !targetFormat}
                            >
                              {isConverting ? 'Converting...' : 'Convert Now'}
                            </Button>
                        ) : (
                             <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex flex-col items-center gap-4 animate-in zoom-in-95">
                                <div className="flex items-center gap-2 text-green-700 font-semibold">
                                    <CheckCircle2 size={20} /> Conversion Complete
                                </div>
                                <Button 
                                  size="lg" 
                                  className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20"
                                  onClick={handleDownload}
                                >
                                  <Download className="mr-2" size={20} /> Download Result
                                </Button>
                                <button 
                                    onClick={() => setConvertedBlob(null)}
                                    className="text-sm text-slate-500 hover:text-slate-700 underline"
                                >
                                    Convert another format
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
         <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 text-center mx-4">
                 <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                 <h3 className="text-xl font-bold text-slate-900">Converting...</h3>
                 <p className="text-slate-500">Processing your document...</p>
                 <Progress value={progress} className="h-2" />
             </div>
         </div>
      )}
    </div>
  );
};