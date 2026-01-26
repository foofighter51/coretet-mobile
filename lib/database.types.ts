export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      band_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          band_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          invite_token: string
          invited_by: string
          invited_email: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          band_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_token?: string
          invited_by: string
          invited_email: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          band_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_token?: string
          invited_by?: string
          invited_email?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_invites_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_invites_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      band_members: {
        Row: {
          band_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          band_id: string
          id?: string
          joined_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          band_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_members_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bands: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_personal: boolean | null
          max_members: number | null
          name: string
          settings: Json | null
          storage_limit: number | null
          storage_used: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_personal?: boolean | null
          max_members?: number | null
          name: string
          settings?: Json | null
          storage_limit?: number | null
          storage_used?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_personal?: boolean | null
          max_members?: number | null
          name?: string
          settings?: Json | null
          storage_limit?: number | null
          storage_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bands_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_code_usage: {
        Row: {
          code_id: string | null
          id: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          code_id?: string | null
          id?: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          code_id?: string | null
          id?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_code_usage_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "beta_invite_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_invite_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      comment_views: {
        Row: {
          created_at: string | null
          id: string
          last_viewed_at: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_views_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "comment_views_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "comment_views_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          band_id: string | null
          content: string
          created_at: string | null
          id: string
          timestamp_seconds: number | null
          track_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          band_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          timestamp_seconds?: number | null
          track_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          band_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          timestamp_seconds?: number | null
          track_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "comments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "comments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_comments: {
        Row: {
          content: string
          created_at: string | null
          feedback_id: string
          id: string
          is_admin_response: boolean | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          feedback_id: string
          id?: string
          is_admin_response?: boolean | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          feedback_id?: string
          id?: string
          is_admin_response?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_votes: {
        Row: {
          created_at: string | null
          feedback_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_votes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          band_id: string
          color: string | null
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          band_id: string
          color?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          band_id?: string
          color?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keywords_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keywords_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_waitlist: {
        Row: {
          email: string
          id: string
          name: string | null
          reason: string | null
          requested_at: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          name?: string | null
          reason?: string | null
          requested_at?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          reason?: string | null
          requested_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producer_waitlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean
          last_active_at: string | null
          name: string | null
          phone_number: string | null
          storage_limit: number | null
          storage_used: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_admin?: boolean
          last_active_at?: string | null
          name?: string | null
          phone_number?: string | null
          storage_limit?: number | null
          storage_used?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean
          last_active_at?: string | null
          name?: string | null
          phone_number?: string | null
          storage_limit?: number | null
          storage_used?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          band_id: string | null
          created_at: string | null
          id: string
          rating_type: string
          track_id: string
          user_id: string
        }
        Insert: {
          band_id?: string | null
          created_at?: string | null
          id?: string
          rating_type: string
          track_id: string
          user_id: string
        }
        Update: {
          band_id?: string | null
          created_at?: string | null
          id?: string
          rating_type?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "ratings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "ratings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      set_list_access_grants: {
        Row: {
          access_code: string
          access_count: number | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string | null
          expires_at: string
          first_accessed_at: string | null
          id: string
          is_revoked: boolean | null
          is_used: boolean | null
          last_accessed_at: string | null
          phone_number_hash: string
          shared_set_list_id: string
        }
        Insert: {
          access_code: string
          access_count?: number | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          expires_at: string
          first_accessed_at?: string | null
          id?: string
          is_revoked?: boolean | null
          is_used?: boolean | null
          last_accessed_at?: string | null
          phone_number_hash: string
          shared_set_list_id: string
        }
        Update: {
          access_code?: string
          access_count?: number | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          expires_at?: string
          first_accessed_at?: string | null
          id?: string
          is_revoked?: boolean | null
          is_used?: boolean | null
          last_accessed_at?: string | null
          phone_number_hash?: string
          shared_set_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_access_grants_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_list_access_grants_shared_set_list_id_fkey"
            columns: ["shared_set_list_id"]
            isOneToOne: false
            referencedRelation: "shared_set_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      set_list_entries: {
        Row: {
          added_at: string | null
          added_by: string
          id: string
          position: number
          set_list_id: string
          track_id: string
          version_id: string | null
        }
        Insert: {
          added_at?: string | null
          added_by: string
          id?: string
          position: number
          set_list_id: string
          track_id: string
          version_id?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string
          id?: string
          position?: number
          set_list_id?: string
          track_id?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["set_list_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["set_list_id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["set_list_id"]
            isOneToOne: false
            referencedRelation: "set_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "playlist_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "playlist_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_list_entries_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "track_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      set_list_followers: {
        Row: {
          followed_at: string | null
          id: string
          set_list_id: string
          source: string | null
          user_id: string
        }
        Insert: {
          followed_at?: string | null
          id?: string
          set_list_id: string
          source?: string | null
          user_id: string
        }
        Update: {
          followed_at?: string | null
          id?: string
          set_list_id?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_list_followers_set_list_id_fkey"
            columns: ["set_list_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["set_list_id"]
          },
          {
            foreignKeyName: "set_list_followers_set_list_id_fkey"
            columns: ["set_list_id"]
            isOneToOne: false
            referencedRelation: "set_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      set_lists: {
        Row: {
          band_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          share_code: string
          title: string
          updated_at: string | null
        }
        Insert: {
          band_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          share_code?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          band_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          share_code?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_set_lists: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          set_list_id: string
          share_token: string
          shared_by: string
          total_access_grants: number | null
          total_plays: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          set_list_id: string
          share_token?: string
          shared_by: string
          total_access_grants?: number | null
          total_plays?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          set_list_id?: string
          share_token?: string
          shared_by?: string
          total_access_grants?: number | null
          total_plays?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_playlists_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_set_lists_set_list_id_fkey"
            columns: ["set_list_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["set_list_id"]
          },
          {
            foreignKeyName: "shared_set_lists_set_list_id_fkey"
            columns: ["set_list_id"]
            isOneToOne: false
            referencedRelation: "set_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_credits: {
        Row: {
          created_at: string | null
          credits_remaining: number | null
          credits_total: number
          credits_used: number | null
          id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number | null
          credits_total: number
          credits_used?: number | null
          id?: string
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number | null
          credits_total?: number
          credits_used?: number | null
          id?: string
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          phone_number: string
          playlist_id: string | null
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          phone_number: string
          playlist_id?: string | null
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          phone_number?: string
          playlist_id?: string | null
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      track_keywords: {
        Row: {
          added_at: string | null
          added_by: string
          id: string
          keyword_id: string
          track_id: string
        }
        Insert: {
          added_at?: string | null
          added_by: string
          id?: string
          keyword_id: string
          track_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string
          id?: string
          keyword_id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_keywords_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_keywords_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_stats"
            referencedColumns: ["keyword_id"]
          },
          {
            foreignKeyName: "track_keywords_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_keywords_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_keywords_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_keywords_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_listens: {
        Row: {
          created_at: string | null
          id: string
          listened_at: string | null
          playback_percentage: number | null
          track_id: string
          user_id: string
          version_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listened_at?: string | null
          playback_percentage?: number | null
          track_id: string
          user_id: string
          version_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listened_at?: string | null
          playback_percentage?: number | null
          track_id?: string
          user_id?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_listens_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_listens_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_listens_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_listens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_listens_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "track_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      track_ratings: {
        Row: {
          created_at: string | null
          id: string
          rating: string
          track_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: string
          track_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: string
          track_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_ratings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_ratings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_ratings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      track_versions: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          id: string
          is_hero: boolean | null
          notes: string | null
          track_id: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string
          version_number: number
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          is_hero?: boolean | null
          notes?: string | null
          track_id: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by: string
          version_number: number
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_hero?: boolean | null
          notes?: string | null
          track_id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "track_versions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_versions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_versions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          band_id: string | null
          created_at: string | null
          created_by: string
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          hero_version_id: string | null
          id: string
          title: string
          updated_at: string | null
          version_group_id: string | null
        }
        Insert: {
          band_id?: string | null
          created_at?: string | null
          created_by: string
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          hero_version_id?: string | null
          id?: string
          title: string
          updated_at?: string | null
          version_group_id?: string | null
        }
        Update: {
          band_id?: string | null
          created_at?: string | null
          created_by?: string
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          hero_version_id?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          version_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_hero_version_id_fkey"
            columns: ["hero_version_id"]
            isOneToOne: false
            referencedRelation: "track_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_version_group_id_fkey"
            columns: ["version_group_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "tracks_version_group_id_fkey"
            columns: ["version_group_id"]
            isOneToOne: false
            referencedRelation: "version_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_access_control: {
        Row: {
          access_level: string
          created_at: string | null
          email: string
          id: string
          invited_at: string | null
          invited_by: string | null
          notes: string | null
          updated_at: string | null
          waitlist_joined_at: string | null
          waitlist_position: number | null
        }
        Insert: {
          access_level: string
          created_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          notes?: string | null
          updated_at?: string | null
          waitlist_joined_at?: string | null
          waitlist_position?: number | null
        }
        Update: {
          access_level?: string
          created_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          notes?: string | null
          updated_at?: string | null
          waitlist_joined_at?: string | null
          waitlist_position?: number | null
        }
        Relationships: []
      }
      version_groups: {
        Row: {
          band_id: string | null
          created_at: string | null
          created_by: string
          hero_track_id: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          band_id?: string | null
          created_at?: string | null
          created_by: string
          hero_track_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          band_id?: string | null
          created_at?: string | null
          created_by?: string
          hero_track_id?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "version_groups_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "version_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      keyword_stats: {
        Row: {
          band_id: string | null
          keyword_id: string | null
          keyword_name: string | null
          usage_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keywords_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      set_list_details: {
        Row: {
          band_id: string | null
          position: number | null
          set_list_id: string | null
          set_list_title: string | null
          track_count: number | null
          track_id: string | null
          track_title: string | null
          version_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_list_entries_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "track_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      track_listen_stats: {
        Row: {
          last_listened_at: string | null
          listen_count: number | null
          listener_count: number | null
          track_id: string | null
          version_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_listens_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "set_list_details"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_listens_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_version_groups"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "track_listens_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_listens_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "track_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      track_version_groups: {
        Row: {
          band_id: string | null
          duration_seconds: number | null
          file_url: string | null
          group_created_at: string | null
          group_id: string | null
          group_name: string | null
          hero_track_id: string | null
          is_hero: boolean | null
          track_created_at: string | null
          track_id: string | null
          track_title: string | null
          version_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "version_groups_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_keyword_to_track: {
        Args: { p_added_by: string; p_keyword_id: string; p_track_id: string }
        Returns: string
      }
      clerk_user_id: { Args: never; Returns: string }
      create_version_group: {
        Args: {
          p_band_id: string
          p_created_by: string
          p_hero_track_id: string
          p_name: string
          p_track_ids: string[]
        }
        Returns: string
      }
      current_user_id: { Args: never; Returns: string }
      get_or_create_keyword: {
        Args: {
          p_band_id: string
          p_color?: string
          p_created_by: string
          p_name: string
        }
        Returns: string
      }
      get_version_rating_counts: {
        Args: { version_uuid: string }
        Returns: Json
      }
      has_valid_invite: {
        Args: { p_band_id: string; p_user_id: string }
        Returns: boolean
      }
      is_band_admin: {
        Args: { check_band_id: string; check_user_id: string }
        Returns: boolean
      }
      is_band_member: {
        Args: { check_band_id: string; check_user_id: string }
        Returns: boolean
      }
      is_user_in_band: {
        Args: { check_band_id: string; check_user_id: string }
        Returns: boolean
      }
      record_track_listen: {
        Args: {
          p_playback_percentage?: number
          p_track_id: string
          p_user_id: string
          p_version_id: string
        }
        Returns: string
      }
      set_hero_track: {
        Args: { p_group_id: string; p_hero_track_id: string }
        Returns: undefined
      }
      ungroup_tracks: { Args: { p_group_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
