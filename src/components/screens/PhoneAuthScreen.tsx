import React, { useState, useEffect } from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { EmailConfirmationScreen } from './EmailConfirmationScreen';
import { inviteCodeService } from '../../utils/inviteCodeService';

export function PhoneAuthScreen() {
  const designTokens = useDesignTokens();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [codeValidated, setCodeValidated] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);

  // Clear success message when user returns after email confirmation
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is authenticated, clear any lingering messages
        setSuccessMessage(null);
        setError(null);
      }
    };
    checkSession();
  }, []);

  const handleAuth = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate password confirmation for signup
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        // Validate invite code first if provided
        let hasValidCode = false;
        if (inviteCode.trim()) {
          const validation = await inviteCodeService.verifyCode(inviteCode);
          if (!validation.valid) {
            setError(validation.error || 'Invalid invite code');
            return;
          }
          hasValidCode = true;
          setCodeValidated(true);
        }

        // Sign up
        const isNativeApp = Capacitor.isNativePlatform();
        const redirectUrl = isNativeApp
          ? 'coretet://'
          : `${window.location.origin}/auth/confirmed`;

        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              invite_code: inviteCode.trim().toUpperCase() || null,
            }
          }
        });

        if (authError) {
          // Provide user-friendly error messages
          if (authError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
            setIsSignUp(false); // Switch to sign in mode
          } else if (authError.message.includes('Email rate limit exceeded')) {
            setError('Too many signup attempts. Please try again in a few minutes.');
          } else {
            setError(authError.message);
          }
        } else if (data.user) {
          // If using valid invite code, mark it as used and create profile immediately
          if (hasValidCode && inviteCode.trim()) {
            await inviteCodeService.useCode(inviteCode.trim(), data.user.id);

            // Create profile immediately (don't wait for email confirmation)
            await supabase.from('profiles').insert({
              id: data.user.id,
              email: data.user.email,
            });

            // Call edge function to auto-confirm user
            try {
              await fetch(`${supabase.supabaseUrl}/functions/v1/confirm-beta-user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabase.supabaseKey}`,
                },
                body: JSON.stringify({
                  userId: data.user.id,
                  inviteCode: inviteCode.trim().toUpperCase(),
                }),
              });

              // User is auto-confirmed, will be redirected to onboarding
              setSuccessMessage('Account created! You can now sign in.');
              setIsSignUp(false);
              setInviteCode('');
              setCodeValidated(false);
            } catch (confirmError) {
              console.error('Auto-confirm error:', confirmError);
              // Fall back to email confirmation flow
              setSignupEmail(email.trim());
              setShowEmailConfirmation(true);
            }
          } else {
            // No invite code - show email confirmation screen
            setSignupEmail(email.trim());
            setShowEmailConfirmation(true);
          }

          // Clear form
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Sign in
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });


        if (authError) {
          console.error('🔐 Sign in error:', authError);
          // Provide user-friendly error messages
          if (authError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else if (authError.message.includes('Email not confirmed')) {
            setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
          } else {
            setError(authError.message);
          }
        } else {
        }
        // On success, auth state will update and app will navigate automatically
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Show email confirmation screen after signup
  if (showEmailConfirmation) {
    return (
      <EmailConfirmationScreen
        email={signupEmail}
        onResendSuccess={() => {
          // Could show a toast notification here
        }}
        onBackToSignIn={() => {
          setShowEmailConfirmation(false);
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setError(null);
        }}
      />
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      backgroundColor: designTokens.colors.surface.tertiary,
      fontFamily: designTokens.typography.fontFamily,
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '375px',
        boxSizing: 'border-box',
      }}>
        {/* Logo/Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}>
          <img
            src={isDarkMode ? "/logo.png" : "/logo-light.png"}
            alt="CoreTet Logo"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
            }}
          />
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: designTokens.colors.text.primary,
              margin: '0 0 8px 0',
            }}>
              CoreTet
            </h1>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.text.secondary,
              margin: 0,
            }}>
              Music Collaboration Platform
            </p>
          </div>
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 8px 0',
        }}>
          {isSignUp ? 'Create Account' : 'Sign in'}
        </h2>
        <p style={{
          fontSize: '14px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 24px 0',
        }}>
          {isSignUp ? 'Enter your email and create a password' : 'Enter your email and password'}
        </p>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoFocus
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          inputMode="email"
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            border: `1px solid ${designTokens.colors.neutral.lightGray}`,
            borderRadius: '8px',
            marginBottom: '12px',
            fontFamily: designTokens.typography.fontFamily,
            WebkitAppearance: 'none',
          }}
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          onKeyDown={(e) => e.key === 'Enter' && !isSignUp && handleAuth()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            border: `1px solid ${designTokens.colors.neutral.lightGray}`,
            borderRadius: '8px',
            marginBottom: isSignUp ? '12px' : '16px',
            fontFamily: designTokens.typography.fontFamily,
            WebkitAppearance: 'none',
          }}
        />

        {isSignUp && (
          <>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                border: `1px solid ${designTokens.colors.neutral.lightGray}`,
                borderRadius: '8px',
                marginBottom: '12px',
                fontFamily: designTokens.typography.fontFamily,
                WebkitAppearance: 'none',
              }}
            />

            <div style={{
              marginBottom: '16px',
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: designTokens.colors.text.secondary,
                marginBottom: '8px',
              }}>
                Beta Invite Code (optional)
              </label>
              <input
                type="text"
                placeholder="Enter 8-character code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={loading}
                maxLength={12}
                autoComplete="off"
                autoCapitalize="characters"
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: `1px solid ${codeValidated ? '#90ee90' : designTokens.colors.neutral.lightGray}`,
                  borderRadius: '8px',
                  fontFamily: designTokens.typography.fontFamily,
                  WebkitAppearance: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  backgroundColor: codeValidated ? '#e6f7e6' : undefined,
                }}
              />
              <p style={{
                fontSize: '12px',
                color: designTokens.colors.text.tertiary,
                margin: '4px 0 0 0',
              }}>
                {codeValidated ? '✓ Valid code - email confirmation will be skipped' : 'Have a beta code? Skip email verification'}
              </p>
            </div>
          </>
        )}

        {successMessage && (
          <div style={{
            padding: '12px',
            backgroundColor: '#e6f7e6',
            border: '1px solid #90ee90',
            borderRadius: '8px',
            color: '#008000',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c00',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: designTokens.colors.primary.blue,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>

        {/* Toggle between sign in and sign up */}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setSuccessMessage(null);
            setConfirmPassword(''); // Clear confirm password when toggling
          }}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'none',
            border: 'none',
            color: designTokens.colors.primary.blue,
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '16px',
          }}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
