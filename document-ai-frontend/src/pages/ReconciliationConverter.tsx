import { useState } from 'react';
import { processReconciliation, isAuthenticated } from '../services/api';
import { useConversionStats } from '../contexts/ConversionContext';
import ProgressBar from '../components/ProgressBar';

interface ReconciliationResult {
  id: string;
  name: string;
  status: 'UPLOADING_SOURCE' | 'UPLOADING_TARGET' | 'CREATING_RECONCILIATION' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  percentage: number;
  downloadUrl?: string;
  error?: string;
  timestamp: Date;
  matchedCount?: number;
  unmatchedCount?: number;
  discrepancyCount?: number;
}

const reconciliationTypes = [
  {
    id: 'INVOICE_PO',
    name: 'Invoice vs Purchase Order',
    description: 'Match invoices against purchase orders',
    icon: '📄',
    color: 'blue',
  },
  {
    id: 'BANK_LEDGER',
    name: 'Bank Statement vs Ledger',
    description: 'Reconcile bank transactions with accounting ledger',
    icon: '🏦',
    color: 'green',
  },
  {
    id: 'TIMESHEET_PAYROLL',
    name: 'Timesheet vs Payroll',
    description: 'Verify timesheets against payroll records',
    icon: '⏰',
    color: 'purple',
  },
  {
    id: 'GENERAL',
    name: 'General Reconciliation',
    description: 'Custom document matching and comparison',
    icon: '📊',
    color: 'gray',
  },
];


export default function ReconciliationConverter() {
  const [selectedType, setSelectedType] = useState(reconciliationTypes[0]);
  const [reconciliationName, setReconciliationName] = useState('');
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [targetFiles, setTargetFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reconciliations, setReconciliations] = useState<ReconciliationResult[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { incrementConversion, incrementSuccess, incrementFailure } = useConversionStats();

  useState(() => {
    setIsUserAuthenticated(isAuthenticated());
  });

  const handleSourceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSourceFiles(Array.from(files));
    }
  };

  const handleTargetFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setTargetFiles(Array.from(files));
    }
  };

  const getStatusDisplay = (status: string, percentage?: number) => {
    const percentText = percentage !== undefined ? ` ${Math.round(percentage)}%` : '';
    switch (status) {
      case 'UPLOADING_SOURCE':
        return `Uploading source files...${percentText}`;
      case 'UPLOADING_TARGET':
        return `Uploading target files...${percentText}`;
      case 'CREATING_RECONCILIATION':
        return `Creating reconciliation...${percentText}`;
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


  const handleReconcile = async () => {
    if (sourceFiles.length === 0 || targetFiles.length === 0) {
      alert('Please select both source and target files');
      return;
    }

    setIsProcessing(true);
    const reconciliationId = Date.now().toString();

    incrementConversion();

    const newReconciliation: ReconciliationResult = {
      id: reconciliationId,
      name: reconciliationName || `${selectedType.name} - ${new Date().toLocaleString()}`,
      status: 'UPLOADING_SOURCE',
      percentage: 0,
      timestamp: new Date(),
    };

    setReconciliations((prev) => [newReconciliation, ...prev]);

    try {
      const downloadUrl = await processReconciliation(
        sourceFiles,
        targetFiles,
        selectedType.id as any,
        reconciliationName || undefined,
        (status, percentage = 0) => {
          setCurrentStatus(getStatusDisplay(status, percentage));
          setCurrentPercentage(percentage);
          setReconciliations((prev) =>
            prev.map((recon) =>
              recon.id === reconciliationId
                ? {
                    ...recon,
                    status: status as ReconciliationResult['status'],
                    percentage,
                  }
                : recon
            )
          );
        }
      );

      setReconciliations((prev) =>
        prev.map((recon) =>
          recon.id === reconciliationId
            ? {
                ...recon,
                status: 'COMPLETED',
                percentage: 100,
                downloadUrl,
              }
            : recon
        )
      );

      incrementSuccess();

      setSourceFiles([]);
      setTargetFiles([]);
      setReconciliationName('');
      setCurrentStatus('');
      setCurrentPercentage(0);
    } catch (error) {
      console.error('Reconciliation failed:', error);

      setReconciliations((prev) =>
        prev.map((recon) =>
          recon.id === reconciliationId
            ? {
                ...recon,
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : recon
        )
      );

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Document Reconciliation
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Match and compare documents automatically using AI-powered reconciliation
          </p>
        </div>

        <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Reconciliation Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reconciliationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedType.id === type.id
                    ? `border-${type.color}-500 bg-gradient-to-br from-${type.color}-50 to-${type.color}-100 shadow-lg scale-105`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>


        <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>

          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">
              Reconciliation Name (Optional)
            </label>
            <input
              type="text"
              value={reconciliationName}
              onChange={(e) => setReconciliationName(e.target.value)}
              placeholder="e.g., Q4 2024 Invoice Reconciliation"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                Source Documents
              </h3>
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center bg-blue-50/50">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <input
                  type="file"
                  id="sourceFiles"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleSourceFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="sourceFiles"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 shadow-lg"
                >
                  Choose Source Files
                </label>
                {sourceFiles.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="font-semibold text-gray-900 mb-2">
                      {sourceFiles.length} file(s) selected:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {sourceFiles.map((file, index) => (
                        <li key={index} className="truncate">• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
                Target Documents
              </h3>
              <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center bg-purple-50/50">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <input
                  type="file"
                  id="targetFiles"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleTargetFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="targetFiles"
                  className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 shadow-lg"
                >
                  Choose Target Files
                </label>
                {targetFiles.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="font-semibold text-gray-900 mb-2">
                      {targetFiles.length} file(s) selected:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {targetFiles.map((file, index) => (
                        <li key={index} className="truncate">• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-8">
              <ProgressBar percentage={currentPercentage} status={currentStatus.split(' ')[0] || 'PROCESSING'} />
              <p className="text-center text-gray-600 mt-2">{currentStatus}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={handleReconcile}
              disabled={isProcessing || sourceFiles.length === 0 || targetFiles.length === 0}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {currentStatus || 'Processing...'}
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Start Reconciliation
                </>
              )}
            </button>
          </div>
        </div>


        {reconciliations.length > 0 && (
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {isUserAuthenticated ? 'Reconciliation History' : 'Current Session Reconciliations'}
            </h2>

            {!isUserAuthenticated && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  These reconciliations are only available in your current session and won't be saved.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {reconciliations.map((reconciliation) => (
                <div
                  key={reconciliation.id}
                  className="p-8 glass backdrop-blur-sm border border-white/20 rounded-2xl hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{reconciliation.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {reconciliation.timestamp.toLocaleString()}
                      </p>

                      <div className="mb-4">
                        {(reconciliation.status === 'UPLOADING_SOURCE' || 
                          reconciliation.status === 'UPLOADING_TARGET' || 
                          reconciliation.status === 'CREATING_RECONCILIATION' || 
                          reconciliation.status === 'PROCESSING') && (
                          <div className="space-y-3">
                            <span className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 shadow-lg">
                              <svg className="animate-spin w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {getStatusDisplay(reconciliation.status, reconciliation.percentage)}
                            </span>
                            <ProgressBar percentage={reconciliation.percentage} status={reconciliation.status} />
                          </div>
                        )}
                        {reconciliation.status === 'COMPLETED' && (
                          <div>
                            <span className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-lg mb-4">
                              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Completed
                            </span>
                            {reconciliation.matchedCount !== undefined && (
                              <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                  <p className="text-sm text-green-600 font-medium">Matched</p>
                                  <p className="text-2xl font-bold text-green-800">{reconciliation.matchedCount}</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                  <p className="text-sm text-amber-600 font-medium">Unmatched</p>
                                  <p className="text-2xl font-bold text-amber-800">{reconciliation.unmatchedCount}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                  <p className="text-sm text-red-600 font-medium">Discrepancies</p>
                                  <p className="text-2xl font-bold text-red-800">{reconciliation.discrepancyCount}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {reconciliation.status === 'FAILED' && (
                          <div>
                            <span className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 shadow-lg">
                              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Failed
                            </span>
                            {reconciliation.error && (
                              <p className="text-red-600 mt-2 bg-red-50 p-3 rounded-xl border border-red-200">
                                {reconciliation.error}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {reconciliation.status === 'COMPLETED' && reconciliation.downloadUrl && (
                      <button
                        onClick={() => handleDownload(reconciliation.downloadUrl!)}
                        className="ml-6 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
