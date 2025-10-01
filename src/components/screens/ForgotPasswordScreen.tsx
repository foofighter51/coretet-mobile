import React, { useState } from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBack }) => {
  const {
    email,
    setEmail,
    sendPasswordReset,
    authLoading,
    currentError,
    setCurrentError,
    currentScreen
  } = useAuth();

  const [emailSent, setEmailSent] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      setCurrentError({ message: 'Please enter your email address', category: 'authentication' });
      return;
    }

    await sendPasswordReset();

    // Check if we're now on verify screen (success) or still here (error)
    if (currentScreen === 'verify') {
      setEmailSent(true);
    }
  };

  const handleBackToSignIn = () => {
    setEmailSent(false);
    setCurrentError(null);
    onBack();
  };

  if (emailSent || currentScreen === 'verify') {
    return (
      <div style={{
        padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: designTokens.colors.neutral.white
      }}>
        <button
          onClick={handleBackToSignIn}
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
          <div style={{
            textAlign: 'center',
            fontSize: '48px',
            marginBottom: designTokens.spacing.lg
          }}>
            📧
          </div>

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
            We sent a password reset link to:
            <br />
            <strong>{email}</strong>
          </p>

          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '12px',
            padding: designTokens.spacing.lg,
            marginBottom: designTokens.spacing.xl
          }}>
            <h3 style={{
              margin: `0 0 ${designTokens.spacing.md} 0`,
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              color: '#0369a1'
            }}>
              What to do next:
            </h3>
            <ol style={{
              margin: 0,
              paddingLeft: designTokens.spacing.lg,
              fontSize: designTokens.typography.fontSizes.small,
              color: '#0369a1',
              lineHeight: '1.6'
            }}>
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the "Reset Password" link in the email</li>
              <li>You'll be brought back here to set your new password</li>
              <li>Sign in with your new password</li>
            </ol>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
            <button
              onClick={() => sendPasswordReset()}
              disabled={authLoading}
              style={{
                backgroundColor: 'transparent',
                color: designTokens.colors.primary.blue,
                border: `1px solid ${designTokens.colors.primary.blue}`,
                borderRadius: '28px',
                padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                fontSize: designTokens.typography.fontSizes.body,
                cursor: authLoading ? 'not-allowed' : 'pointer',
                fontWeight: designTokens.typography.fontWeights.medium,
                opacity: authLoading ? 0.6 : 1
              }}
            >
              {authLoading ? 'Sending...' : 'Resend email'}
            </button>

            <button
              onClick={handleBackToSignIn}
              style={{
                backgroundColor: 'transparent',
                color: designTokens.colors.neutral.gray,
                border: 'none',
                padding: designTokens.spacing.md,
                fontSize: designTokens.typography.fontSizes.small,
                cursor: 'pointer'
              }}
            >
              Back to sign in
            </button>
          </div>
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
        onClick={handleBackToSignIn}
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
          Reset your password
        </h1>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.xl} 0`,
          lineHeight: '1.5'
        }}>
          Enter your email and we'll send you a link to reset your password
        </p>

        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.small,
            color: designTokens.colors.neutral.darkGray,
            marginBottom: designTokens.spacing.xs,
            fontWeight: designTokens.typography.fontWeights.medium
          }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setCurrentError(null);
            }}
            placeholder="your@email.com"
            autoComplete="email"
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              borderRadius: '12px',
              border: `1px solid ${currentError ? '#dc2626' : designTokens.colors.neutral.lightGray}`,
              fontSize: designTokens.typography.fontSizes.body,
              boxSizing: 'border-box',
              outline: 'none'
            }}
            onFocus={(e) => {
              if (!currentError) {
                e.target.style.borderColor = designTokens.colors.primary.blue;
              }
            }}
            onBlur={(e) => {
              if (!currentError) {
                e.target.style.borderColor = designTokens.colors.neutral.lightGray;
              }
            }}
          />
        </div>

        {currentError && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: designTokens.spacing.md,
            borderRadius: '8px',
            marginBottom: designTokens.spacing.lg,
            textAlign: 'center',
            fontSize: designTokens.typography.fontSizes.small
          }}>
            {currentError.message}
          </div>
        )}

        <button
          onClick={handleSendReset}
          disabled={authLoading || !email.trim()}
          style={{
            width: '100%',
            backgroundColor: authLoading || !email.trim() ? designTokens.colors.neutral.lightGray : designTokens.colors.primary.blue,
            color: designTokens.colors.neutral.white,
            border: 'none',
            borderRadius: '28px',
            padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.medium,
            cursor: authLoading || !email.trim() ? 'not-allowed' : 'pointer',
            marginBottom: designTokens.spacing.lg
          }}
        >
          {authLoading ? 'Sending reset link...' : 'Send reset link'}
        </button>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: designTokens.spacing.lg
        }}>
          <h3 style={{
            margin: `0 0 ${designTokens.spacing.sm} 0`,
            fontSize: designTokens.typography.fontSizes.small,
            fontWeight: designTokens.typography.fontWeights.medium,
            color: designTokens.colors.neutral.charcoal
          }}>
            Don't have an account?
          </h3>
          <p style={{
            margin: `0 0 ${designTokens.spacing.md} 0`,
            fontSize: designTokens.typography.fontSizes.small,
            color: designTokens.colors.neutral.darkGray,
            lineHeight: '1.5'
          }}>
            If you don't have a CoreTet account yet, go back and create one instead.
          </p>
          <button
            onClick={handleBackToSignIn}
            style={{
              backgroundColor: 'transparent',
              color: designTokens.colors.primary.blue,
              border: 'none',
              padding: 0,
              fontSize: designTokens.typography.fontSizes.small,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Back to sign in / sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;