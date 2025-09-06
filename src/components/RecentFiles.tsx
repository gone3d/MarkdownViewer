import React, { useState, useEffect } from 'react';
import {
  Clock,
  FileText,
  X,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { 
  getRecentFiles, 
  removeRecentFile, 
  clearRecentFiles, 
  formatFileSize, 
  formatLastOpened,
  type RecentFile 
} from '../utils/recentFiles';
import { useAppContext } from '../contexts/AppContext';

interface RecentFilesProps {
  onFileSelect?: (filePath: string) => void;
  className?: string;
}

const RecentFiles: React.FC<RecentFilesProps> = ({
  onFileSelect,
  className = '',
}) => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { openFileFromHandle, openRecentFile } = useAppContext();

  // Load recent files on mount and set up listeners
  useEffect(() => {
    const loadRecentFiles = () => {
      setRecentFiles(getRecentFiles());
    };

    loadRecentFiles();

    // Listen for storage changes (in case other tabs update recent files)
    window.addEventListener('storage', loadRecentFiles);
    
    // Custom event for same-tab updates
    window.addEventListener('recentFilesUpdated', loadRecentFiles);
    
    return () => {
      window.removeEventListener('storage', loadRecentFiles);
      window.removeEventListener('recentFilesUpdated', loadRecentFiles);
    };
  }, []);

  // Handle file selection
  const handleFileClick = async (file: RecentFile) => {
    try {
      // Always use openRecentFile which works with stored content - most reliable approach
      console.log(`Opening recent file: ${file.name}`);
      await openRecentFile(file);
    } catch (error) {
      console.error('Error opening recent file:', error);
      
      // Fallback 1: Try fileHandle if available (for in-session files)
      if (file.fileHandle) {
        console.log('Trying fileHandle approach as fallback...');
        try {
          await openFileFromHandle(file.fileHandle);
          return;
        } catch (handleError) {
          console.error('FileHandle approach also failed:', handleError);
        }
      }
      
      // Fallback 2: Try callback approach (for files in current folder)
      if (onFileSelect) {
        console.log('Trying callback approach as fallback...');
        onFileSelect(file.path);
        return;
      }
      
      // Last resort: show error message
      alert(`Could not open "${file.name}". The file may have been moved or deleted.`);
    }
  };

  // Handle remove single file
  const handleRemoveFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    removeRecentFile(fileId);
    setRecentFiles(getRecentFiles());
  };

  // Handle clear all files
  const handleClearAll = () => {
    if (confirm('Clear all recent files?')) {
      clearRecentFiles();
      setRecentFiles([]);
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <Clock className="h-4 w-4 flex-shrink-0" />
            Recent Files ({recentFiles.length})
          </button>
          {isExpanded && recentFiles.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Clear all recent files"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Recent files list */}
      {isExpanded && (
        <div className="max-h-40 overflow-y-auto">
          {recentFiles.length === 0 ? (
            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                No recent files
              </p>
            </div>
          ) : (
            recentFiles.map((file) => (
              <div
                key={file.id}
                className="group flex items-center gap-2 px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleFileClick(file)}
                title={`${file.path}\nLast opened: ${formatLastOpened(file.lastOpened)}${
                  file.size ? `\nSize: ${formatFileSize(file.size)}` : ''
                }\n✓ Opens directly from stored content`}
              >
                {/* File icon - always green since we store full content */}
                <FileText className="h-3 w-3 flex-shrink-0 text-green-600 dark:text-green-400" />
                
                {/* File name */}
                <div className="flex-1 min-w-0 text-sm text-gray-900 dark:text-gray-100 truncate">
                  {file.name}
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemoveFile(e, file.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all flex-shrink-0"
                  title="Remove from recent files"
                >
                  <X className="h-2.5 w-2.5 text-gray-500" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RecentFiles;