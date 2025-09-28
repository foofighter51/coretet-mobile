/**
 * Button Component Styles
 * CoreTet Design System
 */

import { colors, typography, dimensions, shadows, spacing } from '@/design';

export const buttonStyles = {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.borderRadius.button,
    fontFamily: typography.fontFamily,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: `${typography.button.lineHeight}px`,
    letterSpacing: typography.button.letterSpacing,
    textTransform: typography.button.textTransform,
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    userSelect: 'none' as const,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation' as const,
  },

  // Size variants
  sizes: {
    default: {
      height: dimensions.button.height,
      paddingLeft: spacing.button.paddingHorizontal,
      paddingRight: spacing.button.paddingHorizontal,
      minWidth: 'auto',
    },
    small: {
      height: dimensions.button.heightSmall,
      paddingLeft: spacing.button.paddingHorizontalSmall,
      paddingRight: spacing.button.paddingHorizontalSmall,
      borderRadius: dimensions.borderRadius.buttonSmall,
      minWidth: 'auto',
    },
  },

  // Style variants
  variants: {
    primary: {
      backgroundColor: colors.button.primaryBackground,
      color: colors.button.primaryText,
      boxShadow: shadows.default.boxShadow,
    },
    primaryHover: {
      backgroundColor: colors.button.primaryBackgroundActive,
    },
    primaryDisabled: {
      backgroundColor: colors.neutral.gray,
      color: colors.button.primaryText,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },

    secondary: {
      backgroundColor: colors.button.secondaryBackground,
      color: colors.button.secondaryText,
      border: `1px solid ${colors.button.secondaryBorder}`,
      boxShadow: 'none',
    },
    secondaryHover: {
      backgroundColor: colors.button.secondaryBackgroundActive,
    },
    secondaryDisabled: {
      borderColor: colors.neutral.gray,
      color: colors.neutral.gray,
      cursor: 'not-allowed',
    },
  },

  // Loading state
  loading: {
    opacity: 0.7,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
  },

  // Icon styles
  icon: {
    marginRight: spacing.xs,
    width: dimensions.icon.small,
    height: dimensions.icon.small,
    flexShrink: 0,
  },

  iconOnly: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },

  // Active state (for touch feedback)
  active: {
    transform: 'translateY(1px)',
  },
} as const;

export default buttonStyles;