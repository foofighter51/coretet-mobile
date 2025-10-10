import React, { useState } from 'react';
import { X, Users, Plus, Settings, Mail } from 'lucide-react';
import { useBand } from '../../contexts/BandContext';
import { designTokens } from '../../design/designTokens';

interface BandModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const BandModal: React.FC<BandModalProps> = ({ isOpen, onClose, userId }) => {
  const { currentBand, userBands, userRole, switchBand, refreshBands } = useBand();
  const [showCreateBand, setShowCreateBand] = useState(false);
  const [newBandName, setNewBandName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleSwitchBand = async (bandId: string) => {
    await switchBand(bandId);
    onClose();
  };

  const handleCreateBand = async () => {
    if (!newBandName.trim()) return;

    setCreating(true);
    try {
      const { db } = await import('../../../lib/supabase');
      await db.bands.createBand(newBandName.trim(), userId);
      await refreshBands();
      setNewBandName('');
      setShowCreateBand(false);
    } catch (error) {
      console.error('Error creating band:', error);
      alert('Failed to create band. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.lg,
          padding: designTokens.spacing.lg,
          maxWidth: '90%',
          width: '400px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: designTokens.spacing.md,
        }}>
          <h2 style={{
            fontSize: designTokens.typography.fontSizes.h3,
            fontWeight: designTokens.typography.fontWeights.bold,
            color: designTokens.colors.text.primary,
            margin: 0,
          }}>
            {showCreateBand ? 'Create New Band' : 'My Bands'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: designTokens.spacing.xs,
              color: designTokens.colors.text.secondary,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {showCreateBand ? (
          /* Create Band Form */
          <div>
            <input
              type="text"
              value={newBandName}
              onChange={(e) => setNewBandName(e.target.value)}
              placeholder="Band name..."
              autoFocus
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                fontSize: designTokens.typography.fontSizes.body,
                border: `1px solid ${designTokens.colors.border.secondary}`,
                borderRadius: designTokens.borderRadius.md,
                backgroundColor: designTokens.colors.surface.secondary,
                color: designTokens.colors.text.primary,
                marginBottom: designTokens.spacing.md,
              }}
            />
            <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
              <button
                onClick={() => setShowCreateBand(false)}
                disabled={creating}
                style={{
                  flex: 1,
                  padding: designTokens.spacing.md,
                  border: `1px solid ${designTokens.colors.border.secondary}`,
                  borderRadius: designTokens.borderRadius.md,
                  backgroundColor: 'transparent',
                  color: designTokens.colors.text.secondary,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBand}
                disabled={!newBandName.trim() || creating}
                style={{
                  flex: 1,
                  padding: designTokens.spacing.md,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.md,
                  backgroundColor: designTokens.colors.primary.blue,
                  color: designTokens.colors.text.inverse,
                  cursor: (!newBandName.trim() || creating) ? 'not-allowed' : 'pointer',
                  opacity: (!newBandName.trim() || creating) ? 0.5 : 1,
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        ) : (
          /* Band List */
          <div>
            {/* Current Band */}
            {currentBand && (
              <div style={{
                padding: designTokens.spacing.md,
                backgroundColor: designTokens.colors.primary.blue + '20',
                borderRadius: designTokens.borderRadius.md,
                marginBottom: designTokens.spacing.md,
                border: `2px solid ${designTokens.colors.primary.blue}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                  <Users size={20} color={designTokens.colors.primary.blue} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: designTokens.typography.fontSizes.body,
                      fontWeight: designTokens.typography.fontWeights.semibold,
                      color: designTokens.colors.text.primary,
                    }}>
                      {currentBand.name}
                    </div>
                    <div style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.text.secondary,
                    }}>
                      Current • {userRole}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Bands */}
            {userBands.filter(b => b.id !== currentBand?.id).length > 0 && (
              <div style={{ marginBottom: designTokens.spacing.md }}>
                <div style={{
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.text.secondary,
                  marginBottom: designTokens.spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Switch to
                </div>
                {userBands.filter(b => b.id !== currentBand?.id).map((band) => (
                  <button
                    key={band.id}
                    onClick={() => handleSwitchBand(band.id)}
                    style={{
                      width: '100%',
                      padding: designTokens.spacing.md,
                      marginBottom: designTokens.spacing.xs,
                      backgroundColor: designTokens.colors.surface.secondary,
                      border: `1px solid ${designTokens.colors.border.secondary}`,
                      borderRadius: designTokens.borderRadius.md,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.sm,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Users size={18} color={designTokens.colors.text.secondary} />
                    <div style={{
                      fontSize: designTokens.typography.fontSizes.body,
                      color: designTokens.colors.text.primary,
                      textAlign: 'left',
                    }}>
                      {band.name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{
              borderTop: `1px solid ${designTokens.colors.border.secondary}`,
              paddingTop: designTokens.spacing.md,
              marginTop: designTokens.spacing.md,
            }}>
              <button
                onClick={() => setShowCreateBand(true)}
                style={{
                  width: '100%',
                  padding: designTokens.spacing.md,
                  backgroundColor: 'transparent',
                  border: `1px solid ${designTokens.colors.primary.blue}`,
                  borderRadius: designTokens.borderRadius.md,
                  color: designTokens.colors.primary.blue,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: designTokens.spacing.xs,
                  marginBottom: designTokens.spacing.xs,
                }}
              >
                <Plus size={18} />
                Create New Band
              </button>

              {(userRole === 'owner' || userRole === 'admin') && currentBand && (
                <>
                  <button
                    onClick={() => {
                      // TODO: Implement invite modal
                      alert('Invite feature coming soon!');
                    }}
                    style={{
                      width: '100%',
                      padding: designTokens.spacing.md,
                      backgroundColor: 'transparent',
                      border: `1px solid ${designTokens.colors.border.secondary}`,
                      borderRadius: designTokens.borderRadius.md,
                      color: designTokens.colors.text.secondary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: designTokens.spacing.xs,
                      marginBottom: designTokens.spacing.xs,
                    }}
                  >
                    <Mail size={18} />
                    Invite Members
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement band settings modal
                      alert('Band settings coming soon!');
                    }}
                    style={{
                      width: '100%',
                      padding: designTokens.spacing.md,
                      backgroundColor: 'transparent',
                      border: `1px solid ${designTokens.colors.border.secondary}`,
                      borderRadius: designTokens.borderRadius.md,
                      color: designTokens.colors.text.secondary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: designTokens.spacing.xs,
                    }}
                  >
                    <Settings size={18} />
                    Band Settings
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
