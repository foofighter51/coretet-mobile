/**
 * CoreTet Design System - Complete Design Tokens
 * Final cleaned version with exact specifications
 */

// Colors - Exact CoreTet Palette
export const colors = {
  // Primary Colors
  primary: {
    blue: '#0088cc',
    blueHover: '#006ba6', 
    blueLight: '#e8f4f8',
    blueUltraLight: '#f5fafe',
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
    success: '#28a745',
    warning: '#ffc107',
  },
  
  // Special Use Colors
  border: '#e1e4e8',
  divider: '#f0f1f3',
} as const;

// Typography - Exact SF Pro Display Scale
export const typography = {
  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
  
  // Font Weights (only allowed values)
  weights: {
    ultralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Font Sizes with Line Heights (exact baseline grid)
  scales: {
    giant: { size: 40, lineHeight: 48, weight: 200 },
    h1: { size: 32, lineHeight: 40, weight: 300 },
    h2: { size: 24, lineHeight: 32, weight: 400 },
    h3: { size: 20, lineHeight: 28, weight: 500 },
    h4: { size: 20, lineHeight: 28, weight: 500 },
    body: { size: 16, lineHeight: 24, weight: 400 },
    bodySmall: { size: 14, lineHeight: 20, weight: 400 },
    caption: { size: 12, lineHeight: 16, weight: 400 },
    label: { size: 14, lineHeight: 20, weight: 500 },
    button: { size: 14, lineHeight: 20, weight: 600 },
  },
} as const;

// Spacing - Exact 8px Grid System
export const spacing = {
  xs: 4,   // 0.5 * 8px
  sm: 8,   // 1 * 8px
  md: 12,  // 1.5 * 8px
  lg: 16,  // 2 * 8px
  xl: 24,  // 3 * 8px
  xxl: 32, // 4 * 8px
  xxxl: 48, // 6 * 8px
} as const;

// Dimensions - Exact Component Sizes
export const dimensions = {
  mobile: { width: 375, height: 812 },
  trackCard: { width: 343, height: 64 },
  tabBar: { height: 83, contentHeight: 49 },
  topNav: { height: 88, contentHeight: 44 },
  albumArt: { small: 56, large: 280 },
  button: { height: 44, heightSmall: 28 },
  icon: { default: 24, small: 16 },
  avatar: 40,
  input: { height: 44 },
} as const;

// Shadows - Only Two Allowed Shadows
export const shadows = {
  default: {
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
    css: 'box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);',
  },
  elevated: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    css: 'box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);',
  },
} as const;

// Border Radius - Exact Values
export const borderRadius = {
  card: 8,
  button: 20,
  input: 6,
  modal: 12,
  albumArt: 4,
} as const;

// Component Specifications
export const components = {
  button: {
    primary: {
      height: dimensions.button.height,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.button,
      backgroundColor: colors.primary.blue,
      backgroundColorActive: colors.primary.blueHover,
      textColor: colors.neutral.white,
      fontSize: typography.scales.button.size,
      fontWeight: typography.weights.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    secondary: {
      height: dimensions.button.height,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.button,
      backgroundColor: 'transparent',
      backgroundColorActive: colors.primary.blueUltraLight,
      borderColor: colors.primary.blue,
      textColor: colors.primary.blue,
      fontSize: typography.scales.button.size,
      fontWeight: typography.weights.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    small: {
      height: dimensions.button.heightSmall,
      paddingHorizontal: spacing.sm,
      borderRadius: 4,
      fontSize: typography.scales.button.size,
      fontWeight: typography.weights.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  
  input: {
    height: dimensions.input.height,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    fontSize: typography.scales.body.size,
    fontWeight: typography.weights.normal,
    backgroundColor: colors.neutral.white,
    borderColor: colors.border,
    borderColorFocus: colors.primary.blue,
    borderColorError: colors.system.error,
    placeholderColor: colors.neutral.gray,
  },
  
  trackCard: {
    width: dimensions.trackCard.width,
    height: dimensions.trackCard.height,
    borderRadius: borderRadius.card,
    backgroundColor: colors.neutral.white,
    shadow: shadows.default.boxShadow,
    padding: spacing.md,
    albumArtSize: dimensions.albumArt.small,
    iconSize: dimensions.icon.default,
  },
  
  tabBar: {
    height: dimensions.tabBar.height,
    contentHeight: dimensions.tabBar.contentHeight,
    backgroundColor: colors.neutral.white,
    shadow: shadows.elevated.boxShadow,
    iconSize: dimensions.icon.default,
    labelSize: 10,
    labelWeight: typography.weights.medium,
    activeColor: colors.primary.blue,
    inactiveColor: colors.neutral.gray,
    badgeColor: colors.accent.coral,
  },
} as const;

// Layout System
export const layout = {
  screen: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
  list: {
    backgroundColor: colors.neutral.offWhite,
    itemSpacing: spacing.sm,
    firstItemTop: spacing.lg,
    lastItemBottom: spacing.lg,
  },
} as const;

// Export all tokens
export const designTokens = {
  colors,
  typography,
  spacing,
  dimensions,
  shadows,
  borderRadius,
  components,
  layout,
} as const;

export default designTokens;