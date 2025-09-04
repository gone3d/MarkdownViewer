import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { MarkdownFile, ViewMode } from '../types/markdown';
import FileService, {
  FileValidationError,
  FileOperationError,
} from '../services/FileService';

// Extended file state with additional metadata
export interface FileState {
  file: MarkdownFile;
  originalContent: string; // Track original content for change detection
  hasUnsavedChanges: boolean;
  lastSaveTime: Date | null;
  lastModifiedTime: Date;
  isLoading: boolean;
  error: string | null;
}

// App-wide state interface
interface AppState {
  currentFile: FileState | null;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  recentFiles: MarkdownFile[];
  globalLoading: boolean;
  globalError: string | null;
}

// Action types for the reducer
type AppAction =
  | { type: 'SET_CURRENT_FILE'; payload: FileState | null }
  | { type: 'UPDATE_FILE_CONTENT'; payload: { content: string; forceUnsaved?: boolean } }
  | { type: 'MARK_FILE_SAVED'; payload: Date }
  | { type: 'SET_FILE_LOADING'; payload: boolean }
  | { type: 'SET_FILE_ERROR'; payload: string | null }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_RECENT_FILE'; payload: MarkdownFile }
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'SET_GLOBAL_ERROR'; payload: string | null }
  | { type: 'CLEAR_CURRENT_FILE' };

// Context interface
interface AppContextType {
  state: AppState;
  // File operations
  openFile: () => Promise<void>;
  loadFile: (file: File) => Promise<void>;
  saveFile: (content?: string) => Promise<void>;
  createFile: (name: string) => Promise<void>;
  closeFile: () => void;
  updateFileContent: (content: string, markAsUnsaved?: boolean) => void;
  // UI operations  
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  // File info
  getFileStatistics: () => FileStatistics | null;
  hasUnsavedChanges: () => boolean;
}

// File statistics interface
export interface FileStatistics {
  wordCount: number;
  characterCount: number;
  lineCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  codeBlockCount: number;
  estimatedReadTime: number;
}

// Initial state
const initialState: AppState = {
  currentFile: null,
  viewMode: 'viewer',
  sidebarOpen: true,
  theme: 'light',
  recentFiles: [],
  globalLoading: false,
  globalError: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_FILE':
      return {
        ...state,
        currentFile: action.payload,
        globalError: null,
      };

    case 'UPDATE_FILE_CONTENT':
      if (!state.currentFile) return state;
      const newContent = action.payload.content;
      const hasChanges = action.payload.forceUnsaved !== undefined 
        ? action.payload.forceUnsaved
        : newContent !== state.currentFile.originalContent;
      
      return {
        ...state,
        currentFile: {
          ...state.currentFile,
          file: {
            ...state.currentFile.file,
            content: newContent,
          },
          hasUnsavedChanges: hasChanges,
          lastModifiedTime: new Date(),
        },
      };

    case 'MARK_FILE_SAVED':
      if (!state.currentFile) return state;
      return {
        ...state,
        currentFile: {
          ...state.currentFile,
          originalContent: state.currentFile.file.content, // Update original content after save
          hasUnsavedChanges: false,
          lastSaveTime: action.payload,
        },
      };

    case 'SET_FILE_LOADING':
      if (!state.currentFile) return state;
      return {
        ...state,
        currentFile: {
          ...state.currentFile,
          isLoading: action.payload,
        },
      };

    case 'SET_FILE_ERROR':
      if (!state.currentFile) return state;
      return {
        ...state,
        currentFile: {
          ...state.currentFile,
          error: action.payload,
        },
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'ADD_RECENT_FILE':
      const filteredRecent = state.recentFiles.filter(f => f.id !== action.payload.id);
      return {
        ...state,
        recentFiles: [action.payload, ...filteredRecent].slice(0, 10), // Keep last 10
      };

    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.payload,
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
      };

    case 'CLEAR_CURRENT_FILE':
      return {
        ...state,
        currentFile: null,
        globalError: null,
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const fileService = FileService.getInstance();

  // File operations
  const openFile = useCallback(async () => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      const markdownFile = await fileService.openFile();
      if (markdownFile) {
        const fileState: FileState = {
          file: markdownFile,
          originalContent: markdownFile.content,
          hasUnsavedChanges: false,
          lastSaveTime: null,
          lastModifiedTime: markdownFile.lastModified,
          isLoading: false,
          error: null,
        };
        dispatch({ type: 'SET_CURRENT_FILE', payload: fileState });
        dispatch({ type: 'ADD_RECENT_FILE', payload: markdownFile });
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
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: false });
    }
  }, [fileService]);

  const loadFile = useCallback(async (file: File) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      const content = await file.text();
      const markdownFile = await fileService.processFile(file, content);
      const fileState: FileState = {
        file: markdownFile,
        originalContent: markdownFile.content,
        hasUnsavedChanges: false,
        lastSaveTime: null,
        lastModifiedTime: markdownFile.lastModified,
        isLoading: false,
        error: null,
      };
      dispatch({ type: 'SET_CURRENT_FILE', payload: fileState });
      dispatch({ type: 'ADD_RECENT_FILE', payload: markdownFile });
    } catch (err) {
      let errorMessage = 'Failed to load file';
      if (err instanceof FileValidationError) {
        errorMessage = `File validation error: ${err.message}`;
      } else if (err instanceof FileOperationError) {
        errorMessage = `File operation error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: false });
    }
  }, [fileService]);

  const saveFile = useCallback(async (content?: string) => {
    if (!state.currentFile) return;

    const contentToSave = content ?? state.currentFile.file.content;
    dispatch({ type: 'SET_FILE_LOADING', payload: true });
    dispatch({ type: 'SET_FILE_ERROR', payload: null });

    try {
      await fileService.saveFile(state.currentFile.file, contentToSave);
      dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { content: contentToSave, hasUnsavedChanges: false } });
      dispatch({ type: 'MARK_FILE_SAVED', payload: new Date() });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save file';
      dispatch({ type: 'SET_FILE_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_FILE_LOADING', payload: false });
    }
  }, [state.currentFile, fileService]);

  const createFile = useCallback(async (name: string) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      // Create a new blank markdown file
      const newFile: MarkdownFile = {
        id: Date.now().toString(),
        name: name.endsWith('.md') ? name : `${name}.md`,
        path: '',
        content: '',
        size: 0,
        lastModified: new Date(),
        created: new Date(),
        metadata: {},
      };

      const fileState: FileState = {
        file: newFile,
        originalContent: '', // New file starts empty
        hasUnsavedChanges: false, // New empty file has no changes yet
        lastSaveTime: null,
        lastModifiedTime: new Date(),
        isLoading: false,
        error: null,
      };

      dispatch({ type: 'SET_CURRENT_FILE', payload: fileState });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create file';
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: false });
    }
  }, []);

  const closeFile = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_FILE' });
  }, []);

  const updateFileContent = useCallback((content: string, forceUnsaved?: boolean) => {
    dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { content, forceUnsaved } });
  }, []);

  // UI operations
  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: !state.sidebarOpen });
  }, [state.sidebarOpen]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });
  }, [state.theme]);

  // Utility functions
  const getFileStatistics = useCallback((): FileStatistics | null => {
    if (!state.currentFile) return null;

    const content = state.currentFile.file.content;
    const lines = content.split('\n');
    
    // Basic word and character count
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characterCount = content.length;
    
    // Count lines (total line count)
    const lineCount = lines.length;
    
    // Count different markdown elements
    const headingCount = lines.filter(line => /^#{1,6}\s/.test(line.trim())).length;
    const linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    const codeBlockCount = (content.match(/```/g) || []).length / 2;
    
    // Estimated read time (average 200 words per minute)
    const estimatedReadTime = Math.ceil(wordCount / 200);

    return {
      wordCount,
      characterCount,
      lineCount,
      headingCount,
      linkCount,
      imageCount,
      codeBlockCount,
      estimatedReadTime,
    };
  }, [state.currentFile]);

  const hasUnsavedChanges = useCallback((): boolean => {
    return state.currentFile?.hasUnsavedChanges ?? false;
  }, [state.currentFile]);

  const contextValue: AppContextType = {
    state,
    openFile,
    loadFile,
    saveFile,
    createFile,
    closeFile,
    updateFileContent,
    setViewMode,
    setSidebarOpen,
    toggleSidebar,
    setTheme,
    toggleTheme,
    getFileStatistics,
    hasUnsavedChanges,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;