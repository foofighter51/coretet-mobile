/**
 * Storybook Configuration Utilities
 * CoreTet Design System
 */

import type { Parameters } from '@storybook/react';

// Mobile viewport configurations
export const mobileViewports = {
  mobile: {
    name: 'Mobile (CoreTet)',
    styles: {
      width: '375px',
      height: '812px',
    },
  },
  iphone12: {
    name: 'iPhone 12',
    styles: {
      width: '390px',
      height: '844px',
    },
  },
  iphone12mini: {
    name: 'iPhone 12 Mini',
    styles: {
      width: '375px',
      height: '812px',
    },
  },
  iphone12pro: {
    name: 'iPhone 12 Pro',
    styles: {
      width: '390px',
      height: '844px',
    },
  },
  pixel5: {
    name: 'Pixel 5',
    styles: {
      width: '393px',
      height: '851px',
    },
  },
};

// Common decorators for mobile components
export const mobileDecorator = (Story: any) => (
  <div
    style={{
      width: '375px',
      minHeight: '400px',
      backgroundColor: '#fafbfc',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }}
  >
    <Story />
  </div>
);

// Music app theme decorator
export const musicAppDecorator = (Story: any) => (
  <div
    style={{
      backgroundColor: '#fafbfc',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    }}
  >
    <Story />
  </div>
);

// Design system parameters
export const designSystemParameters: Parameters = {
  backgrounds: {
    default: 'CoreTet Off-White',
    values: [
      {
        name: 'CoreTet Off-White',
        value: '#fafbfc',
      },
      {
        name: 'CoreTet White',
        value: '#ffffff',
      },
      {
        name: 'CoreTet Primary',
        value: '#0088cc',
      },
      {
        name: 'CoreTet Dark',
        value: '#1e252b',
      },
    ],
  },
  viewport: {
    viewports: {
      ...mobileViewports,
    },
    defaultViewport: 'mobile',
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    theme: {
      brandTitle: 'CoreTet Design System',
      brandUrl: 'https://coretet.com',
      brandImage: '/logo.svg',
      brandTarget: '_self',
      colorPrimary: '#0088cc',
      colorSecondary: '#17a2b8',
    },
    toc: {
      contentsSelector: '.sbdocs-content',
      headingSelector: 'h1, h2, h3',
      ignoreSelector: '#primary',
      title: 'Table of Contents',
      disable: false,
      unsafeTocbotOptions: {
        orderedList: false,
      },
    },
  },
  options: {
    storySort: {
      order: [
        'Design System',
        ['Overview', 'Playground'],
        'Atoms',
        ['Button', 'Input', 'Text'],
        'Molecules',
        ['TrackCard', 'TabBar'],
        'Organisms',
        ['AudioPlayer'],
      ],
    },
  },
};

// Common arg types for components
export const commonArgTypes = {
  className: {
    control: 'text',
    description: 'Additional CSS classes',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: '""' },
    },
  },
  style: {
    control: 'object',
    description: 'Inline styles',
    table: {
      type: { summary: 'React.CSSProperties' },
    },
  },
  'data-testid': {
    control: 'text',
    description: 'Test identifier',
    table: {
      type: { summary: 'string' },
    },
  },
};

// Component categories for organization
export const componentCategories = {
  atoms: {
    title: 'Atoms',
    description: 'Basic building blocks of the design system',
    components: ['Button', 'Input', 'Text'],
  },
  molecules: {
    title: 'Molecules',
    description: 'Combinations of atoms that form cohesive UI components',
    components: ['TrackCard', 'TabBar'],
  },
  organisms: {
    title: 'Organisms',
    description: 'Complex components composed of molecules and atoms',
    components: ['AudioPlayer'],
  },
};

// Design token showcase helper
export const designTokenShowcase = {
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
  typography: {
    fontFamily: 'SF Pro Display',
    weights: {
      ultralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    sizes: {
      giant: '40px',
      h1: '32px',
      h2: '24px',
      h3: '20px',
      h4: '20px',
      body: '16px',
      bodySmall: '14px',
      caption: '12px',
      button: '14px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  dimensions: {
    mobile: { width: '375px', height: '812px' },
    trackCard: { width: '343px', height: '64px' },
    button: { height: '44px', heightSmall: '28px' },
    icon: { default: '24px', small: '16px' },
    avatar: '40px',
  },
  shadows: {
    default: '0px 2px 6px rgba(0, 0, 0, 0.08)',
    elevated: '0px 4px 12px rgba(0, 0, 0, 0.12)',
  },
  borderRadius: {
    card: '8px',
    button: '20px',
    input: '6px',
    modal: '12px',
    albumArt: '4px',
  },
};

export default {
  mobileViewports,
  mobileDecorator,
  musicAppDecorator,
  designSystemParameters,
  commonArgTypes,
  componentCategories,
  designTokenShowcase,
};