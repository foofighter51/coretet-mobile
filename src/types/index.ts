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

export type TabId = 'band' | 'personal' | 'profile';

export type ScreenId = 'welcome' | 'phone' | 'verify' | 'onboarding' | 'bandAction' | 'main';

export interface TabItem {
  id: TabId;
  label: string;
  icon: any; // Will be properly typed when we move to component library
}