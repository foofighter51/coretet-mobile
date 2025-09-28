/**
 * TrackCard Component Stories
 * CoreTet Design System - Molecular Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TrackCard } from '../../components/molecules/TrackCard';
import { useState } from 'react';

const meta: Meta<typeof TrackCard> = {
  title: 'Molecules/TrackCard',
  component: TrackCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive track card component with swipe-to-rate functionality, play controls, and various states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isPlaying: {
      control: 'boolean',
      description: 'Show playing state with blue border',
    },
    rating: {
      control: { type: 'select' },
      options: ['none', 'like', 'love'],
      description: 'Current track rating',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all interactions',
    },
    showRating: {
      control: 'boolean',
      description: 'Enable rating functionality',
    },
    showSwipeHint: {
      control: 'boolean',
      description: 'Show swipe hint for tutorial',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '375px', padding: '20px', backgroundColor: '#fafbfc' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic states
export const Default: Story = {
  args: {
    title: 'Summer Nights',
    artist: 'Alex Chen',
    ensemble: 'Alex Chen Collective',
    duration: '3:42',
  },
};

export const WithAlbumArt: Story = {
  args: {
    title: 'Digital Dreams',
    artist: 'Emma Rodriguez',
    ensemble: 'Electronic Ensemble',
    duration: '4:15',
    albumArt: 'https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280',
  },
};

export const Playing: Story = {
  args: {
    title: 'Midnight Jazz',
    artist: 'David Park',
    ensemble: 'The Park Quartet',
    duration: '5:28',
    isPlaying: true,
  },
};

export const PlayingWithAlbumArt: Story = {
  args: {
    title: 'Electric Pulse',
    artist: 'Maya Singh',
    ensemble: 'Singh & The Synthetics',
    duration: '3:21',
    isPlaying: true,
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
};

// Rating states
export const Liked: Story = {
  args: {
    title: 'Acoustic Memories',
    artist: 'James Wilson',
    ensemble: 'Solo Performance',
    duration: '4:03',
    rating: 'like',
  },
};

export const Loved: Story = {
  args: {
    title: 'Ocean Waves',
    artist: 'Sarah Martinez',
    ensemble: 'Nature Sounds Collective',
    duration: '6:12',
    rating: 'love',
    albumArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyYXp6JTIwbXVzaWNpYW58ZW58MXx8fHwxNzU4NTU1NjgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
};

// Special states
export const Disabled: Story = {
  args: {
    title: 'Unavailable Track',
    artist: 'Unknown Artist',
    duration: '0:00',
    disabled: true,
  },
};

export const WithSwipeHint: Story = {
  args: {
    title: 'New Track',
    artist: 'First Time User',
    duration: '2:45',
    showSwipeHint: true,
  },
};

export const NoRating: Story = {
  args: {
    title: 'Simple Track',
    artist: 'Basic Artist',
    duration: '3:30',
    showRating: false,
  },
};

// Artist vs Ensemble variations
export const WithArtistOnly: Story = {
  args: {
    title: 'Solo Performance',
    artist: 'Jane Smith',
    duration: '4:22',
  },
};

export const WithEnsembleOnly: Story = {
  args: {
    title: 'Collaborative Piece',
    ensemble: 'The Jazz Collective',
    duration: '5:45',
  },
};

export const LongTitles: Story = {
  args: {
    title: 'This Is A Very Long Track Title That Should Be Truncated Properly',
    artist: 'Artist With An Extremely Long Name That Also Needs Truncation',
    ensemble: 'The Super Long Ensemble Name That Definitely Will Not Fit',
    duration: '12:34',
  },
};

// Interactive example with state
export const Interactive: Story = {
  render: function InteractiveTrackCard() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [rating, setRating] = useState<'none' | 'like' | 'love'>('none');

    return (
      <TrackCard
        title="Interactive Track"
        artist="Demo Artist"
        ensemble="Interactive Ensemble"
        duration="3:45"
        isPlaying={isPlaying}
        rating={rating}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onRate={(newRating) => setRating(rating === newRating ? 'none' : newRating)}
        albumArt="https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive track card - click play button and swipe left to rate!',
      },
    },
  },
};

// With comment functionality
export const WithComments: Story = {
  args: {
    title: 'Collaborative Track',
    artist: 'Band Member',
    ensemble: 'The Collaborators',
    duration: '4:20',
    onComment: () => alert('Open comments thread'),
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
};

// Different durations
export const ShortTrack: Story = {
  args: {
    title: 'Quick Jam',
    artist: 'Speed Runner',
    duration: '0:45',
  },
};

export const LongTrack: Story = {
  args: {
    title: 'Epic Symphony',
    artist: 'Orchestra Director',
    ensemble: 'Classical Ensemble',
    duration: '23:17',
    albumArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyYXp6JTIwbXVzaWNpYW58ZW58MXx8fHwxNzU4NTU1NjgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
};

// Various album art scenarios
export const NoAlbumArt: Story = {
  args: {
    title: 'Basic Track',
    artist: 'No Art Artist',
    duration: '3:30',
  },
};

export const SquareAlbumArt: Story = {
  args: {
    title: 'Perfect Square',
    artist: 'Geometric Artist',
    duration: '4:00',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=400&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80',
  },
};

// Music genre variations
export const JazzTrack: Story = {
  args: {
    title: 'Blue Note Improvisation',
    artist: 'Miles Ahead',
    ensemble: 'Jazz Quartet',
    duration: '7:23',
    rating: 'love',
    albumArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyYXp6JTIwbXVzaWNpYW58ZW58MXx8fHwxNzU4NTU1NjgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
};

export const ElectronicTrack: Story = {
  args: {
    title: 'Digital Synthesis',
    artist: 'SynthWave',
    ensemble: 'Electronic Collective',
    duration: '5:12',
    isPlaying: true,
    rating: 'like',
  },
};

export const IndieTrack: Story = {
  args: {
    title: 'Coffee Shop Dreams',
    artist: 'Indie Folk',
    ensemble: 'Acoustic Trio',
    duration: '3:47',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
};

// All states showcase
export const AllStates: Story = {
  name: 'All States Showcase',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fafbfc', padding: '16px', borderRadius: '8px' }}>
      <TrackCard
        title="Default State"
        artist="Artist Name"
        duration="3:42"
      />
      
      <TrackCard
        title="Playing State"
        artist="Current Artist"
        duration="4:15"
        isPlaying={true}
      />
      
      <TrackCard
        title="Liked Track"
        artist="Liked Artist"
        duration="3:28"
        rating="like"
      />
      
      <TrackCard
        title="Loved Track"
        artist="Favorite Artist"
        duration="5:33"
        rating="love"
      />
      
      <TrackCard
        title="With Album Art"
        artist="Visual Artist"
        duration="4:20"
        albumArt="https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280"
      />
      
      <TrackCard
        title="Disabled Track"
        artist="Unavailable"
        duration="0:00"
        disabled={true}
      />
      
      <TrackCard
        title="Tutorial Track"
        artist="New User"
        duration="2:45"
        showSwipeHint={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive showcase of all track card states and variants available in the CoreTet design system.',
      },
    },
  },
};