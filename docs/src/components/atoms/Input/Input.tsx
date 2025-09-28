/**
 * CoreTet Design System - Input Component (Final Clean Version)
 * Exact specifications: 44px height, 6px radius, exact colors, baseline grid
 */

import React, { useState, useCallback } from 'react';
import { designTokens } from '../../../design/tokens';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ 
    label,
    error,
    icon,
    clearable = false,
    multiline = false,
    rows = 3,
    required = false,
    value,
    onChange,
    className = '',
    style,
    disabled,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
      props.onChange?.(e as any);
    }, [onChange, props.onChange]);

    const handleClear = useCallback(() => {
      setInternalValue('');
      onChange?.('');
    }, [onChange]);

    const currentValue = value !== undefined ? value : internalValue;
    const hasError = Boolean(error);
    const showClear = clearable && currentValue && !disabled;

    // Exact input specifications from design tokens
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    };

    const labelStyles: React.CSSProperties = {
      fontSize: designTokens.typography.scales.label.size,
      fontWeight: designTokens.typography.weights.medium,
      fontFamily: designTokens.typography.fontFamily,
      lineHeight: `${designTokens.typography.scales.label.lineHeight}px`,
      color: designTokens.colors.neutral.darkGray,
      marginBottom: designTokens.spacing.xs,
      display: 'block',
    };

    const inputContainerStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    };

    const baseInputStyles: React.CSSProperties = {
      // Exact dimensions
      height: multiline ? 'auto' : designTokens.dimensions.input.height,
      minHeight: multiline ? `${designTokens.dimensions.input.height}px` : undefined,
      width: '100%',
      
      // Exact border and radius
      border: hasError 
        ? `2px solid ${designTokens.colors.system.error}`
        : isFocused 
          ? `2px solid ${designTokens.colors.primary.blue}`
          : `1px solid ${designTokens.colors.border}`,
      borderRadius: designTokens.borderRadius.input,
      
      // Exact padding (accounting for icon)
      paddingLeft: icon ? `${designTokens.spacing.lg + designTokens.dimensions.icon.default + designTokens.spacing.sm}px` : `${designTokens.spacing.md}px`,
      paddingRight: showClear ? `${designTokens.spacing.lg + designTokens.dimensions.icon.default + designTokens.spacing.sm}px` : `${designTokens.spacing.md}px`,
      paddingTop: multiline ? `${designTokens.spacing.md}px` : '0',
      paddingBottom: multiline ? `${designTokens.spacing.md}px` : '0',
      
      // Exact typography
      fontSize: designTokens.typography.scales.body.size,
      fontWeight: designTokens.typography.weights.normal,
      fontFamily: designTokens.typography.fontFamily,
      lineHeight: `${designTokens.typography.scales.body.lineHeight}px`,
      
      // Exact colors
      backgroundColor: designTokens.colors.neutral.white,
      color: designTokens.colors.neutral.charcoal,
      
      // States
      outline: 'none',
      transition: 'border-color 0.2s ease',
      resize: multiline ? 'vertical' : 'none',
      
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
    };

    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      left: `${designTokens.spacing.md}px`,
      top: '50%',
      transform: 'translateY(-50%)',
      width: `${designTokens.dimensions.icon.default}px`,
      height: `${designTokens.dimensions.icon.default}px`,
      color: designTokens.colors.neutral.gray,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const clearButtonStyles: React.CSSProperties = {
      position: 'absolute',
      right: `${designTokens.spacing.md}px`,
      top: '50%',
      transform: 'translateY(-50%)',
      width: `${designTokens.dimensions.icon.default}px`,
      height: `${designTokens.dimensions.icon.default}px`,
      border: 'none',
      backgroundColor: 'transparent',
      color: designTokens.colors.neutral.gray,
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s ease',
      outline: 'none',
    };

    const errorStyles: React.CSSProperties = {
      fontSize: designTokens.typography.scales.caption.size,
      fontWeight: designTokens.typography.weights.normal,
      fontFamily: designTokens.typography.fontFamily,
      lineHeight: `${designTokens.typography.scales.caption.lineHeight}px`,
      color: designTokens.colors.system.error,
      marginTop: designTokens.spacing.xs,
      display: 'block',
    };

    const placeholderStyle = `
      ::placeholder {
        color: ${designTokens.colors.neutral.gray};
        font-weight: ${designTokens.typography.weights.normal};
      }
    `;

    const Element = multiline ? 'textarea' : 'input';

    return (
      <div style={{ ...containerStyles, ...style }} className={className}>
        {label && (
          <label style={labelStyles}>
            {label}
            {required && <span style={{ color: designTokens.colors.system.error }}> *</span>}
          </label>
        )}
        
        <div style={inputContainerStyles}>
          {icon && (
            <div style={iconStyles}>
              {icon}
            </div>
          )}
          
          <Element
            ref={ref as any}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            rows={multiline ? rows : undefined}
            style={baseInputStyles}
            {...props}
          />
          
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = designTokens.colors.neutral.charcoal;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = designTokens.colors.neutral.gray;
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {error && (
          <span style={errorStyles}>
            {error}
          </span>
        )}
        
        <style>{placeholderStyle}</style>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;