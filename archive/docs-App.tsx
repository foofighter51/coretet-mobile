import { useState, useEffect } from "react";
import { ScreenTemplate, ScreenSection, CardGrid } from "./components/ScreenTemplate";
import { TrackListView, MemberListView } from "./components/ListView";
import { TabBar } from "./components/TabBar";
import { TrackCard } from "./components/TrackCard";
import { AudioPlayer } from "./components/AudioPlayer";
import { FileUploadZone } from "./components/FileUploadZone";
import { HomeScreen } from "./components/HomeScreen";
import { TracksScreen } from "./components/TracksScreen";
import { TrackListingScreen } from "./components/TrackListingScreen";
import { NowPlayingScreen } from "./components/NowPlayingScreen";
import { TrackUploadScreen } from "./components/TrackUploadScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { EnsembleInviteFlow } from "./components/EnsembleInviteFlow";
import { CommentThreadScreen } from "./components/CommentThreadScreen";
import { CollaboratorCard } from "./components/CollaboratorCard";
import { ProjectCard } from "./components/ProjectCard";
import { ActivityFeed } from "./components/ActivityFeed";
import { EmptyState } from "./components/EmptyState";
import { TrackCardSkeleton } from "./components/TrackCardSkeleton";
import { EnsembleCardSkeleton } from "./components/EnsembleCardSkeleton";
import { CollaboratorCardSkeleton } from "./components/CollaboratorCardSkeleton";
import { ActivityFeedSkeleton } from "./components/ActivityFeedSkeleton";
import { LoadingState } from "./components/LoadingState";
import { ErrorBanner } from "./components/ErrorBanner";
import { ConnectionError } from "./components/ConnectionError";
import { UploadError } from "./components/UploadError";
import { InputWithError } from "./components/InputWithError";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Search, Filter, Plus, Users, Zap, Music } from "lucide-react";

const mockTracks = [
  {
    title: "Summer Nights",
    artist: "Alex Chen",
    ensemble: "Alex Chen Collective",
    duration: "3:42",
    durationSeconds: 222,
    albumArt: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=280&utm_source=figma&utm_medium=referral",
    rating: 'like' as const
  },
  {
    title: "Digital Dreams", 
    artist: "Emma Rodriguez",
    ensemble: "Electronic Ensemble",
    duration: "4:15",
    durationSeconds: 255,
    rating: 'love' as const
  },
  {
    title: "Midnight Jazz",
    artist: "David Park",
    ensemble: "The Park Quartet",
    duration: "5:28",
    durationSeconds: 328,
    rating: 'none' as const
  },
  {
    title: "Electric Pulse",
    artist: "Maya Singh",
    ensemble: "Singh & The Synthetics",
    duration: "3:21",
    durationSeconds: 201,
    rating: 'none' as const
  },
  {
    title: "Acoustic Memories",
    artist: "James Wilson",
    ensemble: "Solo Performance",
    duration: "4:03",
    durationSeconds: 243,
    rating: 'like' as const
  }
];

const mockCollaborators = [
  {
    name: "Sarah Martinez",
    role: "Vocalist & Songwriter",
    status: 'online' as const,
    skills: ["Vocals", "Lyrics", "Piano"],
    projectsCount: 3,
    isConnected: true
  },
  {
    name: "Mike Douglas",
    role: "Producer & Engineer", 
    status: 'away' as const,
    skills: ["Production", "Mixing", "Mastering"],
    projectsCount: 5,
    isConnected: false
  },
  {
    name: "Lisa Kim",
    role: "Multi-instrumentalist",
    status: 'online' as const,
    skills: ["Guitar", "Bass", "Drums"],
    projectsCount: 2,
    isConnected: true
  }
];

const mockProjects = [
  {
    title: "EP Release 2024",
    description: "Collaborative EP featuring 5 original tracks with indie-pop influences",
    progress: 75,
    dueDate: "Dec 15, 2024",
    collaborators: 4,
    status: 'active' as const,
    priority: 'high' as const,
    genre: "Indie Pop"
  },
  {
    title: "Jazz Standards Album",
    description: "Modern interpretations of classic jazz standards",
    progress: 45,
    dueDate: "Jan 30, 2025", 
    collaborators: 3,
    status: 'active' as const,
    priority: 'medium' as const,
    genre: "Jazz"
  }
];

const mockActivities = [
  {
    id: '1',
    type: 'track_uploaded' as const,
    user: 'Sarah Martinez',
    action: 'uploaded a new version of',
    target: 'Summer Nights',
    timestamp: '2 hours ago'
  },
  {
    id: '2', 
    type: 'comment_added' as const,
    user: 'Mike Douglas',
    action: 'commented on',
    target: 'Digital Dreams',
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    type: 'collaborator_joined' as const,
    user: 'Lisa Kim',
    action: 'joined the project',
    target: 'EP Release 2024',
    timestamp: '1 day ago'
  }
];

// Mock tracks for specific bands
const mockBandTracks: Record<string, typeof mockTracks> = {
  '1': [ // Summer Indie Band
    {
      title: "Golden Hour Dreams",
      artist: "Alex Chen",
      ensemble: "Summer Indie Band",
      duration: "3:28",
      durationSeconds: 208,
      albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400",
      rating: 'love' as const
    },
    {
      title: "Vintage Vibes",
      artist: "Emma Rodriguez",
      ensemble: "Summer Indie Band",
      duration: "4:12",
      durationSeconds: 252,
      rating: 'like' as const
    },
    {
      title: "Sunset Boulevard",
      artist: "David Park",
      ensemble: "Summer Indie Band",
      duration: "3:45",
      durationSeconds: 225,
      rating: 'none' as const
    }
  ],
  '2': [], // Electronic Fusion Band - empty for demo
  '3': [ // Jazz Experiments
    {
      title: "Blue Note Reverie",
      artist: "Sarah Martinez",
      ensemble: "Jazz Experiments",
      duration: "5:32",
      durationSeconds: 332,
      albumArt: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXp6JTIwbXVzaWNpYW58ZW58MXx8fHwxNzU4NTU1NjgzfDA&ixlib=rb-4.1.0&q=80&w=400",
      rating: 'love' as const
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('bands'); // Default to tracks tab for mobile preview
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<typeof mockTracks[0] | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedBand, setSelectedBand] = useState<{
    id: string;
    name: string;
    memberCount: number;
  } | null>(null);
  const [showUploadScreen, setShowUploadScreen] = useState(false);
  const [showInviteFlow, setShowInviteFlow] = useState(false);
  const [showCommentThread, setShowCommentThread] = useState(false);
  const [commentTrack, setCommentTrack] = useState<typeof mockTracks[0] | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true); // Set to true for development preview
  const [isInitialLoading, setIsInitialLoading] = useState(false); // Set to false for immediate preview
  const [isTracksLoading, setIsTracksLoading] = useState(false);
  const [isCollaboratorsLoading, setIsCollaboratorsLoading] = useState(false);
  const [errorBannerVisible, setErrorBannerVisible] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<Array<{id: string, fileName: string}>>([]);
  const [errorType, setErrorType] = useState<'error' | 'connection' | 'upload' | 'warning'>('error');
  const [userProfile, setUserProfile] = useState<{
    phoneNumber: string;
    name: string;
    avatar?: string;
    choice: 'join' | 'form';
  } | null>(null);
  const [trackRatings, setTrackRatings] = useState<Record<string, 'none' | 'like' | 'love'>>({});

  const handlePlayPause = (trackTitle: string) => {
    const track = mockTracks.find(t => t.title === trackTitle) || 
                 Object.values(mockBandTracks).flat().find(t => t.title === trackTitle);
    if (track) {
      setCurrentTrack(track);
      setIsPlayerOpen(true);
      setIsNowPlayingOpen(true);
      setPlayingTrack(playingTrack === trackTitle ? null : trackTitle);
      setCurrentTime(0);
    }
  };

  const handleNowPlayingPlayPause = () => {
    if (currentTrack) {
      setPlayingTrack(playingTrack === currentTrack.title ? null : currentTrack.title);
    }
  };

  const handleNowPlayingNext = () => {
    // Simple demo - cycle through mockTracks
    if (currentTrack) {
      const allTracks = [...mockTracks, ...Object.values(mockBandTracks).flat()];
      const currentIndex = allTracks.findIndex(t => t.title === currentTrack.title);
      const nextTrack = allTracks[(currentIndex + 1) % allTracks.length];
      setCurrentTrack(nextTrack);
      setPlayingTrack(nextTrack.title);
      setCurrentTime(0);
    }
  };

  const handleNowPlayingPrevious = () => {
    // Simple demo - cycle through mockTracks
    if (currentTrack) {
      const allTracks = [...mockTracks, ...Object.values(mockBandTracks).flat()];
      const currentIndex = allTracks.findIndex(t => t.title === currentTrack.title);
      const prevIndex = currentIndex === 0 ? allTracks.length - 1 : currentIndex - 1;
      const prevTrack = allTracks[prevIndex];
      setCurrentTrack(prevTrack);
      setPlayingTrack(prevTrack.title);
      setCurrentTime(0);
    }
  };

  const handleNowPlayingSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleFileUpload = (files: FileList) => {
    console.log('Files uploaded:', Array.from(files).map(f => f.name));
    // Here you would typically handle the file upload process
    // For now, we'll just log the files
  };

  const handleBandClick = (bandId: string, bandName: string, memberCount: number) => {
    setSelectedBand({ id: bandId, name: bandName, memberCount });
  };

  const handleBackToHome = () => {
    setSelectedBand(null);
  };

  const handleShowUpload = () => {
    setShowUploadScreen(true);
  };

  const handleUploadCancel = () => {
    setShowUploadScreen(false);
  };

  const handleUploadComplete = (data: any) => {
    console.log('Track uploaded:', data);
    setShowUploadScreen(false);
    // Here you would typically save the track data
  };

  const handleOnboardingComplete = (userData: {
    phoneNumber: string;
    name: string;
    avatar?: string;
    choice: 'join' | 'form';
  }) => {
    setUserProfile(userData);
    setHasCompletedOnboarding(true);
    
    // Simulate initial app loading
    setIsInitialLoading(true);
    setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    
    console.log('Onboarding completed:', userData);
    // Here you would typically save the user data to your backend
  };

  const handleShowInvites = () => {
    setShowInviteFlow(true);
  };

  const handleInviteComplete = (inviteData: { phoneNumbers: string[]; message?: string }) => {
    console.log('Invites sent:', inviteData);
    setShowInviteFlow(false);
    // Here you would typically send the invites via your backend
  };

  const handleTrackComment = (trackTitle: string) => {
    const track = mockTracks.find(t => t.title === trackTitle) || 
                 Object.values(mockBandTracks).flat().find(t => t.title === trackTitle);
    if (track) {
      setCommentTrack(track);
      setShowCommentThread(true);
    }
  };

  const handleCommentAdd = (content: string, timestamp: number, replyToId?: string) => {
    console.log('New comment:', { content, timestamp, replyToId, track: commentTrack?.title });
    // Here you would typically save the comment to your backend
  };

  const handleTrackRating = (trackTitle: string, rating: 'like' | 'love') => {
    setTrackRatings(prev => ({
      ...prev,
      [trackTitle]: prev[trackTitle] === rating ? 'none' : rating
    }));
    console.log('Track rated:', { trackTitle, rating });
    // Here you would typically save the rating to your backend
  };

  // Simulate time progression when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playingTrack && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          return newTime >= currentTrack.durationSeconds ? 0 : newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playingTrack, currentTrack]);

  // Show onboarding if user hasn't completed it
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show initial loading after onboarding
  if (isInitialLoading) {
    return (
      <div className="w-mobile h-mobile bg-off-white mx-auto flex items-center justify-center">
        <LoadingState 
          message="Setting up your workspace..."
          size="lg"
        />
      </div>
    );
  }

  // Special handling for Bands tab (Home Screen)
  if (activeTab === 'bands') {
    return (
      <div className="w-mobile h-mobile bg-off-white mx-auto overflow-hidden">
        {selectedBand ? (
          <TrackListingScreen
            ensembleName={selectedBand.name}
            memberCount={selectedBand.memberCount}
            tracks={mockBandTracks[selectedBand.id] || []}
            onBack={handleBackToHome}
            onPlayPause={handlePlayPause}
            onTrackComment={handleTrackComment}
            onUploadTrack={handleShowUpload}
            playingTrack={playingTrack}
            onTrackRate={handleTrackRating}
          />
        ) : (
          <HomeScreen 
            userName={userProfile?.name?.split(' ')[0] || "Alex"} 
            onEnsembleClick={handleBandClick}
            onShowInvites={handleShowInvites}
          />
        )}
        {/* Tab Bar for Home Screen */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Full-screen overlays */}
        <AudioPlayer
          isOpen={isPlayerOpen && !isNowPlayingOpen}
          onClose={() => setIsPlayerOpen(false)}
          track={currentTrack ? {
            title: currentTrack.title,
            artist: currentTrack.artist,
            ensemble: currentTrack.ensemble,
            albumArt: currentTrack.albumArt,
            duration: currentTrack.durationSeconds
          } : undefined}
        />

        <NowPlayingScreen
          isOpen={isNowPlayingOpen}
          onClose={() => setIsNowPlayingOpen(false)}
          track={currentTrack ? {
            title: currentTrack.title,
            artist: currentTrack.artist,
            ensemble: currentTrack.ensemble,
            albumArt: currentTrack.albumArt,
            duration: currentTrack.durationSeconds
          } : undefined}
          isPlaying={playingTrack === currentTrack?.title}
          currentTime={currentTime}
          onPlayPause={handleNowPlayingPlayPause}
          onNext={handleNowPlayingNext}
          onPrevious={handleNowPlayingPrevious}
          onSeek={handleNowPlayingSeek}
        />

        {showUploadScreen && (
          <div className="fixed inset-0 z-50">
            <TrackUploadScreen
              onCancel={handleUploadCancel}
              onUpload={handleUploadComplete}
            />
          </div>
        )}

        {showInviteFlow && (
          <EnsembleInviteFlow
            ensembleName="Summer Indie Band"
            onClose={() => setShowInviteFlow(false)}
            onComplete={handleInviteComplete}
          />
        )}

        <CommentThreadScreen
          isOpen={showCommentThread}
          onClose={() => setShowCommentThread(false)}
          track={commentTrack ? {
            title: commentTrack.title,
            albumArt: commentTrack.albumArt,
            duration: commentTrack.durationSeconds
          } : undefined}
          isPlaying={playingTrack === commentTrack?.title}
          currentTime={currentTime}
          onPlayPause={handleNowPlayingPlayPause}
          onAddComment={handleCommentAdd}
        />
      </div>
    );
  }

  // All other tabs use the standardized ScreenTemplate
  return (
    <>
      {/* Error Banner */}
      <ErrorBanner
        type={errorType}
        title={errorType === 'connection' ? 'No connection' : errorType === 'upload' ? 'Upload failed' : 'Something went wrong'}
        message={errorType === 'connection' ? 'Check your internet and try again' : errorType === 'upload' ? 'Some files failed to upload' : 'We encountered an error while loading your data'}
        actionLabel={errorType === 'connection' ? 'Retry' : errorType === 'upload' ? 'Retry All' : 'Refresh'}
        onAction={() => {
          console.log('Error action clicked');
          if (errorType === 'connection') {
            setShowConnectionError(false);
          }
        }}
        onDismiss={() => setErrorBannerVisible(false)}
        isVisible={errorBannerVisible}
      />

      <ScreenTemplate
        navigationTitle="CoreTet"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* Search Bar Section */}
        <ScreenSection>
          <div className="flex gap-2 items-center mobile-container">
            <div className="flex-1 relative min-w-0">
              <Search size={24} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rdio-secondary w-icon h-icon" />
              <Input
                placeholder="Search..."
                className="pl-12 pr-2 w-full text-ellipsis"
              />
            </div>
            <Button variant="secondary" size="small" className="flex-shrink-0">
              <Filter size={16} className="w-icon-small h-icon-small" />
              <span className="hidden xs:inline ml-2">FILTER</span>
            </Button>
          </div>
        </ScreenSection>

        {/* Tab Content */}
        {activeTab === 'tracks' && (
          <TracksScreen
            userName={userProfile?.name?.split(' ')[0] || "Alex"}
            onPlayPause={handlePlayPause}
            onTrackComment={handleTrackComment}
            onUploadTrack={handleShowUpload}
            playingTrack={playingTrack}
            onTrackRate={handleTrackRating}
          />
        )}

        {activeTab === 'collaborators' && (
          <>
            <ScreenSection>
              <div className="flex items-center justify-between">
                <h2>Collaborators</h2>
                <Badge variant="secondary" className="caption">
                  {isCollaboratorsLoading ? '...' : mockCollaborators.length} active
                </Badge>
              </div>
            </ScreenSection>
            
            {isCollaboratorsLoading ? (
              <ScreenSection>
                <CollaboratorCardSkeleton count={3} />
              </ScreenSection>
            ) : (
              <MemberListView
                members={mockCollaborators.map((collaborator, index) => ({
                  id: index.toString(),
                  name: collaborator.name,
                  role: collaborator.role,
                  status: collaborator.status,
                  onClick: () => console.log(`View ${collaborator.name} profile`)
                }))}
                onRefresh={() => {
                  setIsCollaboratorsLoading(true);
                  // Simulate refresh
                  setTimeout(() => {
                    setIsCollaboratorsLoading(false);
                  }, 1500);
                }}
                isRefreshing={isCollaboratorsLoading}
                emptyState={{
                  icon: Users,
                  title: "Invite your band",
                  description: "Music is better together! Invite musicians to collaborate on projects and create amazing music as a team.",
                  actionLabel: "Invite Musicians",
                  onAction: handleShowInvites
                }}
              />
            )}
          </>
        )}

        {activeTab === 'add' && (
          <>
            <ScreenSection>
              <h2>Add Content</h2>
            </ScreenSection>
            
            <ScreenSection>
              <div className="grid gap-6">
                <Card className="bg-white rounded-lg shadow-subtle p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-rdio-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus size={24} className="text-white" />
                    </div>
                    <h3 className="mb-2">Upload New Track</h3>
                    <p className="text-rdio-secondary">
                      Upload and share your music with bandmates
                    </p>
                  </div>
                  <Button 
                    variant="primary"
                    onClick={handleShowUpload}
                  >
                    Upload Track
                  </Button>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white rounded-lg shadow-subtle p-6">
                    <h4 className="mb-3">Quick Actions</h4>
                    <div className="space-y-3">
                      <Button 
                        onClick={handleShowUpload}
                        variant="secondary" 
                        className="w-full justify-start"
                      >
                        <Plus size={16} className="mr-2" />
                        Upload Audio File
                      </Button>
                      <Button variant="secondary" className="w-full justify-start">
                        <Plus size={16} className="mr-2" />
                        Create Playlist
                      </Button>
                      <Button variant="secondary" className="w-full justify-start">
                        <Plus size={16} className="mr-2" />
                        Import from Library
                      </Button>
                    </div>
                  </Card>

                  <Card className="bg-white rounded-lg shadow-subtle p-6">
                    <h4 className="mb-3">Recent Templates</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-off-white">
                        <p className="caption font-medium">Pop Track Template</p>
                        <p className="caption text-rdio-secondary">4 tracks, basic structure</p>
                      </div>
                      <div className="p-3 rounded-lg bg-off-white">
                        <p className="caption font-medium">Band Jam Template</p>
                        <p className="caption text-rdio-secondary">6 tracks, collaborative setup</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </ScreenSection>
          </>
        )}

        {activeTab === 'playlists' && (
          <>
            <ScreenSection>
              <div className="flex items-center justify-between">
                <h2>Band Playlists</h2>
                <Badge variant="secondary" className="caption">
                  Shared
                </Badge>
              </div>
            </ScreenSection>
            
            <ScreenSection>
              <EmptyState
                icon={Music}
                title="No playlists yet"
                description="Create playlists to organize tracks and share them with your bandmates."
                actionLabel="Create Playlist"
                onAction={() => console.log('Create playlist')}
              />
            </ScreenSection>
          </>
        )}

        {activeTab === 'profile' && (
          <div className="absolute inset-0 bg-off-white">
            <ProfileScreen 
              userName={userProfile?.name || "Alex Chen"}
              phoneNumber={userProfile?.phoneNumber || "+1 (555) 123-4567"}
              userInitials={userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : "AC"}
              currentBand="Summer Indie Band"
              storageInfo={{
                used: 12.4,
                total: 50.0
              }}
            />
          </div>
        )}
      </ScreenTemplate>

      {/* Full-screen Audio Player */}
      <AudioPlayer
        isOpen={isPlayerOpen && !isNowPlayingOpen}
        onClose={() => setIsPlayerOpen(false)}
        track={currentTrack ? {
          title: currentTrack.title,
          artist: currentTrack.artist,
          ensemble: currentTrack.ensemble,
          albumArt: currentTrack.albumArt,
          duration: currentTrack.durationSeconds
        } : undefined}
      />

      {/* Now Playing Screen */}
      <NowPlayingScreen
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
        track={currentTrack ? {
          title: currentTrack.title,
          artist: currentTrack.artist,
          ensemble: currentTrack.ensemble,
          albumArt: currentTrack.albumArt,
          duration: currentTrack.durationSeconds
        } : undefined}
        isPlaying={playingTrack === currentTrack?.title}
        currentTime={currentTime}
        onPlayPause={handleNowPlayingPlayPause}
        onNext={handleNowPlayingNext}
        onPrevious={handleNowPlayingPrevious}
        onSeek={handleNowPlayingSeek}
      />

      {/* Track Upload Screen */}
      {showUploadScreen && (
        <div className="fixed inset-0 z-50">
          <TrackUploadScreen
            onCancel={handleUploadCancel}
            onUpload={handleUploadComplete}
          />
        </div>
      )}

      {/* Band Invite Flow */}
      {showInviteFlow && (
        <EnsembleInviteFlow
          ensembleName="Summer Indie Band"
          onClose={() => setShowInviteFlow(false)}
          onComplete={handleInviteComplete}
        />
      )}

      {/* Comment Thread Screen */}
      <CommentThreadScreen
        isOpen={showCommentThread}
        onClose={() => setShowCommentThread(false)}
        track={commentTrack ? {
          title: commentTrack.title,
          albumArt: commentTrack.albumArt,
          duration: commentTrack.durationSeconds
        } : undefined}
        isPlaying={playingTrack === commentTrack?.title}
        currentTime={currentTime}
        onPlayPause={handleNowPlayingPlayPause}
        onAddComment={handleCommentAdd}
      />
    </>
  );
}