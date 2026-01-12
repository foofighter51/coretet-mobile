import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ThumbsUp, Heart, Folder, MessageCircle } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

interface SwipeableTrackRowProps {
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
  onLongPress?: () => void;
}

export const SwipeableTrackRow: React.FC<SwipeableTrackRowProps> = ({
  track,
  isPlaying,
  currentRating,
  aggregatedRatings,
  hasComments,
  hasUnreadComments,
  onPlayPause,
  onRate,
  onLongPress,
}) => {
  const designTokens = useDesignTokens();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

  const maxSwipe = 120; // 2 buttons × 60px each
  const longPressDuration = 500; // 500ms for long press

  // Close swipe when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (swipeOffset > 0 && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSwipeOffset(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [swipeOffset]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
    longPressTriggeredRef.current = false;

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setIsDragging(false);
        onLongPress();
      }, longPressDuration);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;

    // Cancel long press if user starts swiping
    if (Math.abs(diff) > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Only allow left swipe (positive diff)
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipe));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Don't process swipe if long press was triggered
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    setIsDragging(false);

    // If swiped more than 50%, keep it open
    if (swipeOffset > 50) {
      setSwipeOffset(maxSwipe);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    currentXRef.current = e.clientX;
    const diff = startXRef.current - currentXRef.current;

    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipe));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    if (swipeOffset > 50) {
      setSwipeOffset(maxSwipe);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleRate = (rating: 'liked' | 'loved') => {
    onRate(rating);
    setSwipeOffset(0);
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: designTokens.borderRadius.md,
        marginBottom: designTokens.spacing.xs,
      }}>
      {/* Action buttons (behind the track row) */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0px',
      }}>
        <button
          onClick={() => handleRate('liked')}
          aria-label={`Mark ${track.title} as liked`}
          aria-pressed={currentRating === 'liked'}
          style={{
            width: '60px',
            height: '100%',
            backgroundColor: designTokens.colors.ratings.liked.bg,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: designTokens.dimensions.touchTarget.minimum,
          }}
        >
          <ThumbsUp
            size={20}
            color={currentRating === 'liked' ? designTokens.colors.text.primary : designTokens.colors.text.inverse}
            fill={currentRating === 'liked' ? designTokens.colors.text.primary : 'none'}
            aria-hidden="true"
          />
        </button>
        <button
          onClick={() => handleRate('loved')}
          aria-label={`Mark ${track.title} as loved`}
          aria-pressed={currentRating === 'loved'}
          style={{
            width: '60px',
            height: '100%',
            backgroundColor: designTokens.colors.ratings.loved.bg,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: designTokens.dimensions.touchTarget.minimum,
          }}
        >
          <Heart
            size={20}
            color={currentRating === 'loved' ? designTokens.colors.text.primary : designTokens.colors.text.inverse}
            fill={currentRating === 'loved' ? designTokens.colors.text.primary : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Track row (swipeable) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
          backgroundColor: isPlaying ? designTokens.colors.surface.hover : designTokens.colors.surface.primary,
          border: isPlaying ? `2px solid ${designTokens.colors.primary.blue}` : `1px solid ${designTokens.colors.borders.default}`,
          borderRadius: designTokens.borderRadius.md,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transform: `translateX(-${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'pan-y',
          position: 'relative',
          zIndex: 1,
          boxShadow: swipeOffset > 0 ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <button
          onClick={onPlayPause}
          style={{
            backgroundColor: isPlaying ? designTokens.colors.primary.blue : designTokens.colors.surface.hover,
            color: isPlaying ? designTokens.colors.text.inverse : designTokens.colors.text.primary,
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            minWidth: 0,
          }}>
            {track.folder_path && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '8px',
                backgroundColor: designTokens.colors.surface.hover,
                flexShrink: 0,
              }}>
                <Folder size={10} color={designTokens.colors.text.secondary} />
                <span style={{
                  fontSize: '10px',
                  color: designTokens.colors.neutral.darkGray,
                  maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {track.folder_path.split('/').pop() || track.folder_path}
                </span>
              </span>
            )}
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.medium,
              color: designTokens.colors.text.primary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
              maxWidth: '180px',
            }}>
              {track.title}
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}>
            {/* Comment indicator */}
            {hasComments && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                borderRadius: '10px',
                backgroundColor: hasUnreadComments
                  ? designTokens.colors.primary.blueLight
                  : designTokens.colors.surface.secondary,
                position: 'relative',
              }}>
                <MessageCircle
                  size={14}
                  color={designTokens.colors.primary.blue}
                  fill={hasUnreadComments ? designTokens.colors.primary.blue : 'none'}
                  aria-label={hasUnreadComments ? "Has unread comments" : "Has comments"}
                />
                {/* Unread dot indicator */}
                {hasUnreadComments && (
                  <div style={{
                    position: 'absolute',
                    top: '1px',
                    right: '1px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: designTokens.colors.system.error,
                    borderRadius: '50%',
                    border: '1px solid white',
                  }} />
                )}
              </span>
            )}
            {/* Show aggregated ratings */}
            {aggregatedRatings && (
              <>
                {aggregatedRatings.liked > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px',
                    borderRadius: '10px',
                    backgroundColor: currentRating === 'liked'
                      ? designTokens.colors.ratings.liked.bgUltraLight
                      : designTokens.colors.surface.secondary,
                  }}>
                    <ThumbsUp
                      size={12}
                      color={currentRating === 'liked'
                        ? designTokens.colors.text.primary
                        : designTokens.colors.text.muted
                      }
                    />
                  </span>
                )}
                {aggregatedRatings.loved > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px',
                    borderRadius: '10px',
                    backgroundColor: currentRating === 'loved'
                      ? designTokens.colors.ratings.loved.bgUltraLight
                      : designTokens.colors.surface.secondary,
                  }}>
                    <Heart
                      size={12}
                      color={currentRating === 'loved'
                        ? designTokens.colors.text.primary
                        : designTokens.colors.text.muted
                      }
                    />
                  </span>
                )}
              </>
            )}
            <p style={{
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.text.secondary,
              whiteSpace: 'nowrap',
            }}>
              {formatTime(track.duration_seconds)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
