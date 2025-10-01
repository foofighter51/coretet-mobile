import React, { useState } from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';

export const EmailPasswordScreen: React.FC = () => {
  const {
    email,
    password,
    setEmail,
    setPassword,
    signUp,
    signIn,
    devSignUp,
    authLoading,
    currentError,
    setCurrentError,
    setCurrentScreen
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    setCurrentError(null);
    if (isSignUp) {
      await signUp();
    } else {
      await signIn();
    }
  };

  const toggleMode = () => {
    setCurrentError(null);
    setIsSignUp(!isSignUp);
  };

  return (
    <div style={{
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: designTokens.colors.neutral.white
    }}>
      {/* Header */}
      <div style={{ marginBottom: designTokens.spacing.xl }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: designTokens.typography.fontWeights.normal,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.md} 0`,
          color: designTokens.colors.neutral.charcoal,
          lineHeight: '1.3'
        }}>
          {isSignUp ? 'Create Account' : 'Welcome back'}
        </h1>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: '0',
          lineHeight: '1.5'
        }}>
          {isSignUp ? 'Join CoreTet to start collaborating' : 'Sign in to continue'}
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.small,
            color: designTokens.colors.neutral.darkGray,
            marginBottom: designTokens.spacing.xs,
            fontWeight: designTokens.typography.fontWeights.medium
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              borderRadius: '12px',
              border: `1px solid ${designTokens.colors.neutral.lightGray}`,
              fontSize: designTokens.typography.fontSizes.body,
              boxSizing: 'border-box',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = designTokens.colors.primary.blue;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = designTokens.colors.neutral.lightGray;
            }}
          />
        </div>

        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.small,
            color: designTokens.colors.neutral.darkGray,
            marginBottom: designTokens.spacing.xs,
            fontWeight: designTokens.typography.fontWeights.medium
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignUp ? "Create a password (6+ characters)" : "Enter your password"}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              borderRadius: '12px',
              border: `1px solid ${designTokens.colors.neutral.lightGray}`,
              fontSize: designTokens.typography.fontSizes.body,
              boxSizing: 'border-box',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = designTokens.colors.primary.blue;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = designTokens.colors.neutral.lightGray;
            }}
          />
        </div>

        {currentError && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
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
          onClick={handleSubmit}
          disabled={authLoading || !email.trim() || !password.trim()}
          style={{
            width: '100%',
            backgroundColor: designTokens.colors.primary.blue,
            color: designTokens.colors.neutral.white,
            border: 'none',
            borderRadius: '28px',
            padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.medium,
            cursor: authLoading ? 'not-allowed' : 'pointer',
            opacity: (authLoading || !email.trim() || !password.trim()) ? 0.6 : 1,
            marginBottom: designTokens.spacing.md
          }}
        >
          {authLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>

        <button
          onClick={toggleMode}
          disabled={authLoading}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: designTokens.colors.primary.blue,
            border: 'none',
            padding: designTokens.spacing.md,
            fontSize: designTokens.typography.fontSizes.small,
            cursor: authLoading ? 'not-allowed' : 'pointer',
            opacity: authLoading ? 0.6 : 1,
            marginBottom: designTokens.spacing.xs
          }}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>

        {!isSignUp && (
          <>
            <button
              onClick={() => setCurrentScreen('forgotPassword')}
              disabled={authLoading}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: designTokens.colors.neutral.gray,
                border: 'none',
                padding: designTokens.spacing.sm,
                fontSize: designTokens.typography.fontSizes.small,
                cursor: authLoading ? 'not-allowed' : 'pointer',
                opacity: authLoading ? 0.6 : 1,
                textDecoration: 'underline'
              }}
            >
              Forgot your password?
            </button>

            {/* Development only - temporary bypass */}
            {import.meta.env.DEV && (
              <button
                onClick={async () => {
                  if (confirm('Development only: Create new account with current email/password (bypasses access control)?')) {
                    await devSignUp();
                  }
                }}
                disabled={authLoading || !email.trim() || !password.trim()}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  padding: designTokens.spacing.sm,
                  fontSize: designTokens.typography.fontSizes.small,
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  opacity: authLoading ? 0.6 : 1,
                  marginTop: designTokens.spacing.sm,
                  borderRadius: '6px'
                }}
              >
                🔧 DEV: Force create account
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmailPasswordScreen;