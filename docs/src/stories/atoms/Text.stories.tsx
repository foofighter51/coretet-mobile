/**
 * Text Component Stories
 * CoreTet Design System - Atomic Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../../components/atoms/Text';

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Typography component that renders text with consistent styling based on the CoreTet design system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['giant', 'h1', 'h2', 'h3', 'h4', 'body', 'bodySmall', 'caption', 'label', 'button'],
      description: 'Typography variant',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'darkGray', 'accent', 'error', 'success', 'warning', 'white'],
      description: 'Text color',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
    weight: {
      control: { type: 'select' },
      options: ['ultralight', 'light', 'normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight override',
    },
    as: {
      control: { type: 'select' },
      options: ['span', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'strong', 'em'],
      description: 'HTML element to render',
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis',
    },
    noSelect: {
      control: 'boolean',
      description: 'Disable text selection',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Typography variants
export const Giant: Story = {
  args: {
    children: 'CoreTet',
    variant: 'giant',
  },
};

export const Heading1: Story = {
  args: {
    children: 'Welcome to Your Music Studio',
    variant: 'h1',
  },
};

export const Heading2: Story = {
  args: {
    children: 'Recent Tracks',
    variant: 'h2',
  },
};

export const Heading3: Story = {
  args: {
    children: 'Collaborators',
    variant: 'h3',
  },
};

export const Heading4: Story = {
  args: {
    children: 'Upload Settings',
    variant: 'h4',
  },
};

export const Body: Story = {
  args: {
    children: 'This is the main body text used for paragraphs and general content throughout the application.',
    variant: 'body',
  },
};

export const BodySmall: Story = {
  args: {
    children: 'This is smaller body text used for secondary information and descriptions.',
    variant: 'bodySmall',
  },
};

export const Caption: Story = {
  args: {
    children: '3:42 • 2 hours ago',
    variant: 'caption',
  },
};

export const Label: Story = {
  args: {
    children: 'Track Title',
    variant: 'label',
  },
};

export const ButtonText: Story = {
  args: {
    children: 'Upload Track',
    variant: 'button',
  },
};

// Colors
export const Primary: Story = {
  args: {
    children: 'Primary text color (default)',
    variant: 'body',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary text color for less important information',
    variant: 'body',
    color: 'secondary',
  },
};

export const DarkGray: Story = {
  args: {
    children: 'Dark gray text for medium emphasis',
    variant: 'body',
    color: 'darkGray',
  },
};

export const Accent: Story = {
  args: {
    children: 'Accent blue color for interactive elements',
    variant: 'body',
    color: 'accent',
  },
};

export const Error: Story = {
  args: {
    children: 'Error text for validation messages',
    variant: 'body',
    color: 'error',
  },
};

export const Success: Story = {
  args: {
    children: 'Success text for positive feedback',
    variant: 'body',
    color: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning text for cautionary messages',
    variant: 'body',
    color: 'warning',
  },
};

export const White: Story = {
  args: {
    children: 'White text for dark backgrounds',
    variant: 'body',
    color: 'white',
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1e252b', padding: '20px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
};

// Alignment
export const AlignLeft: Story = {
  args: {
    children: 'Left aligned text (default)',
    variant: 'body',
    align: 'left',
  },
};

export const AlignCenter: Story = {
  args: {
    children: 'Center aligned text',
    variant: 'body',
    align: 'center',
  },
};

export const AlignRight: Story = {
  args: {
    children: 'Right aligned text',
    variant: 'body',
    align: 'right',
  },
};

export const AlignJustify: Story = {
  args: {
    children: 'Justified text that spreads across the full width of the container, making both the left and right edges align perfectly with the container boundaries.',
    variant: 'body',
    align: 'justify',
  },
};

// Font weights
export const Ultralight: Story = {
  args: {
    children: 'Ultralight weight (200)',
    variant: 'h1',
    weight: 'ultralight',
  },
};

export const Light: Story = {
  args: {
    children: 'Light weight (300)',
    variant: 'h2',
    weight: 'light',
  },
};

export const Normal: Story = {
  args: {
    children: 'Normal weight (400)',
    variant: 'body',
    weight: 'normal',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium weight (500)',
    variant: 'body',
    weight: 'medium',
  },
};

export const Semibold: Story = {
  args: {
    children: 'Semibold weight (600)',
    variant: 'body',
    weight: 'semibold',
  },
};

export const Bold: Story = {
  args: {
    children: 'Bold weight (700)',
    variant: 'body',
    weight: 'bold',
  },
};

// Special behaviors
export const Truncated: Story = {
  args: {
    children: 'This is a very long text that will be truncated with an ellipsis when it exceeds the container width',
    variant: 'body',
    truncate: true,
  },
};

export const NoSelect: Story = {
  args: {
    children: 'This text cannot be selected (try highlighting it)',
    variant: 'body',
    noSelect: true,
  },
};

export const Clickable: Story = {
  args: {
    children: 'Clickable text (cursor changes on hover)',
    variant: 'body',
    color: 'accent',
    onClick: () => alert('Text clicked!'),
  },
};

// HTML elements
export const Paragraph: Story = {
  args: {
    children: 'This text is rendered as a paragraph element',
    variant: 'body',
    as: 'p',
  },
};

export const Span: Story = {
  args: {
    children: 'This text is rendered as a span element',
    variant: 'body',
    as: 'span',
  },
};

export const Strong: Story = {
  args: {
    children: 'This text is rendered as a strong element',
    variant: 'body',
    as: 'strong',
  },
};

export const Emphasis: Story = {
  args: {
    children: 'This text is rendered as an emphasis element',
    variant: 'body',
    as: 'em',
  },
};

// Music app specific examples
export const TrackTitle: Story = {
  name: 'Track Title (Music App)',
  args: {
    children: 'Summer Nights',
    variant: 'body',
    color: 'primary',
    truncate: true,
  },
};

export const ArtistName: Story = {
  name: 'Artist Name (Music App)',
  args: {
    children: 'Alex Chen Collective',
    variant: 'bodySmall',
    color: 'secondary',
    truncate: true,
  },
};

export const Duration: Story = {
  name: 'Duration (Music App)',
  args: {
    children: '3:42',
    variant: 'caption',
    color: 'secondary',
  },
};

export const FieldLabel: Story = {
  name: 'Field Label (Forms)',
  args: {
    children: 'Track Title',
    variant: 'label',
    color: 'darkGray',
    as: 'label',
  },
};

export const ErrorMessage: Story = {
  name: 'Error Message (Validation)',
  args: {
    children: 'This field is required',
    variant: 'caption',
    color: 'error',
  },
};

// Typography scale showcase
export const TypographyScale: Story = {
  name: 'Typography Scale Showcase',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant="giant">Giant - App Title (40px)</Text>
      <Text variant="h1">Heading 1 - Page Title (32px)</Text>
      <Text variant="h2">Heading 2 - Section Title (24px)</Text>
      <Text variant="h3">Heading 3 - Subsection (20px)</Text>
      <Text variant="h4">Heading 4 - Card Title (20px)</Text>
      <Text variant="body">Body - Main content text (16px)</Text>
      <Text variant="bodySmall">Body Small - Secondary content (14px)</Text>
      <Text variant="caption">Caption - Metadata and timestamps (12px)</Text>
      <Text variant="label">Label - Form field labels (14px)</Text>
      <Text variant="button">Button - Button text (14px)</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete typography scale showing all available text variants with their sizes.',
      },
    },
  },
};

// Color showcase
export const ColorShowcase: Story = {
  name: 'Color Showcase',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text variant="body" color="primary">Primary - Main text color</Text>
      <Text variant="body" color="secondary">Secondary - Subdued text</Text>
      <Text variant="body" color="darkGray">Dark Gray - Medium emphasis</Text>
      <Text variant="body" color="accent">Accent - Interactive elements</Text>
      <Text variant="body" color="error">Error - Validation errors</Text>
      <Text variant="body" color="success">Success - Positive feedback</Text>
      <Text variant="body" color="warning">Warning - Cautionary messages</Text>
      <div style={{ backgroundColor: '#1e252b', padding: '12px', borderRadius: '4px' }}>
        <Text variant="body" color="white">White - Text on dark backgrounds</Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available text colors in the CoreTet design system.',
      },
    },
  },
};