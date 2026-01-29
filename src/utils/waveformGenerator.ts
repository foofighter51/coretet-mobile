/**
 * Waveform Generator Utility
 *
 * Generates waveform visualization data from audio files using Web Audio API.
 * The generated data can be cached in the database for faster subsequent loads.
 */

export interface WaveformData {
  /** Normalized amplitude values (0-1) */
  amplitudes: number[];
  /** Number of samples in the amplitudes array */
  sampleCount: number;
  /** Duration of the audio in seconds */
  duration: number;
}

export interface WaveformGeneratorOptions {
  /** Number of samples to generate (default: 200) */
  samples?: number;
  /** Channel to analyze (0 = left, 1 = right for stereo; default: 0) */
  channel?: number;
}

/**
 * Generates waveform data from an audio URL
 *
 * @param audioUrl - URL of the audio file to analyze
 * @param options - Generation options
 * @returns Promise resolving to WaveformData
 *
 * @example
 * ```ts
 * const waveform = await generateWaveform('https://example.com/track.mp3');
 * console.log(waveform.amplitudes); // [0.1, 0.3, 0.8, ...]
 * console.log(waveform.duration); // 180.5 (seconds)
 * ```
 */
export async function generateWaveform(
  audioUrl: string,
  options: WaveformGeneratorOptions = {}
): Promise<WaveformData> {
  const { samples = 200, channel = 0 } = options;

  // Create audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    // Fetch the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get channel data (use left channel by default, fallback if mono)
    const channelIndex = Math.min(channel, audioBuffer.numberOfChannels - 1);
    const channelData = audioBuffer.getChannelData(channelIndex);

    // Calculate block size for downsampling
    const blockSize = Math.floor(channelData.length / samples);
    const amplitudes: number[] = [];

    // Extract peak amplitudes for each block
    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);

      // Find peak amplitude in this block (using RMS for smoother visualization)
      let sumSquares = 0;
      for (let j = start; j < end; j++) {
        sumSquares += channelData[j] * channelData[j];
      }
      const rms = Math.sqrt(sumSquares / (end - start));
      amplitudes.push(rms);
    }

    // Normalize amplitudes to 0-1 range
    const maxAmplitude = Math.max(...amplitudes);
    const normalizedAmplitudes = maxAmplitude > 0
      ? amplitudes.map(a => a / maxAmplitude)
      : amplitudes;

    return {
      amplitudes: normalizedAmplitudes,
      sampleCount: samples,
      duration: audioBuffer.duration,
    };
  } finally {
    // Clean up audio context
    await audioContext.close();
  }
}

/**
 * Generates waveform data with peak detection (shows both positive and negative peaks)
 * This provides a more traditional "mirrored" waveform visualization
 */
export async function generateMirroredWaveform(
  audioUrl: string,
  options: WaveformGeneratorOptions = {}
): Promise<{ peaks: number[]; troughs: number[]; sampleCount: number; duration: number }> {
  const { samples = 200, channel = 0 } = options;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const channelIndex = Math.min(channel, audioBuffer.numberOfChannels - 1);
    const channelData = audioBuffer.getChannelData(channelIndex);
    const blockSize = Math.floor(channelData.length / samples);

    const peaks: number[] = [];
    const troughs: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);

      let maxPeak = 0;
      let minTrough = 0;

      for (let j = start; j < end; j++) {
        const value = channelData[j];
        if (value > maxPeak) maxPeak = value;
        if (value < minTrough) minTrough = value;
      }

      peaks.push(maxPeak);
      troughs.push(Math.abs(minTrough));
    }

    // Normalize
    const maxValue = Math.max(...peaks, ...troughs);
    const normalizedPeaks = maxValue > 0 ? peaks.map(p => p / maxValue) : peaks;
    const normalizedTroughs = maxValue > 0 ? troughs.map(t => t / maxValue) : troughs;

    return {
      peaks: normalizedPeaks,
      troughs: normalizedTroughs,
      sampleCount: samples,
      duration: audioBuffer.duration,
    };
  } finally {
    await audioContext.close();
  }
}

/**
 * Converts a timestamp in seconds to a position (0-1) within the waveform
 */
export function timestampToPosition(timestamp: number, duration: number): number {
  if (duration <= 0) return 0;
  return Math.max(0, Math.min(1, timestamp / duration));
}

/**
 * Converts a position (0-1) within the waveform to a timestamp in seconds
 */
export function positionToTimestamp(position: number, duration: number): number {
  return Math.max(0, Math.min(duration, position * duration));
}

/**
 * Formats a timestamp in seconds to MM:SS or HH:MM:SS format
 */
export function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses a timestamp string (MM:SS or HH:MM:SS) to seconds
 */
export function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
