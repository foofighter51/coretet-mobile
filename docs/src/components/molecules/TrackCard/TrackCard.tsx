/**
 * CoreTet Design System - TrackCard Component (Final Clean Version)
 * EXACT specifications: 343x64px, identical structure, 8px grid, exact colors
 */

import React, { useState, useRef, useCallback } from 'react';
import { designTokens } from '../../../design/tokens';

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
  onClick?: () => void;
  onComment?: () => void;
}

export const TrackCard = React.forwardRef<HTMLDivElement, TrackCardProps>(
  ({ 
    title,
    artist,
    ensemble,
    duration,
    albumArt,
    isPlaying = false,
    rating = 'none',
    disabled = false,
    showRating = true,
    showSwipeHint = false,
    onPlayPause,
    onRate,
    onClick,
    onComment,
    ...props 
  }, ref) => {
    const [isSwipeRevealed, setIsSwipeRevealed] = useState(false);
    const [swipeDistance, setSwipeDistance] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const isDragging = useRef(false);

    // EXACT TrackCard specifications from design tokens
    const cardStyles: React.CSSProperties = {
      // EXACT dimensions - must be 343x64px
      width: `${designTokens.dimensions.trackCard.width}px`,
      height: `${designTokens.dimensions.trackCard.height}px`,
      
      // EXACT border radius - must be 8px
      borderRadius: `${designTokens.borderRadius.card}px`,
      
      // EXACT background color
      backgroundColor: designTokens.colors.neutral.white,
      
      // EXACT shadow - only shadow.default allowed
      boxShadow: designTokens.shadows.default.boxShadow,
      
      // EXACT border for playing state
      border: isPlaying ? `2px solid ${designTokens.colors.primary.blue}` : 'none',
      
      // Layout
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      cursor: disabled ? 'not-allowed' : 'pointer',
      
      // EXACT transitions
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      
      // Transform for swipe
      transform: `translateX(${swipeDistance}px)`,
      
      // States
      opacity: disabled ? 0.5 : 1,
      
      // Touch handling
      touchAction: 'pan-y pinch-zoom',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    };

    const contentStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      padding: `${designTokens.spacing.md}px`,
      gap: `${designTokens.spacing.md}px`,
    };

    const albumArtStyles: React.CSSProperties = {
      // EXACT album art size - must be 56px
      width: `${designTokens.dimensions.albumArt.small}px`,
      height: `${designTokens.dimensions.albumArt.small}px`,
      borderRadius: `${designTokens.borderRadius.albumArt}px`,
      backgroundColor: designTokens.colors.neutral.lightGray,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    const textContainerStyles: React.CSSProperties = {
      flex: 1,
      minWidth: 0, // Allow text to shrink
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: `${designTokens.spacing.xs}px`,
    };

    const titleStyles: React.CSSProperties = {
      fontSize: `${designTokens.typography.scales.body.size}px`,
      fontWeight: designTokens.typography.weights.normal,
      fontFamily: designTokens.typography.fontFamily,
      lineHeight: `${designTokens.typography.scales.body.lineHeight}px`,
      color: designTokens.colors.neutral.charcoal,
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };

    const subtitleStyles: React.CSSProperties = {
      fontSize: `${designTokens.typography.scales.bodySmall.size}px`,
      fontWeight: designTokens.typography.weights.normal,
      fontFamily: designTokens.typography.fontFamily,
      lineHeight: `${designTokens.typography.scales.bodySmall.lineHeight}px`,
      color: designTokens.colors.neutral.gray,
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };

    const rightContentStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: `${designTokens.spacing.md}px`,
      flexShrink: 0,
    };

    const durationStyles: React.CSSProperties = {
      fontSize: `${designTokens.typography.scales.caption.size}px`,
      fontWeight: designTokens.typography.weights.normal,
      fontFamily: designTokens.typography.fontFamily,
      lineHeight: `${designTokens.typography.scales.caption.lineHeight}px`,
      color: designTokens.colors.neutral.gray,
      margin: 0,
    };

    const playButtonStyles: React.CSSProperties = {
      // EXACT icon size - must be 24px
      width: `${designTokens.dimensions.icon.default}px`,
      height: `${designTokens.dimensions.icon.default}px`,
      borderRadius: '50%',
      border: 'none',
      backgroundColor: isPlaying ? designTokens.colors.primary.blue : 'transparent',
      color: isPlaying ? designTokens.colors.neutral.white : designTokens.colors.neutral.darkGray,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      outline: 'none',
    };

    const ratingContainerStyles: React.CSSProperties = {
      position: 'absolute',
      right: `${-designTokens.spacing.xl * 3}px`, // Initially hidden
      top: 0,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: `${designTokens.spacing.md}px`,
      paddingLeft: `${designTokens.spacing.lg}px`,
      backgroundColor: designTokens.colors.neutral.white,
      transition: 'right 0.3s ease',
      ...(isSwipeRevealed && {
        right: `${-swipeDistance}px`,
      }),
    };

    const ratingButtonStyles: React.CSSProperties = {
      // EXACT icon size - must be 24px
      width: `${designTokens.dimensions.icon.default}px`,
      height: `${designTokens.dimensions.icon.default}px`,
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: `${designTokens.borderRadius.albumArt}px`,
      transition: 'all 0.2s ease',
      outline: 'none',
    };

    // Touch/mouse handlers for swipe
    const handleStart = useCallback((clientX: number) => {
      if (disabled || !showRating) return;
      startX.current = clientX;
      isDragging.current = true;
    }, [disabled, showRating]);

    const handleMove = useCallback((clientX: number) => {
      if (!isDragging.current) return;
      
      const diff = startX.current - clientX;
      const maxSwipe = 80;
      const newDistance = Math.max(0, Math.min(maxSwipe, diff));
      
      setSwipeDistance(newDistance);
      
      if (newDistance > 40) {
        setIsSwipeRevealed(true);
      } else {
        setIsSwipeRevealed(false);
      }
    }, []);

    const handleEnd = useCallback(() => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      if (swipeDistance < 40) {
        setSwipeDistance(0);
        setIsSwipeRevealed(false);
      }
    }, [swipeDistance]);

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX);
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    const handlePlayPause = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        onPlayPause?.();
      }
    };

    const handleRate = (newRating: 'like' | 'love') => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        onRate?.(newRating);
        setSwipeDistance(0);
        setIsSwipeRevealed(false);
      }
    };

    const handleCardClick = () => {
      if (!disabled && !isDragging.current && swipeDistance === 0) {
        onClick?.();
      }
    };

    const displayText = artist || ensemble || '';

    return (
      <div
        ref={ref}
        style={cardStyles}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        {...props}
      >
        <div style={contentStyles}>
          {/* Album Art or Placeholder */}
          <div style={albumArtStyles}>
            {albumArt ? (
              <img 
                src={albumArt} 
                alt={`${title} album art`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            ) : (
              <span 
                style={{ 
                  fontSize: `${designTokens.dimensions.icon.default}px`,
                  color: designTokens.colors.neutral.gray
                }}
              >
                ♪
              </span>
            )}
          </div>

          {/* Track Info */}
          <div style={textContainerStyles}>
            <div style={titleStyles}>{title}</div>
            {displayText && (
              <div style={subtitleStyles}>{displayText}</div>
            )}
          </div>

          {/* Right Side */}
          <div style={rightContentStyles}>
            <span style={durationStyles}>{duration}</span>
            
            <button
              style={playButtonStyles}
              onClick={handlePlayPause}
              onMouseEnter={(e) => {
                if (!isPlaying) {
                  e.currentTarget.style.backgroundColor = designTokens.colors.neutral.lightGray;
                }
              }}
              onMouseLeave={(e) => {
                if (!isPlaying) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        </div>

        {/* Rating Buttons (Swipe Reveal) */}
        {showRating && (
          <div style={ratingContainerStyles}>
            <button
              style={{
                ...ratingButtonStyles,
                color: rating === 'like' ? designTokens.colors.primary.blue : designTokens.colors.neutral.gray,
              }}
              onClick={handleRate('like')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueUltraLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Like this track"
            >
              👍
            </button>
            
            <button
              style={{
                ...ratingButtonStyles,
                color: rating === 'love' ? designTokens.colors.accent.coral : designTokens.colors.neutral.gray,
              }}
              onClick={handleRate('love')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${designTokens.colors.accent.coral}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Love this track"
            >
              ❤️
            </button>
          </div>
        )}

        {/* Swipe Hint */}
        {showSwipeHint && !isSwipeRevealed && (
          <div
            style={{
              position: 'absolute',
              right: `${designTokens.spacing.lg}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: `${designTokens.typography.scales.caption.size}px`,
              color: designTokens.colors.neutral.gray,
              animation: 'pulse 2s infinite',
            }}
          >
            ← Swipe to rate
          </div>
        )}
      </div>
    );
  }
);

TrackCard.displayName = 'TrackCard';

export default TrackCard;