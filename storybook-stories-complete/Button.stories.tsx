/**
 * CoreTet Design System - Button Component Stories (Final Clean Version)
 * Exact specifications: 44px/28px height, 20px/4px radius, exact colors
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../../src/components/atoms/Button';
import { Plus, Download, Share, Music, Search, Upload } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'CoreTet Design System/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component with exact CoreTet specifications: 44px or 28px height, exact colors (#0088cc), and perfect touch targets.',
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
      description: 'Button size (44px or 28px height)',
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
      description: 'Icon-only button (44×44px touch target)',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        padding: '20px',
        backgroundColor: '#fafbfc',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants with exact specifications
export const PrimaryButton: Story = {
  args: {
    children: 'Upload Track',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary button: 44px height, 20px radius, #0088cc background, white text',
      },
    },
  },
};

export const SecondaryButton: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button: 44px height, 20px radius, transparent background, #0088cc border',
      },
    },
  },
};

export const SmallPrimary: Story = {
  args: {
    children: 'Filter',
    variant: 'primary',
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small primary button: 28px height, 4px radius, #0088cc background',
      },
    },
  },
};

export const SmallSecondary: Story = {
  args: {
    children: 'Sort',
    variant: 'secondary',
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small secondary button: 28px height, 4px radius, #0088cc border',
      },
    },
  },
};

// With icons (exactly 24px or 16px)
export const WithIcon24px: Story = {
  args: {
    children: 'Upload Track',
    variant: 'primary',
    icon: <Plus size={24} />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with 24px icon for regular size buttons',
      },
    },
  },
};

export const WithIcon16px: Story = {
  args: {
    children: 'Download',
    variant: 'secondary',
    size: 'small',
    icon: <Download size={16} />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Small button with 16px icon',
      },
    },
  },
};

// Icon-only buttons (44×44px touch targets)
export const IconOnlyPrimary: Story = {
  args: {
    icon: <Music size={24} />,
    iconOnly: true,
    variant: 'primary',
    'aria-label': 'Play music',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only primary button: 44×44px touch target, 24px icon',
      },
    },
  },
};

export const IconOnlySecondary: Story = {
  args: {
    icon: <Share size={24} />,
    iconOnly: true,
    variant: 'secondary',
    'aria-label': 'Share track',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only secondary button: 44×44px touch target, 24px icon',
      },
    },
  },
};

export const IconOnlySmall: Story = {
  args: {
    icon: <Search size={16} />,
    iconOnly: true,
    variant: 'primary',
    size: 'small',
    'aria-label': 'Search',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small icon-only button: 28×28px size, 16px icon',
      },
    },
  },
};

// Interactive states
export const LoadingState: Story = {
  args: {
    children: 'Uploading...',
    variant: 'primary',
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state: disabled, opacity 0.7, "..." text',
      },
    },
  },
};

export const DisabledPrimary: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled primary: #9da7b0 background, not-allowed cursor',
      },
    },
  },
};

export const DisabledSecondary: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'secondary',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled secondary: #9da7b0 border and text',
      },
    },
  },
};

// Music app specific examples
export const PlayButton: Story = {
  name: 'Play Button (Music App)',
  args: {
    children: 'Play',
    variant: 'primary',
    icon: <Music size={24} />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary action for music playback',
      },
    },
  },
};

export const UploadButton: Story = {
  name: 'Upload Button (Primary Action)',
  args: {
    children: 'Upload Track',
    variant: 'primary',
    icon: <Upload size={24} />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary call-to-action for track upload',
      },
    },
  },
};

export const FilterButton: Story = {
  name: 'Filter Button (Secondary Action)',
  args: {
    children: 'Filter',
    variant: 'secondary',
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small secondary button for filtering actions',
      },
    },
  },
};

// Complete showcase
export const AllVariantsShowcase: Story = {
  name: 'All Button Variants',
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px', 
      alignItems: 'flex-start',
      padding: '32px',
      backgroundColor: '#fafbfc',
      borderRadius: '8px'
    }}>
      <div>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '20px', 
          fontWeight: 500, 
          color: '#1e252b' 
        }}>
          Regular Size (44px height)
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <Button variant="primary" icon={<Plus size={24} />}>With Icon</Button>
          <Button variant="secondary" icon={<Download size={24} />}>With Icon</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="primary" iconOnly icon={<Music size={24} />} aria-label="Play" />
          <Button variant="secondary" iconOnly icon={<Share size={24} />} aria-label="Share" />
          <Button variant="primary" iconOnly icon={<Upload size={24} />} aria-label="Upload" />
        </div>
      </div>

      <div>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '20px', 
          fontWeight: 500, 
          color: '#1e252b' 
        }}>
          Small Size (28px height)
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <Button variant="primary" size="small">Primary Small</Button>
          <Button variant="secondary" size="small">Secondary Small</Button>
          <Button variant="primary" size="small" disabled>Disabled</Button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <Button variant="primary" size="small" icon={<Plus size={16} />}>With Icon</Button>
          <Button variant="secondary" size="small" icon={<Search size={16} />}>Search</Button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="primary" size="small" iconOnly icon={<Plus size={16} />} aria-label="Add" />
          <Button variant="secondary" size="small" iconOnly icon={<Search size={16} />} aria-label="Search" />
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#f4f5f7',
        borderRadius: '8px',
        maxWidth: '500px'
      }}>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px', 
          fontWeight: 500, 
          color: '#1e252b' 
        }}>
          Exact Specifications:
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          fontSize: '14px', 
          color: '#586069',
          lineHeight: 1.5 
        }}>
          <li>Regular buttons: exactly 44px height, 20px border radius</li>
          <li>Small buttons: exactly 28px height, 4px border radius</li>
          <li>Primary color: exactly #0088cc, hover #006ba6</li>
          <li>Icons: 24px for regular, 16px for small buttons</li>
          <li>Touch targets: minimum 44×44px (28×28px for small)</li>
          <li>Typography: 14px, weight 600, UPPERCASE, 0.5px letter-spacing</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all button variants with exact CoreTet specifications.',
      },
    },
  },
};