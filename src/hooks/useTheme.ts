import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface UseThemeReturn {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  // Calculate actual theme based on theme setting
  const calculateActualTheme = useCallback(
    (themeValue: Theme): 'light' | 'dark' => {
      if (themeValue === 'auto') {
        return getSystemTheme();
      }
      return themeValue;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback((actualThemeValue: 'light' | 'dark') => {
    document.documentElement.classList.toggle(
      'dark',
      actualThemeValue === 'dark'
    );
  }, []);

  // Set theme and persist
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem('markdownviewer-theme', newTheme);

      const newActualTheme = calculateActualTheme(newTheme);
      setActualTheme(newActualTheme);
      applyTheme(newActualTheme);
    },
    [calculateActualTheme, applyTheme]
  );

  // Toggle between light and dark (not auto)
  const toggleTheme = useCallback(() => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [actualTheme, setTheme]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('markdownviewer-theme') as Theme;
    const initialTheme = savedTheme || 'auto';

    const initialActualTheme = calculateActualTheme(initialTheme);

    setThemeState(initialTheme);
    setActualTheme(initialActualTheme);
    applyTheme(initialActualTheme);
  }, [calculateActualTheme, applyTheme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const newActualTheme = getSystemTheme();
      setActualTheme(newActualTheme);
      applyTheme(newActualTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getSystemTheme, applyTheme]);

  return {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };
};
