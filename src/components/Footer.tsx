// src/components/Footer.tsx

import React from 'react';
import { MarkdownFile } from '../types/markdown';

interface AutoSaveStatus {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  nextSaveIn: number;
  hasUnsavedChanges: boolean;
}

interface FooterProps {
  currentFile: MarkdownFile | null;
  autoSave?: AutoSaveStatus;
}

const Footer: React.FC<FooterProps> = ({ currentFile, autoSave }) => {
  const formatAutoSaveStatus = () => {
    if (!autoSave || !currentFile) return null;

    if (autoSave.isAutoSaving) {
      return (
        <span className="text-blue-500 dark:text-blue-400">Auto-saving...</span>
      );
    }

    if (!autoSave.hasUnsavedChanges) {
      return (
        <span className="text-green-500 dark:text-green-400">
          All changes saved
        </span>
      );
    }

    if (autoSave.nextSaveIn > 0) {
      return (
        <span className="text-yellow-500 dark:text-yellow-400">
          Auto-save in {autoSave.nextSaveIn}s
        </span>
      );
    }

    return (
      <span className="text-gray-500 dark:text-gray-400">
        Auto-save enabled
      </span>
    );
  };

  return (
    <footer className="h-8 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
      {/* Left side - File info */}
      <div className="flex items-center gap-4">
        {currentFile ? (
          <>
            <span>{currentFile.name}</span>
            <span>•</span>
            <span>{(currentFile.size / 1024).toFixed(1)} KB</span>
            {formatAutoSaveStatus() && (
              <>
                <span>•</span>
                {formatAutoSaveStatus()}
              </>
            )}
          </>
        ) : (
          <span>No file selected</span>
        )}
      </div>

      {/* Right side - Copyright */}
      <div>
        <span>&copy; 2025 Gone3D Productions, LLC. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
