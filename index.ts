/**
 * CoreTet Design System - Main Export File
 * Complete, production-ready design system for music collaboration platforms
 */

// Export design tokens
export { designTokens } from './src/design/tokens';
export { colors, typography, spacing, dimensions, shadows, borderRadius, components, layout } from './src/design/tokens';

// Export atomic components
export { Button, type ButtonProps } from './src/components/atoms/Button';
export { Input, type InputProps } from './src/components/atoms/Input';
export { Text, type TextProps } from './src/components/atoms/Text';

// Export molecular components
export { TrackCard, type TrackCardProps } from './src/components/molecules/TrackCard';
export { TabBar, type TabBarProps, type TabItem } from './src/components/molecules/TabBar';

// Export organism components
export { AudioPlayer, type AudioPlayerProps } from './src/components/organisms/AudioPlayer';

// Export design system utilities
export { globalStyles } from './src/design/globalStyles';

// Export React Native components (conditional)
export * as ReactNative from './react-native-complete';

// Export type definitions
export type {
  // Color types
  ColorKeys,
  ColorVariant,
  
  // Typography types
  TypographyVariant,
  FontWeight,
  
  // Spacing types
  SpacingKeys,
  SpacingValue,
  
  // Component types
  ComponentVariant,
  ComponentSize,
  ComponentState,
  
  // Design token types
  DesignTokens,
  ComponentTokens,
  LayoutTokens,
} from './src/types';

// Main design system object
export const CoreTetDesignSystem = {
  // Design tokens
  tokens: {
    colors: {
      primary: {
        blue: '#0088cc',
        blueHover: '#006ba6',
        blueLight: '#e8f4f8',
        blueUltraLight: '#f5fafe',
      },
      neutral: {
        white: '#ffffff',
        offWhite: '#fafbfc',
        lightGray: '#f4f5f7',
        gray: '#9da7b0',
        darkGray: '#586069',
        charcoal: '#1e252b',
      },
      accent: {
        teal: '#17a2b8',
        amber: '#ffc107',
        green: '#28a745',
        coral: '#fd7e14',
      },
      system: {
        error: '#dc3545',
        success: '#28a745',
        warning: '#ffc107',
      },
    },
    spacing: {
      xs: 4,   // 0.5 * 8px
      sm: 8,   // 1 * 8px
      md: 12,  // 1.5 * 8px
      lg: 16,  // 2 * 8px
      xl: 24,  // 3 * 8px
      xxl: 32, // 4 * 8px
      xxxl: 48, // 6 * 8px
    },
    typography: {
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
      scales: {
        giant: { size: 40, lineHeight: 48, weight: 200 },
        h1: { size: 32, lineHeight: 40, weight: 300 },
        h2: { size: 24, lineHeight: 32, weight: 400 },
        h3: { size: 20, lineHeight: 28, weight: 500 },
        body: { size: 16, lineHeight: 24, weight: 400 },
        bodySmall: { size: 14, lineHeight: 20, weight: 400 },
        caption: { size: 12, lineHeight: 16, weight: 400 },
        button: { size: 14, lineHeight: 20, weight: 600 },
      },
    },
    dimensions: {
      mobile: { width: 375, height: 812 },
      trackCard: { width: 343, height: 64 },
      button: { height: 44, heightSmall: 28 },
      icon: { default: 24, small: 16 },
      tabBar: { height: 83, contentHeight: 49 },
    },
  },
  
  // Component specifications
  specifications: {
    button: {
      primary: {
        height: 44,
        borderRadius: 20,
        backgroundColor: '#0088cc',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
      secondary: {
        height: 44,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderColor: '#0088cc',
        color: '#0088cc',
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
      small: {
        height: 28,
        borderRadius: 4,
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
    },
    trackCard: {
      width: 343,
      height: 64,
      borderRadius: 8,
      backgroundColor: '#ffffff',
      padding: 12,
      shadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
    },
    input: {
      height: 44,
      borderRadius: 6,
      padding: 12,
      fontSize: 16,
      borderColor: '#e1e4e8',
      focusBorderColor: '#0088cc',
      errorBorderColor: '#dc3545',
    },
  },
  
  // Quality requirements
  quality: {
    accessibility: {
      wcag: 'AA',
      colorContrast: '4.5:1 minimum',
      touchTargets: '44×44px minimum',
      screenReader: 'Full support',
      keyboardNavigation: 'Complete',
    },
    performance: {
      renderTime: '<100ms for 50 components',
      animations: '60fps smooth',
      bundleSize: 'Tree-shakeable',
      memory: 'Efficient cleanup',
    },
    visual: {
      dimensions: 'Pixel-perfect exact',
      colors: 'Exact hex values only',
      spacing: '8px grid system',
      typography: 'Baseline grid aligned',
      shadows: 'Only 2 types allowed',
    },
  },
  
  // Platform support
  platforms: {
    web: {
      framework: 'React',
      typescript: true,
      storybook: true,
      testing: 'Jest + Testing Library',
      bundler: 'Vite',
    },
    mobile: {
      framework: 'React Native',
      ios: true,
      android: true,
      expo: true,
      typescript: true,
    },
  },
  
  // Version info
  version: '1.0.0',
  name: 'CoreTet Design System',
  description: 'Complete design system for music collaboration platforms',
  author: 'CoreTet Design Team',
  license: 'MIT',
  repository: 'https://github.com/coretet/design-system',
  homepage: 'https://coretet.github.io/design-system',
  documentation: 'https://storybook.coretet.com',
  
  // Usage examples
  examples: {
    button: `
import { Button } from '@coretet/design-system';

<Button variant="primary" icon={<Plus />}>
  Upload Track
</Button>
    `,
    trackCard: `
import { TrackCard } from '@coretet/design-system';

<TrackCard
  title="Summer Nights"
  artist="Alex Chen"
  duration="3:42"
  onPlayPause={() => {}}
  onRate={(rating) => {}}
/>
    `,
    layout: `
import { designTokens } from '@coretet/design-system';

const styles = {
  container: {
    width: designTokens.dimensions.mobile.width,
    backgroundColor: designTokens.colors.neutral.offWhite,
    padding: designTokens.spacing.lg,
  }
};
    `,
  },
} as const;

// Default export
export default CoreTetDesignSystem;

// Version and metadata
export const VERSION = '1.0.0';
export const NAME = 'CoreTet Design System';
export const DESCRIPTION = 'Complete design system for music collaboration platforms';

// Utility functions
export const utils = {
  // Get exact spacing value
  getSpacing: (key: keyof typeof CoreTetDesignSystem.tokens.spacing) => 
    CoreTetDesignSystem.tokens.spacing[key],
    
  // Get exact color value
  getColor: (category: string, variant: string) => {
    const tokens = CoreTetDesignSystem.tokens.colors as any;
    return tokens[category]?.[variant];
  },
  
  // Get typography scale
  getTypography: (variant: keyof typeof CoreTetDesignSystem.tokens.typography.scales) =>
    CoreTetDesignSystem.tokens.typography.scales[variant],
    
  // Validate component dimensions
  validateDimensions: (component: string, width: number, height: number) => {
    const specs = CoreTetDesignSystem.specifications as any;
    const spec = specs[component];
    return spec && spec.width === width && spec.height === height;
  },
  
  // Check accessibility compliance
  checkAccessibility: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const minTouchTarget = 44;
    
    return {
      touchTarget: rect.width >= minTouchTarget && rect.height >= minTouchTarget,
      hasAriaLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
      isFocusable: element.tabIndex >= 0 || ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase()),
    };
  },
};

// Type guard functions
export const isValidColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const isValidSpacing = (spacing: number): boolean => {
  return spacing % 4 === 0; // Must follow 8px grid (divisible by 4)
};

export const isValidComponent = (component: any): boolean => {
  return component && typeof component === 'object' && 'displayName' in component;
};

/**
 * CoreTet Design System v1.0.0
 * 
 * A complete, production-ready design system for music collaboration platforms
 * with 100% design consistency, WCAG AA accessibility, and platform coverage
 * for Web React and React Native.
 * 
 * Features:
 * - Exact specifications (343×64px TrackCards, 44px buttons, #0088cc colors)
 * - 8px grid spacing system
 * - SF Pro Display typography with baseline grid
 * - Touch-optimized mobile interactions
 * - Swipe-to-rate functionality
 * - Comprehensive QA testing suite
 * - Complete Storybook documentation
 * - React and React Native support
 * 
 * @author CoreTet Design Team
 * @version 1.0.0
 * @license MIT
 */