/**
 * Button Component Stories
 * CoreTet Design System - Atomic Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/atoms/Button';
import { Music, Plus, Download, Share } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary button component for user interactions. Supports multiple variants, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
      description: 'Button style variant',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'small'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interaction',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Show only icon without text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Primary: Story = {
  args: {
    children: 'Upload Track',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'small',
  },
};

export const SmallSecondary: Story = {
  args: {
    children: 'Filter',
    variant: 'secondary',
    size: 'small',
  },
};

// With icons
export const WithIcon: Story = {
  args: {
    children: 'Upload Track',
    variant: 'primary',
    icon: <Plus size={16} />,
  },
};

export const WithIconSecondary: Story = {
  args: {
    children: 'Download',
    variant: 'secondary',
    icon: <Download size={16} />,
  },
};

// Icon only buttons
export const IconOnly: Story = {
  args: {
    icon: <Music size={24} />,
    iconOnly: true,
    variant: 'primary',
    'aria-label': 'Play music',
  },
};

export const IconOnlySecondary: Story = {
  args: {
    icon: <Share size={24} />,
    iconOnly: true,
    variant: 'secondary',
    'aria-label': 'Share track',
  },
};

export const IconOnlySmall: Story = {
  args: {
    icon: <Plus size={16} />,
    iconOnly: true,
    variant: 'primary',
    size: 'small',
    'aria-label': 'Add item',
  },
};

// States
export const Loading: Story = {
  args: {
    children: 'Uploading...',
    variant: 'primary',
    loading: true,
  },
};

export const LoadingWithIcon: Story = {
  args: {
    children: 'Processing',
    variant: 'primary',
    icon: <Music size={16} />,
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'secondary',
    disabled: true,
  },
};

export const DisabledWithIcon: Story = {
  args: {
    children: 'Upload Track',
    variant: 'primary',
    icon: <Plus size={16} />,
    disabled: true,
  },
};

// Common use cases
export const PlayButton: Story = {
  name: 'Play Button (Music App)',
  args: {
    children: 'Play',
    variant: 'primary',
    icon: <Music size={16} />,
  },
};

export const FilterButton: Story = {
  name: 'Filter Button (Search)',
  args: {
    children: 'Filter',
    variant: 'secondary',
    size: 'small',
  },
};

export const UploadButton: Story = {
  name: 'Upload Button (Primary Action)',
  args: {
    children: 'Upload Track',
    variant: 'primary',
    icon: <Plus size={16} />,
  },
};

// Button combinations showcase
export const AllVariants: Story = {
  name: 'All Variants Showcase',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button variant="primary" size="small">Primary Small</Button>
        <Button variant="secondary" size="small">Secondary Small</Button>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button variant="primary" icon={<Plus size={16} />}>With Icon</Button>
        <Button variant="secondary" icon={<Download size={16} />}>With Icon</Button>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button variant="primary" iconOnly icon={<Music size={24} />} aria-label="Play" />
        <Button variant="secondary" iconOnly icon={<Share size={24} />} aria-label="Share" />
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive showcase of all button variants, sizes, and states available in the CoreTet design system.',
      },
    },
  },
};