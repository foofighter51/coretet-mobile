/**
 * AudioPlayer Component Styles
 * CoreTet Design System
 */

import { colors, dimensions, spacing, shadows } from '@/design';

export const audioPlayerStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: spacing.lg,
  },

  container: {
    width: '100%',
    maxWidth: dimensions.mobile.width,
    backgroundColor: colors.neutral.white,
    borderRadius: dimensions.borderRadius.modal,
    boxShadow: shadows.elevated.boxShadow,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.functional.divider}`,
  },

  closeButton: {
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.neutral.gray,
    fontSize: 18,
    transition: 'color 0.2s ease',
  },

  closeButtonHover: {
    color: colors.neutral.darkGray,
  },

  // Track info section
  trackInfo: {
    padding: spacing.xl,
    textAlign: 'center' as const,
    borderBottom: `1px solid ${colors.functional.divider}`,
  },

  albumArt: {
    width: dimensions.albumArt.large,
    height: dimensions.albumArt.large,
    borderRadius: dimensions.borderRadius.albumArt,
    objectFit: 'cover' as const,
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.lightGray,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  trackTitle: {
    marginBottom: spacing.xs,
    color: colors.neutral.charcoal,
  },

  trackArtist: {
    color: colors.neutral.gray,
    marginBottom: spacing.sm,
  },

  trackEnsemble: {
    color: colors.neutral.gray,
    fontSize: 14,
  },

  // Progress section
  progressSection: {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.functional.divider}`,
  },

  progressBar: {
    position: 'relative' as const,
    height: 6,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 3,
    marginBottom: spacing.md,
    cursor: 'pointer',
    overflow: 'hidden' as const,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.blue,
    borderRadius: 3,
    transition: 'width 0.1s ease',
  },

  progressHandle: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 16,
    height: 16,
    backgroundColor: colors.primary.blue,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  progressHandleActive: {
    transform: 'translate(-50%, -50%) scale(1.2)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },

  timeDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: colors.neutral.gray,
    fontSize: 12,
  },

  // Controls section
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },

  controlButton: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: 20,
    color: colors.neutral.darkGray,
    backgroundColor: 'transparent',
  },

  controlButtonHover: {
    backgroundColor: colors.neutral.lightGray,
    transform: 'scale(1.05)',
  },

  controlButtonPressed: {
    transform: 'scale(0.95)',
  },

  playPauseButton: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary.blue,
    color: colors.neutral.white,
    fontSize: 24,
    boxShadow: shadows.default.boxShadow,
  },

  playPauseButtonHover: {
    backgroundColor: colors.primary.blueHover,
    transform: 'scale(1.05)',
  },

  playPauseButtonPressed: {
    transform: 'scale(0.95)',
  },

  // Volume section (if enabled)
  volumeSection: {
    padding: spacing.lg,
    paddingTop: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },

  volumeIcon: {
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    color: colors.neutral.gray,
    flexShrink: 0,
  },

  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 2,
    position: 'relative' as const,
    cursor: 'pointer',
  },

  volumeFill: {
    height: '100%',
    backgroundColor: colors.primary.blue,
    borderRadius: 2,
    transition: 'width 0.1s ease',
  },

  volumeHandle: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 12,
    height: 12,
    backgroundColor: colors.primary.blue,
    borderRadius: '50%',
    cursor: 'pointer',
  },

  // Loading state
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    color: colors.neutral.gray,
  },

  // Error state
  error: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    textAlign: 'center' as const,
    color: colors.system.error,
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  errorMessage: {
    marginBottom: spacing.lg,
  },

  // Animation states
  fadeIn: {
    animation: 'fadeIn 0.3s ease',
  },

  fadeOut: {
    animation: 'fadeOut 0.3s ease',
  },

  slideUp: {
    animation: 'slideUp 0.3s ease',
  },

  slideDown: {
    animation: 'slideDown 0.3s ease',
  },
} as const;

// CSS animations that would be in a CSS file
export const audioPlayerAnimations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  }
`;

export default audioPlayerStyles;