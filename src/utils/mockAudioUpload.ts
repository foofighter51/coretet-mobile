import AudioProcessor, { AudioProcessingOptions, ProcessedAudio } from './audioProcessor';
import { v4 as uuidv4 } from 'uuid';

export interface MockUploadResult {
  trackId: string;
  fileUrl: string;
  metadata: any;
  compressionSavings: string;
}

export interface MockUploadProgress {
  stage: 'processing' | 'uploading' | 'saving' | 'complete';
  progress: number;
  message: string;
  error?: string;
}

/**
 * Mock audio upload service for development when Supabase isn't configured
 */
export class MockAudioUploadService {
  private audioProcessor: AudioProcessor;
  private onProgress?: (progress: MockUploadProgress) => void;

  constructor(onProgress?: (progress: MockUploadProgress) => void) {
    this.audioProcessor = new AudioProcessor();
    this.onProgress = onProgress;
  }

  async uploadAudio(file: File, options: AudioProcessingOptions = {}): Promise<MockUploadResult> {
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
        targetVolume: 0.7,
        maxBitrate: 192,
        normalizeAudio: true,
        ...options
      });

      this.updateProgress('processing', 60, 'Audio processing complete');

      // Step 3: Mock upload simulation
      this.updateProgress('uploading', 70, 'Uploading to cloud storage...');

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.updateProgress('uploading', 85, 'Upload complete');

      // Step 4: Mock saving metadata
      this.updateProgress('saving', 90, 'Saving metadata...');

      // Simulate database save delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Generate mock result
      this.updateProgress('complete', 100, 'Upload successful!');

      const compressionSavings = AudioProcessor.formatFileSize(
        processedAudio.originalSize - processedAudio.compressedSize
      );

      const mockResult: MockUploadResult = {
        trackId: uuidv4(),
        fileUrl: `mock://processed-audio/${file.name}`,
        metadata: processedAudio.metadata,
        compressionSavings
      };

      // Log the result for debugging
      console.log('🎵 Mock Upload Complete:', {
        originalSize: AudioProcessor.formatFileSize(processedAudio.originalSize),
        compressedSize: AudioProcessor.formatFileSize(processedAudio.compressedSize),
        compressionRatio: `${processedAudio.compressionRatio.toFixed(1)}%`,
        duration: AudioProcessor.formatDuration(processedAudio.metadata.duration),
        normalizedVolume: '70%',
        result: mockResult
      });

      return mockResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateProgress('processing', 0, 'Upload failed', errorMessage);
      throw error;
    }
  }

  async uploadMultipleAudios(files: File[], options: AudioProcessingOptions = {}): Promise<MockUploadResult[]> {
    const results: MockUploadResult[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        this.updateProgress(
          'processing',
          Math.round((i / total) * 100),
          `Processing ${i + 1} of ${total}: ${file.name}`
        );

        const result = await this.uploadAudio(file, options);
        results.push(result);

      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    this.updateProgress('complete', 100, `Uploaded ${results.length} of ${total} files`);
    return results;
  }

  private updateProgress(
    stage: MockUploadProgress['stage'],
    progress: number,
    message: string,
    error?: string
  ): void {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message, error });
    }
  }
}

export default MockAudioUploadService;