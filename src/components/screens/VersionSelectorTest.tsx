import React, { useState, useEffect } from 'react';
import { VersionSelector } from '../molecules/VersionSelector';
import { designTokens } from '../../design/designTokens';
import { db } from '../../../lib/supabase';

export const VersionSelectorTest: React.FC = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      // Get current user's ID from auth
      const { data: { user } } = await db.auth.getUser();

      if (!user) {
        console.error('No user logged in');
        setTracks([]);
        setLoading(false);
        return;
      }

      // Get all tracks for the current user
      const { data, error } = await db.tracks.getByUser(user.id);

      if (error) {
        console.error('Error fetching tracks:', error);
        setTracks([]);
      } else {
        console.log('Fetched tracks:', data);
        setTracks(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (version: any) => {
    console.log('Version selected:', version);
    setSelectedVersion(version);
  };

  return (
    <div style={{
      padding: designTokens.spacing.lg,
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h1 style={{
        fontSize: designTokens.typography.fontSizes.h1,
        fontWeight: designTokens.typography.fontWeights.bold,
        marginBottom: designTokens.spacing.lg,
      }}>
        Version Selector Test
      </h1>

      {loading ? (
        <p>Loading tracks...</p>
      ) : tracks.length === 0 ? (
        <div style={{
          padding: designTokens.spacing.lg,
          textAlign: 'center',
          color: designTokens.colors.neutral.gray,
        }}>
          <p>No tracks found. Try uploading a track first!</p>
          <p style={{ fontSize: designTokens.typography.fontSizes.caption, marginTop: designTokens.spacing.sm }}>
            Check the console for errors.
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <h2 style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              marginBottom: designTokens.spacing.md,
            }}>
              Select a track to test ({tracks.length} tracks):
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setSelectedTrack(track);
                    setSelectedVersion(null);
                  }}
                  style={{
                    padding: designTokens.spacing.md,
                    backgroundColor: selectedTrack?.id === track.id
                      ? designTokens.colors.primary.blue
                      : designTokens.colors.surface.primary,
                    color: selectedTrack?.id === track.id
                      ? designTokens.colors.neutral.white
                      : designTokens.colors.neutral.charcoal,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.md,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: designTokens.typography.fontSizes.body,
                  }}
                >
                  {track.title}
                </button>
              ))}
            </div>
          </div>

          {selectedTrack && (
            <div>
              <h2 style={{
                fontSize: designTokens.typography.fontSizes.h3,
                fontWeight: designTokens.typography.fontWeights.semibold,
                marginBottom: designTokens.spacing.md,
              }}>
                Versions for "{selectedTrack.title}":
              </h2>

              <VersionSelector
                trackId={selectedTrack.id}
                currentVersionId={selectedVersion?.id}
                onVersionSelect={handleVersionSelect}
                userRole="admin" // Test with admin role to see "Make Hero" buttons
              />

              {selectedVersion && (
                <div style={{
                  marginTop: designTokens.spacing.lg,
                  padding: designTokens.spacing.md,
                  backgroundColor: designTokens.colors.surface.secondary,
                  borderRadius: designTokens.borderRadius.md,
                }}>
                  <h3 style={{
                    fontSize: designTokens.typography.fontSizes.body,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    marginBottom: designTokens.spacing.sm,
                  }}>
                    Selected Version:
                  </h3>
                  <pre style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    backgroundColor: designTokens.colors.neutral.white,
                    padding: designTokens.spacing.sm,
                    borderRadius: designTokens.borderRadius.sm,
                    overflow: 'auto',
                  }}>
                    {JSON.stringify(selectedVersion, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
