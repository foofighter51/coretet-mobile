/**
 * CoreTet Design System - Spacing Tokens
 * Exact spacing specifications from the design system
 */

export const spacing = {
  // Base spacing scale (8px grid)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  // Component-specific spacing
  screen: {
    horizontal: 16,
    top: 24,
  },

  card: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  button: {
    paddingHorizontal: 16,
    paddingHorizontalSmall: 8,
    paddingVertical: 12,
  },

  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  // Template spacing
  section: 24,
  element: 8,

  // List view spacing
  list: {
    cardSpacing: 8,
    firstCardTop: 16,
    lastCardBottom: 16,
    pullRefreshPosition: -60,
    emptyStatePosition: '40%',
  },

  // Grid spacing
  grid: {
    gap: 12,
  },

  // Navigation spacing
  navigation: {
    paddingHorizontal: 16,
  },
} as const;

export default spacing;