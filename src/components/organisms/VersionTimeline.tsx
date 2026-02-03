import React, { useState, useMemo } from 'react';
import { Filter, ChevronDown, Check, Star } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { VersionTimelineCard, TimelineTrackVersion } from '../molecules/VersionTimelineCard';
import { VersionType } from '../molecules/VersionTypeSelector';

export interface VersionTimelineProps {
  /** All versions to display */
  versions: TimelineTrackVersion[];
  /** ID of the hero/featured track */
  heroTrackId?: string | null;
  /** Currently playing track ID */
  currentTrackId?: string | null;
  /** Currently selected track ID (for contextual panel) */
  selectedTrackId?: string | null;
  /** Whether audio is playing */
  isPlaying?: boolean;
  /** Available version types for filtering */
  versionTypes?: VersionType[];
  /** Per-track waveform data (trackId -> amplitudes) */
  waveformData?: Record<string, number[]>;
  /** Per-track aggregated ratings (trackId -> {liked, loved}) */
  trackAggregatedRatings?: Record<string, { liked: number; loved: number }>;
  /** Per-track comment counts (trackId -> count) */
  trackCommentCounts?: Record<string, number>;
  /** Called when a track should play */
  onPlayTrack: (track: TimelineTrackVersion) => void;
  /** Called when a track card is clicked (for details) */
  onTrackClick?: (track: TimelineTrackVersion) => void;
  /** Called when hero is set */
  onSetHero?: (trackId: string) => void;
}

/**
 * VersionTimeline - A vertical card timeline showing version evolution
 *
 * Displays versions as connected cards with:
 * - Hero version highlighted at top
 * - Chronological order (newest first by default)
 * - Connecting timeline line between cards
 * - Filter by version type
 */
export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  heroTrackId,
  currentTrackId,
  selectedTrackId,
  isPlaying = false,
  versionTypes = [],
  waveformData = {},
  trackAggregatedRatings = {},
  trackCommentCounts = {},
  onPlayTrack,
  onTrackClick,
  onSetHero,
}) => {
  const designTokens = useDesignTokens();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Helper functions
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Sort and filter versions
  const processedVersions = useMemo(() => {
    let filtered = [...versions];

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((v) =>
        v.version_type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Sort: Hero first, then by date (newest first)
    filtered.sort((a, b) => {
      if (a.id === heroTrackId) return -1;
      if (b.id === heroTrackId) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return filtered;
  }, [versions, typeFilter, heroTrackId]);

  // Get unique version types from the versions
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    versions.forEach((v) => {
      if (v.version_type) types.add(v.version_type);
    });
    return Array.from(types);
  }, [versions]);

  // Empty state
  if (versions.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: designTokens.spacing.xl,
          color: designTokens.colors.text.muted,
        }}
      >
        <p style={{ margin: 0 }}>No versions yet.</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Header with filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: designTokens.spacing.md,
          padding: `0 ${designTokens.spacing.sm}`,
        }}
      >
        <span
          style={{
            fontSize: designTokens.typography.fontSizes.caption,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {processedVersions.length} {processedVersions.length === 1 ? 'Version' : 'Versions'}
        </span>

        {/* Type Filter */}
        {availableTypes.length > 1 && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                backgroundColor: typeFilter
                  ? `${designTokens.colors.primary.blue}15`
                  : 'transparent',
                border: `1px solid ${
                  typeFilter
                    ? designTokens.colors.primary.blue
                    : designTokens.colors.borders.default
                }`,
                borderRadius: designTokens.borderRadius.sm,
                color: typeFilter
                  ? designTokens.colors.primary.blue
                  : designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSizes.caption,
                cursor: 'pointer',
              }}
            >
              <Filter size={12} />
              {typeFilter || 'All Types'}
              <ChevronDown size={12} />
            </button>

            {showFilterMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  minWidth: '150px',
                  backgroundColor: designTokens.colors.surface.primary,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.md,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => {
                    setTypeFilter(null);
                    setShowFilterMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: !typeFilter
                      ? designTokens.colors.surface.active
                      : 'transparent',
                    border: 'none',
                    color: designTokens.colors.text.primary,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>All Types</span>
                  {!typeFilter && <Check size={14} color={designTokens.colors.primary.blue} />}
                </button>
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTypeFilter(type);
                      setShowFilterMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                      backgroundColor: typeFilter === type
                        ? designTokens.colors.surface.active
                        : 'transparent',
                      border: 'none',
                      color: designTokens.colors.text.primary,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: 'pointer',
                      textAlign: 'left',
                      textTransform: 'capitalize',
                    }}
                  >
                    <span>{type}</span>
                    {typeFilter === type && <Check size={14} color={designTokens.colors.primary.blue} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Version cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.lg }}>
          {processedVersions.map((track, index) => {
            const isHero = track.id === heroTrackId;
            const isCurrentTrack = track.id === currentTrackId;
            const isTrackPlaying = isPlaying && isCurrentTrack;
            const isSelected = track.id === selectedTrackId;

            return (
              <div
                key={track.id}
                style={{ position: 'relative' }}
              >
                {/* Date label */}
                <div
                  style={{
                    marginBottom: designTokens.spacing.xs,
                    fontSize: designTokens.typography.fontSizes.caption,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.text.muted,
                  }}
                >
                  {formatDate(track.created_at)}
                </div>

                {/* Version card */}
                <VersionTimelineCard
                  track={track}
                  isHero={isHero}
                  isPlaying={isTrackPlaying}
                  isCurrentTrack={isCurrentTrack}
                  isSelected={isSelected}
                  waveformData={waveformData[track.id]}
                  aggregatedRatings={trackAggregatedRatings[track.id]}
                  commentCount={trackCommentCounts[track.id]}
                  onPlay={() => onPlayTrack(track)}
                  onClick={() => onTrackClick?.(track)}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Click outside to close filter menu */}
      {showFilterMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
          }}
          onClick={() => setShowFilterMenu(false)}
        />
      )}
    </div>
  );
};

export default VersionTimeline;
