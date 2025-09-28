import { v4 as uuidv4 } from 'uuid';

// Audio file validation
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/flac',
  'audio/ogg',
  'audio/webm',
];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_DURATION = 30 * 60; // 30 minutes in seconds

export interface AudioMetadata {
  duration: number;
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  metadata?: AudioMetadata;
}

// Validate audio file
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed types: ${ALLOWED_AUDIO_TYPES.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

// Extract audio metadata using Web Audio API
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      const metadata: AudioMetadata = {
        duration: audio.duration,
      };

      // Clean up
      URL.revokeObjectURL(url);
      resolve(metadata);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    });

    audio.src = url;
  });
}

// Generate unique file path
export function generateFilePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const uuid = uuidv4();
  const extension = filename.split('.').pop()?.toLowerCase() || 'mp3';

  return `audio/${userId}/${timestamp}-${uuid}.${extension}`;
}

// Upload to Backblaze B2 (S3-compatible API)
export async function uploadToB2(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // This would typically use a presigned URL from your backend
  // For now, we'll simulate the upload process

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.url,
            key: path,
            size: file.size,
          });
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    // In a real implementation, you'd get presigned URL from your backend
    // xhr.open('PUT', presignedUrl);
    // xhr.setRequestHeader('Content-Type', file.type);
    // xhr.send(file);

    // For demo purposes, simulate upload
    setTimeout(() => {
      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 });
      }
      resolve({
        url: `https://demo-bucket.s3.us-west-002.backblazeb2.com/${path}`,
        key: path,
        size: file.size,
      });
    }, 2000);
  });
}

// Hook for audio upload
export function useAudioUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<UploadProgress | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const uploadAudio = async (
    file: File,
    userId: string,
    metadata?: Partial<{
      title: string;
      versionType: string;
      songId: string;
    }>
  ): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      // Validate file
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Extract metadata
      const audioMetadata = await extractAudioMetadata(file);

      // Check duration
      if (audioMetadata.duration > MAX_DURATION) {
        throw new Error(`Audio too long. Maximum duration is ${MAX_DURATION / 60} minutes`);
      }

      // Generate path
      const path = generateFilePath(userId, file.name);

      // Upload to B2
      const result = await uploadToB2(file, path, setProgress);

      // Save to database
      const { data, error: dbError } = await supabase
        .from('versions')
        .insert({
          title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
          file_url: result.url,
          file_size: result.size,
          duration_seconds: Math.round(audioMetadata.duration),
          version_type: metadata?.versionType || 'other',
          song_id: metadata?.songId,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setUploading(false);
      return { ...result, metadata: audioMetadata };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setUploading(false);
      return null;
    }
  };

  const cancelUpload = () => {
    // In a real implementation, you'd cancel the XHR request
    setUploading(false);
    setProgress(null);
    setError(null);
  };

  return {
    uploadAudio,
    uploading,
    progress,
    error,
    cancelUpload,
  };
}

// Utility to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility to format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Audio player utilities
export class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private onTimeUpdate?: (currentTime: number) => void;
  private onEnded?: () => void;
  private onError?: (error: Error) => void;

  constructor() {
    // Initialize audio element
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.audio!.currentTime);
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.onEnded) {
        this.onEnded();
      }
    });

    this.audio.addEventListener('error', () => {
      if (this.onError) {
        this.onError(new Error('Audio playback error'));
      }
    });
  }

  async loadTrack(url: string): Promise<void> {
    if (!this.audio) throw new Error('Audio not available');

    return new Promise((resolve, reject) => {
      this.audio!.addEventListener('loadeddata', () => resolve(), { once: true });
      this.audio!.addEventListener('error', () => reject(new Error('Failed to load audio')), { once: true });
      this.audio!.src = url;
    });
  }

  play(): Promise<void> {
    if (!this.audio) throw new Error('Audio not available');
    return this.audio.play();
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  seek(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  get currentTime(): number {
    return this.audio?.currentTime || 0;
  }

  get duration(): number {
    return this.audio?.duration || 0;
  }

  get paused(): boolean {
    return this.audio?.paused ?? true;
  }

  setCallbacks(callbacks: {
    onTimeUpdate?: (currentTime: number) => void;
    onEnded?: () => void;
    onError?: (error: Error) => void;
  }) {
    this.onTimeUpdate = callbacks.onTimeUpdate;
    this.onEnded = callbacks.onEnded;
    this.onError = callbacks.onError;
  }

  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}