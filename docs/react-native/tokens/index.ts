// CoreTet Design System Tokens for React Native
import colors from './colors.json';
import typography from './typography.json';
import spacing from './spacing.json';

export const tokens = {
  colors: {
    primary: {
      blue: '#0088cc',
      blueHover: '#006ba6',
      blueLight: '#e8f4f8',
      blueUltraLight: '#f5fafe'
    },
    neutral: {
      white: '#ffffff',
      offWhite: '#fafbfc',
      lightGray: '#f4f5f7',
      gray: '#9da7b0',
      darkGray: '#586069',
      charcoal: '#1e252b'
    },
    functional: {
      border: '#e1e4e8',
      divider: '#f0f1f3',
      shadow: 'rgba(0, 0, 0, 0.08)'
    },
    accent: {
      teal: '#17a2b8',
      amber: '#ffc107',
      green: '#28a745',
      coral: '#fd7e14'
    },
    system: {
      error: '#dc3545',
      errorBackground: '#f8d7da',
      warning: '#ffc107',
      success: '#28a745'
    }
  },
  typography: {
    fontFamily: 'SF Pro Display',
    giant: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '200' as const,
      letterSpacing: -1
    },
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '300' as const,
      letterSpacing: -0.5
    },
    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '400' as const,
      letterSpacing: 0
    },
    h3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '500' as const,
      letterSpacing: 0
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: 0
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0
    },
    button: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
      letterSpacing: 0.5
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48
  },
  dimensions: {
    mobile: {
      width: 375,
      height: 812
    },
    trackCard: {
      width: 343,
      height: 64
    },
    button: {
      height: 44,
      heightSmall: 28
    },
    icon: {
      default: 24,
      small: 16
    },
    avatar: 40
  },
  borderRadius: {
    card: 8,
    button: 20,
    input: 6,
    modal: 12
  },
  shadows: {
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2
    },
    elevated: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4
    }
  }
};

export default tokens;