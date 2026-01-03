import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { DialogModal } from '../ui/DialogModal';
import { db } from '../../../lib/supabase';
import { InlineSpinner } from '../atoms/InlineSpinner';

interface GroupTracksModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTracks: any[]; // All tracks that can be selected
  preSelectedTrackIds?: string[]; // Tracks already selected (optional)
  currentUser: any;
  currentBandId?: string;
}

export const GroupTracksModal: React.FC<GroupTracksModalProps> = ({
  isOpen,
  onClose,
  availableTracks,
  preSelectedTrackIds = [],
  currentUser,
  currentBandId,
}) => {
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(preSelectedTrackIds);
  const [heroTrackId, setHeroTrackId] = useState<string | null>(preSelectedTrackIds[0] || null);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate group name from first selected track
  useEffect(() => {
    if (selectedTrackIds.length > 0 && !groupName) {
      const firstTrack = availableTracks.find(t => t.id === selectedTrackIds[0]);
      if (firstTrack) {
        // Remove version indicators from title (e.g., "Track v1" → "Track")
        const cleanName = firstTrack.title
          .replace(/\s+v\d+$/i, '')
          .replace(/\s+version\s+\d+$/i, '')
          .replace(/\s+\d{4}$/i, '')
          .trim();
        setGroupName(cleanName);
      }
    }
  }, [selectedTrackIds, availableTracks, groupName]);

  const handleToggleTrack = (trackId: string) => {
    setSelectedTrackIds(prev => {
      if (prev.includes(trackId)) {
        // Deselecting
        const newSelection = prev.filter(id => id !== trackId);
        // If this was the hero, pick a new hero
        if (heroTrackId === trackId && newSelection.length > 0) {
          setHeroTrackId(newSelection[0]);
        }
        return newSelection;
      } else {
        // Selecting
        const newSelection = [...prev, trackId];
        // If no hero set, make this the hero
        if (!heroTrackId) {
          setHeroTrackId(trackId);
        }
        return newSelection;
      }
    });
  };

  const handleCreateGroup = async () => {
    if (selectedTrackIds.length < 2) {
      setError('Select at least 2 tracks to group');
      return;
    }

    if (!heroTrackId) {
      setError('Select a hero version');
      return;
    }

    if (!groupName.trim()) {
      setError('Enter a group name');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      console.log('[GroupTracksModal] Creating version group:', {
        name: groupName.trim(),
        band_id: currentBandId || null,
        track_ids: selectedTrackIds,
        hero_track_id: heroTrackId,
        created_by: currentUser.id,
      });

      const { data, error: createError } = await db.versionGroups.create({
        name: groupName.trim(),
        band_id: currentBandId || null,
        track_ids: selectedTrackIds,
        hero_track_id: heroTrackId,
        created_by: currentUser.id,
      });

      if (createError) {
        console.error('[GroupTracksModal] Error creating version group:', createError);
        setError(`Failed to create version group: ${createError.message || 'Unknown error'}`);
        return;
      }

      console.log('[GroupTracksModal] Version group created successfully:', data);

      // Success!
      onClose();
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setCreating(false);
    }
  };

  const selectedTracks = availableTracks.filter(t => selectedTrackIds.includes(t.id));

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Group Tracks as Versions"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={creating}
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              backgroundColor: 'transparent',
              border: `1px solid ${designTokens.colors.borders.default}`,
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              cursor: creating ? 'not-allowed' : 'pointer',
              opacity: creating ? 0.6 : 1,
              color: designTokens.colors.text.secondary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={creating || selectedTrackIds.length < 2}
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              backgroundColor: designTokens.colors.primary.blue,
              color: designTokens.colors.text.inverse,
              border: 'none',
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              cursor: (creating || selectedTrackIds.length < 2) ? 'not-allowed' : 'pointer',
              opacity: (creating || selectedTrackIds.length < 2) ? 0.6 : 1,
            }}
          >
            {creating ? <InlineSpinner size={16} /> : `Group ${selectedTrackIds.length} Tracks`}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.lg }}>
        {/* Group Name Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.xs,
          }}>
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setError(null);
            }}
            placeholder="e.g., Steady As You Go"
            style={{
              width: '100%',
              padding: designTokens.spacing.sm,
              border: `1px solid ${designTokens.colors.borders.default}`,
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSizes.body,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Track Selection */}
        <div>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.xs,
          }}>
            Select Tracks ({selectedTrackIds.length} selected)
          </label>
          <div style={{
            maxHeight: '300px',
            overflow: 'auto',
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.sm,
          }}>
            {availableTracks.map((track) => {
              const isSelected = selectedTrackIds.includes(track.id);
              const isHero = heroTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => handleToggleTrack(track.id)}
                  style={{
                    padding: designTokens.spacing.md,
                    borderBottom: `1px solid ${designTokens.colors.borders.default}`,
                    cursor: 'pointer',
                    backgroundColor: isSelected
                      ? designTokens.colors.surface.hover
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.sm,
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${isSelected ? designTokens.colors.primary.blue : designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.xs,
                    backgroundColor: isSelected ? designTokens.colors.primary.blue : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && <Check size={14} color="white" />}
                  </div>

                  {/* Track Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: designTokens.typography.fontSizes.body,
                      color: designTokens.colors.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {track.title}
                    </div>
                    {track.duration_seconds && (
                      <div style={{
                        fontSize: designTokens.typography.fontSizes.caption,
                        color: designTokens.colors.text.secondary,
                      }}>
                        {Math.floor(track.duration_seconds / 60)}:{String(Math.floor(track.duration_seconds % 60)).padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {/* Hero Radio */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroTrackId(track.id);
                      }}
                      style={{
                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                        fontSize: designTokens.typography.fontSizes.caption,
                        backgroundColor: isHero ? designTokens.colors.accent.yellow : 'transparent',
                        border: `1px solid ${isHero ? designTokens.colors.accent.yellow : designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.sm,
                        cursor: 'pointer',
                        fontWeight: isHero ? designTokens.typography.fontWeights.semibold : 'normal',
                        color: isHero ? designTokens.colors.neutral.charcoal : designTokens.colors.text.secondary,
                      }}
                    >
                      {isHero ? '★ Hero' : 'Set Hero'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: designTokens.spacing.sm,
            backgroundColor: designTokens.colors.feedback.error.bg,
            border: `1px solid ${designTokens.colors.feedback.error.border}`,
            borderRadius: designTokens.borderRadius.sm,
            color: designTokens.colors.feedback.error.text,
            fontSize: designTokens.typography.fontSizes.caption,
          }}>
            {error}
          </div>
        )}

        {/* Preview */}
        {selectedTrackIds.length >= 2 && (
          <div style={{
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.secondary,
            borderRadius: designTokens.borderRadius.sm,
          }}>
            <div style={{
              fontSize: designTokens.typography.fontSizes.caption,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Preview:
            </div>
            <div style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.primary,
            }}>
              "{groupName}" will have {selectedTrackIds.length} versions
            </div>
          </div>
        )}
      </div>
    </DialogModal>
  );
};
