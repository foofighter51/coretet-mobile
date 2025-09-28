import { StyleSheet } from 'react-native';
import { tokens } from '../tokens';

export const globalStyles = StyleSheet.create({
  // EXACT Container Styles
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.neutral.offWhite,
  },
  screenContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
  },
  mobileContainer: {
    width: tokens.dimensions.mobile.width,
    height: tokens.dimensions.mobile.height,
    backgroundColor: tokens.colors.neutral.offWhite,
  },

  // EXACT Card Styles
  card: {
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
    ...tokens.shadows.default,
  },
  cardElevated: {
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
    ...tokens.shadows.elevated,
  },
  cardOutlined: {
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.functional.border,
  },

  // EXACT Typography Styles
  textGiant: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.giant.fontSize,
    lineHeight: tokens.typography.giant.lineHeight,
    fontWeight: tokens.typography.giant.fontWeight,
    letterSpacing: tokens.typography.giant.letterSpacing,
    color: tokens.colors.neutral.charcoal,
  },
  h1: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.h1.fontSize,
    lineHeight: tokens.typography.h1.lineHeight,
    fontWeight: tokens.typography.h1.fontWeight,
    letterSpacing: tokens.typography.h1.letterSpacing,
    color: tokens.colors.neutral.charcoal,
  },
  h2: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.h2.fontSize,
    lineHeight: tokens.typography.h2.lineHeight,
    fontWeight: tokens.typography.h2.fontWeight,
    letterSpacing: tokens.typography.h2.letterSpacing,
    color: tokens.colors.neutral.charcoal,
  },
  h3: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.h3.fontSize,
    lineHeight: tokens.typography.h3.lineHeight,
    fontWeight: tokens.typography.h3.fontWeight,
    letterSpacing: tokens.typography.h3.letterSpacing,
    color: tokens.colors.neutral.charcoal,
  },
  h4: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.h4.fontSize,
    lineHeight: tokens.typography.h4.lineHeight,
    fontWeight: tokens.typography.h4.fontWeight,
    letterSpacing: tokens.typography.h4.letterSpacing,
    color: tokens.colors.neutral.charcoal,
  },
  body: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
    fontWeight: tokens.typography.body.fontWeight,
    letterSpacing: tokens.typography.body.letterSpacing,
    color: tokens.colors.neutral.darkGray,
  },
  bodySmall: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.bodySmall.fontSize,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    fontWeight: tokens.typography.bodySmall.fontWeight,
    letterSpacing: tokens.typography.bodySmall.letterSpacing,
    color: tokens.colors.neutral.darkGray,
  },
  caption: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: tokens.typography.caption.fontWeight,
    letterSpacing: tokens.typography.caption.letterSpacing,
    color: tokens.colors.neutral.gray,
  },
  label: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.label.fontSize,
    lineHeight: tokens.typography.label.lineHeight,
    fontWeight: tokens.typography.label.fontWeight,
    letterSpacing: tokens.typography.label.letterSpacing,
    color: tokens.colors.neutral.darkGray,
  },

  // EXACT Button Typography
  buttonText: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.button.fontSize,
    lineHeight: tokens.typography.button.lineHeight,
    fontWeight: tokens.typography.button.fontWeight,
    letterSpacing: tokens.typography.button.letterSpacing,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
  },

  // EXACT Navigation Typography
  navTitle: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.navigation.title.fontSize,
    lineHeight: tokens.typography.navigation.title.lineHeight,
    fontWeight: tokens.typography.navigation.title.fontWeight,
    letterSpacing: tokens.typography.navigation.title.letterSpacing,
    color: tokens.colors.navigation.title,
  },
  tabLabel: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.navigation.tabLabel.fontSize,
    lineHeight: tokens.typography.navigation.tabLabel.lineHeight,
    fontWeight: tokens.typography.navigation.tabLabel.fontWeight,
    letterSpacing: tokens.typography.navigation.tabLabel.letterSpacing,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
  },

  // EXACT Button Styles
  buttonPrimary: {
    height: tokens.dimensions.button.height,
    paddingHorizontal: tokens.spacing.lg,
    backgroundColor: tokens.colors.button.primaryBackground,
    borderRadius: tokens.borderRadius.button,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...tokens.shadows.default,
  },
  buttonPrimaryPressed: {
    backgroundColor: tokens.colors.button.primaryBackgroundActive,
  },
  buttonPrimaryDisabled: {
    backgroundColor: tokens.colors.neutral.gray,
  },
  buttonSecondary: {
    height: tokens.dimensions.button.height,
    paddingHorizontal: tokens.spacing.lg,
    backgroundColor: tokens.colors.button.secondaryBackground,
    borderWidth: 1,
    borderColor: tokens.colors.button.secondaryBorder,
    borderRadius: tokens.borderRadius.button,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  buttonSecondaryPressed: {
    backgroundColor: tokens.colors.button.secondaryBackgroundActive,
  },
  buttonSecondaryDisabled: {
    borderColor: tokens.colors.neutral.gray,
  },
  buttonSmall: {
    height: tokens.dimensions.button.heightSmall,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: 4,
  },

  // EXACT Button Text Styles
  buttonTextPrimary: {
    color: tokens.colors.button.primaryText,
  },
  buttonTextPrimaryDisabled: {
    color: tokens.colors.neutral.white,
  },
  buttonTextSecondary: {
    color: tokens.colors.button.secondaryText,
  },
  buttonTextSecondaryDisabled: {
    color: tokens.colors.neutral.gray,
  },

  // EXACT Input Styles
  inputContainer: {
    marginBottom: tokens.spacing.lg,
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: tokens.colors.input.border,
    borderRadius: tokens.borderRadius.input,
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: tokens.colors.input.background,
    fontSize: tokens.typography.input.fontSize,
    fontWeight: tokens.typography.input.fontWeight,
    lineHeight: tokens.typography.input.lineHeight,
    color: tokens.colors.neutral.charcoal,
    fontFamily: tokens.typography.fontFamily,
  },
  inputFieldFocused: {
    borderWidth: 2,
    borderColor: tokens.colors.input.borderFocus,
  },
  inputFieldError: {
    borderWidth: 2,
    borderColor: tokens.colors.input.borderError,
  },
  inputFieldDisabled: {
    backgroundColor: tokens.colors.neutral.lightGray,
    color: tokens.colors.neutral.gray,
  },
  inputLabel: {
    fontSize: tokens.typography.inputLabel.fontSize,
    fontWeight: tokens.typography.inputLabel.fontWeight,
    lineHeight: tokens.typography.inputLabel.lineHeight,
    color: tokens.colors.neutral.darkGray,
    marginBottom: tokens.spacing.xs,
    fontFamily: tokens.typography.fontFamily,
  },
  inputLabelDisabled: {
    color: tokens.colors.neutral.gray,
  },
  inputError: {
    fontSize: tokens.typography.errorText.fontSize,
    fontWeight: tokens.typography.errorText.fontWeight,
    lineHeight: tokens.typography.errorText.lineHeight,
    color: tokens.colors.system.error,
    marginTop: tokens.spacing.xs,
    fontFamily: tokens.typography.fontFamily,
  },

  // EXACT TrackCard Styles
  trackCard: {
    width: tokens.dimensions.trackCard.width,
    height: tokens.dimensions.trackCard.height,
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.card,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
    ...tokens.shadows.default,
  },
  trackCardContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: tokens.spacing.md,
  },
  trackCardPlaying: {
    borderWidth: 2,
    borderColor: tokens.colors.primary.blue,
  },
  trackCardDisabled: {
    opacity: 0.5,
  },

  // EXACT TabBar Styles
  tabBar: {
    flexDirection: 'row' as const,
    height: 83,
    backgroundColor: tokens.colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.functional.divider,
    paddingBottom: 34, // Safe area bottom
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  tabBarContent: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.card,
    minWidth: 60,
  },
  tabBarIconContainer: {
    position: 'relative' as const,
    marginBottom: 2,
  },
  tabBarIcon: {
    fontSize: tokens.dimensions.icon.default,
    textAlign: 'center' as const,
  },
  tabBarBadge: {
    position: 'absolute' as const,
    top: -6,
    right: -8,
    backgroundColor: tokens.colors.accent.coral,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 4,
  },
  tabBarBadgeText: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: 9,
    fontWeight: '600' as const,
    color: tokens.colors.neutral.white,
    lineHeight: 12,
  },

  // EXACT Avatar Styles
  avatar: {
    width: tokens.dimensions.avatar,
    height: tokens.dimensions.avatar,
    borderRadius: tokens.dimensions.avatar / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontFamily: tokens.typography.fontFamily,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    color: tokens.colors.neutral.white,
  },

  // EXACT Navigation Styles
  navigationBar: {
    height: 88,
    backgroundColor: tokens.colors.neutral.white,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: 44, // Status bar height
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.functional.divider,
  },
  navigationContent: {
    height: 44,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    flex: 1,
  },
  navigationBack: {
    color: tokens.colors.navigation.back,
  },
  navigationAction: {
    color: tokens.colors.navigation.action,
  },

  // EXACT List View Styles
  listContainer: {
    backgroundColor: tokens.colors.neutral.offWhite,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  listContent: {
    flexDirection: 'column' as const,
    gap: tokens.spacing.sm,
  },
  listEmptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xxxl,
  },

  // EXACT EmptyState Styles
  emptyStateContainer: {
    alignItems: 'center' as const,
    maxWidth: 280,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.primary.blueUltraLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: tokens.spacing.xl,
  },
  emptyStateIconText: {
    fontSize: 32,
    color: tokens.colors.primary.blue,
  },
  emptyStateTitle: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.h3.fontWeight,
    lineHeight: tokens.typography.h3.lineHeight,
    color: tokens.colors.neutral.charcoal,
    textAlign: 'center' as const,
    marginBottom: tokens.spacing.md,
  },
  emptyStateDescription: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: tokens.typography.bodySmall.fontWeight,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    color: tokens.colors.neutral.gray,
    textAlign: 'center' as const,
    marginBottom: tokens.spacing.xl,
  },

  // EXACT Loading Spinner Styles
  loadingContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // EXACT Error Styles
  errorContainer: {
    backgroundColor: tokens.colors.system.errorBackground,
    borderColor: tokens.colors.system.errorBorder,
    borderWidth: 1,
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
  },
  errorText: {
    color: tokens.colors.system.error,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: tokens.typography.bodySmall.fontWeight,
    lineHeight: tokens.typography.bodySmall.lineHeight,
  },

  // EXACT Success Styles
  successContainer: {
    backgroundColor: tokens.colors.accent.green,
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
  },
  successText: {
    color: tokens.colors.neutral.white,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: tokens.typography.bodySmall.fontWeight,
    lineHeight: tokens.typography.bodySmall.lineHeight,
  },

  // EXACT Upload Styles
  uploadContainer: {
    backgroundColor: tokens.colors.upload.background,
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.xl,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  uploadContainerHover: {
    backgroundColor: tokens.colors.upload.backgroundHover,
  },

  // EXACT Section Spacing
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionSpacing: {
    paddingVertical: tokens.spacing.xl,
  },

  // EXACT Utility Classes
  flexRow: {
    flexDirection: 'row' as const,
  },
  flexColumn: {
    flexDirection: 'column' as const,
  },
  flexCenter: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  flexBetween: {
    justifyContent: 'space-between' as const,
  },
  flexStart: {
    justifyContent: 'flex-start' as const,
  },
  flexEnd: {
    justifyContent: 'flex-end' as const,
  },
  alignCenter: {
    alignItems: 'center' as const,
  },
  alignStart: {
    alignItems: 'flex-start' as const,
  },
  alignEnd: {
    alignItems: 'flex-end' as const,
  },

  // EXACT Spacing Utilities
  spacingXS: {
    padding: tokens.spacing.xs,
  },
  spacingSM: {
    padding: tokens.spacing.sm,
  },
  spacingMD: {
    padding: tokens.spacing.md,
  },
  spacingLG: {
    padding: tokens.spacing.lg,
  },
  spacingXL: {
    padding: tokens.spacing.xl,
  },
  spacingXXL: {
    padding: tokens.spacing.xxl,
  },
  spacingXXXL: {
    padding: tokens.spacing.xxxl,
  },

  // EXACT Margin Utilities
  marginXS: {
    margin: tokens.spacing.xs,
  },
  marginSM: {
    margin: tokens.spacing.sm,
  },
  marginMD: {
    margin: tokens.spacing.md,
  },
  marginLG: {
    margin: tokens.spacing.lg,
  },
  marginXL: {
    margin: tokens.spacing.xl,
  },
  marginXXL: {
    margin: tokens.spacing.xxl,
  },
  marginXXXL: {
    margin: tokens.spacing.xxxl,
  },

  // EXACT Background Colors
  backgroundPrimary: {
    backgroundColor: tokens.colors.primary.blue,
  },
  backgroundSecondary: {
    backgroundColor: tokens.colors.neutral.offWhite,
  },
  backgroundCard: {
    backgroundColor: tokens.colors.neutral.white,
  },
  backgroundError: {
    backgroundColor: tokens.colors.system.errorBackground,
  },
  backgroundSuccess: {
    backgroundColor: tokens.colors.accent.green,
  },

  // EXACT Text Colors
  textPrimary: {
    color: tokens.colors.neutral.charcoal,
  },
  textSecondary: {
    color: tokens.colors.neutral.gray,
  },
  textAccent: {
    color: tokens.colors.primary.blue,
  },
  textError: {
    color: tokens.colors.system.error,
  },
  textSuccess: {
    color: tokens.colors.accent.green,
  },
  textWhite: {
    color: tokens.colors.neutral.white,
  },

  // EXACT Border Utilities
  borderDefault: {
    borderWidth: 1,
    borderColor: tokens.colors.functional.border,
  },
  borderError: {
    borderWidth: 1,
    borderColor: tokens.colors.system.error,
  },
  borderPrimary: {
    borderWidth: 1,
    borderColor: tokens.colors.primary.blue,
  },

  // EXACT Radius Utilities
  radiusCard: {
    borderRadius: tokens.borderRadius.card,
  },
  radiusButton: {
    borderRadius: tokens.borderRadius.button,
  },
  radiusInput: {
    borderRadius: tokens.borderRadius.input,
  },
  radiusModal: {
    borderRadius: tokens.borderRadius.modal,
  },
});

export default globalStyles;