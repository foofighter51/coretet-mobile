/**
 * CoreTet Design System - Button Component (Final Clean Version)
 * Exact specifications: 44px/28px height, 20px/4px radius, exact colors
 */

import React from 'react';
import { designTokens } from '../../../design/tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'small';
  loading?: boolean;
  iconOnly?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'default', 
    loading = false,
    iconOnly = false,
    icon,
    children,
    disabled,
    className = '',
    style,
    ...props 
  }, ref) => {
    const isSmall = size === 'small';
    const isDisabled = disabled || loading;
    
    // Exact button specifications from design tokens
    const baseStyles: React.CSSProperties = {
      // Exact dimensions
      height: isSmall ? designTokens.dimensions.button.heightSmall : designTokens.dimensions.button.height,
      minWidth: isSmall ? designTokens.dimensions.button.heightSmall : designTokens.dimensions.button.height,
      paddingLeft: iconOnly ? 0 : (isSmall ? designTokens.spacing.sm : designTokens.spacing.lg),
      paddingRight: iconOnly ? 0 : (isSmall ? designTokens.spacing.sm : designTokens.spacing.lg),
      
      // Exact border radius
      borderRadius: isSmall ? 4 : designTokens.borderRadius.button,
      
      // Exact typography
      fontSize: designTokens.typography.scales.button.size,
      fontWeight: designTokens.typography.weights.semibold,
      fontFamily: designTokens.typography.fontFamily,
      lineHeight: `${designTokens.typography.scales.button.lineHeight}px`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      
      // Layout
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: icon && children ? `${designTokens.spacing.sm}px` : '0',
      border: 'none',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      
      // Exact transitions
      transition: 'all 0.2s ease',
      
      // Exact colors based on variant
      ...(variant === 'primary' ? {
        backgroundColor: isDisabled 
          ? designTokens.colors.neutral.gray 
          : designTokens.colors.primary.blue,
        color: designTokens.colors.neutral.white,
      } : {
        backgroundColor: 'transparent',
        color: isDisabled 
          ? designTokens.colors.neutral.gray 
          : designTokens.colors.primary.blue,
        border: `1px solid ${isDisabled ? designTokens.colors.neutral.gray : designTokens.colors.primary.blue}`,
      }),
      
      // Loading state opacity
      opacity: loading ? 0.7 : 1,
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        e.currentTarget.style.transform = 'translateY(1px)';
      }
      props.onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        e.currentTarget.style.transform = 'translateY(0)';
      }
      props.onMouseUp?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        e.currentTarget.style.transform = 'translateY(0)';
      }
      props.onMouseLeave?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
        } else {
          e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueUltraLight;
        }
      }
      props.onMouseEnter?.(e);
    };

    const handleMouseLeaveColor = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
        } else {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }
      handleMouseLeave(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={className}
        style={{ ...baseStyles, ...style }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeaveColor}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {loading ? (
          <span>...</span>
        ) : (
          <>
            {icon && (
              <span 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isSmall ? `${designTokens.dimensions.icon.small}px` : `${designTokens.dimensions.icon.default}px`,
                  height: isSmall ? `${designTokens.dimensions.icon.small}px` : `${designTokens.dimensions.icon.default}px`,
                }}
              >
                {icon}
              </span>
            )}
            {children && !iconOnly && <span>{children}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;