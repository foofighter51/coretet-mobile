/**
 * CoreTet Design System - React Native Design Tokens
 * Exact specifications converted for React Native
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

// Typography - Exact SF Pro Display Scale (React Native compatible)
export const typography = {
  fontFamily: {
    regular: 'SFProDisplay-Regular',
    ultraLight: 'SFProDisplay-Ultralight',
    light: 'SFProDisplay-Light',
    medium: 'SFProDisplay-Medium',
    semibold: 'SFProDisplay-Semibold',
    bold: 'SFProDisplay-Bold',
  },
  
  // Font Weights (React Native format)
  weights: {
    ultralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Font Sizes (React Native compatible)
  scales: {
    giant: { fontSize: 40, lineHeight: 48, fontWeight: '200' },
    h1: { fontSize: 32, lineHeight: 40, fontWeight: '300' },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '400' },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '500' },
    h4: { fontSize: 20, lineHeight: 28, fontWeight: '500' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    button: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  },
} as const;

// Spacing - Exact 8px Grid System (React Native compatible)
export const spacing = {
  xs: 4,   // 0.5 * 8px
  sm: 8,   // 1 * 8px
  md: 12,  // 1.5 * 8px
  lg: 16,  // 2 * 8px
  xl: 24,  // 3 * 8px
  xxl: 32, // 4 * 8px
  xxxl: 48, // 6 * 8px
} as const;

// Dimensions - Exact Component Sizes (React Native compatible)
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

// Shadows - React Native Compatible (using elevation for Android)
export const shadows = {
  default: {
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
  },
  elevated: {
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  },
} as const;

// Border Radius - React Native compatible
export const borderRadius = {
  card: 8,
  button: 20,
  input: 6,
  modal: 12,
  albumArt: 4,
} as const;

// Component Specifications - React Native optimized
export const components = {
  button: {
    primary: {
      height: dimensions.button.height,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.button,
      backgroundColor: colors.primary.blue,
      textColor: colors.neutral.white,
      fontSize: typography.scales.button.fontSize,
      fontWeight: typography.weights.semibold,
      fontFamily: typography.fontFamily.semibold,
    },
    secondary: {
      height: dimensions.button.height,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.button,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary.blue,
      textColor: colors.primary.blue,
      fontSize: typography.scales.button.fontSize,
      fontWeight: typography.weights.semibold,
      fontFamily: typography.fontFamily.semibold,
    },
    small: {
      height: dimensions.button.heightSmall,
      paddingHorizontal: spacing.sm,
      borderRadius: 4,
      fontSize: typography.scales.button.fontSize,
      fontWeight: typography.weights.semibold,
      fontFamily: typography.fontFamily.semibold,
    },
  },
  
  input: {
    height: dimensions.input.height,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    fontSize: typography.scales.body.fontSize,
    fontWeight: typography.weights.normal,
    fontFamily: typography.fontFamily.regular,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border,
    placeholderTextColor: colors.neutral.gray,
  },
  
  trackCard: {
    width: dimensions.trackCard.width,
    height: dimensions.trackCard.height,
    borderRadius: borderRadius.card,
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
    albumArtSize: dimensions.albumArt.small,
    iconSize: dimensions.icon.default,
  },
  
  tabBar: {
    height: dimensions.tabBar.height,
    contentHeight: dimensions.tabBar.contentHeight,
    backgroundColor: colors.neutral.white,
    iconSize: dimensions.icon.default,
    labelFontSize: 10,
    labelFontWeight: typography.weights.medium,
    labelFontFamily: typography.fontFamily.medium,
    activeColor: colors.primary.blue,
    inactiveColor: colors.neutral.gray,
    badgeColor: colors.accent.coral,
  },
  
  text: {
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.charcoal,
  },
} as const;

// Layout System - React Native compatible
export const layout = {
  screen: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.neutral.offWhite,
  },
  section: {
    marginBottom: spacing.xl,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.card,
  },
  list: {
    backgroundColor: colors.neutral.offWhite,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
} as const;

// Utility functions for React Native
export const utils = {
  // Get platform-specific shadow
  getShadow: (shadowKey: keyof typeof shadows) => {
    const shadow = shadows[shadowKey];
    return {
      ...shadow.ios,
      elevation: shadow.android.elevation,
    };
  },
  
  // Get typography style
  getTypography: (variant: keyof typeof typography.scales) => {
    const scale = typography.scales[variant];
    return {
      fontSize: scale.fontSize,
      lineHeight: scale.lineHeight,
      fontWeight: scale.fontWeight as any,
      fontFamily: typography.fontFamily.regular,
    };
  },
  
  // Get spacing value
  getSpacing: (key: keyof typeof spacing) => spacing[key],
  
  // Get color value
  getColor: (path: string) => {
    const keys = path.split('.');
    let value: any = colors;
    for (const key of keys) {
      value = value[key];
    }
    return value;
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
  utils,
} as const;

// Type definitions
export type ColorKeys = keyof typeof colors;
export type SpacingKeys = keyof typeof spacing;
export type TypographyVariant = keyof typeof typography.scales;
export type ShadowKeys = keyof typeof shadows;

export default designTokens;