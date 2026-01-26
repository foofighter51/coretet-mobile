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
  bandId?: string;
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

      // Step 3: Check storage quota before upload
      this.updateProgress('processing', 65, 'Checking storage quota...');

      const { data: profile, error: profileError } = await db.profiles.getById(
        this.currentUser.id
      );

      if (profileError || !profile) {
        throw new Error('Failed to check storage quota. Please try again.');
      }

      const currentUsage = profile.storage_used || 0;
      const quotaLimit = profile.storage_limit || 1073741824; // Default 1GB
      const newTotal = currentUsage + file.size;

      if (newTotal > quotaLimit) {
        const usageFormatted = AudioProcessor.formatFileSize(currentUsage);
        const limitFormatted = AudioProcessor.formatFileSize(quotaLimit);
        const fileFormatted = AudioProcessor.formatFileSize(file.size);

        throw new Error(
          `Storage quota exceeded.\n\n` +
          `Current usage: ${usageFormatted} of ${limitFormatted}\n` +
          `This file: ${fileFormatted}\n` +
          `Would total: ${AudioProcessor.formatFileSize(newTotal)}\n\n` +
          `Delete some files or upgrade your plan for more storage.`
        );
      }

      this.updateProgress('processing', 68, 'Quota check passed');

      // Step 4: Generate unique filename - keep original extension
      const originalExtension = file.name.split('.').pop() || 'mp3';
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const uniqueId = uuidv4().split('-')[0]; // Short unique ID
      const filename = `${timestamp}_${options.title || 'untitled'}_${uniqueId}.${originalExtension}`
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename

      // Step 4: Upload to Supabase Storage
      this.updateProgress('uploading', 70, 'Uploading to cloud storage...');

      // Use userId subfolder structure for organization
      const filePath = `${this.currentUser.id}/${filename}`;
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
        band_id: options.bandId,
      };

      const { data: track, error: dbError } = await db.tracks.create(trackData);

      if (dbError) {
        // Cleanup uploaded file if database save fails
        await storage.deleteFile(filePath);
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      // Step 7: Increment storage quota
      this.updateProgress('saving', 95, 'Updating storage quota...');

      const { error: quotaError } = await supabase
        .from('profiles')
        .update({
          storage_used: supabase.raw(`COALESCE(storage_used, 0) + ${processedAudio.compressedSize}`)
        })
        .eq('id', this.currentUser.id);

      if (quotaError) {
        console.error('⚠️ Quota update failed:', quotaError);
        // Don't throw - upload succeeded, quota will be corrected by sync job
      }

      // Step 8: Complete
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
   * Returns successful uploads and failed uploads separately
   */
  async uploadMultipleAudios(
    files: File[],
    options: UploadOptions = {}
  ): Promise<{
    successful: UploadResult[];
    failed: Array<{ filename: string; error: string; size: number }>;
  }> {
    const results: UploadResult[] = [];
    const failures: Array<{ filename: string; error: string; size: number }> = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        this.updateProgress(
          'processing',
          Math.round((i / total) * 100),
          `Uploading ${i + 1} of ${total}: ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}`
        );

        const result = await this.uploadAudio(file, {
          ...options,
          title: options.title || file.name.replace(/\.[^/.]+$/, '')
        });

        results.push(result);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to upload ${file.name}:`, errorMsg);

        // Add to failures array
        failures.push({
          filename: file.name,
          error: errorMsg,
          size: file.size
        });

        // Update progress with error info
        this.updateProgress(
          'processing',
          Math.round((i / total) * 100),
          `Failed: ${file.name.substring(0, 20)}... - ${errorMsg.substring(0, 50)}`
        );

        // Brief delay to show error message
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Final summary
    const successCount = results.length;
    const failCount = failures.length;
    let message = `Complete: ${successCount}/${total} uploaded`;

    if (failCount > 0) {
      message += `, ${failCount} failed`;
      console.warn('❌ Failed uploads:', failures);
    }

    this.updateProgress(
      failCount > 0 ? 'processing' : 'complete',
      100,
      message
    );

    // Return both successful and failed uploads
    return { successful: results, failed: failures };
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
   * Also decrements storage quota
   */
  static async deleteAudio(trackId: string): Promise<void> {
    try {
      // Step 1: Get track data
      const { data: track, error: fetchError } = await db.tracks.getById(trackId);

      if (fetchError || !track) {
        throw new Error(`Track not found: ${trackId}`);
      }

      // Step 2: Extract correct file path from signed URL
      // Signed URL format: https://.../storage/v1/object/sign/audio-files/USER_ID/FILENAME.mp3?token=...
      // We need: "USER_ID/FILENAME.mp3"

      const url = new URL(track.file_url);
      let filePath: string | null = null;

      // Try to extract path from signed URL
      const signedPathMatch = url.pathname.match(/\/object\/sign\/audio-files\/(.+)/);
      if (signedPathMatch) {
        filePath = signedPathMatch[1].split('?')[0]; // Remove query params
      } else {
        // Fallback: Try to extract from public URL format
        const publicPathMatch = url.pathname.match(/\/audio-files\/(.+)/);
        if (publicPathMatch) {
          filePath = publicPathMatch[1];
        }
      }

      if (!filePath) {
        console.error('❌ Could not extract file path from URL:', track.file_url);
        // Continue to delete DB record even if storage path is unclear
      }

      // Step 3: Delete from storage (if we have a valid path)
      if (filePath) {
        const { error: storageError } = await storage.deleteFile(filePath);

        if (storageError) {
          console.error('⚠️ Storage deletion failed (file may not exist):', storageError);
          // Don't throw - continue to delete DB record
        } else {
          console.log(`✅ Deleted file from storage: ${filePath}`);
        }
      }

      // Step 4: Delete from database (cascades to versions, comments, ratings, etc.)
      const { error: dbError } = await db.tracks.delete(trackId);

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }

      // Step 5: Decrement storage quota
      const fileSize = track.file_size || 0;

      if (fileSize > 0) {
        const { error: quotaError } = await supabase
          .from('profiles')
          .update({
            storage_used: supabase.raw(`GREATEST(COALESCE(storage_used, 0) - ${fileSize}, 0)`)
          })
          .eq('id', track.created_by);

        if (quotaError) {
          console.error('⚠️ Quota decrement failed:', quotaError);
          // Don't throw - deletion succeeded, quota will be corrected by sync job
        } else {
          console.log(`✅ Decremented storage quota by ${AudioProcessor.formatFileSize(fileSize)}`);
        }
      }

      console.log(`✅ Successfully deleted track ${trackId}`);

    } catch (error) {
      console.error('❌ Error deleting audio:', error);
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