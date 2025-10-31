import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export type DeepLinkHandler = (path: string, params: Record<string, string>) => void;

/**
 * Deep link handler for app-only sharing
 *
 * Supported formats:
 * - coretet://playlist/ABC123
 * - https://coretet.app/playlist/ABC123
 *
 * This ensures shared links only work within the app, not in browsers
 */
export class DeepLinkService {
  private static listeners: DeepLinkHandler[] = [];
  private static isInitialized = false;

  /**
   * Initialize deep link handling
   */
  static initialize() {
    if (this.isInitialized) return;

    // Only set up deep linking on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Listen for app URL open events
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.handleDeepLink(event.url);
    });

    this.isInitialized = true;
  }

  /**
   * Add a listener for deep links
   */
  static addListener(handler: DeepLinkHandler) {
    this.listeners.push(handler);
  }

  /**
   * Remove a listener
   */
  static removeListener(handler: DeepLinkHandler) {
    this.listeners = this.listeners.filter(h => h !== handler);
  }

  /**
   * Handle incoming deep link
   */
  private static handleDeepLink(url: string) {

    // Ignore file:// URLs - these are drag-and-drop file uploads, not navigation links
    if (url.startsWith('file://')) {
      return;
    }

    try {
      const parsedUrl = new URL(url);

      // Extract path and params
      let path = parsedUrl.pathname;

      // Handle custom scheme (coretet://playlist/ABC123)
      // For custom schemes, host becomes the first path segment
      if (url.startsWith('coretet://')) {
        const host = parsedUrl.host || parsedUrl.hostname;
        if (host) {
          path = `/${host}${path}`;
        }
      }

      const params: Record<string, string> = {};
      parsedUrl.searchParams.forEach((value, key) => {
        params[key] = value;
      });


      // Notify all listeners
      this.listeners.forEach((handler, index) => {
        handler(path, params);
      });

    } catch (error) {
      console.error('❌ Failed to parse deep link:', error);
      console.error('❌ URL was:', url);
    }
  }

  /**
   * Create a shareable deep link
   *
   * @param path - Path to share (e.g., '/playlist/ABC123')
   * @returns Deep link URL (e.g., 'coretet://playlist/ABC123')
   */
  static createShareLink(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Use custom URL scheme for app-only links
    return `coretet://${cleanPath}`;
  }

  /**
   * Check if a URL is a deep link to this app
   */
  static isDeepLink(url: string): boolean {
    return url.startsWith('coretet://') || url.startsWith('https://coretet.app/');
  }

  /**
   * Get the current app launch URL (if app was opened from a deep link)
   */
  static async getLaunchUrl(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) return null;

    try {
      const result = await App.getLaunchUrl();
      return result?.url || null;
    } catch (error) {
      console.error('Failed to get launch URL:', error);
      return null;
    }
  }
}

export default DeepLinkService;
