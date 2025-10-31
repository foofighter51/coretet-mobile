import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Music, Heart } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db, auth } from '../../../lib/supabase';
import { PlaybackBar } from '../molecules/PlaybackBar';

export function PublicPlaylistView() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!shareCode) {
        console.error('🎵 No shareCode provided');
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // Fetch playlist by share_code
        const { data: playlistData, error: playlistError } = await db.playlists.getByShareCode(shareCode);


        if (playlistError || !playlistData) {
          console.error('🎵 Playlist not found or error:', playlistError);
          setError('Playlist not found');
          setLoading(false);
          return;
        }

        setPlaylist(playlistData);

        // Fetch playlist tracks
        const { data: trackData, error: trackError } = await db.playlistItems.getByPlaylist(playlistData.id);

        if (trackError) {
          console.error('Failed to fetch tracks:', trackError);
          setError('Failed to load playlist tracks');
          setLoading(false);
          return;
        }

        setTracks(trackData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError('An error occurred');
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [shareCode]);

  // Check if user is logged in and following
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const { user } = await auth.getCurrentUser();
        if (user && playlist) {
          setCurrentUserId(user.id);
          const { isFollowing: following } = await db.playlistFollowers.isFollowing(playlist.id, user.id);
          setIsFollowing(following);
        }
      } catch (error) {
        // Silently fail if user is not logged in or table doesn't exist
      }
    };

    if (playlist) {
      checkFollowStatus();
    }
  }, [playlist]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !playlist) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await db.playlistFollowers.unfollow(playlist.id, currentUserId);
        setIsFollowing(false);
      } else {
        await db.playlistFollowers.follow(playlist.id, currentUserId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePlayPause = async (track?: any) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const targetTrack = track || currentTrack;
      if (!targetTrack) {
        return;
      }


      if (currentlyPlayingTrack === targetTrack.id) {
        audioRef.current.pause();
        setCurrentlyPlayingTrack(null);
      } else {
        audioRef.current.src = targetTrack.file_url;
        await audioRef.current.play();
        setCurrentlyPlayingTrack(targetTrack.id);
        setCurrentTrack(targetTrack);
      }
    } catch (error) {
      console.error('🎵 Error in handlePlayPause:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: designTokens.typography.fontFamily,
        width: '100%',
        maxWidth: '425px',
        height: '100vh',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: designTokens.colors.neutral.darkGray }}>Loading playlist...</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div style={{
        fontFamily: designTokens.typography.fontFamily,
        width: '100%',
        maxWidth: '425px',
        height: '100vh',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <Music size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <p style={{
          color: designTokens.colors.neutral.darkGray,
          marginBottom: '16px',
          fontSize: '16px',
        }}>
          {error || 'Playlist not found'}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: designTokens.colors.primary.blue,
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Go to App
        </button>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: designTokens.typography.fontFamily,
      width: '100%',
      maxWidth: '425px',
      height: '100vh',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
            backgroundColor: 'transparent',
            color: designTokens.colors.primary.blue,
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
          Back to App
        </button>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              marginBottom: '4px',
            }}>
              {playlist.title}
            </h1>
            {playlist.description && (
              <p style={{
                fontSize: '14px',
                color: designTokens.colors.neutral.darkGray,
              }}>
                {playlist.description}
              </p>
            )}
          </div>

          {/* Follow button - only show if user is logged in and not owner */}
          {currentUserId && currentUserId !== playlist.created_by && (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: isFollowing ? '#ffffff' : designTokens.colors.primary.blue,
                color: isFollowing ? designTokens.colors.primary.blue : '#ffffff',
                border: isFollowing ? `1px solid ${designTokens.colors.primary.blue}` : 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: followLoading ? 'not-allowed' : 'pointer',
                opacity: followLoading ? 0.6 : 1,
                flexShrink: 0,
                marginLeft: '12px',
              }}
            >
              <Heart size={16} fill={isFollowing ? designTokens.colors.primary.blue : 'none'} />
              {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: designTokens.spacing.md,
        paddingBottom: currentTrack ? '100px' : designTokens.spacing.md, // Space for PlaybackBar when visible
      }}>
        {tracks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: designTokens.colors.neutral.darkGray,
          }}>
            <Music size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>No tracks in this playlist</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tracks.map((item: any) => {
              if (!item.tracks) return null;
              const track = item.tracks;
              const isPlaying = currentlyPlayingTrack === track.id;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: isPlaying ? '#ebf8ff' : '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePlayPause(track)}
                >
                  <button
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: designTokens.colors.primary.blue,
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: designTokens.colors.neutral.charcoal,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {track.title}
                    </p>
                    {track.duration_seconds && (
                      <p style={{
                        fontSize: '12px',
                        color: designTokens.colors.neutral.darkGray,
                        marginTop: '2px',
                      }}>
                        {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PlaybackBar - only show when track is selected, fixed at bottom */}
      {currentTrack && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingBottom: '20px' // Space for home indicator
        }}>
          <PlaybackBar
            track={{
              id: currentTrack.id,
              title: currentTrack.title,
              file_url: currentTrack.file_url,
              duration_seconds: currentTrack.duration_seconds
            }}
            audioRef={audioRef}
            isPlaying={currentlyPlayingTrack !== null}
            onPlayPause={() => handlePlayPause()}
          />
        </div>
      )}
    </div>
  );
}
