import React from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';

interface SpinnerProps {
  size?: number;
  color?: string;
  label?: string;
}

export function Spinner({ size = 40, color, label }: SpinnerProps) {
  const designTokens = useDesignTokens();
  const spinnerColor = color || designTokens.colors.primary.blue;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        role="status"
        aria-label={label || 'Loading'}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `3px solid ${designTokens.colors.neutral.lightGray}`,
          borderTop: `3px solid ${spinnerColor}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {label && (
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: designTokens.colors.neutral.darkGray,
        }}>
          {label}
        </p>
      )}
    </div>
  );
}
