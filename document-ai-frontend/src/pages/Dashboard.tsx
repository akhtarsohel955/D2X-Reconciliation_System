import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useConversionStats } from '../contexts/ConversionContext';
import { TokenManager, logout } from '../services/api';
import Footer from '../components/Footer';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  bgGradient: string;
}

const modules: Module[] = [
  {
    id: 'expense',
    name: 'Expense Documents',
    description: 'Convert invoices, receipts, and bills to structured Excel spreadsheets with AI precision',
    icon: '📄',
    href: '/expense',
    gradient: 'bg-ocean-gradient',
    bgGradient: 'from-blue-50 to-indigo-100',
  },
  {
    id: 'hr',
    name: 'HR Documents',
    description: 'Transform employee records and HR forms to organized Excel format seamlessly',
    icon: '👥',
    href: '/hr',
    gradient: 'bg-purple-gradient',
    bgGradient: 'from-purple-50 to-pink-100',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, resetStats } = useConversionStats();
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [quickFile, setQuickFile] = useState<File | null>(null);

  useEffect(() => {
    // Get user from token manager
    const userData = TokenManager.getUser();
    if (userData) {
      setUser(userData);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
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
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setQuickFile(file);
      }
    }
  };

  const handleQuickFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setQuickFile(files[0]);
    }
  };

  const handleQuickConvert = (documentType: 'EXPENSE' | 'HR') => {
    if (!quickFile) return;
    
    // Store file temporarily and redirect
    sessionStorage.setItem('uploadedFile', JSON.stringify({
      name: quickFile.name,
      type: quickFile.type,
      size: quickFile.size,
      file: quickFile
    }));
    
    if (documentType === 'EXPENSE') {
      navigate('/expense');
    } else {
      navigate('/hr');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Header */}
      <header className="glass backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-gradient rounded-2xl flex items-center justify-center shadow-lg hover-lift">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-purple-800 bg-clip-text text-transparent">
                  Document to Excel
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name || user.email}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              {/* Reset Stats Button (for testing) */}
              <button
                onClick={resetStats}
                className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-white/50 transition-all duration-300"
                title="Reset Statistics"
              >
                Reset Stats
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-xl hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Choose Your Conversion Tool
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Select a module below to start converting your documents to Excel format with cutting-edge AI technology.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Conversions</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.totalConversions}
                </p>
              </div>
              <div className="w-16 h-16 bg-success-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Files Processed</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {stats.filesProcessed}
                </p>
              </div>
              <div className="w-16 h-16 bg-warning-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Success Rate</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.successRate}%
                </p>
              </div>
              <div className="w-16 h-16 bg-secondary-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Successful Conversions</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.successfulConversions}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Failed Conversions</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.failedConversions}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Drop Zone */}
        <div className={`mb-16 transition-all duration-500 ${dragActive ? 'scale-105' : ''}`}>
          <div className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 ${
            dragActive 
              ? 'border-purple-500 bg-purple-50 shadow-2xl scale-105' 
              : 'border-gray-300 glass backdrop-blur-md hover:border-purple-400'
          }`}>
            {!quickFile ? (
              <div className="flex flex-col items-center space-y-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                  dragActive 
                    ? 'bg-purple-500 text-white scale-125 rotate-12' 
                    : 'bg-primary-gradient text-white hover:scale-110'
                }`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {dragActive ? 'Drop your file here!' : 'Quick Convert'}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    {dragActive 
                      ? 'Release to automatically detect and convert your document' 
                      : 'Drag and drop any document here for instant conversion'
                    }
                  </p>
                  {!dragActive && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <input
                        type="file"
                        id="quickFileInput"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
                        onChange={handleQuickFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="quickFileInput"
                        className="px-8 py-4 bg-primary-gradient hover:opacity-90 text-white font-semibold rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Choose File
                      </label>
                      <span className="text-gray-500 font-medium">or drag & drop</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-success-gradient rounded-3xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">File Ready for Conversion</h3>
                  <p className="text-gray-600 mb-6 text-lg">{quickFile.name}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => handleQuickConvert('EXPENSE')}
                      className="px-8 py-4 bg-ocean-gradient hover:opacity-90 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Convert as Expense
                    </button>
                    <button
                      onClick={() => handleQuickConvert('HR')}
                      className="px-8 py-4 bg-purple-gradient hover:opacity-90 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Convert as HR Doc
                    </button>
                    <button
                      onClick={() => setQuickFile(null)}
                      className="px-6 py-4 border-2 border-gray-300 text-gray-700 hover:bg-white/50 font-medium rounded-2xl transition-all backdrop-blur-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {dragActive && (
              <div className="absolute inset-0 rounded-3xl border-2 border-purple-500 animate-pulse bg-purple-500/10"></div>
            )}
          </div>
        </div>

        {/* Main Modules Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Conversion Modules</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {modules.map((module) => (
              <Link key={module.id} to={module.href}>
                <div className="group glass backdrop-blur-md rounded-3xl border border-white/20 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer overflow-hidden hover-lift">
                  {/* Header with Icon */}
                  <div className={`bg-gradient-to-br ${module.bgGradient} p-10 text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                    <div className="relative">
                      <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-500">
                        {module.icon}
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        {module.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-10">
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                      {module.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        PDF, JPG, PNG support
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        AI-powered extraction
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Instant download
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Get Started</span>
                      <div className={`w-12 h-12 ${module.gradient} rounded-2xl flex items-center justify-center group-hover:scale-125 transition-transform duration-500 shadow-lg`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-primary-gradient rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-6">Need Help Getting Started?</h3>
          <p className="text-white/90 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
            Our AI-powered conversion tools make it easy to transform your documents. 
            Simply upload your file, and we'll handle the rest with cutting-edge technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:scale-105">
              View Tutorial
            </button>
            <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              Contact Support
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}