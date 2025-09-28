/**
 * AudioPlayer Component
 * CoreTet Design System - Organism Component
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { audioPlayerStyles } from './AudioPlayer.styles';

export interface AudioTrack {
  title: string;
  artist?: string;
  ensemble?: string;
  albumArt?: string;
  duration: number; // in seconds
  audioUrl?: string;
}

export interface AudioPlayerProps {
  isOpen: boolean;
  track?: AudioTrack;
  isPlaying?: boolean;
  currentTime?: number;
  volume?: number;
  showVolume?: boolean;
  onClose: () => void;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isOpen,
  track,
  isPlaying = false,
  currentTime = 0,
  volume = 1,
  showVolume = false,
  onClose,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [closeButtonHovered, setCloseButtonHovered] = useState(false);
  const [controlsPressed, setControlsPressed] = useState<string | null>(null);

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Progress bar handling
  const handleProgressClick = useCallback((event: React.MouseEvent) => {
    if (!progressRef.current || !track || !onSeek) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * track.duration;
    
    onSeek(newTime);
  }, [track, onSeek]);

  const handleProgressMouseDown = useCallback((event: React.MouseEvent) => {
    if (!track || !onSeek) return;
    
    setIsDraggingProgress(true);
    handleProgressClick(event);
  }, [track, onSeek, handleProgressClick]);

  const handleProgressMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingProgress || !progressRef.current || !track || !onSeek) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * track.duration;
    
    onSeek(newTime);
  }, [isDraggingProgress, track, onSeek]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDraggingProgress(false);
  }, []);

  // Volume bar handling
  const handleVolumeClick = useCallback((event: React.MouseEvent) => {
    if (!volumeRef.current || !onVolumeChange) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    onVolumeChange(percentage);
  }, [onVolumeChange]);

  const handleVolumeMouseDown = useCallback((event: React.MouseEvent) => {
    if (!onVolumeChange) return;
    
    setIsDraggingVolume(true);
    handleVolumeClick(event);
  }, [onVolumeChange, handleVolumeClick]);

  const handleVolumeMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingVolume || !volumeRef.current || !onVolumeChange) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    onVolumeChange(percentage);
  }, [isDraggingVolume, onVolumeChange]);

  const handleVolumeMouseUp = useCallback(() => {
    setIsDraggingVolume(false);
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isDraggingProgress) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDraggingProgress, handleProgressMouseMove, handleProgressMouseUp]);

  useEffect(() => {
    if (isDraggingVolume) {
      document.addEventListener('mousemove', handleVolumeMouseMove);
      document.addEventListener('mouseup', handleVolumeMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleVolumeMouseMove);
        document.removeEventListener('mouseup', handleVolumeMouseUp);
      };
    }
  }, [isDraggingVolume, handleVolumeMouseMove, handleVolumeMouseUp]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Control button handlers
  const handleControlPress = useCallback((control: string) => {
    setControlsPressed(control);
  }, []);

  const handleControlRelease = useCallback(() => {
    setControlsPressed(null);
  }, []);

  if (!isOpen) return null;

  const progress = track ? Math.min(1, Math.max(0, currentTime / track.duration)) : 0;
  const progressPercent = `${progress * 100}%`;
  const volumePercent = `${volume * 100}%`;

  const displayArtist = track?.artist || track?.ensemble;

  return (
    <div
      className={className}
      style={{ ...audioPlayerStyles.overlay, ...style }}
      onClick={handleOverlayClick}
      data-testid={testId}
    >
      <div style={audioPlayerStyles.container}>
        {/* Header */}
        <div style={audioPlayerStyles.header}>
          <Text variant="h3" color="primary">
            Now Playing
          </Text>
          <button
            style={{
              ...audioPlayerStyles.closeButton,
              ...(closeButtonHovered && audioPlayerStyles.closeButtonHover),
            }}
            onClick={onClose}
            onMouseEnter={() => setCloseButtonHovered(true)}
            onMouseLeave={() => setCloseButtonHovered(false)}
            aria-label="Close player"
          >
            ×
          </button>
        </div>

        {track ? (
          <>
            {/* Track Info */}
            <div style={audioPlayerStyles.trackInfo}>
              {track.albumArt ? (
                <img
                  src={track.albumArt}
                  alt={`${track.title} album art`}
                  style={audioPlayerStyles.albumArt}
                />
              ) : (
                <div style={audioPlayerStyles.albumArt} />
              )}
              
              <Text variant="h2" style={audioPlayerStyles.trackTitle}>
                {track.title}
              </Text>
              
              {displayArtist && (
                <Text variant="body" style={audioPlayerStyles.trackArtist}>
                  {displayArtist}
                </Text>
              )}
            </div>

            {/* Progress */}
            <div style={audioPlayerStyles.progressSection}>
              <div
                ref={progressRef}
                style={audioPlayerStyles.progressBar}
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
              >
                <div
                  style={{
                    ...audioPlayerStyles.progressFill,
                    width: progressPercent,
                  }}
                />
                <div
                  style={{
                    ...audioPlayerStyles.progressHandle,
                    left: progressPercent,
                    ...(isDraggingProgress && audioPlayerStyles.progressHandleActive),
                  }}
                />
              </div>
              
              <div style={audioPlayerStyles.timeDisplay}>
                <Text variant="caption">
                  {formatTime(currentTime)}
                </Text>
                <Text variant="caption">
                  {formatTime(track.duration)}
                </Text>
              </div>
            </div>

            {/* Controls */}
            <div style={audioPlayerStyles.controls}>
              {onPrevious && (
                <button
                  style={{
                    ...audioPlayerStyles.controlButton,
                    ...(controlsPressed === 'previous' && audioPlayerStyles.controlButtonPressed),
                  }}
                  onClick={onPrevious}
                  onMouseDown={() => handleControlPress('previous')}
                  onMouseUp={handleControlRelease}
                  onMouseLeave={handleControlRelease}
                  aria-label="Previous track"
                >
                  ⏮
                </button>
              )}

              <button
                style={{
                  ...audioPlayerStyles.controlButton,
                  ...audioPlayerStyles.playPauseButton,
                  ...(controlsPressed === 'play' && audioPlayerStyles.playPauseButtonPressed),
                }}
                onClick={onPlayPause}
                onMouseDown={() => handleControlPress('play')}
                onMouseUp={handleControlRelease}
                onMouseLeave={handleControlRelease}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              {onNext && (
                <button
                  style={{
                    ...audioPlayerStyles.controlButton,
                    ...(controlsPressed === 'next' && audioPlayerStyles.controlButtonPressed),
                  }}
                  onClick={onNext}
                  onMouseDown={() => handleControlPress('next')}
                  onMouseUp={handleControlRelease}
                  onMouseLeave={handleControlRelease}
                  aria-label="Next track"
                >
                  ⏭
                </button>
              )}
            </div>

            {/* Volume (if enabled) */}
            {showVolume && onVolumeChange && (
              <div style={audioPlayerStyles.volumeSection}>
                <div style={audioPlayerStyles.volumeIcon}>
                  🔊
                </div>
                <div
                  ref={volumeRef}
                  style={audioPlayerStyles.volumeSlider}
                  onClick={handleVolumeClick}
                  onMouseDown={handleVolumeMouseDown}
                >
                  <div
                    style={{
                      ...audioPlayerStyles.volumeFill,
                      width: volumePercent,
                    }}
                  />
                  <div
                    style={{
                      ...audioPlayerStyles.volumeHandle,
                      left: volumePercent,
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={audioPlayerStyles.loading}>
            <Text variant="body" color="secondary">
              No track selected
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;