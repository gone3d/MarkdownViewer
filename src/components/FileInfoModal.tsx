import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatFileSize } from '../utils/fileUtils';

interface FileInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileInfoModal: React.FC<FileInfoModalProps> = ({ isOpen, onClose }) => {
  const { state, getFileStatistics, hasUnsavedChanges } = useAppContext();
  
  if (!isOpen || !state.currentFile) return null;

  const { file } = state.currentFile;
  const statistics = getFileStatistics();
  const hasChanges = hasUnsavedChanges();

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format dates
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format time duration
  const formatDuration = (minutes: number) => {
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 1 && remainingMinutes === 0) return '1 hour';
    if (remainingMinutes === 0) return `${hours} hours`;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            File Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className={`w-3 h-3 rounded-full ${hasChanges ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {hasChanges ? 'Unsaved Changes' : 'All Changes Saved'}
            </span>
            {state.currentFile.lastSaveTime && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last saved: {formatDate(state.currentFile.lastSaveTime)}
              </span>
            )}
          </div>

          {/* Basic File Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">File Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                    {file.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Path</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded break-all">
                    {file.path ? (
                      file.path.startsWith('/') ? file.path : `/${file.path}`
                    ) : (
                      'Not saved to disk'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Size</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatFileSize(file.content.length)} ({file.content.length.toLocaleString()} bytes)
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(file.created)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Modified</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(file.lastModified)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(state.currentFile.lastModifiedTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          {statistics && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Content Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.wordCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Words</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statistics.characterCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">Characters</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statistics.lineCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">Lines</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatDuration(statistics.estimatedReadTime)}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300">Read Time</div>
                </div>
              </div>

              {/* Markdown Elements */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {statistics.headingCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Headings</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {statistics.linkCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Links</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {statistics.imageCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Images</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {Math.floor(statistics.codeBlockCount)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Code Blocks</div>
                </div>
              </div>
            </div>
          )}

          {/* File System Information */}
          {file.fileHandle && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">File System</h3>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    File System Access API Supported
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Direct save to original location enabled
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {file.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileInfoModal;