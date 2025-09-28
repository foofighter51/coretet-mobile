export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          phone_number: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          phone_number: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone_number?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      versions: {
        Row: {
          id: string
          song_id: string | null
          title: string
          file_url: string
          file_size: number | null
          duration_seconds: number | null
          version_type: 'voice_memo' | 'rough_demo' | 'rehearsal' | 'working_mix' | 'final' | 'live' | 'other'
          uploaded_by: string
          recording_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id?: string | null
          title: string
          file_url: string
          file_size?: number | null
          duration_seconds?: number | null
          version_type?: 'voice_memo' | 'rough_demo' | 'rehearsal' | 'working_mix' | 'final' | 'live' | 'other'
          uploaded_by: string
          recording_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string | null
          title?: string
          file_url?: string
          file_size?: number | null
          duration_seconds?: number | null
          version_type?: 'voice_memo' | 'rough_demo' | 'rehearsal' | 'working_mix' | 'final' | 'live' | 'other'
          uploaded_by?: string
          recording_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ensembles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          invite_code: string
          authorized_phone_1: string | null
          authorized_phone_2: string | null
          authorized_phone_3: string | null
          authorized_phone_4: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          invite_code?: string
          authorized_phone_1?: string | null
          authorized_phone_2?: string | null
          authorized_phone_3?: string | null
          authorized_phone_4?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          invite_code?: string
          authorized_phone_1?: string | null
          authorized_phone_2?: string | null
          authorized_phone_3?: string | null
          authorized_phone_4?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ensemble_members: {
        Row: {
          id: string
          ensemble_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          ensemble_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          ensemble_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          title: string
          description: string | null
          ensemble_id: string | null
          created_by: string
          is_public: boolean
          share_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          ensemble_id?: string | null
          created_by: string
          is_public?: boolean
          share_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          ensemble_id?: string | null
          created_by?: string
          is_public?: boolean
          share_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      playlist_items: {
        Row: {
          id: string
          playlist_id: string
          version_id: string
          position: number
          added_by: string
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          version_id: string
          position: number
          added_by: string
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          version_id?: string
          position?: number
          added_by?: string
          added_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          version_id: string
          user_id: string
          playlist_id: string | null
          rating: 'listened' | 'like' | 'love'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          version_id: string
          user_id: string
          playlist_id?: string | null
          rating: 'listened' | 'like' | 'love'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          version_id?: string
          user_id?: string
          playlist_id?: string | null
          rating?: 'listened' | 'like' | 'love'
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          version_id: string
          playlist_id: string | null
          user_id: string
          content: string
          timestamp_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          version_id: string
          playlist_id?: string | null
          user_id: string
          content: string
          timestamp_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          version_id?: string
          playlist_id?: string | null
          user_id?: string
          content?: string
          timestamp_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sms_sessions: {
        Row: {
          id: string
          phone_number: string
          verification_code: string
          playlist_id: string | null
          expires_at: string
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          phone_number: string
          verification_code: string
          playlist_id?: string | null
          expires_at: string
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          phone_number?: string
          verification_code?: string
          playlist_id?: string | null
          expires_at?: string
          verified_at?: string | null
          created_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          upload_status: string
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          upload_status?: string
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          upload_status?: string
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ensemble_member_count: {
        Args: {
          ensemble_uuid: string
        }
        Returns: number
      }
      get_version_rating_counts: {
        Args: {
          version_uuid: string
        }
        Returns: Json
      }
    }
    Enums: {
      version_type: 'voice_memo' | 'rough_demo' | 'rehearsal' | 'working_mix' | 'final' | 'live' | 'other'
      rating_type: 'listened' | 'like' | 'love'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common use cases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Song = Database['public']['Tables']['songs']['Row'];
export type Version = Database['public']['Tables']['versions']['Row'];
export type Ensemble = Database['public']['Tables']['ensembles']['Row'];
export type Playlist = Database['public']['Tables']['playlists']['Row'];
export type Rating = Database['public']['Tables']['ratings']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];

export type VersionType = Database['public']['Enums']['version_type'];
export type RatingType = Database['public']['Enums']['rating_type'];

// Extended types with relations
export type VersionWithDetails = Version & {
  songs?: Song | null;
  profiles?: Profile | null;
  ratings?: Rating[];
  comments?: Comment[];
};

export type EnsembleWithMembers = Ensemble & {
  ensemble_members: { id: string }[];
  member_count?: number;
};

export type PlaylistWithItems = Playlist & {
  playlist_items: Array<{
    id: string;
    position: number;
    versions: VersionWithDetails;
  }>;
};