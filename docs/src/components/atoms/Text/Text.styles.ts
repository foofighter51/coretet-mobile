/**
 * Text Component Styles
 * CoreTet Design System
 */

import { colors, typography } from '@/design';

export const textStyles = {
  base: {
    margin: 0,
    padding: 0,
    fontFamily: typography.fontFamily,
  },

  variants: {
    giant: {
      fontSize: typography.giant.fontSize,
      lineHeight: `${typography.giant.lineHeight}px`,
      fontWeight: typography.giant.fontWeight,
      letterSpacing: typography.giant.letterSpacing,
    },

    h1: {
      fontSize: typography.h1.fontSize,
      lineHeight: `${typography.h1.lineHeight}px`,
      fontWeight: typography.h1.fontWeight,
      letterSpacing: typography.h1.letterSpacing,
    },

    h2: {
      fontSize: typography.h2.fontSize,
      lineHeight: `${typography.h2.lineHeight}px`,
      fontWeight: typography.h2.fontWeight,
      letterSpacing: typography.h2.letterSpacing,
    },

    h3: {
      fontSize: typography.h3.fontSize,
      lineHeight: `${typography.h3.lineHeight}px`,
      fontWeight: typography.h3.fontWeight,
      letterSpacing: typography.h3.letterSpacing,
    },

    h4: {
      fontSize: typography.h4.fontSize,
      lineHeight: `${typography.h4.lineHeight}px`,
      fontWeight: typography.h4.fontWeight,
      letterSpacing: typography.h4.letterSpacing,
    },

    body: {
      fontSize: typography.body.fontSize,
      lineHeight: `${typography.body.lineHeight}px`,
      fontWeight: typography.body.fontWeight,
      letterSpacing: typography.body.letterSpacing,
    },

    bodySmall: {
      fontSize: typography.bodySmall.fontSize,
      lineHeight: `${typography.bodySmall.lineHeight}px`,
      fontWeight: typography.bodySmall.fontWeight,
      letterSpacing: typography.bodySmall.letterSpacing,
    },

    caption: {
      fontSize: typography.caption.fontSize,
      lineHeight: `${typography.caption.lineHeight}px`,
      fontWeight: typography.caption.fontWeight,
      letterSpacing: typography.caption.letterSpacing,
    },

    label: {
      fontSize: typography.label.fontSize,
      lineHeight: `${typography.label.lineHeight}px`,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
    },

    button: {
      fontSize: typography.button.fontSize,
      lineHeight: `${typography.button.lineHeight}px`,
      fontWeight: typography.button.fontWeight,
      letterSpacing: typography.button.letterSpacing,
      textTransform: typography.button.textTransform,
    },
  },

  colors: {
    primary: { color: colors.neutral.charcoal },
    secondary: { color: colors.neutral.gray },
    darkGray: { color: colors.neutral.darkGray },
    accent: { color: colors.primary.blue },
    error: { color: colors.system.error },
    success: { color: colors.system.success },
    warning: { color: colors.system.warning },
    white: { color: colors.neutral.white },
  },

  align: {
    left: { textAlign: 'left' as const },
    center: { textAlign: 'center' as const },
    right: { textAlign: 'right' as const },
    justify: { textAlign: 'justify' as const },
  },

  decoration: {
    none: { textDecoration: 'none' },
    underline: { textDecoration: 'underline' },
    lineThrough: { textDecoration: 'line-through' },
  },

  transform: {
    none: { textTransform: 'none' as const },
    uppercase: { textTransform: 'uppercase' as const },
    lowercase: { textTransform: 'lowercase' as const },
    capitalize: { textTransform: 'capitalize' as const },
  },

  weight: {
    ultralight: { fontWeight: typography.fontWeights.ultralight },
    light: { fontWeight: typography.fontWeights.light },
    normal: { fontWeight: typography.fontWeights.normal },
    medium: { fontWeight: typography.fontWeights.medium },
    semibold: { fontWeight: typography.fontWeights.semibold },
    bold: { fontWeight: typography.fontWeights.bold },
  },

  // Utility styles
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  noSelect: {
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
  },
} as const;

export default textStyles;