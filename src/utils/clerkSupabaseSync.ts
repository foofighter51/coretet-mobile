import { supabase } from '../../lib/supabase';
import type { User } from '@clerk/clerk-react';

export class ClerkSupabaseSync {
  /**
   * Use Clerk user ID directly as Supabase profile ID
   * No need to generate UUIDs - Clerk IDs are already unique and secure
   */
  static generateUUIDFromClerkId(clerkId: string): string {
    // Simply return the Clerk ID - it's already a unique identifier
    // This is secure and eliminates collision risk from hash-based UUIDs
    return clerkId;
  }

  /**
   * Sync user profile directly to Supabase (RLS disabled temporarily)
   */
  static async syncUserProfileDirect(
    clerkUser: User
  ): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
    supabaseUserId?: string;
  }> {
    try {
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      const phoneNumber = clerkUser.primaryPhoneNumber?.phoneNumber || '';
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const supabaseUuid = this.generateUUIDFromClerkId(clerkUser.id);

      console.log('Creating profile directly:', {
        clerkId: clerkUser.id,
        supabaseUuid,
        name,
        phone: phoneNumber || email,
      });

      // Check if profile exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUuid)
        .single();

      if (existing) {
        console.log('Profile already exists, updating...');
        const { data, error } = await supabase
          .from('profiles')
          .update({
            name: name || 'User',
            phone_number: phoneNumber || email || 'no-phone',
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseUuid)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          return { success: false, error: error.message };
        }

        return { success: true, profile: data, supabaseUserId: supabaseUuid };
      }

      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUuid,
          name: name || 'User',
          phone_number: phoneNumber || email || 'no-phone',
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, profile: data, supabaseUserId: supabaseUuid };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync Clerk user to Supabase via Edge Function
   * Edge Function validates Clerk token and uses service role key
   */
  static async syncUserProfile(
    clerkUser: User,
    sessionToken: string
  ): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
    supabaseUserId?: string;
  }> {
    try {
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      const phoneNumber = clerkUser.primaryPhoneNumber?.phoneNumber || '';
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';

      console.log('🔄 Calling create-profile Edge Function for:', clerkUser.id);

      // Call Edge Function (server-side validates Clerk token)
      // Note: We send Clerk token in custom header because Supabase validates Authorization header
      const { data, error } = await supabase.functions.invoke('create-profile', {
        body: {
          name: name || 'User',
          phone_number: phoneNumber || email || 'no-phone',
        },
        headers: {
          'x-clerk-token': sessionToken,
        },
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        console.error('❌ Response data:', data);
        return {
          success: false,
          error: error.message || JSON.stringify(error),
        };
      }

      if (data && !data.success) {
        console.error('❌ Edge Function returned error:', data.error);
        return {
          success: false,
          error: data.error,
        };
      }

      console.log('✅ Profile created via Edge Function');
      return {
        success: true,
        profile: data.profile,
        supabaseUserId: data.supabaseUserId,
      };
    } catch (error) {
      console.error('❌ Error calling Edge Function:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get or create user profile in Supabase
   */
  static async getOrCreateProfile(clerkUser: User) {
    // First try to get existing profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clerkUser.id)
      .single();

    if (existingProfile) {
      return { success: true, profile: existingProfile };
    }

    // If not found, create it
    return await this.syncUserProfile(clerkUser);
  }

  /**
   * Ensure user has a valid Supabase session for database operations
   * Note: This is for future use if we need to authenticate Supabase with Clerk tokens
   */
  static async ensureSupabaseSession(clerkUser: User) {
    // For now, we'll use Supabase's anon key for database operations
    // In production, you might want to create a custom JWT from Clerk
    // and use it to authenticate with Supabase

    // This is a placeholder for future implementation
    console.log('📋 Using Supabase anon key for database operations');

    return {
      success: true,
      message: 'Using anon key authentication'
    };
  }
}