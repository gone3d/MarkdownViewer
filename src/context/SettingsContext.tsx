import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, SettingsContextType } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'markdownviewer-settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings added in updates
        const mergedSettings = mergeWithDefaults(parsed);
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      // Fall back to defaults if parsing fails
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const mergeWithDefaults = (stored: Partial<AppSettings>): AppSettings => {
    return {
      fileManagement: { ...DEFAULT_SETTINGS.fileManagement, ...stored.fileManagement },
      editor: { ...DEFAULT_SETTINGS.editor, ...stored.editor },
      ui: { ...DEFAULT_SETTINGS.ui, ...stored.ui },
      performance: { ...DEFAULT_SETTINGS.performance, ...stored.performance },
      version: stored.version || DEFAULT_SETTINGS.version,
    };
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      
      // Deep merge for nested objects
      if (updates.fileManagement) {
        newSettings.fileManagement = { ...prevSettings.fileManagement, ...updates.fileManagement };
      }
      if (updates.editor) {
        newSettings.editor = { ...prevSettings.editor, ...updates.editor };
      }
      if (updates.ui) {
        newSettings.ui = { ...prevSettings.ui, ...updates.ui };
      }
      if (updates.performance) {
        newSettings.performance = { ...prevSettings.performance, ...updates.performance };
      }
      if (updates.version) {
        newSettings.version = updates.version;
      }

      return newSettings;
    });
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const parsed = JSON.parse(settingsJson);
      const mergedSettings = mergeWithDefaults(parsed);
      setSettings(mergedSettings);
      return true;
    } catch (error) {
      console.warn('Failed to import settings:', error);
      return false;
    }
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};