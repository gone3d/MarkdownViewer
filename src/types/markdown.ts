export interface MarkdownFile {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  lastModified: Date;
  created: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  fileHandle?: FileSystemFileHandle; // For File System Access API
}

export interface MarkdownFolder {
  id: string;
  name: string;
  path: string;
  files: MarkdownFile[];
  subfolders: MarkdownFolder[];
  parent?: string;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
  anchor: string;
  children?: TableOfContentsItem[];
  depth?: number;
  lineNumber?: number;
}

export interface SearchResult {
  file: MarkdownFile;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  text: string;
  line: number;
  column: number;
  context: string;
}

export interface MarkdownViewerSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  showLineNumbers: boolean;
  wordWrap: boolean;
  previewMode: 'split' | 'preview' | 'edit';
}

export type ViewMode = 'viewer' | 'editor' | 'split';
export type SidebarMode = 'files' | 'toc' | 'search' | 'hidden';

// File type definitions for multi-format support
export type FileType = 'markdown' | 'yaml' | 'text';

// Universal file interface that supports multiple file types
export interface UniversalFile extends MarkdownFile {
  fileType: FileType;
}
