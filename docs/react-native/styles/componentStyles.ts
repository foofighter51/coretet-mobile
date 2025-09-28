import { StyleSheet } from 'react-native';
import { tokens } from '../tokens';

// Component-specific styles organized by category
export const componentStyles = StyleSheet.create({
  // =============================================================================
  // TRACK CARD STYLES
  // =============================================================================
  trackCardContainer: {
    position: 'relative' as const,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
  },
  trackCardBase: {
    width: tokens.dimensions.trackCard.width,
    height: tokens.dimensions.trackCard.height,
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.card,
    ...tokens.shadows.default,
  },
  trackCardContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: tokens.spacing.md,
  },
  trackCardPlayButton: {
    width: tokens.dimensions.icon.default,
    height: tokens.dimensions.icon.default,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: tokens.spacing.md,
  },
  trackCardPlayIcon: {
    color: tokens.colors.primary.blue,
    fontSize: 16,
  },
  trackCardInfo: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  trackCardTitle: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.body.fontWeight,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.colors.neutral.charcoal,
    marginBottom: 2,
  },
  trackCardDuration: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.caption.fontSize,
    fontWeight: tokens.typography.caption.fontWeight,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.colors.neutral.gray,
  },
  trackCardRatingContainer: {
    width: tokens.dimensions.icon.default,
    height: tokens.dimensions.icon.default,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  trackCardRatingIcon: {
    fontSize: 16,
  },
  
  // Track Card States
  trackCardPlaying: {
    borderWidth: 2,
    borderColor: tokens.colors.primary.blue,
  },
  trackCardDisabled: {
    opacity: 0.5,
  },
  trackCardTitleDisabled: {
    color: tokens.colors.neutral.gray,
  },
  trackCardDurationDisabled: {
    color: tokens.colors.neutral.lightGray,
  },

  // Track Card Rating Buttons (Swipe Reveal)
  trackCardRatingButtons: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    height: tokens.dimensions.trackCard.height,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  trackCardRatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: tokens.spacing.sm,
  },
  trackCardLikeButton: {
    backgroundColor: tokens.colors.accent.teal,
  },
  trackCardLoveButton: {
    backgroundColor: tokens.colors.accent.coral,
  },
  trackCardRatingButtonIcon: {
    fontSize: 18,
    color: tokens.colors.neutral.white,
  },

  // =============================================================================
  // BUTTON STYLES
  // =============================================================================
  buttonBase: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: tokens.borderRadius.button,
    ...tokens.shadows.default,
  },
  buttonDefault: {
    height: tokens.dimensions.button.height,
    paddingHorizontal: tokens.spacing.lg,
  },
  buttonSmall: {
    height: tokens.dimensions.button.heightSmall,
    paddingHorizontal: tokens.spacing.sm,
  },
  
  // Button Variants
  buttonPrimary: {
    backgroundColor: tokens.colors.primary.blue,
  },
  buttonPrimaryActive: {
    backgroundColor: tokens.colors.primary.blueHover,
  },
  buttonPrimaryDisabled: {
    backgroundColor: tokens.colors.neutral.gray,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: tokens.colors.primary.blue,
  },
  buttonSecondaryActive: {
    backgroundColor: tokens.colors.primary.blueUltraLight,
  },
  buttonSecondaryDisabled: {
    borderColor: tokens.colors.neutral.gray,
  },

  // Button Text
  buttonTextBase: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.button.fontSize,
    fontWeight: tokens.typography.button.fontWeight,
    letterSpacing: tokens.typography.button.letterSpacing,
    textAlign: 'center' as const,
  },
  buttonTextPrimary: {
    color: tokens.colors.neutral.white,
  },
  buttonTextPrimaryDisabled: {
    color: tokens.colors.neutral.white,
  },
  buttonTextSecondary: {
    color: tokens.colors.primary.blue,
  },
  buttonTextSecondaryDisabled: {
    color: tokens.colors.neutral.gray,
  },

  // =============================================================================
  // INPUT STYLES
  // =============================================================================
  inputContainer: {
    marginBottom: tokens.spacing.lg,
  },
  inputLabel: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: '500' as const,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    color: tokens.colors.neutral.darkGray,
    marginBottom: tokens.spacing.xs,
  },
  inputLabelDisabled: {
    color: tokens.colors.neutral.gray,
  },
  inputFieldContainer: {
    borderRadius: tokens.borderRadius.input,
    backgroundColor: tokens.colors.neutral.white,
  },
  inputFieldContainerFocused: {
    borderWidth: 2,
    borderColor: tokens.colors.primary.blue,
  },
  inputFieldContainerError: {
    borderWidth: 2,
    borderColor: tokens.colors.system.error,
  },
  inputFieldContainerDisabled: {
    backgroundColor: tokens.colors.neutral.lightGray,
  },
  inputField: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.body.fontWeight,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.colors.neutral.charcoal,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    minHeight: 44,
  },
  inputFieldDisabled: {
    color: tokens.colors.neutral.gray,
  },
  inputFieldMultiline: {
    textAlignVertical: 'top' as const,
    paddingTop: tokens.spacing.md,
  },
  inputError: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.caption.fontSize,
    fontWeight: tokens.typography.caption.fontWeight,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.colors.system.error,
    marginTop: tokens.spacing.xs,
  },

  // =============================================================================
  // TAB BAR STYLES
  // =============================================================================
  tabBarContainer: {
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
  tabBarLabel: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 12,
    textAlign: 'center' as const,
  },
  tabBarLabelActive: {
    color: tokens.colors.primary.blue,
  },
  tabBarLabelInactive: {
    color: tokens.colors.neutral.gray,
  },
  tabBarLabelDisabled: {
    color: tokens.colors.neutral.lightGray,
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

  // =============================================================================
  // CARD STYLES
  // =============================================================================
  cardBase: {
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginVertical: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.lg,
  },
  cardDefault: {
    backgroundColor: tokens.colors.neutral.white,
    ...tokens.shadows.default,
  },
  cardElevated: {
    backgroundColor: tokens.colors.neutral.white,
    ...tokens.shadows.elevated,
  },
  cardOutlined: {
    backgroundColor: tokens.colors.neutral.white,
    borderWidth: 1,
    borderColor: tokens.colors.functional.border,
  },
  cardDisabled: {
    opacity: 0.5,
  },

  // =============================================================================
  // AVATAR STYLES
  // =============================================================================
  avatarBase: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  avatarDefault: {
    width: tokens.dimensions.avatar,
    height: tokens.dimensions.avatar,
    borderRadius: tokens.dimensions.avatar / 2,
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

  // =============================================================================
  // LOADING SPINNER STYLES
  // =============================================================================
  loadingSpinnerContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingSpinnerBase: {
    borderStyle: 'solid' as const,
  },

  // =============================================================================
  // EMPTY STATE STYLES
  // =============================================================================
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xxxl,
  },
  emptyStateContent: {
    alignItems: 'center' as const,
    maxWidth: 280,
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.primary.blueUltraLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: tokens.spacing.xl,
  },
  emptyStateIcon: {
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
  emptyStateActionContainer: {
    alignSelf: 'stretch' as const,
  },

  // =============================================================================
  // NAVIGATION STYLES
  // =============================================================================
  navigationContainer: {
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
  navigationTitle: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.navigation.title.fontSize,
    fontWeight: tokens.typography.navigation.title.fontWeight,
    lineHeight: tokens.typography.navigation.title.lineHeight,
    color: tokens.colors.navigation.title,
  },
  navigationBackButton: {
    color: tokens.colors.navigation.back,
  },
  navigationActionButton: {
    color: tokens.colors.navigation.action,
  },

  // =============================================================================
  // LIST VIEW STYLES
  // =============================================================================
  listViewContainer: {
    backgroundColor: tokens.colors.neutral.offWhite,
    flex: 1,
  },
  listViewContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  listViewItems: {
    flexDirection: 'column' as const,
    gap: tokens.spacing.sm,
  },

  // =============================================================================
  // UTILITY STYLES
  // =============================================================================
  // Flex utilities
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' as const },
  flexColumn: { flexDirection: 'column' as const },
  flexCenter: { 
    justifyContent: 'center' as const, 
    alignItems: 'center' as const 
  },
  flexBetween: { justifyContent: 'space-between' as const },
  flexStart: { justifyContent: 'flex-start' as const },
  flexEnd: { justifyContent: 'flex-end' as const },
  alignCenter: { alignItems: 'center' as const },
  alignStart: { alignItems: 'flex-start' as const },
  alignEnd: { alignItems: 'flex-end' as const },

  // Position utilities
  positionAbsolute: { position: 'absolute' as const },
  positionRelative: { position: 'relative' as const },

  // Text alignment
  textCenter: { textAlign: 'center' as const },
  textLeft: { textAlign: 'left' as const },
  textRight: { textAlign: 'right' as const },

  // Overflow
  overflowHidden: { overflow: 'hidden' as const },
  overflowVisible: { overflow: 'visible' as const },
});

export default componentStyles;