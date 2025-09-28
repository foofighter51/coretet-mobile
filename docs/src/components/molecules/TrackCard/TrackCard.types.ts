/**
 * TrackCard Component Types
 * CoreTet Design System
 */

export interface TrackCardProps {
  title: string;
  artist?: string;
  ensemble?: string;
  duration: string;
  albumArt?: string;
  isPlaying?: boolean;
  rating?: 'none' | 'like' | 'love';
  disabled?: boolean;
  showRating?: boolean;
  showSwipeHint?: boolean;
  onPlayPause?: () => void;
  onRate?: (rating: 'like' | 'love') => void;
  onComment?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface TrackCardSwipeState {
  x: number;
  isDragging: boolean;
  showRatingButtons: boolean;
  swipeStartX: number;
  swipeDirection: 'left' | 'right' | null;
}

export interface TrackInfo {
  title: string;
  artist?: string;
  ensemble?: string;
  duration: string;
  durationSeconds?: number;
  albumArt?: string;
}

export interface RatingButtonProps {
  type: 'like' | 'love';
  isActive: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

// Animation states
export type TrackCardState = 'idle' | 'playing' | 'swiping' | 'rating' | 'disabled';

// Swipe configuration
export interface SwipeConfig {
  threshold: number; // Pixels to swipe before showing rating
  snapThreshold: number; // Pixels to snap back
  maxSwipe: number; // Maximum swipe distance
  animationDuration: number; // Animation duration in ms
}

export const defaultSwipeConfig: SwipeConfig = {
  threshold: 50,
  snapThreshold: 100,
  maxSwipe: 120,
  animationDuration: 200,
};

export default TrackCardProps;