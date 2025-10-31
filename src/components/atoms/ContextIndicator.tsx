import React from 'react';
import { Users, User } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface ContextIndicatorProps {
  context: 'band' | 'personal';
  bandName?: string;
  compact?: boolean;
}

export const ContextIndicator: React.FC<ContextIndicatorProps> = ({
  context,
  bandName,
  compact = false,
}) => {
  const Icon = context === 'band' ? Users : User;
  const label = context === 'band' ? (bandName || 'Band') : 'Personal';

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.xs,
        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
        backgroundColor: context === 'band'
          ? designTokens.colors.primary.blueLight
          : designTokens.colors.surface.secondary,
        border: `1px solid ${
          context === 'band'
            ? designTokens.colors.primary.blue
            : designTokens.colors.borders.default
        }`,
        borderRadius: designTokens.borderRadius.full,
        fontSize: designTokens.typography.fontSizes.caption,
        color: context === 'band'
          ? designTokens.colors.primary.blue
          : designTokens.colors.neutral.darkGray,
        fontWeight: designTokens.typography.fontWeights.medium,
      }}>
        <Icon size={12} />
        {label}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: designTokens.spacing.sm,
      padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
      backgroundColor: context === 'band'
        ? designTokens.colors.primary.blueLight
        : designTokens.colors.surface.secondary,
      border: `1px solid ${
        context === 'band'
          ? designTokens.colors.primary.blue
          : designTokens.colors.borders.default
      }`,
      borderRadius: designTokens.borderRadius.md,
      fontSize: designTokens.typography.fontSizes.bodySmall,
      color: context === 'band'
        ? designTokens.colors.primary.blue
        : designTokens.colors.neutral.charcoal,
      fontWeight: designTokens.typography.fontWeights.medium,
    }}>
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );
};
