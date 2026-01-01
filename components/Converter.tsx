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

// Category Toggle - Clean tab style
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
    <div className="flex items-center justify-center gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeTab === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onTabChange(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <CategoryToggle activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer m-4",
              fileError
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:border-brand-blue hover:bg-blue-50"
            )}
            style={{ width: 'calc(100% - 2rem)' }}
          >
            <div className="flex flex-col items-center space-y-4 text-center p-6">
              <div className={cn(
                "p-4 rounded-full",
                fileError ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue"
              )}>
                {fileError ? <AlertCircle size={32} /> :
                  activeTab === 'image' ? <ImageIcon size={32} /> :
                  activeTab === 'document' ? <FileText size={32} /> :
                  <Upload size={32} />
                }
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-900">
                  {fileError ? 'Invalid File' : 'Drop your file here'}
                </p>
                <p className="text-sm text-gray-500">
                  {fileError || 'or click to browse'}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Max 50MB • {
                  activeTab === 'image' ? 'JPG, PNG, GIF, BMP, WEBP' :
                  activeTab === 'document' ? 'PDF, DOCX, XLSX' :
                  'JSON, CSV, TXT'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* File Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0">
                {activeTab === 'image' && previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : activeTab === 'document' ? (
                  <FileText size={24} className="text-gray-400" />
                ) : (
                  <FileType size={24} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate" title={file.name}>{file.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={resetState}
                  className="text-sm text-red-500 hover:text-red-600 mt-2 font-medium flex items-center gap-1 transition-colors"
                >
                  <X size={14} /> Remove
                </button>
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings2 size={14} /> Target Format
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {getAvailableFormats().map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-sm font-medium transition-all border",
                      targetFormat === fmt
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-white text-gray-700 border-gray-200 hover:border-brand-blue hover:text-brand-blue"
                    )}
                  >
                    {getFormatLabel(fmt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider for images */}
            {activeTab === 'image' && ['jpg', 'webp'].includes(targetFormat) && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Quality</label>
                  <span className="px-2 py-0.5 bg-brand-blue text-white rounded text-sm font-medium">{quality[0]}%</span>
                </div>
                <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={1} />
              </div>
            )}

            {/* Convert / Download */}
            {!convertedBlob ? (
              <Button
                size="lg"
                className="w-full"
                onClick={handleConvert}
                disabled={isConverting || !targetFormat}
              >
                {isConverting ? 'Processing...' : 'Convert File'}
              </Button>
            ) : (
              <div className="p-5 bg-green-50 rounded-lg border border-green-200 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle2 size={20} /> Conversion Complete
                </div>
                <Button size="lg" className="w-full" onClick={handleDownload}>
                  <Download className="mr-2" size={18} /> Download Result
                </Button>
                <button
                  onClick={() => setConvertedBlob(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Convert another file
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={activeTab === 'image' ? "image/*" : activeTab === 'data' ? ".json,.csv,.txt" : ".pdf,.docx,.xlsx,.xls"}
        onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
      />

      {/* Loading Overlay */}
      {isConverting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white shadow-xl border border-gray-200 p-8 rounded-xl max-w-sm w-full space-y-5 text-center mx-4">
            <div className="w-12 h-12 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-gray-900">Converting</h3>
              <p className="text-gray-500 text-sm">Processing your file...</p>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      )}
    </div>
  );
};
