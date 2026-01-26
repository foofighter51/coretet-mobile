/**
 * Vitest Setup File
 * Runs before all tests to configure the test environment
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.AudioContext for audio processing tests
global.AudioContext = class MockAudioContext {
  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: (channel: number) => new Float32Array(length),
    };
  }

  decodeAudioData(arrayBuffer: ArrayBuffer): Promise<any> {
    return Promise.resolve({
      numberOfChannels: 2,
      length: 44100,
      sampleRate: 44100,
      duration: 1,
      getChannelData: (channel: number) => new Float32Array(44100),
    });
  }
} as any;

// Mock window for browser-only APIs
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

// Suppress console warnings in tests (optional)
global.console = {
  ...console,
  warn: (...args: any[]) => {
    // Suppress known warnings
    const message = args[0]?.toString() || '';
    if (
      message.includes('Quota update failed') ||
      message.includes('Storage deletion failed')
    ) {
      return; // Expected warnings from non-blocking operations
    }
    console.warn(...args);
  },
};
