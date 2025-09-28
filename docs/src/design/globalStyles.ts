/**
 * CoreTet Design System - Global Styles
 * Utility classes and global style definitions
 */

import { colors, typography, spacing, shadows, dimensions } from './tokens';

export const globalStyles = {
  // Container styles
  screen: {
    width: dimensions.mobile.width,
    height: dimensions.mobile.height,
    backgroundColor: colors.neutral.offWhite,
    margin: '0 auto',
    overflow: 'hidden' as const,
  },

  screenContent: {
    paddingLeft: spacing.screen.horizontal,
    paddingRight: spacing.screen.horizontal,
    paddingTop: spacing.screen.top,
  },

  // Card styles
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: dimensions.borderRadius.card,
    padding: spacing.card.padding,
    marginLeft: spacing.card.marginHorizontal,
    marginRight: spacing.card.marginHorizontal,
    marginTop: spacing.card.marginVertical,
    marginBottom: spacing.card.marginVertical,
    boxShadow: shadows.default.boxShadow,
  },

  cardElevated: {
    backgroundColor: colors.neutral.white,
    borderRadius: dimensions.borderRadius.card,
    padding: spacing.card.padding,
    marginLeft: spacing.card.marginHorizontal,
    marginRight: spacing.card.marginHorizontal,
    marginTop: spacing.card.marginVertical,
    marginBottom: spacing.card.marginVertical,
    boxShadow: shadows.elevated.boxShadow,
  },

  // Typography styles
  text: {
    giant: {
      fontFamily: typography.fontFamily,
      fontSize: typography.giant.fontSize,
      lineHeight: `${typography.giant.lineHeight}px`,
      fontWeight: typography.giant.fontWeight,
      letterSpacing: typography.giant.letterSpacing,
      color: colors.neutral.charcoal,
    },

    h1: {
      fontFamily: typography.fontFamily,
      fontSize: typography.h1.fontSize,
      lineHeight: `${typography.h1.lineHeight}px`,
      fontWeight: typography.h1.fontWeight,
      letterSpacing: typography.h1.letterSpacing,
      color: colors.neutral.charcoal,
    },

    h2: {
      fontFamily: typography.fontFamily,
      fontSize: typography.h2.fontSize,
      lineHeight: `${typography.h2.lineHeight}px`,
      fontWeight: typography.h2.fontWeight,
      letterSpacing: typography.h2.letterSpacing,
      color: colors.neutral.charcoal,
    },

    h3: {
      fontFamily: typography.fontFamily,
      fontSize: typography.h3.fontSize,
      lineHeight: `${typography.h3.lineHeight}px`,
      fontWeight: typography.h3.fontWeight,
      letterSpacing: typography.h3.letterSpacing,
      color: colors.neutral.charcoal,
    },

    body: {
      fontFamily: typography.fontFamily,
      fontSize: typography.body.fontSize,
      lineHeight: `${typography.body.lineHeight}px`,
      fontWeight: typography.body.fontWeight,
      letterSpacing: typography.body.letterSpacing,
      color: colors.neutral.charcoal,
    },

    bodySmall: {
      fontFamily: typography.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      lineHeight: `${typography.bodySmall.lineHeight}px`,
      fontWeight: typography.bodySmall.fontWeight,
      letterSpacing: typography.bodySmall.letterSpacing,
      color: colors.neutral.darkGray,
    },

    caption: {
      fontFamily: typography.fontFamily,
      fontSize: typography.caption.fontSize,
      lineHeight: `${typography.caption.lineHeight}px`,
      fontWeight: typography.caption.fontWeight,
      letterSpacing: typography.caption.letterSpacing,
      color: colors.neutral.gray,
    },

    button: {
      fontFamily: typography.fontFamily,
      fontSize: typography.button.fontSize,
      lineHeight: `${typography.button.lineHeight}px`,
      fontWeight: typography.button.fontWeight,
      letterSpacing: typography.button.letterSpacing,
      textTransform: typography.button.textTransform,
    },
  },

  // Layout utilities
  flex: {
    row: { display: 'flex', flexDirection: 'row' as const },
    column: { display: 'flex', flexDirection: 'column' as const },
    center: { 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    between: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    wrap: { flexWrap: 'wrap' as const },
    nowrap: { flexWrap: 'nowrap' as const },
  },

  // Spacing utilities
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    xxl: spacing.xxl,
    xxxl: spacing.xxxl,
  },

  // Common color utilities
  colors: {
    background: {
      primary: { backgroundColor: colors.primary.blue },
      white: { backgroundColor: colors.neutral.white },
      offWhite: { backgroundColor: colors.neutral.offWhite },
      lightGray: { backgroundColor: colors.neutral.lightGray },
    },
    text: {
      primary: { color: colors.neutral.charcoal },
      secondary: { color: colors.neutral.gray },
      accent: { color: colors.primary.blue },
      error: { color: colors.system.error },
    },
  },

  // Common dimensions
  dimensions: {
    mobile: {
      width: dimensions.mobile.width,
      height: dimensions.mobile.height,
    },
    trackCard: {
      width: dimensions.trackCard.width,
      height: dimensions.trackCard.height,
    },
    button: {
      height: dimensions.button.height,
      heightSmall: dimensions.button.heightSmall,
    },
    icon: {
      width: dimensions.icon.default,
      height: dimensions.icon.default,
    },
    iconSmall: {
      width: dimensions.icon.small,
      height: dimensions.icon.small,
    },
  },
} as const;

export default globalStyles;