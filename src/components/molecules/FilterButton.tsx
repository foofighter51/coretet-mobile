import React from 'react';
import { Filter } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { DropdownMenu } from '../ui/DropdownMenu';

export type RatingFilter = 'all' | 'liked_by_me' | 'liked_by_multiple' | 'loved_by_me' | 'loved_by_multiple' | 'unrated';

interface FilterButtonProps {
  activeFilter: RatingFilter;
  onFilterChange: (filter: RatingFilter) => void;
  disabled?: boolean;
}

const FILTER_LABELS: Record<RatingFilter, string> = {
  all: 'All',
  liked_by_me: 'Liked by Me',
  liked_by_multiple: 'Liked by Multiple',
  loved_by_me: 'Loved by Me',
  loved_by_multiple: 'Loved by Multiple',
  unrated: 'Unrated',
};

export function FilterButton({
  activeFilter,
  onFilterChange,
  disabled = false,
}: FilterButtonProps) {
  const designTokens = useDesignTokens();
  const isActive = activeFilter !== 'all';
  const filterLabel = FILTER_LABELS[activeFilter];

  return (
    <DropdownMenu
      trigger={
        <button
          disabled={disabled}
          aria-label={`Filter tracks, currently showing ${filterLabel}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: designTokens.borderRadius.md,
            cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'relative',
            minWidth: '60px',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <div style={{ position: 'relative' }}>
            <Filter
              size={20}
              color={isActive ? designTokens.colors.primary.blue : designTokens.colors.text.secondary}
            />
            {isActive && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: designTokens.colors.primary.blue,
              }} />
            )}
          </div>
          <span style={{
            fontSize: designTokens.typography.fontSizes.tiny,
            color: isActive ? designTokens.colors.primary.blue : designTokens.colors.text.secondary,
            fontWeight: isActive ? designTokens.typography.fontWeights.medium : designTokens.typography.fontWeights.regular,
            whiteSpace: 'nowrap',
          }}>
            {isActive ? filterLabel : 'Filter'}
          </span>
        </button>
      }
      align="left"
    >
      <div style={{ padding: `${designTokens.spacing.xs} 0` }}>
        {/* Rating filter options */}
        {(['all', 'liked_by_me', 'liked_by_multiple', 'loved_by_me', 'loved_by_multiple', 'unrated'] as const).map((filter) => {
          const isCurrentFilter = activeFilter === filter;
          const label = FILTER_LABELS[filter];

          return (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: isCurrentFilter ? designTokens.colors.primary.blueLight : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: isCurrentFilter ? designTokens.colors.primary.blue : designTokens.colors.text.primary,
                fontWeight: isCurrentFilter ? designTokens.typography.fontWeights.medium : designTokens.typography.fontWeights.regular,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isCurrentFilter) {
                  e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrentFilter) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{label}</span>
              {isCurrentFilter && (
                <span style={{ marginLeft: 'auto', paddingLeft: designTokens.spacing.sm }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </DropdownMenu>
  );
}
