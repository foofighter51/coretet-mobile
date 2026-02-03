import React, { useState } from 'react';
import { Play, Pause, User, Calendar, Clock, ThumbsUp, Heart, MessageCircle, Star } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

export interface TimelineTrackVersion {
  id: string;
  title: string;
  file_url: string;
  duration_seconds?: number;
  created_at: string;
  created_by?: string;
  uploader_name?: string;
  is_hero?: boolean;
  version_type?: string | null;
  version_notes?: string | null;
}

export interface VersionTimelineCardProps {
  /** Track/version data */
  track: TimelineTrackVersion;
  /** Whether this is the hero/featured version */
  isHero?: boolean;
  /** Whether this track is currently playing */
  isPlaying?: boolean;
  /** Whether this is the currently selected track */
  isCurrentTrack?: boolean;
  /** Waveform amplitudes (normalized 0-1) for thumbnail */
  waveformData?: number[];
  /** Aggregated ratings for this version */
  aggregatedRatings?: { liked: number; loved: number };
  /** Comment count for this version */
  commentCount?: number;
  /** Called when play button is clicked */
  onPlay: () => void;
  /** Called when card is clicked (for details) */
  onClick?: () => void;
  /** Format duration helper */
  formatDuration?: (seconds?: number) => string;
  /** Format date helper */
  formatDate?: (dateString: string) => string;
}

/**
 * VersionTimelineCard - A card component for the version timeline
 *
 * Displays a version with:
 * - Waveform thumbnail (or placeholder)
 * - Version name + type badge
 * - Date, uploader, duration
 * - Play button
 * - Ratings/comments summary
 * - Optional notes preview
 */
export const VersionTimelineCard: React.FC<VersionTimelineCardProps> = ({
  track,
  isHero = false,
  isPlaying = false,
  isCurrentTrack = false,
  waveformData,
  aggregatedRatings = { liked: 0, loved: 0 },
  commentCount = 0,
  onPlay,
  onClick,
  formatDuration = (s) => s ? `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` : '--:--',
  formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
}) => {
  const designTokens = useDesignTokens();
  const [isHovered, setIsHovered] = useState(false);

  // Version type badge colors
  const getTypeBadgeColor = (type?: string | null) => {
    if (!type) return { bg: designTokens.colors.surface.tertiary, text: designTokens.colors.text.muted };
    const lowerType = type.toLowerCase();
    if (lowerType.includes('demo')) return { bg: '#FFF3E0', text: '#E65100' };
    if (lowerType.includes('rough') || lowerType.includes('working')) return { bg: '#E3F2FD', text: '#1565C0' };
    if (lowerType.includes('final') || lowerType.includes('master')) return { bg: '#E8F5E9', text: '#2E7D32' };
    if (lowerType.includes('live')) return { bg: '#FCE4EC', text: '#C2185B' };
    if (lowerType.includes('remix') || lowerType.includes('acoustic')) return { bg: '#F3E5F5', text: '#7B1FA2' };
    return { bg: designTokens.colors.surface.tertiary, text: designTokens.colors.text.secondary };
  };

  const typeBadgeColors = getTypeBadgeColor(track.version_type);

  // Render waveform thumbnail (placeholder or actual data)
  const renderWaveform = () => {
    const barCount = 50;
    const barWidth = 3;
    const barGap = 1;
    const height = 40;

    // Use actual data or generate placeholder
    const amplitudes = waveformData?.length
      ? waveformData.slice(0, barCount)
      : Array.from({ length: barCount }, () => 0.2 + Math.random() * 0.6);

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${barGap}px`,
          height: `${height}px`,
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.sm,
          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
          overflow: 'hidden',
        }}
      >
        {amplitudes.map((amp, i) => (
          <div
            key={i}
            style={{
              width: `${barWidth}px`,
              height: `${Math.max(4, amp * (height - 8))}px`,
              backgroundColor: isPlaying
                ? designTokens.colors.primary.blue
                : designTokens.colors.text.muted,
              borderRadius: '1px',
              opacity: waveformData ? 1 : 0.5,
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
    );
  };

  const hasEngagement = aggregatedRatings.liked > 0 || aggregatedRatings.loved > 0 || commentCount > 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isCurrentTrack
          ? `${designTokens.colors.primary.blue}08`
          : isHovered
            ? designTokens.colors.surface.hover
            : designTokens.colors.surface.secondary,
        borderRadius: designTokens.borderRadius.md,
        border: `1px solid ${
          isCurrentTrack
            ? designTokens.colors.primary.blue
            : isHero
              ? designTokens.colors.accent.gold
              : designTokens.colors.borders.subtle
        }`,
        padding: designTokens.spacing.md,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      {/* Hero badge */}
      {isHero && (
        <div
          style={{
            position: 'absolute',
            top: `-${designTokens.spacing.xs}`,
            left: designTokens.spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: `2px ${designTokens.spacing.xs}`,
            backgroundColor: designTokens.colors.accent.gold,
            borderRadius: designTokens.borderRadius.xs,
            fontSize: '10px',
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <Star size={10} fill="currentColor" />
          Featured
        </div>
      )}

      {/* Header: Title + Type Badge + Play Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: designTokens.spacing.sm,
          marginBottom: designTokens.spacing.sm,
          marginTop: isHero ? designTokens.spacing.xs : 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {track.title}
            </span>
            {track.version_type && (
              <span
                style={{
                  padding: `2px ${designTokens.spacing.xs}`,
                  backgroundColor: typeBadgeColors.bg,
                  color: typeBadgeColors.text,
                  borderRadius: designTokens.borderRadius.xs,
                  fontSize: designTokens.typography.fontSizes.caption,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  textTransform: 'capitalize',
                }}
              >
                {track.version_type}
              </span>
            )}
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isPlaying
              ? designTokens.colors.primary.blue
              : designTokens.colors.surface.primary,
            color: isPlaying
              ? designTokens.colors.neutral.white
              : designTokens.colors.primary.blue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
        </button>
      </div>

      {/* Waveform Thumbnail */}
      {renderWaveform()}

      {/* Metadata Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: designTokens.spacing.sm,
          fontSize: designTokens.typography.fontSizes.caption,
          color: designTokens.colors.text.muted,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.md }}>
          {track.uploader_name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} />
              {track.uploader_name}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {formatDate(track.created_at)}
          </span>
        </div>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Clock size={12} />
          {formatDuration(track.duration_seconds)}
        </span>
      </div>

      {/* Engagement Row (if any) */}
      {hasEngagement && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            marginTop: designTokens.spacing.sm,
            paddingTop: designTokens.spacing.sm,
            borderTop: `1px solid ${designTokens.colors.borders.subtle}`,
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.text.secondary,
          }}
        >
          {aggregatedRatings.liked > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ThumbsUp size={12} />
              {aggregatedRatings.liked}
            </span>
          )}
          {aggregatedRatings.loved > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={12} fill={designTokens.colors.system.error} color={designTokens.colors.system.error} />
              {aggregatedRatings.loved}
            </span>
          )}
          {commentCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageCircle size={12} />
              {commentCount}
            </span>
          )}
        </div>
      )}

      {/* Version Notes Preview (if available) */}
      {track.version_notes && (
        <div
          style={{
            marginTop: designTokens.spacing.sm,
            padding: designTokens.spacing.sm,
            backgroundColor: designTokens.colors.surface.tertiary,
            borderRadius: designTokens.borderRadius.sm,
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.text.secondary,
            fontStyle: 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          "{track.version_notes}"
        </div>
      )}
    </div>
  );
};

export default VersionTimelineCard;
