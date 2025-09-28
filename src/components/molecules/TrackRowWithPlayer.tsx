import React, { useCallback, memo, useState } from 'react';
import { Play, Heart, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { Track } from '../../types';
import { AudioPlayer } from './AudioPlayer';
import { AudioTrack } from '../../utils/audioPlayerManager';

interface TrackRowWithPlayerProps {
  track: Track;
  isPlaying?: boolean;
  onPlay?: (track: Track) => void;
  onRatingChange?: (track: Track, rating: 'like' | 'love' | 'none') => void;
  showExpandedPlayer?: boolean;
  audioUrl?: string; // URL for the actual audio file
}

export const TrackRowWithPlayer = memo(function TrackRowWithPlayer({
  track,
  isPlaying = false,
  onPlay,
  onRatingChange,
  showExpandedPlayer = true,
  audioUrl
}: TrackRowWithPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePlay = useCallback(() => {
    onPlay?.(track);
  }, [onPlay, track]);

  const handleRatingChange = useCallback((rating: 'like' | 'love' | 'none') => {
    onRatingChange?.(track, rating);
  }, [onRatingChange, track]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Convert Track to AudioTrack format
  const audioTrack: AudioTrack = {
    id: track.id,
    title: track.title,
    url: audioUrl || `https://example.com/audio/${track.id}.mp3`, // Mock URL for now
    artist: track.artist || 'Unknown Artist'
  };

  return (
    <div
      style={{
        borderBottom: `1px solid ${designTokens.colors.neutral.lightGray}`,
        backgroundColor: isExpanded ? `${designTokens.colors.primary.blue}05` : 'transparent',
        transition: 'background-color 0.2s ease'
      }}
      role="listitem"
    >
      {/* Main Track Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
          gap: designTokens.spacing.sm
        }}
      >
        {/* Play Button */}
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

        {/* Track Info */}
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
          {track.artist && (
            <p style={{
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.neutral.gray,
              margin: '2px 0 0 0',
              fontFamily: designTokens.typography.fontFamily
            }}>
              {track.artist}
            </p>
          )}
        </div>

        {/* Rating Buttons */}
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

          {/* Duration */}
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

          {/* Expand Button */}
          {showExpandedPlayer && audioUrl && (
            <button
              onClick={toggleExpanded}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: designTokens.spacing.xs,
                color: designTokens.colors.neutral.gray,
                transition: 'color 0.2s ease'
              }}
              aria-label={isExpanded ? 'Hide audio player' : 'Show audio player'}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = designTokens.colors.primary.blue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = designTokens.colors.neutral.gray;
              }}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Audio Player */}
      {isExpanded && showExpandedPlayer && audioUrl && (
        <div
          style={{
            padding: `0 ${designTokens.spacing.md} ${designTokens.spacing.md}`,
            borderTop: `1px solid ${designTokens.colors.neutral.lightGray}`,
            backgroundColor: designTokens.colors.neutral.white
          }}
        >
          <AudioPlayer
            track={audioTrack}
            size="full"
            showProgress={true}
            showVolume={true}
            showSkipButtons={true}
            onTrackEnd={() => {
              console.log('Track ended:', track.title);
              // Could trigger next track or other actions
            }}
            onError={(error) => {
              console.error('Audio player error:', error);
              // Could show error notification
            }}
          />
        </div>
      )}
    </div>
  );
});

export default TrackRowWithPlayer;