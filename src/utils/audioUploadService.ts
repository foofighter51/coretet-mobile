import { supabase, storage, db } from '../../lib/supabase';
import AudioProcessor, { AudioProcessingOptions, ProcessedAudio } from './audioProcessor';
import { ClerkSupabaseSync } from './clerkSupabaseSync';
import { v4 as uuidv4 } from 'uuid';

export interface UploadProgress {
  stage: 'processing' | 'uploading' | 'saving' | 'complete';
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface UploadOptions extends AudioProcessingOptions {
  title?: string;
}

export interface UploadResult {
  trackId: string;
  fileUrl: string;
  metadata: any;
  compressionSavings: string;
}

export class AudioUploadService {
  private audioProcessor: AudioProcessor;
  private onProgress?: (progress: UploadProgress) => void;
  private currentUser?: { id: string; email: string; phoneNumber: string; name: string };

  constructor(onProgress?: (progress: UploadProgress) => void, currentUser?: { id: string; email: string; phoneNumber: string; name: string }) {
    this.audioProcessor = new AudioProcessor();
    this.onProgress = onProgress;
    this.currentUser = currentUser;
  }

  /**
   * Upload and process an audio file
   */
  async uploadAudio(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // Step 1: Validate file
      this.updateProgress('processing', 0, 'Validating file...');

      const validation = AudioProcessor.validateAudioFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Skip audio processing for MVP - just use original file
      this.updateProgress('processing', 20, 'Preparing audio...');

      // Get basic metadata without processing
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

      const processedAudio = {
        audioBuffer: arrayBuffer,
        metadata: {
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          channels: audioBuffer.numberOfChannels,
          bitrate: 0,
          fileSize: file.size,
          rmsLevel: 0,
          peakLevel: 0,
          format: file.type.split('/')[1] || 'audio'
        },
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0
      };

      this.updateProgress('processing', 60, 'Preparation complete');

      // Step 3: Generate unique filename - keep original extension
      const originalExtension = file.name.split('.').pop() || 'mp3';
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const uniqueId = uuidv4().split('-')[0]; // Short unique ID
      const filename = `${timestamp}_${options.title || 'untitled'}_${uniqueId}.${originalExtension}`
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename

      // Step 4: Upload to Supabase Storage
      this.updateProgress('uploading', 70, 'Uploading to cloud storage...');

      const filePath = `audio/${filename}`;
      const { data: uploadData, error: uploadError } = await storage.uploadAudio(
        new File([processedAudio.audioBuffer], filename, { type: file.type }),
        filePath
      );

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      this.updateProgress('uploading', 85, 'Upload complete');

      // Step 5: Get signed URL for private bucket
      const signedUrl = await storage.getSignedUrl(filePath, 31536000); // 1 year expiry

      // Step 6: Save metadata to database
      this.updateProgress('saving', 90, 'Saving metadata...');

      // Use Clerk user ID directly (no UUID conversion needed)
      if (!this.currentUser) {
        throw new Error('User authentication required for upload');
      }

      // Extract folder path from webkitRelativePath if available
      const webkitFile = file as File & { webkitRelativePath?: string };
      let folderPath: string | undefined;

      if (webkitFile.webkitRelativePath) {
        // webkitRelativePath looks like: "FolderName/SubFolder/file.mp3"
        const pathParts = webkitFile.webkitRelativePath.split('/');
        // Remove the filename to get just the folder path
        if (pathParts.length > 1) {
          pathParts.pop(); // Remove filename
          folderPath = pathParts.join('/');
        }
      }

      const trackData = {
        title: options.title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        file_url: signedUrl || filePath,
        file_size: processedAudio.compressedSize,
        duration_seconds: Math.round(processedAudio.metadata.duration),
        created_by: this.currentUser.id, // Use Clerk user ID directly (TEXT)
        folder_path: folderPath,
      };

      const { data: track, error: dbError } = await db.tracks.create(trackData);

      if (dbError) {
        // Cleanup uploaded file if database save fails
        await storage.deleteFile(filePath);
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      // Step 7: Complete
      this.updateProgress('complete', 100, 'Upload successful!');

      return {
        trackId: track.id,
        fileUrl: signedUrl || filePath, // Use signed URL or fallback to path
        metadata: processedAudio.metadata,
        compressionSavings: '0 B' // No compression in MVP
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateProgress('processing', 0, 'Upload failed', errorMessage);
      throw error;
    }
  }

  /**
   * Upload multiple audio files
   */
  async uploadMultipleAudios(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: { file: string; error: string }[] = [];
    const total = files.length;

    console.log(`📤 Starting batch upload of ${total} files`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        this.updateProgress(
          'processing',
          Math.round((i / total) * 100),
          `Uploading ${i + 1} of ${total}: ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}`
        );

        console.log(`📤 Uploading file ${i + 1}/${total}: ${file.name}`);

        const result = await this.uploadAudio(file, {
          ...options,
          title: options.title || file.name.replace(/\.[^/.]+$/, '')
        });

        results.push(result);
        console.log(`✅ Successfully uploaded ${file.name}`);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to upload ${file.name}:`, errorMsg);
        errors.push({ file: file.name, error: errorMsg });

        // Update progress with error info
        this.updateProgress(
          'processing',
          Math.round((i / total) * 100),
          `Failed to upload ${file.name}: ${errorMsg}. Continuing...`
        );

        // Small delay to show error message
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Final summary
    const successCount = results.length;
    const failCount = errors.length;
    let message = `Upload complete: ${successCount}/${total} successful`;

    if (failCount > 0) {
      message += `, ${failCount} failed`;
      console.warn('❌ Failed uploads:', errors);
    }

    this.updateProgress(failCount > 0 ? 'processing' : 'complete', 100, message);

    return results;
  }

  /**
   * Get audio file from URL for playback
   */
  static async getAudioForPlayback(fileUrl: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error fetching audio for playback:', error);
      throw error;
    }
  }

  /**
   * Delete audio file and associated data
   */
  static async deleteAudio(trackId: string): Promise<void> {
    try {
      // Get track data to find file path
      const { data: track, error: fetchError } = await db.tracks.getById(trackId);

      if (fetchError || !track) {
        throw new Error('Track not found');
      }

      // Extract file path from URL
      const url = new URL(track.file_url);
      const filePath = url.pathname.split('/').pop(); // Get filename from path

      if (filePath) {
        // Delete from storage
        await storage.deleteFile(`audio/${filePath}`);
      }

      // Delete from database (this should cascade to related records)
      const { error: deleteError } = await db.tracks.delete(trackId);

      if (deleteError) {
        throw new Error(`Failed to delete track: ${deleteError.message}`);
      }

    } catch (error) {
      console.error('Error deleting audio:', error);
      throw error;
    }
  }

  /**
   * Get upload statistics for a user
   */
  static async getUploadStats(userId?: string): Promise<{
    totalFiles: number;
    totalSize: string;
    totalDuration: string;
    compressionSavings: string;
  }> {
    try {
      let query = supabase
        .from('tracks')
        .select('file_size, duration_seconds');

      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data: tracks, error } = await query;

      if (error) {
        throw new Error(`Failed to get stats: ${error.message}`);
      }

      const totalFiles = tracks?.length || 0;
      const totalSize = tracks?.reduce((sum, t) => sum + (t.file_size || 0), 0) || 0;
      const totalDuration = tracks?.reduce((sum, t) => sum + (t.duration_seconds || 0), 0) || 0;

      // Estimate compression savings (assuming 30% average compression)
      const estimatedOriginalSize = totalSize / 0.7;
      const compressionSavings = estimatedOriginalSize - totalSize;

      return {
        totalFiles,
        totalSize: AudioProcessor.formatFileSize(totalSize),
        totalDuration: AudioProcessor.formatDuration(totalDuration),
        compressionSavings: AudioProcessor.formatFileSize(compressionSavings)
      };

    } catch (error) {
      console.error('Error getting upload stats:', error);
      throw error;
    }
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    stage: UploadProgress['stage'],
    progress: number,
    message: string,
    error?: string
  ): void {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message, error });
    }
  }
}

export default AudioUploadService;