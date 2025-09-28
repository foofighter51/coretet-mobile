import React from 'react';
import { designTokens } from '../../design/designTokens';

export interface TextProps {
  variant?: 'giant' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning';
  truncate?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

export function Text({
  variant = 'body',
  color = 'primary',
  truncate = false,
  children,
  className = '',
  style = {},
  as: Component = 'p',
  ...props
}: TextProps) {
  const variantStyles = {
    giant: {
      fontSize: designTokens.typography.fontSizes.giant,
      lineHeight: designTokens.typography.lineHeights.giant,
      fontWeight: designTokens.typography.fontWeights.ultralight
    },
    h1: {
      fontSize: designTokens.typography.fontSizes.h1,
      lineHeight: designTokens.typography.lineHeights.h1,
      fontWeight: designTokens.typography.fontWeights.light
    },
    h2: {
      fontSize: designTokens.typography.fontSizes.h2,
      lineHeight: designTokens.typography.lineHeights.h2,
      fontWeight: designTokens.typography.fontWeights.normal
    },
    h3: {
      fontSize: designTokens.typography.fontSizes.h3,
      lineHeight: designTokens.typography.lineHeights.h3,
      fontWeight: designTokens.typography.fontWeights.medium
    },
    body: {
      fontSize: designTokens.typography.fontSizes.body,
      lineHeight: designTokens.typography.lineHeights.body,
      fontWeight: designTokens.typography.fontWeights.normal
    },
    bodySmall: {
      fontSize: designTokens.typography.fontSizes.bodySmall,
      lineHeight: designTokens.typography.lineHeights.bodySmall,
      fontWeight: designTokens.typography.fontWeights.normal
    },
    caption: {
      fontSize: designTokens.typography.fontSizes.caption,
      lineHeight: designTokens.typography.lineHeights.caption,
      fontWeight: designTokens.typography.fontWeights.normal
    },
    button: {
      fontSize: designTokens.typography.fontSizes.button,
      lineHeight: designTokens.typography.lineHeights.button,
      fontWeight: designTokens.typography.fontWeights.semibold,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.025em'
    }
  };

  const colorStyles = {
    primary: { color: designTokens.colors.neutral.charcoal },
    secondary: { color: designTokens.colors.neutral.gray },
    accent: { color: designTokens.colors.primary.blue },
    error: { color: designTokens.colors.system.error },
    success: { color: designTokens.colors.system.success },
    warning: { color: designTokens.colors.system.warning }
  };

  const baseStyles = {
    fontFamily: designTokens.typography.fontFamily,
    margin: 0,
    padding: 0,
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    })
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...colorStyles[color],
    ...style
  };

  return (
    <Component
      style={combinedStyles}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}