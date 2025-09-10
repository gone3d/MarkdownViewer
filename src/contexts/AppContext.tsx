import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { MarkdownFile, ViewMode } from '../types/markdown';
import FileService, {
  FileValidationError,
  FileOperationError,
} from '../services/FileService';
import { addRecentFile, recentFileToMarkdownFile, getFileHandleFromCache, type RecentFile } from '../utils/recentFiles';

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
  | { type: 'UPDATE_FILE_NAME'; payload: string }
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
  openFileFromHandle: (fileHandle: FileSystemFileHandle) => Promise<void>;
  openRecentFile: (recentFile: RecentFile) => Promise<void>;
  loadFile: (file: File) => Promise<void>;
  saveFile: (content?: string) => Promise<void>;
  createFile: (name?: string) => Promise<void>;
  renameFile: (newName: string) => Promise<void>;
  duplicateFile: (newName?: string) => Promise<void>;
  deleteFile: () => Promise<boolean>; // Returns true if confirmed and deleted
  closeFile: () => void;
  updateFileContent: (content: string, markAsUnsaved?: boolean) => void;
  loadWelcomeFile: () => Promise<void>;
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

// Initial state with system theme detection
const getInitialTheme = (): 'light' | 'dark' => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('markdownviewer-theme') as 'light' | 'dark' | null;
  if (savedTheme) return savedTheme;
  
  // Fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return 'light';
};

const initialState: AppState = {
  currentFile: null,
  viewMode: 'viewer',
  sidebarOpen: true,
  theme: getInitialTheme(),
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

    case 'UPDATE_FILE_CONTENT': {
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
    }

    case 'UPDATE_FILE_NAME':
      if (!state.currentFile) return state;
      return {
        ...state,
        currentFile: {
          ...state.currentFile,
          file: {
            ...state.currentFile.file,
            name: action.payload,
          },
          hasUnsavedChanges: true, // Name change means file needs saving
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

    case 'ADD_RECENT_FILE': {
      // Add to localStorage using the utility
      addRecentFile({
        name: action.payload.name,
        path: action.payload.path,
        content: action.payload.content,
        size: action.payload.size,
        lastModified: action.payload.lastModified,
        metadata: action.payload.metadata,
        fileHandle: action.payload.fileHandle,
      });
      
      // Keep the state logic for backward compatibility
      const filteredRecent = state.recentFiles.filter(f => f.id !== action.payload.id);
      return {
        ...state,
        recentFiles: [action.payload, ...filteredRecent].slice(0, 10), // Keep last 10
      };
    }

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

  // Apply theme to document and persist to localStorage
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Persist theme preference
    localStorage.setItem('markdownviewer-theme', state.theme);
  }, [state.theme]);

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

  const openFileFromHandle = useCallback(async (fileHandle: FileSystemFileHandle) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      const markdownFile = await fileService.openFileFromHandle(fileHandle);
      
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
      let errorMessage = 'Failed to open file from handle';
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

  const openRecentFile = useCallback(async (recentFile: RecentFile) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      // INTELLIGENT REFRESH: Check if file was modified externally
      const fileHandleCache = getFileHandleFromCache(recentFile.id);
      const fileHandle = recentFile.fileHandle || fileHandleCache;
      
      if (fileHandle) {
        try {
          // Get current file info from disk
          const currentFile = await fileHandle.getFile();
          const currentModTime = currentFile.lastModified;
          const cachedModTime = recentFile.lastModified;
          
          // If file was modified externally, reload fresh content
          if (currentModTime > cachedModTime) {
            console.log(`🔄 File "${recentFile.name}" modified externally, loading fresh content...`);
            await openFileFromHandle(fileHandle);
            return; // Exit early - openFileFromHandle handles everything
          }
        } catch (error) {
          console.warn(`⚠️ FileHandle for "${recentFile.name}" no longer accessible, using cached content:`, error);
          // Continue with cached content if fileHandle is invalid
        }
      }
      
      // File unchanged or no fileHandle - use fast cached content
      const markdownFile = recentFileToMarkdownFile(recentFile);
      
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
      
      // Update the recent file timestamp (move to top of list)
      addRecentFile({
        name: recentFile.name,
        path: recentFile.path,
        content: recentFile.content,
        size: recentFile.size,
        lastModified: new Date(recentFile.lastModified),
        metadata: recentFile.metadata,
        fileHandle: recentFile.fileHandle,
      });
    } catch (err) {
      let errorMessage = 'Failed to open recent file';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: false });
    }
  }, []);

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
      const result = await fileService.saveFile(state.currentFile.file, contentToSave);
      
      if (result.success) {
        // If we got a new fileHandle (from save-as dialog), update the file
        if (result.fileHandle && !state.currentFile.file.fileHandle) {
          dispatch({
            type: 'SET_CURRENT_FILE',
            payload: {
              ...state.currentFile,
              file: {
                ...state.currentFile.file,
                fileHandle: result.fileHandle,
                path: result.fileHandle.name,
              }
            }
          });
        }
        
        dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { content: contentToSave, forceUnsaved: false } });
        dispatch({ type: 'MARK_FILE_SAVED', payload: new Date() });
      } else {
        // User cancelled save dialog or save failed
        return;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save file';
      dispatch({ type: 'SET_FILE_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_FILE_LOADING', payload: false });
    }
  }, [state.currentFile, fileService]);

  const createFile = useCallback(async (name?: string) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      // Generate a default name if none provided
      const fileName = name || `untitled-${Date.now()}`;
      const fullName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
      
      // Create a new blank markdown file
      const newFile: MarkdownFile = {
        id: Date.now().toString(),
        name: fullName,
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
        hasUnsavedChanges: true, // New file needs to be saved
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

  const renameFile = useCallback(async (newName: string) => {
    if (!state.currentFile) return;

    dispatch({ type: 'SET_FILE_LOADING', payload: true });
    dispatch({ type: 'SET_FILE_ERROR', payload: null });

    try {
      const fullName = newName.endsWith('.md') ? newName : `${newName}.md`;
      dispatch({ type: 'UPDATE_FILE_NAME', payload: fullName });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename file';
      dispatch({ type: 'SET_FILE_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_FILE_LOADING', payload: false });
    }
  }, [state.currentFile]);

  const duplicateFile = useCallback(async (newName?: string) => {
    if (!state.currentFile) return;

    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      const originalFile = state.currentFile.file;
      const baseName = newName || `${originalFile.name.replace('.md', '')}-copy`;
      const fullName = baseName.endsWith('.md') ? baseName : `${baseName}.md`;

      // Create a duplicate file with same content
      const duplicateFile: MarkdownFile = {
        id: Date.now().toString(),
        name: fullName,
        path: '',
        content: originalFile.content,
        size: originalFile.content.length,
        lastModified: new Date(),
        created: new Date(),
        tags: [...(originalFile.tags || [])],
        metadata: { ...originalFile.metadata },
      };

      const fileState: FileState = {
        file: duplicateFile,
        originalContent: originalFile.content,
        hasUnsavedChanges: true, // Duplicate needs to be saved
        lastSaveTime: null,
        lastModifiedTime: new Date(),
        isLoading: false,
        error: null,
      };

      dispatch({ type: 'SET_CURRENT_FILE', payload: fileState });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate file';
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: false });
    }
  }, [state.currentFile]);

  const deleteFile = useCallback(async (): Promise<boolean> => {
    if (!state.currentFile) return false;

    const fileName = state.currentFile.file.name;
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return false;

    dispatch({ type: 'SET_GLOBAL_LOADING', payload: true });
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });

    try {
      // For now, just clear the current file since we don't have file system deletion
      // In a real app, you would delete from the file system here
      dispatch({ type: 'CLEAR_CURRENT_FILE' });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: false });
    }
  }, [state.currentFile]);

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

  // Load welcome file (README.md) for first-time users
  const loadWelcomeFile = useCallback(async () => {
    try {
      console.log('Loading welcome file (README.md)...');
      const response = await fetch('/README.md');
      if (!response.ok) {
        throw new Error(`Failed to fetch README.md: ${response.status}`);
      }
      
      const content = await response.text();
      const markdownFile: MarkdownFile = {
        name: 'README.md',
        content,
        path: '/README.md',
        size: content.length,
        lastModified: new Date(),
        fileHandle: undefined // No file handle for bundled file
      };

      const fileState: FileState = {
        file: markdownFile,
        originalContent: content,
        hasUnsavedChanges: false,
        lastSaveTime: null,
        lastModifiedTime: markdownFile.lastModified,
        isLoading: false,
        error: null,
      };

      dispatch({ type: 'SET_CURRENT_FILE', payload: fileState });
      console.log('✅ Welcome file loaded successfully');
      
    } catch (error) {
      console.warn('⚠️ Could not load welcome file:', error);
      // Don't dispatch error - this is optional functionality
    }
  }, []);


  const contextValue: AppContextType = {
    state,
    openFile,
    openFileFromHandle,
    openRecentFile,
    loadFile,
    saveFile,
    createFile,
    renameFile,
    duplicateFile,
    deleteFile,
    closeFile,
    updateFileContent,
    loadWelcomeFile,
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