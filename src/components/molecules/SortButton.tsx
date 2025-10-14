import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, GripVertical } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface SortButtonProps {
  currentSort: 'position' | 'name' | 'duration' | 'rating';
  sortAscending: boolean;
  onSort: (sort: 'position' | 'name' | 'duration' | 'rating') => void;
  onReorder?: () => void;
  showReorder?: boolean;
  disabled?: boolean;
}

export function SortButton({
  currentSort,
  sortAscending,
  onSort,
  onReorder,
  showReorder = false,
  disabled = false,
}: SortButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getSortLabel = () => {
    if (currentSort === 'position') return 'Default';
    const label = currentSort.charAt(0).toUpperCase() + currentSort.slice(1);
    const arrow = sortAscending ? ' ↑' : ' ↓';
    return label + arrow;
  };

  const handleSortSelect = (sort: 'position' | 'name' | 'duration' | 'rating') => {
    onSort(sort);
    setIsOpen(false);
  };

  const isActive = currentSort !== 'position';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={`Sort tracks, currently sorted by ${getSortLabel()}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
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
          <ArrowUpDown
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
          {currentSort === 'position' ? 'Sort' : getSortLabel()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: designTokens.spacing.xs,
            backgroundColor: designTokens.colors.surface.primary,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.md,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Sort Options */}
          <div style={{
            padding: `${designTokens.spacing.xs} 0`,
          }}>
            {(['position', 'name', 'duration', 'rating'] as const).map((sort) => {
              const isCurrentSort = currentSort === sort;
              const label = sort === 'position' ? 'Default' : sort.charAt(0).toUpperCase() + sort.slice(1);

              return (
                <button
                  key={sort}
                  role="menuitem"
                  onClick={() => handleSortSelect(sort)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: isCurrentSort ? designTokens.colors.primary.blueLight : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: isCurrentSort ? designTokens.colors.primary.blue : designTokens.colors.text.primary,
                    fontWeight: isCurrentSort ? designTokens.typography.fontWeights.medium : designTokens.typography.fontWeights.regular,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentSort) {
                      e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentSort) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{label}</span>
                  {isCurrentSort && sort !== 'position' && (
                    <span style={{ marginLeft: designTokens.spacing.sm }}>
                      {sortAscending ? '↑' : '↓'}
                    </span>
                  )}
                  {isCurrentSort && (
                    <span style={{ marginLeft: 'auto', paddingLeft: designTokens.spacing.sm }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Reorder Option - only show when sorted by Default */}
          {showReorder && onReorder && (
            <>
              <div style={{
                height: '1px',
                backgroundColor: designTokens.colors.borders.default,
                margin: `${designTokens.spacing.xs} 0`,
              }} />
              <button
                role="menuitem"
                onClick={() => {
                  onReorder();
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.accent.teal,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <GripVertical size={16} />
                <span>Reorder Tracks</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
