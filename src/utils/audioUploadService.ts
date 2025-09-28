import { supabase, storage, db } from '../../lib/supabase';
import AudioProcessor, { AudioProcessingOptions, ProcessedAudio } from './audioProcessor';
import { v4 as uuidv4 } from 'uuid';

export interface UploadProgress {
  stage: 'processing' | 'uploading' | 'saving' | 'complete';
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface UploadOptions extends AudioProcessingOptions {
  ensembleId?: string;
  songId?: string;
  versionType?: 'voice_memo' | 'rough_demo' | 'rehearsal' | 'working_mix' | 'final' | 'live' | 'other';
  recordingDate?: Date;
  title?: string;
}

export interface UploadResult {
  versionId: string;
  fileUrl: string;
  metadata: any;
  compressionSavings: string;
}

export class AudioUploadService {
  private audioProcessor: AudioProcessor;
  private onProgress?: (progress: UploadProgress) => void;

  constructor(onProgress?: (progress: UploadProgress) => void) {
    this.audioProcessor = new AudioProcessor();
    this.onProgress = onProgress;
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

      // Step 2: Process audio (compression + normalization)
      this.updateProgress('processing', 20, 'Processing audio...');

      const processedAudio = await this.audioProcessor.processAudioFile(file, {
        targetVolume: 0.7, // Prevent audio whiplash with consistent 70% volume
        maxBitrate: 192, // Good quality, manageable file size
        normalizeAudio: true,
        ...options
      });

      this.updateProgress('processing', 60, 'Audio processing complete');

      // Step 3: Generate unique filename
      const fileExtension = 'mp3'; // Always MP3 after processing
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const uniqueId = uuidv4().split('-')[0]; // Short unique ID
      const filename = `${timestamp}_${options.title || 'untitled'}_${uniqueId}.${fileExtension}`
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename

      // Step 4: Upload to Supabase Storage
      this.updateProgress('uploading', 70, 'Uploading to cloud storage...');

      const filePath = `audio/${filename}`;
      const { data: uploadData, error: uploadError } = await storage.uploadAudio(
        new File([processedAudio.audioBuffer], filename, { type: 'audio/mpeg' }),
        filePath
      );

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      this.updateProgress('uploading', 85, 'Upload complete');

      // Step 5: Get public URL
      const publicUrl = storage.getPublicUrl(filePath);

      // Step 6: Save metadata to database
      this.updateProgress('saving', 90, 'Saving metadata...');

      const versionData = {
        title: options.title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        file_url: publicUrl,
        file_size: processedAudio.compressedSize,
        duration_seconds: Math.round(processedAudio.metadata.duration),
        version_type: options.versionType || 'other',
        song_id: options.songId || null,
        recording_date: options.recordingDate?.toISOString().split('T')[0] || null,
      };

      const { data: version, error: dbError } = await db.versions.create(versionData);

      if (dbError) {
        // Cleanup uploaded file if database save fails
        await storage.deleteFile(filePath);
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      // Step 7: Complete
      this.updateProgress('complete', 100, 'Upload successful!');

      const compressionSavings = AudioProcessor.formatFileSize(
        processedAudio.originalSize - processedAudio.compressedSize
      );

      return {
        versionId: version.id,
        fileUrl: publicUrl,
        metadata: processedAudio.metadata,
        compressionSavings
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
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        this.updateProgress(
          'processing',
          Math.round((i / total) * 100),
          `Processing ${i + 1} of ${total}: ${file.name}`
        );

        const result = await this.uploadAudio(file, {
          ...options,
          title: options.title || file.name.replace(/\.[^/.]+$/, '')
        });

        results.push(result);

      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    this.updateProgress('complete', 100, `Uploaded ${results.length} of ${total} files`);
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
  static async deleteAudio(versionId: string): Promise<void> {
    try {
      // Get version data to find file path
      const { data: version, error: fetchError } = await db.versions.getById(versionId);

      if (fetchError || !version) {
        throw new Error('Version not found');
      }

      // Extract file path from URL
      const url = new URL(version.file_url);
      const filePath = url.pathname.split('/').pop(); // Get filename from path

      if (filePath) {
        // Delete from storage
        await storage.deleteFile(`audio/${filePath}`);
      }

      // Delete from database (this should cascade to related records)
      const { error: deleteError } = await supabase
        .from('versions')
        .delete()
        .eq('id', versionId);

      if (deleteError) {
        throw new Error(`Failed to delete version: ${deleteError.message}`);
      }

    } catch (error) {
      console.error('Error deleting audio:', error);
      throw error;
    }
  }

  /**
   * Get upload statistics for a user or ensemble
   */
  static async getUploadStats(ensembleId?: string): Promise<{
    totalFiles: number;
    totalSize: string;
    totalDuration: string;
    compressionSavings: string;
  }> {
    try {
      let query = supabase
        .from('versions')
        .select('file_size, duration_seconds');

      if (ensembleId) {
        query = query.eq('songs.ensemble_id', ensembleId);
      }

      const { data: versions, error } = await query;

      if (error) {
        throw new Error(`Failed to get stats: ${error.message}`);
      }

      const totalFiles = versions?.length || 0;
      const totalSize = versions?.reduce((sum, v) => sum + (v.file_size || 0), 0) || 0;
      const totalDuration = versions?.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) || 0;

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