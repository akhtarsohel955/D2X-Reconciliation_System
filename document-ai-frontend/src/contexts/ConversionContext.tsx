import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated } from '../services/api';

export interface ConversionStats {
  totalConversions: number;
  filesProcessed: number;
  successfulConversions: number;
  failedConversions: number;
  successRate: number;
}

interface ConversionContextType {
  stats: ConversionStats;
  incrementConversion: () => void;
  incrementSuccess: () => void;
  incrementFailure: () => void;
  resetStats: () => void;
}

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

const STORAGE_KEY = 'conversion_stats';

export function ConversionProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ConversionStats>(() => {
    // Only load stats for authenticated users
    if (!isAuthenticated()) {
      return {
        totalConversions: 0,
        filesProcessed: 0,
        successfulConversions: 0,
        failedConversions: 0,
        successRate: 100,
      };
    }

    // Load stats from localStorage for authenticated users
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved stats:', error);
      }
    }
    return {
      totalConversions: 0,
      filesProcessed: 0,
      successfulConversions: 0,
      failedConversions: 0,
      successRate: 100,
    };
  });

  // Save stats to localStorage whenever they change (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  const incrementConversion = () => {
    setStats(prev => ({
      ...prev,
      totalConversions: prev.totalConversions + 1,
      filesProcessed: prev.filesProcessed + 1,
    }));
  };

  const incrementSuccess = () => {
    setStats(prev => {
      const newSuccessful = prev.successfulConversions + 1;
      const total = newSuccessful + prev.failedConversions;
      const successRate = total > 0 ? Math.round((newSuccessful / total) * 100) : 100;
      
      return {
        ...prev,
        successfulConversions: newSuccessful,
        successRate,
      };
    });
  };

  const incrementFailure = () => {
    setStats(prev => {
      const newFailed = prev.failedConversions + 1;
      const total = prev.successfulConversions + newFailed;
      const successRate = total > 0 ? Math.round((prev.successfulConversions / total) * 100) : 100;
      
      return {
        ...prev,
        failedConversions: newFailed,
        successRate,
      };
    });
  };

  const resetStats = () => {
    // Only allow reset for authenticated users
    if (!isAuthenticated()) return;
    
    const initialStats = {
      totalConversions: 0,
      filesProcessed: 0,
      successfulConversions: 0,
      failedConversions: 0,
      successRate: 100,
    };
    setStats(initialStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStats));
  };

  return (
    <ConversionContext.Provider value={{
      stats,
      incrementConversion,
      incrementSuccess,
      incrementFailure,
      resetStats,
    }}>
      {children}
    </ConversionContext.Provider>
  );
}

export function useConversionStats() {
  const context = useContext(ConversionContext);
  if (context === undefined) {
    throw new Error('useConversionStats must be used within a ConversionProvider');
  }
  return context;
}