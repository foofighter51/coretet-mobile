import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from '../lib/auth-context';
import { supabase, db } from '../lib/supabase';
import { Version, Ensemble, Profile } from '../lib/database.types';
import { useAudioUpload, AudioManager } from '../lib/storage';

// Import existing components
import { ScreenTemplate, ScreenSection, CardGrid } from "./components/ScreenTemplate";
import { TrackListView, MemberListView } from "./components/ListView";
import { TabBar } from "./components/TabBar";
import { TrackCard } from "./components/TrackCard";
import { AudioPlayer } from "./components/AudioPlayer";
import { FileUploadZone } from "./components/FileUploadZone";
import { HomeScreen } from "./components/HomeScreen";
import { TrackListingScreen } from "./components/TrackListingScreen";
import { NowPlayingScreen } from "./components/NowPlayingScreen";
import { TrackUploadScreen } from "./components/TrackUploadScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Search, Filter, Plus, Users, Music } from "lucide-react";

// Phone authentication component
function PhoneAuth() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithPhone, verifyOtp } = useAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signInWithPhone(phone);
    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await verifyOtp(phone, otp);
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-mobile h-mobile bg-off-white mx-auto flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <h1 className="text-giant text-rdio-primary mb-2">CoreTet</h1>
          <p className="text-body-small text-rdio-secondary">
            Music collaboration made simple
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !phone}
            >
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />
              <p className="text-sm text-rdio-secondary mt-1">
                Code sent to {phone}
              </p>
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setStep('phone')}
            >
              Change Phone Number
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// Main app component with backend integration
function CoreTetApp() {
  const { user, profile, loading: authLoading } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [ensembles, setEnsembles] = useState<Ensemble[]>([]);
  const [activeTab, setActiveTab] = useState('tracks');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Version | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio upload hook
  const { uploadAudio, uploading, progress, error: uploadError } = useAudioUpload();

  // Audio manager for playback
  const [audioManager] = useState(() => new AudioManager());

  // Load user data
  useEffect(() => {
    if (user && profile) {
      loadUserData();
    }
  }, [user, profile]);

  // Setup audio manager callbacks
  useEffect(() => {
    audioManager.setCallbacks({
      onTimeUpdate: setCurrentTime,
      onEnded: () => {
        setPlayingTrack(null);
        // Auto-play next track if in playlist
        handleNextTrack();
      },
      onError: (error) => {
        setError(`Playback error: ${error.message}`);
        setPlayingTrack(null);
      },
    });

    return () => {
      audioManager.destroy();
    };
  }, [audioManager]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load user's ensembles
      const { data: ensembleData, error: ensembleError } = await db.ensembles.getByUser();
      if (ensembleError) throw ensembleError;

      if (ensembleData) {
        const userEnsembles = ensembleData.map(item => item.ensembles).filter(Boolean);
        setEnsembles(userEnsembles);

        // Load tracks from first ensemble
        if (userEnsembles.length > 0) {
          const { data: versionData, error: versionError } = await db.versions.getByEnsemble(userEnsembles[0].id);
          if (versionError) throw versionError;
          if (versionData) setVersions(versionData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async (version: Version) => {
    try {
      if (playingTrack === version.id) {
        // Pause current track
        audioManager.pause();
        setPlayingTrack(null);
      } else {
        // Play new track
        if (currentTrack?.id !== version.id) {
          await audioManager.loadTrack(version.file_url);
          setCurrentTrack(version);
        }

        await audioManager.play();
        setPlayingTrack(version.id);
        setIsPlayerOpen(true);

        // Record "listened" rating
        await db.ratings.upsert(version.id, 'listened');
      }
    } catch (err) {
      setError(`Failed to play track: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleTrackRating = async (versionId: string, rating: 'like' | 'love') => {
    try {
      await db.ratings.upsert(versionId, rating);

      // Update local state to reflect new rating
      setVersions(prev => prev.map(v =>
        v.id === versionId
          ? { ...v, user_rating: rating }
          : v
      ));
    } catch (err) {
      setError(`Failed to rate track: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleNextTrack = () => {
    if (!currentTrack) return;

    const currentIndex = versions.findIndex(v => v.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % versions.length;
    const nextTrack = versions[nextIndex];

    if (nextTrack) {
      handlePlayPause(nextTrack);
    }
  };

  const handlePreviousTrack = () => {
    if (!currentTrack) return;

    const currentIndex = versions.findIndex(v => v.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? versions.length - 1 : currentIndex - 1;
    const prevTrack = versions[prevIndex];

    if (prevTrack) {
      handlePlayPause(prevTrack);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!user) return;

    const file = files[0];
    if (!file) return;

    try {
      const result = await uploadAudio(file, user.id, {
        title: file.name.replace(/\.[^/.]+$/, ''),
        versionType: 'other',
      });

      if (result) {
        // Reload versions to show new upload
        await loadUserData();
      }
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRefresh = async () => {
    await loadUserData();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading) {
    return (
      <div className="w-mobile h-mobile bg-off-white mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rdio-primary mx-auto mb-4"></div>
          <p className="text-rdio-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <PhoneAuth />;
  }

  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ScreenTemplate
        navigationTitle="CoreTet"
        rightAction={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? '...' : 'Refresh'}
            </Button>
            <button
              className="flex items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                color: '#586069'
              }}
            >
              <Plus size={24} />
            </button>
          </div>
        }
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
          <>
            <ScreenSection>
              <div className="flex items-center justify-between">
                <h2>Your Tracks</h2>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="caption">
                    {versions.length} tracks
                  </Badge>
                </div>
              </div>
            </ScreenSection>

            {versions.length === 0 && !loading ? (
              <ScreenSection>
                <div className="text-center py-12">
                  <Music size={48} className="mx-auto text-rdio-secondary mb-4" />
                  <h3 className="text-h3 mb-2">No tracks yet</h3>
                  <p className="text-body-small text-rdio-secondary mb-6">
                    Upload your first track to start collaborating
                  </p>
                  <FileUploadZone
                    onFilesSelected={handleFileUpload}
                    accept="audio/*"
                    maxFiles={1}
                  />
                </div>
              </ScreenSection>
            ) : (
              <TrackListView
                tracks={versions.map((version) => (
                  <TrackCard
                    key={version.id}
                    title={version.title}
                    duration={formatDuration(version.duration_seconds || 0)}
                    isPlaying={playingTrack === version.id}
                    onPlayPause={() => handlePlayPause(version)}
                    rating={(version as any).user_rating || 'none'}
                    onRate={(rating) => handleTrackRating(version.id, rating)}
                  />
                ))}
                onRefresh={handleRefresh}
                isRefreshing={loading}
                emptyState={{
                  icon: Music,
                  title: "No tracks yet",
                  description: "Upload your first track to start building your music library and collaborate with other musicians.",
                  actionLabel: "Upload Track",
                  onAction: () => {/* Handle upload */}
                }}
              />
            )}

            {/* Upload Progress */}
            {uploading && progress && (
              <ScreenSection>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-rdio-secondary">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-rdio-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              </ScreenSection>
            )}
          </>
        )}

        {activeTab === 'bands' && (
          <>
            <ScreenSection>
              <div className="flex items-center justify-between">
                <h2>Your Ensembles</h2>
                <Badge variant="secondary" className="caption">
                  {ensembles.length} bands
                </Badge>
              </div>
            </ScreenSection>

            {ensembles.length === 0 ? (
              <ScreenSection>
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-rdio-secondary mb-4" />
                  <h3 className="text-h3 mb-2">No ensembles yet</h3>
                  <p className="text-body-small text-rdio-secondary mb-6">
                    Create or join an ensemble to start collaborating
                  </p>
                  <div className="space-y-3">
                    <Button variant="primary" className="w-full">
                      Create Ensemble
                    </Button>
                    <Button variant="secondary" className="w-full">
                      Join with Code
                    </Button>
                  </div>
                </div>
              </ScreenSection>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-4">
                {ensembles.map((ensemble) => (
                  <div
                    key={ensemble.id}
                    className="bg-white rounded-lg p-4 shadow-default cursor-pointer hover:shadow-elevated transition-shadow"
                  >
                    <h4 className="font-semibold mb-2">{ensemble.name}</h4>
                    <p className="text-sm text-rdio-secondary">
                      {(ensemble as any).member_count || 0} members
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <div className="absolute inset-0 bg-off-white">
            <ProfileScreen
              userName={profile.name}
              phoneNumber={profile.phone_number}
              userInitials={profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              currentBand={ensembles[0]?.name || "No ensemble"}
              storageInfo={{
                used: 0, // Calculate from actual usage
                total: 50.0
              }}
            />
          </div>
        )}
      </ScreenTemplate>

      {/* Audio Player */}
      <AudioPlayer
        isOpen={isPlayerOpen && !isNowPlayingOpen}
        onClose={() => setIsPlayerOpen(false)}
        track={currentTrack ? {
          title: currentTrack.title,
          artist: 'Artist', // Add to schema later
          ensemble: 'Ensemble', // Add to schema later
          albumArt: undefined,
          duration: currentTrack.duration_seconds || 0
        } : undefined}
      />

      {/* Now Playing Screen */}
      <NowPlayingScreen
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
        track={currentTrack ? {
          title: currentTrack.title,
          artist: 'Artist',
          ensemble: 'Ensemble',
          albumArt: undefined,
          duration: currentTrack.duration_seconds || 0
        } : undefined}
        isPlaying={playingTrack === currentTrack?.id}
        currentTime={currentTime}
        onPlayPause={() => {
          if (currentTrack) {
            handlePlayPause(currentTrack);
          }
        }}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onSeek={(time) => {
          audioManager.seek(time);
          setCurrentTime(time);
        }}
      />
    </>
  );
}

// Root App with Auth Provider
export default function App() {
  return (
    <AuthProvider>
      <CoreTetApp />
    </AuthProvider>
  );
}