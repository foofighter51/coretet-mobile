/**
 * CoreTet Design System - Color Tokens
 * Exact color specifications from the design system
 */

export const colors = {
  // Primary Colors
  primary: {
    blue: '#0088cc',
    blueHover: '#006ba6',
    blueLight: '#e8f4f8',
    blueUltraLight: '#f5fafe',
    foreground: '#ffffff',
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    offWhite: '#fafbfc',
    lightGray: '#f4f5f7',
    gray: '#9da7b0',
    darkGray: '#586069',
    charcoal: '#1e252b',
  },

  // Functional Colors
  functional: {
    border: '#e1e4e8',
    divider: '#f0f1f3',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },

  // Accent Colors
  accent: {
    teal: '#17a2b8',
    amber: '#ffc107',
    green: '#28a745',
    coral: '#fd7e14',
  },

  // System Colors
  system: {
    error: '#dc3545',
    errorBackground: '#f8d7da',
    errorBorder: '#f5c6cb',
    warning: '#ffc107',
    success: '#28a745',
  },

  // Navigation Colors
  navigation: {
    title: '#1e252b',
    back: '#0088cc',
    action: '#586069',
    tabActive: '#0088cc',
    tabInactive: '#9da7b0',
    tabBadge: '#fd7e14',
  },

  // Button Colors
  button: {
    primaryBackground: '#0088cc',
    primaryBackgroundActive: '#006ba6',
    primaryText: '#ffffff',
    secondaryBackground: 'transparent',
    secondaryBackgroundActive: '#f5fafe',
    secondaryBorder: '#0088cc',
    secondaryText: '#0088cc',
  },

  // Input Colors
  input: {
    background: '#ffffff',
    border: '#e1e4e8',
    borderFocus: '#0088cc',
    borderError: '#dc3545',
    placeholder: '#9da7b0',
  },

  // Upload Zone Colors
  upload: {
    background: '#f5fafe',
    backgroundHover: '#e8f4f8',
  },
} as const;

export default colors;