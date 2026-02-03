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

    async upsert(profile: {
      id: string;
      email?: string;
      name?: string;
      phone_number?: string;
      avatar_url?: string;
      updated_at?: string;
    }) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })
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

    async isAdmin(userId: string): Promise<boolean> {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.is_admin === true;
    },

    async update(id: string, updates: Partial<{
      name: string;
      avatar_url: string;
      phone_number: string;
    }>) {
      // Use upsert to handle both update and insert cases
      // This prevents "Cannot coerce result to single JSON object" errors
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id, ...updates }, { onConflict: 'id' })
        .select()
        .single();

      return { data, error };
    },

    async incrementStorage(userId: string, bytes: number) {
      const { error } = await supabase
        .from('profiles')
        .update({
          storage_used: supabase.raw(`COALESCE(storage_used, 0) + ${bytes}`)
        })
        .eq('id', userId);

      return { error };
    },

    async decrementStorage(userId: string, bytes: number) {
      const { error } = await supabase
        .from('profiles')
        .update({
          storage_used: supabase.raw(`GREATEST(COALESCE(storage_used, 0) - ${bytes}, 0)`)
        })
        .eq('id', userId);

      return { error };
    },

    async getStorageQuota(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('storage_used, storage_limit')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return {
          used: 0,
          limit: 1073741824, // 1GB default
          available: 1073741824,
          percentUsed: 0,
          error
        };
      }

      const used = data.storage_used || 0;
      const limit = data.storage_limit || 1073741824;
      const available = Math.max(0, limit - used);
      const percentUsed = (used / limit) * 100;

      return {
        used,
        limit,
        available,
        percentUsed: Math.round(percentUsed * 10) / 10, // 1 decimal place
        error: null
      };
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
      band_id?: string;
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

    async getByBand(bandId: string) {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('band_id', bandId)
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

    async updateVersionType(trackId: string, versionType: string | null) {
      const { data, error } = await supabase
        .from('tracks')
        .update({ version_type: versionType })
        .eq('id', trackId)
        .select()
        .single();

      return { data, error };
    },

    /**
     * Update track metadata (title, work assignment, etc.)
     * Used by track detail editing functionality
     */
    async update(trackId: string, updates: {
      title?: string;
      version_group_id?: string | null;
      version_type?: string | null;
      version_notes?: string | null;
      composition_date?: string | null; // ISO date string (YYYY-MM-DD)
    }) {
      const { data, error } = await supabase
        .from('tracks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', trackId)
        .select()
        .single();

      return { data, error };
    },
  },

  // Track Version operations
  trackVersions: {
    async getByTrack(trackId: string) {
      const { data, error} = await supabase
        .from('track_versions')
        .select('*')
        .eq('track_id', trackId)
        .order('version_number', { ascending: false });

      return { data, error };
    },

    async getHeroVersion(trackId: string) {
      const { data, error } = await supabase
        .from('track_versions')
        .select('*')
        .eq('track_id', trackId)
        .eq('is_hero', true)
        .single();

      return { data, error };
    },

    async setHeroVersion(trackId: string, versionId: string) {
      // First, unset all hero flags for this track
      await supabase
        .from('track_versions')
        .update({ is_hero: false })
        .eq('track_id', trackId);

      // Then set the new hero
      const { data, error } = await supabase
        .from('track_versions')
        .update({ is_hero: true })
        .eq('id', versionId)
        .select()
        .single();

      // Update track's hero_version_id
      if (!error) {
        await supabase
          .from('tracks')
          .update({ hero_version_id: versionId })
          .eq('id', trackId);
      }

      return { data, error };
    },

    async create(version: {
      track_id: string;
      file_url: string;
      uploaded_by: string;
      version_number: number;
      duration_seconds?: number;
      file_size?: number;
      notes?: string;
      is_hero?: boolean;
    }) {
      const { data, error } = await supabase
        .from('track_versions')
        .insert(version)
        .select()
        .single();

      return { data, error };
    },

    async delete(versionId: string) {
      const { data, error } = await supabase
        .from('track_versions')
        .delete()
        .eq('id', versionId);

      return { data, error };
    },
  },

  // Version Groups operations (for grouping existing tracks as versions)
  versionGroups: {
    async create(params: {
      name: string;
      band_id: string | null;
      track_ids: string[];
      hero_track_id: string;
      created_by: string;
    }) {
      const { data, error } = await supabase.rpc('create_version_group', {
        p_name: params.name,
        p_band_id: params.band_id,
        p_track_ids: params.track_ids,
        p_hero_track_id: params.hero_track_id,
        p_created_by: params.created_by,
      });

      return { data, error };
    },

    async getByBand(bandId: string) {
      const { data, error } = await supabase
        .from('version_groups')
        .select('*')
        .eq('band_id', bandId)
        .is('deleted_at', null) // Only return non-deleted items
        .order('created_at', { ascending: false });

      return { data, error };
    },

    async getTracksInGroup(groupId: string) {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('version_group_id', groupId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    async setHero(groupId: string, heroTrackId: string) {
      const { data, error } = await supabase.rpc('set_hero_track', {
        p_group_id: groupId,
        p_hero_track_id: heroTrackId,
      });

      return { data, error };
    },

    async ungroup(groupId: string) {
      const { data, error } = await supabase.rpc('ungroup_tracks', {
        p_group_id: groupId,
      });

      return { data, error };
    },

    async getGroupForTrack(trackId: string) {
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('version_group_id')
        .eq('id', trackId)
        .single();

      if (trackError || !track?.version_group_id) {
        return { data: null, error: trackError };
      }

      const { data, error } = await supabase
        .from('version_groups')
        .select('*')
        .eq('id', track.version_group_id)
        .single();

      return { data, error };
    },

    async rename(groupId: string, newName: string) {
      const { data, error } = await supabase
        .from('version_groups')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', groupId)
        .select()
        .single();

      return { data, error };
    },

    /**
     * Update Work (version group) metadata
     * Supports updating name and description
     */
    async update(groupId: string, updates: {
      name?: string;
      description?: string | null;
    }) {
      const { data, error } = await supabase
        .from('version_groups')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)
        .select()
        .single();

      return { data, error };
    },

    async delete(groupId: string, deletedBy: string) {
      // Soft delete using RPC function
      const { data, error } = await supabase.rpc('soft_delete_version_group', {
        p_group_id: groupId,
        p_deleted_by: deletedBy,
      });

      return { data, error };
    },

    async restore(groupId: string) {
      // Restore from recycle bin
      const { data, error } = await supabase.rpc('restore_version_group', {
        p_group_id: groupId,
      });

      return { data, error };
    },

    async permanentDelete(groupId: string) {
      // First, unassign all tracks from this group
      const { error: unassignError } = await supabase
        .from('tracks')
        .update({ version_group_id: null })
        .eq('version_group_id', groupId);

      if (unassignError) {
        return { data: null, error: unassignError };
      }

      // Then permanently delete the group
      const { data, error } = await supabase
        .from('version_groups')
        .delete()
        .eq('id', groupId);

      return { data, error };
    },

    async createEmpty(params: {
      name: string;
      band_id: string | null;
      created_by: string;
    }) {
      const { data, error } = await supabase
        .from('version_groups')
        .insert({
          name: params.name,
          band_id: params.band_id,
          created_by: params.created_by,
        })
        .select()
        .single();

      return { data, error };
    },

    /**
     * Add multiple tracks to a Work (version group)
     * This updates the version_group_id on each track
     */
    async addTracksToWork(workId: string, trackIds: string[]) {
      if (trackIds.length === 0) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('tracks')
        .update({
          version_group_id: workId,
          updated_at: new Date().toISOString()
        })
        .in('id', trackIds)
        .select();

      return { data, error };
    },

    /**
     * Remove a track from its current Work (sets version_group_id to null)
     */
    async removeTrackFromWork(trackId: string) {
      const { data, error } = await supabase
        .from('tracks')
        .update({
          version_group_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', trackId)
        .select()
        .single();

      return { data, error };
    },

    /**
     * Get a public Work by its share code
     * Used for the public work view (/work/:shareCode)
     */
    async getByShareCode(shareCode: string) {
      const { data, error } = await supabase
        .from('version_groups')
        .select(`
          *,
          tracks!tracks_version_group_id_fkey (
            id,
            title,
            file_url,
            duration_seconds,
            created_at,
            version_type,
            version_notes,
            profiles!tracks_created_by_fkey (
              name
            )
          )
        `)
        .eq('share_code', shareCode)
        .eq('is_public', true)
        .is('deleted_at', null)
        .single();

      return { data, error };
    },

    /**
     * Toggle public visibility for a Work
     * Returns the updated work with new is_public state
     */
    async togglePublic(workId: string, isPublic: boolean) {
      const { data, error } = await supabase
        .from('version_groups')
        .update({
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', workId)
        .select()
        .single();

      return { data, error };
    },

    /**
     * Get the share code for a Work
     * Returns just the share_code field
     */
    async getShareCode(workId: string) {
      const { data, error } = await supabase
        .from('version_groups')
        .select('share_code, is_public')
        .eq('id', workId)
        .single();

      return { data, error };
    },
  },

  // Set List operations (renamed from playlists)
  setLists: {
    async create(setList: {
      title: string;
      description?: string;
      created_by: string;
      is_public?: boolean;
      band_id?: string;
    }) {
      const { data, error } = await supabase
        .from('set_lists')
        .insert({
          ...setList,
          is_public: setList.is_public ?? true, // Default to public for MVP
        })
        .select()
        .single();

      return { data, error };
    },

    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('set_lists')
        .select('*, set_list_entries(count)')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    async getByBand(bandId: string) {
      const { data, error } = await supabase
        .from('set_lists')
        .select('*, set_list_entries(count)')
        .eq('band_id', bandId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    async getByShareCode(shareCode: string) {
      const { data, error } = await supabase
        .from('set_lists')
        .select(`
          *,
          set_list_entries (
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

    async delete(setListId: string) {
      const { data, error} = await supabase
        .from('set_lists')
        .delete()
        .eq('id', setListId);

      return { data, error };
    },

    async copyToPersonal(setListId: string, userId: string) {
      // 1. Fetch original set list
      const { data: originalSetList, error: setListError } = await supabase
        .from('set_lists')
        .select('*')
        .eq('id', setListId)
        .single();

      if (setListError || !originalSetList) {
        return { data: null, error: setListError || new Error('Set list not found') };
      }

      // 2. Fetch set list entries (with order)
      const { data: setListEntries, error: entriesError } = await supabase
        .from('set_list_entries')
        .select('track_id, version_id, position')
        .eq('set_list_id', setListId)
        .order('position');

      if (entriesError) {
        return { data: null, error: entriesError };
      }

      // 3. Create new personal set list (NO band_id)
      const { data: newSetList, error: createError } = await supabase
        .from('set_lists')
        .insert({
          title: originalSetList.title,
          description: originalSetList.description,
          created_by: userId,
          is_public: false, // User can make public later
          band_id: null, // KEY: No band assignment - this makes it personal
        })
        .select()
        .single();

      if (createError || !newSetList) {
        return { data: null, error: createError || new Error('Failed to create set list') };
      }

      // 4. Copy entries with version references
      if (setListEntries && setListEntries.length > 0) {
        const entryInserts = setListEntries.map(entry => ({
          set_list_id: newSetList.id,
          track_id: entry.track_id,
          version_id: entry.version_id, // Keep the version selection
          position: entry.position,
        }));

        const { error: insertError } = await supabase
          .from('set_list_entries')
          .insert(entryInserts);

        if (insertError) {
          // Rollback: delete the set list we just created
          await supabase.from('set_lists').delete().eq('id', newSetList.id);
          return { data: null, error: insertError };
        }
      }

      // 5. DO NOT copy ratings or comments - they stay tied to band context
      return { data: newSetList, error: null };
    },

    async update(setListId: string, updates: {
      title?: string;
      description?: string;
      is_public?: boolean;
    }) {
      const { data, error } = await supabase
        .from('set_lists')
        .update(updates)
        .eq('id', setListId)
        .select()
        .single();

      return { data, error };
    },
  },

  // Set list entry operations (renamed from playlistItems)
  setListEntries: {
    async add(entry: {
      set_list_id: string;
      track_id: string;
      version_id?: string; // Optional: defaults to hero version
      added_by: string;
      position: number;
    }) {
      const { data, error } = await supabase
        .from('set_list_entries')
        .insert(entry)
        .select()
        .single();

      return { data, error };
    },

    async getBySetList(setListId: string) {
      const { data, error } = await supabase
        .from('set_list_entries')
        .select(`
          *,
          tracks (
            *
          ),
          track_versions (
            *
          )
        `)
        .eq('set_list_id', setListId)
        .order('position', { ascending: true });

      return { data, error };
    },

    async remove(entryId: string) {
      const { data, error } = await supabase
        .from('set_list_entries')
        .delete()
        .eq('id', entryId);

      return { data, error };
    },

    async removeByTrack(setListId: string, trackId: string) {
      const { error } = await supabase
        .from('set_list_entries')
        .delete()
        .eq('set_list_id', setListId)
        .eq('track_id', trackId);

      return { error };
    },

    async updatePosition(entryId: string, newPosition: number) {
      const { data, error } = await supabase
        .from('set_list_entries')
        .update({ position: newPosition })
        .eq('id', entryId)
        .select()
        .single();

      return { data, error };
    },

    async updateVersion(entryId: string, versionId: string) {
      const { data, error } = await supabase
        .from('set_list_entries')
        .update({ version_id: versionId })
        .eq('id', entryId)
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

    // Check if tracks have comments (returns map of trackId -> hasComments)
    async checkTracksHaveComments(trackIds: string[]): Promise<Record<string, boolean>> {
      if (trackIds.length === 0) return {};

      const { data, error } = await supabase
        .from('comments')
        .select('track_id')
        .in('track_id', trackIds);

      if (error || !data) {
        console.error('Error checking for comments:', error);
        return {};
      }

      // Create a map of trackId -> hasComments
      const commentMap: Record<string, boolean> = {};
      trackIds.forEach(id => {
        commentMap[id] = data.some(comment => comment.track_id === id);
      });

      return commentMap;
    },

    // Get comment counts for tracks (returns map of trackId -> count)
    async getTrackCommentCounts(trackIds: string[]): Promise<Record<string, number>> {
      if (trackIds.length === 0) return {};

      const { data, error } = await supabase
        .from('comments')
        .select('track_id')
        .in('track_id', trackIds);

      if (error || !data) {
        console.error('Error getting comment counts:', error);
        return {};
      }

      // Create a map of trackId -> count
      const countMap: Record<string, number> = {};
      trackIds.forEach(id => {
        countMap[id] = data.filter(comment => comment.track_id === id).length;
      });

      return countMap;
    },

    // Check if tracks have unread comments (returns map of trackId -> hasUnread)
    async checkTracksHaveUnreadComments(trackIds: string[], userId: string): Promise<Record<string, boolean>> {
      if (trackIds.length === 0) return {};

      // Get all comments for these tracks
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('track_id, created_at')
        .in('track_id', trackIds)
        .order('created_at', { ascending: false });

      if (commentsError || !comments) {
        console.error('Error checking for comments:', commentsError);
        return {};
      }

      // Get user's last viewed times for these tracks
      const { data: views, error: viewsError } = await supabase
        .from('comment_views')
        .select('track_id, last_viewed_at')
        .eq('user_id', userId)
        .in('track_id', trackIds);

      if (viewsError) {
        console.error('Error checking comment views:', viewsError);
      }

      // Create map of trackId -> last viewed time
      const viewMap: Record<string, Date> = {};
      (views || []).forEach(view => {
        viewMap[view.track_id] = new Date(view.last_viewed_at);
      });

      // Check if any comment is newer than last viewed time
      const unreadMap: Record<string, boolean> = {};
      trackIds.forEach(trackId => {
        const trackComments = comments.filter(c => c.track_id === trackId);
        if (trackComments.length === 0) {
          unreadMap[trackId] = false;
          return;
        }

        const lastViewed = viewMap[trackId];
        if (!lastViewed) {
          // Never viewed = all comments are unread
          unreadMap[trackId] = true;
          return;
        }

        // Check if any comment is newer than last viewed
        unreadMap[trackId] = trackComments.some(
          comment => new Date(comment.created_at) > lastViewed
        );
      });

      return unreadMap;
    },

    // Mark track comments as viewed
    async markCommentsAsViewed(trackId: string, userId: string) {
      const { error } = await supabase
        .from('comment_views')
        .upsert(
          {
            user_id: userId,
            track_id: trackId,
            last_viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,track_id',
          }
        );

      if (error) {
        console.error('Error marking comments as viewed:', error);
      }

      return { error };
    },

    /**
     * Update a comment (only the comment author can update)
     */
    async update(commentId: string, content: string) {
      const { data, error } = await supabase
        .from('comments')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      return { data, error };
    },

    /**
     * Delete a comment (only the comment author can delete)
     */
    async delete(commentId: string) {
      const { data, error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      return { data, error };
    },

    /**
     * Get all comments for all tracks in a Work (version_group)
     * Aggregates comments across all versions of a song for the feed view
     */
    async getByWork(versionGroupId: string) {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          ),
          tracks!inner (
            id,
            title,
            version_type,
            version_group_id
          )
        `)
        .eq('tracks.version_group_id', versionGroupId)
        .order('created_at', { ascending: false });

      return { data, error };
    },
  },

  // Band operations
  bands: {
    async getUserBands(userId: string) {
      const { data, error } = await supabase
        .from('band_members')
        .select(`
          band_id,
          role,
          bands (
            id,
            name,
            created_by,
            is_personal,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user bands:', error);
        return [];
      }

      return data?.map(item => item.bands).filter(Boolean) as any[] || [];
    },

    async getBandMembers(bandId: string) {
      const { data, error } = await supabase
        .from('band_members')
        .select('id, band_id, user_id, role, joined_at')
        .eq('band_id', bandId);

      if (error) {
        console.error('Error fetching band members:', error);
        return [];
      }

      if (!data) return [];

      // Fetch profile data separately for each member to avoid RLS issues
      const membersWithProfiles = await Promise.all(
        data.map(async (member) => {
          const { data: profile } = await db.profiles.getById(member.user_id);
          return {
            ...member,
            profiles: profile || null,
          };
        })
      );

      return membersWithProfiles;
    },

    async createBand(name: string, userId: string, isPersonal: boolean = false) {
      const { data: band, error: bandError } = await supabase
        .from('bands')
        .insert({
          name,
          created_by: userId,
          is_personal: isPersonal,
        })
        .select()
        .single();

      if (bandError || !band) {
        console.error('Error creating band:', bandError);
        return { data: null, error: bandError };
      }

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('band_members')
        .insert({
          band_id: band.id,
          user_id: userId,
          role: 'owner',
        });

      if (memberError) {
        console.error('Error adding band owner:', memberError);
        return { data: null, error: memberError };
      }

      return { data: band, error: null };
    },

    async inviteMember(bandId: string, email: string, invitedBy: string, role: 'admin' | 'member' = 'member') {
      const { data, error } = await supabase
        .from('band_invites')
        .insert({
          band_id: bandId,
          email,
          invited_by: invitedBy,
          role,
        })
        .select()
        .single();

      return { data, error };
    },

    async getPendingInvites(email: string) {
      const { data, error } = await supabase
        .from('band_invites')
        .select(`
          *,
          bands (
            name
          )
        `)
        .eq('email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      return { data, error };
    },

    async acceptInvite(inviteId: string, userId: string) {
      // Get invite details
      const { data: invite, error: inviteError } = await supabase
        .from('band_invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (inviteError || !invite) {
        return { data: null, error: inviteError };
      }

      // Add user as band member
      const { data: member, error: memberError } = await supabase
        .from('band_members')
        .insert({
          band_id: invite.band_id,
          user_id: userId,
          role: invite.role,
        })
        .select()
        .single();

      if (memberError) {
        return { data: null, error: memberError };
      }

      // Update invite status
      await supabase
        .from('band_invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', inviteId);

      return { data: member, error: null };
    },

    /**
     * Remove a member from a band
     */
    async removeMember(bandId: string, memberId: string) {
      const { error } = await supabase
        .from('band_members')
        .delete()
        .eq('band_id', bandId)
        .eq('id', memberId);

      return { error };
    },

    /**
     * Update a member's role
     */
    async updateMemberRole(bandId: string, memberId: string, newRole: 'admin' | 'member') {
      const { data, error } = await supabase
        .from('band_members')
        .update({ role: newRole })
        .eq('band_id', bandId)
        .eq('id', memberId)
        .select()
        .single();

      return { data, error };
    },
  },

  // Set list follower operations (renamed from playlistFollowers)
  setListFollowers: {
    async follow(setListId: string, userId: string) {
      const { data, error } = await supabase
        .from('set_list_followers')
        .insert({
          set_list_id: setListId,
          user_id: userId,
        })
        .select()
        .single();

      return { data, error };
    },

    async unfollow(setListId: string, userId: string) {
      const { error } = await supabase
        .from('set_list_followers')
        .delete()
        .eq('set_list_id', setListId)
        .eq('user_id', userId);

      return { error };
    },

    async isFollowing(setListId: string, userId: string) {
      const { data, error } = await supabase
        .from('set_list_followers')
        .select('id')
        .eq('set_list_id', setListId)
        .eq('user_id', userId)
        .single();

      return { isFollowing: !!data && !error, error };
    },

    async getFollowedSetLists(userId: string) {
      const { data, error } = await supabase
        .from('set_list_followers')
        .select(`
          *,
          set_lists (
            *,
            set_list_entries(count)
          )
        `)
        .eq('user_id', userId)
        .order('followed_at', { ascending: false});

      return { data, error };
    },
  },

  // Band invite operations
  bandInvites: {
    /**
     * Create a new band invite
     * Generates a unique token for the invite link
     */
    async create(bandId: string, invitedBy: string, invitedEmail: string) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitedEmail)) {
        return { data: null, error: new Error('Invalid email format') };
      }

      // Check if a user with this email exists and is already a member
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', invitedEmail)
        .single();

      if (profile) {
        // User exists, check if they're already a member
        const { data: existingMember } = await supabase
          .from('band_members')
          .select('id')
          .eq('band_id', bandId)
          .eq('user_id', profile.id)
          .single();

        if (existingMember) {
          return { data: null, error: new Error('User is already a member of this band') };
        }
      }

      // Check for existing pending invite
      const { data: existingInvite } = await supabase
        .from('band_invites')
        .select('id')
        .eq('band_id', bandId)
        .eq('invited_email', invitedEmail)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvite) {
        return { data: null, error: new Error('An active invite already exists for this email') };
      }

      // Debug: Check current user's role in the band
      const { data: currentUser } = await supabase.auth.getUser();
      console.log('[DEBUG] Current auth user:', currentUser?.user?.id);
      console.log('[DEBUG] Passed invitedBy:', invitedBy);
      console.log('[DEBUG] Band ID:', bandId);

      // Check if current user is owner/admin
      const { data: memberCheck, error: memberError } = await supabase
        .from('band_members')
        .select('role')
        .eq('band_id', bandId)
        .eq('user_id', currentUser?.user?.id || '')
        .single();

      console.log('[DEBUG] Member check result:', memberCheck);
      console.log('[DEBUG] Member check error:', memberError);

      if (!memberCheck || (memberCheck.role !== 'owner' && memberCheck.role !== 'admin')) {
        return {
          data: null,
          error: new Error('You must be an owner or admin to invite members')
        };
      }

      // Generate unique invite token
      const inviteToken = crypto.randomUUID();

      const { data, error } = await supabase
        .from('band_invites')
        .insert({
          band_id: bandId,
          invited_by: invitedBy,
          invited_email: invitedEmail,
          invite_token: inviteToken,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single();

      if (error) {
        console.error('[DEBUG] Insert error:', error);
      }

      return { data, error };
    },

    /**
     * Get invite details by token (for acceptance page)
     */
    async getByToken(token: string) {
      const { data, error } = await supabase
        .from('band_invites')
        .select(`
          *,
          bands (
            id,
            name,
            created_by
          ),
          profiles!band_invites_invited_by_fkey (
            name
          )
        `)
        .eq('invite_token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      return { data, error };
    },

    /**
     * Accept an invite and join the band
     */
    async accept(token: string, userId: string) {
      // Get invite details
      const { data: invite, error: inviteError } = await supabase
        .from('band_invites')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invite) {
        return { data: null, error: inviteError || new Error('Invalid or expired invite') };
      }

      // Check if user is already a member
      // Note: This query may return 406 due to RLS policies, but that's OK
      // A 406 means we can't check, so we'll proceed with INSERT and let it fail if already member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('band_members')
        .select('id')
        .eq('band_id', invite.band_id)
        .eq('user_id', userId)
        .maybeSingle();

      // Only block if we successfully found an existing member
      // Ignore 406 or other errors - INSERT will handle duplicate prevention
      if (existingMember && !memberCheckError) {
        return { data: null, error: new Error('You are already a member of this band') };
      }

      // Verify current auth session matches the userId
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      console.log('[INVITE] Auth check:', {
        currentAuthUser: currentAuthUser?.id,
        expectedUserId: userId,
        match: currentAuthUser?.id === userId,
        bandId: invite.band_id,
        invitedEmail: invite.invited_email
      });

      if (!currentAuthUser || currentAuthUser.id !== userId) {
        console.error('[INVITE] Auth mismatch:', {
          currentAuthUser: currentAuthUser?.id,
          expectedUserId: userId
        });
        return {
          data: null,
          error: new Error('Authentication session mismatch. Please try logging in again.')
        };
      }

      // Add user as band member
      console.log('[INVITE] Attempting INSERT into band_members:', {
        band_id: invite.band_id,
        user_id: userId,
        role: 'member'
      });

      const { data: member, error: memberError } = await supabase
        .from('band_members')
        .insert({
          band_id: invite.band_id,
          user_id: userId,
          role: 'member', // Default role
        })
        .select()
        .single();

      if (memberError) {
        console.error('[INVITE] INSERT failed:', {
          error: memberError,
          message: memberError.message,
          details: memberError.details,
          hint: memberError.hint,
          code: memberError.code
        });
        return { data: null, error: memberError };
      }

      console.log('[INVITE] INSERT succeeded:', member);

      // Update invite status
      const { error: updateError } = await supabase
        .from('band_invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: userId,
        })
        .eq('id', invite.id);

      if (updateError) {
        console.error('Failed to update invite status:', updateError);
      }

      return { data: { member, invite }, error: null };
    },

    /**
     * Revoke (delete) a pending invite
     */
    async revoke(inviteId: string) {
      const { error } = await supabase
        .from('band_invites')
        .delete()
        .eq('id', inviteId)
        .eq('status', 'pending');

      return { error };
    },

    /**
     * List all invites for a band (pending, accepted, expired)
     */
    async listForBand(bandId: string) {
      const { data, error } = await supabase
        .from('band_invites')
        .select(`
          *,
          profiles!band_invites_invited_by_fkey (
            name
          )
        `)
        .eq('band_id', bandId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    /**
     * List pending invites for a band
     */
    async listPendingForBand(bandId: string) {
      const { data, error } = await supabase
        .from('band_invites')
        .select(`
          *,
          profiles!band_invites_invited_by_fkey (
            name
          )
        `)
        .eq('band_id', bandId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

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
        .or('archived.is.null,archived.eq.false')
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

  // Recycle Bin operations
  recycleBin: {
    async getItems(bandId: string) {
      // Get all deleted items for a band
      const { data, error } = await supabase
        .from('recycle_bin_items')
        .select('*')
        .eq('band_id', bandId)
        .order('deleted_at', { ascending: false });

      return { data, error };
    },

    async getItemsByType(bandId: string, itemType: 'track' | 'work' | 'set_list') {
      const { data, error } = await supabase
        .from('recycle_bin_items')
        .select('*')
        .eq('band_id', bandId)
        .eq('item_type', itemType)
        .order('deleted_at', { ascending: false });

      return { data, error };
    },

    async restoreTrack(trackId: string) {
      const { data, error } = await supabase.rpc('restore_track', {
        p_track_id: trackId,
      });

      return { data, error };
    },

    async restoreWork(groupId: string) {
      const { data, error } = await supabase.rpc('restore_version_group', {
        p_group_id: groupId,
      });

      return { data, error };
    },

    async restoreSetList(setListId: string) {
      const { data, error } = await supabase.rpc('restore_set_list', {
        p_set_list_id: setListId,
      });

      return { data, error };
    },

    async permanentDeleteTrack(trackId: string) {
      const { data, error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

      return { data, error };
    },

    async permanentDeleteWork(groupId: string) {
      // First unassign tracks
      await supabase
        .from('tracks')
        .update({ version_group_id: null })
        .eq('version_group_id', groupId);

      // Then delete the group
      const { data, error } = await supabase
        .from('version_groups')
        .delete()
        .eq('id', groupId);

      return { data, error };
    },

    async permanentDeleteSetList(setListId: string) {
      const { data, error } = await supabase
        .from('set_lists')
        .delete()
        .eq('id', setListId);

      return { data, error };
    },

    async emptyRecycleBin(bandId: string) {
      // Permanently delete all items for this band that are in the recycle bin
      // Delete tracks first (they may reference version groups)
      await supabase
        .from('tracks')
        .delete()
        .eq('band_id', bandId)
        .not('deleted_at', 'is', null);

      await supabase
        .from('version_groups')
        .delete()
        .eq('band_id', bandId)
        .not('deleted_at', 'is', null);

      await supabase
        .from('set_lists')
        .delete()
        .eq('band_id', bandId)
        .not('deleted_at', 'is', null);

      return { data: true, error: null };
    },
  },

  // Work-level Comments operations
  workComments: {
    async create(comment: {
      version_group_id: string;
      user_id: string;
      content: string;
      track_id?: string;
      timestamp_seconds?: number;
    }) {
      const { data, error } = await supabase
        .from('work_comments')
        .insert(comment)
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .single();

      return { data, error };
    },

    async getByWork(versionGroupId: string) {
      const { data, error } = await supabase
        .from('work_comments')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq('version_group_id', versionGroupId)
        .order('timestamp_seconds', { ascending: true, nullsFirst: false });

      return { data, error };
    },

    async getByTrack(trackId: string) {
      const { data, error } = await supabase
        .from('work_comments')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq('track_id', trackId)
        .order('timestamp_seconds', { ascending: true, nullsFirst: false });

      return { data, error };
    },

    async update(commentId: string, content: string) {
      const { data, error } = await supabase
        .from('work_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select()
        .single();

      return { data, error };
    },

    async delete(commentId: string) {
      const { error } = await supabase
        .from('work_comments')
        .delete()
        .eq('id', commentId);

      return { error };
    },

    async markAsViewed(versionGroupId: string, userId: string) {
      const { error } = await supabase
        .from('work_comment_views')
        .upsert(
          {
            version_group_id: versionGroupId,
            user_id: userId,
            last_viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'version_group_id,user_id',
          }
        );

      return { error };
    },

    async getUnreadCount(versionGroupId: string, userId: string) {
      // Get user's last viewed time
      const { data: viewData } = await supabase
        .from('work_comment_views')
        .select('last_viewed_at')
        .eq('version_group_id', versionGroupId)
        .eq('user_id', userId)
        .single();

      const lastViewed = viewData?.last_viewed_at;

      // Count comments newer than last viewed
      let query = supabase
        .from('work_comments')
        .select('*', { count: 'exact', head: true })
        .eq('version_group_id', versionGroupId);

      if (lastViewed) {
        query = query.gt('created_at', lastViewed);
      }

      const { count, error } = await query;

      return { count: count || 0, error };
    },

    async checkWorksHaveUnreadComments(workIds: string[], userId: string): Promise<Record<string, boolean>> {
      if (workIds.length === 0) return {};

      // Get user's last viewed times
      const { data: views } = await supabase
        .from('work_comment_views')
        .select('version_group_id, last_viewed_at')
        .eq('user_id', userId)
        .in('version_group_id', workIds);

      // Get all comments for these works
      const { data: comments } = await supabase
        .from('work_comments')
        .select('version_group_id, created_at')
        .in('version_group_id', workIds)
        .order('created_at', { ascending: false });

      // Build view map
      const viewMap: Record<string, Date> = {};
      (views || []).forEach(view => {
        viewMap[view.version_group_id] = new Date(view.last_viewed_at);
      });

      // Check for unread
      const unreadMap: Record<string, boolean> = {};
      workIds.forEach(workId => {
        const workComments = (comments || []).filter(c => c.version_group_id === workId);
        if (workComments.length === 0) {
          unreadMap[workId] = false;
          return;
        }

        const lastViewed = viewMap[workId];
        if (!lastViewed) {
          unreadMap[workId] = true;
          return;
        }

        unreadMap[workId] = workComments.some(
          comment => new Date(comment.created_at) > lastViewed
        );
      });

      return unreadMap;
    },
  },

  // Work-level Ratings operations
  workRatings: {
    async rate(params: {
      version_group_id: string;
      user_id: string;
      rating: 'liked' | 'loved';
      track_id?: string;
    }) {
      const { data, error } = await supabase
        .from('work_ratings')
        .upsert(
          {
            version_group_id: params.version_group_id,
            user_id: params.user_id,
            rating: params.rating,
            track_id: params.track_id || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'version_group_id,user_id,track_id',
          }
        )
        .select()
        .single();

      return { data, error };
    },

    async removeRating(versionGroupId: string, userId: string, trackId?: string) {
      let query = supabase
        .from('work_ratings')
        .delete()
        .eq('version_group_id', versionGroupId)
        .eq('user_id', userId);

      if (trackId) {
        query = query.eq('track_id', trackId);
      } else {
        query = query.is('track_id', null);
      }

      const { error } = await query;
      return { error };
    },

    async getByWork(versionGroupId: string, currentUserId: string) {
      const { data, error } = await supabase
        .from('work_ratings')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('version_group_id', versionGroupId);

      if (error || !data) {
        return {
          personal: null,
          collaborators: { liked: 0, loved: 0, names: [] },
          cumulative: { liked: 0, loved: 0 },
          error,
        };
      }

      const personal = data.find(r => r.user_id === currentUserId);
      const collaborators = data.filter(r => r.user_id !== currentUserId);

      return {
        personal: personal?.rating || null,
        collaborators: {
          liked: collaborators.filter(r => r.rating === 'liked').length,
          loved: collaborators.filter(r => r.rating === 'loved').length,
          names: collaborators.map(r => (r as any).profiles?.name).filter(Boolean) as string[],
        },
        cumulative: {
          liked: data.filter(r => r.rating === 'liked').length,
          loved: data.filter(r => r.rating === 'loved').length,
        },
        error: null,
      };
    },

    async getByTrack(trackId: string, currentUserId: string) {
      const { data, error } = await supabase
        .from('work_ratings')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('track_id', trackId);

      if (error || !data) {
        return {
          personal: null,
          collaborators: { liked: 0, loved: 0, names: [] },
          cumulative: { liked: 0, loved: 0 },
          error,
        };
      }

      const personal = data.find(r => r.user_id === currentUserId);
      const collaborators = data.filter(r => r.user_id !== currentUserId);

      return {
        personal: personal?.rating || null,
        collaborators: {
          liked: collaborators.filter(r => r.rating === 'liked').length,
          loved: collaborators.filter(r => r.rating === 'loved').length,
          names: collaborators.map(r => (r as any).profiles?.name).filter(Boolean) as string[],
        },
        cumulative: {
          liked: data.filter(r => r.rating === 'liked').length,
          loved: data.filter(r => r.rating === 'loved').length,
        },
        error: null,
      };
    },
  },

  // Track Waveform cache operations
  trackWaveforms: {
    async get(trackId: string) {
      const { data, error } = await supabase
        .from('track_waveforms')
        .select('*')
        .eq('track_id', trackId)
        .single();

      return { data, error };
    },

    async save(trackId: string, waveformData: {
      amplitudes: number[];
      sampleCount: number;
      duration: number;
    }) {
      const { data, error } = await supabase
        .from('track_waveforms')
        .upsert(
          {
            track_id: trackId,
            waveform_data: waveformData.amplitudes,
            sample_count: waveformData.sampleCount,
            duration_seconds: waveformData.duration,
          },
          {
            onConflict: 'track_id',
          }
        )
        .select()
        .single();

      return { data, error };
    },

    async delete(trackId: string) {
      const { error } = await supabase
        .from('track_waveforms')
        .delete()
        .eq('track_id', trackId);

      return { error };
    },
  },

  // Version Types operations
  versionTypes: {
    async getAll(bandId?: string) {
      // Get default types (band_id IS NULL)
      const { data: defaultTypes, error: defaultError } = await supabase
        .from('version_types')
        .select('*')
        .is('band_id', null)
        .order('display_order', { ascending: true });

      if (defaultError) {
        return { data: null, error: defaultError };
      }

      // Get band-specific custom types if bandId provided
      let customTypes: any[] = [];
      if (bandId) {
        const { data: bandTypes, error: bandError } = await supabase
          .from('version_types')
          .select('*')
          .eq('band_id', bandId)
          .order('display_order', { ascending: true });

        if (bandError) {
          return { data: null, error: bandError };
        }
        customTypes = bandTypes || [];
      }

      // Combine: defaults first, then custom
      const allTypes = [...(defaultTypes || []), ...customTypes];

      return { data: allTypes, error: null };
    },

    async create(bandId: string, name: string) {
      // Get max display_order for this band
      const { data: existing } = await supabase
        .from('version_types')
        .select('display_order')
        .eq('band_id', bandId)
        .order('display_order', { ascending: false })
        .limit(1);

      const maxOrder = existing?.[0]?.display_order || 100;

      const { data, error } = await supabase
        .from('version_types')
        .insert({
          band_id: bandId,
          name: name.trim(),
          is_default: false,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      return { data, error };
    },

    async delete(typeId: string) {
      const { error } = await supabase
        .from('version_types')
        .delete()
        .eq('id', typeId);

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

  // Upload feedback image/screenshot
  async uploadFeedbackImage(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('feedback-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    return { data, error };
  },

  // Get signed URL for private file (expires in 1 hour)
  async getSignedUrl(path: string, expiresIn: number = 3600, bucket: string = 'audio-files') {
    const { data, error } = await supabase.storage
      .from(bucket)
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

// ============================================================
// KEYWORDS HELPERS
// ============================================================

export const keywordHelpers = {
  // Get all keywords for a band
  async getKeywordsForBand(bandId: string) {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('band_id', bandId)
      .order('name', { ascending: true });

    return { data, error };
  },

  // Create a new keyword
  async createKeyword(bandId: string, name: string, createdBy: string, color?: string) {
    const { data, error } = await supabase
      .from('keywords')
      .insert({
        band_id: bandId,
        name: name.trim(),
        color: color || null,
        created_by: createdBy,
      })
      .select()
      .single();

    return { data, error };
  },

  // Delete a keyword
  async deleteKeyword(keywordId: string) {
    const { error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', keywordId);

    return { error };
  },

  // Get keywords for a track
  async getKeywordsForTrack(trackId: string) {
    const { data, error } = await supabase
      .from('track_keywords')
      .select(`
        id,
        keyword_id,
        keywords (
          id,
          name,
          color
        )
      `)
      .eq('track_id', trackId);

    return { data, error };
  },

  // Add keyword to track
  async addKeywordToTrack(trackId: string, keywordId: string, addedBy: string) {
    const { data, error } = await supabase
      .from('track_keywords')
      .insert({
        track_id: trackId,
        keyword_id: keywordId,
        added_by: addedBy,
      })
      .select()
      .single();

    return { data, error };
  },

  // Remove keyword from track
  async removeKeywordFromTrack(trackId: string, keywordId: string) {
    const { error } = await supabase
      .from('track_keywords')
      .delete()
      .eq('track_id', trackId)
      .eq('keyword_id', keywordId);

    return { error };
  },

  // Get all tracks with a specific keyword
  async getTracksWithKeyword(keywordId: string) {
    const { data, error } = await supabase
      .from('track_keywords')
      .select(`
        track_id,
        tracks (
          id,
          title,
          file_url,
          duration_seconds,
          uploaded_by,
          created_at
        )
      `)
      .eq('keyword_id', keywordId);

    return { data, error };
  },
};

export default supabase;