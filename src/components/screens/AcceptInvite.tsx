import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Check, AlertCircle, Loader } from 'lucide-react';
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

  useEffect(() => {
    loadInviteData();
  }, [token]);

  const loadInviteData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { user, error: userError } = await auth.getCurrentUser();
      if (userError) throw userError;

      if (!user) {
        setError('You must be logged in to accept an invite');
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      // Get invite details
      if (!token) {
        throw new Error('Invalid invite link');
      }

      const { data: inviteData, error: inviteError } = await db.bandInvites.getByToken(token);

      if (inviteError || !inviteData) {
        throw new Error('This invite is invalid or has expired');
      }

      setInvite(inviteData);
    } catch (err: any) {
      console.error('Error loading invite:', err);
      setError(err.message || 'Failed to load invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!token || !currentUser) return;

    setAccepting(true);
    setError(null);

    try {
      const { error: acceptError } = await db.bandInvites.accept(token, currentUser.id);

      if (acceptError) throw acceptError;

      setSuccess(true);

      // Refresh bands in context
      await refreshBands();

      // Redirect to main dashboard after 2 seconds
      setTimeout(() => {
        navigate('/', { state: { tab: 'band' } });
      }, 2000);
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
            onClick={handleAcceptInvite}
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
