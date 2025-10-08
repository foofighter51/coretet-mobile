import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coretet.app',
  appName: 'CoreTet',
  webDir: 'dist',
  // NOTE: Commented out dev server for production testing
  // Uncomment for live reload during development:
  // server: {
  //   url: 'http://localhost:3000',
  //   cleartext: true
  // },
  // Deep linking configuration for app-only sharing
  plugins: {
    App: {
      // Handle deep links from shared playlists
      // Format: coretet://playlist/ABC123 or https://coretet.app/playlist/ABC123
      deepLinkingEnabled: true,
    },
  },
  // iOS-specific configuration
  ios: {
    // Custom URL scheme for direct app links
    scheme: 'coretet',
    // Use unique hostname to avoid conflicts with other Capacitor apps
    contentInset: 'automatic',
  },
  // Server configuration - use unique hostname
  server: {
    // Use app-specific hostname instead of generic 'localhost'
    // This prevents conflicts with other Capacitor apps
    hostname: 'coretet.local',
  },
  // Android-specific deep link configuration
  android: {
    // Custom URL scheme for direct app links
    scheme: 'coretet',
  },
};

export default config;
