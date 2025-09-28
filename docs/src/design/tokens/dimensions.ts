/**
 * CoreTet Design System - Dimension Tokens
 * Exact dimension specifications from the design system
 */

export const dimensions = {
  // Mobile container
  mobile: {
    width: 375,
    height: 812,
  },

  // Component dimensions
  trackCard: {
    width: 343,
    height: 64,
  },

  button: {
    height: 44,
    heightSmall: 28,
  },

  input: {
    height: 44,
  },

  // Navigation dimensions
  tabBar: {
    height: 83,
    contentHeight: 49,
    bottomSafeArea: 34,
  },

  topNav: {
    height: 88,
    contentHeight: 44,
    statusBarHeight: 44,
  },

  // Icon dimensions
  icon: {
    default: 24,
    small: 16,
  },

  // Avatar dimensions
  avatar: 40,

  // Album art dimensions
  albumArt: {
    small: 56,
    large: 280,
  },

  // Border radius
  borderRadius: {
    card: 8,
    button: 20,
    buttonSmall: 4,
    input: 6,
    modal: 12,
    albumArt: 4,
  },

  // Grid dimensions
  ensemble: {
    gridColumns: 2,
    cardHeight: 120,
  },

  // List dimensions
  member: {
    rowHeight: 56,
    separatorHeight: 1,
  },
} as const;

export default dimensions;