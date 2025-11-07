import React, { useState, useRef } from 'react';
import { Users, Plus, Settings } from 'lucide-react';
import { useBand } from '../../contexts/BandContext';
import { designTokens } from '../../design/designTokens';
import { DialogModal } from '../ui/DialogModal';

interface BandModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onOpenBandSettings?: () => void;
}

export const BandModal: React.FC<BandModalProps> = ({ isOpen, onClose, userId, onOpenBandSettings }) => {
  const { currentBand, userBands, userRole, switchBand, refreshBands } = useBand();
  const [showCreateBand, setShowCreateBand] = useState(false);
  const [newBandName, setNewBandName] = useState('');
  const [creating, setCreating] = useState(false);

  // Ref for iOS keyboard handling
  const bandNameInputRef = useRef<HTMLInputElement>(null);


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
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title={showCreateBand ? 'Create New Band' : 'My Bands'}
      size="sm"
      hasKeyboardInput={showCreateBand}
      keyboardInputRef={showCreateBand ? bandNameInputRef : undefined}
    >
      {showCreateBand ? (
        /* Create Band Form */
        <div>
          <input
            ref={bandNameInputRef}
            type="text"
            value={newBandName}
            onChange={(e) => setNewBandName(e.target.value)}
            placeholder="Band name..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newBandName.trim() && !creating) {
                handleCreateBand();
              }
            }}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              fontSize: designTokens.typography.fontSizes.body,
              border: `1px solid ${designTokens.colors.borders.default}`,
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
                border: `1px solid ${designTokens.colors.borders.default}`,
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
                    border: `1px solid ${designTokens.colors.borders.default}`,
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
            borderTop: `1px solid ${designTokens.colors.borders.default}`,
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

            {(userRole === 'owner' || userRole === 'admin') && currentBand && !currentBand.is_personal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBandSettings?.();
                }}
                style={{
                  width: '100%',
                  padding: designTokens.spacing.md,
                  backgroundColor: 'transparent',
                  border: `1px solid ${designTokens.colors.borders.default}`,
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
            )}
          </div>
        </div>
      )}
    </DialogModal>
  );
};
