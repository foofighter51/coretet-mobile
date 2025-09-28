// CoreTet React Native Style System
// Complete style system with exact design tokens

export { default as globalStyles } from './globalStyles';
export { default as componentStyles } from './componentStyles';
export { default as layoutStyles } from './layoutStyles';

// Re-export tokens for convenience
export { tokens } from '../tokens';

// Style utility functions
import { tokens } from '../tokens';

/**
 * Get shadow style based on elevation level
 * @param level - 'default' | 'elevated'
 */
export const getShadowStyle = (level: 'default' | 'elevated' = 'default') => {
  return tokens.shadows[level];
};

/**
 * Get spacing value from design tokens
 * @param size - 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'
 */
export const getSpacing = (size: keyof typeof tokens.spacing) => {
  return tokens.spacing[size];
};

/**
 * Get color value from design tokens
 * @param category - Color category (primary, neutral, accent, etc.)
 * @param shade - Color shade within category
 */
export const getColor = (category: keyof typeof tokens.colors, shade?: string) => {
  const colorCategory = tokens.colors[category];
  if (typeof colorCategory === 'string') {
    return colorCategory;
  }
  if (shade && typeof colorCategory === 'object') {
    return (colorCategory as any)[shade];
  }
  return colorCategory;
};

/**
 * Get typography style from design tokens
 * @param style - Typography style name
 */
export const getTypographyStyle = (style: keyof typeof tokens.typography) => {
  const typographyStyle = tokens.typography[style];
  if (typeof typographyStyle === 'object' && 'fontSize' in typographyStyle) {
    return {
      fontFamily: tokens.typography.fontFamily,
      ...typographyStyle,
    };
  }
  return typographyStyle;
};

/**
 * Get border radius value from design tokens
 * @param variant - Border radius variant
 */
export const getBorderRadius = (variant: keyof typeof tokens.borderRadius) => {
  return tokens.borderRadius[variant];
};

/**
 * Get dimension value from design tokens
 * @param dimension - Dimension name
 */
export const getDimension = (dimension: keyof typeof tokens.dimensions) => {
  return tokens.dimensions[dimension];
};

/**
 * Create a button style based on variant and size
 * @param variant - 'primary' | 'secondary'
 * @param size - 'default' | 'small'
 * @param state - 'default' | 'pressed' | 'disabled'
 */
export const createButtonStyle = (
  variant: 'primary' | 'secondary' = 'primary',
  size: 'default' | 'small' = 'default',
  state: 'default' | 'pressed' | 'disabled' = 'default'
) => {
  const baseStyle = {
    height: size === 'small' ? tokens.dimensions.button.heightSmall : tokens.dimensions.button.height,
    paddingHorizontal: size === 'small' ? tokens.spacing.sm : tokens.spacing.lg,
    borderRadius: size === 'small' ? 4 : tokens.borderRadius.button,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  if (variant === 'primary') {
    let backgroundColor = tokens.colors.primary.blue;
    if (state === 'pressed') backgroundColor = tokens.colors.primary.blueHover;
    if (state === 'disabled') backgroundColor = tokens.colors.neutral.gray;

    return {
      ...baseStyle,
      backgroundColor,
      ...tokens.shadows.default,
    };
  } else {
    let backgroundColor = 'transparent';
    let borderColor = tokens.colors.primary.blue;
    
    if (state === 'pressed') backgroundColor = tokens.colors.primary.blueUltraLight;
    if (state === 'disabled') borderColor = tokens.colors.neutral.gray;

    return {
      ...baseStyle,
      backgroundColor,
      borderWidth: 1,
      borderColor,
    };
  }
};

/**
 * Create input field style based on state
 * @param state - 'default' | 'focused' | 'error' | 'disabled'
 */
export const createInputStyle = (state: 'default' | 'focused' | 'error' | 'disabled' = 'default') => {
  const baseStyle = {
    height: 44,
    borderRadius: tokens.borderRadius.input,
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: tokens.colors.neutral.white,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.body.fontWeight,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.colors.neutral.charcoal,
  };

  let borderWidth = 1;
  let borderColor = tokens.colors.functional.border;
  let backgroundColor = tokens.colors.neutral.white;

  if (state === 'focused') {
    borderWidth = 2;
    borderColor = tokens.colors.primary.blue;
  } else if (state === 'error') {
    borderWidth = 2;
    borderColor = tokens.colors.system.error;
  } else if (state === 'disabled') {
    backgroundColor = tokens.colors.neutral.lightGray;
  }

  return {
    ...baseStyle,
    borderWidth,
    borderColor,
    backgroundColor,
  };
};

/**
 * Create card style based on variant
 * @param variant - 'default' | 'elevated' | 'outlined'
 */
export const createCardStyle = (variant: 'default' | 'elevated' | 'outlined' = 'default') => {
  const baseStyle = {
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.card,
    padding: tokens.spacing.md,
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
  };

  if (variant === 'elevated') {
    return {
      ...baseStyle,
      ...tokens.shadows.elevated,
    };
  } else if (variant === 'outlined') {
    return {
      ...baseStyle,
      borderWidth: 1,
      borderColor: tokens.colors.functional.border,
    };
  } else {
    return {
      ...baseStyle,
      ...tokens.shadows.default,
    };
  }
};

/**
 * Create text style based on typography variant
 * @param variant - Typography variant name
 * @param color - Optional color override
 */
export const createTextStyle = (
  variant: keyof typeof tokens.typography,
  color?: string
) => {
  const typographyStyle = getTypographyStyle(variant);
  
  if (typeof typographyStyle === 'object' && 'fontSize' in typographyStyle) {
    return {
      ...typographyStyle,
      color: color || tokens.colors.neutral.charcoal,
    };
  }
  
  return {
    fontFamily: tokens.typography.fontFamily,
    color: color || tokens.colors.neutral.charcoal,
  };
};

/**
 * Create avatar style based on size
 * @param size - 'small' | 'medium' | 'large'
 */
export const createAvatarStyle = (size: 'small' | 'medium' | 'large' = 'medium') => {
  let dimension: number;
  
  switch (size) {
    case 'small':
      dimension = 32;
      break;
    case 'large':
      dimension = 56;
      break;
    default:
      dimension = tokens.dimensions.avatar;
  }

  return {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  };
};

// Export commonly used style combinations
export const commonStyles = {
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.neutral.offWhite,
  },
  screenCentered: {
    flex: 1,
    backgroundColor: tokens.colors.neutral.offWhite,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  // Flex utilities
  flexRow: { flexDirection: 'row' as const },
  flexColumn: { flexDirection: 'column' as const },
  flexCenter: { 
    justifyContent: 'center' as const, 
    alignItems: 'center' as const 
  },
  flexBetween: { 
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const 
  },
  flex1: { flex: 1 },
  
  // Common shadows
  shadowDefault: tokens.shadows.default,
  shadowElevated: tokens.shadows.elevated,
  
  // Common spacing
  spacingMD: { padding: tokens.spacing.md },
  spacingLG: { padding: tokens.spacing.lg },
  marginMD: { margin: tokens.spacing.md },
  marginLG: { margin: tokens.spacing.lg },
  
  // Common colors
  backgroundWhite: { backgroundColor: tokens.colors.neutral.white },
  backgroundOffWhite: { backgroundColor: tokens.colors.neutral.offWhite },
  backgroundPrimary: { backgroundColor: tokens.colors.primary.blue },
  
  // Text colors
  textPrimary: { color: tokens.colors.neutral.charcoal },
  textSecondary: { color: tokens.colors.neutral.gray },
  textAccent: { color: tokens.colors.primary.blue },
};