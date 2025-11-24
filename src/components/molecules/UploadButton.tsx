import React from 'react';
import { Upload } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { DropdownMenu } from '../ui/DropdownMenu';

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
  return (
    <DropdownMenu
      trigger={
        <button
          disabled={disabled}
          aria-label="Upload tracks"
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
      }
      align="left"
    >
      <div style={{ padding: `${designTokens.spacing.xs} 0` }}>
        <button
          onClick={onFromLibrary}
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
          onClick={onUploadNew}
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
    </DropdownMenu>
  );
}
