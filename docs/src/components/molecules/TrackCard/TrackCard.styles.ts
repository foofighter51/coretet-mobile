/**
 * TrackCard Component Styles
 * CoreTet Design System
 */

import { colors, dimensions, spacing, shadows } from '@/design';

export const trackCardStyles = {
  container: {
    position: 'relative' as const,
    marginLeft: spacing.card.marginHorizontal,
    marginRight: spacing.card.marginHorizontal,
    marginTop: spacing.card.marginVertical,
    marginBottom: spacing.card.marginVertical,
    touchAction: 'pan-y' as const,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
  },

  card: {
    width: dimensions.trackCard.width,
    height: dimensions.trackCard.height,
    backgroundColor: colors.neutral.white,
    borderRadius: dimensions.borderRadius.card,
    boxShadow: shadows.default.boxShadow,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },

  cardPlaying: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.primary.blue,
    boxShadow: `0 0 0 1px ${colors.primary.blue}, ${shadows.default.boxShadow}`,
  },

  cardDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  cardPressed: {
    transform: 'translateY(1px)',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
  },

  // Card content layout
  content: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    position: 'relative' as const,
    zIndex: 2,
  },

  // Play button
  playButton: {
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    marginRight: spacing.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.primary.blue,
    fontSize: 16,
    transition: 'transform 0.1s ease',
    flexShrink: 0,
  },

  playButtonPressed: {
    transform: 'scale(0.9)',
  },

  // Album art
  albumArt: {
    width: dimensions.albumArt.small,
    height: dimensions.albumArt.small,
    borderRadius: dimensions.borderRadius.albumArt,
    objectFit: 'cover' as const,
    marginRight: spacing.md,
    flexShrink: 0,
    backgroundColor: colors.neutral.lightGray,
  },

  // Track info section
  trackInfo: {
    flex: 1,
    minWidth: 0, // Allow shrinking for text overflow
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    lineHeight: '20px',
    fontWeight: 400,
    color: colors.neutral.charcoal,
    marginBottom: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  titleDisabled: {
    color: colors.neutral.gray,
  },

  artist: {
    fontSize: 14,
    lineHeight: '16px',
    fontWeight: 400,
    color: colors.neutral.gray,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  duration: {
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    color: colors.neutral.gray,
    marginLeft: spacing.md,
    flexShrink: 0,
    minWidth: 'auto',
  },

  durationDisabled: {
    color: colors.neutral.lightGray,
  },

  // Rating display
  ratingContainer: {
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    flexShrink: 0,
  },

  ratingIcon: {
    fontSize: 16,
    lineHeight: 1,
  },

  // Swipe rating buttons (revealed on swipe)
  ratingButtons: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.md,
    zIndex: 1,
  },

  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 18,
    color: colors.neutral.white,
    transition: 'transform 0.1s ease, opacity 0.2s ease',
    flexShrink: 0,
  },

  ratingButtonPressed: {
    transform: 'scale(0.9)',
  },

  likeButton: {
    backgroundColor: colors.accent.teal,
  },

  loveButton: {
    backgroundColor: colors.accent.coral,
  },

  // Swipe animations
  swipeContainer: {
    position: 'relative' as const,
    transform: 'translateX(0px)',
    transition: 'transform 0.2s ease',
  },

  swipeActive: {
    transition: 'none', // Disable transition during active swipe
  },

  // Comment button (if enabled)
  commentButton: {
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.neutral.gray,
    marginLeft: spacing.xs,
    flexShrink: 0,
    transition: 'color 0.2s ease',
  },

  commentButtonHover: {
    color: colors.neutral.darkGray,
  },

  // Loading state
  loading: {
    opacity: 0.7,
    pointerEvents: 'none' as const,
  },

  // Skeleton loading
  skeleton: {
    background: `linear-gradient(90deg, ${colors.neutral.lightGray} 25%, transparent 37%, ${colors.neutral.lightGray} 63%)`,
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
  },

  // Swipe hint (tutorial)
  swipeHint: {
    position: 'absolute' as const,
    top: '50%',
    right: spacing.md,
    transform: 'translateY(-50%)',
    fontSize: 12,
    color: colors.neutral.gray,
    pointerEvents: 'none' as const,
    opacity: 0.6,
    animation: 'fadeInOut 2s ease-in-out infinite',
  },
} as const;

// CSS animations (would be in a CSS file in a real implementation)
export const trackCardAnimations = `
  @keyframes shimmer {
    0% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
`;

export default trackCardStyles;