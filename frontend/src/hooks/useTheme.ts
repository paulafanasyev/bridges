import { useState, useEffect, useCallback } from 'react';
import { ThemeConfig, ThemeId } from '../types';
import { themes, getDefaultThemeForGender, applyTheme } from '../themes';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes.tiger);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem('theme_id') as ThemeId | null;
      if (savedThemeId && themes[savedThemeId]) {
        setCurrentTheme(themes[savedThemeId]);
        applyTheme(themes[savedThemeId]);
      } else {
        applyTheme(themes.tiger);
      }
    }
  }, []);

  const switchTheme = useCallback((themeId: ThemeId) => {
    const theme = themes[themeId];
    if (!theme) return;
    setCurrentTheme(theme);
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme_id', themeId);
    }
  }, []);

  const setThemeForGender = useCallback((gender: 'male' | 'female') => {
    const defaultTheme = getDefaultThemeForGender(gender);
    switchTheme(defaultTheme.id);
  }, [switchTheme]);

  return { currentTheme, switchTheme, setThemeForGender };
}