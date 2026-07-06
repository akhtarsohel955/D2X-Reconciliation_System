import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversionStats } from '../contexts/ConversionContext';
import { TokenManager, logout, isAuthenticated } from '../services/api';
import Footer from '../components/Footer';
import QuickConverter from '../components/QuickConverter';

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
  {
    id: 'reconciliation',
    name: 'Document Reconciliation',
    description: 'Match and compare multiple documents automatically with AI-powered reconciliation',
    icon: '📊',
    href: '/reconciliation',
    gradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-100',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { stats, resetStats } = useConversionStats();
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [quickFile, setQuickFile] = useState<File | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication status
    const authenticated = isAuthenticated();
    setIsUserAuthenticated(authenticated);
    
    if (authenticated) {
      // Get user from token manager if authenticated
      const userData = TokenManager.getUser();
      if (userData) {
        setUser(userData);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsUserAuthenticated(false);
  };

  const handleSignIn = () => {
    setShowLogin(true);
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setShowLogin(false);
    setShowAuthModal(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { login } = await import('../services/api');
      await login(email, password);
      const userData = TokenManager.getUser();
      setUser(userData);
      setIsUserAuthenticated(true);
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { register } = await import('../services/api');
      await register(email, password, name);
      const userData = TokenManager.getUser();
      setUser(userData);
      setIsUserAuthenticated(true);
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (href: string) => {
    // Always allow access to conversion modules (like CloudConvert)
    navigate(href);
  };

  const handleQuickFileSelect = (file: File | null) => {
    setQuickFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
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
                {isUserAuthenticated && user && (
                  <p className="text-sm text-gray-600">Welcome back, {user.name || user.email}!</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              
              {isUserAuthenticated ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-xl hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="px-6 py-3 bg-primary-gradient hover:opacity-90 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            {isUserAuthenticated ? 'Choose Your Conversion Tool' : 'Convert Documents to Excel'}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {isUserAuthenticated 
              ? 'Select a module below to start converting your documents to Excel format with cutting-edge AI technology.'
              : 'Transform your invoices and HR documents into organized Excel spreadsheets with cutting-edge AI technology.'
            }
          </p>
        </div>

        {/* Stats Cards - Only show if authenticated */}
        {isUserAuthenticated && (
          <>
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
          </>
        )}

        {/* Quick Converter */}
        <QuickConverter 
          onFileSelect={handleQuickFileSelect}
          selectedFile={quickFile}
        />

        {/* Main Modules Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Conversion Modules</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {modules.map((module) => (
              <div 
                key={module.id} 
                onClick={() => handleModuleClick(module.href)}
                className="group glass backdrop-blur-md rounded-3xl border border-white/20 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer overflow-hidden hover-lift"
              >
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

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {showLogin ? 'Sign In' : 'Sign Up'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  showLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  !showLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={showLogin ? handleLogin : handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {!showLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={showLogin ? "Enter your password" : "Create a password"}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-gradient hover:opacity-90 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (showLogin ? 'Signing In...' : 'Creating Account...') : (showLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}