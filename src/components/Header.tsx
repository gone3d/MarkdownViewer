// src/components/Header.tsx

import packageJson from '../../package.json';
import { ViewMode } from '../types/markdown';
import { FolderOpen, Menu, X, FileText, Sun, Moon, Save } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenFile: () => void;
  onSave?: () => void;
  hasFile?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onOpenFile,
  onSave,
  hasFile,
  viewMode,
  onViewModeChange,
  isDarkMode,
  onThemeToggle,
}) => {
  return (
    <header className="px-4 h-16 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* App Logo and Title */}
        <div className="flex items-center justify-center h-10 w-10 bg-primary-600 text-white rounded-lg flex-shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <h1
          className="text-xl font-bold text-gray-900 dark:text-gray-100 cursor-default"
          title={`Version ${packageJson.version}`}
        >
          MarkdownViewer
        </h1>
      </div>

      {/* Center - File Operations and View Mode */}
      <div className="flex items-center gap-4">
        {/* Open File Button */}
        <button
          onClick={onOpenFile}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
        >
          <FolderOpen className="h-4 w-4" />
          Open File
        </button>

        {/* Save File Button */}
        <button
          onClick={onSave}
          disabled={!hasFile || !onSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          title={hasFile ? 'Save file (Ctrl+S)' : 'No file to save'}
        >
          <Save className="h-4 w-4" />
          Save File
        </button>

        {/* View Mode Selector */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['viewer', 'editor', 'split'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Right side - Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <div className="theme-toggle">
          <span className="toggle-text">{isDarkMode ? 'Dark' : 'Light'}</span>
          <input
            type="checkbox"
            id="theme-toggle"
            checked={isDarkMode}
            onChange={onThemeToggle}
          />
          <label htmlFor="theme-toggle" className="toggle-label">
            <span className="toggle-slider">
              <Sun className="toggle-icon sun-icon h-3 w-3" />
              <Moon className="toggle-icon moon-icon h-3 w-3" />
            </span>
          </label>
        </div>
      </div>
    </header>
  );
};

export default Header;
