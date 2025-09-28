/**
 * CoreTet Design System Overview
 * Complete component library documentation
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Text } from '../components/atoms/Text';
import { TrackCard } from '../components/molecules/TrackCard';
import { TabBar } from '../components/molecules/TabBar';
import { AudioPlayer } from '../components/organisms/AudioPlayer';
import { Search, Plus, Music } from 'lucide-react';
import { useState } from 'react';

const meta: Meta = {
  title: 'Design System/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'CoreTet Design System - A complete component library for music collaboration applications inspired by classic Rdio design.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const designTokens = {
  colors: {
    primary: '#0088cc',
    primaryHover: '#006ba6',
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
    sizes: {
      giant: '40px',
      h1: '32px',
      h2: '24px',
      h3: '20px',
      body: '16px',
      bodySmall: '14px',
      caption: '12px',
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
};

const sampleTabs = [
  { id: 'tracks', label: 'Tracks', icon: '🎵', badge: 5 },
  { id: 'collaborators', label: 'People', icon: '👥', badge: 2 },
  { id: 'add', label: 'Add', icon: '➕' },
  { id: 'playlists', label: 'Lists', icon: '📋' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

const sampleTrack = {
  title: 'Summer Nights',
  artist: 'Alex Chen',
  ensemble: 'Alex Chen Collective',
  albumArt: 'https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280',
  duration: 222,
};

// Design System Overview
export const DesignSystem: Story = {
  name: 'Design System Overview',
  render: () => (
    <div style={{ padding: '40px', backgroundColor: '#fafbfc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Text variant="giant" color="primary" style={{ marginBottom: '16px' }}>
            CoreTet Design System
          </Text>
          <Text variant="h3" color="secondary" style={{ marginBottom: '24px' }}>
            Music collaboration components inspired by classic Rdio design
          </Text>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button variant="primary" icon={<Music size={16} />}>
              View Components
            </Button>
            <Button variant="secondary">
              Design Tokens
            </Button>
          </div>
        </div>

        {/* Design Tokens */}
        <section style={{ marginBottom: '48px' }}>
          <Text variant="h2" style={{ marginBottom: '24px' }}>
            Design Tokens
          </Text>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Colors */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Colors</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: designTokens.colors.primary,
                    borderRadius: '4px'
                  }} />
                  <Text variant="bodySmall">Primary Blue #0088cc</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: designTokens.colors.accent.teal,
                    borderRadius: '4px'
                  }} />
                  <Text variant="bodySmall">Accent Teal #17a2b8</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: designTokens.colors.accent.coral,
                    borderRadius: '4px'
                  }} />
                  <Text variant="bodySmall">Accent Coral #fd7e14</Text>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Typography</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Text variant="h1">Heading 1 (32px)</Text>
                <Text variant="h2">Heading 2 (24px)</Text>
                <Text variant="body">Body text (16px)</Text>
                <Text variant="caption">Caption text (12px)</Text>
              </div>
            </div>

            {/* Spacing */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Spacing</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(designTokens.spacing).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: value, 
                      height: '16px', 
                      backgroundColor: designTokens.colors.primary,
                      borderRadius: '2px'
                    }} />
                    <Text variant="bodySmall">{key}: {value}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Atomic Components */}
        <section style={{ marginBottom: '48px' }}>
          <Text variant="h2" style={{ marginBottom: '24px' }}>
            Atomic Components
          </Text>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Buttons */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Buttons</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button variant="primary" icon={<Plus size={16} />}>
                  Primary Button
                </Button>
                <Button variant="secondary">
                  Secondary Button
                </Button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="primary" size="small">Small</Button>
                  <Button variant="primary" iconOnly icon={<Music size={16} />} aria-label="Play" />
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Inputs</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                  label="Track Title"
                  placeholder="Enter track title..."
                />
                <Input
                  type="search"
                  placeholder="Search..."
                  icon={<Search size={20} />}
                  clearable
                />
                <Input
                  label="With Error"
                  value="Invalid input"
                  error="This field has an error"
                />
              </div>
            </div>

            {/* Typography */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Typography</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Text variant="h3" color="primary">Heading Text</Text>
                <Text variant="body">Body text for paragraphs</Text>
                <Text variant="bodySmall" color="secondary">Secondary information</Text>
                <Text variant="caption" color="secondary">Metadata • 3:42</Text>
              </div>
            </div>
          </div>
        </section>

        {/* Molecular Components */}
        <section style={{ marginBottom: '48px' }}>
          <Text variant="h2" style={{ marginBottom: '24px' }}>
            Molecular Components
          </Text>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {/* Track Card */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Track Card</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <TrackCard
                  title="Summer Nights"
                  artist="Alex Chen"
                  ensemble="Alex Chen Collective"
                  duration="3:42"
                  albumArt="https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280"
                />
                <TrackCard
                  title="Digital Dreams"
                  artist="Emma Rodriguez"
                  duration="4:15"
                  isPlaying={true}
                />
                <TrackCard
                  title="Midnight Jazz"
                  artist="David Park"
                  duration="5:28"
                  rating="love"
                />
              </div>
            </div>

            {/* Tab Bar */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Tab Bar</Text>
              <div style={{ 
                width: '375px', 
                height: '120px', 
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
                  <TabBar
                    tabs={sampleTabs}
                    activeTab="tracks"
                    onTabChange={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Architecture */}
        <section style={{ marginBottom: '48px' }}>
          <Text variant="h2" style={{ marginBottom: '24px' }}>
            Component Architecture
          </Text>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            borderRadius: '8px',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  backgroundColor: designTokens.colors.accent.teal,
                  borderRadius: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 16px'
                }}>
                  ⚛️
                </div>
                <Text variant="h3" style={{ marginBottom: '8px' }}>Atoms</Text>
                <Text variant="bodySmall" color="secondary">
                  Basic building blocks: Button, Input, Text
                </Text>
              </div>
              
              <div>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  backgroundColor: designTokens.colors.primary,
                  borderRadius: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 16px'
                }}>
                  🧩
                </div>
                <Text variant="h3" style={{ marginBottom: '8px' }}>Molecules</Text>
                <Text variant="bodySmall" color="secondary">
                  Combined atoms: TrackCard, TabBar
                </Text>
              </div>
              
              <div>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  backgroundColor: designTokens.colors.accent.coral,
                  borderRadius: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 16px'
                }}>
                  🎼
                </div>
                <Text variant="h3" style={{ marginBottom: '8px' }}>Organisms</Text>
                <Text variant="bodySmall" color="secondary">
                  Complex components: AudioPlayer
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <Text variant="h2" style={{ marginBottom: '24px' }}>
            Usage Guidelines
          </Text>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Design Principles</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Text variant="bodySmall">
                  • <strong>Music-first</strong>: Optimized for audio collaboration workflows
                </Text>
                <Text variant="bodySmall">
                  • <strong>Touch-friendly</strong>: 44px minimum touch targets
                </Text>
                <Text variant="bodySmall">
                  • <strong>Accessible</strong>: WCAG 2.1 AA compliant
                </Text>
                <Text variant="bodySmall">
                  • <strong>Consistent</strong>: Rdio-inspired design language
                </Text>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Mobile Optimized</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Text variant="bodySmall">
                  • <strong>375px</strong> base mobile width
                </Text>
                <Text variant="bodySmall">
                  • <strong>Swipe gestures</strong> for track rating
                </Text>
                <Text variant="bodySmall">
                  • <strong>Bottom navigation</strong> for easy thumb access
                </Text>
                <Text variant="bodySmall">
                  • <strong>Safe areas</strong> handled automatically
                </Text>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
            }}>
              <Text variant="h3" style={{ marginBottom: '16px' }}>Getting Started</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Text variant="bodySmall">
                  1. Import design tokens
                </Text>
                <Text variant="bodySmall">
                  2. Use atomic components first
                </Text>
                <Text variant="bodySmall">
                  3. Compose with molecules
                </Text>
                <Text variant="bodySmall">
                  4. Build organisms as needed
                </Text>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete overview of the CoreTet Design System including design tokens, component architecture, and usage guidelines.',
      },
    },
  },
};

// Interactive Playground
export const Playground: Story = {
  name: 'Interactive Playground',
  render: function DesignSystemPlayground() {
    const [activeTab, setActiveTab] = useState('tracks');
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(67);

    return (
      <div style={{ backgroundColor: '#fafbfc', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text variant="h1" style={{ marginBottom: '8px' }}>
              Interactive Playground
            </Text>
            <Text variant="bodySmall" color="secondary">
              Try out the components in action
            </Text>
          </div>

          {/* Interactive Demo Area */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
            marginBottom: '24px'
          }}>
            {/* Mobile Container */}
            <div style={{ 
              width: '375px', 
              height: '600px',
              margin: '0 auto',
              backgroundColor: '#fafbfc',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Content Area */}
              <div style={{ 
                padding: '20px',
                paddingBottom: '100px' // Space for tab bar
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <Input
                    type="search"
                    placeholder="Search tracks..."
                    icon={<Search size={20} />}
                    style={{ flex: 1 }}
                  />
                  <Button variant="secondary" size="small">
                    Filter
                  </Button>
                </div>

                <Text variant="h2" style={{ marginBottom: '16px' }}>
                  {activeTab === 'tracks' && 'Your Tracks'}
                  {activeTab === 'collaborators' && 'Collaborators'}
                  {activeTab === 'add' && 'Add Content'}
                  {activeTab === 'playlists' && 'Playlists'}
                  {activeTab === 'profile' && 'Profile'}
                </Text>

                {activeTab === 'tracks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <TrackCard
                      title="Summer Nights"
                      artist="Alex Chen"
                      duration="3:42"
                      isPlaying={isPlaying}
                      onPlayPause={() => {
                        setIsPlaying(!isPlaying);
                        setIsPlayerOpen(true);
                      }}
                      onClick={() => setIsPlayerOpen(true)}
                      albumArt="https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280"
                    />
                    <TrackCard
                      title="Digital Dreams"
                      artist="Emma Rodriguez"
                      duration="4:15"
                      rating="like"
                    />
                    <TrackCard
                      title="Midnight Jazz"
                      artist="David Park"
                      duration="5:28"
                      rating="love"
                    />
                  </div>
                )}

                {activeTab === 'add' && (
                  <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                    <div style={{ 
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#0088cc',
                      borderRadius: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      margin: '0 auto 16px'
                    }}>
                      ➕
                    </div>
                    <Text variant="h3" style={{ marginBottom: '8px' }}>
                      Upload New Track
                    </Text>
                    <Text variant="bodySmall" color="secondary" style={{ marginBottom: '24px' }}>
                      Share your music with collaborators
                    </Text>
                    <Button variant="primary" icon={<Plus size={16} />}>
                      Upload Track
                    </Button>
                  </div>
                )}

                {(activeTab === 'collaborators' || activeTab === 'playlists' || activeTab === 'profile') && (
                  <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <Text variant="bodySmall" color="secondary">
                      {activeTab} content would appear here
                    </Text>
                  </div>
                )}
              </div>

              {/* Tab Bar */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <TabBar
                  tabs={sampleTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)'
          }}>
            <Text variant="h3" style={{ marginBottom: '16px' }}>
              Interactive Controls
            </Text>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setIsPlayerOpen(true)}
              >
                Open Audio Player
              </Button>
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setActiveTab('add')}
              >
                Switch to Add Tab
              </Button>
            </div>
          </div>
        </div>

        {/* Audio Player Overlay */}
        <AudioPlayer
          isOpen={isPlayerOpen}
          track={sampleTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onClose={() => setIsPlayerOpen(false)}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onSeek={setCurrentTime}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground demonstrating how components work together in a real music app interface.',
      },
    },
  },
};