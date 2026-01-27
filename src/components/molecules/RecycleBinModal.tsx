import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Clock, Music, FileText, List, AlertTriangle } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { DialogModal } from '../ui/DialogModal';
import { db } from '../../../lib/supabase';

interface RecycleBinItem {
  item_type: 'track' | 'work' | 'set_list';
  id: string;
  name: string;
  deleted_at: string;
  deleted_by: string;
  deleted_by_name: string | null;
  expires_at: string;
  band_id: string;
}

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  bandId: string;
  onItemRestored?: () => void;
}

export function RecycleBinModal({
  isOpen,
  onClose,
  bandId,
  onItemRestored,
}: RecycleBinModalProps) {
  const designTokens = useDesignTokens();
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyingBin, setEmptyingBin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bandId) {
      loadItems();
    }
  }, [isOpen, bandId]);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await db.recycleBin.getItems(bandId);
      if (error) {
        setError('Failed to load recycle bin');
        console.error('Error loading recycle bin:', error);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      setError('Failed to load recycle bin');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item: RecycleBinItem) => {
    setRestoring(item.id);
    setError(null);
    try {
      let result;
      switch (item.item_type) {
        case 'track':
          result = await db.recycleBin.restoreTrack(item.id);
          break;
        case 'work':
          result = await db.recycleBin.restoreWork(item.id);
          break;
        case 'set_list':
          result = await db.recycleBin.restoreSetList(item.id);
          break;
      }

      if (result?.error) {
        setError(`Failed to restore ${item.name}`);
      } else {
        // Remove from list
        setItems(items.filter(i => i.id !== item.id));
        onItemRestored?.();
      }
    } catch (err) {
      setError(`Failed to restore ${item.name}`);
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async (item: RecycleBinItem) => {
    if (!confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(item.id);
    setError(null);
    try {
      let result;
      switch (item.item_type) {
        case 'track':
          result = await db.recycleBin.permanentDeleteTrack(item.id);
          break;
        case 'work':
          result = await db.recycleBin.permanentDeleteWork(item.id);
          break;
        case 'set_list':
          result = await db.recycleBin.permanentDeleteSetList(item.id);
          break;
      }

      if (result?.error) {
        setError(`Failed to delete ${item.name}`);
      } else {
        setItems(items.filter(i => i.id !== item.id));
      }
    } catch (err) {
      setError(`Failed to delete ${item.name}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleEmptyBin = async () => {
    setEmptyingBin(true);
    setError(null);
    try {
      await db.recycleBin.emptyRecycleBin(bandId);
      setItems([]);
      setShowEmptyConfirm(false);
    } catch (err) {
      setError('Failed to empty recycle bin');
    } finally {
      setEmptyingBin(false);
    }
  };

  const formatDeletedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'track':
        return <Music size={16} />;
      case 'work':
        return <FileText size={16} />;
      case 'set_list':
        return <List size={16} />;
      default:
        return <Trash2 size={16} />;
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'track':
        return 'Track';
      case 'work':
        return 'Work';
      case 'set_list':
        return 'Set List';
      default:
        return itemType;
    }
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Recycle Bin"
      size="md"
    >
      <div style={{ minHeight: '300px' }}>
        {/* Header info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing.sm,
          padding: designTokens.spacing.md,
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.md,
          marginBottom: designTokens.spacing.md,
        }}>
          <Clock size={16} color={designTokens.colors.text.muted} />
          <span style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.secondary,
          }}>
            Items are automatically deleted after 30 days
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.feedback.error.bg,
            border: `1px solid ${designTokens.colors.feedback.error.border}`,
            borderRadius: designTokens.borderRadius.md,
            color: designTokens.colors.feedback.error.text,
            marginBottom: designTokens.spacing.md,
          }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: designTokens.spacing.xl,
            color: designTokens.colors.text.muted,
          }}>
            Loading...
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div style={{
            textAlign: 'center',
            padding: designTokens.spacing.xl,
            color: designTokens.colors.text.muted,
          }}>
            <Trash2 size={48} style={{ opacity: 0.3, marginBottom: designTokens.spacing.md }} />
            <p>Recycle bin is empty</p>
          </div>
        ) : (
          /* Items list */
          <>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.xs,
            }}>
              {items.map(item => {
                const daysRemaining = getDaysRemaining(item.expires_at);
                const isExpiringSoon = daysRemaining <= 7;

                return (
                  <div
                    key={`${item.item_type}-${item.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.sm,
                      padding: designTokens.spacing.sm,
                      backgroundColor: designTokens.colors.surface.primary,
                      borderRadius: designTokens.borderRadius.sm,
                      border: `1px solid ${designTokens.colors.borders.default}`,
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: designTokens.borderRadius.sm,
                      backgroundColor: designTokens.colors.surface.tertiary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: designTokens.colors.text.muted,
                      flexShrink: 0,
                    }}>
                      {getItemIcon(item.item_type)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: designTokens.typography.fontSizes.body,
                        fontWeight: designTokens.typography.fontWeights.medium,
                        color: designTokens.colors.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.sm,
                        fontSize: designTokens.typography.fontSizes.caption,
                        color: designTokens.colors.text.muted,
                      }}>
                        <span>{getItemTypeLabel(item.item_type)}</span>
                        <span>•</span>
                        <span>Deleted {formatDeletedDate(item.deleted_at)}</span>
                        {isExpiringSoon && (
                          <>
                            <span>•</span>
                            <span style={{ color: designTokens.colors.system.error }}>
                              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
                      <button
                        onClick={() => handleRestore(item)}
                        disabled={restoring === item.id || deleting === item.id}
                        title="Restore"
                        style={{
                          padding: designTokens.spacing.xs,
                          backgroundColor: 'transparent',
                          border: `1px solid ${designTokens.colors.borders.default}`,
                          borderRadius: designTokens.borderRadius.sm,
                          color: designTokens.colors.text.secondary,
                          cursor: restoring === item.id ? 'not-allowed' : 'pointer',
                          opacity: restoring === item.id ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <RotateCcw size={14} />
                        <span style={{ fontSize: designTokens.typography.fontSizes.caption }}>
                          {restoring === item.id ? 'Restoring...' : 'Restore'}
                        </span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        disabled={restoring === item.id || deleting === item.id}
                        title="Delete permanently"
                        style={{
                          padding: designTokens.spacing.xs,
                          backgroundColor: 'transparent',
                          border: `1px solid ${designTokens.colors.system.error}`,
                          borderRadius: designTokens.borderRadius.sm,
                          color: designTokens.colors.system.error,
                          cursor: deleting === item.id ? 'not-allowed' : 'pointer',
                          opacity: deleting === item.id ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty bin button */}
            {items.length > 0 && (
              <div style={{
                marginTop: designTokens.spacing.lg,
                paddingTop: designTokens.spacing.md,
                borderTop: `1px solid ${designTokens.colors.borders.default}`,
              }}>
                {showEmptyConfirm ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.sm,
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.feedback.error.bg,
                    borderRadius: designTokens.borderRadius.md,
                  }}>
                    <AlertTriangle size={16} color={designTokens.colors.system.error} />
                    <span style={{
                      flex: 1,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.system.error,
                    }}>
                      Delete all {items.length} items permanently?
                    </span>
                    <button
                      onClick={() => setShowEmptyConfirm(false)}
                      style={{
                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                        backgroundColor: 'transparent',
                        border: `1px solid ${designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.sm,
                        color: designTokens.colors.text.secondary,
                        cursor: 'pointer',
                        fontSize: designTokens.typography.fontSizes.caption,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEmptyBin}
                      disabled={emptyingBin}
                      style={{
                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                        backgroundColor: designTokens.colors.system.error,
                        border: 'none',
                        borderRadius: designTokens.borderRadius.sm,
                        color: designTokens.colors.neutral.white,
                        cursor: emptyingBin ? 'not-allowed' : 'pointer',
                        fontSize: designTokens.typography.fontSizes.caption,
                      }}
                    >
                      {emptyingBin ? 'Deleting...' : 'Delete All'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEmptyConfirm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.xs,
                      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                      backgroundColor: 'transparent',
                      border: `1px solid ${designTokens.colors.system.error}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.system.error,
                      cursor: 'pointer',
                      fontSize: designTokens.typography.fontSizes.body,
                    }}
                  >
                    <Trash2 size={16} />
                    Empty Recycle Bin
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DialogModal>
  );
}

export default RecycleBinModal;
