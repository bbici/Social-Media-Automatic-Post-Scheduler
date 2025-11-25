import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ApiConfig } from '../types';

interface ApiContextType {
  apiConfig: ApiConfig;
  updateApiConfig: (newConfig: ApiConfig) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const defaultApiConfig: ApiConfig = {
  twitter: { bearerToken: '' },
  linkedin: { accessToken: '', personUrn: '' },
  instagram: { accessToken: '', accountId: '' },
  tiktok: { accessToken: '', openId: '' }
};

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // In a real app, we might initialize this from localStorage
  const [apiConfig, setApiConfig] = useState<ApiConfig>(defaultApiConfig);

  const updateApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
  };

  return (
    <ApiContext.Provider value={{ apiConfig, updateApiConfig }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiConfig must be used within an ApiProvider');
  }
  return context;
};