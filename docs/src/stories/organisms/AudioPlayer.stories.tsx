/**
 * AudioPlayer Component Stories
 * CoreTet Design System - Organism Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { AudioPlayer } from '../../components/organisms/AudioPlayer';
import { useState } from 'react';

const meta: Meta<typeof AudioPlayer> = {
  title: 'Organisms/AudioPlayer',
  component: AudioPlayer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Full-screen audio player component with playback controls, progress tracking, and track information display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Show/hide the audio player modal',
    },
    isPlaying: {
      control: 'boolean',
      description: 'Current playback state',
    },
    currentTime: {
      control: { type: 'range', min: 0, max: 300 },
      description: 'Current playback time in seconds',
    },
    volume: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'Current volume level (0-1)',
    },
    showVolume: {
      control: 'boolean',
      description: 'Show volume control',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTrack = {
  title: 'Summer Nights',
  artist: 'Alex Chen',
  ensemble: 'Alex Chen Collective',
  albumArt: 'https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280',
  duration: 222, // 3:42
};

const longTrack = {
  title: 'Epic Symphony Movement I',
  artist: 'Orchestra Collective',
  ensemble: 'Classical Ensemble',
  albumArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyYXp6JTIwbXVzaWNpYW58ZW58MXx8fHwxNzU4NTU1NjgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  duration: 1397, // 23:17
};

const electronicTrack = {
  title: 'Digital Dreams',
  artist: 'Emma Rodriguez',
  ensemble: 'Electronic Ensemble',
  duration: 255, // 4:15
};

// Basic states
export const Closed: Story = {
  args: {
    isOpen: false,
    track: sampleTrack,
    onClose: () => {},
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    onClose: () => {},
  },
};

export const Playing: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 45,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

export const Paused: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: false,
    currentTime: 128,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

// Different track types
export const WithAlbumArt: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 95,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

export const NoAlbumArt: Story = {
  args: {
    isOpen: true,
    track: electronicTrack,
    isPlaying: false,
    currentTime: 0,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

export const LongTrack: Story = {
  args: {
    isOpen: true,
    track: longTrack,
    isPlaying: true,
    currentTime: 847, // 14:07
    onClose: () => {},
    onPlayPause: () => {},
  },
};

// With navigation controls
export const WithNavigation: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 67,
    onClose: () => {},
    onPlayPause: () => {},
    onNext: () => {},
    onPrevious: () => {},
  },
};

export const WithNavigationPaused: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: false,
    currentTime: 156,
    onClose: () => {},
    onPlayPause: () => {},
    onNext: () => {},
    onPrevious: () => {},
  },
};

// With volume control
export const WithVolume: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 89,
    volume: 0.7,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onVolumeChange: () => {},
  },
};

export const WithVolumeAndNavigation: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 134,
    volume: 0.5,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onNext: () => {},
    onPrevious: () => {},
    onVolumeChange: () => {},
  },
};

// Different progress positions
export const AtBeginning: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 0,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

export const AtMiddle: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 111, // Half of 222 seconds
    onClose: () => {},
    onPlayPause: () => {},
  },
};

export const NearEnd: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 210, // Near end
    onClose: () => {},
    onPlayPause: () => {},
  },
};

// Edge cases
export const NoTrack: Story = {
  args: {
    isOpen: true,
    track: undefined,
    onClose: () => {},
  },
};

export const EmptyTrack: Story = {
  args: {
    isOpen: true,
    track: {
      title: '',
      artist: '',
      duration: 0,
    },
    onClose: () => {},
  },
};

// Artist vs ensemble variations
export const ArtistOnly: Story = {
  args: {
    isOpen: true,
    track: {
      title: 'Solo Performance',
      artist: 'Jane Smith',
      duration: 245,
      albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    isPlaying: false,
    currentTime: 78,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

export const EnsembleOnly: Story = {
  args: {
    isOpen: true,
    track: {
      title: 'Collaborative Piece',
      ensemble: 'The Jazz Collective',
      duration: 376,
    },
    isPlaying: true,
    currentTime: 156,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

export const LongTitles: Story = {
  args: {
    isOpen: true,
    track: {
      title: 'This Is A Very Long Track Title That Should Be Handled Gracefully In The Player Interface',
      artist: 'Artist With An Extremely Long Name That Also Needs To Be Displayed Properly',
      ensemble: 'The Super Long Ensemble Name That Definitely Will Not Fit On A Single Line',
      duration: 298,
      albumArt: 'https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280',
    },
    isPlaying: true,
    currentTime: 123,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

// Interactive example
export const Interactive: Story = {
  render: function InteractiveAudioPlayer() {
    const [isOpen, setIsOpen] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(67);
    const [volume, setVolume] = useState(0.8);

    return (
      <div>
        {!isOpen && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: '#fafbfc',
            borderRadius: '8px'
          }}>
            <button 
              onClick={() => setIsOpen(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Open Audio Player
            </button>
          </div>
        )}
        
        <AudioPlayer
          isOpen={isOpen}
          track={sampleTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          volume={volume}
          showVolume={true}
          onClose={() => setIsOpen(false)}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={() => {
            setCurrentTime(0);
            console.log('Next track');
          }}
          onPrevious={() => {
            setCurrentTime(0);
            console.log('Previous track');
          }}
          onSeek={(time) => setCurrentTime(time)}
          onVolumeChange={(newVolume) => setVolume(newVolume)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive audio player - try all the controls!',
      },
    },
  },
};

// Different music genres
export const JazzTrack: Story = {
  args: {
    isOpen: true,
    track: {
      title: 'Blue Note Improvisation',
      artist: 'Miles Ahead',
      ensemble: 'Jazz Quartet',
      duration: 443, // 7:23
      albumArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyYXp6JTIwbXVzaWNpYW58ZW58MXx8fHwxNzU4NTU1NjgzfDA&ixlib=rb-4.1.0&q=80&w=400',
    },
    isPlaying: true,
    currentTime: 187,
    onClose: () => {},
    onPlayPause: () => {},
    onNext: () => {},
    onPrevious: () => {},
  },
};

export const ElectronicTrack: Story = {
  args: {
    isOpen: true,
    track: {
      title: 'Digital Synthesis',
      artist: 'SynthWave',
      ensemble: 'Electronic Collective',
      duration: 312, // 5:12
    },
    isPlaying: true,
    currentTime: 145,
    volume: 0.9,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onVolumeChange: () => {},
  },
};

export const IndieTrack: Story = {
  args: {
    isOpen: true,
    track: {
      title: 'Coffee Shop Dreams',
      artist: 'Indie Folk',
      ensemble: 'Acoustic Trio',
      duration: 227, // 3:47
      albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    isPlaying: false,
    currentTime: 98,
    onClose: () => {},
    onPlayPause: () => {},
  },
};

// Volume levels
export const VolumeHigh: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 89,
    volume: 1.0,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onVolumeChange: () => {},
  },
};

export const VolumeMedium: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 89,
    volume: 0.5,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onVolumeChange: () => {},
  },
};

export const VolumeLow: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 89,
    volume: 0.1,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onVolumeChange: () => {},
  },
};

export const VolumeMuted: Story = {
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 89,
    volume: 0,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onVolumeChange: () => {},
  },
};

// All features showcase
export const AllFeatures: Story = {
  name: 'All Features Showcase',
  args: {
    isOpen: true,
    track: sampleTrack,
    isPlaying: true,
    currentTime: 89,
    volume: 0.7,
    showVolume: true,
    onClose: () => {},
    onPlayPause: () => {},
    onNext: () => {},
    onPrevious: () => {},
    onSeek: () => {},
    onVolumeChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Audio player with all features enabled: navigation controls, volume control, and progress seeking.',
      },
    },
  },
};