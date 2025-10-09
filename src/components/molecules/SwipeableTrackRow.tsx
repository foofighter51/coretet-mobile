import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Headphones, ThumbsUp, Heart, Folder, ChevronLeft } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface SwipeableTrackRowProps {
  track: {
    id: string;
    title: string;
    duration_seconds?: number;
    folder_path?: string;
  };
  isPlaying: boolean;
  currentRating?: 'listened' | 'liked' | 'loved' | null;
  onPlayPause: () => void;
  onRate: (rating: 'listened' | 'liked' | 'loved') => void;
}

export const SwipeableTrackRow: React.FC<SwipeableTrackRowProps> = ({
  track,
  isPlaying,
  currentRating,
  onPlayPause,
  onRate,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxSwipe = 150;

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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;

    // Only allow left swipe (positive diff)
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipe));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
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

  const handleRate = (rating: 'listened' | 'liked' | 'loved') => {
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
        borderRadius: '8px',
        marginBottom: '4px',
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
          onClick={() => handleRate('listened')}
          aria-label={`Mark ${track.title} as listened`}
          aria-pressed={currentRating === 'listened'}
          style={{
            width: '50px',
            height: '100%',
            backgroundColor: '#90cdf4',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          <Headphones
            size={20}
            color={currentRating === 'listened' ? '#1a202c' : '#ffffff'}
            fill={currentRating === 'listened' ? '#1a202c' : 'none'}
            aria-hidden="true"
          />
        </button>
        <button
          onClick={() => handleRate('liked')}
          aria-label={`Mark ${track.title} as liked`}
          aria-pressed={currentRating === 'liked'}
          style={{
            width: '50px',
            height: '100%',
            backgroundColor: '#68d391',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          <ThumbsUp
            size={20}
            color={currentRating === 'liked' ? '#1a202c' : '#ffffff'}
            fill={currentRating === 'liked' ? '#1a202c' : 'none'}
            aria-hidden="true"
          />
        </button>
        <button
          onClick={() => handleRate('loved')}
          aria-label={`Mark ${track.title} as loved`}
          aria-pressed={currentRating === 'loved'}
          style={{
            width: '50px',
            height: '100%',
            backgroundColor: '#fc8181',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          <Heart
            size={20}
            color={currentRating === 'loved' ? '#1a202c' : '#ffffff'}
            fill={currentRating === 'loved' ? '#1a202c' : 'none'}
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
          padding: '8px 12px',
          backgroundColor: isPlaying ? '#ebf8ff' : '#ffffff',
          border: isPlaying ? '2px solid #3182ce' : '1px solid #e2e8f0',
          borderRadius: '8px',
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
        {/* Swipe hint gradient - only show when not swiped */}
        {swipeOffset === 0 && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '50px',
            background: 'linear-gradient(to left, rgba(49, 130, 206, 0.15), transparent)',
            borderRadius: '0 8px 8px 0',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '8px',
          }}>
            <ChevronLeft size={16} color="rgba(49, 130, 206, 0.4)" />
          </div>
        )}
        <button
          onClick={onPlayPause}
          style={{
            backgroundColor: isPlaying ? designTokens.colors.primary.blue : '#f7fafc',
            color: isPlaying ? '#ffffff' : designTokens.colors.neutral.charcoal,
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
                backgroundColor: '#f0f0f0',
                flexShrink: 0,
              }}>
                <Folder size={10} color={designTokens.colors.neutral.darkGray} />
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
              fontSize: '14px',
              fontWeight: '500',
              color: designTokens.colors.neutral.charcoal,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              minWidth: 0,
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
            {currentRating && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                borderRadius: '10px',
                backgroundColor:
                  currentRating === 'listened' ? '#e6f7ff' :
                  currentRating === 'liked' ? '#e6ffe6' :
                  '#ffe6e6',
              }}>
                {currentRating === 'listened' && <Headphones size={12} color={designTokens.colors.neutral.charcoal} />}
                {currentRating === 'liked' && <ThumbsUp size={12} color={designTokens.colors.neutral.charcoal} />}
                {currentRating === 'loved' && <Heart size={12} color={designTokens.colors.neutral.charcoal} />}
              </span>
            )}
            <p style={{
              fontSize: '12px',
              color: designTokens.colors.neutral.darkGray,
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
