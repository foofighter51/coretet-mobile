import React, { useState, useEffect } from 'react';
import { DialogModal } from '../ui/DialogModal';
import { designTokens } from '../../design/designTokens';
import { keywordHelpers } from '../../../lib/supabase';
import { X, Plus, Tag } from 'lucide-react';

interface Keyword {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

interface KeywordManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bandId: string;
  userId: string;
  userRole: 'owner' | 'admin' | 'member';
}

export const KeywordManagerModal: React.FC<KeywordManagerModalProps> = ({
  isOpen,
  onClose,
  bandId,
  userId,
  userRole,
}) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeywordName, setNewKeywordName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = ['owner', 'admin'].includes(userRole);

  // Load keywords
  useEffect(() => {
    if (isOpen && bandId) {
      loadKeywords();
    }
  }, [isOpen, bandId]);

  const loadKeywords = async () => {
    setLoading(true);
    const { data, error } = await keywordHelpers.getKeywordsForBand(bandId);
    if (error) {
      console.error('[KeywordManagerModal] Error loading keywords:', error);
      setError('Failed to load keywords');
    } else {
      setKeywords(data || []);
    }
    setLoading(false);
  };

  const handleCreateKeyword = async () => {
    if (!newKeywordName.trim()) return;
    if (!isAdmin) {
      setError('Only admins can create keywords');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await keywordHelpers.createKeyword(
      bandId,
      newKeywordName,
      userId
    );

    if (error) {
      console.error('[KeywordManagerModal] Error creating keyword:', error);
      // Check for duplicate keyword error
      if (error.message?.includes('duplicate') || error.code === '23505') {
        setError('This keyword already exists');
      } else {
        setError('Failed to create keyword');
      }
    } else if (data) {
      setKeywords([...keywords, data]);
      setNewKeywordName('');
    }

    setLoading(false);
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    if (!isAdmin) {
      setError('Only admins can delete keywords');
      return;
    }

    if (!confirm('Are you sure you want to delete this keyword? It will be removed from all tracks.')) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await keywordHelpers.deleteKeyword(keywordId);

    if (error) {
      console.error('[KeywordManagerModal] Error deleting keyword:', error);
      setError('Failed to delete keyword');
    } else {
      setKeywords(keywords.filter(k => k.id !== keywordId));
    }

    setLoading(false);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Keywords"
      width="500px"
    >
      <div style={{ padding: designTokens.spacing.md }}>
        {/* Create New Keyword */}
        {isAdmin && (
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Create New Keyword
            </label>
            <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
              <input
                type="text"
                value={newKeywordName}
                onChange={(e) => setNewKeywordName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateKeyword();
                  }
                }}
                placeholder="e.g. Upbeat, Ballad, Needs Vocals"
                style={{
                  flex: 1,
                  padding: designTokens.spacing.sm,
                  fontSize: designTokens.typography.fontSizes.body,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.sm,
                  backgroundColor: designTokens.colors.surface.primary,
                  color: designTokens.colors.text.primary,
                }}
              />
              <button
                onClick={handleCreateKeyword}
                disabled={loading || !newKeywordName.trim()}
                style={{
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: designTokens.colors.primary.blue,
                  color: designTokens.colors.text.inverse,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.sm,
                  fontSize: designTokens.typography.fontSizes.body,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  cursor: loading || !newKeywordName.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !newKeywordName.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: designTokens.spacing.sm,
            marginBottom: designTokens.spacing.md,
            backgroundColor: designTokens.colors.error.bg,
            color: designTokens.colors.error.text,
            borderRadius: designTokens.borderRadius.sm,
            fontSize: designTokens.typography.fontSizes.bodySmall,
          }}>
            {error}
          </div>
        )}

        {/* Keywords List */}
        <div>
          <h3 style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.secondary,
            marginBottom: designTokens.spacing.sm,
          }}>
            Existing Keywords ({keywords.length})
          </h3>

          {loading && keywords.length === 0 ? (
            <p style={{
              color: designTokens.colors.text.secondary,
              fontSize: designTokens.typography.fontSizes.body,
              textAlign: 'center',
              padding: designTokens.spacing.lg,
            }}>
              Loading keywords...
            </p>
          ) : keywords.length === 0 ? (
            <p style={{
              color: designTokens.colors.text.secondary,
              fontSize: designTokens.typography.fontSizes.body,
              textAlign: 'center',
              padding: designTokens.spacing.lg,
            }}>
              No keywords yet. {isAdmin && 'Create one above to get started!'}
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: designTokens.spacing.sm,
            }}>
              {keywords.map((keyword) => (
                <div
                  key={keyword.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.xs,
                    padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                    backgroundColor: keyword.color || designTokens.colors.primary.blueLight,
                    color: designTokens.colors.text.primary,
                    borderRadius: designTokens.borderRadius.md,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                  }}
                >
                  <Tag size={14} />
                  <span>{keyword.name}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteKeyword(keyword.id)}
                      disabled={loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        padding: 0,
                        color: designTokens.colors.text.secondary,
                        opacity: loading ? 0.5 : 1,
                      }}
                      aria-label={`Delete ${keyword.name}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Notice */}
        {!isAdmin && (
          <p style={{
            marginTop: designTokens.spacing.md,
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.text.secondary,
            textAlign: 'center',
          }}>
            Only admins can create or delete keywords
          </p>
        )}
      </div>
    </DialogModal>
  );
};
