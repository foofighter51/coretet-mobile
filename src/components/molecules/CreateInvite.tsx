import React, { useState } from 'react';
import { X, Copy, Share as ShareIcon, Check } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db } from '../../../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

interface CreateInviteProps {
  bandId: string;
  bandName: string;
  currentUserId: string;
  onClose: () => void;
  onInviteCreated: () => void;
}

export const CreateInvite: React.FC<CreateInviteProps> = ({
  bandId,
  bandName,
  currentUserId,
  onClose,
  onInviteCreated,
}) => {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: inviteError } = await db.bandInvites.create(
        bandId,
        currentUserId,
        email.trim()
      );

      if (inviteError) throw inviteError;

      // Generate invite link
      // Use production URL for sharing (capacitor:// URLs don't work externally)
      const baseUrl = Capacitor.isNativePlatform()
        ? 'https://coretet.app'  // Production URL for native apps
        : window.location.origin; // Use current origin for web
      const link = `${baseUrl}/invite/${data.invite_token}`;
      setInviteLink(link);
    } catch (err: any) {
      console.error('Error creating invite:', err);
      setError(err.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (!inviteLink) return;

    try {
      if (Capacitor.isNativePlatform()) {
        // Use native share sheet on iOS
        // Combine text and URL in the text field to avoid binary encoding issues
        await Share.share({
          text: `You've been invited to join ${bandName} on CoreTet!\n\n${inviteLink}`,
          dialogTitle: 'Share Band Invite',
        });
      } else {
        // Fallback for web
        if (navigator.share) {
          await navigator.share({
            title: `Join ${bandName} on CoreTet`,
            text: `You've been invited to join ${bandName} on CoreTet!`,
            url: inviteLink,
          });
        } else {
          // If Web Share API not available, just copy
          await handleCopyLink();
        }
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDone = () => {
    onInviteCreated();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100, // Higher than BandSettings
        padding: designTokens.spacing.md,
        overflow: 'auto', // Allow scrolling if content overflows
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.lg,
          maxWidth: '400px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: designTokens.shadows.elevated,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: designTokens.spacing.lg,
            borderBottom: `1px solid ${designTokens.colors.borders.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              fontSize: designTokens.typography.fontSizes.h4,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              margin: 0,
            }}
          >
            Invite to {bandName}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: designTokens.spacing.xs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: designTokens.colors.text.secondary,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: designTokens.spacing.lg }}>
          {!inviteLink ? (
            <>
              {/* Email Input */}
              <div style={{ marginBottom: designTokens.spacing.md }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.text.primary,
                    marginBottom: designTokens.spacing.xs,
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: designTokens.spacing.md,
                    fontSize: designTokens.typography.fontSizes.body,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.md,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleGenerateInvite();
                    }
                  }}
                />
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
                  }}
                >
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateInvite}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: designTokens.spacing.md,
                  backgroundColor: loading
                    ? designTokens.colors.surface.disabled
                    : designTokens.colors.primary.blue,
                  color: designTokens.colors.text.inverse,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.md,
                  fontSize: designTokens.typography.fontSizes.button,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Generating...' : 'Generate Invite Link'}
              </button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div
                style={{
                  padding: designTokens.spacing.md,
                  backgroundColor: designTokens.colors.feedback.success.bg,
                  border: `1px solid ${designTokens.colors.feedback.success.border}`,
                  borderRadius: designTokens.borderRadius.md,
                  color: designTokens.colors.feedback.success.text,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  marginBottom: designTokens.spacing.md,
                  textAlign: 'center',
                }}
              >
                ✓ Invite created successfully!
              </div>

              {/* Invite Link */}
              <div style={{ marginBottom: designTokens.spacing.md }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.text.primary,
                    marginBottom: designTokens.spacing.xs,
                  }}
                >
                  Invite Link
                </label>
                <div
                  style={{
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.surface.secondary,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.md,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.secondary,
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}
                >
                  {inviteLink}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.md }}>
                <button
                  onClick={handleCopyLink}
                  style={{
                    flex: 1,
                    padding: designTokens.spacing.md,
                    backgroundColor: copied
                      ? designTokens.colors.system.success
                      : designTokens.colors.primary.blue,
                    color: designTokens.colors.text.inverse,
                    border: 'none',
                    borderRadius: designTokens.borderRadius.md,
                    fontSize: designTokens.typography.fontSizes.button,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: designTokens.spacing.xs,
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  style={{
                    flex: 1,
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.primary.blue,
                    color: designTokens.colors.text.inverse,
                    border: 'none',
                    borderRadius: designTokens.borderRadius.md,
                    fontSize: designTokens.typography.fontSizes.button,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: designTokens.spacing.xs,
                  }}
                >
                  <ShareIcon size={18} />
                  Share
                </button>
              </div>

              {/* Done Button */}
              <button
                onClick={handleDone}
                style={{
                  width: '100%',
                  padding: designTokens.spacing.md,
                  backgroundColor: designTokens.colors.surface.secondary,
                  color: designTokens.colors.text.primary,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.md,
                  fontSize: designTokens.typography.fontSizes.button,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
