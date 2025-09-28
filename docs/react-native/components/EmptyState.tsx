import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
        
        {actionLabel && onAction && (
          <View style={styles.actionContainer}>
            <Button
              title={actionLabel}
              variant="primary"
              onPress={onAction}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xxxl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 280,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.primary.blueUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  icon: {
    fontSize: 32,
    color: tokens.colors.primary.blue,
  },
  title: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.h3.fontWeight,
    lineHeight: tokens.typography.h3.lineHeight,
    color: tokens.colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  description: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.bodySmall.fontSize,
    fontWeight: tokens.typography.bodySmall.fontWeight,
    lineHeight: tokens.typography.bodySmall.lineHeight,
    color: tokens.colors.neutral.gray,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  actionContainer: {
    alignSelf: 'stretch',
  },
});

export default EmptyState;