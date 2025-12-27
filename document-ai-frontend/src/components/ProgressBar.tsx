interface ProgressBarProps {
  percentage: number;
  status: string;
  className?: string;
}

export default function ProgressBar({ percentage, status, className = '' }: ProgressBarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADING':
        return 'from-blue-500 to-blue-600';
      case 'CREATING_JOB':
        return 'from-yellow-500 to-orange-500';
      case 'PROCESSING':
        return 'from-purple-500 to-pink-500';
      case 'COMPLETED':
        return 'from-green-500 to-emerald-500';
      case 'FAILED':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusText = (status: string, percentage: number) => {
    switch (status) {
      case 'UPLOADING':
        return `Uploading file... ${Math.round(percentage)}%`;
      case 'CREATING_JOB':
        return `Creating processing job... ${Math.round(percentage)}%`;
      case 'PROCESSING':
        return `Processing with AI... ${Math.round(percentage)}%`;
      case 'COMPLETED':
        return `Completed! ${Math.round(percentage)}%`;
      case 'FAILED':
        return 'Processing failed';
      default:
        return `${status} ${Math.round(percentage)}%`;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {getStatusText(status, percentage)}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {Math.round(percentage)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-full bg-gradient-to-r ${getStatusColor(status)} transition-all duration-500 ease-out rounded-full relative overflow-hidden`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <div className={`flex items-center ${percentage >= 0 ? 'text-blue-600 font-medium' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${percentage >= 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          Upload
        </div>
        <div className={`flex items-center ${percentage >= 35 ? 'text-orange-600 font-medium' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${percentage >= 35 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          Setup
        </div>
        <div className={`flex items-center ${percentage >= 45 ? 'text-purple-600 font-medium' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${percentage >= 45 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
          Process
        </div>
        <div className={`flex items-center ${percentage >= 100 ? 'text-green-600 font-medium' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${percentage >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Complete
        </div>
      </div>
    </div>
  );
}