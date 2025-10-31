import React from 'react';
import { LucideIcon } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
      textAlign: 'center',
      minHeight: '300px',
    }}>
      {/* Icon */}
      <div style={{
        marginBottom: designTokens.spacing.lg,
        opacity: 0.3,
      }}>
        <Icon size={64} color={designTokens.colors.neutral.darkGray} />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: designTokens.typography.fontSizes.h3,
        fontWeight: designTokens.typography.fontWeights.semibold,
        color: designTokens.colors.neutral.charcoal,
        margin: `0 0 ${designTokens.spacing.sm} 0`,
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: designTokens.typography.fontSizes.body,
        color: designTokens.colors.neutral.darkGray,
        margin: `0 0 ${designTokens.spacing.lg} 0`,
        maxWidth: '300px',
        lineHeight: 1.5,
      }}>
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
            backgroundColor: action.variant === 'secondary'
              ? 'transparent'
              : designTokens.colors.primary.blue,
            color: action.variant === 'secondary'
              ? designTokens.colors.primary.blue
              : designTokens.colors.text.inverse,
            border: action.variant === 'secondary'
              ? `1px solid ${designTokens.colors.primary.blue}`
              : 'none',
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.medium,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
