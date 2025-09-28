import type { Preview } from '@storybook/react';
import { designSystemParameters } from '../src/stories/utils/storybook-config';
import '../styles/globals.css';

const preview: Preview = {
  parameters: {
    ...designSystemParameters,
    actions: { argTypesRegex: '^on[A-Z].*' },
    layout: 'centered',
    docs: {
      ...designSystemParameters.docs,
      description: {
        component: 'CoreTet Design System - Music collaboration components inspired by classic Rdio design.',
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    viewport: {
      description: 'Responsive viewport',
      defaultValue: 'mobile',
      toolbar: {
        title: 'Viewport',
        icon: 'mobile',
        items: [
          { value: 'mobile', title: 'Mobile (375px)' },
          { value: 'iphone12', title: 'iPhone 12 (390px)' },
          { value: 'tablet', title: 'Tablet (768px)' },
          { value: 'desktop', title: 'Desktop (1024px)' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme } = context.globals;
      
      return (
        <div 
          className={theme === 'dark' ? 'dark' : ''}
          style={{
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
            minHeight: '100vh',
            backgroundColor: theme === 'dark' ? '#1e252b' : '#fafbfc',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;