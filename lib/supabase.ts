import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { normalizePhoneNumber } from '../src/utils/phoneNumber';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Singleton client instance
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// Create Supabase client for client-side operations (singleton)
export const supabase = (() => {
  if (!_supabaseClient) {
    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true, // Auto-refresh tokens for persistent sessions
        persistSession: true, // Persist sessions in localStorage
        detectSessionInUrl: true, // Detect session from email confirmation URLs
      },
    });
  }
  return _supabaseClient;
})();

/**
 * Update Supabase session with Clerk JWT token
 * This allows Supabase RLS policies to work with Clerk authentication
 */
export async function setSupabaseAuthWithClerkToken(clerkToken: string) {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: clerkToken,
      refresh_token: clerkToken, // Clerk manages refresh, so we use same token
    });

    if (error) {
      console.error('❌ Failed to set Supabase session with Clerk token:', error);
      return { success: false, error };
    }

    console.log('✅ Supabase session set with Clerk JWT');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error setting Supabase session:', error);
    return { success: false, error };
  }
}

/**
 * Clear Supabase session (on logout)
 */
export async function clearSupabaseAuth() {
  try {
    await supabase.auth.signOut();
    console.log('✅ Supabase session cleared');
  } catch (error) {
    console.error('❌ Error clearing Supabase session:', error);
  }
}

// Note: Admin operations should be handled server-side through Supabase Edge Functions
// or Row Level Security (RLS) policies, not through client-side admin clients

// Auth helpers
export const auth = {
  // Sign in with email and password
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  // Sign up with email and password
  async signUpWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  },

  // Sign up with phone number (requires verification)
  async signUpWithPhone(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    });

    return { data, error };
  },

  // Verify OTP code
  async verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    return { data, error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers
export const db = {
  // Profile operations
  profiles: {
    async create(profile: {
      id: string;
      phone_number: string;
      name: string;
      avatar_url?: string;
    }) {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    },

    async update(id: string, updates: Partial<{
      name: string;
      avatar_url: string;
    }>) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    },
  },

  // Track operations
  tracks: {
    async create(track: {
      title: string;
      file_url: string;
      file_size?: number;
      duration_seconds?: number;
      created_by: string;
      folder_path?: string;
    }) {
      const { data, error } = await supabase
        .from('tracks')
        .insert(track)
        .select()
        .single();

      return { data, error };
    },

    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    },

    async delete(trackId: string) {
      const { data, error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

      return { data, error };
    },
  },

  // Playlist operations
  playlists: {
    async create(playlist: {
      title: string;
      description?: string;
      created_by: string;
      is_public?: boolean;
    }) {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          ...playlist,
          is_public: playlist.is_public ?? true, // Default to public for MVP
        })
        .select()
        .single();

      return { data, error };
    },

    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    async getByShareCode(shareCode: string) {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_items (
            *,
            tracks (
              *
            )
          )
        `)
        .eq('share_code', shareCode)
        .eq('is_public', true)
        .single();

      return { data, error };
    },

    async delete(playlistId: string) {
      const { data, error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      return { data, error };
    },

    async update(playlistId: string, updates: {
      title?: string;
      description?: string;
      is_public?: boolean;
    }) {
      const { data, error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', playlistId)
        .select()
        .single();

      return { data, error };
    },
  },

  // Playlist item operations
  playlistItems: {
    async add(item: {
      playlist_id: string;
      track_id: string;
      added_by: string;
      position: number;
    }) {
      const { data, error } = await supabase
        .from('playlist_items')
        .insert(item)
        .select()
        .single();

      return { data, error };
    },

    async getByPlaylist(playlistId: string) {
      const { data, error } = await supabase
        .from('playlist_items')
        .select(`
          *,
          tracks (
            *
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      return { data, error };
    },

    async remove(itemId: string) {
      const { data, error } = await supabase
        .from('playlist_items')
        .delete()
        .eq('id', itemId);

      return { data, error };
    },

    async updatePosition(itemId: string, newPosition: number) {
      const { data, error } = await supabase
        .from('playlist_items')
        .update({ position: newPosition })
        .eq('id', itemId)
        .select()
        .single();

      return { data, error };
    },
  },

  // Rating operations
  ratings: {
    async upsert(trackId: string, rating: 'listened' | 'liked' | 'loved', userId: string) {
      const { data, error } = await supabase
        .from('track_ratings')
        .upsert({
          track_id: trackId,
          user_id: userId,
          rating: rating,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'track_id,user_id'
        })
        .select()
        .single();

      return { data, error };
    },

    async getByTrack(trackId: string) {
      const { data, error } = await supabase
        .from('track_ratings')
        .select('*')
        .eq('track_id', trackId);

      return { data, error };
    },

    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('track_ratings')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    },

    async delete(trackId: string, userId: string) {
      const { data, error } = await supabase
        .from('track_ratings')
        .delete()
        .eq('track_id', trackId)
        .eq('user_id', userId);

      return { data, error };
    },
  },

  // Comment operations
  comments: {
    async create(comment: {
      track_id: string;
      user_id: string;
      content: string;
      timestamp_seconds?: number;
    }) {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      return { data, error };
    },

    async getByTrack(trackId: string) {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('track_id', trackId)
        .order('created_at', { ascending: false });

      return { data, error };
    },
  },

  // Playlist follower operations
  playlistFollowers: {
    async follow(playlistId: string, userId: string) {
      const { data, error } = await supabase
        .from('playlist_followers')
        .insert({
          playlist_id: playlistId,
          user_id: userId,
        })
        .select()
        .single();

      return { data, error };
    },

    async unfollow(playlistId: string, userId: string) {
      const { error } = await supabase
        .from('playlist_followers')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('user_id', userId);

      return { error };
    },

    async isFollowing(playlistId: string, userId: string) {
      const { data, error } = await supabase
        .from('playlist_followers')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('user_id', userId)
        .single();

      return { isFollowing: !!data && !error, error };
    },

    async getFollowedPlaylists(userId: string) {
      const { data, error } = await supabase
        .from('playlist_followers')
        .select(`
          *,
          playlists (
            *
          )
        `)
        .eq('user_id', userId)
        .order('followed_at', { ascending: false });

      return { data, error };
    },
  },

  // Feedback operations
  feedback: {
    async create(feedback: {
      user_id: string;
      category: 'bug' | 'feature' | 'question' | 'other';
      title: string;
      description: string;
      image_url?: string;
    }) {
      const { data, error } = await supabase
        .from('feedback')
        .insert(feedback)
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      return { data, error };
    },

    async getAll() {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles (
            name
          ),
          feedback_votes (count),
          feedback_comments (count)
        `)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    async getById(feedbackId: string) {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles (
            name
          ),
          feedback_votes (
            user_id
          ),
          feedback_comments (
            *,
            profiles (
              name
            )
          )
        `)
        .eq('id', feedbackId)
        .single();

      return { data, error };
    },

    async updateStatus(feedbackId: string, status: 'open' | 'under_review' | 'in_progress' | 'completed' | 'wont_fix') {
      const { data, error } = await supabase
        .from('feedback')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', feedbackId)
        .select()
        .single();

      return { data, error };
    },

    async delete(feedbackId: string) {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);

      return { error };
    },

    async archive(feedbackId: string) {
      const { data, error } = await supabase
        .from('feedback')
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq('id', feedbackId)
        .select()
        .single();

      return { data, error };
    },

    async unarchive(feedbackId: string) {
      const { data, error } = await supabase
        .from('feedback')
        .update({ archived: false, archived_at: null })
        .eq('id', feedbackId)
        .select()
        .single();

      return { data, error };
    },

    async getAllIncludingArchived(includeArchived: boolean = false) {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          profiles (
            name
          ),
          feedback_votes (count),
          feedback_comments (count)
        `);

      if (!includeArchived) {
        query = query.eq('archived', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      return { data, error };
    },
  },

  feedbackVotes: {
    async vote(feedbackId: string, userId: string) {
      const { data, error } = await supabase
        .from('feedback_votes')
        .insert({
          feedback_id: feedbackId,
          user_id: userId,
        })
        .select()
        .single();

      return { data, error };
    },

    async unvote(feedbackId: string, userId: string) {
      const { error } = await supabase
        .from('feedback_votes')
        .delete()
        .eq('feedback_id', feedbackId)
        .eq('user_id', userId);

      return { error };
    },

    async hasVoted(feedbackId: string, userId: string) {
      const { data, error } = await supabase
        .from('feedback_votes')
        .select('id')
        .eq('feedback_id', feedbackId)
        .eq('user_id', userId)
        .single();

      return { hasVoted: !!data && !error, error };
    },

    async getVoteCount(feedbackId: string) {
      const { count, error } = await supabase
        .from('feedback_votes')
        .select('*', { count: 'exact', head: true })
        .eq('feedback_id', feedbackId);

      return { count: count || 0, error };
    },
  },

  feedbackComments: {
    async create(comment: {
      feedback_id: string;
      user_id: string;
      content: string;
      is_admin_response?: boolean;
    }) {
      const { data, error } = await supabase
        .from('feedback_comments')
        .insert(comment)
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      return { data, error };
    },

    async createAdminResponse(feedbackId: string, userId: string, content: string) {
      return this.create({
        feedback_id: feedbackId,
        user_id: userId,
        content,
        is_admin_response: true,
      });
    },

    async getByFeedback(feedbackId: string) {
      const { data, error } = await supabase
        .from('feedback_comments')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true });

      return { data, error };
    },

    async delete(commentId: string) {
      const { error } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', commentId);

      return { error };
    },
  },
};

// Storage helpers
export const storage = {
  // Upload audio file
  async uploadAudio(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    return { data, error };
  },

  // Get signed URL for private file (expires in 1 hour)
  async getSignedUrl(path: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  },

  // Get public URL for file (for public buckets only)
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Delete file
  async deleteFile(path: string) {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .remove([path]);

    return { data, error };
  },
};

export default supabase;