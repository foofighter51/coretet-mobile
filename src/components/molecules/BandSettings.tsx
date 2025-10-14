import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Trash2, Shield, User } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db } from '../../../lib/supabase';
import { CreateInvite } from './CreateInvite';

interface BandSettingsProps {
  bandId: string;
  bandName: string;
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
}

export const BandSettings: React.FC<BandSettingsProps> = ({
  bandId,
  bandName,
  currentUserId,
  isAdmin,
  onClose,
}) => {
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [bandId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load band members
      const membersData = await db.bands.getBandMembers(bandId);
      setMembers(membersData);

      // Load pending invites (if admin)
      if (isAdmin) {
        const { data: invitesData, error: invitesError } = await db.bandInvites.listPendingForBand(bandId);
        if (invitesError) throw invitesError;
        setPendingInvites(invitesData || []);
      }
    } catch (err) {
      console.error('Error loading band settings data:', err);
      setError('Failed to load band settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return;

    try {
      const { error } = await db.bandInvites.revoke(inviteId);
      if (error) throw error;

      // Remove from local state
      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (err) {
      console.error('Error revoking invite:', err);
      alert('Failed to revoke invite');
    }
  };

  const handleInviteCreated = () => {
    setShowCreateInvite(false);
    loadData(); // Refresh to show new invite in pending list
  };

  return (
    <>
      {/* Main Modal */}
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
          zIndex: 1000,
          padding: designTokens.spacing.md,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: designTokens.colors.surface.primary,
            borderRadius: designTokens.borderRadius.lg,
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
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
            <h2
              style={{
                fontSize: designTokens.typography.fontSizes.h3,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.text.primary,
                margin: 0,
              }}
            >
              Band Settings
            </h2>
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
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              padding: designTokens.spacing.lg,
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: designTokens.spacing.xl }}>
                <p style={{ color: designTokens.colors.text.secondary }}>Loading...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  padding: designTokens.spacing.md,
                  backgroundColor: designTokens.colors.feedback.error.bg,
                  border: `1px solid ${designTokens.colors.feedback.error.border}`,
                  borderRadius: designTokens.borderRadius.md,
                  color: designTokens.colors.feedback.error.text,
                }}
              >
                {error}
              </div>
            ) : (
              <>
                {/* Band Info */}
                <div style={{ marginBottom: designTokens.spacing.xl }}>
                  <h3
                    style={{
                      fontSize: designTokens.typography.fontSizes.h4,
                      fontWeight: designTokens.typography.fontWeights.semibold,
                      color: designTokens.colors.text.primary,
                      marginBottom: designTokens.spacing.sm,
                    }}
                  >
                    {bandName}
                  </h3>
                  <p
                    style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.text.secondary,
                      margin: 0,
                    }}
                  >
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </p>
                </div>

                {/* Members Section */}
                <div style={{ marginBottom: designTokens.spacing.xl }}>
                  <h4
                    style={{
                      fontSize: designTokens.typography.fontSizes.body,
                      fontWeight: designTokens.typography.fontWeights.semibold,
                      color: designTokens.colors.text.primary,
                      marginBottom: designTokens.spacing.md,
                    }}
                  >
                    Members
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
                    {members.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: designTokens.spacing.md,
                          backgroundColor: designTokens.colors.surface.secondary,
                          borderRadius: designTokens.borderRadius.md,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                          <User size={20} color={designTokens.colors.text.secondary} />
                          <span
                            style={{
                              fontSize: designTokens.typography.fontSizes.body,
                              color: designTokens.colors.text.primary,
                            }}
                          >
                            {member.profiles?.name || 'Unknown'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
                          {(member.role === 'admin' || member.role === 'owner') && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: designTokens.colors.primary.blueLight,
                                borderRadius: designTokens.borderRadius.sm,
                              }}
                            >
                              <Shield size={14} color={designTokens.colors.primary.blue} />
                              <span
                                style={{
                                  fontSize: designTokens.typography.fontSizes.caption,
                                  color: designTokens.colors.primary.blue,
                                  fontWeight: designTokens.typography.fontWeights.medium,
                                }}
                              >
                                {member.role}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite Section (Admins Only) */}
                {isAdmin && (
                  <>
                    <div style={{ marginBottom: designTokens.spacing.md }}>
                      <button
                        onClick={() => setShowCreateInvite(true)}
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: designTokens.spacing.sm,
                        }}
                      >
                        <UserPlus size={20} />
                        Invite New Member
                      </button>
                    </div>

                    {/* Pending Invites */}
                    {pendingInvites.length > 0 && (
                      <div>
                        <h4
                          style={{
                            fontSize: designTokens.typography.fontSizes.body,
                            fontWeight: designTokens.typography.fontWeights.semibold,
                            color: designTokens.colors.text.primary,
                            marginBottom: designTokens.spacing.md,
                          }}
                        >
                          Pending Invites
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
                          {pendingInvites.map((invite) => (
                            <div
                              key={invite.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: designTokens.spacing.md,
                                backgroundColor: designTokens.colors.surface.secondary,
                                borderRadius: designTokens.borderRadius.md,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                                <Mail size={20} color={designTokens.colors.text.secondary} />
                                <div>
                                  <div
                                    style={{
                                      fontSize: designTokens.typography.fontSizes.body,
                                      color: designTokens.colors.text.primary,
                                    }}
                                  >
                                    {invite.invited_email}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: designTokens.typography.fontSizes.caption,
                                      color: designTokens.colors.text.tertiary,
                                    }}
                                  >
                                    Invited by {invite.profiles?.name || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRevokeInvite(invite.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: designTokens.spacing.xs,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: designTokens.colors.system.error,
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Invite Modal */}
      {showCreateInvite && (
        <CreateInvite
          bandId={bandId}
          bandName={bandName}
          currentUserId={currentUserId}
          onClose={() => setShowCreateInvite(false)}
          onInviteCreated={handleInviteCreated}
        />
      )}
    </>
  );
};
