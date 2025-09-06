// Recent Files Management Utility

export interface RecentFile {
  id: string;
  name: string;
  path: string;
  lastOpened: number; // timestamp
  size?: number;
  content: string; // Store full file content for reliable access
  lastModified: number; // timestamp
  metadata?: Record<string, any>;
  fileHandle?: FileSystemFileHandle; // Still keep for in-session direct access
}

const RECENT_FILES_KEY = 'markdownviewer-recent-files';
const MAX_RECENT_FILES = 10;

// In-memory cache for fileHandles (can't be serialized to localStorage)
const fileHandleCache = new Map<string, FileSystemFileHandle>();

/**
 * Get fileHandle from memory cache
 */
export function getFileHandleFromCache(id: string): FileSystemFileHandle | undefined {
  return fileHandleCache.get(id);
}

/**
 * Get recent files from localStorage
 */
export function getRecentFiles(): RecentFile[] {
  try {
    const stored = localStorage.getItem(RECENT_FILES_KEY);
    if (!stored) return [];
    
    const files = JSON.parse(stored) as RecentFile[];
    
    // Restore fileHandles from memory cache
    const filesWithHandles = files.map(file => ({
      ...file,
      fileHandle: fileHandleCache.get(file.id)
    }));
    
    // Sort by lastOpened (most recent first) and limit to MAX_RECENT_FILES
    return filesWithHandles
      .sort((a, b) => b.lastOpened - a.lastOpened)
      .slice(0, MAX_RECENT_FILES);
  } catch (error) {
    console.warn('Error loading recent files from localStorage:', error);
    return [];
  }
}

/**
 * Add or update a file in recent files
 */
export function addRecentFile(file: {
  name: string;
  path: string;
  content: string;
  size?: number;
  lastModified: Date;
  metadata?: Record<string, any>;
  fileHandle?: FileSystemFileHandle;
}): void {
  try {
    const recentFiles = getRecentFiles();
    const now = Date.now();
    
    // Create unique ID from path
    const id = btoa(file.path).replace(/[^a-zA-Z0-9]/g, '');
    
    // Remove existing entry if it exists
    const filteredFiles = recentFiles.filter(f => f.id !== id);
    
    // Store fileHandle in memory cache if provided
    if (file.fileHandle) {
      fileHandleCache.set(id, file.fileHandle);
    }
    
    // Add new entry at the beginning
    const newFile: RecentFile = {
      id,
      name: file.name,
      path: file.path,
      content: file.content,
      lastOpened: now,
      lastModified: file.lastModified.getTime(),
      size: file.size,
      metadata: file.metadata,
      // Note: FileSystemFileHandle will be restored from memory cache in getRecentFiles()
    };
    
    const updatedFiles = [newFile, ...filteredFiles].slice(0, MAX_RECENT_FILES);
    
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updatedFiles));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('recentFilesUpdated'));
  } catch (error) {
    console.warn('Error saving recent file to localStorage:', error);
  }
}

/**
 * Remove a file from recent files
 */
export function removeRecentFile(id: string): void {
  try {
    const recentFiles = getRecentFiles();
    const updatedFiles = recentFiles.filter(f => f.id !== id);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updatedFiles));
    
    // Remove from memory cache too
    fileHandleCache.delete(id);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('recentFilesUpdated'));
  } catch (error) {
    console.warn('Error removing recent file from localStorage:', error);
  }
}

/**
 * Clear all recent files
 */
export function clearRecentFiles(): void {
  try {
    localStorage.removeItem(RECENT_FILES_KEY);
    
    // Clear memory cache too
    fileHandleCache.clear();
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('recentFilesUpdated'));
  } catch (error) {
    console.warn('Error clearing recent files from localStorage:', error);
  }
}

/**
 * Convert a RecentFile to a MarkdownFile for opening
 */
export function recentFileToMarkdownFile(recentFile: RecentFile): {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  lastModified: Date;
  created: Date;
  metadata?: Record<string, any>;
  fileHandle?: FileSystemFileHandle;
} {
  return {
    id: crypto.randomUUID(),
    name: recentFile.name,
    path: recentFile.path,
    content: recentFile.content,
    size: recentFile.size || recentFile.content.length,
    lastModified: new Date(recentFile.lastModified),
    created: new Date(recentFile.lastModified),
    metadata: recentFile.metadata,
    fileHandle: recentFile.fileHandle,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format last opened time for display
 */
export function formatLastOpened(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}