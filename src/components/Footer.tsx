// src/components/Footer.tsx

import React from 'react';
import { MarkdownFile } from '../types/markdown';

interface FooterProps {
  currentFile: MarkdownFile | null;
}

const Footer: React.FC<FooterProps> = ({ currentFile }) => {
  return (
    <footer className="h-8 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
      {/* Left side - File info */}
      <div className="flex items-center gap-4">
        {currentFile ? (
          <>
            <span>{currentFile.name}</span>
            <span>•</span>
            <span>{(currentFile.size / 1024).toFixed(1)} KB</span>
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
