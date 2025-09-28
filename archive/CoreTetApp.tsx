import React, { useState } from 'react';
import { Button, Text, TrackCard, designTokens } from './components';
import { Plus, Users, Music } from 'lucide-react';

const mockTracks = [
  {
    title: "Summer Nights",
    duration: "3:42",
    rating: 'love' as const,
    bandName: "The Indie Collective"
  },
  {
    title: "Electronic Dreams",
    duration: "4:15",
    rating: 'like' as const,
    bandName: "Synth Wave Band"
  },
  {
    title: "Jazz Improvisation",
    duration: "6:33",
    rating: 'none' as const,
    bandName: "Jazz Experiments"
  },
  {
    title: "Acoustic Morning",
    duration: "2:47",
    rating: 'love' as const,
    bandName: "Coffee House Sessions"
  }
];

export default function CoreTetApp() {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  const handlePlayPause = (trackTitle: string) => {
    setPlayingTrack(playingTrack === trackTitle ? null : trackTitle);
  };

  const handleTrackRating = (trackTitle: string, rating: 'like' | 'love') => {
    console.log(`Rated "${trackTitle}" as ${rating}`);
  };

  return (
    <div style={{
      width: '375px',
      minHeight: '812px',
      backgroundColor: designTokens.colors.neutral.offWhite,
      fontFamily: designTokens.typography.fontFamily,
      margin: '0 auto',
      padding: designTokens.spacing.lg
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: designTokens.spacing.xl
      }}>
        <Text variant="h1" as="h1">CoreTet</Text>
        <Button
          variant="primary"
          iconOnly
          icon={<Plus size={24} />}
          aria-label="Add new track"
        />
      </div>

      {/* Welcome Section */}
      <div style={{ marginBottom: designTokens.spacing.xl }}>
        <Text variant="h2" as="h2" style={{ marginBottom: designTokens.spacing.xs }}>
          Good morning, Alex
        </Text>
        <Text variant="bodySmall" color="secondary">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </div>

      {/* Stats Section */}
      <div style={{
        display: 'flex',
        gap: designTokens.spacing.lg,
        marginBottom: designTokens.spacing.xl
      }}>
        <div style={{
          backgroundColor: designTokens.colors.neutral.white,
          padding: designTokens.spacing.md,
          borderRadius: '8px',
          flex: 1,
          textAlign: 'center'
        }}>
          <Text variant="h3" as="div" style={{ marginBottom: designTokens.spacing.xs }}>
            4
          </Text>
          <Text variant="caption" color="secondary">Bands</Text>
        </div>
        <div style={{
          backgroundColor: designTokens.colors.neutral.white,
          padding: designTokens.spacing.md,
          borderRadius: '8px',
          flex: 1,
          textAlign: 'center'
        }}>
          <Text variant="h3" as="div" style={{ marginBottom: designTokens.spacing.xs }}>
            {mockTracks.length}
          </Text>
          <Text variant="caption" color="secondary">Tracks</Text>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: designTokens.spacing.sm,
        marginBottom: designTokens.spacing.xl
      }}>
        <Button variant="primary" icon={<Users size={16} />}>
          View Bands
        </Button>
        <Button variant="secondary" icon={<Music size={16} />}>
          All Tracks
        </Button>
      </div>

      {/* Latest Tracks Section */}
      <div style={{ marginBottom: designTokens.spacing.lg }}>
        <Text variant="h2" as="h2" style={{ marginBottom: designTokens.spacing.md }}>
          Latest Tracks
        </Text>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: designTokens.spacing.sm
        }}>
          {mockTracks.map((track, index) => (
            <TrackCard
              key={index}
              title={track.title}
              duration={track.duration}
              subtitle={track.bandName}
              isPlaying={playingTrack === track.title}
              onPlayPause={() => handlePlayPause(track.title)}
              rating={track.rating}
              onRate={(rating) => handleTrackRating(track.title, rating)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        paddingTop: designTokens.spacing.xl,
        borderTop: `1px solid ${designTokens.colors.neutral.lightGray}`
      }}>
        <Text variant="caption" color="secondary">
          CoreTet Design System v1.0
        </Text>
      </div>
    </div>
  );
}