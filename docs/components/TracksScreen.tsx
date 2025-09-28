import { useState } from "react";
import { Search, Music } from "lucide-react";
import { ScreenTemplate, ScreenSection } from "./ScreenTemplate";
import { TrackListView } from "./ListView";
import { TrackCard } from "./TrackCard";

interface Track {
  title: string;
  duration: string;
  durationSeconds: number;
  albumArt?: string;
  rating: 'none' | 'like' | 'love';
  bandName: string;
  bandId: string;
}

interface TracksScreenProps {
  userName?: string;
  tracks?: Track[];
  onPlayPause: (trackTitle: string) => void;
  onTrackComment?: (trackTitle: string) => void;
  onUploadTrack?: () => void;
  playingTrack: string | null;
  onTrackRate?: (trackTitle: string, rating: 'like' | 'love') => void;
}

// Mock all tracks across all bands
const mockAllTracks: Track[] = [
  {
    title: "Summer Breeze",
    duration: "3:42",
    durationSeconds: 222,
    rating: 'love',
    bandName: "Summer Indie Band",
    bandId: "1"
  },
  {
    title: "Midnight Drive",
    duration: "4:15",
    durationSeconds: 255,
    rating: 'like',
    bandName: "Summer Indie Band",
    bandId: "1"
  },
  {
    title: "Neon Lights",
    duration: "3:28",
    durationSeconds: 208,
    rating: 'none',
    bandName: "Electronic Fusion Band",
    bandId: "2"
  },
  {
    title: "Synth Wave",
    duration: "5:01",
    durationSeconds: 301,
    rating: 'love',
    bandName: "Electronic Fusion Band",
    bandId: "2"
  },
  {
    title: "Blue Note",
    duration: "6:33",
    durationSeconds: 393,
    rating: 'like',
    bandName: "Jazz Experiments",
    bandId: "3"
  },
  {
    title: "Acoustic Morning",
    duration: "2:47",
    durationSeconds: 167,
    rating: 'none',
    bandName: "Acoustic Sessions",
    bandId: "4"
  },
  {
    title: "Thunder Road",
    duration: "4:52",
    durationSeconds: 292,
    rating: 'love',
    bandName: "Rock Revival Band",
    bandId: "5"
  },
  {
    title: "Chill Vibes",
    duration: "3:15",
    durationSeconds: 195,
    rating: 'like',
    bandName: "Lo-Fi Beats Band",
    bandId: "6"
  }
];

export function TracksScreen({
  userName = "Alex",
  tracks = mockAllTracks,
  onPlayPause,
  onTrackComment,
  onUploadTrack,
  playingTrack,
  onTrackRate
}: TracksScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.bandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScreenTemplate
      navigationTitle="Tracks"
      showTabBar={false}
    >
      {/* Welcome Message Section */}
      <ScreenSection>
        <div>
          <h2
            className="text-text-primary mb-1"
            style={{
              fontSize: '28px',
              fontWeight: '600',
              lineHeight: '1.3'
            }}
          >
            Your Music, {userName}
          </h2>
          <p
            className="text-rdio-secondary"
            style={{
              fontSize: '16px',
              fontWeight: '400',
              lineHeight: '1.5'
            }}
          >
            {tracks.length} tracks across all bands
          </p>
        </div>
      </ScreenSection>

      {/* Search Section */}
      <ScreenSection>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tracks or bands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              fontSize: '16px',
              height: '44px'
            }}
          />
        </div>
      </ScreenSection>

      {/* All Tracks List */}
      <TrackListView
        tracks={filteredTracks.map((track, index) => (
          <TrackCard
            key={`${track.bandId}-${index}`}
            title={track.title}
            duration={track.duration}
            isPlaying={playingTrack === track.title}
            onPlayPause={() => onPlayPause(track.title)}
            rating={track.rating}
            onRate={(rating) => onTrackRate?.(track.title, rating)}
            subtitle={track.bandName}
          />
        ))}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        emptyState={{
          icon: Music,
          title: searchQuery ? "No tracks found" : "No tracks yet",
          description: searchQuery
            ? `No tracks match "${searchQuery}". Try a different search term.`
            : "Upload your first track to get started with music collaboration.",
          actionLabel: "Upload Track",
          onAction: onUploadTrack
        }}
      />
    </ScreenTemplate>
  );
}