import React from 'react';
import { MarkdownFile, SidebarMode } from '../types/markdown';
import { Files, List, Search } from 'lucide-react';
import { useFileTree } from '../hooks/useFileTree';
import TableOfContents from './TableOfContents';
import FileBrowser from './FileBrowser';

interface SidebarProps {
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  currentFile: MarkdownFile | null;
  onFileSelect?: (filePath: string) => void;
  onFileOpen?: (filePath: string) => void;
  fileTree?: ReturnType<typeof useFileTree>;
  headerIds?: Map<string, string>;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  mode,
  onModeChange,
  currentFile,
  onFileSelect,
  onFileOpen,
  fileTree,
  headerIds,
  className = '',
}) => {
  const modes = [
    { key: 'files' as SidebarMode, label: 'Files', icon: Files },
    { key: 'toc' as SidebarMode, label: 'Outline', icon: List },
    { key: 'search' as SidebarMode, label: 'Search', icon: Search },
  ];

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Sidebar Header */}
      <header className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <nav className="flex w-full">
          {modes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              className={`flex-1 flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                mode === key
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Sidebar Content */}
      <div className={`flex-1 overflow-auto ${mode === 'toc' || mode === 'files' ? '' : 'p-4'}`}>
        {mode === 'files' && (
          <FileBrowser 
            onFileSelect={(node) => {
              if (node.type === 'file' && node.isMarkdown && onFileSelect) {
                onFileSelect(node.path);
              }
            }}
            onFileOpen={(node) => {
              if (node.type === 'file' && node.isMarkdown && onFileOpen) {
                onFileOpen(node.path);
              }
            }}
            fileTree={fileTree}
            className="h-full" 
          />
        )}

        {mode === 'toc' && (
          <TableOfContents currentFile={currentFile} headerIds={headerIds} className="h-full" />
        )}

        {mode === 'search' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Search
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search in current file..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Search functionality will be implemented in future updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;