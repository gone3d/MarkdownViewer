/**
 * Settings types and interfaces for user preferences
 */

export interface FileManagementSettings {
  recentFilesLimit: number; // 5-50
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in seconds: 30-600 (30s-10m)
  autoSaveOnBlur: boolean; // save when editor loses focus
}

export interface EditorPreferences {
  theme: 'system' | 'light' | 'dark';
  fontSize: number; // 12-24px
  cursorSyncEnabled: boolean;
  syntaxHighlightingEnabled: boolean;
  lineWrapping: boolean;
  showLineNumbers: boolean;
}

export interface UICustomization {
  sidebarDefaultState: 'open' | 'closed';
  splitViewOrientation: 'auto' | 'horizontal' | 'vertical';
  tocAutoCollapse: boolean;
  showFileInfo: boolean; // show file info in footer
  compactMode: boolean; // reduce padding/margins
}

export interface PerformanceSettings {
  enableVirtualScrolling: boolean; // for large file lists
  scrollSyncSensitivity: number; // 1-10 (higher = more sensitive)
  largeFileWarning: number; // file size in KB to warn about
  maxRecentFilesInMemory: number; // 10-100
}

export interface AppSettings {
  fileManagement: FileManagementSettings;
  editor: EditorPreferences;
  ui: UICustomization;
  performance: PerformanceSettings;
  version: string; // for settings migration
}

export const DEFAULT_SETTINGS: AppSettings = {
  fileManagement: {
    recentFilesLimit: 10,
    autoSaveEnabled: false, // disabled by default
    autoSaveInterval: 60, // 60 seconds
    autoSaveOnBlur: true,
  },
  editor: {
    theme: 'system',
    fontSize: 14,
    cursorSyncEnabled: true,
    syntaxHighlightingEnabled: true,
    lineWrapping: true,
    showLineNumbers: false,
  },
  ui: {
    sidebarDefaultState: 'open',
    splitViewOrientation: 'auto',
    tocAutoCollapse: false,
    showFileInfo: true,
    compactMode: false,
  },
  performance: {
    enableVirtualScrolling: false,
    scrollSyncSensitivity: 5,
    largeFileWarning: 1024, // 1MB
    maxRecentFilesInMemory: 50,
  },
  version: '1.0.0',
};

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}