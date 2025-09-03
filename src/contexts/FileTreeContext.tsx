import React, { createContext, useContext, ReactNode } from 'react';
import { useFileTree } from '../hooks/useFileTree';

type FileTreeContextType = ReturnType<typeof useFileTree> | null;

const FileTreeContext = createContext<FileTreeContextType>(null);

interface FileTreeProviderProps {
  children: ReactNode;
}

export const FileTreeProvider: React.FC<FileTreeProviderProps> = ({ children }) => {
  const fileTree = useFileTree();

  return (
    <FileTreeContext.Provider value={fileTree}>
      {children}
    </FileTreeContext.Provider>
  );
};

export const useFileTreeContext = () => {
  const context = useContext(FileTreeContext);
  if (!context) {
    throw new Error('useFileTreeContext must be used within a FileTreeProvider');
  }
  return context;
};