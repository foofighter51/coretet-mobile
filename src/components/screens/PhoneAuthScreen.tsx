import React, { useState } from 'react';
import { designTokens } from '../../design/designTokens';
import { supabase } from '../../../lib/supabase';

export function PhoneAuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        // Sign up
        const { error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (authError) {
          setError(authError.message);
        } else {
          setSuccessMessage('Account created! Please check your email to confirm your account.');
          setIsSignUp(false);
        }
      } else {
        // Sign in
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (authError) {
          setError(authError.message);
        }
        // On success, auth state will update and app will navigate automatically
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      backgroundColor: '#ffffff',
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
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: designTokens.colors.neutral.charcoal,
            margin: '0 0 8px 0',
          }}>
            CoreTet
          </h1>
          <p style={{
            fontSize: '16px',
            color: designTokens.colors.neutral.darkGray,
            margin: 0,
          }}>
            Music Collaboration Platform
          </p>
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
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            border: `1px solid ${designTokens.colors.neutral.lightGray}`,
            borderRadius: '8px',
            marginBottom: '12px',
            fontFamily: designTokens.typography.fontFamily,
          }}
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            border: `1px solid ${designTokens.colors.neutral.lightGray}`,
            borderRadius: '8px',
            marginBottom: '16px',
            fontFamily: designTokens.typography.fontFamily,
          }}
        />

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
