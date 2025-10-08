import * as lamejs from 'lamejs';

export interface AudioProcessingOptions {
  targetVolume?: number; // Target RMS volume level (0-1)
  maxBitrate?: number; // Maximum bitrate for compression (kbps)
  sampleRate?: number; // Target sample rate (Hz)
  normalizeAudio?: boolean; // Whether to apply normalization
  fadeInDuration?: number; // Fade-in duration in seconds
  fadeOutDuration?: number; // Fade-out duration in seconds
}

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate: number;
  fileSize: number;
  rmsLevel: number; // Root Mean Square level for volume normalization
  peakLevel: number; // Peak level
  format: string;
}

export interface ProcessedAudio {
  audioBuffer: ArrayBuffer;
  metadata: AudioMetadata;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export class AudioProcessor {
  private audioContext: AudioContext;

  constructor() {
    // Initialize AudioContext with optimal settings for music
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 44100, // Standard CD quality
      latencyHint: 'balanced'
    });
  }

  /**
   * Process an audio file with compression and normalization
   */
  async processAudioFile(
    file: File,
    options: AudioProcessingOptions = {}
  ): Promise<ProcessedAudio> {
    const defaultOptions: AudioProcessingOptions = {
      targetVolume: 0.7, // 70% target volume for preventing audio whiplash
      maxBitrate: 192, // Good balance of quality and file size
      sampleRate: 44100,
      normalizeAudio: true,
      fadeInDuration: 0, // No fade by default
      fadeOutDuration: 0
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      // Read the original file
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const originalSize = arrayBuffer.byteLength;

      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));

      // Extract metadata from original file
      const originalMetadata = this.extractMetadata(audioBuffer, originalSize);

      // Process the audio (normalize, compress, etc.)
      let processedBuffer = audioBuffer;

      if (finalOptions.normalizeAudio) {
        processedBuffer = this.normalizeAudio(processedBuffer, finalOptions.targetVolume!);
      }

      // Apply fade effects if specified
      if (finalOptions.fadeInDuration! > 0 || finalOptions.fadeOutDuration! > 0) {
        processedBuffer = this.applyFades(processedBuffer, finalOptions);
      }

      // Compress audio to MP3
      const compressedBuffer = await this.compressToMp3(
        processedBuffer,
        finalOptions.maxBitrate!
      );

      // Calculate compression metrics
      const compressedSize = compressedBuffer.byteLength;
      const compressionRatio = (1 - compressedSize / originalSize) * 100;

      // Extract final metadata
      const finalMetadata = {
        ...originalMetadata,
        fileSize: compressedSize,
        bitrate: finalOptions.maxBitrate!,
        format: 'mp3'
      };

      return {
        audioBuffer: compressedBuffer,
        metadata: finalMetadata,
        originalSize,
        compressedSize,
        compressionRatio
      };

    } catch (error) {
      console.error('Audio processing failed:', error);
      throw new Error(`Audio processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Normalize audio to prevent volume inconsistencies ("audio whiplash")
   */
  private normalizeAudio(audioBuffer: AudioBuffer, targetVolume: number): AudioBuffer {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;

    // Create a new buffer for the normalized audio
    const normalizedBuffer = this.audioContext.createBuffer(numberOfChannels, length, sampleRate);

    // Process each channel
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = normalizedBuffer.getChannelData(channel);

      // Calculate RMS (Root Mean Square) for better volume detection
      let rmsSum = 0;
      for (let i = 0; i < length; i++) {
        rmsSum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(rmsSum / length);

      // Calculate peak level
      let peak = 0;
      for (let i = 0; i < length; i++) {
        const abs = Math.abs(inputData[i]);
        if (abs > peak) peak = abs;
      }

      // Use RMS for normalization but limit by peak to prevent clipping
      const rmsMultiplier = targetVolume / (rms || 0.001);
      const peakMultiplier = 0.95 / (peak || 0.001); // Leave 5% headroom
      const finalMultiplier = Math.min(rmsMultiplier, peakMultiplier);

      // Apply normalization
      for (let i = 0; i < length; i++) {
        outputData[i] = inputData[i] * finalMultiplier;
      }
    }

    return normalizedBuffer;
  }

  /**
   * Apply fade-in and fade-out effects
   */
  private applyFades(audioBuffer: AudioBuffer, options: AudioProcessingOptions): AudioBuffer {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;

    const fadedBuffer = this.audioContext.createBuffer(numberOfChannels, length, sampleRate);

    const fadeInSamples = Math.floor((options.fadeInDuration || 0) * sampleRate);
    const fadeOutSamples = Math.floor((options.fadeOutDuration || 0) * sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = fadedBuffer.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        let gain = 1;

        // Apply fade-in
        if (i < fadeInSamples) {
          gain *= i / fadeInSamples;
        }

        // Apply fade-out
        if (i >= length - fadeOutSamples) {
          gain *= (length - i) / fadeOutSamples;
        }

        outputData[i] = inputData[i] * gain;
      }
    }

    return fadedBuffer;
  }

  /**
   * Compress audio buffer to MP3 format
   */
  private async compressToMp3(audioBuffer: AudioBuffer, bitrate: number): Promise<ArrayBuffer> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Initialize MP3 encoder
    const mp3Encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, bitrate);

    // Convert float audio data to 16-bit PCM
    const leftChannel = this.floatTo16BitPCM(audioBuffer.getChannelData(0));
    const rightChannel = numberOfChannels > 1
      ? this.floatTo16BitPCM(audioBuffer.getChannelData(1))
      : leftChannel;

    // Encode to MP3
    const mp3Data: Uint8Array[] = [];
    const blockSize = 1152; // MP3 frame size

    for (let i = 0; i < length; i += blockSize) {
      const leftBlock = leftChannel.subarray(i, i + blockSize);
      const rightBlock = rightChannel.subarray(i, i + blockSize);

      const mp3Block = mp3Encoder.encodeBuffer(leftBlock, rightBlock);
      if (mp3Block.length > 0) {
        mp3Data.push(mp3Block);
      }
    }

    // Finalize encoding
    const finalBlock = mp3Encoder.flush();
    if (finalBlock.length > 0) {
      mp3Data.push(finalBlock);
    }

    // Combine all MP3 data into single ArrayBuffer
    const totalLength = mp3Data.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of mp3Data) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result.buffer;
  }

  /**
   * Convert Float32Array to 16-bit PCM
   */
  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return output;
  }

  /**
   * Extract metadata from audio buffer
   */
  private extractMetadata(audioBuffer: AudioBuffer, fileSize: number): AudioMetadata {
    const duration = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;

    // Calculate RMS and peak levels
    let rmsSum = 0;
    let peak = 0;

    for (let channel = 0; channel < channels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const sample = Math.abs(channelData[i]);
        rmsSum += sample * sample;
        if (sample > peak) peak = sample;
      }
    }

    const rmsLevel = Math.sqrt(rmsSum / (length * channels));
    const bitrate = Math.round((fileSize * 8) / duration / 1000); // kbps

    return {
      duration,
      sampleRate,
      channels,
      bitrate,
      fileSize,
      rmsLevel,
      peakLevel: peak,
      format: 'original'
    };
  }

  /**
   * Convert File to ArrayBuffer
   */
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate audio file format and size
   */
  static validateAudioFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB limit
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
      'audio/aac', 'audio/m4a', 'audio/x-m4a', 'audio/flac', 'audio/ogg',
      'audio/mp4' // Some browsers report m4a as audio/mp4
    ];
    const allowedExtensions = ['.mp3', '.wav', '.aac', '.m4a', '.flac', '.ogg'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 100MB' };
    }

    // Check both MIME type and file extension for better compatibility
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = allowedTypes.includes(file.type);

    if (!hasValidType && !hasValidExtension) {
      return { valid: false, error: 'Unsupported audio format. Please use MP3, WAV, AAC, M4A, FLAC, or OGG.' };
    }

    return { valid: true };
  }

  /**
   * Get human-readable file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration in MM:SS format
   */
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export default AudioProcessor;