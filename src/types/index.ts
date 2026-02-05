export interface Band {
  id: string;
  title: string;
  memberCount: number;
  trackCount: number;
  lastActivity: string;
  image?: string;
}

export interface Track {
  id: string;
  title: string;
  duration: string;
  rating?: 'like' | 'love' | 'none';
  bandId?: string;
  isPlaying?: boolean;
  artist?: string;
  audioUrl?: string;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  profileImage?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  trackIds: string[];
  createdBy: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A Work represents a song/composition as a creative project.
 * It contains multiple tracks that are different versions/iterations
 * of the same underlying song (demos, acoustic, studio, live, etc.)
 */
export interface Work {
  id: string;
  name: string;
  band_id: string;
  created_by: string;
  hero_track_id?: string | null;
  created_at: string;
  updated_at?: string;
  /** Number of track versions in this work */
  version_count?: number;
}

export type TabId = 'library' | 'works' | 'playlists' | 'shared' | 'more';

export type ScreenId = 'welcome' | 'phone' | 'verify' | 'onboarding' | 'bandAction' | 'main';

export interface TabItem {
  id: TabId;
  label: string;
  icon: any; // Will be properly typed when we move to component library
}