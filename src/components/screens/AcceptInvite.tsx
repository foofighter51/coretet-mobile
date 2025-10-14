import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Check, AlertCircle, Loader, Download } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db, auth } from '../../../lib/supabase';
import { useBand } from '../../contexts/BandContext';

export const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refreshBands } = useBand();

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Detect if running in mobile browser
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  useEffect(() => {
    loadInviteData();
  }, [token]);

  const loadInviteData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get invite details first (without auth)
      if (!token) {
        throw new Error('Invalid invite link');
      }

      const { data: inviteData, error: inviteError } = await db.bandInvites.getByToken(token);

      if (inviteError || !inviteData) {
        throw new Error('This invite is invalid or has expired');
      }

      setInvite(inviteData);

      // Check if user is logged in
      const { user, error: userError } = await auth.getCurrentUser();

      if (!user) {
        // Show auth UI for unauthenticated users
        setShowAuth(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
    } catch (err: any) {
      console.error('Error loading invite:', err);
      setError(err.message || 'Failed to load invite');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      // Sign up with email/password
      const { data, error: signupError } = await auth.signUpWithPassword(email, password);

      if (signupError) throw signupError;

      if (!data.user) throw new Error('Signup failed');

      // Create profile with name
      await db.profiles.upsert({
        id: data.user.id,
        email: email,
        name: name || email.split('@')[0], // Use name or email prefix
        updated_at: new Date().toISOString(),
      });

      setCurrentUser(data.user);
      setShowAuth(false);

      // Auto-accept invite
      await handleAcceptInvite(data.user.id);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await auth.signInWithPassword(email, password);

      if (loginError) throw loginError;

      if (!data.user) throw new Error('Login failed');

      setCurrentUser(data.user);
      setShowAuth(false);

      // Auto-accept invite
      await handleAcceptInvite(data.user.id);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAcceptInvite = async (userId?: string) => {
    const userIdToUse = userId || currentUser?.id;
    if (!token || !userIdToUse) return;

    setAccepting(true);
    setError(null);

    try {
      const { error: acceptError } = await db.bandInvites.accept(token, userIdToUse);

      if (acceptError) throw acceptError;

      setSuccess(true);

      // Refresh bands in context
      await refreshBands();

      // Show download prompt on mobile, otherwise redirect
      if (isMobile) {
        setShowDownloadPrompt(true);
      } else {
        // Redirect to main dashboard after 2 seconds
        setTimeout(() => {
          navigate('/', { state: { tab: 'band' } });
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      setError(err.message || 'Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: designTokens.colors.surface.tertiary,
          padding: designTokens.spacing.lg,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Loader
            size={48}
            color={designTokens.colors.primary.blue}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <p
            style={{
              marginTop: designTokens.spacing.md,
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.text.secondary,
            }}
          >
            Loading invite...
          </p>
        </div>
      </div>
    );
  }

  // Error state (invite not found or expired)
  if (error && !invite) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: designTokens.colors.surface.tertiary,
          padding: designTokens.spacing.lg,
        }}
      >
        <div
          style={{
            backgroundColor: designTokens.colors.surface.primary,
            borderRadius: designTokens.borderRadius.lg,
            padding: designTokens.spacing.xl,
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: designTokens.shadows.elevated,
          }}
        >
          <AlertCircle size={64} color={designTokens.colors.system.error} style={{ marginBottom: designTokens.spacing.md }} />
          <h2
            style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Invalid Invite
          </h2>
          <p
            style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.lg,
            }}
          >
            {error}
          </p>
          <button
            onClick={handleCancel}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              backgroundColor: designTokens.colors.primary.blue,
              color: designTokens.colors.text.inverse,
              border: 'none',
              borderRadius: designTokens.borderRadius.md,
              fontSize: designTokens.typography.fontSizes.button,
              fontWeight: designTokens.typography.fontWeights.medium,
              cursor: 'pointer',
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Success state with download prompt
  if (success && showDownloadPrompt) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: designTokens.colors.surface.tertiary,
          padding: designTokens.spacing.lg,
        }}
      >
        <div
          style={{
            backgroundColor: designTokens.colors.surface.primary,
            borderRadius: designTokens.borderRadius.lg,
            padding: designTokens.spacing.xl,
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: designTokens.shadows.elevated,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.system.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: designTokens.spacing.md,
            }}
          >
            <Check size={48} color={designTokens.colors.text.inverse} />
          </div>
          <h2
            style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.sm,
            }}
          >
            You're in!
          </h2>
          <p
            style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.lg,
            }}
          >
            You've successfully joined <strong>{invite?.bands?.name}</strong>. Download the CoreTet app to start collaborating!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
            <a
              href="https://testflight.apple.com/join/YOUR_TESTFLIGHT_LINK"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                width: '100%',
                padding: designTokens.spacing.md,
                backgroundColor: designTokens.colors.primary.blue,
                color: designTokens.colors.text.inverse,
                border: 'none',
                borderRadius: designTokens.borderRadius.md,
                fontSize: designTokens.typography.fontSizes.button,
                fontWeight: designTokens.typography.fontWeights.medium,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <Download size={20} />
              Download CoreTet
            </a>

            <button
              onClick={() => navigate('/', { state: { tab: 'band' } })}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                backgroundColor: designTokens.colors.surface.primary,
                color: designTokens.colors.text.secondary,
                border: `1px solid ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.md,
                fontSize: designTokens.typography.fontSizes.button,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: 'pointer',
              }}
            >
              Continue on Web
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state (desktop)
  if (success) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: designTokens.colors.surface.tertiary,
          padding: designTokens.spacing.lg,
        }}
      >
        <div
          style={{
            backgroundColor: designTokens.colors.surface.primary,
            borderRadius: designTokens.borderRadius.lg,
            padding: designTokens.spacing.xl,
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: designTokens.shadows.elevated,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.system.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: designTokens.spacing.md,
            }}
          >
            <Check size={48} color={designTokens.colors.text.inverse} />
          </div>
          <h2
            style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Welcome to {invite?.bands?.name}!
          </h2>
          <p
            style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.text.secondary,
            }}
          >
            You've successfully joined the band. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // Auth UI (signup/login)
  if (showAuth) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: designTokens.colors.surface.tertiary,
          padding: designTokens.spacing.lg,
        }}
      >
        <div
          style={{
            backgroundColor: designTokens.colors.surface.primary,
            borderRadius: designTokens.borderRadius.lg,
            padding: designTokens.spacing.xl,
            maxWidth: '400px',
            width: '100%',
            boxShadow: designTokens.shadows.elevated,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.primary.blueLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: designTokens.spacing.lg,
            }}
          >
            <Music size={40} color={designTokens.colors.primary.blue} />
          </div>

          {/* Content */}
          <div style={{ textAlign: 'center', marginBottom: designTokens.spacing.lg }}>
            <h2
              style={{
                fontSize: designTokens.typography.fontSizes.h3,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.text.primary,
                marginBottom: designTokens.spacing.sm,
              }}
            >
              Join {invite?.bands?.name}
            </h2>
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.body,
                color: designTokens.colors.text.secondary,
                marginBottom: designTokens.spacing.xs,
              }}
            >
              You've been invited by <strong>{invite?.profiles?.name || 'a band member'}</strong>
            </p>
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.tertiary,
              }}
            >
              {authMode === 'signup' ? 'Create an account to join' : 'Log in to accept this invite'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: designTokens.spacing.md,
                backgroundColor: designTokens.colors.feedback.error.bg,
                border: `1px solid ${designTokens.colors.feedback.error.border}`,
                borderRadius: designTokens.borderRadius.md,
                color: designTokens.colors.feedback.error.text,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                marginBottom: designTokens.spacing.md,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={authMode === 'signup' ? handleSignup : handleLogin}>
            {authMode === 'signup' && (
              <div style={{ marginBottom: designTokens.spacing.md }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: designTokens.spacing.xs,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.text.primary,
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: designTokens.spacing.sm,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.md,
                    fontSize: designTokens.typography.fontSizes.body,
                    boxSizing: 'border-box',
                  }}
                  placeholder="Your name"
                />
              </div>
            )}

            <div style={{ marginBottom: designTokens.spacing.md }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: designTokens.spacing.xs,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  color: designTokens.colors.text.primary,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: designTokens.spacing.sm,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.md,
                  fontSize: designTokens.typography.fontSizes.body,
                  boxSizing: 'border-box',
                }}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: designTokens.spacing.lg }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: designTokens.spacing.xs,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  color: designTokens.colors.text.primary,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: designTokens.spacing.sm,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.md,
                  fontSize: designTokens.typography.fontSizes.body,
                  boxSizing: 'border-box',
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                backgroundColor: authLoading
                  ? designTokens.colors.surface.disabled
                  : designTokens.colors.primary.blue,
                color: designTokens.colors.text.inverse,
                border: 'none',
                borderRadius: designTokens.borderRadius.md,
                fontSize: designTokens.typography.fontSizes.button,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: authLoading ? 'not-allowed' : 'pointer',
                marginBottom: designTokens.spacing.sm,
              }}
            >
              {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create Account & Join' : 'Log In & Join'}
            </button>
          </form>

          {/* Toggle auth mode */}
          <div style={{ textAlign: 'center', marginTop: designTokens.spacing.md }}>
            <button
              onClick={() => {
                setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {authMode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user - show accept button
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: designTokens.colors.surface.tertiary,
        padding: designTokens.spacing.lg,
      }}
    >
      <div
        style={{
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.lg,
          padding: designTokens.spacing.xl,
          maxWidth: '400px',
          width: '100%',
          boxShadow: designTokens.shadows.elevated,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: designTokens.colors.primary.blueLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: designTokens.spacing.lg,
          }}
        >
          <Music size={40} color={designTokens.colors.primary.blue} />
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: designTokens.spacing.lg }}>
          <h2
            style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Join {invite?.bands?.name}
          </h2>
          <p
            style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.xs,
            }}
          >
            You've been invited by <strong>{invite?.profiles?.name || 'a band member'}</strong>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: designTokens.spacing.md,
              backgroundColor: designTokens.colors.feedback.error.bg,
              border: `1px solid ${designTokens.colors.feedback.error.border}`,
              borderRadius: designTokens.borderRadius.md,
              color: designTokens.colors.feedback.error.text,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              marginBottom: designTokens.spacing.md,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
          <button
            onClick={() => handleAcceptInvite()}
            disabled={accepting}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              backgroundColor: accepting
                ? designTokens.colors.surface.disabled
                : designTokens.colors.primary.blue,
              color: designTokens.colors.text.inverse,
              border: 'none',
              borderRadius: designTokens.borderRadius.md,
              fontSize: designTokens.typography.fontSizes.button,
              fontWeight: designTokens.typography.fontWeights.medium,
              cursor: accepting ? 'not-allowed' : 'pointer',
            }}
          >
            {accepting ? 'Joining...' : 'Join Band'}
          </button>

          <button
            onClick={handleCancel}
            disabled={accepting}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              backgroundColor: designTokens.colors.surface.primary,
              color: designTokens.colors.text.secondary,
              border: `1px solid ${designTokens.colors.borders.default}`,
              borderRadius: designTokens.borderRadius.md,
              fontSize: designTokens.typography.fontSizes.button,
              fontWeight: designTokens.typography.fontWeights.medium,
              cursor: accepting ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Spinning loader animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
