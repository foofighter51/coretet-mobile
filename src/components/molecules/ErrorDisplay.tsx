import React from 'react';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { ErrorInfo } from '../../utils/errorMessages';

interface ErrorDisplayProps {
  error: ErrorInfo | null;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <AlertCircle size={20} color="#d32f2f" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f57f17" />;
      case 'info':
        return <Info size={20} color="#1976d2" />;
      default:
        return <AlertCircle size={20} color="#d32f2f" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.type) {
      case 'error':
        return '#ffebee';
      case 'warning':
        return '#fff8e1';
      case 'info':
        return '#e3f2fd';
      default:
        return '#ffebee';
    }
  };

  const getBorderColor = () => {
    switch (error.type) {
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      default:
        return '#f44336';
    }
  };

  const getTextColor = () => {
    switch (error.type) {
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#f57f17';
      case 'info':
        return '#1976d2';
      default:
        return '#d32f2f';
    }
  };

  return (
    <div style={{
      backgroundColor: getBackgroundColor(),
      border: `1px solid ${getBorderColor()}`,
      borderRadius: '12px',
      padding: designTokens.spacing.md,
      margin: `${designTokens.spacing.lg} 0`,
      display: 'flex',
      flexDirection: 'column',
      gap: designTokens.spacing.sm
    }}>
      {/* Header with icon and title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.sm
      }}>
        {getIcon()}
        <h4 style={{
          margin: 0,
          fontSize: designTokens.typography.fontSizes.bodySmall,
          fontWeight: designTokens.typography.fontWeights.semibold,
          color: getTextColor(),
          fontFamily: designTokens.typography.fontFamily
        }}>
          {error.title}
        </h4>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: getTextColor(),
              cursor: 'pointer',
              fontSize: '18px',
              padding: '2px',
              lineHeight: 1
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>

      {/* Message */}
      <p style={{
        margin: 0,
        fontSize: designTokens.typography.fontSizes.bodySmall,
        color: getTextColor(),
        fontFamily: designTokens.typography.fontFamily,
        lineHeight: designTokens.typography.lineHeights.body
      }}>
        {error.message}
      </p>

      {/* Action (if provided) */}
      {error.action && (
        <div style={{
          paddingTop: designTokens.spacing.xs,
          borderTop: `1px solid ${getBorderColor()}40`,
          marginTop: designTokens.spacing.xs
        }}>
          <p style={{
            margin: 0,
            fontSize: designTokens.typography.fontSizes.caption,
            color: getTextColor(),
            fontFamily: designTokens.typography.fontFamily,
            fontWeight: designTokens.typography.fontWeights.medium,
            opacity: 0.8
          }}>
            💡 {error.action}
          </p>
        </div>
      )}
    </div>
  );
}