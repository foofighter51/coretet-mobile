import { useState } from "react";
import { ArrowLeft, List, Grid, Music } from "lucide-react";
import { ScreenTemplate, ScreenSection } from "./ScreenTemplate";
import { TrackListView } from "./ListView";
import { TrackCard } from "./TrackCard";
import { Button } from "./ui/button";

interface Track {
  title: string;
  duration: string;
  durationSeconds: number;
  albumArt?: string;
  rating: 'none' | 'like' | 'love';
}

interface TrackListingScreenProps {
  ensembleName: string;
  memberCount: number;
  tracks: Track[];
  onBack: () => void;
  onPlayPause: (trackTitle: string) => void;
  onTrackComment?: (trackTitle: string) => void;
  onUploadTrack?: () => void;
  playingTrack: string | null;
  onTrackRate?: (trackTitle: string, rating: 'like' | 'love') => void;
}

export function TrackListingScreen({ 
  ensembleName, 
  memberCount, 
  tracks = [], 
  onBack,
  onPlayPause,
  onTrackComment,
  onUploadTrack,
  playingTrack,
  onTrackRate
}: TrackListingScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <ScreenTemplate
      navigationTitle={ensembleName}
      leftAction={
        <button 
          onClick={onBack}
          className="flex items-center justify-center"
          style={{ 
            width: '44px',
            height: '44px',
            color: '#0088cc'
          }}
        >
          <ArrowLeft size={24} />
        </button>
      }
      rightAction={
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white shadow-sm' 
                : ''
            }`}
            style={{
              color: viewMode === 'list' ? '#0088cc' : '#586069'
            }}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white shadow-sm' 
                : ''
            }`}
            style={{
              color: viewMode === 'grid' ? '#0088cc' : '#586069'
            }}
          >
            <Grid size={16} />
          </button>
        </div>
      }
      showTabBar={false}
    >
      {/* Ensemble Info Section */}
      <ScreenSection>
        <div className="text-center">
          <p 
            className="text-rdio-secondary"
            style={{ 
              fontSize: '12px',
              fontWeight: '400',
              lineHeight: '16px',
              color: '#9da7b0'
            }}
          >
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </ScreenSection>

      {/* Latest Tracks Section */}
      <ScreenSection>
        <h2>Latest Tracks</h2>
      </ScreenSection>

      {/* Simplified Track List */}
      <TrackListView
        tracks={tracks.map((track, index) => (
          <TrackCard
            key={index}
            title={track.title}
            duration={track.duration}
            isPlaying={playingTrack === track.title}
            onPlayPause={() => onPlayPause(track.title)}
            rating={track.rating}
            onRate={(rating) => onTrackRate?.(track.title, rating)}
          />
        ))}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        emptyState={{
          icon: Music,
          title: "No tracks yet",
          description: "Upload your first track to get the band started and begin collaborating on music together.",
          actionLabel: "Upload Track",
          onAction: onUploadTrack
        }}
      />
    </ScreenTemplate>
  );
}