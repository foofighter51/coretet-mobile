import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { designTokens } from './designTokens';
import { darkTheme } from './darkTheme';

export const useDesignTokens = () => {
  const { isDarkMode } = useTheme();

  return useMemo(() => {
    if (isDarkMode) {
      // Merge dark theme colors with base design tokens
      return {
        ...designTokens,
        colors: darkTheme.colors
      };
    }
    return designTokens;
  }, [isDarkMode]);
};
