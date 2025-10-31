import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface PickedFile {
  name: string;
  blob: Blob;
  size: number;
  type: string;
  webkitRelativePath?: string;
}

/**
 * Native file picker service that works on web and mobile
 * On iOS: Opens native document picker with access to Files app (Google Drive, Dropbox, iCloud, etc.)
 * On Web: Falls back to standard HTML file input
 */
export class NativeFilePicker {
  /**
   * Pick audio files from device or cloud storage
   */
  static async pickAudioFiles(options: {
    multiple?: boolean;
  } = {}): Promise<PickedFile[]> {
    const { multiple = false } = options;

    // Check if running on native platform
    if (Capacitor.isNativePlatform()) {
      return this.pickNativeFiles(multiple);
    } else {
      return this.pickWebFiles(multiple);
    }
  }

  /**
   * Native file picker for iOS/Android
   * Uses native document picker which includes cloud storage
   */
  private static async pickNativeFiles(multiple: boolean): Promise<PickedFile[]> {
    try {
      // For iOS, we need to use the FilePicker plugin or custom native code
      // For MVP, we'll use a simpler approach with direct file input that Capacitor can handle

      // Import dynamically to avoid issues on web
      const { FilePicker } = await import('@capawesome/capacitor-file-picker');


      const result = await FilePicker.pickFiles({
        multiple: multiple,
        readData: true, // Read file content
      });


      // Convert picked files to our format
      const pickedFiles: PickedFile[] = [];

      for (const file of result.files) {
        // file.data contains base64 encoded content
        const base64Data = file.data;
        const blob = this.base64ToBlob(base64Data!, file.mimeType || 'audio/mpeg');

        pickedFiles.push({
          name: file.name!,
          blob: blob,
          size: file.size!,
          type: file.mimeType || 'audio/mpeg',
        });
      }

      return pickedFiles;
    } catch (error) {
      console.error('Native file picker error:', error);
      // Fallback to web picker if native fails
      throw error; // Re-throw to let caller handle it
    }
  }

  /**
   * Web file picker using HTML input
   */
  private static pickWebFiles(multiple: boolean): Promise<PickedFile[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.multiple = multiple;

      // Enable directory selection for web to preserve folder structure
      if (multiple) {
        (input as any).webkitdirectory = false; // Keep false for file selection
      }

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          resolve([]);
          return;
        }

        const pickedFiles: PickedFile[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          pickedFiles.push({
            name: file.name,
            blob: file,
            size: file.size,
            type: file.type,
            webkitRelativePath: (file as any).webkitRelativePath,
          });
        }

        resolve(pickedFiles);
      };

      input.onerror = () => {
        reject(new Error('File selection cancelled or failed'));
      };

      input.click();
    });
  }

  /**
   * Convert base64 to Blob
   */
  private static base64ToBlob(base64: string, mimeType: string): Blob {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Check if file picker is available
   */
  static isAvailable(): boolean {
    return Capacitor.isNativePlatform() || typeof document !== 'undefined';
  }

  /**
   * Get platform info for debugging
   */
  static getPlatformInfo(): {
    platform: string;
    isNative: boolean;
    supportsCloudPicker: boolean;
  } {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();

    return {
      platform,
      isNative,
      supportsCloudPicker: isNative, // Native platforms support cloud storage through Files app
    };
  }
}

export default NativeFilePicker;
