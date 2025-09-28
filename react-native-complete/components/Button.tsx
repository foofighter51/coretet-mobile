/**
 * CoreTet Design System - React Native Button Component
 * Exact specifications: 44px/28px height, 20px/4px radius, exact colors
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { designTokens } from '../tokens';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'small';
  loading?: boolean;
  iconOnly?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  loading = false,
  iconOnly = false,
  icon,
  children,
  disabled = false,
  style,
  ...props
}) => {
  const isSmall = size === 'small';
  const isDisabled = disabled || loading;

  // Get exact styles from design tokens
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      // Exact dimensions
      height: isSmall 
        ? designTokens.dimensions.button.heightSmall 
        : designTokens.dimensions.button.height,
      minWidth: isSmall 
        ? designTokens.dimensions.button.heightSmall 
        : designTokens.dimensions.button.height,
      paddingHorizontal: iconOnly 
        ? 0 
        : (isSmall ? designTokens.spacing.sm : designTokens.spacing.lg),
      
      // Exact border radius
      borderRadius: isSmall ? 4 : designTokens.borderRadius.button,
      
      // Layout
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      
      // Shadow (platform specific)
      ...designTokens.utils.getShadow('default'),
    };

    // Variant-specific styles
    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: isDisabled 
          ? designTokens.colors.neutral.gray 
          : designTokens.colors.primary.blue,
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDisabled 
          ? designTokens.colors.neutral.gray 
          : designTokens.colors.primary.blue,
      };
    }
  };

  const getTextStyle = (): TextStyle => {
    return {
      // Exact typography
      fontSize: designTokens.typography.scales.button.fontSize,
      fontWeight: designTokens.typography.weights.semibold,
      fontFamily: designTokens.typography.fontFamily.semibold,
      lineHeight: designTokens.typography.scales.button.lineHeight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      
      // Exact colors
      color: variant === 'primary' 
        ? designTokens.colors.neutral.white
        : (isDisabled 
            ? designTokens.colors.neutral.gray 
            : designTokens.colors.primary.blue),
    };
  };

  const buttonStyle = getButtonStyle();
  const textStyle = getTextStyle();

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' 
            ? designTokens.colors.neutral.white 
            : designTokens.colors.primary.blue
          } 
        />
      ) : (
        <View style={styles.content}>
          {icon && (
            <View 
              style={[
                styles.iconContainer,
                {
                  width: isSmall 
                    ? designTokens.dimensions.icon.small 
                    : designTokens.dimensions.icon.default,
                  height: isSmall 
                    ? designTokens.dimensions.icon.small 
                    : designTokens.dimensions.icon.default,
                  marginRight: children && !iconOnly ? designTokens.spacing.sm : 0,
                }
              ]}
            >
              {icon}
            </View>
          )}
          {children && !iconOnly && (
            <Text style={textStyle}>
              {children}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;