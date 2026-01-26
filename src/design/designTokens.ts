import tokens from '../tokens.json';

// Extract and type the design tokens according to actual JSON structure
export const designTokens = {
  colors: {
    primary: {
      blue: tokens.tokens.colors.primary.blue.value,
      blueHover: tokens.tokens.colors.primary.blueHover.value,
      blueLight: tokens.tokens.colors.primary.blueLight.value,
      blueUltraLight: tokens.tokens.colors.primary.blueUltraLight.value
    },
    neutral: {
      white: tokens.tokens.colors.neutral.white.value,
      offWhite: tokens.tokens.colors.neutral.offWhite.value,
      lightGray: tokens.tokens.colors.neutral.lightGray.value,
      gray: tokens.tokens.colors.neutral.gray.value,
      darkGray: tokens.tokens.colors.neutral.darkGray.value,
      charcoal: tokens.tokens.colors.neutral.charcoal.value
    },
    accent: {
      teal: tokens.tokens.colors.accent.teal.value,
      amber: tokens.tokens.colors.accent.amber.value,
      green: tokens.tokens.colors.accent.green.value,
      coral: tokens.tokens.colors.accent.coral.value
    },
    system: {
      error: tokens.tokens.colors.system.error.value,
      warning: tokens.tokens.colors.system.warning.value,
      success: tokens.tokens.colors.system.success.value
    },
    border: {
      default: tokens.tokens.colors.border.value,
      divider: tokens.tokens.colors.divider.value
    },
    // Semantic surface colors for consistent backgrounds
    surface: {
      primary: tokens.tokens.colors.neutral.white.value,           // #ffffff - cards, modals
      secondary: '#f7fafc',                                        // light gray - subtle backgrounds
      tertiary: tokens.tokens.colors.neutral.offWhite.value,       // #fafbfc - page backgrounds
      hover: '#ebf8ff',                                            // light blue - hover states
      active: tokens.tokens.colors.primary.blueLight.value,        // #e8f4f8 - active states
      disabled: '#f0f1f3',                                         // disabled state background
    },
    // Semantic border colors
    borders: {
      default: '#e2e8f0',                                          // standard borders
      light: '#f7fafc',                                            // subtle borders
      focus: tokens.tokens.colors.primary.blue.value,              // focused input borders
      error: '#fcc',                                               // error state borders
      divider: tokens.tokens.colors.divider.value,                 // #f0f1f3 - divider lines
    },
    // Semantic text colors
    text: {
      primary: tokens.tokens.colors.neutral.charcoal.value,        // #1e252b - primary text
      secondary: tokens.tokens.colors.neutral.darkGray.value,      // #586069 - secondary text
      tertiary: tokens.tokens.colors.neutral.gray.value,           // #9da7b0 - tertiary text
      muted: '#4a5568',                                            // muted text
      disabled: '#cbd5e0',                                         // disabled text
      inverse: tokens.tokens.colors.neutral.white.value,           // white text on dark backgrounds
      link: tokens.tokens.colors.primary.blue.value,               // link text
      success: tokens.tokens.colors.system.success.value,          // success messages
      error: tokens.tokens.colors.system.error.value,              // error messages
      warning: tokens.tokens.colors.system.warning.value,          // warning messages
    },
    // Rating-specific colors (for listened/liked/loved badges)
    ratings: {
      listened: {
        bg: '#90cdf4',           // light blue button
        bgLight: '#f0f9ff',      // very light blue badge/card
        bgUltraLight: '#e6f7ff', // ultra light blue
      },
      liked: {
        bg: '#68d391',           // light green button
        bgLight: '#f0fff4',      // very light green badge/card
        bgUltraLight: '#e6ffe6', // ultra light green
      },
      loved: {
        bg: '#fc8181',           // light red button
        bgLight: '#fff5f5',      // very light red badge/card
        bgUltraLight: '#ffe6e6', // ultra light red
      }
    },
    // Feedback state colors (error, success, warning backgrounds)
    feedback: {
      error: {
        bg: '#fee',              // light red background
        border: '#fcc',          // red border
        text: '#c00',            // dark red text
      },
      success: {
        bg: '#e6f7e6',           // light green background
        border: '#90ee90',       // green border
        text: '#008000',         // dark green text
      },
      warning: {
        bg: '#fff3cd',           // light yellow background
        border: '#ffc107',       // yellow border
        text: '#856404',         // dark yellow text
      }
    }
  },
  typography: {
    fontFamily: tokens.tokens.typography.fontFamily.value,
    fontSizes: {
      giant: tokens.tokens.typography.fontSizes.giant.value,
      h1: tokens.tokens.typography.fontSizes.h1.value,
      h2: tokens.tokens.typography.fontSizes.h2.value,
      h3: tokens.tokens.typography.fontSizes.h3.value,
      h4: tokens.tokens.typography.fontSizes.h4.value,
      body: tokens.tokens.typography.fontSizes.body.value,
      bodySmall: tokens.tokens.typography.fontSizes.bodySmall.value,
      caption: tokens.tokens.typography.fontSizes.caption.value,
      label: tokens.tokens.typography.fontSizes.label.value,
      button: tokens.tokens.typography.fontSizes.button.value
    },
    lineHeights: {
      giant: tokens.tokens.typography.lineHeights.giant.value,
      h1: tokens.tokens.typography.lineHeights.h1.value,
      h2: tokens.tokens.typography.lineHeights.h2.value,
      h3: tokens.tokens.typography.lineHeights.h3.value,
      h4: tokens.tokens.typography.lineHeights.h4.value,
      body: tokens.tokens.typography.lineHeights.body.value,
      bodySmall: tokens.tokens.typography.lineHeights.bodySmall.value,
      caption: tokens.tokens.typography.lineHeights.caption.value,
      label: tokens.tokens.typography.lineHeights.label.value,
      button: tokens.tokens.typography.lineHeights.button.value
    },
    fontWeights: {
      ultralight: tokens.tokens.typography.fontWeights.ultralight.value,
      light: tokens.tokens.typography.fontWeights.light.value,
      normal: tokens.tokens.typography.fontWeights.normal.value,
      medium: tokens.tokens.typography.fontWeights.medium.value,
      semibold: tokens.tokens.typography.fontWeights.semibold.value,
      bold: tokens.tokens.typography.fontWeights.bold.value
    }
  },
  spacing: {
    xs: tokens.tokens.spacing.xs.value,
    sm: tokens.tokens.spacing.sm.value,
    md: tokens.tokens.spacing.md.value,
    lg: tokens.tokens.spacing.lg.value,
    xl: tokens.tokens.spacing.xl.value,
    xxl: tokens.tokens.spacing.xxl.value,
    xxxl: tokens.tokens.spacing.xxxl.value
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '20px',    // for pill buttons
    full: '50%'
  },
  shadows: {
    default: tokens.tokens.shadows.default.value,
    elevated: tokens.tokens.shadows.elevated.value,
  },
  dimensions: {
    touchTarget: {
      minimum: '44px',  // iOS/Android minimum touch target
    },
    button: {
      height: tokens.tokens.dimensions.button.height.value,
      heightSmall: tokens.tokens.dimensions.button.heightSmall.value,
    },
    input: {
      height: tokens.tokens.dimensions.input.height.value,
    },
    icon: {
      default: tokens.tokens.dimensions.icon.default.value,
      small: tokens.tokens.dimensions.icon.small.value,
    }
  },
  // Responsive breakpoints (pixels)
  breakpoints: {
    mobile: 768,    // < 768px = mobile
    tablet: 1024,   // 768-1024px = tablet
    desktop: 1280,  // >= 1024px = desktop
    wide: 1920,     // >= 1920px = wide desktop
  },
  // Layout dimensions for desktop navigation
  layout: {
    sidebar: {
      width: '240px',
      widthCollapsed: '60px',
    },
    detailPanel: {
      width: '420px',
      minWidth: '360px',
      maxWidth: '500px',
    },
    header: {
      height: '64px',
    },
    player: {
      height: '80px',
    },
    tabBar: {
      height: '60px',
    },
    content: {
      maxWidth: '1400px', // Max content width on ultra-wide screens
      padding: '24px',
    },
  },
};

// Add semantic colors (backward compatibility)
designTokens.colors.semantic = {
  success: designTokens.colors.system.success,
  error: designTokens.colors.system.error,
  warning: designTokens.colors.system.warning
};
