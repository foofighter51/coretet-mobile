import { supabase } from '../../lib/supabase';

export type AccessLevel = 'blocked' | 'waitlist' | 'invited' | 'active';
export type AccessMode = 'open_testing' | 'waitlist_beta';

export interface UserAccessControl {
  id: string;
  email: string;
  access_level: AccessLevel;
  invited_by?: string;
  invited_at?: string;
  waitlist_position?: number;
  waitlist_joined_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason: 'open_testing' | 'invited' | 'waitlist' | 'blocked';
  message?: string;
  waitlist_position?: number;
  user_access?: UserAccessControl;
}

export interface AppSettings {
  access_mode: AccessMode;
  beta_batch_size: number;
}

export class UserAccessService {
  private static instance: UserAccessService;

  private constructor() {}

  static getInstance(): UserAccessService {
    if (!UserAccessService.instance) {
      UserAccessService.instance = new UserAccessService();
    }
    return UserAccessService.instance;
  }

  /**
   * Check if a user has access to sign up
   */
  async checkUserAccess(email: string): Promise<AccessCheckResult> {
    try {
      // Check for placeholder credentials - return open testing for development
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl?.includes('placeholder')) {
        console.log('🔧 Development mode: Defaulting to open testing');
        return {
          allowed: true,
          reason: 'open_testing',
          message: 'Development mode - immediate access'
        };
      }

      const settings = await this.getAppSettings();

      // Open testing mode - anyone can sign up
      if (settings.access_mode === 'open_testing') {
        return {
          allowed: true,
          reason: 'open_testing',
          message: 'Open testing - immediate access'
        };
      }

      // Waitlist beta mode - check user access control
      const userAccess = await this.getUserAccessControl(email);

      if (!userAccess) {
        // New user - add to waitlist
        const newUserAccess = await this.addToWaitlist(email);
        return {
          allowed: false,
          reason: 'waitlist',
          message: `Added to waitlist. You are #${newUserAccess.waitlist_position} in line.`,
          waitlist_position: newUserAccess.waitlist_position,
          user_access: newUserAccess
        };
      }

      switch (userAccess.access_level) {
        case 'invited':
        case 'active':
          return {
            allowed: true,
            reason: 'invited',
            message: 'You have been invited to CoreTet!',
            user_access: userAccess
          };

        case 'waitlist':
          return {
            allowed: false,
            reason: 'waitlist',
            message: `You are #${userAccess.waitlist_position} on the waitlist. We will notify you when it is your turn!`,
            waitlist_position: userAccess.waitlist_position,
            user_access: userAccess
          };

        case 'blocked':
          return {
            allowed: false,
            reason: 'blocked',
            message: 'Access is currently restricted for this email.',
            user_access: userAccess
          };

        default:
          return {
            allowed: false,
            reason: 'blocked',
            message: 'Unknown access level.',
            user_access: userAccess
          };
      }

    } catch (error) {
      console.error('❌ Error checking user access:', error);
      // Fail open in case of errors - allow access
      return {
        allowed: true,
        reason: 'open_testing',
        message: 'Error checking access - allowing signup'
      };
    }
  }

  /**
   * Get app settings
   */
  private async getAppSettings(): Promise<AppSettings> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['access_mode', 'beta_batch_size']);

    if (error) {
      console.error('❌ Error fetching app settings:', error);
      // Default to open testing if can't fetch settings
      return {
        access_mode: 'open_testing',
        beta_batch_size: 50
      };
    }

    const settings: Partial<AppSettings> = {};

    data?.forEach(setting => {
      if (setting.setting_key === 'access_mode') {
        settings.access_mode = setting.setting_value.mode;
      } else if (setting.setting_key === 'beta_batch_size') {
        settings.beta_batch_size = setting.setting_value.size;
      }
    });

    return {
      access_mode: settings.access_mode || 'open_testing',
      beta_batch_size: settings.beta_batch_size || 50
    };
  }

  /**
   * Get user access control record
   */
  private async getUserAccessControl(email: string): Promise<UserAccessControl | null> {
    const { data, error } = await supabase
      .from('user_access_control')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching user access control:', error);
      return null;
    }

    return data;
  }

  /**
   * Add user to waitlist
   */
  private async addToWaitlist(email: string): Promise<UserAccessControl> {
    // Get current waitlist position (highest position + 1)
    const { data: positionData } = await supabase
      .from('user_access_control')
      .select('waitlist_position')
      .eq('access_level', 'waitlist')
      .order('waitlist_position', { ascending: false })
      .limit(1);

    const nextPosition = (positionData?.[0]?.waitlist_position || 0) + 1;

    const { data, error } = await supabase
      .from('user_access_control')
      .insert({
        email: email.toLowerCase().trim(),
        access_level: 'waitlist',
        waitlist_position: nextPosition,
        waitlist_joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding user to waitlist:', error);
      throw error;
    }

    console.log(`📝 Added ${email} to waitlist at position ${nextPosition}`);
    return data;
  }

  /**
   * Mark user as active (after successful signup)
   */
  async markUserActive(email: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_access_control')
        .update({
          access_level: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase().trim());

      if (error) {
        console.error('❌ Error marking user as active:', error);
      } else {
        console.log(`✅ Marked ${email} as active user`);
      }
    } catch (error) {
      console.error('❌ Error marking user as active:', error);
    }
  }

  /**
   * Admin functions for user management
   */

  /**
   * Get waitlist users (admin only)
   */
  async getWaitlistUsers(): Promise<UserAccessControl[]> {
    const { data, error } = await supabase
      .from('user_access_control')
      .select('*')
      .eq('access_level', 'waitlist')
      .order('waitlist_position', { ascending: true });

    if (error) {
      console.error('❌ Error fetching waitlist users:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Invite users from waitlist (admin only)
   */
  async inviteUsersFromWaitlist(count: number): Promise<UserAccessControl[]> {
    // Get users from waitlist to invite
    const { data: usersToInvite, error: fetchError } = await supabase
      .from('user_access_control')
      .select('*')
      .eq('access_level', 'waitlist')
      .order('waitlist_position', { ascending: true })
      .limit(count);

    if (fetchError) {
      console.error('❌ Error fetching users to invite:', fetchError);
      return [];
    }

    if (!usersToInvite || usersToInvite.length === 0) {
      console.log('📝 No users on waitlist to invite');
      return [];
    }

    // Update their status to invited
    const userIds = usersToInvite.map(user => user.id);
    const { data: invitedUsers, error: updateError } = await supabase
      .from('user_access_control')
      .update({
        access_level: 'invited',
        invited_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select();

    if (updateError) {
      console.error('❌ Error inviting users:', updateError);
      return [];
    }

    console.log(`✅ Invited ${invitedUsers?.length || 0} users from waitlist`);
    return invitedUsers || [];
  }

  /**
   * Update app access mode (admin only)
   */
  async updateAccessMode(mode: AccessMode): Promise<void> {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: 'access_mode',
        setting_value: { mode, description: mode === 'open_testing' ? 'Anyone can sign up' : 'Invitation only' },
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error updating access mode:', error);
      throw error;
    }

    console.log(`✅ Updated access mode to: ${mode}`);
  }

  /**
   * Check if user is admin
   */
  async isAdmin(email: string): Promise<boolean> {
    // For now, check against environment variable
    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
    return adminEmails.includes(email.toLowerCase().trim());
  }
}

export default UserAccessService;