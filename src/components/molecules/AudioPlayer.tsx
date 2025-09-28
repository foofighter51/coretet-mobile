import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import AudioPlayerManager, { AudioTrack, PlaybackState } from '../../utils/audioPlayerManager';

interface AudioPlayerProps {
  track: AudioTrack;
  onTrackEnd?: () => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'compact' | 'full';
  showProgress?: boolean;
  showVolume?: boolean;
  showSkipButtons?: boolean;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  onTrackEnd,
  onError,
  className = '',
  size = 'full',
  showProgress = true,
  showVolume = true,
  showSkipButtons = true,
  autoPlay = false
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isLoading: false
  });

  const [isMuted, setIsMuted] = useState(false);
  const playerManagerRef = useRef<AudioPlayerManager>();
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Initialize player manager
  useEffect(() => {
    playerManagerRef.current = AudioPlayerManager.getInstance();
    return () => {
      // Cleanup when component unmounts
      playerManagerRef.current?.destroy();
    };
  }, []);

  // Load track when it changes
  useEffect(() => {
    if (playerManagerRef.current && track.url) {
      loadTrack();
    }
  }, [track.url]);

  const loadTrack = useCallback(async () => {
    if (!playerManagerRef.current) return;

    try {
      await playerManagerRef.current.loadTrack(track, {
        onPlay: () => {
          setPlaybackState(prev => ({ ...prev, isPlaying: true }));
        },
        onPause: () => {
          setPlaybackState(prev => ({ ...prev, isPlaying: false }));
        },
        onStop: () => {
          setPlaybackState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        },
        onEnd: () => {
          setPlaybackState(prev => ({ ...prev, isPlaying: false }));
          onTrackEnd?.();
        },
        onLoad: () => {
          setPlaybackState(prev => ({ ...prev, isLoading: false }));
          if (autoPlay) {
            playerManagerRef.current?.play();
          }
        },
        onLoadError: (error) => {
          setPlaybackState(prev => ({ ...prev, isLoading: false, error }));
          onError?.(error);
        },
        onTimeUpdate: (currentTime, duration) => {
          setPlaybackState(prev => ({ ...prev, currentTime, duration }));
        }
      });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to load track');
    }
  }, [track, autoPlay, onTrackEnd, onError]);

  const handlePlayPause = useCallback(() => {
    if (!playerManagerRef.current) return;

    if (playbackState.isPlaying) {
      playerManagerRef.current.pause();
    } else {
      playerManagerRef.current.play();
    }
  }, [playbackState.isPlaying]);

  const handleSeek = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!playerManagerRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const seekTime = percent * playbackState.duration;

    playerManagerRef.current.seek(seekTime);
  }, [playbackState.duration]);

  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    playerManagerRef.current?.setVolume(volume);
    setPlaybackState(prev => ({ ...prev, volume }));
    setIsMuted(volume === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    if (!playerManagerRef.current) return;

    if (isMuted) {
      playerManagerRef.current.setVolume(0.7);
      setPlaybackState(prev => ({ ...prev, volume: 0.7 }));
      setIsMuted(false);
    } else {
      playerManagerRef.current.setVolume(0);
      setPlaybackState(prev => ({ ...prev, volume: 0 }));
      setIsMuted(true);
    }
  }, [isMuted]);

  const handleSkipForward = useCallback(() => {
    playerManagerRef.current?.skipForward(10);
  }, []);

  const handleSkipBackward = useCallback(() => {
    playerManagerRef.current?.skipBackward(10);
  }, []);

  const progress = playbackState.duration > 0
    ? (playbackState.currentTime / playbackState.duration) * 100
    : 0;

  const isCompact = size === 'compact';

  return (
    <div className={`audio-player ${className}`}>
      {/* Track Info */}
      {!isCompact && (
        <div style={{
          marginBottom: designTokens.spacing.sm,
          textAlign: 'center'
        }}>
          <h4 style={{
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.neutral.black,
            margin: '0 0 4px 0'
          }}>
            {track.title}
          </h4>
          {track.artist && (
            <p style={{
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.neutral.gray,
              margin: 0
            }}>
              {track.artist}
            </p>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div style={{ marginBottom: designTokens.spacing.sm }}>
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: designTokens.colors.neutral.lightGray,
              borderRadius: '3px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: designTokens.colors.primary.blue,
              borderRadius: '3px',
              transition: 'width 0.1s ease'
            }} />
          </div>

          {/* Time Display */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.neutral.gray,
            marginTop: '4px'
          }}>
            <span>{AudioPlayerManager.formatTime(playbackState.currentTime)}</span>
            <span>{AudioPlayerManager.formatTime(playbackState.duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isCompact ? designTokens.spacing.sm : designTokens.spacing.md
      }}>
        {/* Skip Backward */}
        {showSkipButtons && !isCompact && (
          <button
            onClick={handleSkipBackward}
            disabled={playbackState.isLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: designTokens.colors.neutral.gray,
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = designTokens.colors.primary.blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = designTokens.colors.neutral.gray;
            }}
          >
            <SkipBack size={20} />
          </button>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          disabled={playbackState.isLoading}
          style={{
            backgroundColor: designTokens.colors.primary.blue,
            border: 'none',
            borderRadius: '50%',
            width: isCompact ? '40px' : '48px',
            height: isCompact ? '40px' : '48px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: designTokens.colors.neutral.white,
            transition: 'background-color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
          }}
        >
          {playbackState.isLoading ? (
            <Loader2 size={isCompact ? 16 : 20} className="animate-spin" />
          ) : playbackState.isPlaying ? (
            <Pause size={isCompact ? 16 : 20} />
          ) : (
            <Play size={isCompact ? 16 : 20} style={{ marginLeft: '2px' }} />
          )}
        </button>

        {/* Skip Forward */}
        {showSkipButtons && !isCompact && (
          <button
            onClick={handleSkipForward}
            disabled={playbackState.isLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: designTokens.colors.neutral.gray,
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = designTokens.colors.primary.blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = designTokens.colors.neutral.gray;
            }}
          >
            <SkipForward size={20} />
          </button>
        )}

        {/* Volume Control */}
        {showVolume && !isCompact && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.xs,
            marginLeft: designTokens.spacing.sm
          }}>
            <button
              onClick={handleToggleMute}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: designTokens.colors.neutral.gray,
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={playbackState.volume}
              onChange={handleVolumeChange}
              style={{
                width: '60px',
                height: '4px',
                background: `linear-gradient(to right,
                  ${designTokens.colors.primary.blue} 0%,
                  ${designTokens.colors.primary.blue} ${playbackState.volume * 100}%,
                  ${designTokens.colors.neutral.lightGray} ${playbackState.volume * 100}%,
                  ${designTokens.colors.neutral.lightGray} 100%)`,
                outline: 'none',
                appearance: 'none',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {playbackState.error && (
        <div style={{
          marginTop: designTokens.spacing.sm,
          padding: designTokens.spacing.xs,
          backgroundColor: `${designTokens.colors.semantic.error}20`,
          borderRadius: designTokens.borderRadius.sm,
          fontSize: designTokens.typography.fontSizes.caption,
          color: designTokens.colors.semantic.error,
          textAlign: 'center'
        }}>
          {playbackState.error}
        </div>
      )}

      {/* Add custom CSS for the range input */}
      <style>{`
        .audio-player input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${designTokens.colors.primary.blue};
          cursor: pointer;
          border: 2px solid ${designTokens.colors.neutral.white};
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .audio-player input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${designTokens.colors.primary.blue};
          cursor: pointer;
          border: 2px solid ${designTokens.colors.neutral.white};
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;