/**
 * TabBar Component Styles
 * CoreTet Design System
 */

import { colors, dimensions, spacing, typography } from '@/design';

export const tabBarStyles = {
  container: {
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: dimensions.mobile.width,
    height: dimensions.tabBar.height,
    backgroundColor: colors.neutral.white,
    borderTop: `1px solid ${colors.functional.divider}`,
    display: 'flex',
    zIndex: 1000,
  },

  content: {
    display: 'flex',
    flex: 1,
    height: dimensions.tabBar.contentHeight,
    paddingBottom: dimensions.tabBar.bottomSafeArea,
  },

  // Individual tab item
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none' as const,
  },

  tabDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
  },

  // Tab inner content
  tabContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderRadius: dimensions.borderRadius.card,
    minWidth: 60,
    transition: 'background-color 0.2s ease',
  },

  tabContentActive: {
    backgroundColor: colors.primary.blueUltraLight,
  },

  // Icon container (for positioning badge)
  iconContainer: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  // Tab icon
  icon: {
    width: dimensions.icon.default,
    height: dimensions.icon.default,
    fontSize: dimensions.icon.default,
    transition: 'color 0.2s ease',
    lineHeight: 1,
    textAlign: 'center' as const,
  },

  iconActive: {
    color: colors.navigation.tabActive,
  },

  iconInactive: {
    color: colors.navigation.tabInactive,
  },

  // Tab label
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.navigation.tabLabel.fontSize,
    lineHeight: `${typography.navigation.tabLabel.lineHeight}px`,
    fontWeight: typography.navigation.tabLabel.fontWeight,
    letterSpacing: typography.navigation.tabLabel.letterSpacing,
    textTransform: typography.navigation.tabLabel.textTransform,
    textAlign: 'center' as const,
    transition: 'color 0.2s ease',
    margin: 0,
  },

  labelActive: {
    color: colors.navigation.tabActive,
  },

  labelInactive: {
    color: colors.navigation.tabInactive,
  },

  labelDisabled: {
    color: colors.neutral.lightGray,
  },

  // Badge (notification dot)
  badge: {
    position: 'absolute' as const,
    top: -6,
    right: -8,
    backgroundColor: colors.navigation.tabBadge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
    paddingRight: 4,
    fontSize: 9,
    fontWeight: 600,
    color: colors.neutral.white,
    lineHeight: '12px',
    pointerEvents: 'none' as const,
  },

  // Badge text
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: 600,
    color: colors.neutral.white,
    lineHeight: '12px',
    textAlign: 'center' as const,
  },

  // Tab press feedback
  tabPressed: {
    transform: 'scale(0.95)',
  },

  // Accessibility focus styles
  tabFocused: {
    outline: `2px solid ${colors.primary.blue}`,
    outlineOffset: 2,
  },

  // Safe area handling for different devices
  safeArea: {
    paddingBottom: 'env(safe-area-inset-bottom)',
  },

  // Animation for tab switching
  tabEntering: {
    animation: 'tabFadeIn 0.2s ease',
  },

  tabExiting: {
    animation: 'tabFadeOut 0.2s ease',
  },
} as const;

// CSS animations that would be in a CSS file
export const tabBarAnimations = `
  @keyframes tabFadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes tabFadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(4px);
    }
  }
`;

export default tabBarStyles;