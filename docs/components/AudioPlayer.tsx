import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  MessageCircle, 
  Star, 
  Plus, 
  Share, 
  ChevronDown,
  Volume2
} from "lucide-react";

interface AudioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  track?: {
    title: string;
    artist: string;
    ensemble?: string;
    albumArt?: string;
    duration: number; // in seconds
  };
}

export function AudioPlayer({ isOpen, onClose, track }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [volume, setVolume] = useState(75);

  // Mock progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && track) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= track.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, track]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  if (!isOpen || !track) return null;

  const progressPercentage = track.duration > 0 ? (currentTime / track.duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="p-2"
        >
          <ChevronDown size={20} />
        </Button>
        <h4 className="font-medium">Now Playing</h4>
        <Button variant="ghost" size="sm" className="p-2">
          <Volume2 size={20} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Album Art */}
        <div 
          className="bg-gray-200 rounded-lg mb-8 shadow-subtle"
          style={{ width: '280px', height: '280px', borderRadius: '8px' }}
        >
          {track.albumArt ? (
            <img 
              src={track.albumArt} 
              alt={`${track.title} album art`}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
              ♪
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-8 max-w-md">
          <h2 
            className="mb-2 truncate"
            style={{ fontSize: '24px', fontWeight: '500', lineHeight: '1.3' }}
          >
            {track.title}
          </h2>
          <p 
            className="text-rdio-primary mb-1 truncate"
            style={{ fontSize: '16px', fontWeight: '400' }}
          >
            {track.artist}
          </p>
          {track.ensemble && (
            <p 
              className="text-rdio-secondary truncate"
              style={{ fontSize: '12px' }}
            >
              {track.ensemble}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-2">
          <Slider
            value={[currentTime]}
            max={track.duration}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full"
          />
        </div>

        {/* Time Stamps */}
        <div className="flex justify-between w-full max-w-md mb-8">
          <span 
            className="text-rdio-secondary"
            style={{ fontSize: '12px' }}
          >
            {formatTime(currentTime)}
          </span>
          <span 
            className="text-rdio-secondary"
            style={{ fontSize: '12px' }}
          >
            {formatTime(track.duration)}
          </span>
        </div>

        {/* Main Playback Controls */}
        <div className="flex items-center gap-8 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-3 text-rdio-secondary hover:text-text-primary"
          >
            <SkipBack size={24} />
          </Button>
          
          <Button
            variant="primary"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="shadow-play-button"
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%'
            }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-3 text-rdio-secondary hover:text-text-primary"
          >
            <SkipForward size={24} />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center gap-8 mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 ${isShuffled ? 'text-rdio-primary' : 'text-rdio-secondary hover:text-text-primary'}`}
          >
            <Shuffle size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
              const currentIndex = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className={`p-2 ${repeatMode !== 'off' ? 'text-rdio-primary' : 'text-rdio-secondary hover:text-text-primary'}`}
          >
            <Repeat size={20} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-xs">1</span>
            )}
          </Button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-off-white border-t border-border p-6">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-rdio-secondary hover:text-rdio-primary transition-colors">
            <MessageCircle size={20} />
            <span style={{ fontSize: '12px' }}>Comment</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-rdio-secondary hover:text-accent-amber transition-colors">
            <Star size={20} />
            <span style={{ fontSize: '12px' }}>Rate</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-rdio-secondary hover:text-rdio-primary transition-colors">
            <Plus size={20} />
            <span style={{ fontSize: '12px' }}>Add to</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-rdio-secondary hover:text-rdio-primary transition-colors">
            <Share size={20} />
            <span style={{ fontSize: '12px' }}>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}