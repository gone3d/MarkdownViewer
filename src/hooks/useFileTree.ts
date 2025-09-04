import { useState, useCallback, useReducer } from 'react';
import { FileTreeNode, FileTreeState, FileTreeAction } from '../types/fileTree';
import { FileTreeService } from '../services/FileTreeService';

const initialState: FileTreeState = {
  nodes: [],
  expandedFolders: new Set(),
  selectedFile: null,
  rootPath: null,
};

function fileTreeReducer(
  state: FileTreeState,
  action: FileTreeAction
): FileTreeState {
  switch (action.type) {
    case 'SET_TREE':
      return {
        ...state,
        nodes: action.payload,
        expandedFolders: new Set([action.payload[0]?.id].filter(Boolean)),
      };

    case 'TOGGLE_FOLDER': {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedFolders: newExpanded };
    }

    case 'SELECT_FILE':
      return { ...state, selectedFile: action.payload };

    case 'SET_ROOT':
      return { ...state, rootPath: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface UseFileTreeReturn {
  treeState: FileTreeState;
  isLoading: boolean;
  error: string | null;
  flatTree: FileTreeNode[];
  treeStats: { files: number; folders: number; markdownFiles: number };
  openDirectory: () => Promise<void>;
  toggleFolder: (folderId: string) => void;
  selectFile: (fileId: string) => void;
  loadFileById: (fileId: string) => Promise<File | null>;
  resetTree: () => void;
}

export const useFileTree = (): UseFileTreeReturn => {
  const [treeState, dispatch] = useReducer(fileTreeReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileTreeService = FileTreeService.getInstance();

  // Open directory picker
  const openDirectory = useCallback(async () => {
    if (!fileTreeService.isFileSystemAccessSupported()) {
      setError('File System Access API not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rootNode = await fileTreeService.openDirectory();
      if (rootNode) {
        dispatch({ type: 'SET_TREE', payload: [rootNode] });
        dispatch({ type: 'SET_ROOT', payload: rootNode.path });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open directory');
    } finally {
      setIsLoading(false);
    }
  }, [fileTreeService]);

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    dispatch({ type: 'TOGGLE_FOLDER', payload: folderId });
  }, []);

  // Select file
  const selectFile = useCallback((fileId: string) => {
    dispatch({ type: 'SELECT_FILE', payload: fileId });
  }, []);

  // Load file by ID
  const loadFileById = useCallback(
    async (fileId: string): Promise<File | null> => {
      const node = fileTreeService.findNodeById(treeState.nodes, fileId);
      if (!node || node.type !== 'file' || !node.handle) {
        return null;
      }

      try {
        return await fileTreeService.loadFileFromHandle(node.handle);
      } catch (error) {
        console.error('Failed to load file:', error);
        return null;
      }
    },
    [treeState.nodes, fileTreeService]
  );

  // Reset tree
  const resetTree = useCallback(() => {
    dispatch({ type: 'RESET' });
    setError(null);
  }, []);

  // Get flattened tree for rendering
  const flatTree = fileTreeService.flattenTree(
    treeState.nodes,
    treeState.expandedFolders
  );

  // Get tree statistics
  const treeStats = fileTreeService.getTreeStats(treeState.nodes);

  return {
    treeState,
    isLoading,
    error,
    flatTree,
    treeStats,
    openDirectory,
    toggleFolder,
    selectFile,
    loadFileById,
    resetTree,
  };
};
