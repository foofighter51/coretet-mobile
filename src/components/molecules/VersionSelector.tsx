import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db } from '../../../lib/supabase';

interface Version {
  id: string;
  version_number: number;
  is_hero: boolean;
  uploaded_at: string;
  uploaded_by: string;
  file_url: string;
  duration_seconds?: number;
  notes?: string;
}

interface VersionSelectorProps {
  trackId: string;
  currentVersionId?: string;
  onVersionSelect: (version: Version) => void;
  userRole?: 'admin' | 'owner' | 'member';
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  trackId,
  currentVersionId,
  onVersionSelect,
  userRole,
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settingHero, setSettingHero] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [trackId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      console.log('[VersionSelector] Fetching versions for track:', trackId);

      // First, check if this track is part of a version group
      const { data: groupData, error: groupError } = await db.versionGroups.getGroupForTrack(trackId);

      if (groupData && !groupError) {
        // Track is in a version group - fetch all tracks in the group
        console.log('[VersionSelector] Track is in version group:', groupData);
        const { data: tracksData, error: tracksError } = await db.versionGroups.getTracksInGroup(groupData.id);

        if (tracksError) {
          console.error('[VersionSelector] Failed to fetch grouped tracks:', tracksError);
          setVersions([]);
          return;
        }

        // Convert tracks to version format for display
        const groupedVersions = (tracksData || []).map((track: any, index: number) => ({
          id: track.id,
          version_number: index + 1,
          is_hero: track.id === groupData.hero_track_id,
          uploaded_at: track.created_at,
          file_url: track.file_url,
          duration_seconds: track.duration_seconds,
          track_title: track.title, // Store title for display
        }));

        console.log('[VersionSelector] Fetched grouped tracks as versions:', groupedVersions);
        setVersions(groupedVersions);
        return;
      }

      // Not in a group - fall back to old track_versions system
      const { data, error } = await db.trackVersions.getByTrack(trackId);

      if (error) {
        console.error('[VersionSelector] Failed to fetch versions:', error);
        setVersions([]);
        return;
      }

      console.log('[VersionSelector] Fetched track_versions:', data);
      setVersions(data || []);
    } catch (error) {
      console.error('[VersionSelector] Error fetching versions:', error);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetHero = async (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!['admin', 'owner'].includes(userRole || '')) {
      return;
    }

    try {
      setSettingHero(true);
      const { error } = await db.trackVersions.setHeroVersion(trackId, versionId);

      if (error) {
        console.error('Failed to set hero version:', error);
        return;
      }

      // Refresh versions to show updated hero status
      await fetchVersions();
    } catch (error) {
      console.error('Error setting hero version:', error);
    } finally {
      setSettingHero(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ padding: designTokens.spacing.md, textAlign: 'center' }}>
        <p style={{ color: designTokens.colors.neutral.gray }}>Loading versions...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div style={{ padding: designTokens.spacing.md, textAlign: 'center' }}>
        <p style={{ color: designTokens.colors.neutral.gray }}>No versions found</p>
        <p style={{ color: designTokens.colors.neutral.gray, fontSize: designTokens.typography.fontSizes.caption, marginTop: designTokens.spacing.xs }}>
          Check console for errors
        </p>
      </div>
    );
  }

  // Hide component if only one version exists
  if (versions.length <= 1) return null;

  const heroVersion = versions.find(v => v.is_hero);
  const otherVersions = versions.filter(v => !v.is_hero);
  const canSetHero = ['admin', 'owner'].includes(userRole || '');

  return (
    <div style={{
      marginTop: designTokens.spacing.md,
      border: `1px solid ${designTokens.colors.borders.default}`,
      borderRadius: designTokens.borderRadius.md,
      overflow: 'hidden',
    }}>
      {/* Hero Version */}
      {heroVersion && (
        <div
          onClick={() => onVersionSelect(heroVersion)}
          style={{
            padding: designTokens.spacing.md,
            backgroundColor: currentVersionId === heroVersion.id
              ? designTokens.colors.surface.hover
              : designTokens.colors.neutral.white,
            cursor: 'pointer',
            borderBottom: otherVersions.length > 0 ? `1px solid ${designTokens.colors.borders.default}` : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
                <Star
                  size={16}
                  fill={designTokens.colors.accent.yellow}
                  color={designTokens.colors.accent.yellow}
                />
                <span style={{
                  fontSize: designTokens.typography.fontSizes.body,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.neutral.charcoal,
                }}>
                  {heroVersion.track_title || `Version ${heroVersion.version_number}`} (Hero)
                </span>
              </div>
              <p style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.neutral.gray,
                marginTop: designTokens.spacing.xxs,
              }}>
                {formatDate(heroVersion.uploaded_at)}
              </p>
            </div>
            {currentVersionId === heroVersion.id && (
              <span style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.primary.blue,
                fontWeight: designTokens.typography.fontWeights.semibold,
              }}>
                Playing
              </span>
            )}
          </div>
        </div>
      )}

      {/* Other Versions (Collapsible) */}
      {otherVersions.length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: '100%',
              padding: designTokens.spacing.sm,
              backgroundColor: designTokens.colors.surface.secondary,
              border: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: designTokens.spacing.xs,
              cursor: 'pointer',
              color: designTokens.colors.neutral.darkGray,
              fontSize: designTokens.typography.fontSizes.bodySmall,
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {otherVersions.length} other version{otherVersions.length > 1 ? 's' : ''}
          </button>

          {isExpanded && (
            <div>
              {otherVersions.map((version) => (
                <div
                  key={version.id}
                  onClick={() => onVersionSelect(version)}
                  style={{
                    padding: designTokens.spacing.md,
                    backgroundColor: currentVersionId === version.id
                      ? designTokens.colors.surface.hover
                      : designTokens.colors.neutral.white,
                    cursor: 'pointer',
                    borderTop: `1px solid ${designTokens.colors.borders.default}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
                        <span style={{
                          fontSize: designTokens.typography.fontSizes.body,
                          color: designTokens.colors.neutral.charcoal,
                        }}>
                          {version.track_title || `Version ${version.version_number}`}
                        </span>
                        {canSetHero && (
                          <button
                            onClick={(e) => handleSetHero(version.id, e)}
                            disabled={settingHero}
                            style={{
                              padding: `2px ${designTokens.spacing.xs}`,
                              fontSize: designTokens.typography.fontSizes.caption,
                              backgroundColor: 'transparent',
                              border: `1px solid ${designTokens.colors.neutral.gray}`,
                              borderRadius: designTokens.borderRadius.sm,
                              color: designTokens.colors.neutral.gray,
                              cursor: settingHero ? 'not-allowed' : 'pointer',
                            }}
                          >
                            Make Hero
                          </button>
                        )}
                      </div>
                      <p style={{
                        fontSize: designTokens.typography.fontSizes.caption,
                        color: designTokens.colors.neutral.gray,
                        marginTop: designTokens.spacing.xxs,
                      }}>
                        {formatDate(version.uploaded_at)}
                      </p>
                    </div>
                    {currentVersionId === version.id && (
                      <span style={{
                        fontSize: designTokens.typography.fontSizes.caption,
                        color: designTokens.colors.primary.blue,
                        fontWeight: designTokens.typography.fontWeights.semibold,
                      }}>
                        Playing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
