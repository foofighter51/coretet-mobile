import React from 'react';
import { designTokens } from '../../design/designTokens';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'small';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export function Button({
  variant = 'primary',
  size = 'default',
  children,
  icon,
  iconOnly = false,
  disabled = false,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: ButtonProps) {
  const baseStyles = {
    fontFamily: designTokens.typography.fontFamily,
    fontSize: designTokens.typography.fontSizes.button,
    lineHeight: designTokens.typography.lineHeights.button,
    fontWeight: designTokens.typography.fontWeights.semibold,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em'
  };

  const sizeStyles = {
    default: {
      height: '44px',
      minWidth: '44px',
      paddingLeft: iconOnly ? '0' : '16px',
      paddingRight: iconOnly ? '0' : '16px',
      borderRadius: '20px',
      gap: '8px'
    },
    small: {
      height: '28px',
      minWidth: '28px',
      paddingLeft: iconOnly ? '0' : '12px',
      paddingRight: iconOnly ? '0' : '12px',
      borderRadius: '4px',
      gap: '4px'
    }
  };

  const variantStyles = {
    primary: {
      backgroundColor: designTokens.colors.primary.blue,
      color: designTokens.colors.neutral.white,
      ':hover': {
        backgroundColor: designTokens.colors.primary.blueHover
      },
      ':active': {
        transform: 'translateY(1px)'
      }
    },
    secondary: {
      backgroundColor: designTokens.colors.neutral.lightGray,
      color: designTokens.colors.neutral.charcoal,
      ':hover': {
        backgroundColor: designTokens.colors.neutral.gray
      },
      ':active': {
        transform: 'translateY(1px)'
      }
    }
  };

  const disabledStyles = {
    backgroundColor: designTokens.colors.neutral.lightGray,
    color: designTokens.colors.neutral.gray,
    cursor: 'not-allowed',
    opacity: 0.6
  };

  const styles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...(disabled ? disabledStyles : variantStyles[variant])
  };

  return (
    <button
      style={styles}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={iconOnly ? ariaLabel : undefined}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
        } else if (!disabled && variant === 'secondary') {
          e.currentTarget.style.backgroundColor = designTokens.colors.neutral.gray;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variant === 'primary'
            ? designTokens.colors.primary.blue
            : designTokens.colors.neutral.lightGray;
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(1px)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      {...props}
    >
      {icon}
      {!iconOnly && children}
    </button>
  );
}