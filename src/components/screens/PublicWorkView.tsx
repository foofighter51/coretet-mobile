import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Music, Star, Clock, User, Calendar, MessageCircle } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db } from '../../../lib/supabase';
import { PlaybackBar } from '../molecules/PlaybackBar';
import { useIsMobile } from '../../hooks/useResponsive';

/**
 * PublicWorkView - Public view for shared Works
 *
 * Displays:
 * - Work name and description
 * - Hero track with player
 * - Version timeline (read-only)
 * - Comments preview (read-only)
 */
export function PublicWorkView() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [work, setWork] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchWork = async () => {
      if (!shareCode) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // Fetch work by share_code
        const { data: workData, error: workError } = await db.versionGroups.getByShareCode(shareCode);

        if (workError || !workData) {
          console.error('Work not found or error:', workError);
          setError('Work not found or not public');
          setLoading(false);
          return;
        }

        setWork(workData);

        // Sort tracks - hero first, then by created_at desc
        const sortedTracks = (workData.tracks || []).sort((a: any, b: any) => {
          if (a.id === workData.hero_track_id) return -1;
          if (b.id === workData.hero_track_id) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setTracks(sortedTracks);

        // Set hero track as current track
        const heroTrack = sortedTracks.find((t: any) => t.id === workData.hero_track_id) || sortedTracks[0];
        if (heroTrack) {
          setCurrentTrack(heroTrack);
        }

        // Fetch comments for all tracks in this work
        if (sortedTracks.length > 0) {
          const trackIds = sortedTracks.map((t: any) => t.id);
          const { data: commentsData } = await db.comments.getByWork(workData.id);
          setComments(commentsData || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching work:', err);
        setError('An error occurred');
        setLoading(false);
      }
    };

    fetchWork();
  }, [shareCode]);

  // Audio event handlers
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = async (track?: any) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const targetTrack = track || currentTrack;
      if (!targetTrack) return;

      if (currentTrack?.id === targetTrack.id && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (currentTrack?.id !== targetTrack.id) {
          audioRef.current.src = targetTrack.file_url;
          setCurrentTrack(targetTrack);
          setCurrentTime(0);
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: designTokens.typography.fontFamily,
        width: '100%',
        maxWidth: isMobile ? '425px' : '800px',
        height: '100vh',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: designTokens.colors.neutral.darkGray }}>Loading work...</p>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div style={{
        fontFamily: designTokens.typography.fontFamily,
        width: '100%',
        maxWidth: isMobile ? '425px' : '800px',
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
          {error || 'Work not found'}
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

  const heroTrack = tracks.find(t => t.id === work.hero_track_id) || tracks[0];

  return (
    <div style={{
      fontFamily: designTokens.typography.fontFamily,
      width: '100%',
      maxWidth: isMobile ? '425px' : '800px',
      height: '100vh',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: designTokens.colors.surface.primary,
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        backgroundColor: designTokens.colors.surface.primary,
        borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        padding: designTokens.spacing.md,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
            marginBottom: designTokens.spacing.sm,
            backgroundColor: 'transparent',
            color: designTokens.colors.primary.blue,
            border: 'none',
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.medium,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
          Back to App
        </button>

        <h1 style={{
          fontSize: designTokens.typography.fontSizes.h1,
          fontWeight: designTokens.typography.fontWeights.bold,
          color: designTokens.colors.text.primary,
          marginBottom: designTokens.spacing.xs,
        }}>
          {work.name}
        </h1>

        {work.description && (
          <p style={{
            fontSize: designTokens.typography.fontSizes.body,
            color: designTokens.colors.text.secondary,
            marginBottom: designTokens.spacing.sm,
          }}>
            {work.description}
          </p>
        )}

        <p style={{
          fontSize: designTokens.typography.fontSizes.caption,
          color: designTokens.colors.text.muted,
        }}>
          {tracks.length} {tracks.length === 1 ? 'version' : 'versions'}
        </p>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: designTokens.spacing.md,
        paddingBottom: currentTrack ? '120px' : designTokens.spacing.md,
      }}>
        {/* Hero Track Card */}
        {heroTrack && (
          <div style={{
            backgroundColor: designTokens.colors.surface.secondary,
            borderRadius: designTokens.borderRadius.lg,
            border: `2px solid ${designTokens.colors.accent.gold}`,
            padding: designTokens.spacing.lg,
            marginBottom: designTokens.spacing.lg,
            position: 'relative',
          }}>
            {/* Featured Badge */}
            <div style={{
              position: 'absolute',
              top: `-${designTokens.spacing.xs}`,
              left: designTokens.spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: `2px ${designTokens.spacing.xs}`,
              backgroundColor: designTokens.colors.accent.gold,
              borderRadius: designTokens.borderRadius.xs,
              fontSize: '10px',
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <Star size={10} fill="currentColor" />
              Featured
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: designTokens.spacing.xs,
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: designTokens.typography.fontSizes.h3,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.text.primary,
                  marginBottom: designTokens.spacing.xs,
                }}>
                  {heroTrack.title}
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.md,
                  fontSize: designTokens.typography.fontSizes.caption,
                  color: designTokens.colors.text.muted,
                }}>
                  {heroTrack.profiles?.name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} />
                      {heroTrack.profiles.name}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {formatDate(heroTrack.created_at)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {formatDuration(heroTrack.duration_seconds)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePlayPause(heroTrack)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: currentTrack?.id === heroTrack.id && isPlaying
                    ? designTokens.colors.primary.blue
                    : designTokens.colors.surface.primary,
                  color: currentTrack?.id === heroTrack.id && isPlaying
                    ? designTokens.colors.neutral.white
                    : designTokens.colors.primary.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {currentTrack?.id === heroTrack.id && isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} style={{ marginLeft: '2px' }} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Other Versions */}
        {tracks.length > 1 && (
          <>
            <h3 style={{
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.md,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Other Versions
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.sm,
              marginBottom: designTokens.spacing.lg,
            }}>
              {tracks.filter(t => t.id !== heroTrack?.id).map((track) => (
                <div
                  key={track.id}
                  onClick={() => handlePlayPause(track)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: designTokens.spacing.md,
                    backgroundColor: currentTrack?.id === track.id
                      ? `${designTokens.colors.primary.blue}10`
                      : designTokens.colors.surface.secondary,
                    borderRadius: designTokens.borderRadius.md,
                    border: currentTrack?.id === track.id
                      ? `1px solid ${designTokens.colors.primary.blue}`
                      : `1px solid ${designTokens.colors.borders.subtle}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.sm,
                    }}>
                      <span style={{
                        fontSize: designTokens.typography.fontSizes.body,
                        fontWeight: designTokens.typography.fontWeights.medium,
                        color: designTokens.colors.text.primary,
                      }}>
                        {track.title}
                      </span>
                      {track.version_type && (
                        <span style={{
                          padding: `2px ${designTokens.spacing.xs}`,
                          backgroundColor: designTokens.colors.surface.tertiary,
                          borderRadius: designTokens.borderRadius.xs,
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.text.secondary,
                          textTransform: 'capitalize',
                        }}>
                          {track.version_type}
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.md,
                      marginTop: '4px',
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.text.muted,
                    }}>
                      <span>{formatDate(track.created_at)}</span>
                      <span>{formatDuration(track.duration_seconds)}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause(track);
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: currentTrack?.id === track.id && isPlaying
                        ? designTokens.colors.primary.blue
                        : designTokens.colors.surface.primary,
                      color: currentTrack?.id === track.id && isPlaying
                        ? designTokens.colors.neutral.white
                        : designTokens.colors.primary.blue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} style={{ marginLeft: '1px' }} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Comments Preview */}
        {comments.length > 0 && (
          <>
            <h3 style={{
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
            }}>
              <MessageCircle size={16} />
              Comments ({comments.length})
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.sm,
            }}>
              {comments.slice(0, 5).map((comment: any) => (
                <div
                  key={comment.id}
                  style={{
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.surface.secondary,
                    borderRadius: designTokens.borderRadius.md,
                    border: `1px solid ${designTokens.colors.borders.subtle}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.sm,
                    marginBottom: designTokens.spacing.xs,
                  }}>
                    <span style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      fontWeight: designTokens.typography.fontWeights.semibold,
                      color: designTokens.colors.text.primary,
                    }}>
                      {comment.profiles?.name || 'Unknown'}
                    </span>
                    {comment.timestamp_seconds !== null && (
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: designTokens.colors.surface.tertiary,
                        borderRadius: designTokens.borderRadius.xs,
                        fontSize: designTokens.typography.fontSizes.caption,
                        color: designTokens.colors.text.muted,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}>
                        <Clock size={10} />
                        {formatDuration(comment.timestamp_seconds)}
                      </span>
                    )}
                    <span style={{
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.text.muted,
                      marginLeft: 'auto',
                    }}>
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.body,
                    color: designTokens.colors.text.primary,
                    margin: 0,
                  }}>
                    {comment.content}
                  </p>
                </div>
              ))}

              {comments.length > 5 && (
                <p style={{
                  fontSize: designTokens.typography.fontSizes.caption,
                  color: designTokens.colors.text.muted,
                  textAlign: 'center',
                  padding: designTokens.spacing.sm,
                }}>
                  + {comments.length - 5} more comments
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Playback Bar */}
      {currentTrack && (
        <PlaybackBar
          track={{
            title: currentTrack.title,
            id: currentTrack.id,
            file_url: currentTrack.file_url,
          }}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration || currentTrack.duration_seconds || 0}
          onPlayPause={() => handlePlayPause()}
          onSeek={handleSeek}
          onSkipForward={() => {
            const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
            if (currentIndex < tracks.length - 1) {
              handlePlayPause(tracks[currentIndex + 1]);
            }
          }}
          onSkipBack={() => {
            const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
            if (currentIndex > 0) {
              handlePlayPause(tracks[currentIndex - 1]);
            }
          }}
        />
      )}
    </div>
  );
}

export default PublicWorkView;
