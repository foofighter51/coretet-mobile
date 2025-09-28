/**
 * CoreTet Design System - Shadow Tokens
 * Exact shadow specifications from the design system
 */

export const shadows = {
  // Default shadow for cards and buttons
  default: {
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
    // React Native equivalent
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  // Elevated shadow for modals and overlays
  elevated: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    // React Native equivalent
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  // Legacy shadow names for compatibility
  subtle: {
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  card: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  // No shadow
  none: {
    boxShadow: 'none',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

export default shadows;