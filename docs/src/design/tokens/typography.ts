/**
 * CoreTet Design System - Typography Tokens
 * Exact typography specifications from the design system
 */

export const typography = {
  // Font Family
  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',

  // Font Weights
  fontWeights: {
    ultralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Typography Scale
  giant: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: 200,
    letterSpacing: -1,
  },

  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 300,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 400,
    letterSpacing: 0,
  },

  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 500,
    letterSpacing: 0,
  },

  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 500,
    letterSpacing: 0,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    letterSpacing: 0,
  },

  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    letterSpacing: 0,
  },

  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
    letterSpacing: 0,
  },

  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    letterSpacing: 0,
  },

  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },

  // Input Typography
  input: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    letterSpacing: 0,
  },

  inputLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    letterSpacing: 0,
  },

  errorText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
    letterSpacing: 0,
  },

  // Navigation Typography
  navigation: {
    title: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: 600,
      letterSpacing: 0,
    },
    tabLabel: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: 500,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },
} as const;

export default typography;