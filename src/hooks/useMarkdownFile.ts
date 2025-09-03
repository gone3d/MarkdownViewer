import { useState, useCallback } from 'react';
import { MarkdownFile } from '../types/markdown';
import FileService, { FileValidationError, FileOperationError } from '../services/FileService';

interface UseMarkdownFileReturn {
  currentFile: MarkdownFile | null;
  isLoading: boolean;
  error: string | null;
  openFile: () => Promise<void>;
  loadFile: (file: File) => Promise<void>;
  saveFile: (content: string) => Promise<void>;
  closeFile: () => void;
  updateContent: (content: string) => void;
}

export const useMarkdownFile = (): UseMarkdownFileReturn => {
  const [currentFile, setCurrentFile] = useState<MarkdownFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileService = FileService.getInstance();

  const openFile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const file = await fileService.openFile();
      if (file) {
        setCurrentFile(file);
      }
    } catch (err) {
      let errorMessage = 'Failed to open file';
      
      if (err instanceof FileValidationError) {
        errorMessage = `File validation error: ${err.message}`;
      } else if (err instanceof FileOperationError) {
        errorMessage = `File operation error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('File open error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fileService]);

  const loadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the file service to process the file into a MarkdownFile
      const content = await file.text();
      const markdownFile = await fileService.processFile(file, content);
      setCurrentFile(markdownFile);
    } catch (err) {
      let errorMessage = 'Failed to load file';
      
      if (err instanceof FileValidationError) {
        errorMessage = `File validation error: ${err.message}`;
      } else if (err instanceof FileOperationError) {
        errorMessage = `File operation error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('File load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fileService]);

  const saveFile = useCallback(async (content: string) => {
    if (!currentFile) return;

    setIsLoading(true);
    setError(null);

    try {
      await fileService.saveFile(currentFile, content);
      setCurrentFile(prev => prev ? { ...prev, content } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
    } finally {
      setIsLoading(false);
    }
  }, [currentFile, fileService]);

  const closeFile = useCallback(() => {
    setCurrentFile(null);
    setError(null);
  }, []);

  const updateContent = useCallback((content: string) => {
    setCurrentFile(prev => prev ? { ...prev, content } : null);
  }, []);

  return {
    currentFile,
    isLoading,
    error,
    openFile,
    loadFile,
    saveFile,
    closeFile,
    updateContent,
  };
};