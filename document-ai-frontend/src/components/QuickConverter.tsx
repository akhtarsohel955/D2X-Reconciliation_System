import { useState, useRef, useEffect } from 'react';
import { processDocument, isAuthenticated } from '../services/api';
import { useConversionStats } from '../contexts/ConversionContext';
import ProgressBar from './ProgressBar';

interface FileFormat {
  id: string;
  name: string;
  extension: string;
  category: string;
  isSupported: boolean;
  documentType?: 'EXPENSE' | 'HR';
  description: string;
}

const fileFormats: FileFormat[] = [
  // ✅ SUPPORTED FORMATS (working with backend)
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    category: 'Document',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'Portable Document Format'
  },
  {
    id: 'doc',
    name: 'DOC',
    extension: 'doc',
    category: 'Document',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'Microsoft Word Document'
  },
  {
    id: 'docx',
    name: 'DOCX',
    extension: 'docx',
    category: 'Document',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'Microsoft Word Document'
  },
  {
    id: 'jpg',
    name: 'JPG',
    extension: 'jpg',
    category: 'Image',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'JPEG Image'
  },
  {
    id: 'jpeg',
    name: 'JPEG',
    extension: 'jpeg',
    category: 'Image',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'JPEG Image'
  },
  {
    id: 'png',
    name: 'PNG',
    extension: 'png',
    category: 'Image',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'Portable Network Graphics'
  },
  {
    id: 'webp',
    name: 'WEBP',
    extension: 'webp',
    category: 'Image',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'WebP Image'
  },
  {
    id: 'tiff',
    name: 'TIFF',
    extension: 'tiff',
    category: 'Image',
    isSupported: true,
    documentType: 'EXPENSE',
    description: 'Tagged Image File Format'
  },
  
  // 📁 ARCHIVE FORMATS (demo)
  {
    id: 'zip',
    name: 'ZIP',
    extension: 'zip',
    category: 'Archive',
    isSupported: false,
    description: 'ZIP Archive'
  },
  {
    id: 'rar',
    name: 'RAR',
    extension: 'rar',
    category: 'Archive',
    isSupported: false,
    description: 'RAR Archive'
  },
  {
    id: '7z',
    name: '7Z',
    extension: '7z',
    category: 'Archive',
    isSupported: false,
    description: '7-Zip Archive'
  },
  {
    id: 'tar',
    name: 'TAR',
    extension: 'tar',
    category: 'Archive',
    isSupported: false,
    description: 'Tape Archive'
  },
  {
    id: 'gz',
    name: 'GZ',
    extension: 'gz',
    category: 'Archive',
    isSupported: false,
    description: 'Gzip Archive'
  },
  {
    id: 'bz2',
    name: 'BZ2',
    extension: 'bz2',
    category: 'Archive',
    isSupported: false,
    description: 'Bzip2 Archive'
  },

  // 🎵 AUDIO FORMATS (demo)
  {
    id: 'mp3',
    name: 'MP3',
    extension: 'mp3',
    category: 'Audio',
    isSupported: false,
    description: 'MPEG Audio Layer 3'
  },
  {
    id: 'wav',
    name: 'WAV',
    extension: 'wav',
    category: 'Audio',
    isSupported: false,
    description: 'Waveform Audio File'
  },
  {
    id: 'flac',
    name: 'FLAC',
    extension: 'flac',
    category: 'Audio',
    isSupported: false,
    description: 'Free Lossless Audio Codec'
  },
  {
    id: 'aac',
    name: 'AAC',
    extension: 'aac',
    category: 'Audio',
    isSupported: false,
    description: 'Advanced Audio Coding'
  },
  {
    id: 'ogg',
    name: 'OGG',
    extension: 'ogg',
    category: 'Audio',
    isSupported: false,
    description: 'Ogg Vorbis Audio'
  },
  {
    id: 'wma',
    name: 'WMA',
    extension: 'wma',
    category: 'Audio',
    isSupported: false,
    description: 'Windows Media Audio'
  },

  // 📄 DOCUMENT FORMATS (demo) - DOC and DOCX moved to supported
  {
    id: 'html',
    name: 'HTML',
    extension: 'html',
    category: 'Document',
    isSupported: false,
    description: 'HyperText Markup Language'
  },
  {
    id: 'txt',
    name: 'TXT',
    extension: 'txt',
    category: 'Document',
    isSupported: false,
    description: 'Plain Text File'
  },
  {
    id: 'rtf',
    name: 'RTF',
    extension: 'rtf',
    category: 'Document',
    isSupported: false,
    description: 'Rich Text Format'
  },
  {
    id: 'odt',
    name: 'ODT',
    extension: 'odt',
    category: 'Document',
    isSupported: false,
    description: 'OpenDocument Text'
  },
  {
    id: 'pages',
    name: 'PAGES',
    extension: 'pages',
    category: 'Document',
    isSupported: false,
    description: 'Apple Pages Document'
  },
  {
    id: 'tex',
    name: 'TEX',
    extension: 'tex',
    category: 'Document',
    isSupported: false,
    description: 'LaTeX Document'
  },
  {
    id: 'md',
    name: 'MD',
    extension: 'md',
    category: 'Document',
    isSupported: false,
    description: 'Markdown Document'
  },

  // 📊 SPREADSHEET FORMATS (demo)
  {
    id: 'xls',
    name: 'XLS',
    extension: 'xls',
    category: 'Spreadsheet',
    isSupported: false,
    description: 'Microsoft Excel Spreadsheet'
  },
  {
    id: 'xlsx',
    name: 'XLSX',
    extension: 'xlsx',
    category: 'Spreadsheet',
    isSupported: false,
    description: 'Microsoft Excel Spreadsheet'
  },
  {
    id: 'csv',
    name: 'CSV',
    extension: 'csv',
    category: 'Spreadsheet',
    isSupported: false,
    description: 'Comma Separated Values'
  },
  {
    id: 'ods',
    name: 'ODS',
    extension: 'ods',
    category: 'Spreadsheet',
    isSupported: false,
    description: 'OpenDocument Spreadsheet'
  },
  {
    id: 'numbers',
    name: 'NUMBERS',
    extension: 'numbers',
    category: 'Spreadsheet',
    isSupported: false,
    description: 'Apple Numbers Spreadsheet'
  },

  // 🎯 PRESENTATION FORMATS (demo)
  {
    id: 'ppt',
    name: 'PPT',
    extension: 'ppt',
    category: 'Presentation',
    isSupported: false,
    description: 'Microsoft PowerPoint'
  },
  {
    id: 'pptx',
    name: 'PPTX',
    extension: 'pptx',
    category: 'Presentation',
    isSupported: false,
    description: 'Microsoft PowerPoint'
  },
  {
    id: 'odp',
    name: 'ODP',
    extension: 'odp',
    category: 'Presentation',
    isSupported: false,
    description: 'OpenDocument Presentation'
  },
  {
    id: 'key',
    name: 'KEY',
    extension: 'key',
    category: 'Presentation',
    isSupported: false,
    description: 'Apple Keynote Presentation'
  },

  // 🎬 VIDEO FORMATS (demo)
  {
    id: 'mp4',
    name: 'MP4',
    extension: 'mp4',
    category: 'Video',
    isSupported: false,
    description: 'MPEG-4 Video'
  },
  {
    id: 'avi',
    name: 'AVI',
    extension: 'avi',
    category: 'Video',
    isSupported: false,
    description: 'Audio Video Interleave'
  },
  {
    id: 'mov',
    name: 'MOV',
    extension: 'mov',
    category: 'Video',
    isSupported: false,
    description: 'QuickTime Movie'
  },
  {
    id: 'wmv',
    name: 'WMV',
    extension: 'wmv',
    category: 'Video',
    isSupported: false,
    description: 'Windows Media Video'
  },
  {
    id: 'mkv',
    name: 'MKV',
    extension: 'mkv',
    category: 'Video',
    isSupported: false,
    description: 'Matroska Video'
  },
  {
    id: 'webm',
    name: 'WEBM',
    extension: 'webm',
    category: 'Video',
    isSupported: false,
    description: 'WebM Video'
  },

  // 🖼️ ADDITIONAL IMAGE FORMATS (demo)
  {
    id: 'bmp',
    name: 'BMP',
    extension: 'bmp',
    category: 'Image',
    isSupported: false,
    description: 'Bitmap Image'
  },
  {
    id: 'gif',
    name: 'GIF',
    extension: 'gif',
    category: 'Image',
    isSupported: false,
    description: 'Graphics Interchange Format'
  },
  {
    id: 'svg',
    name: 'SVG',
    extension: 'svg',
    category: 'Image',
    isSupported: false,
    description: 'Scalable Vector Graphics'
  },
  {
    id: 'ico',
    name: 'ICO',
    extension: 'ico',
    category: 'Image',
    isSupported: false,
    description: 'Icon File'
  },
  {
    id: 'psd',
    name: 'PSD',
    extension: 'psd',
    category: 'Image',
    isSupported: false,
    description: 'Adobe Photoshop Document'
  },

  // 🔧 OTHER FORMATS (demo)
  {
    id: 'json',
    name: 'JSON',
    extension: 'json',
    category: 'Other',
    isSupported: false,
    description: 'JavaScript Object Notation'
  },
  {
    id: 'xml',
    name: 'XML',
    extension: 'xml',
    category: 'Other',
    isSupported: false,
    description: 'Extensible Markup Language'
  },
  {
    id: 'yaml',
    name: 'YAML',
    extension: 'yaml',
    category: 'Other',
    isSupported: false,
    description: 'YAML Ain\'t Markup Language'
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    category: 'Other',
    isSupported: false,
    description: 'Structured Query Language'
  }
];

interface ConversionResult {
  id: string;
  fileName: string;
  status: 'UPLOADING' | 'CREATING_JOB' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  percentage: number;
  downloadUrl?: string;
  error?: string;
  timestamp: Date;
}

interface QuickConverterProps {
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
}

export default function QuickConverter({ onFileSelect, selectedFile }: QuickConverterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>(fileFormats[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Document');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversions, setConversions] = useState<ConversionResult[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [documentType, setDocumentType] = useState<'EXPENSE' | 'HR'>('EXPENSE');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { incrementConversion, incrementSuccess, incrementFailure } = useConversionStats();

  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFormats = fileFormats.filter(format =>
    format.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group all formats by category for the grid layout
  const groupedFormats = filteredFormats.reduce((acc, format) => {
    if (!acc[format.category]) {
      acc[format.category] = [];
    }
    acc[format.category].push(format);
    return acc;
  }, {} as Record<string, FileFormat[]>);

  // Get formats for currently selected category
  const currentFormats = groupedFormats[selectedCategory] || [];

  const handleFormatSelect = (format: FileFormat) => {
    setSelectedFormat(format);
    setIsOpen(false);
    
    // Auto-set document type based on format if supported
    if (format.isSupported && format.documentType) {
      setDocumentType(format.documentType);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Auto-detect format based on file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const detectedFormat = fileFormats.find(f => f.extension === fileExtension);
      
      if (detectedFormat) {
        setSelectedFormat(detectedFormat);
        if (detectedFormat.documentType) {
          setDocumentType(detectedFormat.documentType);
        }
      }
      
      onFileSelect?.(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Auto-detect format based on file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const detectedFormat = fileFormats.find(f => f.extension === fileExtension);
      
      if (detectedFormat) {
        setSelectedFormat(detectedFormat);
        if (detectedFormat.documentType) {
          setDocumentType(detectedFormat.documentType);
        }
      }
      
      onFileSelect?.(file);
    }
  };

  const getStatusDisplay = (status: string, percentage?: number) => {
    const percentText = percentage !== undefined ? ` ${Math.round(percentage)}%` : '';
    switch (status) {
      case 'UPLOADING':
        return `Uploading file...${percentText}`;
      case 'CREATING_JOB':
        return `Creating processing job...${percentText}`;
      case 'PROCESSING':
        return `Processing with AI...${percentText}`;
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !selectedFormat.isSupported) return;

    setIsProcessing(true);
    const conversionId = Date.now().toString();

    // Increment conversion count when starting
    incrementConversion();

    // Add to conversions list
    const newConversion: ConversionResult = {
      id: conversionId,
      fileName: selectedFile.name,
      status: 'UPLOADING',
      percentage: 0,
      timestamp: new Date(),
    };

    setConversions((prev) => [newConversion, ...prev]);

    try {
      const downloadUrl = await processDocument(
        selectedFile,
        documentType, // This uses the selected algorithm (EXPENSE or HR)
        (status, percentage = 0) => {
          setCurrentStatus(getStatusDisplay(status, percentage));
          setCurrentPercentage(percentage);
          setConversions((prev) =>
            prev.map((conv) =>
              conv.id === conversionId
                ? { 
                    ...conv, 
                    status: status as ConversionResult['status'],
                    percentage 
                  }
                : conv
            )
          );
        }
      );

      // Update with download URL and increment success
      setConversions((prev) =>
        prev.map((conv) =>
          conv.id === conversionId
            ? {
                ...conv,
                status: 'COMPLETED',
                percentage: 100,
                downloadUrl,
              }
            : conv
        )
      );

      // Increment success count
      incrementSuccess();

      onFileSelect?.(null as any);
      setCurrentStatus('');
      setCurrentPercentage(0);
    } catch (error) {
      console.error('Conversion failed:', error);
      
      // Update conversion with error and increment failure count
      setConversions((prev) =>
        prev.map((conv) =>
          conv.id === conversionId
            ? {
                ...conv,
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : conv
        )
      );

      // Increment failure count
      incrementFailure();

      setCurrentStatus('');
      setCurrentPercentage(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Quick Converter */}
      <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10 hover-lift">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Quick Convert
          </h2>
          <p className="text-gray-600 text-xl leading-relaxed max-w-2xl mx-auto">
            Drag and drop any document here for instant conversion
          </p>
        </div>

        {/* Format Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <span className="text-gray-700 font-medium">Convert</span>
            
            {/* Format Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 transition-all duration-300 min-w-[200px] justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{selectedFormat.name}</div>
                    {!selectedFormat.isSupported && (
                      <div className="text-xs text-amber-600 font-medium">Demo Only</div>
                    )}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu - Enhanced CloudConvert Style Grid */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 w-[700px] h-[450px] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {/* Search Bar */}
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="relative">
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search Format"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white shadow-sm transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex h-[calc(100%-88px)]">
                    {/* Left Sidebar - Categories */}
                    <div className="w-52 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 overflow-y-auto">
                      {Object.entries(groupedFormats).map(([category]) => {
                        const categoryFormats = groupedFormats[category] || [];
                        const supportedCount = categoryFormats.filter(f => f.isSupported).length;
                        
                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`w-full px-4 py-4 text-left text-sm font-medium transition-all duration-200 border-b border-gray-200/50 last:border-b-0 group ${
                              selectedCategory === category
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                                : 'text-gray-700 hover:bg-white hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                  selectedCategory === category 
                                    ? 'bg-white' 
                                    : supportedCount > 0 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-400'
                                }`}></div>
                                <span className="font-semibold">{category}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  selectedCategory === category
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {categoryFormats.length}
                                </span>
                                {supportedCount > 0 && (
                                  <span className={`text-xs mt-1 ${
                                    selectedCategory === category
                                      ? 'text-green-200'
                                      : 'text-green-600'
                                  }`}>
                                    {supportedCount} active
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Grid - Format Boxes */}
                    <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-white to-gray-50">
                      <div className="grid grid-cols-3 gap-4">
                        {currentFormats.map((format) => (
                          <button
                            key={format.id}
                            onClick={() => handleFormatSelect(format)}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-center group hover:scale-105 hover:shadow-lg ${
                              format.isSupported
                                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 shadow-sm'
                                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 hover:border-gray-300 shadow-sm'
                            } ${selectedFormat.id === format.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                          >
                            {/* Format Name */}
                            <div className={`font-bold text-xl mb-2 transition-colors duration-200 ${
                              format.isSupported 
                                ? 'text-green-800 group-hover:text-green-900' 
                                : 'text-gray-700 group-hover:text-gray-800'
                            }`}>
                              {format.name}
                            </div>
                            
                            {/* Description */}
                            <div className={`text-xs leading-tight transition-colors duration-200 ${
                              format.isSupported 
                                ? 'text-green-600 group-hover:text-green-700' 
                                : 'text-gray-500 group-hover:text-gray-600'
                            }`}>
                              {format.description}
                            </div>
                            
                            {/* Status Indicator */}
                            <div className="absolute top-3 right-3">
                              {format.isSupported ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Supported"></div>
                                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full" title="Demo Only"></div>
                                  <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Hover Effect Overlay */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </button>
                        ))}
                      </div>

                      {currentFormats.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5-1.709M15 3.5a7.966 7.966 0 00-6 0M12 3.5a7.966 7.966 0 016 0v0a7.966 7.966 0 00-6 0v0z" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium">No formats found</p>
                          <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <span className="text-gray-700 font-medium">to</span>
            <span className="px-4 py-3 bg-green-100 text-green-800 font-semibold rounded-xl border border-green-200">
              Excel
            </span>
          </div>

          {/* Document Type Selector for Supported Formats */}
          {selectedFormat.isSupported && (
            <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-blue-800 font-semibold">AI Processing Algorithm:</span>
              </div>
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-blue-200">
                <button
                  onClick={() => setDocumentType('EXPENSE')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
                    documentType === 'EXPENSE'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105'
                      : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Expense Algorithm
                </button>
                <button
                  onClick={() => setDocumentType('HR')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
                    documentType === 'HR'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  HR Algorithm
                </button>
              </div>
              <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                {documentType === 'EXPENSE' 
                  ? 'Optimized for invoices, receipts, and financial documents'
                  : 'Optimized for employee records, forms, and HR documents'
                }
              </div>
            </div>
          )}

          {/* Status Message */}
          {!selectedFormat.isSupported && (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl text-amber-800 shadow-lg">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Demo Format Only</div>
                  <div className="text-sm text-amber-700">
                    {selectedFormat.name} conversion is coming soon! Try our supported formats: PDF, DOC, DOCX, JPG, PNG, WEBP, TIFF
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Area */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-500 ${
            dragActive 
              ? 'border-purple-500 bg-purple-50 shadow-xl scale-105' 
              : 'border-gray-300 hover:border-purple-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                dragActive 
                  ? 'bg-purple-500 text-white scale-125 rotate-12' 
                  : 'bg-gray-100 text-gray-600 hover:scale-110'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 mb-4">
                  {dragActive 
                    ? 'Drop your file here!' 
                    : `Drop your ${selectedFormat.name} file here`
                  }
                </p>
                {!dragActive && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <input
                      type="file"
                      id="quickFileInput"
                      accept={selectedFormat.isSupported ? ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.tiff" : "*"}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="quickFileInput"
                      className="px-6 py-3 bg-primary-gradient hover:opacity-90 text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Choose File
                    </label>
                    <span className="text-gray-500 font-medium">or drag & drop</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-success-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">{selectedFile.name}</p>
                <p className="text-gray-600 mb-4">Ready to convert to Excel</p>
                
                {/* Progress Bar */}
                {isProcessing && (
                  <div className="max-w-md mx-auto mb-4">
                    <ProgressBar 
                      percentage={currentPercentage} 
                      status={currentStatus.split(' ')[0] || 'PROCESSING'} 
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {selectedFormat.isSupported ? (
                    <button
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="px-8 py-3 bg-success-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {currentStatus || 'Converting...'}
                        </>
                      ) : (
                        'Convert Now'
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-8 py-3 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
                    >
                      Demo Format Only
                    </button>
                  )}
                  {!isProcessing && (
                    <button
                      onClick={() => onFileSelect?.(null as any)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-white/50 font-medium rounded-xl transition-all backdrop-blur-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {dragActive && (
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-500 animate-pulse bg-purple-500/10"></div>
          )}
        </div>
      </div>

      {/* Conversion Results - Show for all users, but only persist for authenticated users */}
      {conversions.length > 0 && (
        <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isUserAuthenticated ? 'Conversion History' : 'Current Session Conversions'}
          </h2>

          {!isUserAuthenticated && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                These conversions are only available in your current session and won't be saved.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {conversions.map((conversion) => (
              <div
                key={conversion.id}
                className="flex items-center justify-between p-8 glass backdrop-blur-sm border border-white/20 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">📄</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{conversion.fileName}</p>
                    <p className="text-gray-600">
                      {conversion.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Status Badge and Progress */}
                  <div className="min-w-0 flex-1">
                    {(conversion.status === 'UPLOADING' || conversion.status === 'CREATING_JOB' || conversion.status === 'PROCESSING') && (
                      <div className="space-y-3">
                        <span className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 shadow-lg">
                          <svg className="animate-spin w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {getStatusDisplay(conversion.status, conversion.percentage)}
                        </span>
                        <ProgressBar 
                          percentage={conversion.percentage} 
                          status={conversion.status} 
                          className="max-w-xs"
                        />
                      </div>
                    )}
                    {conversion.status === 'COMPLETED' && (
                      <span className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-lg">
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Completed
                      </span>
                    )}
                    {conversion.status === 'FAILED' && (
                      <span className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 shadow-lg">
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Download Button */}
                  {conversion.status === 'COMPLETED' && conversion.downloadUrl && (
                    <button
                      onClick={() => handleDownload(conversion.downloadUrl!)}
                      className="px-8 py-4 bg-success-gradient hover:opacity-90 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Excel
                    </button>
                  )}

                  {/* Error Message */}
                  {conversion.status === 'FAILED' && conversion.error && (
                    <div className="text-red-600 max-w-xs bg-red-50 p-3 rounded-xl border border-red-200">
                      {conversion.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}