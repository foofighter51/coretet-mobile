import { useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { designTokens } from './designTokens';
import { darkTheme } from './darkTheme';

export const useDesignTokens = () => {
  // Use useContext directly to check if ThemeProvider exists
  const context = useContext(ThemeContext);

  // If no ThemeProvider (e.g., early app loading), default to light mode
  const isDarkMode = context?.isDarkMode ?? false;

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
