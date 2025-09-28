/**
 * TabBar Component Stories
 * CoreTet Design System - Molecular Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TabBar } from '../../components/molecules/TabBar';
import { useState } from 'react';

const meta: Meta<typeof TabBar> = {
  title: 'Molecules/TabBar',
  component: TabBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Bottom navigation tab bar component for mobile music app navigation with badge support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable all tab interactions',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '375px', 
        height: '200px', 
        position: 'relative',
        backgroundColor: '#fafbfc',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0
        }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTabs = [
  {
    id: 'tracks',
    label: 'Tracks',
    icon: '🎵',
  },
  {
    id: 'collaborators',
    label: 'People',
    icon: '👥',
  },
  {
    id: 'add',
    label: 'Add',
    icon: '➕',
  },
  {
    id: 'playlists',
    label: 'Lists',
    icon: '📋',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
  },
];

// Basic states
export const Default: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'tracks',
    onTabChange: () => {},
  },
};

export const SecondTabActive: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'collaborators',
    onTabChange: () => {},
  },
};

export const MiddleTabActive: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'add',
    onTabChange: () => {},
  },
};

// With badges
export const WithBadges: Story = {
  args: {
    tabs: [
      {
        id: 'tracks',
        label: 'Tracks',
        icon: '🎵',
        badge: 3,
      },
      {
        id: 'collaborators',
        label: 'People',
        icon: '👥',
        badge: 12,
      },
      {
        id: 'add',
        label: 'Add',
        icon: '➕',
      },
      {
        id: 'playlists',
        label: 'Lists',
        icon: '📋',
        badge: 1,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
      },
    ],
    activeTab: 'tracks',
    onTabChange: () => {},
  },
};

export const HighBadgeNumbers: Story = {
  args: {
    tabs: [
      {
        id: 'tracks',
        label: 'Tracks',
        icon: '🎵',
        badge: 99,
      },
      {
        id: 'collaborators',
        label: 'People',
        icon: '👥',
        badge: 150, // Should show as 99+
      },
      {
        id: 'add',
        label: 'Add',
        icon: '➕',
      },
      {
        id: 'playlists',
        label: 'Lists',
        icon: '📋',
        badge: 5,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        badge: 1000, // Should show as 99+
      },
    ],
    activeTab: 'collaborators',
    onTabChange: () => {},
  },
};

// Disabled states
export const Disabled: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'tracks',
    disabled: true,
    onTabChange: () => {},
  },
};

export const SomeTabsDisabled: Story = {
  args: {
    tabs: [
      {
        id: 'tracks',
        label: 'Tracks',
        icon: '🎵',
      },
      {
        id: 'collaborators',
        label: 'People',
        icon: '👥',
        disabled: true,
      },
      {
        id: 'add',
        label: 'Add',
        icon: '➕',
      },
      {
        id: 'playlists',
        label: 'Lists',
        icon: '📋',
        disabled: true,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
      },
    ],
    activeTab: 'tracks',
    onTabChange: () => {},
  },
};

// Different tab configurations
export const ThreeTabs: Story = {
  args: {
    tabs: [
      {
        id: 'tracks',
        label: 'Tracks',
        icon: '🎵',
      },
      {
        id: 'add',
        label: 'Add',
        icon: '➕',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
      },
    ],
    activeTab: 'add',
    onTabChange: () => {},
  },
};

export const FourTabs: Story = {
  args: {
    tabs: [
      {
        id: 'tracks',
        label: 'Tracks',
        icon: '🎵',
      },
      {
        id: 'collaborators',
        label: 'People',
        icon: '👥',
      },
      {
        id: 'playlists',
        label: 'Lists',
        icon: '📋',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
      },
    ],
    activeTab: 'collaborators',
    onTabChange: () => {},
  },
};

// Music app specific variations
export const MusicAppTabs: Story = {
  args: {
    tabs: [
      {
        id: 'library',
        label: 'Library',
        icon: '🎼',
        badge: 24,
      },
      {
        id: 'discover',
        label: 'Discover',
        icon: '🔍',
      },
      {
        id: 'upload',
        label: 'Upload',
        icon: '⬆️',
      },
      {
        id: 'bands',
        label: 'Bands',
        icon: '🎸',
        badge: 3,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
      },
    ],
    activeTab: 'discover',
    onTabChange: () => {},
  },
};

export const StudioTabs: Story = {
  args: {
    tabs: [
      {
        id: 'projects',
        label: 'Projects',
        icon: '📂',
        badge: 2,
      },
      {
        id: 'tracks',
        label: 'Tracks',
        icon: '🎵',
        badge: 15,
      },
      {
        id: 'record',
        label: 'Record',
        icon: '🔴',
      },
      {
        id: 'mix',
        label: 'Mix',
        icon: '🎛️',
      },
    ],
    activeTab: 'record',
    onTabChange: () => {},
  },
};

// Different icon styles
export const EmojiIcons: Story = {
  args: {
    tabs: [
      {
        id: 'home',
        label: 'Home',
        icon: '🏠',
      },
      {
        id: 'music',
        label: 'Music',
        icon: '🎶',
      },
      {
        id: 'create',
        label: 'Create',
        icon: '✨',
      },
      {
        id: 'social',
        label: 'Social',
        icon: '💬',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
      },
    ],
    activeTab: 'create',
    onTabChange: () => {},
  },
};

// Interactive example
export const Interactive: Story = {
  render: function InteractiveTabBar() {
    const [activeTab, setActiveTab] = useState('tracks');

    return (
      <TabBar
        tabs={[
          {
            id: 'tracks',
            label: 'Tracks',
            icon: '🎵',
            badge: activeTab === 'tracks' ? 0 : 5,
          },
          {
            id: 'collaborators',
            label: 'People',
            icon: '👥',
            badge: 2,
          },
          {
            id: 'add',
            label: 'Add',
            icon: '➕',
          },
          {
            id: 'playlists',
            label: 'Lists',
            icon: '📋',
            badge: activeTab === 'playlists' ? 0 : 1,
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: '👤',
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive tab bar - click different tabs to see the active state change!',
      },
    },
  },
};

// Accessibility example
export const WithAriaLabels: Story = {
  args: {
    tabs: [
      {
        id: 'tracks',
        label: 'Tracks',
        icon: '🎵',
        'aria-label': 'View all music tracks',
      },
      {
        id: 'collaborators',
        label: 'People',
        icon: '👥',
        'aria-label': 'View collaborators and band members',
        badge: 3,
      },
      {
        id: 'add',
        label: 'Add',
        icon: '➕',
        'aria-label': 'Upload new content',
      },
      {
        id: 'playlists',
        label: 'Lists',
        icon: '📋',
        'aria-label': 'View playlists and collections',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        'aria-label': 'View user profile and settings',
      },
    ],
    activeTab: 'collaborators',
    onTabChange: () => {},
  },
};

// Long labels (should be avoided but handled gracefully)
export const LongLabels: Story = {
  args: {
    tabs: [
      {
        id: 'tracks',
        label: 'My Tracks',
        icon: '🎵',
      },
      {
        id: 'collaborators',
        label: 'Collaborators',
        icon: '👥',
      },
      {
        id: 'add',
        label: 'Add New',
        icon: '➕',
      },
      {
        id: 'playlists',
        label: 'Playlists',
        icon: '📋',
      },
      {
        id: 'profile',
        label: 'My Profile',
        icon: '👤',
      },
    ],
    activeTab: 'collaborators',
    onTabChange: () => {},
  },
};

// Edge cases
export const NoBadges: Story = {
  args: {
    tabs: defaultTabs.map(tab => ({ ...tab, badge: undefined })),
    activeTab: 'playlists',
    onTabChange: () => {},
  },
};

export const AllWithBadges: Story = {
  args: {
    tabs: defaultTabs.map((tab, index) => ({ 
      ...tab, 
      badge: index + 1 
    })),
    activeTab: 'add',
    onTabChange: () => {},
  },
};

// States showcase
export const AllStates: Story = {
  name: 'All States Showcase',
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '40px',
      backgroundColor: '#fafbfc',
      padding: '20px',
      borderRadius: '8px'
    }}>
      <div>
        <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#586069' }}>Default State</h4>
        <div style={{ 
          width: '375px', 
          height: '100px', 
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <TabBar
              tabs={defaultTabs}
              activeTab="tracks"
              onTabChange={() => {}}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#586069' }}>With Badges</h4>
        <div style={{ 
          width: '375px', 
          height: '100px', 
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <TabBar
              tabs={[
                { id: 'tracks', label: 'Tracks', icon: '🎵', badge: 5 },
                { id: 'collaborators', label: 'People', icon: '👥', badge: 12 },
                { id: 'add', label: 'Add', icon: '➕' },
                { id: 'playlists', label: 'Lists', icon: '📋', badge: 1 },
                { id: 'profile', label: 'Profile', icon: '👤' },
              ]}
              activeTab="collaborators"
              onTabChange={() => {}}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#586069' }}>Disabled State</h4>
        <div style={{ 
          width: '375px', 
          height: '100px', 
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <TabBar
              tabs={defaultTabs}
              activeTab="add"
              disabled={true}
              onTabChange={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive showcase of all tab bar states and variants available in the CoreTet design system.',
      },
    },
  },
};