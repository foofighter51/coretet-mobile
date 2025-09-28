import React, { useCallback, memo } from 'react';
import { Play, Heart, ThumbsUp } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { Track } from '../../types';

interface TrackRowProps {
  track: Track;
  isPlaying?: boolean;
  onPlay?: (track: Track) => void;
  onRatingChange?: (track: Track, rating: 'like' | 'love' | 'none') => void;
}

export const TrackRow = memo(function TrackRow({ track, isPlaying = false, onPlay, onRatingChange }: TrackRowProps) {
  const handlePlay = useCallback(() => {
    onPlay?.(track);
  }, [onPlay, track]);

  const handleRatingChange = useCallback((rating: 'like' | 'love' | 'none') => {
    onRatingChange?.(track, rating);
  }, [onRatingChange, track]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        borderBottom: `1px solid ${designTokens.colors.neutral.lightGray}`,
        gap: designTokens.spacing.sm
      }}
      role="listitem"
    >
      <button
        onClick={handlePlay}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isPlaying ? designTokens.colors.primary.blue : designTokens.colors.neutral.offWhite,
          color: isPlaying ? designTokens.colors.neutral.white : designTokens.colors.primary.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        onMouseEnter={(e) => {
          if (!isPlaying) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueLight;
          }
        }}
        onMouseLeave={(e) => {
          if (!isPlaying) {
            e.currentTarget.style.backgroundColor = designTokens.colors.neutral.offWhite;
          }
        }}
      >
        <Play
          size={16}
          fill={isPlaying ? designTokens.colors.neutral.white : designTokens.colors.primary.blue}
          aria-hidden="true"
        />
      </button>

      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.medium,
          margin: '0',
          color: designTokens.colors.neutral.charcoal,
          fontFamily: designTokens.typography.fontFamily
        }}>
          {track.title}
        </h4>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
        {track.rating === 'like' && (
          <button
            onClick={() => handleRatingChange('none')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label={`Remove like from ${track.title}`}
          >
            <ThumbsUp size={16} color={designTokens.colors.primary.blue} aria-hidden="true" />
          </button>
        )}
        {track.rating === 'love' && (
          <button
            onClick={() => handleRatingChange('none')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label={`Remove love from ${track.title}`}
          >
            <Heart
              size={16}
              color={designTokens.colors.system.error}
              fill={designTokens.colors.system.error}
              aria-hidden="true"
            />
          </button>
        )}
        {track.rating === 'none' && onRatingChange && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => handleRatingChange('like')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                opacity: 0.5
              }}
              aria-label={`Like ${track.title}`}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              <ThumbsUp size={16} color={designTokens.colors.neutral.gray} aria-hidden="true" />
            </button>
            <button
              onClick={() => handleRatingChange('love')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                opacity: 0.5
              }}
              aria-label={`Love ${track.title}`}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              <Heart size={16} color={designTokens.colors.neutral.gray} aria-hidden="true" />
            </button>
          </div>
        )}
        <span
          style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.gray,
            minWidth: '40px',
            textAlign: 'right',
            fontFamily: designTokens.typography.fontFamily
          }}
          aria-label={`Duration: ${track.duration}`}
        >
          {track.duration}
        </span>
      </div>
    </div>
  );
});