import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import { tokens } from '../tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  pressable?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  pressable = false,
  disabled = false,
  onPress,
  style
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (pressable && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (pressable && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.cardElevated);
        break;
      case 'outlined':
        baseStyle.push(styles.cardOutlined);
        break;
      default:
        baseStyle.push(styles.cardDefault);
    }

    if (disabled) {
      baseStyle.push(styles.cardDisabled);
    }

    return baseStyle;
  };

  const CardComponent = pressable ? TouchableOpacity : View;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <CardComponent
        style={[...getCardStyle(), style]}
        onPress={pressable ? onPress : undefined}
        onPressIn={pressable ? handlePressIn : undefined}
        onPressOut={pressable ? handlePressOut : undefined}
        disabled={disabled}
        activeOpacity={pressable ? 0.95 : 1}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginVertical: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.lg,
  },
  cardDefault: {
    backgroundColor: tokens.colors.neutral.white,
    ...tokens.shadows.default,
  },
  cardElevated: {
    backgroundColor: tokens.colors.neutral.white,
    ...tokens.shadows.elevated,
  },
  cardOutlined: {
    backgroundColor: tokens.colors.neutral.white,
    borderWidth: 1,
    borderColor: tokens.colors.functional.border,
  },
  cardDisabled: {
    opacity: 0.5,
  },
});

export default Card;