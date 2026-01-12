import React from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { DropdownMenu } from '../ui/DropdownMenu';

interface UploadButtonProps {
  onUploadNew: () => void;
  onFromLibrary: () => void;
  disabled?: boolean;
  label?: string;
}

export function UploadButton({
  onUploadNew,
  onFromLibrary,
  disabled = false,
  label = 'Upload',
}: UploadButtonProps) {
  const designTokens = useDesignTokens();

  return (
    <DropdownMenu
      trigger={
        <button
          disabled={disabled}
          aria-label={label}
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
            {label}
          </span>
        </button>
      }
    >
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
          cursor: 'pointer',
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.text.primary,
          textAlign: 'left',
        }}
      >
        <FolderOpen size={16} />
        Add from Library
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
          cursor: 'pointer',
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.text.primary,
          textAlign: 'left',
        }}
      >
        <Upload size={16} />
        Upload New
      </button>
    </DropdownMenu>
  );
}
