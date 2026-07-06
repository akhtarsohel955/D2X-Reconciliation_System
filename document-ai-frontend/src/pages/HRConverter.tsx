import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import ProgressBar from '../components/ProgressBar';
import Footer from '../components/Footer';
import { useConversionStats } from '../contexts/ConversionContext';
import { processDocument, isAuthenticated } from '../services/api';

interface ConversionResult {
  id: string;
  fileName: string;
  status: 'UPLOADING' | 'CREATING_JOB' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  percentage: number;
  downloadUrl?: string;
  error?: string;
  timestamp: Date;
}

export default function HRConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversions, setConversions] = useState<ConversionResult[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { incrementConversion, incrementSuccess, incrementFailure } = useConversionStats();

  useEffect(() => {
    // Check authentication status
    const authenticated = isAuthenticated();
    setIsUserAuthenticated(authenticated);

    // Check for uploaded file from dashboard
    const uploadedFile = sessionStorage.getItem('uploadedFile');
    if (uploadedFile) {
      try {
        const fileData = JSON.parse(uploadedFile);
        // Create a mock file object for display
        const mockFile = new File([''], fileData.name, { type: fileData.type });
        setSelectedFile(mockFile);
        sessionStorage.removeItem('uploadedFile');
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
      }
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
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
    if (!selectedFile) return;

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
        'HR',
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

      setSelectedFile(null);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      {/* Header */}
      <header className="glass backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300 hover-lift"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-gradient rounded-2xl flex items-center justify-center shadow-lg hover-lift">
                <span className="text-white font-bold text-xl">👥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">HR Document Converter</h1>
                <p className="text-sm text-gray-600">Convert HR forms and records to Excel format</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Upload Section */}
        <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10 mb-12 hover-lift">
          {/* Authentication Notice for Guest Users */}
          {!isUserAuthenticated && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">Guest Mode</h3>
                  <p className="text-purple-700 text-sm">
                    You're using the service as a guest. Your conversion history won't be saved. 
                    <Link to="/" className="font-medium underline hover:no-underline ml-1">
                      Sign up for free
                    </Link> to track your conversions.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-purple-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">👥</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Upload Your HR Document
            </h2>
            <p className="text-gray-600 text-xl leading-relaxed max-w-2xl mx-auto">
              Upload your employee records, forms, or HR documents and we'll convert them to a structured Excel spreadsheet using advanced AI
            </p>
          </div>

          <FileUpload
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
          />

          {/* Convert Button */}
          {selectedFile && (
            <div className="mt-10 space-y-6">
              {/* Progress Bar */}
              {isProcessing && (
                <div className="max-w-2xl mx-auto">
                  <ProgressBar 
                    percentage={currentPercentage} 
                    status={currentStatus.split(' ')[0] || 'PROCESSING'} 
                    className="mb-4"
                  />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="px-10 py-5 bg-purple-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed flex items-center justify-center hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {currentStatus || 'Converting to Excel...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Convert to Excel
                    </>
                  )}
                </button>
                
                {!isProcessing && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-10 py-5 border-2 border-gray-300 text-gray-700 hover:bg-white/50 font-semibold rounded-2xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
                  >
                    Clear File
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Conversion History - Show for all users, but only persist for authenticated users */}
        {conversions.length > 0 && (
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">👥</span>
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

        {/* Info Section */}
        <div className="bg-purple-gradient rounded-3xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-8 text-center">How HR Document Conversion Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span className="text-3xl">👥</span>
              </div>
              <h4 className="font-semibold mb-3 text-xl">Upload HR Document</h4>
              <p className="text-purple-100 leading-relaxed">Upload your PDF, JPG, or PNG HR document securely</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span className="text-3xl">🤖</span>
              </div>
              <h4 className="font-semibold mb-3 text-xl">AI Processing</h4>
              <p className="text-purple-100 leading-relaxed">AWS Textract extracts forms and table data intelligently</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="font-semibold mb-3 text-xl">Excel Output</h4>
              <p className="text-purple-100 leading-relaxed">Download your perfectly structured Excel spreadsheet</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}