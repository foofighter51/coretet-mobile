/**
 * Input Component Styles
 * CoreTet Design System
 */

import { colors, typography, dimensions, spacing } from '@/design';

export const inputStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    marginBottom: spacing.lg,
  },

  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.inputLabel.fontSize,
    lineHeight: `${typography.inputLabel.lineHeight}px`,
    fontWeight: typography.inputLabel.fontWeight,
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
    display: 'block',
  },

  labelDisabled: {
    color: colors.neutral.gray,
  },

  field: {
    height: dimensions.input.height,
    paddingLeft: spacing.input.paddingHorizontal,
    paddingRight: spacing.input.paddingHorizontal,
    borderRadius: dimensions.borderRadius.input,
    border: `1px solid ${colors.input.border}`,
    backgroundColor: colors.input.background,
    fontFamily: typography.fontFamily,
    fontSize: typography.input.fontSize,
    lineHeight: `${typography.input.lineHeight}px`,
    fontWeight: typography.input.fontWeight,
    color: colors.neutral.charcoal,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },

  fieldFocused: {
    borderWidth: 2,
    borderColor: colors.input.borderFocus,
  },

  fieldError: {
    borderWidth: 2,
    borderColor: colors.input.borderError,
  },

  fieldDisabled: {
    backgroundColor: colors.neutral.lightGray,
    color: colors.neutral.gray,
    cursor: 'not-allowed',
  },

  fieldWithIcon: {
    paddingLeft: spacing.xl + spacing.md, // Icon width + spacing
  },

  placeholder: {
    color: colors.input.placeholder,
  },

  // Textarea specific styles
  textarea: {
    minHeight: 80,
    paddingTop: spacing.input.paddingVertical,
    paddingBottom: spacing.input.paddingVertical,
    resize: 'vertical' as const,
    lineHeight: `${typography.body.lineHeight}px`,
  },

  // Error message styles
  errorMessage: {
    fontFamily: typography.fontFamily,
    fontSize: typography.errorText.fontSize,
    lineHeight: `${typography.errorText.lineHeight}px`,
    fontWeight: typography.errorText.fontWeight,
    color: colors.system.error,
    marginTop: spacing.xs,
    display: 'block',
  },

  // Icon styles
  iconContainer: {
    position: 'absolute' as const,
    left: spacing.md,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input wrapper (for positioning icon)
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },

  // Search input styles
  searchIcon: {
    color: colors.neutral.gray,
    width: dimensions.icon.default,
    height: dimensions.icon.default,
  },

  // Clear button styles
  clearButton: {
    position: 'absolute' as const,
    right: spacing.md,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    color: colors.neutral.gray,
  },

  clearButtonHover: {
    color: colors.neutral.darkGray,
  },
} as const;

export default inputStyles;