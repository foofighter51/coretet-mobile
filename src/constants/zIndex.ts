/**
 * Z-Index Constants
 *
 * Centralized z-index values to prevent conflicts and ensure proper stacking order.
 * Use these constants instead of hardcoding z-index values.
 */

export const Z_INDEX = {
  // Base layer
  BASE: 0,

  // Fixed UI elements (bottom of screen)
  PLAYBACK_BAR: 99,
  FIXED_BOTTOM_NAV: 100,

  // Dropdowns and popovers
  DROPDOWN: 1000,

  // Modals
  MODAL: 1500,
  MODAL_STACKED: 1600, // For modals that appear above other modals (e.g., CreateInvite above BandSettings)

  // High-priority overlays
  TOAST: 2000,
  TUTORIAL: 2500,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
