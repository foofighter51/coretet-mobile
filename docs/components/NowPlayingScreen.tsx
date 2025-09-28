import { useState } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  MessageCircle,
  Info,
  List
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { FullScreenModal } from "./Modal";

interface Comment {
  id: string;
  user: string;
  avatar?: string;
  message: string;
  timestamp: number; // seconds into the track
  timeFormatted: string; // "2:34"
  posted: string; // "2h ago"
}

interface Track {
  title: string;
  artist: string;
  ensemble: string;
  albumArt?: string;
  duration: number; // seconds
}

interface NowPlayingScreenProps {
  isOpen: boolean;
  onClose: () => void;
  track?: Track;
  isPlaying?: boolean;
  currentTime?: number;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (time: number) => void;
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: 'Sarah M.',
    avatar: 'SM',
    message: 'Love the guitar tone here! 🎸',
    timestamp: 45,
    timeFormatted: '0:45',
    posted: '2h ago'
  },
  {
    id: '2',
    user: 'Mike D.',
    avatar: 'MD',
    message: 'This section needs more reverb on the vocals',
    timestamp: 128,
    timeFormatted: '2:08',
    posted: '1h ago'
  },
  {
    id: '3',
    user: 'Lisa K.',
    avatar: 'LK',
    message: 'Perfect timing for the drum fill!',
    timestamp: 156,
    timeFormatted: '2:36',
    posted: '45m ago'
  },
  {
    id: '4',
    user: 'Alex C.',
    avatar: 'AC',
    message: 'Maybe we could add some strings in the bridge?',
    timestamp: 192,
    timeFormatted: '3:12',
    posted: '30m ago'
  }
];

export function NowPlayingScreen({
  isOpen,
  onClose,
  track,
  isPlaying = false,
  currentTime = 0,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek
}: NowPlayingScreenProps) {
  const [volume, setVolume] = useState([0.8]);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [activeTab, setActiveTab] = useState('comments');

  if (!isOpen || !track) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / track.duration) * 100;

  // Get comment markers for the progress bar
  const commentMarkers = mockComments.map(comment => ({
    position: (comment.timestamp / track.duration) * 100,
    comment
  }));

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleRepeatToggle = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={track.ensemble}
    >
      {/* Header */}
      <header 
        className="bg-white sticky top-0 z-20"
        style={{ 
          height: '88px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e1e4e8',
          boxShadow: '0px 2px 6px rgba(0,0,0,0.08)'
        }}
      >
        <div 
          className="flex items-center justify-between px-4"
          style={{ 
            height: '44px',
            paddingTop: '44px'
          }}
        >
          {/* Left Side - Back Button */}
          <div className="flex items-center" style={{ width: '60px' }}>
            <button 
              onClick={onClose}
              className="flex items-center justify-center"
              style={{ 
                width: '44px',
                height: '44px',
                color: '#0088cc'
              }}
            >
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Center - Playing From */}
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <p 
                className="text-rdio-secondary uppercase tracking-wide"
                style={{ 
                  fontSize: '10px',
                  lineHeight: '12px',
                  fontWeight: '500'
                }}
              >
                Playing from
              </p>
              <p 
                className="text-rdio-primary"
                style={{ 
                  fontSize: '14px',
                  fontWeight: '500',
                  lineHeight: '16px'
                }}
              >
                {track.ensemble}
              </p>
            </div>
          </div>

          {/* Right Side - More Button */}
          <div 
            className="flex items-center justify-end"
            style={{ width: '60px' }}
          >
            <button 
              className="flex items-center justify-center"
              style={{ 
                width: '44px',
                height: '44px',
                color: '#586069'
              }}
            >
              <MoreHorizontal size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div 
          className="rounded-lg shadow-card overflow-hidden"
          style={{ 
            width: '280px', 
            height: '280px',
            borderRadius: '12px'
          }}
        >
          {track.albumArt ? (
            <img 
              src={track.albumArt} 
              alt={`${track.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full"></div>
                <p className="caption">No Cover</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="px-6 py-4 text-center">
        <h2 
          className="mb-1 text-text-primary"
          style={{ 
            fontSize: '24px',
            fontWeight: '600',
            lineHeight: '1.3'
          }}
        >
          {track.title}
        </h2>
        <button 
          className="text-rdio-primary mb-1"
          style={{ 
            fontSize: '18px',
            fontWeight: '400',
            lineHeight: '1.4'
          }}
        >
          {track.artist}
        </button>
        <p 
          className="text-rdio-secondary"
          style={{ 
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '1.4'
          }}
        >
          {track.ensemble}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="relative mb-2">
          {/* Progress track */}
          <div className="h-1 bg-gray-200 rounded-full relative overflow-hidden">
            {/* Progress fill */}
            <div 
              className="h-full bg-rdio-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            
            {/* Comment markers */}
            {commentMarkers.map((marker, index) => (
              <div
                key={index}
                className="absolute top-0 w-1 h-1 bg-coral rounded-full transform -translate-x-1/2"
                style={{ left: `${marker.position}%` }}
                title={`${marker.comment.user}: ${marker.comment.message}`}
              />
            ))}
            
            {/* Progress handle */}
            <div 
              className="absolute top-1/2 w-3 h-3 bg-rdio-primary rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-sm"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Time labels */}
        <div className="flex justify-between caption text-rdio-secondary">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-center gap-8">
          {/* Shuffle */}
          <button 
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 ${isShuffled ? 'text-rdio-primary' : 'text-rdio-secondary'}`}
          >
            <Shuffle size={24} />
          </button>

          {/* Previous */}
          <button 
            onClick={onPrevious}
            className="text-text-primary p-2"
          >
            <SkipBack size={28} />
          </button>

          {/* Play/Pause */}
          <button 
            onClick={onPlayPause}
            className="bg-rdio-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-play-button"
            style={{ borderRadius: '50%' }}
          >
            {isPlaying ? (
              <Pause size={32} />
            ) : (
              <Play size={32} className="ml-1" />
            )}
          </button>

          {/* Next */}
          <button 
            onClick={onNext}
            className="text-text-primary p-2"
          >
            <SkipForward size={28} />
          </button>

          {/* Repeat */}
          <button 
            onClick={handleRepeatToggle}
            className={`p-2 relative ${repeatMode !== 'off' ? 'text-rdio-primary' : 'text-rdio-secondary'}`}
          >
            <Repeat size={24} />
            {repeatMode === 'one' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-rdio-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="px-6 py-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleVolumeToggle}
            className="text-rdio-secondary"
          >
            {isMuted || volume[0] === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          <div className="flex-1">
            <Slider
              value={isMuted ? [0] : volume}
              onValueChange={setVolume}
              max={1}
              step={0.1}
              className="flex-1"
            />
          </div>
          <Volume2 size={20} className="text-rdio-secondary" />
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-off-white rounded-t-3xl flex-1 max-h-80 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-gray-200 rounded-none">
            <TabsTrigger 
              value="comments" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-rdio-primary data-[state=active]:border-b-2 data-[state=active]:border-rdio-primary rounded-none"
            >
              <MessageCircle size={16} className="mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="details"
              className="data-[state=active]:bg-transparent data-[state=active]:text-rdio-primary data-[state=active]:border-b-2 data-[state=active]:border-rdio-primary rounded-none"
            >
              <Info size={16} className="mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="related"
              className="data-[state=active]:bg-transparent data-[state=active]:text-rdio-primary data-[state=active]:border-b-2 data-[state=active]:border-rdio-primary rounded-none"
            >
              <List size={16} className="mr-2" />
              Related
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockComments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-rdio-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-3 shadow-subtle">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user}</span>
                      <span className="caption text-rdio-secondary">
                        {comment.timeFormatted}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary">{comment.message}</p>
                  </div>
                  <p className="caption text-rdio-secondary mt-1 ml-3">
                    {comment.posted}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="details" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <p className="caption text-rdio-secondary mb-1">Album</p>
                <p className="text-sm">{track.ensemble}</p>
              </div>
              <div>
                <p className="caption text-rdio-secondary mb-1">Duration</p>
                <p className="text-sm">{formatTime(track.duration)}</p>
              </div>
              <div>
                <p className="caption text-rdio-secondary mb-1">Genre</p>
                <p className="text-sm">Alternative Rock</p>
              </div>
              <div>
                <p className="caption text-rdio-secondary mb-1">Recorded</p>
                <p className="text-sm">November 2024</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="related" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <div className="text-center py-8">
                <p className="text-rdio-secondary">Related tracks coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FullScreenModal>
  );
}