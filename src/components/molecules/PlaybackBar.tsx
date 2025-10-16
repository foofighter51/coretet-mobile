import React, { useEffect, useState } from 'react';
import { Play, Pause, Loader } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface PlaybackBarProps {
  track: {
    id: string;
    title: string;
    file_url: string;
    duration_seconds?: number;
  };
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isLoading?: boolean;
  error?: string | null;
  onPlayPause: () => void;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  track,
  audioRef,
  isPlaying,
  isLoading = false,
  error = null,
  onPlayPause
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  // Safety check - if track is null, don't render
  if (!track) {
    return null;
  }

  // Reset time and duration when track changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(track?.duration_seconds || 0);
  }, [track?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);

    // Set initial duration if already loaded
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [audioRef, track?.id]);

  // Calculate time from position (used by both mouse and touch)
  const getTimeFromPosition = (clientX: number): number => {
    if (!progressBarRef.current || !duration) return 0;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage * duration;
  };

  // Handle scrubbing start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newTime = getTimeFromPosition(clientX);
    setDragTime(newTime);
  };

  // Handle scrubbing move
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newTime = getTimeFromPosition(clientX);
    setDragTime(newTime);
  };

  // Handle scrubbing end
  const handleDragEnd = () => {
    if (!isDragging || dragTime === null) return;

    if (audioRef.current) {
      audioRef.current.currentTime = dragTime;
      setCurrentTime(dragTime);
    }

    setIsDragging(false);
    setDragTime(null);
  };

  // Handle tap to seek
  const handleTapSeek = (e: React.MouseEvent | React.TouchEvent) => {
    // Only handle taps, not drags
    if (isDragging) return;

    if (!audioRef.current || !duration) return;

    const clientX = 'touches' in e ? (e as React.TouchEvent).changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const newTime = getTimeFromPosition(clientX);

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Add/remove drag listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault(); // Prevent scrolling while dragging
      handleDragMove(e);
    };

    const handleEnd = () => {
      handleDragEnd();
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragTime]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = dragTime !== null ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div style={{
      flexShrink: 0,
      backgroundColor: '#ffffff',
      borderTop: `1px solid ${designTokens.colors.neutral.lightGray}`,
      padding: '12px 16px',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Progress Bar Container - Expanded touch target */}
      <div
        ref={progressBarRef}
        onClick={handleTapSeek}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={displayTime}
        aria-label="Audio playback progress"
        style={{
          width: '100%',
          height: '44px', // Apple HIG minimum touch target
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
          marginBottom: '4px',
          marginTop: '-16px', // Negative margin to maintain visual spacing
        }}
      >
        {/* Visual progress bar (thin line) */}
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e2e8f0',
          borderRadius: '2px',
          position: 'relative',
        }}>
          {/* Filled progress */}
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: designTokens.colors.primary.blue,
            borderRadius: '2px',
            transition: isDragging ? 'none' : 'width 0.1s linear',
          }} />

          {/* Draggable thumb */}
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            backgroundColor: '#ffffff',
            border: `2px solid ${designTokens.colors.primary.blue}`,
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            transition: isDragging ? 'none' : 'left 0.1s linear',
            cursor: 'grab',
            pointerEvents: 'none', // Let parent handle events
          }} />
        </div>

        {/* Timestamp tooltip while dragging */}
        {isDragging && dragTime !== null && (
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            top: '-32px',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            {formatTime(dragTime)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={onPlayPause}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{
            backgroundColor: designTokens.colors.primary.blue,
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          {isLoading ? (
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '500',
            color: designTokens.colors.neutral.charcoal,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0,
          }}>
            {track.title}
          </p>
          <p style={{
            fontSize: '12px',
            color: error ? '#c00' : designTokens.colors.neutral.darkGray,
            margin: '2px 0 0 0',
          }}>
            {error || `${formatTime(displayTime)} / ${formatTime(duration)}`}
          </p>
        </div>
      </div>
    </div>
  );
};
