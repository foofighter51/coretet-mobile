import { supabase } from '../../lib/supabase';
import { normalizePhoneNumber } from './phoneNumber';
import { ErrorHandler, ErrorInfo } from './errorMessages';
import UserAccessService, { AccessCheckResult } from './userAccessService';
import { AuthErrorHandler } from './authErrorHandler';

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
   * Sign up with email and password
   */
  async signUpWithPassword(email: string, password: string, skipAccessCheck = false): Promise<AuthResult> {
    try {
      // Check for offline mode
      if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
        console.log('🔧 Offline mode: Creating mock user');
        const mockUser: AuthUser = {
          id: `offline-${Date.now()}`,
          phoneNumber: '',
          email: email.trim(),
          name: undefined
        };
        return {
          success: true,
          user: mockUser,
          message: 'Offline mode: User created successfully'
        };
      }

      if (!email.trim() || !email.includes('@')) {
        return {
          success: false,
          error: ErrorHandler.phoneVerification.invalidFormat()
        };
      }

      if (!password || password.length < 6) {
        return {
          success: false,
          error: ErrorHandler.parseError('Password must be at least 6 characters', 'authentication')
        };
      }

      // Skip access check in development or when explicitly requested
      let accessCheck = { allowed: true, reason: 'dev_bypass' };

      if (!skipAccessCheck) {
        const accessService = UserAccessService.getInstance();
        accessCheck = await accessService.checkUserAccess(email.trim());

        if (!accessCheck.allowed) {
          return {
            success: false,
            message: accessCheck.message,
            accessCheck
          };
        }
      }

      console.log('👤 Creating account for:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('❌ Failed to create account:', AuthErrorHandler.getLogMessage(error));
        const authError = AuthErrorHandler.parseAuthError(error);
        return {
          success: false,
          error: AuthErrorHandler.toErrorInfo(authError),
          message: error.message
        };
      }

      if (data.user) {
        console.log('✅ Account created successfully');

        // Check if user was immediately signed in (rare) or needs email confirmation
        if (data.session) {
          console.log('🎉 User signed in immediately');
          const authUser = await this.convertToAuthUser(data.user);
          return {
            success: true,
            user: authUser,
            message: 'Account created successfully',
            accessCheck
          };
        } else {
          console.log('📧 User needs to confirm email');
          return {
            success: true,
            message: 'Account created! Please check your email for a confirmation link.',
            accessCheck
          };
        }
      }

      return {
        success: false,
        error: ErrorHandler.parseError('Unknown error during signup', 'authentication')
      };

    } catch (error) {
      console.error('❌ Signup error:', error);
      return {
        success: false,
        error: ErrorHandler.parseError(error, 'authentication')
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    try {
      // Check for offline mode
      if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
        console.log('🔧 Offline mode: Mock sign in');
        const mockUser: AuthUser = {
          id: `offline-${Date.now()}`,
          phoneNumber: '',
          email: email.trim(),
          name: 'Test User'
        };
        return {
          success: true,
          user: mockUser,
          message: 'Offline mode: Signed in successfully'
        };
      }

      if (!email.trim() || !email.includes('@')) {
        return {
          success: false,
          error: ErrorHandler.phoneVerification.invalidFormat()
        };
      }

      if (!password) {
        return {
          success: false,
          error: ErrorHandler.parseError('Password is required', 'authentication')
        };
      }

      console.log('🔐 Signing in:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('❌ Failed to sign in:', AuthErrorHandler.getLogMessage(error));
        const authError = AuthErrorHandler.parseAuthError(error);
        return {
          success: false,
          error: AuthErrorHandler.toErrorInfo(authError),
          message: error.message
        };
      }

      if (data.user) {
        console.log('✅ Signed in successfully');
        const authUser = await this.convertToAuthUser(data.user);
        return {
          success: true,
          user: authUser,
          message: 'Signed in successfully'
        };
      }

      return {
        success: false,
        error: ErrorHandler.parseError('Unknown error during signin', 'authentication')
      };

    } catch (error) {
      console.error('❌ Signin error:', error);
      return {
        success: false,
        error: ErrorHandler.parseError(error, 'authentication')
      };
    }
  }

  /**
   * Send verification code to email using Supabase Auth (legacy - keeping for compatibility)
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

      // Use retry mechanism for sending OTP
      // Note: Supabase sends magic links by default. To get OTP codes,
      // you need to configure email templates in Supabase Dashboard
      const { data, error } = await AuthErrorHandler.withRetry(
        () => supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true
          }
        }),
        { maxAttempts: 3 }
      );

      if (error) {
        console.error('❌ Failed to send verification code:', AuthErrorHandler.getLogMessage(error));
        const authError = AuthErrorHandler.parseAuthError(error);
        return {
          success: false,
          error: AuthErrorHandler.toErrorInfo(authError),
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
      console.error('❌ Error sending verification code:', AuthErrorHandler.getLogMessage(error));
      const authError = AuthErrorHandler.parseAuthError(error);
      return {
        success: false,
        error: AuthErrorHandler.toErrorInfo(authError)
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

      // OTP verification typically shouldn't be retried as codes expire quickly
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email'
      });

      if (error) {
        console.error('❌ Failed to verify code:', AuthErrorHandler.getLogMessage(error));
        const authError = AuthErrorHandler.parseAuthError(error);
        return {
          success: false,
          error: AuthErrorHandler.toErrorInfo(authError),
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
      console.error('❌ Error verifying code:', AuthErrorHandler.getLogMessage(error));
      const authError = AuthErrorHandler.parseAuthError(error);
      return {
        success: false,
        error: AuthErrorHandler.toErrorInfo(authError)
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
   * Convert Supabase user to AuthUser
   */
  private async convertToAuthUser(supabaseUser: any): Promise<AuthUser> {
    // For email/password signups, skip profile lookup during auth to avoid RLS issues
    // Profile will be created later during onboarding
    const authUser: AuthUser = {
      id: supabaseUser.id,
      phoneNumber: supabaseUser.phone || '',
      email: supabaseUser.email || '',
      name: undefined // Will be set during onboarding
    };

    return authUser;
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
      // Check for offline mode
      if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
        console.log('🔧 Offline mode: Mock profile update');
        const mockUser: AuthUser = {
          id: `offline-${Date.now()}`,
          phoneNumber: '',
          email: 'test@offline.com',
          name: name.trim()
        };
        return {
          success: true,
          user: mockUser,
          message: 'Offline mode: Profile updated successfully'
        };
      }

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
          phone_number: user.phone || user.email || '', // Use email as fallback since phone_number is required
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
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<AuthResult> {
    try {
      if (!email.trim() || !email.includes('@')) {
        return {
          success: false,
          error: ErrorHandler.phoneVerification.invalidFormat()
        };
      }

      console.log('📧 Sending password reset email to:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}?type=recovery`
      });

      if (error) {
        console.error('❌ Failed to send password reset email:', AuthErrorHandler.getLogMessage(error));
        const authError = AuthErrorHandler.parseAuthError(error);
        return {
          success: false,
          error: AuthErrorHandler.toErrorInfo(authError),
          message: error.message
        };
      }

      console.log('✅ Password reset email sent successfully');

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending password reset email:', AuthErrorHandler.getLogMessage(error));
      const authError = AuthErrorHandler.parseAuthError(error);
      return {
        success: false,
        error: AuthErrorHandler.toErrorInfo(authError)
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
        console.log('🔧 Creating auth user without profile lookup (temporary fix)');

        // Skip profile lookup for now to avoid RLS issues
        // Profile name will be set during onboarding
        const authUser: AuthUser = {
          id: session.user.id,
          phoneNumber: session.user.phone || '', // Keep for future SMS implementation
          email: session.user.email || '',
          name: undefined // Will be set during onboarding
        };

        console.log('🔧 Calling callback with authUser:', authUser);
        callback(authUser);
      } else {
        console.log('🔧 No session user, calling callback with null');
        callback(null);
      }
    });
  }
}

export default SupabaseAuthService;