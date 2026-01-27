import React, { useState, useEffect } from 'react';
import { Play, Pause, ThumbsUp, Heart, MessageCircle, Download, Clock, Calendar, User, Folder, X, Music } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

interface TrackVersion {
  id: string;
  version_number: number;
  created_at: string;
  is_current: boolean;
}

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
  timestamp_seconds?: number;
}

interface WorkInfo {
  id: string;
  name: string;
  version_count?: number;
}

interface TrackDetailPanelProps {
  track: {
    id: string;
    title: string;
    duration_seconds?: number;
    folder_path?: string;
    created_at?: string;
    uploaded_by?: string;
  } | null;
  /** Audio element ref for syncing playback progress with main player */
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  currentRating?: 'liked' | 'loved' | null;
  aggregatedRatings?: {
    liked: number;
    loved: number;
  };
  versions?: TrackVersion[];
  comments?: Comment[];
  /** Work (song project) this track belongs to */
  work?: WorkInfo | null;
  onPlayPause?: () => void;
  onRate?: (rating: 'liked' | 'loved') => void;
  onClose?: () => void;
  onVersionSelect?: (version: TrackVersion) => void;
  onAddComment?: (content: string) => void;
  /** Called when user clicks to view the work */
  onWorkClick?: (work: WorkInfo) => void;
}

/**
 * TrackDetailPanel - Right sidebar showing detailed track information
 *
 * Features:
 * - Track info (title, duration, folder, upload date)
 * - Playback controls with future waveform placeholder
 * - Version history
 * - Aggregated ratings
 * - Comment thread
 */
export const TrackDetailPanel: React.FC<TrackDetailPanelProps> = ({
  track,
  audioRef,
  isPlaying = false,
  currentRating,
  aggregatedRatings,
  versions = [],
  comments = [],
  work,
  onPlayPause,
  onRate,
  onClose,
  onVersionSelect,
  onAddComment,
  onWorkClick,
}) => {
  const designTokens = useDesignTokens();
  const [currentTime, setCurrentTime] = useState(0);

  // Sync with audio playback progress
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('timeupdate', updateTime);

    // Set initial time if audio is already playing
    if (audio.currentTime > 0) {
      setCurrentTime(audio.currentTime);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [audioRef, track?.id]);

  // Reset time when track changes
  useEffect(() => {
    setCurrentTime(0);
  }, [track?.id]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!track) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: designTokens.spacing.xl,
          color: designTokens.colors.text.muted,
        }}
      >
        <MessageCircle size={48} strokeWidth={1} />
        <p style={{ marginTop: designTokens.spacing.md, textAlign: 'center' }}>
          Select a track to view details
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: designTokens.typography.fontFamily,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: designTokens.spacing.md,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: designTokens.spacing.sm,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: designTokens.typography.fontSizes.h4,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {track.title}
          </h2>
          {track.folder_path && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px',
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.tertiary,
              }}
            >
              <Folder size={12} />
              {track.folder_path}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: designTokens.borderRadius.sm,
              color: designTokens.colors.text.tertiary,
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: designTokens.spacing.md,
        }}
      >
        {/* Waveform Placeholder */}
        <div
          style={{
            backgroundColor: designTokens.colors.surface.tertiary,
            borderRadius: designTokens.borderRadius.md,
            padding: designTokens.spacing.lg,
            marginBottom: designTokens.spacing.lg,
          }}
        >
          {/* Waveform visualization placeholder */}
          <div
            style={{
              height: '80px',
              backgroundColor: designTokens.colors.surface.primary,
              borderRadius: designTokens.borderRadius.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: designTokens.spacing.md,
              border: `1px dashed ${designTokens.colors.borders.default}`,
            }}
          >
            <span style={{ color: designTokens.colors.text.muted, fontSize: designTokens.typography.fontSizes.bodySmall }}>
              Waveform visualization coming soon
            </span>
          </div>

          {/* Playback Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.md,
            }}
          >
            <button
              onClick={onPlayPause}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: designTokens.colors.primary.blue,
                color: designTokens.colors.neutral.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '2px' }} />}
            </button>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: '4px',
                  backgroundColor: designTokens.colors.surface.primary,
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${track.duration_seconds ? (currentTime / track.duration_seconds) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: designTokens.colors.primary.blue,
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.secondary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatDuration(currentTime)} / {formatDuration(track.duration_seconds)}
            </span>
          </div>
        </div>

        {/* Track Info */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <h3
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Track Info
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
              <Clock size={14} color={designTokens.colors.text.tertiary} />
              <span style={{ fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.text.secondary }}>
                Duration: {formatDuration(track.duration_seconds)}
              </span>
            </div>
            {track.created_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                <Calendar size={14} color={designTokens.colors.text.tertiary} />
                <span style={{ fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.text.secondary }}>
                  Uploaded: {formatDate(track.created_at)}
                </span>
              </div>
            )}
            {track.uploaded_by && (
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                <User size={14} color={designTokens.colors.text.tertiary} />
                <span style={{ fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.text.secondary }}>
                  By: {track.uploaded_by}
                </span>
              </div>
            )}
            {work && (
              <button
                onClick={() => onWorkClick?.(work)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  backgroundColor: designTokens.colors.surface.secondary,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.sm,
                  padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                  cursor: onWorkClick ? 'pointer' : 'default',
                  marginTop: designTokens.spacing.xs,
                }}
              >
                <Music size={14} color={designTokens.colors.primary.blue} />
                <span style={{
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.text.primary,
                }}>
                  Part of: <strong>{work.name}</strong>
                </span>
                {work.version_count && work.version_count > 1 && (
                  <span style={{
                    fontSize: designTokens.typography.fontSizes.caption,
                    color: designTokens.colors.text.muted,
                  }}>
                    ({work.version_count} versions)
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Ratings Section */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <h3
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Ratings
          </h3>
          <div style={{ display: 'flex', gap: designTokens.spacing.md }}>
            {/* Like Button */}
            <button
              onClick={() => onRate?.('liked')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                padding: designTokens.spacing.sm,
                borderRadius: designTokens.borderRadius.sm,
                border: currentRating === 'liked'
                  ? 'none'
                  : `1px solid ${designTokens.colors.borders.default}`,
                backgroundColor: currentRating === 'liked'
                  ? designTokens.colors.ratings.liked.bg
                  : 'transparent',
                color: currentRating === 'liked'
                  ? designTokens.colors.neutral.white
                  : designTokens.colors.text.secondary,
                cursor: 'pointer',
                fontSize: designTokens.typography.fontSizes.body,
                fontFamily: designTokens.typography.fontFamily,
              }}
            >
              <ThumbsUp size={18} fill={currentRating === 'liked' ? 'currentColor' : 'none'} />
              <span>{aggregatedRatings?.liked || 0}</span>
            </button>

            {/* Love Button */}
            <button
              onClick={() => onRate?.('loved')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                padding: designTokens.spacing.sm,
                borderRadius: designTokens.borderRadius.sm,
                border: currentRating === 'loved'
                  ? 'none'
                  : `1px solid ${designTokens.colors.borders.default}`,
                backgroundColor: currentRating === 'loved'
                  ? designTokens.colors.ratings.loved.bg
                  : 'transparent',
                color: currentRating === 'loved'
                  ? designTokens.colors.neutral.white
                  : designTokens.colors.text.secondary,
                cursor: 'pointer',
                fontSize: designTokens.typography.fontSizes.body,
                fontFamily: designTokens.typography.fontFamily,
              }}
            >
              <Heart size={18} fill={currentRating === 'loved' ? 'currentColor' : 'none'} />
              <span>{aggregatedRatings?.loved || 0}</span>
            </button>
          </div>
        </div>

        {/* Versions Section */}
        {versions.length > 0 && (
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <h3
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: designTokens.spacing.sm,
              }}
            >
              Versions ({versions.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => onVersionSelect?.(version)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: designTokens.spacing.sm,
                    backgroundColor: version.is_current
                      ? designTokens.colors.surface.active
                      : 'transparent',
                    border: `1px solid ${version.is_current ? designTokens.colors.primary.blue : designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.sm,
                    cursor: 'pointer',
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontFamily: designTokens.typography.fontFamily,
                    color: designTokens.colors.text.primary,
                  }}
                >
                  <span>
                    v{version.version_number}
                    {version.is_current && (
                      <span style={{ color: designTokens.colors.primary.blue, marginLeft: '8px' }}>
                        (current)
                      </span>
                    )}
                  </span>
                  <span style={{ color: designTokens.colors.text.tertiary }}>
                    {formatDate(version.created_at)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div>
          <h3
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Comments ({comments.length})
          </h3>
          {comments.length === 0 ? (
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.muted,
                fontStyle: 'italic',
              }}
            >
              No comments yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: designTokens.spacing.sm,
                    backgroundColor: designTokens.colors.surface.tertiary,
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        fontWeight: designTokens.typography.fontWeights.medium,
                        color: designTokens.colors.text.primary,
                      }}
                    >
                      {comment.user_name}
                    </span>
                    <span
                      style={{
                        fontSize: designTokens.typography.fontSizes.caption,
                        color: designTokens.colors.text.muted,
                      }}
                    >
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.text.secondary,
                      margin: 0,
                    }}
                  >
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDetailPanel;
