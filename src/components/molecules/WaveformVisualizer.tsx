import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { generateWaveform, WaveformData, formatTimestamp, positionToTimestamp } from '../../utils/waveformGenerator';

export interface TimestampedComment {
  id: string;
  timestamp_seconds: number | null;
  user_name: string;
  content: string;
  created_at: string;
}

export interface WaveformVisualizerProps {
  /** URL of the audio file */
  audioUrl: string;
  /** Duration of the audio in seconds */
  duration: number;
  /** Current playback time in seconds */
  currentTime: number;
  /** Whether audio is currently playing */
  isPlaying?: boolean;
  /** Comments with timestamps to display as markers */
  comments?: TimestampedComment[];
  /** Cached waveform data (if available from database) */
  cachedWaveformData?: WaveformData;
  /** Called when user clicks to seek */
  onSeek?: (time: number) => void;
  /** Called when user wants to add a comment at a timestamp */
  onAddComment?: (timestamp: number) => void;
  /** Called when user clicks on a comment marker */
  onCommentClick?: (comment: TimestampedComment) => void;
  /** Called when waveform data is generated (for caching) */
  onWaveformGenerated?: (data: WaveformData) => void;
  /** Height of the waveform in pixels */
  height?: number;
  /** Whether to show comment markers */
  showCommentMarkers?: boolean;
  /** Whether to show timestamp on hover */
  showTimestampOnHover?: boolean;
}

/**
 * WaveformVisualizer - Canvas-based audio waveform with comment markers
 *
 * Features:
 * - Generates waveform from audio URL using Web Audio API
 * - Shows playback progress with gradient coloring
 * - Displays comment markers as clickable pins
 * - Click-to-seek functionality
 * - Hover tooltip with timestamp
 * - Frame.io-style UX
 */
export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioUrl,
  duration,
  currentTime,
  isPlaying = false,
  comments = [],
  cachedWaveformData,
  onSeek,
  onAddComment,
  onCommentClick,
  onWaveformGenerated,
  height = 80,
  showCommentMarkers = true,
  showTimestampOnHover = true,
}) => {
  const designTokens = useDesignTokens();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [waveformData, setWaveformData] = useState<WaveformData | null>(cachedWaveformData || null);
  const [isLoading, setIsLoading] = useState(!cachedWaveformData);
  const [error, setError] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoveredComment, setHoveredComment] = useState<TimestampedComment | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Filter comments that have timestamps
  const timestampedComments = useMemo(
    () => comments.filter(c => c.timestamp_seconds !== null && c.timestamp_seconds !== undefined),
    [comments]
  );

  // Generate waveform data if not cached
  useEffect(() => {
    if (cachedWaveformData) {
      setWaveformData(cachedWaveformData);
      setIsLoading(false);
      return;
    }

    if (!audioUrl) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    generateWaveform(audioUrl, { samples: 200 })
      .then(data => {
        if (!cancelled) {
          setWaveformData(data);
          setIsLoading(false);
          onWaveformGenerated?.(data);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Failed to generate waveform:', err);
          setError('Failed to load waveform');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [audioUrl, cachedWaveformData, onWaveformGenerated]);

  // Track container width for responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);

    return () => observer.disconnect();
  }, []);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || containerWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { amplitudes } = waveformData;
    const effectiveDuration = duration > 0 ? duration : waveformData.duration;
    const progress = effectiveDuration > 0 ? currentTime / effectiveDuration : 0;

    // Set canvas size (account for device pixel ratio for crisp rendering)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, height);

    // Calculate bar dimensions
    const barCount = amplitudes.length;
    const barWidth = Math.max(2, (containerWidth / barCount) * 0.8);
    const barGap = (containerWidth / barCount) * 0.2;
    const maxBarHeight = height - 24; // Leave room for comment markers at top

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const x = (i / barCount) * containerWidth + barGap / 2;
      const barHeight = Math.max(2, amplitudes[i] * maxBarHeight);
      const y = (height - barHeight) / 2 + 12; // Center vertically, offset for markers

      // Determine if bar is before or after playhead
      const barProgress = i / barCount;
      const isPlayed = barProgress <= progress;

      // Set color based on playback position
      ctx.fillStyle = isPlayed
        ? designTokens.colors.primary.blue
        : designTokens.colors.text.muted;

      // Draw rounded bar
      const radius = Math.min(barWidth / 2, 2);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    }

    // Draw playhead line
    if (progress > 0 && progress < 1) {
      const playheadX = progress * containerWidth;
      ctx.strokeStyle = designTokens.colors.primary.blue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 8);
      ctx.lineTo(playheadX, height - 4);
      ctx.stroke();
    }

    // Draw comment markers
    if (showCommentMarkers && timestampedComments.length > 0) {
      timestampedComments.forEach(comment => {
        const commentPosition = (comment.timestamp_seconds! / effectiveDuration);
        const x = commentPosition * containerWidth;

        // Draw marker pin
        const isHovered = hoveredComment?.id === comment.id;
        const pinRadius = isHovered ? 7 : 5;

        ctx.fillStyle = designTokens.colors.accent.coral;
        ctx.beginPath();
        ctx.arc(x, 8, pinRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw connector line (subtle)
        ctx.strokeStyle = `${designTokens.colors.accent.coral}40`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 14);
        ctx.lineTo(x, height - 4);
        ctx.stroke();
      });
    }

    // Draw hover timestamp indicator
    if (hoverPosition !== null && showTimestampOnHover) {
      const hoverX = hoverPosition * containerWidth;

      // Draw hover line
      ctx.strokeStyle = `${designTokens.colors.text.primary}60`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 8);
      ctx.lineTo(hoverX, height - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    waveformData,
    containerWidth,
    height,
    currentTime,
    duration,
    timestampedComments,
    hoveredComment,
    hoverPosition,
    showCommentMarkers,
    showTimestampOnHover,
    designTokens,
  ]);

  // Handle mouse move for hover effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x / rect.width;
    setHoverPosition(position);

    // Check if hovering over a comment marker
    const effectiveDuration = duration > 0 ? duration : (waveformData?.duration || 0);
    if (effectiveDuration > 0 && showCommentMarkers) {
      const hovered = timestampedComments.find(comment => {
        const commentPos = comment.timestamp_seconds! / effectiveDuration;
        const distance = Math.abs(commentPos - position) * rect.width;
        return distance < 10; // 10px hit area
      });
      setHoveredComment(hovered || null);
    }
  }, [duration, waveformData, timestampedComments, showCommentMarkers]);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
    setHoveredComment(null);
  }, []);

  // Handle click for seeking or comment selection
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x / rect.width;
    const effectiveDuration = duration > 0 ? duration : (waveformData?.duration || 0);

    // Check if clicking on a comment marker
    if (hoveredComment && onCommentClick) {
      onCommentClick(hoveredComment);
      return;
    }

    // Seek to position
    if (onSeek && effectiveDuration > 0) {
      const timestamp = positionToTimestamp(position, effectiveDuration);
      onSeek(timestamp);
    }
  }, [duration, waveformData, hoveredComment, onSeek, onCommentClick]);

  // Handle right-click for adding comment
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!onAddComment) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x / rect.width;
    const effectiveDuration = duration > 0 ? duration : (waveformData?.duration || 0);

    if (effectiveDuration > 0) {
      const timestamp = positionToTimestamp(position, effectiveDuration);
      onAddComment(timestamp);
    }
  }, [duration, waveformData, onAddComment]);

  // Calculate hover timestamp for tooltip
  const hoverTimestamp = useMemo(() => {
    if (hoverPosition === null) return null;
    const effectiveDuration = duration > 0 ? duration : (waveformData?.duration || 0);
    return positionToTimestamp(hoverPosition, effectiveDuration);
  }, [hoverPosition, duration, waveformData]);

  if (isLoading) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.md,
          color: designTokens.colors.text.muted,
          fontSize: designTokens.typography.fontSizes.bodySmall,
        }}
      >
        Loading waveform...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.md,
          color: designTokens.colors.text.muted,
          fontSize: designTokens.typography.fontSizes.bodySmall,
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height,
        cursor: 'pointer',
        backgroundColor: designTokens.colors.surface.secondary,
        borderRadius: designTokens.borderRadius.md,
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Hover timestamp tooltip */}
      {showTimestampOnHover && hoverPosition !== null && hoverTimestamp !== null && !hoveredComment && (
        <div
          style={{
            position: 'absolute',
            left: `${hoverPosition * 100}%`,
            top: -24,
            transform: 'translateX(-50%)',
            padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
            backgroundColor: designTokens.colors.surface.primary,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.sm,
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.text.primary,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {formatTimestamp(hoverTimestamp)}
        </div>
      )}

      {/* Hovered comment tooltip */}
      {hoveredComment && (
        <div
          style={{
            position: 'absolute',
            left: `${((hoveredComment.timestamp_seconds || 0) / (duration || waveformData?.duration || 1)) * 100}%`,
            top: -48,
            transform: 'translateX(-50%)',
            padding: designTokens.spacing.sm,
            backgroundColor: designTokens.colors.surface.primary,
            border: `1px solid ${designTokens.colors.accent.coral}`,
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.primary,
            maxWidth: 200,
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontWeight: designTokens.typography.fontWeights.medium, marginBottom: 2 }}>
            {hoveredComment.user_name}
          </div>
          <div
            style={{
              color: designTokens.colors.text.secondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {hoveredComment.content}
          </div>
          <div style={{ color: designTokens.colors.accent.coral, marginTop: 4, fontSize: designTokens.typography.fontSizes.caption }}>
            @ {formatTimestamp(hoveredComment.timestamp_seconds || 0)}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaveformVisualizer;
