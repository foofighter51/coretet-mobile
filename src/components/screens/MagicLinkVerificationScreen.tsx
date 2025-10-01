import React, { useEffect, useState } from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';
import SupabaseAuthService from '../../utils/supabaseAuthService';
import { supabase } from '../../../lib/supabase';

interface MagicLinkVerificationScreenProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  isEmailConfirmation?: boolean;
}

export const MagicLinkVerificationScreen: React.FC<MagicLinkVerificationScreenProps> = ({
  email,
  onSuccess,
  onBack,
  isEmailConfirmation = false
}) => {
  const { login } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for authentication session (Supabase will handle magic link automatically)
  useEffect(() => {
    const checkAuthSession = async () => {
      console.log('🔗 Checking for auth session...');

      // Check if user is already authenticated
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Session check error:', error);
        setError('Failed to check authentication status');
        return;
      }

      if (session?.user) {
        console.log('✅ User is authenticated:', session.user.email);
        setIsChecking(true);

        try {
          // User is authenticated via magic link
          await login({
            id: session.user.id,
            email: session.user.email || '',
            phoneNumber: '',
            name: session.user.user_metadata?.name
          });
          onSuccess();
        } catch (err) {
          console.error('❌ Login failed:', err);
          setError('Failed to complete authentication');
        } finally {
          setIsChecking(false);
        }
      } else {
        console.log('ℹ️  No authenticated session found');
      }
    };

    // Check immediately
    checkAuthSession();

    // Note: Removed duplicate auth listener to avoid conflicts with AuthContext
    // AuthContext will handle auth state changes and navigation

    return () => {
      // No subscription to clean up
    };
  }, [login, onSuccess]);

  const resendEmail = async () => {
    setError(null);
    try {
      const authService = SupabaseAuthService.getInstance();
      await authService.sendVerificationCode(email);
    } catch (err) {
      setError('Failed to resend email');
    }
  };

  if (isChecking) {
    return (
      <div style={{
        padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: designTokens.typography.fontSizes.h3,
          color: designTokens.colors.neutral.charcoal,
          marginBottom: designTokens.spacing.lg
        }}>
          Verifying...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: designTokens.colors.neutral.white
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          padding: designTokens.spacing.sm,
          fontSize: designTokens.typography.fontSizes.h3,
          cursor: 'pointer',
          alignSelf: 'flex-start',
          marginBottom: designTokens.spacing.lg
        }}
      >
        ←
      </button>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: designTokens.typography.fontWeights.normal,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.lg} 0`,
          color: designTokens.colors.neutral.charcoal,
          lineHeight: '1.3'
        }}>
          Check your email
        </h1>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.lg} 0`,
          lineHeight: '1.5'
        }}>
          We sent a {isEmailConfirmation ? 'confirmation' : 'verification'} link to{'\n'}
          <strong>{email}</strong>
        </p>

        <p style={{
          fontSize: designTokens.typography.fontSizes.small,
          color: designTokens.colors.neutral.gray,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.xl} 0`,
          lineHeight: '1.5'
        }}>
          {isEmailConfirmation
            ? 'Click the confirmation link in the email, then return here to sign in with your password.'
            : 'Click the "Confirm your mail" link in the email to continue.'
          }
        </p>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: designTokens.spacing.md,
            borderRadius: '8px',
            marginBottom: designTokens.spacing.lg,
            textAlign: 'center',
            fontSize: designTokens.typography.fontSizes.small
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
          <button
            onClick={resendEmail}
            style={{
              background: 'none',
              border: `1px solid ${designTokens.colors.primary.blue}`,
              color: designTokens.colors.primary.blue,
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              borderRadius: '28px',
              fontSize: designTokens.typography.fontSizes.body,
              cursor: 'pointer'
            }}
          >
            Resend email
          </button>

          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: designTokens.colors.neutral.gray,
              padding: designTokens.spacing.md,
              fontSize: designTokens.typography.fontSizes.small,
              cursor: 'pointer'
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkVerificationScreen;