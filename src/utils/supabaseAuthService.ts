import { supabase } from '../../lib/supabase';
import { normalizePhoneNumber } from './phoneNumber';
import { ErrorHandler, ErrorInfo } from './errorMessages';
import UserAccessService, { AccessCheckResult } from './userAccessService';

export interface AuthUser {
  id: string;
  phoneNumber: string; // Keep for future SMS implementation
  email: string;
  name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: ErrorInfo;
  message?: string;
  accessCheck?: AccessCheckResult;
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;

  private constructor() {}

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  /**
   * Send verification code to email using Supabase Auth
   * TODO: Switch back to SMS when Twilio is configured
   */
  async sendVerificationCode(email: string): Promise<AuthResult> {
    try {
      // Check for placeholder credentials - return mock success for development
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl?.includes('placeholder')) {
        console.log('🔧 Development mode: Using placeholder Supabase credentials');
        console.log('📧 Mock verification code: 123456');
        console.log('💡 Enter any 6-digit code to continue');
        return {
          success: true,
          message: 'Development mode: Use code 123456 to continue',
          accessCheck: { allowed: true, reason: 'open_testing' }
        };
      }

      if (!email.trim() || !email.includes('@')) {
        return {
          success: false,
          error: ErrorHandler.phoneVerification.invalidFormat()
        };
      }

      // Check user access before sending verification code
      const accessService = UserAccessService.getInstance();
      const accessCheck = await accessService.checkUserAccess(email.trim());

      console.log('🔐 Access check result:', accessCheck);

      // If user doesn't have access, return the access check result
      if (!accessCheck.allowed) {
        return {
          success: false,
          message: accessCheck.message,
          accessCheck
        };
      }

      console.log('📧 Sending verification code to:', email);

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        console.error('❌ Failed to send verification code:', error);
        return {
          success: false,
          error: ErrorHandler.parseError(error.message, 'phoneVerification'),
          message: error.message
        };
      }

      console.log('✅ Verification code sent successfully');

      return {
        success: true,
        message: 'Verification code sent to your email',
        accessCheck
      };

    } catch (error) {
      console.error('❌ Error sending verification code:', error);
      return {
        success: false,
        error: ErrorHandler.parseError(error, 'phoneVerification')
      };
    }
  }

  /**
   * Verify the OTP code for email
   * TODO: Switch back to SMS when Twilio is configured
   */
  async verifyCode(email: string, code: string): Promise<AuthResult> {
    try {
      // Check for placeholder credentials - return mock success for development
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl?.includes('placeholder')) {
        console.log('🔧 Development mode: Mock user verification');
        const mockUser: AuthUser = {
          id: 'dev-user-123',
          phoneNumber: '',
          email: email,
          name: undefined
        };
        return {
          success: true,
          user: mockUser,
          message: 'Development mode: Code verified successfully'
        };
      }

      if (!email.trim() || !email.includes('@')) {
        return {
          success: false,
          error: ErrorHandler.phoneVerification.invalidFormat()
        };
      }

      if (!code.trim()) {
        return {
          success: false,
          error: ErrorHandler.codeVerification.emptyCode()
        };
      }

      console.log('🔐 Verifying code for:', email);

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email'
      });

      if (error) {
        console.error('❌ Failed to verify code:', error);
        return {
          success: false,
          error: ErrorHandler.parseError(error.message, 'codeVerification'),
          message: error.message
        };
      }

      if (data.user) {
        console.log('✅ Code verified successfully');

        // Check if user has a profile
        const userProfile = await this.getUserProfile(data.user.id);

        const authUser: AuthUser = {
          id: data.user.id,
          phoneNumber: '', // Keep empty for now, will be populated when we switch to SMS
          email: data.user.email || email,
          name: userProfile?.name
        };

        return {
          success: true,
          user: authUser,
          message: 'Code verified successfully'
        };
      }

      return {
        success: false,
        error: ErrorHandler.codeVerification.invalidCode()
      };

    } catch (error) {
      console.error('❌ Error verifying code:', error);
      return {
        success: false,
        error: ErrorHandler.parseError(error, 'codeVerification')
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      const userProfile = await this.getUserProfile(user.id);

      return {
        id: user.id,
        phoneNumber: user.phone || '', // Keep for future SMS implementation
        email: user.email || '',
        name: userProfile?.name
      };

    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile from profiles table
   */
  private async getUserProfile(userId: string): Promise<{ name?: string } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile (name)
   */
  async updateUserProfile(name: string): Promise<AuthResult> {
    try {
      // Check for placeholder credentials - return mock success for development
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl?.includes('placeholder')) {
        console.log('🔧 Development mode: Mock profile update');
        const mockUser: AuthUser = {
          id: 'dev-user-123',
          phoneNumber: '',
          email: 'dev@example.com',
          name: name.trim()
        };
        return {
          success: true,
          user: mockUser,
          message: 'Development mode: Profile updated successfully'
        };
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: ErrorHandler.onboarding.saveFailed()
        };
      }

      // Upsert user profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          phone_number: user.phone,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to update user profile:', error);
        return {
          success: false,
          error: ErrorHandler.onboarding.saveFailed(),
          message: error.message
        };
      }

      console.log('✅ User profile updated successfully');

      const authUser: AuthUser = {
        id: user.id,
        phoneNumber: user.phone || '',
        name: name.trim(),
        email: user.email
      };

      return {
        success: true,
        user: authUser,
        message: 'Profile updated successfully'
      };

    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return {
        success: false,
        error: ErrorHandler.parseError(error, 'onboarding')
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
      } else {
        console.log('👋 User signed out successfully');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);

      if (session?.user) {
        const userProfile = await this.getUserProfile(session.user.id);

        const authUser: AuthUser = {
          id: session.user.id,
          phoneNumber: session.user.phone || '', // Keep for future SMS implementation
          email: session.user.email || '',
          name: userProfile?.name
        };

        callback(authUser);
      } else {
        callback(null);
      }
    });
  }
}

export default SupabaseAuthService;