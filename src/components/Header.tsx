// src/components/Header.tsx

import { useState } from 'react';
import packageJson from '../../package.json';
import { ViewMode } from '../types/markdown';
import { FolderOpen, Menu, X, FileText, Sun, Moon, Save, Info, File, Copy, Edit3, Trash2 } from 'lucide-react';
import FileInfoModal from './FileInfoModal';
import DropDown, { DropDownItem } from './DropDown';
import { useAppContext } from '../contexts/AppContext';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  viewMode,
  onViewModeChange,
  isDarkMode,
  onThemeToggle,
}) => {
  const [isFileInfoOpen, setIsFileInfoOpen] = useState(false);
  const { state, openFile, saveFile, createFile, renameFile, duplicateFile, deleteFile } = useAppContext();
  const hasUnsavedChanges = state.currentFile?.hasUnsavedChanges ?? false;

  // File operations handlers
  const handleNewFile = async () => {
    const name = prompt('Enter file name (optional):');
    if (name !== null) { // User didn't cancel
      await createFile(name || undefined);
    }
  };

  const handleRenameFile = async () => {
    if (!state.currentFile) return;
    const currentName = state.currentFile.file.name.replace('.md', '');
    const newName = prompt('Enter new file name:', currentName);
    if (newName && newName.trim() !== currentName) {
      await renameFile(newName.trim());
    }
  };

  const handleDuplicateFile = async () => {
    if (!state.currentFile) return;
    const currentName = state.currentFile.file.name.replace('.md', '');
    const newName = prompt('Enter name for duplicate:', `${currentName}-copy`);
    if (newName && newName.trim()) {
      await duplicateFile(newName.trim());
    }
  };

  const handleDeleteFile = async () => {
    await deleteFile();
  };

  const handleSaveFile = async () => {
    if (state.currentFile) {
      await saveFile(state.currentFile.file.content);
    }
  };

  // Create dropdown items
  const fileDropdownItems: DropDownItem[] = [
    {
      id: 'open',
      label: 'Open File',
      icon: <FolderOpen className="w-4 h-4" />,
      onClick: openFile,
    },
    {
      id: 'new',
      label: 'New File',
      icon: <File className="w-4 h-4" />,
      onClick: handleNewFile,
    },
    {
      id: 'save',
      label: 'Save File',
      icon: <Save className="w-4 h-4" />,
      onClick: handleSaveFile,
      disabled: !state.currentFile,
      divider: true,
    },
    {
      id: 'info',
      label: 'File Info',
      icon: <Info className="w-4 h-4" />,
      onClick: () => setIsFileInfoOpen(true),
      disabled: !state.currentFile,
      divider: true,
    },
    {
      id: 'rename',
      label: 'Rename File',
      icon: <Edit3 className="w-4 h-4" />,
      onClick: handleRenameFile,
      disabled: !state.currentFile,
    },
    {
      id: 'duplicate',
      label: 'Duplicate File',
      icon: <Copy className="w-4 h-4" />,
      onClick: handleDuplicateFile,
      disabled: !state.currentFile,
    },
    {
      id: 'delete',
      label: 'Delete File',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteFile,
      disabled: !state.currentFile,
    },
  ];
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
        <div className="flex items-center gap-2">
          <h1
            className="text-xl font-bold text-gray-900 dark:text-gray-100 cursor-default"
            title={`Version ${packageJson.version}`}
          >
            MarkdownViewer
          </h1>
          {hasUnsavedChanges && (
            <div 
              className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
              title="Unsaved changes"
            />
          )}
        </div>
      </div>

      {/* Center - File Operations and View Mode */}
      <div className="flex items-center gap-4">
        {/* File Operations Dropdown */}
        <DropDown
          trigger={{
            label: 'File',
            icon: <FileText className="h-4 w-4" />,
            className: 'bg-primary-600 hover:bg-primary-700 text-white'
          }}
          items={fileDropdownItems}
          align="left"
        />

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

      {/* File Info Modal */}
      <FileInfoModal
        isOpen={isFileInfoOpen}
        onClose={() => setIsFileInfoOpen(false)}
      />
    </header>
  );
};

export default Header;
