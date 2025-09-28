/**
 * Input Component Stories
 * CoreTet Design System - Atomic Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/atoms/Input';
import { Search, Mail, Lock, User, Music } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Input field component for collecting user data. Supports various types, states, and validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'tel', 'url', 'search', 'number'],
      description: 'Input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input interaction',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required',
    },
    multiline: {
      control: 'boolean',
      description: 'Use textarea for multiline input',
    },
    clearable: {
      control: 'boolean',
      description: 'Show clear button when field has value',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    label: 'Track Title',
    placeholder: 'Enter track title...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Track Title',
    value: 'Summer Nights',
    placeholder: 'Enter track title...',
  },
};

export const Required: Story = {
  args: {
    label: 'Artist Name',
    placeholder: 'Enter artist name...',
    required: true,
  },
};

// Input types
export const Email: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'your@email.com',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Phone: Story = {
  args: {
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search tracks, artists...',
    icon: <Search size={20} />,
    clearable: true,
  },
};

export const Number: Story = {
  args: {
    label: 'BPM',
    type: 'number',
    placeholder: '120',
  },
};

// With icons
export const WithIcon: Story = {
  args: {
    label: 'Search Music',
    placeholder: 'Search tracks, artists...',
    icon: <Search size={20} />,
  },
};

export const EmailWithIcon: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'your@email.com',
    icon: <Mail size={20} />,
  },
};

export const PasswordWithIcon: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password...',
    icon: <Lock size={20} />,
  },
};

// Multiline
export const Multiline: Story = {
  args: {
    label: 'Track Description',
    placeholder: 'Describe your track...',
    multiline: true,
    rows: 4,
  },
};

export const MultilineWithValue: Story = {
  args: {
    label: 'Track Notes',
    value: 'This is a collaborative track featuring indie-pop elements with a modern twist. Recorded in Studio A with full band arrangement.',
    multiline: true,
    rows: 3,
  },
};

// States
export const Focused: Story = {
  args: {
    label: 'Track Title',
    placeholder: 'Enter track title...',
    autoFocus: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Track Title',
    value: 'Read Only Track',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Artist Name',
    value: '',
    error: 'Artist name is required',
    required: true,
  },
};

export const ErrorWithValue: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const MultilineError: Story = {
  args: {
    label: 'Track Description',
    value: 'Too short',
    multiline: true,
    error: 'Description must be at least 10 characters',
  },
};

// Interactive features
export const Clearable: Story = {
  args: {
    label: 'Search',
    value: 'jazz music',
    placeholder: 'Search...',
    clearable: true,
    icon: <Search size={20} />,
  },
};

export const ClearableMultiline: Story = {
  args: {
    label: 'Notes',
    value: 'Some notes about the track',
    multiline: true,
    clearable: true,
  },
};

// Controlled input example
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <Input
        label="Track Title"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        placeholder="Type to see controlled input..."
        clearable
      />
    );
  },
};

// Common use cases
export const TrackTitleField: Story = {
  name: 'Track Title (Music App)',
  args: {
    label: 'Track Title',
    placeholder: 'Enter track title...',
    required: true,
    maxLength: 100,
  },
};

export const SearchField: Story = {
  name: 'Search Field (Discovery)',
  args: {
    type: 'search',
    placeholder: 'Search tracks, collaborators, or projects...',
    icon: <Search size={20} />,
    clearable: true,
  },
};

export const CollaboratorEmail: Story = {
  name: 'Collaborator Email (Invite)',
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'collaborator@email.com',
    icon: <Mail size={20} />,
    required: true,
  },
};

export const PhoneNumberField: Story = {
  name: 'Phone Number (Profile)',
  args: {
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    required: true,
  },
};

// All states showcase
export const AllStates: Story = {
  name: 'All States Showcase',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '320px' }}>
      <Input
        label="Default State"
        placeholder="Enter text..."
      />
      
      <Input
        label="With Value"
        value="Summer Nights"
        placeholder="Enter text..."
      />
      
      <Input
        label="With Icon"
        placeholder="Search..."
        icon={<Search size={20} />}
      />
      
      <Input
        label="Required Field"
        placeholder="Enter required text..."
        required
      />
      
      <Input
        label="Error State"
        value="invalid input"
        error="This field has an error"
      />
      
      <Input
        label="Disabled State"
        value="Read only value"
        disabled
      />
      
      <Input
        label="Multiline"
        placeholder="Enter description..."
        multiline
        rows={3}
      />
      
      <Input
        type="search"
        placeholder="Search with clear button..."
        value="search term"
        clearable
        icon={<Search size={20} />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive showcase of all input states and variants available in the CoreTet design system.',
      },
    },
  },
};