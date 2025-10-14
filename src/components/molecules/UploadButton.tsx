import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface UploadButtonProps {
  onFromLibrary: () => void;
  onUploadNew: () => void;
  disabled?: boolean;
}

export function UploadButton({
  onFromLibrary,
  onUploadNew,
  disabled = false,
}: UploadButtonProps) {
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

  const handleOptionSelect = (action: 'library' | 'new') => {
    if (action === 'library') {
      onFromLibrary();
    } else {
      onUploadNew();
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="Upload tracks"
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
        <Upload
          size={20}
          color={designTokens.colors.text.secondary}
        />
        <span style={{
          fontSize: designTokens.typography.fontSizes.tiny,
          color: designTokens.colors.text.secondary,
          fontWeight: designTokens.typography.fontWeights.regular,
          whiteSpace: 'nowrap',
        }}>
          Upload
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
            <button
              role="menuitem"
              onClick={() => handleOptionSelect('library')}
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
                color: designTokens.colors.text.primary,
                fontWeight: designTokens.typography.fontWeights.regular,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>From Library</span>
            </button>
            <button
              role="menuitem"
              onClick={() => handleOptionSelect('new')}
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
                color: designTokens.colors.text.primary,
                fontWeight: designTokens.typography.fontWeights.regular,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Upload New</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
