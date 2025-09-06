import React, { useState, useEffect } from 'react';
import { X, Settings, Download, Upload, RotateCcw, Save } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'file-management' | 'editor' | 'ui' | 'performance';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefaults, exportSettings, importSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('file-management');

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExport = () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdownviewer-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const success = importSettings(content);
          if (success) {
            alert('Settings imported successfully!');
          } else {
            alert('Failed to import settings. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  };

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'file-management', label: 'File Management', icon: '📁' },
    { id: 'editor', label: 'Editor', icon: '✏️' },
    { id: 'ui', label: 'Interface', icon: '🎨' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Export Settings"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Import Settings"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              title="Reset to Defaults"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Close Settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'file-management' && (
              <FileManagementSettings 
                settings={settings.fileManagement}
                onChange={(updates) => updateSettings({ fileManagement: updates })}
              />
            )}
            {activeTab === 'editor' && (
              <EditorSettings 
                settings={settings.editor}
                onChange={(updates) => updateSettings({ editor: updates })}
              />
            )}
            {activeTab === 'ui' && (
              <UISettings 
                settings={settings.ui}
                onChange={(updates) => updateSettings({ ui: updates })}
              />
            )}
            {activeTab === 'performance' && (
              <PerformanceSettings 
                settings={settings.performance}
                onChange={(updates) => updateSettings({ performance: updates })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// File Management Settings Component
interface FileManagementSettingsProps {
  settings: typeof settings.fileManagement;
  onChange: (updates: Partial<typeof settings.fileManagement>) => void;
}

const FileManagementSettings: React.FC<FileManagementSettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Management</h3>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Recent Files Limit
        </label>
        <input
          type="range"
          min="5"
          max="50"
          value={settings.recentFilesLimit}
          onChange={(e) => onChange({ recentFilesLimit: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>5</span>
          <span className="font-medium">{settings.recentFilesLimit} files</span>
          <span>50</span>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-Save</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Automatically save files while editing</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSaveEnabled}
              onChange={(e) => onChange({ autoSaveEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.autoSaveEnabled && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-Save Interval
              </label>
              <input
                type="range"
                min="30"
                max="600"
                step="30"
                value={settings.autoSaveInterval}
                onChange={(e) => onChange({ autoSaveInterval: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>30s</span>
                <span className="font-medium">{settings.autoSaveInterval}s</span>
                <span>10m</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Save on Focus Loss</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Save when editor loses focus</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSaveOnBlur}
                onChange={(e) => onChange({ autoSaveOnBlur: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Editor Settings Component  
interface EditorSettingsProps {
  settings: typeof settings.editor;
  onChange: (updates: Partial<typeof settings.editor>) => void;
}

const EditorSettings: React.FC<EditorSettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editor Preferences</h3>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => onChange({ theme: e.target.value as 'system' | 'light' | 'dark' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Size
        </label>
        <input
          type="range"
          min="12"
          max="24"
          value={settings.fontSize}
          onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>12px</span>
          <span className="font-medium">{settings.fontSize}px</span>
          <span>24px</span>
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
        {[
          { key: 'cursorSyncEnabled', label: 'Cursor Sync', description: 'Sync viewer position with editor cursor' },
          { key: 'syntaxHighlightingEnabled', label: 'Syntax Highlighting', description: 'Highlight markdown syntax in editor' },
          { key: 'lineWrapping', label: 'Line Wrapping', description: 'Wrap long lines in editor' },
          { key: 'showLineNumbers', label: 'Line Numbers', description: 'Show line numbers in editor' },
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <input
              type="checkbox"
              checked={settings[key as keyof typeof settings] as boolean}
              onChange={(e) => onChange({ [key]: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// UI Settings Component
interface UISettingsProps {
  settings: typeof settings.ui;
  onChange: (updates: Partial<typeof settings.ui>) => void;
}

const UISettings: React.FC<UISettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interface Customization</h3>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Sidebar State
        </label>
        <select
          value={settings.sidebarDefaultState}
          onChange={(e) => onChange({ sidebarDefaultState: e.target.value as 'open' | 'closed' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Split View Orientation
        </label>
        <select
          value={settings.splitViewOrientation}
          onChange={(e) => onChange({ splitViewOrientation: e.target.value as 'auto' | 'horizontal' | 'vertical' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="auto">Auto (based on screen size)</option>
          <option value="horizontal">Horizontal (side by side)</option>
          <option value="vertical">Vertical (top and bottom)</option>
        </select>
      </div>

      <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
        {[
          { key: 'tocAutoCollapse', label: 'TOC Auto-Collapse', description: 'Automatically collapse inactive TOC sections' },
          { key: 'showFileInfo', label: 'Show File Info', description: 'Display file information in footer' },
          { key: 'compactMode', label: 'Compact Mode', description: 'Reduce padding and margins for more content' },
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <input
              type="checkbox"
              checked={settings[key as keyof typeof settings] as boolean}
              onChange={(e) => onChange({ [key]: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Performance Settings Component
interface PerformanceSettingsProps {
  settings: typeof settings.performance;
  onChange: (updates: Partial<typeof settings.performance>) => void;
}

const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Settings</h3>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Scroll Sync Sensitivity
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={settings.scrollSyncSensitivity}
          onChange={(e) => onChange({ scrollSyncSensitivity: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Low</span>
          <span className="font-medium">{settings.scrollSyncSensitivity}</span>
          <span>High</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Large File Warning (KB)
        </label>
        <input
          type="number"
          min="100"
          max="10240"
          step="100"
          value={settings.largeFileWarning}
          onChange={(e) => onChange({ largeFileWarning: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Max Recent Files in Memory
        </label>
        <input
          type="range"
          min="10"
          max="100"
          step="10"
          value={settings.maxRecentFilesInMemory}
          onChange={(e) => onChange({ maxRecentFilesInMemory: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>10</span>
          <span className="font-medium">{settings.maxRecentFilesInMemory}</span>
          <span>100</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Virtual Scrolling</label>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enable for very large file lists (experimental)</p>
        </div>
        <input
          type="checkbox"
          checked={settings.enableVirtualScrolling}
          onChange={(e) => onChange({ enableVirtualScrolling: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
      </div>
    </div>
  </div>
);

export default SettingsModal;