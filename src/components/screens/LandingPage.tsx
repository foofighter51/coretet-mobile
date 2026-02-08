import React, { useState } from 'react';
import { designTokens } from '../../design/designTokens';
import { auth } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Dark theme colors matching NewLandingPage
const colors = {
  bg: '#1a2332',
  card: '#222d3a',
  cardBorder: '#2a3545',
  gold: '#e9a63c',
  textPrimary: '#ffffff',
  textSecondary: '#d0d4d8',
  textMuted: '#8a95a0',
  textDim: '#6b7585',
  inputBg: '#2a3545',
  inputBorder: '#3a4555',
  error: '#fc8181',
  errorBg: '#5f1a1a',
  errorBorder: '#ef4444',
};

export function LandingPage() {
  const navigate = useNavigate();
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await auth.signInWithPassword(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await auth.signInWithPassword(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/admin/feedback');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: designTokens.typography.fontFamily,
    boxSizing: 'border-box',
    color: colors.textPrimary,
    outline: 'none',
  };

  const renderLoginForm = (onSubmit: (e: React.FormEvent) => void, title: string, onCancel: () => void) => (
    <div style={{
      marginTop: '24px',
      padding: '24px',
      backgroundColor: colors.card,
      borderRadius: '12px',
      border: `1px solid ${colors.cardBorder}`,
      textAlign: 'left',
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: colors.textPrimary,
        margin: '0 0 16px 0',
        textAlign: 'center',
      }}>
        {title}
      </h3>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: colors.textSecondary,
            marginBottom: '6px',
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: colors.textSecondary,
            marginBottom: '6px',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            padding: '10px 12px',
            backgroundColor: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            borderRadius: '8px',
            color: colors.error,
            fontSize: '13px',
            marginBottom: '14px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading || !email || !password ? colors.inputBg : colors.gold,
            color: loading || !email || !password ? colors.textMuted : colors.bg,
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            fontFamily: designTokens.typography.fontFamily,
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => {
            onCancel();
            setEmail('');
            setPassword('');
            setError('');
          }}
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '10px',
            backgroundColor: 'transparent',
            color: colors.textMuted,
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: designTokens.typography.fontFamily,
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '20px',
      paddingTop: '60px',
      backgroundColor: colors.bg,
      fontFamily: designTokens.typography.fontFamily,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        paddingBottom: '40px',
      }}>
        {/* Logo */}
        <img
          src="/logo.png"
          alt="CoreTet"
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            display: 'block',
          }}
        />

        {/* Title */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: '0 0 8px 0',
        }}>
          CoreTet
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          margin: '0 0 24px 0',
          lineHeight: '1.5',
        }}>
          Music collaboration for your band
        </p>

        {/* Beta Badge */}
        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          backgroundColor: colors.card,
          border: `1px solid ${colors.gold}`,
          borderRadius: '20px',
          marginBottom: '24px',
        }}>
          <span style={{
            color: colors.gold,
            fontSize: '13px',
            fontWeight: '600',
          }}>
            Currently in Private Beta
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '15px',
          color: colors.textMuted,
          margin: '0 0 32px 0',
          lineHeight: '1.6',
        }}>
          Upload tracks, rate music together, and build shared playlists.
          Currently available for TestFlight beta testers.
        </p>

        {/* Login Buttons */}
        {!showUserLogin && !showAdminLogin && (
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setShowUserLogin(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.gold,
                border: 'none',
                borderRadius: '8px',
                color: colors.bg,
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: designTokens.typography.fontFamily,
              }}
            >
              User Login
            </button>
            <button
              onClick={() => setShowAdminLogin(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '8px',
                color: colors.textSecondary,
                fontSize: '15px',
                cursor: 'pointer',
                fontFamily: designTokens.typography.fontFamily,
              }}
            >
              Admin Login
            </button>
          </div>
        )}

        {/* User Login Form */}
        {showUserLogin && renderLoginForm(handleUserLogin, 'Sign In', () => setShowUserLogin(false))}

        {/* Admin Login Form */}
        {showAdminLogin && renderLoginForm(handleAdminLogin, 'Admin Access', () => setShowAdminLogin(false))}

        {/* Footer */}
        <p style={{
          fontSize: '13px',
          color: colors.textDim,
          margin: '40px 0 0 0',
        }}>
          &copy; 2026 CoreTet. All rights reserved.
        </p>
      </div>
    </div>
  );
}
