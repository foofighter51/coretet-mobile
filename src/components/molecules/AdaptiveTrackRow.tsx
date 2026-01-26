import React from 'react';
import { useIsDesktop } from '../../hooks/useResponsive';
import { SwipeableTrackRow } from './SwipeableTrackRow';
import { DesktopTrackRow } from './DesktopTrackRow';

interface AdaptiveTrackRowProps {
  track: {
    id: string;
    title: string;
    duration_seconds?: number;
    folder_path?: string;
  };
  isPlaying: boolean;
  currentRating?: 'liked' | 'loved' | null;
  aggregatedRatings?: {
    liked: number;
    loved: number;
  };
  hasComments?: boolean;
  hasUnreadComments?: boolean;
  onPlayPause: () => void;
  onRate: (rating: 'liked' | 'loved') => void;
  /** Mobile: triggered by long press. Desktop: triggered by click */
  onOpenDetails?: () => void;
  /** Desktop only: triggered by delete button */
  onDelete?: () => void;
  /** Whether this track is currently being deleted */
  isDeleting?: boolean;
}

/**
 * AdaptiveTrackRow - Responsive track row component
 *
 * Desktop (>= 1024px):
 * - Uses DesktopTrackRow with hover actions
 * - Delete button appears on hover
 * - Click opens track details
 *
 * Mobile (< 1024px):
 * - Uses SwipeableTrackRow with swipe gestures
 * - Long press opens track details
 * - Swipe reveals rating buttons
 */
export const AdaptiveTrackRow: React.FC<AdaptiveTrackRowProps> = ({
  track,
  isPlaying,
  currentRating,
  aggregatedRatings,
  hasComments,
  hasUnreadComments,
  onPlayPause,
  onRate,
  onOpenDetails,
  onDelete,
  isDeleting,
}) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <DesktopTrackRow
        track={track}
        isPlaying={isPlaying}
        currentRating={currentRating}
        aggregatedRatings={aggregatedRatings}
        hasComments={hasComments}
        hasUnreadComments={hasUnreadComments}
        onPlayPause={onPlayPause}
        onRate={onRate}
        onDelete={onDelete}
        onClick={onOpenDetails}
        isDeleting={isDeleting}
      />
    );
  }

  return (
    <SwipeableTrackRow
      track={track}
      isPlaying={isPlaying}
      currentRating={currentRating}
      aggregatedRatings={aggregatedRatings}
      hasComments={hasComments}
      hasUnreadComments={hasUnreadComments}
      onPlayPause={onPlayPause}
      onRate={onRate}
      onLongPress={onOpenDetails}
    />
  );
};

export default AdaptiveTrackRow;
