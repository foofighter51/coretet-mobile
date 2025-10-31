import React from 'react';
import { designTokens } from '../../design/designTokens';

interface InlineSpinnerProps {
  size?: number;
  color?: string;
  message?: string;
}

export const InlineSpinner: React.FC<InlineSpinnerProps> = ({
  size = 32,
  color = designTokens.colors.primary.blue,
  message
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: designTokens.spacing.xl,
      gap: designTokens.spacing.md
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `3px solid ${designTokens.colors.neutral.lightGray}`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      {message && (
        <p style={{
          fontSize: designTokens.typography.fontSizes.bodySmall,
          color: designTokens.colors.text.secondary,
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
