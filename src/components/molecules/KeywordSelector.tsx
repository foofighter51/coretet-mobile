import React, { useState, useEffect } from 'react';
import { designTokens } from '../../design/designTokens';
import { keywordHelpers } from '../../../lib/supabase';
import { Tag, X } from 'lucide-react';

interface Keyword {
  id: string;
  name: string;
  color: string | null;
}

interface TrackKeyword {
  id: string;
  keyword_id: string;
  keywords: Keyword;
}

interface KeywordSelectorProps {
  trackId: string;
  bandId: string;
  userId: string;
}

export const KeywordSelector: React.FC<KeywordSelectorProps> = ({
  trackId,
  bandId,
  userId,
}) => {
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
  const [trackKeywords, setTrackKeywords] = useState<TrackKeyword[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKeywords();
    loadTrackKeywords();
  }, [trackId, bandId]);

  const loadKeywords = async () => {
    const { data, error } = await keywordHelpers.getKeywordsForBand(bandId);
    if (error) {
      console.error('[KeywordSelector] Error loading keywords:', error);
    } else {
      setAllKeywords(data || []);
    }
  };

  const loadTrackKeywords = async () => {
    const { data, error } = await keywordHelpers.getKeywordsForTrack(trackId);
    if (error) {
      console.error('[KeywordSelector] Error loading track keywords:', error);
    } else {
      setTrackKeywords(data || []);
    }
  };

  const handleAddKeywordByName = async (keywordName: string) => {
    if (!keywordName.trim()) return;

    setLoading(true);
    setError(null);

    // First, create or get the keyword
    const { data: keyword, error: createError } = await keywordHelpers.createKeyword(
      bandId,
      keywordName.trim(),
      userId
    );

    if (createError) {
      // Check if it's a duplicate error - if so, find the existing keyword
      if (createError.message?.includes('duplicate') || createError.code === '23505') {
        // Find existing keyword by name
        const existingKeyword = allKeywords.find(
          k => k.name.toLowerCase() === keywordName.trim().toLowerCase()
        );

        if (existingKeyword) {
          // Add the existing keyword to the track
          const { error: addError } = await keywordHelpers.addKeywordToTrack(
            trackId,
            existingKeyword.id,
            userId
          );

          if (addError && !addError.message?.includes('duplicate')) {
            console.error('[KeywordSelector] Error adding existing keyword:', addError);
            setError('Failed to add keyword');
          } else {
            await loadTrackKeywords();
            setNewKeywordInput('');
          }
        }
      } else {
        console.error('[KeywordSelector] Error creating keyword:', createError);
        setError('Failed to create keyword');
      }
    } else if (keyword) {
      // Keyword created successfully, now add it to the track
      const { error: addError } = await keywordHelpers.addKeywordToTrack(
        trackId,
        keyword.id,
        userId
      );

      if (addError) {
        console.error('[KeywordSelector] Error adding keyword to track:', addError);
        setError('Failed to add keyword');
      } else {
        await loadKeywords(); // Refresh keyword list
        await loadTrackKeywords();
        setNewKeywordInput('');
      }
    }

    setLoading(false);
  };

  const handleRemoveKeyword = async (keywordId: string) => {
    setLoading(true);
    const { error } = await keywordHelpers.removeKeywordFromTrack(trackId, keywordId);

    if (error) {
      console.error('[KeywordSelector] Error removing keyword:', error);
      setError('Failed to remove keyword');
    } else {
      await loadTrackKeywords();
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newKeywordInput.trim()) {
      handleAddKeywordByName(newKeywordInput);
    }
  };

  // Get suggested keywords (existing keywords not on this track)
  const suggestedKeywords = allKeywords.filter(
    k => !trackKeywords.some(tk => tk.keywords.id === k.id)
  ).slice(0, 5); // Show max 5 suggestions

  return (
    <div style={{
      marginTop: designTokens.spacing.md,
      borderTop: `1px solid ${designTokens.colors.borders.default}`,
      paddingTop: designTokens.spacing.md,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: designTokens.spacing.sm,
      }}>
        <h4 style={{
          fontSize: designTokens.typography.fontSizes.bodySmall,
          fontWeight: designTokens.typography.fontWeights.semibold,
          color: designTokens.colors.text.secondary,
          margin: 0,
        }}>
          Keywords
        </h4>
      </div>

      {/* Current keywords */}
      {trackKeywords.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: designTokens.spacing.xs,
          marginBottom: designTokens.spacing.sm,
        }}>
          {trackKeywords.map((tk) => (
            <div
              key={tk.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                backgroundColor: tk.keywords.color || designTokens.colors.primary.blueLight,
                color: designTokens.colors.text.primary,
                borderRadius: designTokens.borderRadius.md,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.medium,
              }}
            >
              <Tag size={12} />
              <span>{tk.keywords.name}</span>
              <button
                onClick={() => handleRemoveKeyword(tk.keywords.id)}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  color: designTokens.colors.text.secondary,
                  opacity: loading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={`Remove ${tk.keywords.name}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new keyword input */}
      <div style={{ marginBottom: designTokens.spacing.sm }}>
        <input
          type="text"
          value={newKeywordInput}
          onChange={(e) => setNewKeywordInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add keyword (press Enter)"
          disabled={loading}
          style={{
            width: '100%',
            padding: designTokens.spacing.sm,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.sm,
            backgroundColor: designTokens.colors.surface.primary,
            color: designTokens.colors.text.primary,
            opacity: loading ? 0.5 : 1,
          }}
        />
      </div>

      {/* Suggested keywords (quick add) */}
      {suggestedKeywords.length > 0 && (
        <div>
          <p style={{
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.text.secondary,
            marginBottom: designTokens.spacing.xs,
            margin: 0,
          }}>
            Suggested:
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: designTokens.spacing.xs,
            marginTop: designTokens.spacing.xs,
          }}>
            {suggestedKeywords.map((keyword) => (
              <button
                key={keyword.id}
                onClick={() => handleAddKeywordByName(keyword.name)}
                disabled={loading}
                style={{
                  padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                  backgroundColor: designTokens.colors.surface.secondary,
                  color: designTokens.colors.text.secondary,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.md,
                  fontSize: designTokens.typography.fontSizes.caption,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                }}
              >
                <Tag size={10} />
                {keyword.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p style={{
          marginTop: designTokens.spacing.xs,
          fontSize: designTokens.typography.fontSizes.caption,
          color: designTokens.colors.error.text,
          margin: 0,
        }}>
          {error}
        </p>
      )}
    </div>
  );
};
