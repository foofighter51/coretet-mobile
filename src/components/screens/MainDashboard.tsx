import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, Music, Users } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';
import { useBand } from '../../contexts/BandContext';
import { BandCard } from '../molecules/BandCard';
import { TrackRowWithPlayer } from '../molecules/TrackRowWithPlayer';
import { TabBar } from '../molecules/TabBar';
import { AudioUploader } from '../molecules/AudioUploader';
import { Band, Track, TabId } from '../../types';

const baseStyle = {
  fontFamily: designTokens.typography.fontFamily,
  width: '100%',
  maxWidth: '425px',
  minHeight: '100vh',
  margin: '0 auto',
  position: 'relative' as const
};

export function MainDashboard() {
  const { currentUser, logout } = useAuth();
  const { bands, currentBand, fetchUserBands, setCurrentBand } = useBand();
  const [activeTab, setActiveTab] = useState<TabId>('playlists');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    fetchUserBands();
  }, [fetchUserBands]);

  const handlePlay = useCallback((track: Track) => {
    setPlayingTrack(track.id === playingTrack ? null : track.id);
  }, [playingTrack]);

  const handleRatingChange = useCallback((track: Track, rating: 'like' | 'love' | 'none') => {
    console.log(`Rating changed for ${track.title}: ${rating}`);
  }, []);

  const handleBandClick = useCallback((band: Band) => {
    setCurrentBand(band);
    setActiveTab('playlists'); // Switch to playlists tab to show tracks for this band
  }, [setCurrentBand, setActiveTab]);

  const filteredTracks = useMemo(() => {
    return tracks.map(track => ({
      ...track,
      isPlaying: track.id === playingTrack
    }));
  }, [tracks, playingTrack]);

  const renderContent = () => {
    if (activeTab === 'playlists') {
      return (
        <div style={{
          padding: `0 ${designTokens.spacing.lg} ${designTokens.spacing.lg}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            marginBottom: designTokens.spacing.lg
          }}>
            <div style={{
              position: 'relative',
              flex: 1
            }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: designTokens.spacing.md,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: designTokens.colors.neutral.gray
                }}
              />
              <input
                type="text"
                placeholder="Search tracks..."
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md} ${designTokens.spacing.sm} 48px`,
                  border: 'none',
                  borderRadius: '24px',
                  backgroundColor: designTokens.colors.neutral.lightGray,
                  fontSize: designTokens.typography.fontSizes.body,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <Filter
              size={24}
              style={{ color: designTokens.colors.neutral.gray, cursor: 'pointer' }}
            />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: designTokens.spacing.xs
          }}>
            {filteredTracks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: designTokens.spacing.xxxl,
                color: designTokens.colors.neutral.gray
              }}>
                <Music size={48} style={{ marginBottom: designTokens.spacing.md, opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: designTokens.typography.fontSizes.body }}>
                  No tracks yet. Upload your first track!
                </p>
              </div>
            ) : (
              filteredTracks.map((track) => (
                <TrackRowWithPlayer
                  key={track.id}
                  track={track}
                  onPlay={() => handlePlay(track)}
                  onRatingChange={(rating) => handleRatingChange(track, rating)}
                />
              ))
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'bands') {
      return (
        <div style={{
          padding: `0 ${designTokens.spacing.lg} ${designTokens.spacing.lg}`
        }}>
          {bands.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: designTokens.spacing.xxxl,
              color: designTokens.colors.neutral.gray
            }}>
              <Users size={48} style={{ marginBottom: designTokens.spacing.md, opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: designTokens.typography.fontSizes.body }}>
                No bands yet. Join or create a band!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.md
            }}>
              {bands.map((band) => (
                <div
                  key={band.id}
                  onClick={() => handleBandClick(band)}
                  style={{
                    padding: designTokens.spacing.lg,
                    backgroundColor: currentBand?.id === band.id
                      ? designTokens.colors.primary.blue + '10'
                      : designTokens.colors.neutral.white,
                    border: currentBand?.id === band.id
                      ? `2px solid ${designTokens.colors.primary.blue}`
                      : `2px solid ${designTokens.colors.neutral.lightGray}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h3 style={{
                    margin: `0 0 ${designTokens.spacing.xs} 0`,
                    fontSize: designTokens.typography.fontSizes.h4,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    color: designTokens.colors.neutral.charcoal
                  }}>
                    {band.name}
                  </h3>
                  {band.description && (
                    <p style={{
                      margin: `0 0 ${designTokens.spacing.sm} 0`,
                      fontSize: designTokens.typography.fontSizes.body,
                      color: designTokens.colors.neutral.darkGray
                    }}>
                      {band.description}
                    </p>
                  )}
                  <p style={{
                    margin: 0,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.neutral.gray
                  }}>
                    Invite Code: {band.invite_code}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'add') {
      return (
        <div style={{
          padding: `0 ${designTokens.spacing.lg} ${designTokens.spacing.lg}`
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: designTokens.spacing.lg
          }}>
            <h2 style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              margin: `0 0 ${designTokens.spacing.sm} 0`,
              color: designTokens.colors.neutral.charcoal
            }}>
              Upload a New Track
            </h2>
            <p style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.neutral.darkGray,
              margin: 0
            }}>
              Share your music with your band
            </p>
          </div>

          {/* Upload Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: designTokens.spacing.md
          }}>
            <button
              onClick={() => {
                // TODO: Implement device upload
                console.log('Upload from device clicked');
              }}
              style={{
                width: '100%',
                padding: designTokens.spacing.lg,
                border: `2px solid ${designTokens.colors.primary.blue}`,
                borderRadius: '12px',
                backgroundColor: designTokens.colors.neutral.white,
                textAlign: 'center',
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.primary.blue,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
                e.currentTarget.style.color = designTokens.colors.neutral.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
                e.currentTarget.style.color = designTokens.colors.primary.blue;
              }}
            >
              Upload from Device
            </button>

            <button
              onClick={() => {
                // TODO: Implement cloud upload
                console.log('Upload from cloud clicked');
              }}
              style={{
                width: '100%',
                padding: designTokens.spacing.lg,
                border: `2px solid ${designTokens.colors.neutral.gray}`,
                borderRadius: '12px',
                backgroundColor: designTokens.colors.neutral.white,
                textAlign: 'center',
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.neutral.darkGray,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.lightGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
              }}
            >
              Upload from Cloud
            </button>

            <button
              onClick={() => {
                // TODO: Implement audio recording
                console.log('Record audio clicked');
              }}
              style={{
                width: '100%',
                padding: designTokens.spacing.lg,
                border: `2px solid ${designTokens.colors.neutral.gray}`,
                borderRadius: '12px',
                backgroundColor: designTokens.colors.neutral.white,
                textAlign: 'center',
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.neutral.darkGray,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.lightGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
              }}
            >
              Record Audio
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div style={{
          padding: `0 ${designTokens.spacing.lg} ${designTokens.spacing.lg}`
        }}>
          {/* User Info */}
          <div style={{
            textAlign: 'center',
            marginBottom: designTokens.spacing.lg
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              backgroundColor: designTokens.colors.primary.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: `0 auto ${designTokens.spacing.md}`,
              fontSize: '32px',
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.neutral.white
            }}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h2 style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              margin: `0 0 ${designTokens.spacing.xs} 0`,
              color: designTokens.colors.neutral.charcoal
            }}>
              {currentUser?.name || 'User'}
            </h2>
            <p style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.neutral.darkGray,
              margin: 0
            }}>
              {currentUser?.phoneNumber || 'Phone not available'}
            </p>
          </div>

          {/* Settings Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: designTokens.spacing.xs
          }}>
            <button
              onClick={() => {
                // TODO: Implement edit profile
                console.log('Edit profile clicked');
              }}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                border: 'none',
                borderRadius: '12px',
                backgroundColor: designTokens.colors.neutral.white,
                textAlign: 'left',
                fontSize: designTokens.typography.fontSizes.body,
                color: designTokens.colors.neutral.charcoal,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.lightGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
              }}
            >
              Edit Profile
            </button>

            <button
              onClick={() => {
                // TODO: Implement manage bands
                console.log('Manage bands clicked');
              }}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                border: 'none',
                borderRadius: '12px',
                backgroundColor: designTokens.colors.neutral.white,
                textAlign: 'left',
                fontSize: designTokens.typography.fontSizes.body,
                color: designTokens.colors.neutral.charcoal,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.lightGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
              }}
            >
              My Bands
            </button>

            <button
              onClick={() => {
                // TODO: Implement settings
                console.log('Settings clicked');
              }}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                border: 'none',
                borderRadius: '12px',
                backgroundColor: designTokens.colors.neutral.white,
                textAlign: 'left',
                fontSize: designTokens.typography.fontSizes.body,
                color: designTokens.colors.neutral.charcoal,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.lightGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
              }}
            >
              Settings
            </button>
          </div>

          {/* Logout Section */}
          <div style={{
            marginTop: designTokens.spacing.lg,
            paddingTop: designTokens.spacing.lg,
            borderTop: `1px solid ${designTokens.colors.neutral.lightGray}`
          }}>
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                border: `1px solid ${designTokens.colors.accent.red}`,
                borderRadius: '12px',
                backgroundColor: 'transparent',
                textAlign: 'center',
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.accent.red,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.accent.red;
                e.currentTarget.style.color = designTokens.colors.neutral.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = designTokens.colors.accent.red;
              }}
            >
              Log Out
            </button>
          </div>

          {/* App Info */}
          <div style={{
            textAlign: 'center',
            marginTop: designTokens.spacing.lg,
            padding: designTokens.spacing.md,
            color: designTokens.colors.neutral.gray,
            fontSize: designTokens.typography.fontSizes.caption
          }}>
            CoreTet v1.0.0
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{
      ...baseStyle,
      backgroundColor: designTokens.colors.neutral.white,
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        padding: `${designTokens.spacing.lg} ${designTokens.spacing.lg} 0`,
        borderBottom: `1px solid ${designTokens.colors.neutral.lightGray}`,
        marginBottom: designTokens.spacing.lg
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: designTokens.spacing.lg
        }}>
          <h1 style={{
            fontSize: designTokens.typography.fontSizes.h2,
            fontWeight: designTokens.typography.fontWeights.semibold,
            margin: 0,
            color: designTokens.colors.neutral.charcoal
          }}>
            Hello, {currentUser?.name || 'User'}!
          </h1>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: designTokens.colors.neutral.gray,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}