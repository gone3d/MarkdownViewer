export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  isMarkdown?: boolean;
  children?: FileTreeNode[];
  isExpanded?: boolean;
  depth: number;
  handle?: any; // FileSystemHandle for loading file content
}

export interface FileTreeState {
  nodes: FileTreeNode[];
  expandedFolders: Set<string>;
  selectedFile: string | null;
  rootPath: string | null;
}

export type FileTreeAction = 
  | { type: 'SET_TREE'; payload: FileTreeNode[] }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'SELECT_FILE'; payload: string }
  | { type: 'SET_ROOT'; payload: string }
  | { type: 'RESET' };