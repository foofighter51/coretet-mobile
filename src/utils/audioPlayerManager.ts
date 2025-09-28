import { Howl, Howler } from 'howler';

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
  duration?: number;
  artist?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error?: string;
}

export interface AudioPlayerEvents {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onEnd?: () => void;
  onLoad?: () => void;
  onLoadError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export class AudioPlayerManager {
  private static instance: AudioPlayerManager;
  private currentSound: Howl | null = null;
  private currentTrack: AudioTrack | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private events: AudioPlayerEvents = {};
  private playbackState: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7, // Start at 70% to match our normalization
    isLoading: false
  };

  // Singleton pattern for global audio management
  static getInstance(): AudioPlayerManager {
    if (!AudioPlayerManager.instance) {
      AudioPlayerManager.instance = new AudioPlayerManager();
    }
    return AudioPlayerManager.instance;
  }

  constructor() {
    // Configure Howler global settings
    Howler.volume(0.7); // Default to 70% volume (matches our normalization)
    Howler.autoSuspend = false; // Prevent audio context suspension

    // Handle browser audio context restrictions
    this.setupAudioContext();
  }

  /**
   * Setup audio context for mobile browsers
   */
  private setupAudioContext(): void {
    // Some browsers require user interaction before audio can play
    const enableAudio = () => {
      Howler.ctx?.resume();
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('click', enableAudio);
    };

    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('click', enableAudio);
  }

  /**
   * Load and play a track
   */
  async loadTrack(track: AudioTrack, events: AudioPlayerEvents = {}): Promise<void> {
    try {
      // Stop current track if playing
      this.stop();

      this.currentTrack = track;
      this.events = events;
      this.updatePlaybackState({ isLoading: true, error: undefined });

      // Create new Howl instance
      this.currentSound = new Howl({
        src: [track.url],
        format: ['mp3', 'wav', 'aac'], // Support multiple formats
        volume: this.playbackState.volume,
        onload: () => {
          this.handleLoad();
        },
        onloaderror: (id, error) => {
          this.handleLoadError(error?.toString() || 'Failed to load audio');
        },
        onplay: () => {
          this.handlePlay();
        },
        onpause: () => {
          this.handlePause();
        },
        onend: () => {
          this.handleEnd();
        },
        onstop: () => {
          this.handleStop();
        }
      });

    } catch (error) {
      this.handleLoadError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Play the current track
   */
  play(): void {
    if (this.currentSound && !this.playbackState.isLoading) {
      this.currentSound.play();
    }
  }

  /**
   * Pause the current track
   */
  pause(): void {
    if (this.currentSound) {
      this.currentSound.pause();
    }
  }

  /**
   * Stop the current track
   */
  stop(): void {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.unload();
      this.currentSound = null;
    }

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    this.updatePlaybackState({
      isPlaying: false,
      currentTime: 0,
      isLoading: false
    });
  }

  /**
   * Seek to a specific time (in seconds)
   */
  seek(time: number): void {
    if (this.currentSound && this.playbackState.duration > 0) {
      const clampedTime = Math.max(0, Math.min(time, this.playbackState.duration));
      this.currentSound.seek(clampedTime);
      this.updatePlaybackState({ currentTime: clampedTime });
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updatePlaybackState({ volume: clampedVolume });

    if (this.currentSound) {
      this.currentSound.volume(clampedVolume);
    }

    Howler.volume(clampedVolume);
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): PlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Get current track
   */
  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  /**
   * Skip forward by seconds
   */
  skipForward(seconds: number = 10): void {
    if (this.currentSound) {
      const currentTime = this.currentSound.seek() as number;
      this.seek(currentTime + seconds);
    }
  }

  /**
   * Skip backward by seconds
   */
  skipBackward(seconds: number = 10): void {
    if (this.currentSound) {
      const currentTime = this.currentSound.seek() as number;
      this.seek(currentTime - seconds);
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    if (this.currentSound) {
      this.currentSound.mute(!this.currentSound.mute());
    }
  }

  /**
   * Get formatted time string (MM:SS)
   */
  static formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Event handlers
  private handleLoad(): void {
    if (this.currentSound) {
      const duration = this.currentSound.duration();
      this.updatePlaybackState({
        duration,
        isLoading: false
      });

      this.events.onLoad?.();
    }
  }

  private handleLoadError(error: string): void {
    this.updatePlaybackState({
      isLoading: false,
      error
    });

    this.events.onLoadError?.(error);
  }

  private handlePlay(): void {
    this.updatePlaybackState({ isPlaying: true });
    this.startProgressTracking();
    this.events.onPlay?.();
  }

  private handlePause(): void {
    this.updatePlaybackState({ isPlaying: false });
    this.stopProgressTracking();
    this.events.onPause?.();
  }

  private handleStop(): void {
    this.updatePlaybackState({
      isPlaying: false,
      currentTime: 0
    });
    this.stopProgressTracking();
    this.events.onStop?.();
  }

  private handleEnd(): void {
    this.updatePlaybackState({
      isPlaying: false,
      currentTime: this.playbackState.duration
    });
    this.stopProgressTracking();
    this.events.onEnd?.();
  }

  private startProgressTracking(): void {
    if (this.progressInterval) return;

    this.progressInterval = setInterval(() => {
      if (this.currentSound && this.playbackState.isPlaying) {
        const currentTime = this.currentSound.seek() as number;
        const duration = this.playbackState.duration;

        this.updatePlaybackState({ currentTime });

        // Calculate progress percentage
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

        this.events.onProgress?.(progress);
        this.events.onTimeUpdate?.(currentTime, duration);
      }
    }, 100); // Update every 100ms for smooth progress
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private updatePlaybackState(updates: Partial<PlaybackState>): void {
    this.playbackState = { ...this.playbackState, ...updates };
  }

  /**
   * Cleanup when component unmounts
   */
  destroy(): void {
    this.stop();
    this.events = {};
    this.currentTrack = null;
  }
}

export default AudioPlayerManager;