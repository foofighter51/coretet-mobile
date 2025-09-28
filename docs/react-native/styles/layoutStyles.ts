import { StyleSheet } from 'react-native';
import { tokens } from '../tokens';

// Layout and spacing specific styles
export const layoutStyles = StyleSheet.create({
  // =============================================================================
  // SCREEN LAYOUTS
  // =============================================================================
  screenContainer: {
    flex: 1,
    backgroundColor: tokens.colors.neutral.offWhite,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
  },
  screenContentWithPadding: {
    flex: 1,
    padding: tokens.spacing.lg,
  },
  screenContentCentered: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: tokens.spacing.lg,
  },

  // Mobile-specific container
  mobileContainer: {
    width: tokens.dimensions.mobile.width,
    height: tokens.dimensions.mobile.height,
    backgroundColor: tokens.colors.neutral.offWhite,
    marginHorizontal: 'auto' as const,
    overflow: 'hidden' as const,
  },

  // =============================================================================
  // SECTION LAYOUTS
  // =============================================================================
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionWithPadding: {
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.lg,
  },
  sectionHeader: {
    marginBottom: tokens.spacing.lg,
  },
  sectionContent: {
    flex: 1,
  },

  // =============================================================================
  // CARD LAYOUTS
  // =============================================================================
  cardContainer: {
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
  },
  cardContent: {
    padding: tokens.spacing.md,
  },
  cardContentLarge: {
    padding: tokens.spacing.lg,
  },
  cardHeader: {
    marginBottom: tokens.spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardFooter: {
    marginTop: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.functional.divider,
  },

  // =============================================================================
  // GRID LAYOUTS
  // =============================================================================
  gridContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: tokens.spacing.lg,
  },
  gridItem2Columns: {
    width: '48%',
    marginBottom: tokens.spacing.md,
  },
  gridItem3Columns: {
    width: '31%',
    marginBottom: tokens.spacing.md,
  },
  
  // Ensemble grid (from design system)
  ensembleGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  ensembleGridItem: {
    width: '48%', // 2 columns with gap
    height: 120,
    marginBottom: tokens.spacing.md,
  },

  // =============================================================================
  // LIST LAYOUTS
  // =============================================================================
  listContainer: {
    backgroundColor: tokens.colors.neutral.offWhite,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    marginBottom: tokens.spacing.sm,
  },
  listItemLast: {
    marginBottom: 0,
  },
  listSeparator: {
    height: 1,
    backgroundColor: tokens.colors.functional.divider,
    marginVertical: tokens.spacing.sm,
  },

  // Member list (from design system)
  memberListContainer: {
    backgroundColor: tokens.colors.neutral.white,
  },
  memberListItem: {
    height: 56,
    backgroundColor: tokens.colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.functional.divider,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: tokens.spacing.lg,
  },
  memberListItemLast: {
    borderBottomWidth: 0,
  },

  // =============================================================================
  // FORM LAYOUTS
  // =============================================================================
  formContainer: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.xl,
  },
  formSection: {
    marginBottom: tokens.spacing.xl,
  },
  formField: {
    marginBottom: tokens.spacing.lg,
  },
  formFieldGroup: {
    flexDirection: 'row' as const,
    gap: tokens.spacing.md,
  },
  formFieldGroupItem: {
    flex: 1,
  },
  formActions: {
    marginTop: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },

  // =============================================================================
  // NAVIGATION LAYOUTS
  // =============================================================================
  navigationContainer: {
    height: 88,
    backgroundColor: tokens.colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.functional.divider,
  },
  navigationContent: {
    height: 44,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: 44, // Status bar height
  },
  navigationLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  navigationCenter: {
    flex: 1,
    alignItems: 'center' as const,
  },
  navigationRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // Tab bar layout
  tabBarContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 83,
    backgroundColor: tokens.colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.functional.divider,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row' as const,
    paddingBottom: 34, // Safe area
  },
  tabBarSafeArea: {
    backgroundColor: tokens.colors.neutral.white,
  },

  // =============================================================================
  // MODAL LAYOUTS
  // =============================================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: tokens.spacing.lg,
  },
  modalContainer: {
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.modal,
    padding: tokens.spacing.lg,
    maxWidth: '90%',
    maxHeight: '80%',
    ...tokens.shadows.elevated,
  },
  modalHeader: {
    marginBottom: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.functional.divider,
  },
  modalBody: {
    flex: 1,
  },
  modalFooter: {
    marginTop: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.functional.divider,
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: tokens.spacing.md,
  },

  // =============================================================================
  // SPACING UTILITIES
  // =============================================================================
  // Padding utilities
  paddingXS: { padding: tokens.spacing.xs },
  paddingSM: { padding: tokens.spacing.sm },
  paddingMD: { padding: tokens.spacing.md },
  paddingLG: { padding: tokens.spacing.lg },
  paddingXL: { padding: tokens.spacing.xl },
  paddingXXL: { padding: tokens.spacing.xxl },
  paddingXXXL: { padding: tokens.spacing.xxxl },

  // Horizontal padding
  paddingHorizontalXS: { paddingHorizontal: tokens.spacing.xs },
  paddingHorizontalSM: { paddingHorizontal: tokens.spacing.sm },
  paddingHorizontalMD: { paddingHorizontal: tokens.spacing.md },
  paddingHorizontalLG: { paddingHorizontal: tokens.spacing.lg },
  paddingHorizontalXL: { paddingHorizontal: tokens.spacing.xl },
  paddingHorizontalXXL: { paddingHorizontal: tokens.spacing.xxl },
  paddingHorizontalXXXL: { paddingHorizontal: tokens.spacing.xxxl },

  // Vertical padding
  paddingVerticalXS: { paddingVertical: tokens.spacing.xs },
  paddingVerticalSM: { paddingVertical: tokens.spacing.sm },
  paddingVerticalMD: { paddingVertical: tokens.spacing.md },
  paddingVerticalLG: { paddingVertical: tokens.spacing.lg },
  paddingVerticalXL: { paddingVertical: tokens.spacing.xl },
  paddingVerticalXXL: { paddingVertical: tokens.spacing.xxl },
  paddingVerticalXXXL: { paddingVertical: tokens.spacing.xxxl },

  // Margin utilities
  marginXS: { margin: tokens.spacing.xs },
  marginSM: { margin: tokens.spacing.sm },
  marginMD: { margin: tokens.spacing.md },
  marginLG: { margin: tokens.spacing.lg },
  marginXL: { margin: tokens.spacing.xl },
  marginXXL: { margin: tokens.spacing.xxl },
  marginXXXL: { margin: tokens.spacing.xxxl },

  // Horizontal margins
  marginHorizontalXS: { marginHorizontal: tokens.spacing.xs },
  marginHorizontalSM: { marginHorizontal: tokens.spacing.sm },
  marginHorizontalMD: { marginHorizontal: tokens.spacing.md },
  marginHorizontalLG: { marginHorizontal: tokens.spacing.lg },
  marginHorizontalXL: { marginHorizontal: tokens.spacing.xl },
  marginHorizontalXXL: { marginHorizontal: tokens.spacing.xxl },
  marginHorizontalXXXL: { marginHorizontal: tokens.spacing.xxxl },

  // Vertical margins
  marginVerticalXS: { marginVertical: tokens.spacing.xs },
  marginVerticalSM: { marginVertical: tokens.spacing.sm },
  marginVerticalMD: { marginVertical: tokens.spacing.md },
  marginVerticalLG: { marginVertical: tokens.spacing.lg },
  marginVerticalXL: { marginVertical: tokens.spacing.xl },
  marginVerticalXXL: { marginVertical: tokens.spacing.xxl },
  marginVerticalXXXL: { marginVertical: tokens.spacing.xxxl },

  // Bottom margins (common for spacing elements)
  marginBottomXS: { marginBottom: tokens.spacing.xs },
  marginBottomSM: { marginBottom: tokens.spacing.sm },
  marginBottomMD: { marginBottom: tokens.spacing.md },
  marginBottomLG: { marginBottom: tokens.spacing.lg },
  marginBottomXL: { marginBottom: tokens.spacing.xl },
  marginBottomXXL: { marginBottom: tokens.spacing.xxl },
  marginBottomXXXL: { marginBottom: tokens.spacing.xxxl },

  // Top margins
  marginTopXS: { marginTop: tokens.spacing.xs },
  marginTopSM: { marginTop: tokens.spacing.sm },
  marginTopMD: { marginTop: tokens.spacing.md },
  marginTopLG: { marginTop: tokens.spacing.lg },
  marginTopXL: { marginTop: tokens.spacing.xl },
  marginTopXXL: { marginTop: tokens.spacing.xxl },
  marginTopXXXL: { marginTop: tokens.spacing.xxxl },

  // =============================================================================
  // GAP UTILITIES (for newer React Native versions with gap support)
  // =============================================================================
  gapXS: { gap: tokens.spacing.xs },
  gapSM: { gap: tokens.spacing.sm },
  gapMD: { gap: tokens.spacing.md },
  gapLG: { gap: tokens.spacing.lg },
  gapXL: { gap: tokens.spacing.xl },
  gapXXL: { gap: tokens.spacing.xxl },
  gapXXXL: { gap: tokens.spacing.xxxl },

  // Row gap
  rowGapXS: { rowGap: tokens.spacing.xs },
  rowGapSM: { rowGap: tokens.spacing.sm },
  rowGapMD: { rowGap: tokens.spacing.md },
  rowGapLG: { rowGap: tokens.spacing.lg },
  rowGapXL: { rowGap: tokens.spacing.xl },
  rowGapXXL: { rowGap: tokens.spacing.xxl },
  rowGapXXXL: { rowGap: tokens.spacing.xxxl },

  // Column gap
  columnGapXS: { columnGap: tokens.spacing.xs },
  columnGapSM: { columnGap: tokens.spacing.sm },
  columnGapMD: { columnGap: tokens.spacing.md },
  columnGapLG: { columnGap: tokens.spacing.lg },
  columnGapXL: { columnGap: tokens.spacing.xl },
  columnGapXXL: { columnGap: tokens.spacing.xxl },
  columnGapXXXL: { columnGap: tokens.spacing.xxxl },

  // =============================================================================
  // FLEX UTILITIES
  // =============================================================================
  flex0: { flex: 0 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  flex4: { flex: 4 },

  // Flex direction
  flexRow: { flexDirection: 'row' as const },
  flexColumn: { flexDirection: 'column' as const },
  flexRowReverse: { flexDirection: 'row-reverse' as const },
  flexColumnReverse: { flexDirection: 'column-reverse' as const },

  // Justify content
  justifyStart: { justifyContent: 'flex-start' as const },
  justifyEnd: { justifyContent: 'flex-end' as const },
  justifyCenter: { justifyContent: 'center' as const },
  justifyBetween: { justifyContent: 'space-between' as const },
  justifyAround: { justifyContent: 'space-around' as const },
  justifyEvenly: { justifyContent: 'space-evenly' as const },

  // Align items
  alignStart: { alignItems: 'flex-start' as const },
  alignEnd: { alignItems: 'flex-end' as const },
  alignCenter: { alignItems: 'center' as const },
  alignStretch: { alignItems: 'stretch' as const },
  alignBaseline: { alignItems: 'baseline' as const },

  // Align self
  selfStart: { alignSelf: 'flex-start' as const },
  selfEnd: { alignSelf: 'flex-end' as const },
  selfCenter: { alignSelf: 'center' as const },
  selfStretch: { alignSelf: 'stretch' as const },
  selfBaseline: { alignSelf: 'baseline' as const },

  // Flex wrap
  flexWrap: { flexWrap: 'wrap' as const },
  flexNoWrap: { flexWrap: 'nowrap' as const },
  flexWrapReverse: { flexWrap: 'wrap-reverse' as const },

  // Common flex combinations
  flexCenter: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  flexBetween: {
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  flexBetweenStart: {
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  flexBetweenEnd: {
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
  },

  // =============================================================================
  // POSITION UTILITIES
  // =============================================================================
  positionAbsolute: { position: 'absolute' as const },
  positionRelative: { position: 'relative' as const },

  // Absolute positioning helpers
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  absoluteTop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
  },
  absoluteBottom: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
  },
  absoluteLeft: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    bottom: 0,
  },
  absoluteRight: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
  },

  // =============================================================================
  // DIMENSION UTILITIES
  // =============================================================================
  // Width utilities
  widthFull: { width: '100%' },
  widthHalf: { width: '50%' },
  widthThird: { width: '33.333%' },
  widthTwoThirds: { width: '66.666%' },
  widthQuarter: { width: '25%' },
  widthThreeQuarters: { width: '75%' },

  // Height utilities
  heightFull: { height: '100%' },
  heightHalf: { height: '50%' },
  heightThird: { height: '33.333%' },
  heightTwoThirds: { height: '66.666%' },
  heightQuarter: { height: '25%' },
  heightThreeQuarters: { height: '75%' },

  // Component-specific dimensions (from design system)
  trackCardWidth: { width: tokens.dimensions.trackCard.width },
  trackCardHeight: { height: tokens.dimensions.trackCard.height },
  buttonHeight: { height: tokens.dimensions.button.height },
  buttonHeightSmall: { height: tokens.dimensions.button.heightSmall },
  iconSize: { 
    width: tokens.dimensions.icon.default, 
    height: tokens.dimensions.icon.default 
  },
  iconSizeSmall: { 
    width: tokens.dimensions.icon.small, 
    height: tokens.dimensions.icon.small 
  },
  avatarSize: { 
    width: tokens.dimensions.avatar, 
    height: tokens.dimensions.avatar 
  },

  // =============================================================================
  // OVERFLOW UTILITIES
  // =============================================================================
  overflowHidden: { overflow: 'hidden' as const },
  overflowVisible: { overflow: 'visible' as const },
  overflowScroll: { overflow: 'scroll' as const },

  // =============================================================================
  // BORDER UTILITIES
  // =============================================================================
  borderRadius: { borderRadius: tokens.borderRadius.card },
  borderRadiusButton: { borderRadius: tokens.borderRadius.button },
  borderRadiusInput: { borderRadius: tokens.borderRadius.input },
  borderRadiusModal: { borderRadius: tokens.borderRadius.modal },

  border: {
    borderWidth: 1,
    borderColor: tokens.colors.functional.border,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.functional.border,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.functional.border,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: tokens.colors.functional.border,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: tokens.colors.functional.border,
  },
});

export default layoutStyles;