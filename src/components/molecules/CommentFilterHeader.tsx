import React, { useState, useRef, useEffect } from 'react';
import { Filter, ArrowUpDown, Check, ChevronDown, X } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

export type CommentSortOption = 'timestamp' | 'newest' | 'oldest';

export interface CommentFilterHeaderProps {
  /** Total comment count (before filtering) */
  commentCount: number;
  /** Available tracks to filter by */
  tracks: { id: string; title: string; version_type?: string | null }[];
  /** Currently selected track ID for filtering (null = all tracks) */
  selectedTrackId: string | null;
  /** Current sort option */
  sortBy: CommentSortOption;
  /** Called when track filter changes */
  onTrackFilterChange: (trackId: string | null) => void;
  /** Called when sort option changes */
  onSortChange: (sortBy: CommentSortOption) => void;
  /** Filtered comment count (after filtering) */
  filteredCount?: number;
}

const SORT_LABELS: Record<CommentSortOption, string> = {
  timestamp: 'By Timestamp',
  newest: 'Newest First',
  oldest: 'Oldest First',
};

/**
 * CommentFilterHeader - Compact filter and sort controls for comments
 */
export const CommentFilterHeader: React.FC<CommentFilterHeaderProps> = ({
  commentCount,
  tracks,
  selectedTrackId,
  sortBy,
  onTrackFilterChange,
  onSortChange,
  filteredCount,
}) => {
  const designTokens = useDesignTokens();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTrack = selectedTrackId
    ? tracks.find((t) => t.id === selectedTrackId)
    : null;

  const displayCount = filteredCount !== undefined ? filteredCount : commentCount;
  const isFiltered = selectedTrackId !== null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
        backgroundColor: designTokens.colors.surface.primary,
      }}
    >
      {/* Left: Comment count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing.sm,
        }}
      >
        <span
          style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.secondary,
          }}
        >
          {displayCount} {displayCount === 1 ? 'Comment' : 'Comments'}
        </span>
        {isFiltered && displayCount !== commentCount && (
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.text.muted,
            }}
          >
            (of {commentCount})
          </span>
        )}
      </div>

      {/* Right: Filter and Sort controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing.xs,
        }}
      >
        {/* Track Filter */}
        {tracks.length > 1 && (
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                backgroundColor: isFiltered
                  ? `${designTokens.colors.primary.blue}15`
                  : 'transparent',
                border: `1px solid ${
                  isFiltered
                    ? designTokens.colors.primary.blue
                    : designTokens.colors.borders.default
                }`,
                borderRadius: designTokens.borderRadius.sm,
                color: isFiltered
                  ? designTokens.colors.primary.blue
                  : designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSizes.caption,
                cursor: 'pointer',
                maxWidth: '150px',
              }}
            >
              <Filter size={12} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedTrack ? selectedTrack.title : 'All Tracks'}
              </span>
              {isFiltered ? (
                <X
                  size={12}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackFilterChange(null);
                  }}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                />
              ) : (
                <ChevronDown size={12} style={{ flexShrink: 0 }} />
              )}
            </button>

            {showFilterMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  minWidth: '180px',
                  maxWidth: '250px',
                  backgroundColor: designTokens.colors.surface.primary,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.md,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {/* All Tracks option */}
                <button
                  onClick={() => {
                    onTrackFilterChange(null);
                    setShowFilterMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: !selectedTrackId
                      ? designTokens.colors.surface.active
                      : 'transparent',
                    border: 'none',
                    color: designTokens.colors.text.primary,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>All Tracks</span>
                  {!selectedTrackId && (
                    <Check size={14} color={designTokens.colors.primary.blue} />
                  )}
                </button>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    backgroundColor: designTokens.colors.borders.subtle,
                  }}
                />

                {/* Track options */}
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      onTrackFilterChange(track.id);
                      setShowFilterMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                      backgroundColor:
                        selectedTrackId === track.id
                          ? designTokens.colors.surface.active
                          : 'transparent',
                      border: 'none',
                      color: designTokens.colors.text.primary,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.xs,
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
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
                            padding: '1px 4px',
                            fontSize: designTokens.typography.fontSizes.label,
                            backgroundColor: designTokens.colors.surface.tertiary,
                            borderRadius: designTokens.borderRadius.xs,
                            color: designTokens.colors.text.muted,
                            textTransform: 'capitalize',
                            flexShrink: 0,
                          }}
                        >
                          {track.version_type}
                        </span>
                      )}
                    </span>
                    {selectedTrackId === track.id && (
                      <Check size={14} color={designTokens.colors.primary.blue} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sort */}
        <div ref={sortRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
              backgroundColor: 'transparent',
              border: `1px solid ${designTokens.colors.borders.default}`,
              borderRadius: designTokens.borderRadius.sm,
              color: designTokens.colors.text.secondary,
              fontSize: designTokens.typography.fontSizes.caption,
              cursor: 'pointer',
            }}
            title={`Sort: ${SORT_LABELS[sortBy]}`}
          >
            <ArrowUpDown size={12} />
            <span>{SORT_LABELS[sortBy]}</span>
            <ChevronDown size={12} />
          </button>

          {showSortMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                minWidth: '140px',
                backgroundColor: designTokens.colors.surface.primary,
                border: `1px solid ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.md,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              {(Object.keys(SORT_LABELS) as CommentSortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSortChange(option);
                    setShowSortMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor:
                      sortBy === option
                        ? designTokens.colors.surface.active
                        : 'transparent',
                    border: 'none',
                    color: designTokens.colors.text.primary,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{SORT_LABELS[option]}</span>
                  {sortBy === option && (
                    <Check size={14} color={designTokens.colors.primary.blue} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentFilterHeader;
