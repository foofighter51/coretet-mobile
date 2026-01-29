import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Filter, Check, ChevronDown, X, User, Users } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import type { RatingFilter } from './FilterButton';

export type SortField = 'position' | 'name' | 'duration' | 'rating' | 'date' | 'type';
export type SortDirection = 'asc' | 'desc';
export type { RatingFilter } from './FilterButton';

export interface SortOption {
  field: SortField;
  label: string;
}

export interface PlaylistHeaderProps {
  /** Current sort field */
  sortBy: SortField;
  /** Sort direction */
  sortDirection: SortDirection;
  /** Current rating filter */
  ratingFilter: RatingFilter;
  /** Available version types for filtering */
  versionTypes?: string[];
  /** Selected version type filter */
  typeFilter?: string | null;
  /** Called when sort changes */
  onSortChange: (field: SortField, direction: SortDirection) => void;
  /** Called when rating filter changes */
  onRatingFilterChange: (filter: RatingFilter) => void;
  /** Called when type filter changes */
  onTypeFilterChange?: (type: string | null) => void;
  /** Total track count */
  trackCount?: number;
  /** Show compact version */
  compact?: boolean;
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'position', label: 'Order' },
  { field: 'name', label: 'Name' },
  { field: 'duration', label: 'Duration' },
  { field: 'rating', label: 'Rating' },
  { field: 'date', label: 'Date Added' },
  { field: 'type', label: 'Type' },
];

const RATING_FILTERS: { value: RatingFilter; label: string; icon?: 'user' | 'users' }[] = [
  { value: 'all', label: 'All' },
  { value: 'loved_by_me', label: 'Loved by Me', icon: 'user' },
  { value: 'loved_by_multiple', label: 'Loved by Band', icon: 'users' },
  { value: 'liked_by_me', label: 'Liked by Me', icon: 'user' },
  { value: 'liked_by_multiple', label: 'Liked by Band', icon: 'users' },
  { value: 'unrated', label: 'Unrated' },
];

/**
 * PlaylistHeader - Sort and filter controls for playlist track lists
 *
 * Features:
 * - Sort by: order, name, duration, rating, date, type
 * - Filter by rating: all, loved, liked, unrated
 * - Filter by version type
 * - Compact mode for space-constrained UIs
 */
export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  sortBy,
  sortDirection,
  ratingFilter,
  versionTypes = [],
  typeFilter,
  onSortChange,
  onRatingFilterChange,
  onTypeFilterChange,
  trackCount,
  compact = false,
}) => {
  const designTokens = useDesignTokens();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find(o => o.field === sortBy)?.label || 'Order';
  const hasActiveFilter = ratingFilter !== 'all' || typeFilter;

  const handleSortSelect = (field: SortField) => {
    if (field === sortBy) {
      // Toggle direction
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      onSortChange(field, 'asc');
    }
    setShowSortMenu(false);
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    padding: compact
      ? `${designTokens.spacing.xs} ${designTokens.spacing.sm}`
      : `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    backgroundColor: 'transparent',
    border: `1px solid ${designTokens.colors.borders.default}`,
    borderRadius: designTokens.borderRadius.sm,
    color: designTokens.colors.text.secondary,
    fontSize: designTokens.typography.fontSizes.bodySmall,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    minWidth: '160px',
    backgroundColor: designTokens.colors.surface.primary,
    border: `1px solid ${designTokens.colors.borders.default}`,
    borderRadius: designTokens.borderRadius.md,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 100,
    overflow: 'hidden',
  };

  const menuItemStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    backgroundColor: 'transparent',
    border: 'none',
    color: designTokens.colors.text.primary,
    fontSize: designTokens.typography.fontSizes.bodySmall,
    cursor: 'pointer',
    textAlign: 'left',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: designTokens.spacing.sm,
        padding: compact ? designTokens.spacing.sm : designTokens.spacing.md,
        borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
      }}
    >
      {/* Left: Track count */}
      {trackCount !== undefined && (
        <span
          style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.muted,
          }}
        >
          {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
        </span>
      )}

      {/* Right: Sort and Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
        {/* Sort Dropdown */}
        <div ref={sortMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            style={buttonStyle}
          >
            <ArrowUpDown size={14} />
            {!compact && currentSortLabel}
            {sortDirection === 'desc' && <span style={{ fontSize: '10px' }}>↓</span>}
            {sortDirection === 'asc' && <span style={{ fontSize: '10px' }}>↑</span>}
          </button>

          {showSortMenu && (
            <div style={menuStyle}>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.field}
                  onClick={() => handleSortSelect(option.field)}
                  style={{
                    ...menuItemStyle,
                    backgroundColor: sortBy === option.field
                      ? designTokens.colors.surface.active
                      : 'transparent',
                  }}
                >
                  <span>{option.label}</span>
                  {sortBy === option.field && (
                    <span style={{ color: designTokens.colors.primary.blue }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Dropdown */}
        <div ref={filterMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
            style={{
              ...buttonStyle,
              borderColor: hasActiveFilter
                ? designTokens.colors.primary.blue
                : designTokens.colors.borders.default,
              color: hasActiveFilter
                ? designTokens.colors.primary.blue
                : designTokens.colors.text.secondary,
            }}
          >
            <Filter size={14} />
            {!compact && 'Filter'}
            {hasActiveFilter && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: designTokens.colors.primary.blue,
                }}
              />
            )}
          </button>

          {showFilterMenu && (
            <div style={{ ...menuStyle, right: 0, left: 'auto', minWidth: '180px' }}>
              {/* Rating Filter Section */}
              <div
                style={{
                  padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                  fontSize: designTokens.typography.fontSizes.caption,
                  color: designTokens.colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
                }}
              >
                Rating
              </div>
              {RATING_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    onRatingFilterChange(filter.value);
                    if (!typeFilter) setShowFilterMenu(false);
                  }}
                  style={{
                    ...menuItemStyle,
                    backgroundColor: ratingFilter === filter.value
                      ? designTokens.colors.surface.active
                      : 'transparent',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
                    {filter.icon === 'user' && <User size={12} />}
                    {filter.icon === 'users' && <Users size={12} />}
                    {filter.label}
                  </span>
                  {ratingFilter === filter.value && (
                    <Check size={14} color={designTokens.colors.primary.blue} />
                  )}
                </button>
              ))}

              {/* Type Filter Section */}
              {versionTypes.length > 0 && onTypeFilterChange && (
                <>
                  <div
                    style={{
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.text.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderTop: `1px solid ${designTokens.colors.borders.subtle}`,
                      borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
                      marginTop: designTokens.spacing.xs,
                    }}
                  >
                    Version Type
                  </div>
                  <button
                    onClick={() => {
                      onTypeFilterChange(null);
                      setShowFilterMenu(false);
                    }}
                    style={{
                      ...menuItemStyle,
                      backgroundColor: !typeFilter
                        ? designTokens.colors.surface.active
                        : 'transparent',
                    }}
                  >
                    <span>All Types</span>
                    {!typeFilter && (
                      <Check size={14} color={designTokens.colors.primary.blue} />
                    )}
                  </button>
                  {versionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        onTypeFilterChange(type);
                        setShowFilterMenu(false);
                      }}
                      style={{
                        ...menuItemStyle,
                        backgroundColor: typeFilter === type
                          ? designTokens.colors.surface.active
                          : 'transparent',
                      }}
                    >
                      <span>{type}</span>
                      {typeFilter === type && (
                        <Check size={14} color={designTokens.colors.primary.blue} />
                      )}
                    </button>
                  ))}
                </>
              )}

              {/* Clear Filters */}
              {hasActiveFilter && (
                <button
                  onClick={() => {
                    onRatingFilterChange('all');
                    onTypeFilterChange?.(null);
                    setShowFilterMenu(false);
                  }}
                  style={{
                    ...menuItemStyle,
                    borderTop: `1px solid ${designTokens.colors.borders.subtle}`,
                    color: designTokens.colors.system.error,
                    marginTop: designTokens.spacing.xs,
                  }}
                >
                  <X size={14} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
