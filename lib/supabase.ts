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
        autoRefreshToken: false, // We'll handle token refresh via Clerk
        persistSession: false, // Clerk manages the session
        detectSessionInUrl: false,
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

  // Version operations
  versions: {
    async create(version: {
      title: string;
      file_url: string;
      file_size?: number;
      duration_seconds?: number;
      version_type?: string;
      song_id?: string;
      recording_date?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('versions')
        .insert({
          ...version,
          uploaded_by: user.id,
        })
        .select()
        .single();

      return { data, error };
    },

    async getByEnsemble(ensembleId: string) {
      const { data, error } = await supabase
        .from('versions')
        .select(`
          *,
          songs (
            title
          ),
          profiles!versions_uploaded_by_fkey (
            name
          )
        `)
        .eq('songs.ensemble_id', ensembleId);

      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('versions')
        .select(`
          *,
          songs (
            title
          ),
          profiles!versions_uploaded_by_fkey (
            name
          )
        `)
        .eq('id', id)
        .single();

      return { data, error };
    },
  },

  // Ensemble operations
  ensembles: {
    async create(ensemble: {
      name: string;
      description?: string;
      authorized_phone_1?: string;
      authorized_phone_2?: string;
      authorized_phone_3?: string;
      authorized_phone_4?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate cryptographically secure 8-character invite code
      const generateInviteCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
        const array = new Uint8Array(8);
        crypto.getRandomValues(array);
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars[array[i] % chars.length];
        }
        return result;
      };

      const invite_code = generateInviteCode();

      // Normalize phone numbers before storing
      const normalizedEnsemble = {
        ...ensemble,
        created_by: user.id,
        invite_code,
        authorized_phone_1: ensemble.authorized_phone_1 ? normalizePhoneNumber(ensemble.authorized_phone_1) : null,
        authorized_phone_2: ensemble.authorized_phone_2 ? normalizePhoneNumber(ensemble.authorized_phone_2) : null,
        authorized_phone_3: ensemble.authorized_phone_3 ? normalizePhoneNumber(ensemble.authorized_phone_3) : null,
        authorized_phone_4: ensemble.authorized_phone_4 ? normalizePhoneNumber(ensemble.authorized_phone_4) : null,
      };

      const { data, error } = await supabase
        .from('ensembles')
        .insert(normalizedEnsemble)
        .select()
        .single();

      return { data, error };
    },

    async getByUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ensemble_members')
        .select(`
          ensembles (
            *,
            ensemble_members (
              id
            )
          )
        `)
        .eq('user_id', user.id);

      return { data, error };
    },

    async joinWithCode(inviteCode: string, userPhone: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First find the ensemble with authorization check
      const { data: ensemble, error: ensembleError } = await supabase
        .from('ensembles')
        .select('id, name, authorized_phone_1, authorized_phone_2, authorized_phone_3, authorized_phone_4')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (ensembleError || !ensemble) {
        return { data: null, error: ensembleError || new Error('Invalid invite code') };
      }

      // Normalize user phone and compare with stored normalized phone numbers
      const normalizedUserPhone = normalizePhoneNumber(userPhone);
      const isAuthorized = ensemble.authorized_phone_1 === normalizedUserPhone ||
                          ensemble.authorized_phone_2 === normalizedUserPhone ||
                          ensemble.authorized_phone_3 === normalizedUserPhone ||
                          ensemble.authorized_phone_4 === normalizedUserPhone;

      if (!isAuthorized) {
        return {
          data: null,
          error: new Error(`Not authorized to join "${ensemble.name}". Contact the band creator.`)
        };
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('ensemble_members')
        .select('id')
        .eq('ensemble_id', ensemble.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return {
          data: null,
          error: new Error(`You're already a member of "${ensemble.name}"`)
        };
      }

      // Join the ensemble
      const { data, error } = await supabase
        .from('ensemble_members')
        .insert({
          ensemble_id: ensemble.id,
          user_id: user.id,
        })
        .select()
        .single();

      return { data, error };
    },
  },

  // Rating operations
  ratings: {
    async upsert(versionId: string, rating: 'listened' | 'like' | 'love', playlistId?: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ratings')
        .upsert({
          version_id: versionId,
          user_id: user.id,
          playlist_id: playlistId,
          rating,
        })
        .select()
        .single();

      return { data, error };
    },

    async getByVersion(versionId: string) {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('version_id', versionId);

      return { data, error };
    },
  },

  // Comment operations
  comments: {
    async create(comment: {
      version_id: string;
      content: string;
      timestamp_seconds?: number;
      playlist_id?: string;
    }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          ...comment,
          user_id: user.id,
        })
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      return { data, error };
    },

    async getByVersion(versionId: string, playlistId?: string) {
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('version_id', versionId)
        .order('created_at', { ascending: false });

      if (playlistId) {
        query = query.eq('playlist_id', playlistId);
      }

      const { data, error } = await query;
      return { data, error };
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
  getPublicUrl(path: string) {
    const { data } = supabase.storage
      .from('audio-files')
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