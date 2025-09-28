import tokens from '../tokens.json';

// Extract and type the design tokens according to actual JSON structure
export const designTokens = {
  colors: {
    primary: {
      blue: tokens.tokens.colors.primary.blue.value,
      blueHover: tokens.tokens.colors.primary.blueHover.value,
      blueLight: tokens.tokens.colors.primary.blueLight.value,
      blueUltraLight: tokens.tokens.colors.primary.blueUltraLight.value
    },
    neutral: {
      white: tokens.tokens.colors.neutral.white.value,
      offWhite: tokens.tokens.colors.neutral.offWhite.value,
      lightGray: tokens.tokens.colors.neutral.lightGray.value,
      gray: tokens.tokens.colors.neutral.gray.value,
      darkGray: tokens.tokens.colors.neutral.darkGray.value,
      charcoal: tokens.tokens.colors.neutral.charcoal.value
    },
    accent: {
      teal: tokens.tokens.colors.accent.teal.value,
      coral: tokens.tokens.colors.accent.coral.value
    },
    system: {
      error: tokens.tokens.colors.system.error.value,
      warning: tokens.tokens.colors.system.warning.value,
      success: tokens.tokens.colors.system.success.value
    }
  },
  typography: {
    fontFamily: tokens.tokens.typography.fontFamily.value,
    fontSizes: {
      giant: tokens.tokens.typography.fontSizes.giant.value,
      h1: tokens.tokens.typography.fontSizes.h1.value,
      h2: tokens.tokens.typography.fontSizes.h2.value,
      h3: tokens.tokens.typography.fontSizes.h3.value,
      body: tokens.tokens.typography.fontSizes.body.value,
      bodySmall: tokens.tokens.typography.fontSizes.bodySmall.value,
      caption: tokens.tokens.typography.fontSizes.caption.value,
      button: tokens.tokens.typography.fontSizes.button.value
    },
    lineHeights: {
      giant: tokens.tokens.typography.lineHeights.giant.value,
      h1: tokens.tokens.typography.lineHeights.h1.value,
      h2: tokens.tokens.typography.lineHeights.h2.value,
      h3: tokens.tokens.typography.lineHeights.h3.value,
      body: tokens.tokens.typography.lineHeights.body.value,
      bodySmall: tokens.tokens.typography.lineHeights.bodySmall.value,
      caption: tokens.tokens.typography.lineHeights.caption.value,
      button: tokens.tokens.typography.lineHeights.button.value
    },
    fontWeights: {
      ultralight: tokens.tokens.typography.fontWeights.ultralight.value,
      light: tokens.tokens.typography.fontWeights.light.value,
      normal: tokens.tokens.typography.fontWeights.normal.value,
      medium: tokens.tokens.typography.fontWeights.medium.value,
      semibold: tokens.tokens.typography.fontWeights.semibold.value,
      bold: tokens.tokens.typography.fontWeights.bold.value
    }
  },
  spacing: {
    xs: tokens.tokens.spacing.xs.value,
    sm: tokens.tokens.spacing.sm.value,
    md: tokens.tokens.spacing.md.value,
    lg: tokens.tokens.spacing.lg.value,
    xl: tokens.tokens.spacing.xl.value,
    xxl: tokens.tokens.spacing.xxl.value,
    xxxl: tokens.tokens.spacing.xxxl.value
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%'
  }
};

// Add semantic colors
designTokens.colors.semantic = {
  success: designTokens.colors.system.success,
  error: designTokens.colors.system.error,
  warning: designTokens.colors.system.warning
};