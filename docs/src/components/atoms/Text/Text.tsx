/**
 * CoreTet Design System - Text Component (Final Clean Version)
 * Exact specifications: SF Pro Display, exact scales, baseline grid alignment
 */

import React from 'react';
import { designTokens } from '../../../design/tokens';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'giant' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button';
  color?: 'primary' | 'secondary' | 'darkGray' | 'accent' | 'error' | 'success' | 'warning' | 'white';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'ultralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'em';
  truncate?: boolean;
  noSelect?: boolean;
  children: React.ReactNode;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    variant = 'body',
    color = 'primary',
    align = 'left',
    weight,
    as,
    truncate = false,
    noSelect = false,
    children,
    className = '',
    style,
    ...props 
  }, ref) => {
    // Get exact typography scale
    const scale = designTokens.typography.scales[variant];
    
    // Determine HTML element
    const elementMap = {
      giant: 'h1',
      h1: 'h1',
      h2: 'h2', 
      h3: 'h3',
      h4: 'h4',
      body: 'p',
      bodySmall: 'span',
      caption: 'span',
      label: 'label',
      button: 'span',
    };
    
    const Element = as || elementMap[variant] || 'span';
    
    // Get exact color
    const getColor = () => {
      switch (color) {
        case 'primary':
          return designTokens.colors.neutral.charcoal;
        case 'secondary':
          return designTokens.colors.neutral.gray;
        case 'darkGray':
          return designTokens.colors.neutral.darkGray;
        case 'accent':
          return designTokens.colors.primary.blue;
        case 'error':
          return designTokens.colors.system.error;
        case 'success':
          return designTokens.colors.system.success;
        case 'warning':
          return designTokens.colors.system.warning;
        case 'white':
          return designTokens.colors.neutral.white;
        default:
          return designTokens.colors.neutral.charcoal;
      }
    };
    
    // Get exact font weight
    const getFontWeight = () => {
      if (weight) {
        return designTokens.typography.weights[weight];
      }
      return scale.weight;
    };
    
    // Exact text styles from design tokens
    const textStyles: React.CSSProperties = {
      // Exact typography
      fontFamily: designTokens.typography.fontFamily,
      fontSize: `${scale.size}px`,
      fontWeight: getFontWeight(),
      lineHeight: `${scale.lineHeight}px`,
      color: getColor(),
      
      // Alignment
      textAlign: align,
      
      // Truncation
      ...(truncate && {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
      
      // User selection
      ...(noSelect && {
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }),
      
      // Button specific styles
      ...(variant === 'button' && {
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }),
      
      // Reset margins and padding
      margin: 0,
      padding: 0,
    };

    return React.createElement(
      Element,
      {
        ref,
        className,
        style: { ...textStyles, ...style },
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';

export default Text;