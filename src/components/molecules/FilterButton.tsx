import React, { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface FilterButtonProps {
  activeFilter: 'all' | 'listened' | 'liked' | 'loved' | 'unrated';
  onFilterChange: (filter: 'all' | 'listened' | 'liked' | 'loved' | 'unrated') => void;
  disabled?: boolean;
}

export function FilterButton({
  activeFilter,
  onFilterChange,
  disabled = false,
}: FilterButtonProps) {
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

  const handleFilterSelect = (filter: 'all' | 'listened' | 'liked' | 'loved' | 'unrated') => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  const isActive = activeFilter !== 'all';
  const filterLabel = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={`Filter tracks, currently showing ${filterLabel}`}
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
            minWidth: '180px',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: `${designTokens.spacing.xs} 0`,
          }}>
            {(['all', 'listened', 'liked', 'loved', 'unrated'] as const).map((filter) => {
              const isCurrentFilter = activeFilter === filter;
              const label = filter.charAt(0).toUpperCase() + filter.slice(1);

              return (
                <button
                  key={filter}
                  role="menuitem"
                  onClick={() => handleFilterSelect(filter)}
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
        </div>
      )}
    </div>
  );
}
