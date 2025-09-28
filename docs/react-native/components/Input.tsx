import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import { tokens } from '../tokens';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  error,
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  onChangeText,
  onFocus,
  onBlur,
  style,
  inputStyle
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorValue = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColorValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.();
  };

  const getBorderColor = () => {
    if (error) return tokens.colors.system.error;
    if (isFocused) return tokens.colors.primary.blue;
    return tokens.colors.functional.border;
  };

  const animatedBorderColor = borderColorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.colors.functional.border, tokens.colors.primary.blue],
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
      
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? tokens.colors.system.error : animatedBorderColor,
            borderWidth: error || isFocused ? 2 : 1,
          },
          disabled && styles.inputContainerDisabled,
          multiline && styles.inputContainerMultiline
        ]}
      >
        <TextInput
          style={[
            styles.input,
            disabled && styles.inputDisabled,
            multiline && styles.inputMultiline,
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.neutral.gray}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
      </Animated.View>

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.lg,
  },
  label: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: '500',
    lineHeight: tokens.typography.bodySmall.lineHeight,
    color: tokens.colors.neutral.darkGray,
    marginBottom: tokens.spacing.xs,
  },
  labelDisabled: {
    color: tokens.colors.neutral.gray,
  },
  inputContainer: {
    borderRadius: tokens.borderRadius.input,
    backgroundColor: tokens.colors.neutral.white,
  },
  inputContainerDisabled: {
    backgroundColor: tokens.colors.neutral.lightGray,
  },
  inputContainerMultiline: {
    minHeight: 80,
    alignItems: 'flex-start',
  },
  input: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.body.fontWeight,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.colors.neutral.charcoal,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    minHeight: 44,
  },
  inputDisabled: {
    color: tokens.colors.neutral.gray,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: tokens.spacing.md,
  },
  errorText: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.caption.fontSize,
    fontWeight: tokens.typography.caption.fontWeight,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.colors.system.error,
    marginTop: tokens.spacing.xs,
  },
});

export default Input;