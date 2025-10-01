import React, { useState, useEffect } from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { ErrorHandler } from '../../utils/errorMessages';

interface PasswordResetScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({
  onBack,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null);

  const { setCurrentError, login } = useAuth();

  // Check for password reset token on mount
  useEffect(() => {
    const checkForResetToken = async () => {
      try {
        // Check if there's a valid session from the reset link
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Session check error:', error);
          setHasValidToken(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Valid reset session found');
          setHasValidToken(true);
        } else {
          console.log('❌ No valid reset session');
          setHasValidToken(false);
        }
      } catch (err) {
        console.error('❌ Error checking reset token:', err);
        setHasValidToken(false);
      }
    };

    checkForResetToken();
  }, []);

  const handlePasswordReset = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Updating password...');

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('❌ Password update failed:', updateError);
        setError(updateError.message);
        return;
      }

      console.log('✅ Password updated successfully');

      // Get the current user after password update
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ Failed to get user after password update:', userError);
        setError('Failed to complete password reset');
        return;
      }

      // Log the user in
      await login({
        id: user.id,
        email: user.email || '',
        phoneNumber: user.phone || '',
        name: user.user_metadata?.name
      });

      onSuccess();

    } catch (err) {
      console.error('❌ Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (hasValidToken === null) {
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
          Checking reset link...
        </div>
      </div>
    );
  }

  if (!hasValidToken) {
    return (
      <div style={{
        padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: designTokens.colors.neutral.white
      }}>
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

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: designTokens.typography.fontWeights.normal,
            textAlign: 'center',
            margin: `0 0 ${designTokens.spacing.lg} 0`,
            color: designTokens.colors.neutral.charcoal,
            lineHeight: '1.3'
          }}>
            Reset Link Expired
          </h1>

          <p style={{
            fontSize: designTokens.typography.fontSizes.body,
            color: designTokens.colors.neutral.darkGray,
            textAlign: 'center',
            margin: `0 0 ${designTokens.spacing.xl} 0`,
            lineHeight: '1.5'
          }}>
            The password reset link has expired or is invalid. Please request a new one.
          </p>

          <button
            onClick={onBack}
            style={{
              backgroundColor: designTokens.colors.primary.blue,
              color: designTokens.colors.neutral.white,
              border: 'none',
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              borderRadius: '28px',
              fontSize: designTokens.typography.fontSizes.body,
              cursor: 'pointer',
              fontWeight: designTokens.typography.fontWeights.medium
            }}
          >
            Back to Sign In
          </button>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: designTokens.typography.fontWeights.normal,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.lg} 0`,
          color: designTokens.colors.neutral.charcoal,
          lineHeight: '1.3'
        }}>
          Reset Your Password
        </h1>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.xl} 0`,
          lineHeight: '1.5'
        }}>
          Enter your new password below
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
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              fontSize: designTokens.typography.fontSizes.body,
              border: `1px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '28px',
              outline: 'none',
              backgroundColor: designTokens.colors.neutral.white
            }}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              fontSize: designTokens.typography.fontSizes.body,
              border: `1px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '28px',
              outline: 'none',
              backgroundColor: designTokens.colors.neutral.white
            }}
          />

          <button
            onClick={handlePasswordReset}
            disabled={isLoading || !password || !confirmPassword}
            style={{
              backgroundColor: isLoading ? designTokens.colors.neutral.lightGray : designTokens.colors.primary.blue,
              color: designTokens.colors.neutral.white,
              border: 'none',
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              borderRadius: '28px',
              fontSize: designTokens.typography.fontSizes.body,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: designTokens.typography.fontWeights.medium,
              marginTop: designTokens.spacing.lg
            }}
          >
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetScreen;