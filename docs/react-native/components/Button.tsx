import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import { tokens } from '../tokens';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      size === 'small' ? styles.buttonSmall : styles.buttonDefault
    ];

    if (variant === 'primary') {
      baseStyle.push(styles.buttonPrimary);
      if (disabled || loading) {
        baseStyle.push(styles.buttonPrimaryDisabled);
      }
    } else {
      baseStyle.push(styles.buttonSecondary);
      if (disabled || loading) {
        baseStyle.push(styles.buttonSecondaryDisabled);
      }
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [
      styles.buttonText,
      size === 'small' ? styles.buttonTextSmall : styles.buttonTextDefault
    ];

    if (variant === 'primary') {
      baseStyle.push(styles.buttonTextPrimary);
      if (disabled || loading) {
        baseStyle.push(styles.buttonTextPrimaryDisabled);
      }
    } else {
      baseStyle.push(styles.buttonTextSecondary);
      if (disabled || loading) {
        baseStyle.push(styles.buttonTextSecondaryDisabled);
      }
    }

    return baseStyle;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[...getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Text style={[...getTextStyle(), textStyle]}>
          {loading ? 'LOADING...' : title.toUpperCase()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tokens.borderRadius.button,
    ...tokens.shadows.default,
  },
  buttonDefault: {
    height: tokens.dimensions.button.height,
    paddingHorizontal: tokens.spacing.lg,
  },
  buttonSmall: {
    height: tokens.dimensions.button.heightSmall,
    paddingHorizontal: tokens.spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: tokens.colors.primary.blue,
  },
  buttonPrimaryDisabled: {
    backgroundColor: tokens.colors.neutral.gray,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: tokens.colors.primary.blue,
  },
  buttonSecondaryDisabled: {
    borderColor: tokens.colors.neutral.gray,
  },
  buttonText: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.button.fontSize,
    fontWeight: tokens.typography.button.fontWeight,
    letterSpacing: tokens.typography.button.letterSpacing,
    textAlign: 'center',
  },
  buttonTextDefault: {
    lineHeight: tokens.typography.button.lineHeight,
  },
  buttonTextSmall: {
    lineHeight: tokens.typography.button.lineHeight,
  },
  buttonTextPrimary: {
    color: tokens.colors.neutral.white,
  },
  buttonTextPrimaryDisabled: {
    color: tokens.colors.neutral.white,
  },
  buttonTextSecondary: {
    color: tokens.colors.primary.blue,
  },
  buttonTextSecondaryDisabled: {
    color: tokens.colors.neutral.gray,
  },
});

export default Button;