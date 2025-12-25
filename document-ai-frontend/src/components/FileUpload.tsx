import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  acceptedTypes?: string[];
}

export default function FileUpload({
  onFileSelect,
  isProcessing = false,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff']
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    if (!allowedMimeTypes.includes(file.type)) {
      alert('Invalid file format. Please upload PDF, JPG, PNG, WebP, BMP, or TIFF.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit.');
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.startsWith('image/')) return '🖼️';
    return '📁';
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-500 ${
          dragActive
            ? 'border-purple-500 bg-purple-50 scale-105 shadow-2xl'
            : selectedFile
            ? 'border-green-500 bg-green-50 shadow-xl'
            : 'border-gray-300 glass backdrop-blur-md hover:border-purple-400 hover:bg-purple-50/30'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={acceptedTypes.join(',')}
          className="hidden"
          disabled={isProcessing}
        />

        {!selectedFile ? (
          <>
            {/* Upload Animation */}
            <div className="relative mb-8">
              <div className={`w-28 h-28 mx-auto rounded-3xl bg-primary-gradient flex items-center justify-center text-white text-4xl transition-all duration-500 shadow-2xl ${
                dragActive ? 'scale-150 rotate-12 animate-bounce' : 'hover:scale-125'
              }`}>
                {dragActive ? (
                  <svg className="w-16 h-16 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
              {dragActive && (
                <>
                  <div className="absolute inset-0 rounded-3xl border-4 border-purple-500 animate-pulse"></div>
                  <div className="absolute -inset-4 rounded-3xl border-2 border-purple-300 animate-ping"></div>
                </>
              )}
            </div>

            {/* Text */}
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {dragActive ? 'Drop your file here' : 'Select files to upload'}
            </h3>
            <p className="text-gray-600 mb-8 text-xl">
              or drag and drop files here
            </p>

            {/* Supported Formats */}
            <div className="inline-flex items-center space-x-6 glass backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">PDF</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">JPG</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">PNG</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">+3</span>
                </div>
              </div>
              <div className="text-gray-600 font-medium">
                Max 50MB • WebP, BMP, TIFF
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Selected File Display */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-success-gradient rounded-3xl flex items-center justify-center text-white text-4xl shadow-2xl">
                {getFileIcon(selectedFile)}
              </div>
              
              {/* Remove Button */}
              <button
                onClick={removeFile}
                className="absolute top-0 right-1/2 transform translate-x-12 -translate-y-3 w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h3 className="text-2xl font-bold text-green-600 mb-3">
              File Ready for Processing
            </h3>
            <p className="text-gray-900 font-medium mb-3 text-lg">{selectedFile.name}</p>
            <p className="text-gray-600 mb-6">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        )}
      </div>

      {/* File Format Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4 p-6 glass backdrop-blur-md rounded-2xl border border-white/20 hover-lift">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-red-100 font-bold text-sm">PDF</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">PDF Documents</p>
            <p className="text-sm text-gray-600">Invoices, reports, forms</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 p-6 glass backdrop-blur-md rounded-2xl border border-white/20 hover-lift">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-blue-100 font-bold text-sm">JPG</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">JPEG Images</p>
            <p className="text-sm text-gray-600">Scanned documents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 p-6 glass backdrop-blur-md rounded-2xl border border-white/20 hover-lift">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-green-100 font-bold text-sm">PNG</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">PNG Images</p>
            <p className="text-sm text-gray-600">High-quality scans</p>
          </div>
        </div>
      </div>
    </div>
  );
}