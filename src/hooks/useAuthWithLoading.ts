import { useCallback } from 'react';
import { useAsyncState } from './useAsyncState';
import { useAuth } from '../contexts/AuthContext';
import SupabaseAuthService, { AuthResult } from '../utils/supabaseAuthService';

export interface AuthLoadingState {
  sendingCode: boolean;
  verifyingCode: boolean;
  updatingProfile: boolean;
  signingOut: boolean;
  error: string | null;
  progress?: number;
  message?: string;
}

export function useAuthWithLoading() {
  const { user, login, logout, updateProfile } = useAuth();

  const [sendCodeState, sendCodeActions] = useAsyncState<AuthResult>();
  const [verifyCodeState, verifyCodeActions] = useAsyncState<AuthResult>();
  const [updateProfileState, updateProfileActions] = useAsyncState<AuthResult>();
  const [signOutState, signOutActions] = useAsyncState<void>();

  const authService = SupabaseAuthService.getInstance();

  const sendVerificationCode = useCallback(async (email: string): Promise<AuthResult | null> => {
    return await sendCodeActions.execute(async () => {
      sendCodeActions.setProgress(10, 'Validating email...');

      // Add small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 300));

      sendCodeActions.setProgress(50, 'Sending verification code...');

      const result = await authService.sendVerificationCode(email);

      sendCodeActions.setProgress(100, 'Code sent successfully!');

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to send verification code');
      }

      return result;
    });
  }, [sendCodeActions, authService]);

  const verifyCode = useCallback(async (email: string, code: string): Promise<AuthResult | null> => {
    return await verifyCodeActions.execute(async () => {
      verifyCodeActions.setProgress(10, 'Validating code...');

      await new Promise(resolve => setTimeout(resolve, 200));

      verifyCodeActions.setProgress(50, 'Verifying with server...');

      const result = await authService.verifyCode(email, code);

      if (!result.success) {
        throw new Error(result.error?.message || 'Code verification failed');
      }

      verifyCodeActions.setProgress(80, 'Setting up session...');

      // Update auth context
      if (result.user) {
        await login(result.user);
      }

      verifyCodeActions.setProgress(100, 'Login successful!');

      return result;
    });
  }, [verifyCodeActions, authService, login]);

  const updateUserProfile = useCallback(async (name: string): Promise<AuthResult | null> => {
    return await updateProfileActions.execute(async () => {
      updateProfileActions.setProgress(20, 'Validating profile data...');

      await new Promise(resolve => setTimeout(resolve, 200));

      updateProfileActions.setProgress(60, 'Updating profile...');

      const result = await authService.updateUserProfile(name);

      if (!result.success) {
        throw new Error(result.error?.message || 'Profile update failed');
      }

      updateProfileActions.setProgress(90, 'Refreshing session...');

      // Update auth context
      if (result.user) {
        await updateProfile(result.user);
      }

      updateProfileActions.setProgress(100, 'Profile updated!');

      return result;
    });
  }, [updateProfileActions, authService, updateProfile]);

  const signOut = useCallback(async (): Promise<void> => {
    await signOutActions.execute(async () => {
      signOutActions.setProgress(30, 'Signing out...');

      await authService.signOut();

      signOutActions.setProgress(70, 'Clearing session...');

      await logout();

      signOutActions.setProgress(100, 'Signed out successfully');
    });
  }, [signOutActions, authService, logout]);

  const resetAuthState = useCallback(() => {
    sendCodeActions.reset();
    verifyCodeActions.reset();
    updateProfileActions.reset();
    signOutActions.reset();
  }, [sendCodeActions, verifyCodeActions, updateProfileActions, signOutActions]);

  const loadingState: AuthLoadingState = {
    sendingCode: sendCodeState.isLoading,
    verifyingCode: verifyCodeState.isLoading,
    updatingProfile: updateProfileState.isLoading,
    signingOut: signOutState.isLoading,
    error: sendCodeState.error || verifyCodeState.error || updateProfileState.error || signOutState.error,
    progress: sendCodeState.progress || verifyCodeState.progress || updateProfileState.progress || signOutState.progress,
    message: sendCodeState.message || verifyCodeState.message || updateProfileState.message || signOutState.message
  };

  const isAnyLoading = loadingState.sendingCode || loadingState.verifyingCode ||
                     loadingState.updatingProfile || loadingState.signingOut;

  return {
    user,
    loadingState,
    isLoading: isAnyLoading,
    sendVerificationCode,
    verifyCode,
    updateUserProfile,
    signOut,
    resetAuthState,

    // Individual states for granular control
    sendCodeState,
    verifyCodeState,
    updateProfileState,
    signOutState
  };
}

export default useAuthWithLoading;