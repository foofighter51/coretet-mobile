import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Music, Upload, ArrowLeft, Play, Pause, X, Check, MessageSquare, MoreVertical, Edit2, Trash2, Headphones, ThumbsUp, Heart, HelpCircle, Settings, GripVertical } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useBand } from '../../contexts/BandContext';
import { TrackRowWithPlayer } from '../molecules/TrackRowWithPlayer';
import { TabBar } from '../molecules/TabBar';
import { AudioUploader } from '../molecules/AudioUploader';
import { PlaybackBar } from '../molecules/PlaybackBar';
import { SwipeableTrackRow } from '../molecules/SwipeableTrackRow';
import { Tutorial } from '../molecules/Tutorial';
import { BandModal } from '../molecules/BandModal';
import { BandSettings } from '../molecules/BandSettings';
import { SortButton } from '../molecules/SortButton';
import { FilterButton } from '../molecules/FilterButton';
import { UploadButton } from '../molecules/UploadButton';
import { Track, TabId } from '../../types';
import { db, auth } from '../../../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import DeepLinkService from '../../utils/deepLinkHandler';

// Track Detail Modal Component
function TrackDetailModal({ track, onClose, currentUser, audioRef, currentTrack }: {
  track: any;
  onClose: () => void;
  currentUser: any;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTrack: any;
}) {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<number | null>(null);

  // Capture current playback timestamp when modal opens
  useEffect(() => {
    // Only capture timestamp if this track is currently playing
    if (audioRef.current && currentTrack?.id === track.id && !audioRef.current.paused) {
      setCapturedTimestamp(Math.floor(audioRef.current.currentTime));
    }
  }, [audioRef, currentTrack, track.id]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch all ratings for this track
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoadingRatings(true);
        const { data, error } = await db.ratings.getByTrack(track.id);

        if (error) {
          console.error('Failed to fetch ratings:', error);
          return;
        }

        // Fetch profile names for each rating
        if (data && data.length > 0) {
          const ratingsWithNames = await Promise.all(
            data.map(async (rating: any) => {
              const { data: profile } = await db.profiles.getById(rating.user_id);
              return {
                ...rating,
                userName: profile?.name || 'Unknown User',
              };
            })
          );
          setRatings(ratingsWithNames);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchRatings();
  }, [track.id]);

  // Fetch all comments for this track
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const { data, error } = await db.comments.getByTrack(track.id);

        if (error) {
          console.error('Failed to fetch comments:', error);
          return;
        }

        // Fetch profile names for each comment
        if (data && data.length > 0) {
          const commentsWithNames = await Promise.all(
            data.map(async (comment: any) => {
              const { data: profile } = await db.profiles.getById(comment.user_id);
              return {
                ...comment,
                userName: profile?.name || 'Unknown User',
              };
            })
          );
          setComments(commentsWithNames);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [track.id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser?.id) return;

    try {
      setSubmittingComment(true);
      const { error } = await db.comments.create({
        track_id: track.id,
        user_id: currentUser.id,
        content: newComment.trim(),
        timestamp_seconds: capturedTimestamp ?? undefined,
      });

      if (error) {
        console.error('Failed to create comment:', error);
        return;
      }

      // Refresh comments
      const { data } = await db.comments.getByTrack(track.id);
      if (data && data.length > 0) {
        const commentsWithNames = await Promise.all(
          data.map(async (comment: any) => {
            const { data: profile } = await db.profiles.getById(comment.user_id);
            return {
              ...comment,
              userName: profile?.name || 'Unknown User',
            };
          })
        );
        setComments(commentsWithNames);
      }

      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Group ratings by type
  const listenedBy = ratings.filter(r => r.rating === 'listened').map(r => r.userName);
  const likedBy = ratings.filter(r => r.rating === 'liked').map(r => r.userName);
  const lovedBy = ratings.filter(r => r.rating === 'loved').map(r => r.userName);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: designTokens.spacing.lg,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.xl,
          width: '100%',
          maxWidth: '500px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: designTokens.spacing.lg,
          boxShadow: designTokens.shadows.elevated,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Duration */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: designTokens.spacing.xl,
          gap: designTokens.spacing.md,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              margin: 0,
              marginBottom: designTokens.spacing.xs,
            }}>
              {track.title}
            </h2>
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              margin: 0,
            }}>
              {track.duration_seconds ?
                `${Math.floor(track.duration_seconds / 60)}:${String(Math.floor(track.duration_seconds % 60)).padStart(2, '0')}`
                : 'Unknown'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: designTokens.spacing.xs,
              flexShrink: 0,
            }}
          >
            <X size={24} color={designTokens.colors.text.secondary} />
          </button>
        </div>

        {/* Ratings Section */}
        <div style={{
          marginBottom: designTokens.spacing.xl,
        }}>
          <h3 style={{
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.md,
          }}>
            Ratings
          </h3>

          {loadingRatings ? (
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              textAlign: 'center',
              padding: designTokens.spacing.xl,
            }}>
              Loading ratings...
            </p>
          ) : ratings.length === 0 ? (
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              textAlign: 'center',
              padding: designTokens.spacing.xl,
            }}>
              No ratings yet
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.md,
            }}>
              {/* Listened */}
              {listenedBy.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  padding: designTokens.spacing.sm,
                  backgroundColor: designTokens.colors.ratings.listened.bgLight,
                  borderRadius: designTokens.borderRadius.md,
                }}>
                  <Headphones size={18} color={designTokens.colors.text.primary} style={{ flexShrink: 0 }} />
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.text.primary,
                    margin: 0,
                    marginRight: designTokens.spacing.xs,
                  }}>
                    Listened
                  </p>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.secondary,
                    margin: 0,
                  }}>
                    {listenedBy.join(', ')}
                  </p>
                </div>
              )}

              {/* Liked */}
              {likedBy.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  padding: designTokens.spacing.sm,
                  backgroundColor: designTokens.colors.ratings.liked.bgLight,
                  borderRadius: designTokens.borderRadius.md,
                }}>
                  <ThumbsUp size={18} color={designTokens.colors.text.primary} style={{ flexShrink: 0 }} />
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.text.primary,
                    margin: 0,
                    marginRight: designTokens.spacing.xs,
                  }}>
                    Liked
                  </p>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.secondary,
                    margin: 0,
                  }}>
                    {likedBy.join(', ')}
                  </p>
                </div>
              )}

              {/* Loved */}
              {lovedBy.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  padding: designTokens.spacing.sm,
                  backgroundColor: designTokens.colors.ratings.loved.bgLight,
                  borderRadius: designTokens.borderRadius.md,
                }}>
                  <Heart size={18} color={designTokens.colors.text.primary} style={{ flexShrink: 0 }} />
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.text.primary,
                    margin: 0,
                    marginRight: designTokens.spacing.xs,
                  }}>
                    Loved
                  </p>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.secondary,
                    margin: 0,
                  }}>
                    {lovedBy.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div style={{
          borderTop: `1px solid ${designTokens.colors.borders.default}`,
          paddingTop: designTokens.spacing.xl,
        }}>
          <h3 style={{
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.md,
          }}>
            Comments
          </h3>

          {/* Comment Input */}
          <div>
            {capturedTimestamp !== null && (
              <div style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.muted,
                marginBottom: designTokens.spacing.xs,
              }}>
                Comment at {formatTime(capturedTimestamp)}
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: designTokens.spacing.sm,
              marginBottom: designTokens.spacing.lg,
            }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !submittingComment && handleSubmitComment()}
                placeholder={capturedTimestamp !== null ? `Comment at ${formatTime(capturedTimestamp)}...` : "Add a comment..."}
                disabled={submittingComment}
                style={{
                  flex: 1,
                  padding: designTokens.spacing.sm,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.sm,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                }}
              />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submittingComment}
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: newComment.trim() && !submittingComment ? designTokens.colors.primary.blue : designTokens.colors.text.disabled,
                color: designTokens.colors.text.inverse,
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                cursor: newComment.trim() && !submittingComment ? 'pointer' : 'not-allowed',
              }}
            >
              {submittingComment ? 'Posting...' : 'Post'}
            </button>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              textAlign: 'center',
              padding: designTokens.spacing.xl,
            }}>
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              textAlign: 'center',
              padding: designTokens.spacing.xl,
            }}>
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.md,
            }}>
              {comments.map((comment: any) => (
                <div
                  key={comment.id}
                  style={{
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.surface.secondary,
                    borderRadius: designTokens.borderRadius.md,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: designTokens.spacing.xs,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
                      <p style={{
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        fontWeight: designTokens.typography.fontWeights.medium,
                        color: designTokens.colors.text.primary,
                        margin: 0,
                      }}>
                        {comment.userName}
                      </p>
                      {comment.timestamp_seconds !== null && comment.timestamp_seconds !== undefined && (
                        <button
                          onClick={() => {
                            if (audioRef.current && currentTrack?.id === track.id) {
                              audioRef.current.currentTime = comment.timestamp_seconds;
                              if (audioRef.current.paused) {
                                audioRef.current.play();
                              }
                            }
                          }}
                          style={{
                            fontSize: designTokens.typography.fontSizes.caption,
                            fontWeight: designTokens.typography.fontWeights.medium,
                            color: designTokens.colors.primary.blue,
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {formatTime(comment.timestamp_seconds)}
                        </button>
                      )}
                    </div>
                    <p style={{
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.text.muted,
                      margin: 0,
                    }}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.secondary,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Track Selector Modal Component
function TrackSelectorModal({ tracks, existingTrackIds, onAddTracks, onCancel }: {
  tracks: any[];
  existingTrackIds: string[];
  onAddTracks: (trackIds: string[]) => void;
  onCancel: () => void;
}) {
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Filter out tracks already in playlist
  const availableTracks = tracks.filter(track => !existingTrackIds.includes(track.id));

  const toggleTrack = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <div style={{
      backgroundColor: designTokens.colors.surface.secondary,
      border: `1px solid ${designTokens.colors.borders.default}`,
      borderRadius: designTokens.borderRadius.md,
      padding: designTokens.spacing.md,
      marginBottom: designTokens.spacing.md,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: designTokens.spacing.md,
      }}>
        <h3 style={{
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          color: designTokens.colors.text.primary,
          margin: 0,
        }}>
          Select Tracks from Library
        </h3>
        <button
          onClick={onCancel}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: designTokens.spacing.xs,
          }}
        >
          <X size={20} color={designTokens.colors.text.secondary} />
        </button>
      </div>

      {availableTracks.length === 0 ? (
        <p style={{
          fontSize: designTokens.typography.fontSizes.bodySmall,
          color: designTokens.colors.text.secondary,
          textAlign: 'center',
          padding: designTokens.spacing.xl,
        }}>
          All your tracks are already in this playlist
        </p>
      ) : (
        <>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: designTokens.spacing.md,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.sm,
            backgroundColor: designTokens.colors.surface.primary,
          }}>
            {availableTracks.map(track => {
              const isSelected = selectedTracks.includes(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => toggleTrack(track.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.md,
                    padding: designTokens.spacing.md,
                    borderBottom: `1px solid ${designTokens.colors.borders.light}`,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? designTokens.colors.surface.hover : designTokens.colors.surface.primary,
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: designTokens.borderRadius.sm,
                    border: `2px solid ${isSelected ? designTokens.colors.primary.blue : designTokens.colors.text.disabled}`,
                    backgroundColor: isSelected ? designTokens.colors.primary.blue : designTokens.colors.surface.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && <Check size={14} color={designTokens.colors.text.inverse} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      fontWeight: designTokens.typography.fontWeights.medium,
                      color: designTokens.colors.text.primary,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {track.title}
                    </p>
                    {track.duration_seconds && (
                      <p style={{
                        fontSize: designTokens.typography.fontSizes.caption,
                        color: designTokens.colors.text.secondary,
                        margin: `${designTokens.spacing.xs} 0 0 0`,
                      }}>
                        {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: designTokens.colors.surface.disabled,
                color: designTokens.colors.text.muted,
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onAddTracks(selectedTracks)}
              disabled={selectedTracks.length === 0}
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: selectedTracks.length > 0 ? designTokens.colors.primary.blue : designTokens.colors.text.disabled,
                color: designTokens.colors.text.inverse,
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                cursor: selectedTracks.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Add {selectedTracks.length > 0 ? `(${selectedTracks.length})` : ''}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface CurrentUser {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
}

interface MainDashboardProps {
  currentUser: CurrentUser;
}

const baseStyle = {
  fontFamily: designTokens.typography.fontFamily,
  width: '100%',
  maxWidth: '425px',
  height: '100vh',
  margin: '0 auto',
  position: 'relative' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden' as const,
  boxSizing: 'border-box' as const,
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
};

export function MainDashboard({ currentUser }: MainDashboardProps) {
  const navigate = useNavigate();
  const { playlists, createdPlaylists, followedPlaylists, currentPlaylist, createPlaylist, setCurrentPlaylist, refreshPlaylists } = usePlaylist();
  const { currentBand, userRole } = useBand();

  // Filter playlists for Band tab - only show playlists with matching band_id
  const bandCreatedPlaylists = useMemo(() => {
    if (!currentBand) return [];
    // Use 'playlists' instead of 'createdPlaylists' to include playlists from all band members
    return playlists.filter((p: any) => p.band_id === currentBand.id);
  }, [playlists, currentBand]);

  // Filter playlists for Personal tab - only show playlists with NULL band_id
  const personalCreatedPlaylists = useMemo(() => {
    return createdPlaylists.filter((p: any) => !p.band_id);
  }, [createdPlaylists]);

  // Following playlists are user-level (not band-filtered)
  const personalFollowedPlaylists = useMemo(() => {
    return followedPlaylists;
  }, [followedPlaylists]);

  // Legacy filter (kept for backwards compatibility, can be removed later)
  const filteredCreatedPlaylists = useMemo(() => {
    if (!currentBand) return createdPlaylists;
    return createdPlaylists.filter((p: any) => !p.band_id || p.band_id === currentBand.id);
  }, [createdPlaylists, currentBand]);

  const filteredFollowedPlaylists = useMemo(() => {
    if (!currentBand) return followedPlaylists;
    return followedPlaylists.filter((p: any) => !p.band_id || p.band_id === currentBand.id);
  }, [followedPlaylists, currentBand]);

  const [activeTab, setActiveTab] = useState<TabId>('band');
  const [playlistFilter, setPlaylistFilter] = useState<'mine' | 'following'>('mine');
  const [tracks, setTracks] = useState<any[]>([]);

  // Filter tracks by current band (show all if no band or if track has no band_id - legacy data)
  const bandScopedTracks = useMemo(() => {
    if (!currentBand) return tracks;
    return tracks.filter((t: any) => !t.band_id || t.band_id === currentBand.id);
  }, [tracks, currentBand]);

  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [showUploader, setShowUploader] = useState(false);
  const [showPlaylistUploader, setShowPlaylistUploader] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [showBandModal, setShowBandModal] = useState(false);
  const [showBandSettings, setShowBandSettings] = useState(false);

  // Audio playback state - consolidated
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const currentTrackRef = useRef<any | null>(null); // Ref to track current track for event listeners
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [trackRatings, setTrackRatings] = useState<Record<string, 'listened' | 'liked' | 'loved'>>({});
  const [aggregatedRatings, setAggregatedRatings] = useState<Record<string, { listened: number; liked: number; loved: number }>>({});
  const [ratingFilter, setRatingFilter] = useState<'all' | 'listened' | 'liked' | 'loved' | 'unrated'>('all');
  const [playlistSortBy, setPlaylistSortBy] = useState<'position' | 'name' | 'duration' | 'rating'>('position');
  const [sortAscending, setSortAscending] = useState(true);

  // Reorder mode state
  const [isReordering, setIsReordering] = useState(false);
  const [reorderedTracks, setReorderedTracks] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [createPlaylistLoading, setCreatePlaylistLoading] = useState(false);

  // Playlist management state
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [editingPlaylistTitle, setEditingPlaylistTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCopyToPersonalConfirm, setShowCopyToPersonalConfirm] = useState(false);
  const [copyingPlaylist, setCopyingPlaylist] = useState(false);

  // Edit tracks mode
  const [isEditingTracks, setIsEditingTracks] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  // Comment indicators
  const [trackCommentStatus, setTrackCommentStatus] = useState<Record<string, boolean>>({});
  const [trackUnreadStatus, setTrackUnreadStatus] = useState<Record<string, boolean>>({});

  // Track detail modal state
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<any | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);

  // Handle opening track detail modal with scroll position saving
  const handleOpenTrackDetail = async (track: any) => {
    if (scrollContainerRef.current) {
      savedScrollPosition.current = scrollContainerRef.current.scrollTop;
    }
    setSelectedTrackForDetail(track);

    // Mark comments as viewed when opening modal
    if (track?.id && currentUser?.id) {
      await db.comments.markCommentsAsViewed(track.id, currentUser.id);
    }
  };

  // Handle closing track detail modal with scroll position restoration
  const handleCloseTrackDetail = async () => {
    const trackId = selectedTrackForDetail?.id;
    setSelectedTrackForDetail(null);

    // Refresh comment status for this track after modal closes
    if (trackId && currentUser?.id) {
      const commentStatus = await db.comments.checkTracksHaveComments([trackId]);
      setTrackCommentStatus(prev => ({ ...prev, ...commentStatus }));

      // Refresh unread status (should now be false since we just viewed)
      const unreadStatus = await db.comments.checkTracksHaveUnreadComments([trackId], currentUser.id);
      setTrackUnreadStatus(prev => ({ ...prev, ...unreadStatus }));
    }

    // Restore scroll position after modal closes (clamp to valid range)
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
        const clampedScroll = Math.max(0, Math.min(savedScrollPosition.current, maxScroll));
        scrollContainerRef.current.scrollTop = clampedScroll;
      }
    });
  };

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);

  const handleRatingChange = useCallback((track: Track, rating: 'like' | 'love' | 'none') => {
    // Rating change handler (currently unused)
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      setError('Please enter a playlist title');
      return;
    }

    setCreatePlaylistLoading(true);
    setError(null);

    try {
      await createPlaylist(newPlaylistTitle.trim(), undefined, currentBand?.id);
      setNewPlaylistTitle('');
      setShowCreatePlaylist(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create playlist';
      console.error('Failed to create playlist:', err);
      setError(errorMsg + '. Please try again.');
      // Keep form open so user can retry
    } finally {
      setCreatePlaylistLoading(false);
    }
  };

  const loadPlaylistTracks = async (playlistId: string) => {
    try {
      const { data, error } = await db.playlistItems.getByPlaylist(playlistId);
      if (error) {
        console.error('Failed to fetch playlist tracks:', error);
        throw error;
      }
      setPlaylistTracks(data || []);

      // Fetch aggregated ratings for playlist tracks
      if (data && data.length > 0) {
        const trackIds = data.map((item: any) => item.tracks?.id).filter(Boolean);
        await fetchAggregatedRatings(trackIds);

        // Fetch comment status for playlist tracks
        const commentStatus = await db.comments.checkTracksHaveComments(trackIds);
        setTrackCommentStatus(commentStatus);

        // Fetch unread comment status
        if (currentUser?.id) {
          const unreadStatus = await db.comments.checkTracksHaveUnreadComments(trackIds, currentUser.id);
          setTrackUnreadStatus(unreadStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  };

  const handlePlaylistClick = async (playlist: any) => {
    setCurrentPlaylist(playlist);
    setViewMode('detail');
    await loadPlaylistTracks(playlist.id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentPlaylist(null);
    setPlaylistTracks([]);
    setShowPlaylistMenu(false);
    setEditingPlaylistTitle(null);
    setShowDeleteConfirm(false);
    // Reset edit tracks mode
    setIsEditingTracks(false);
    setSelectedTrackIds([]);
  };

  // Handle tab changes - reset view mode when switching tabs from detail view
  const handleTabChange = (newTab: TabId) => {
    if (viewMode === 'detail' && (activeTab === 'band' || activeTab === 'personal')) {
      handleBackToList();
    }
    setActiveTab(newTab);
  };

  const handleEditPlaylistTitle = async () => {
    if (!currentPlaylist || !newTitle.trim()) {
      setError('Please enter a playlist title');
      return;
    }

    try {
      const { data, error: updateError } = await db.playlists.update(currentPlaylist.id, {
        title: newTitle.trim(),
      });

      if (updateError) throw updateError;

      // Update current playlist
      setCurrentPlaylist({ ...currentPlaylist, title: newTitle.trim() });
      setEditingPlaylistTitle(null);
      setShowPlaylistMenu(false);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update playlist';
      setError(errorMsg + '. Please try again.');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!currentPlaylist) return;

    console.log('🗑️ Attempting to delete playlist:', currentPlaylist.id, currentPlaylist.title);

    try {
      const { error: deleteError } = await db.playlists.delete(currentPlaylist.id);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      console.log('✅ Playlist deleted successfully');

      // Reload playlists to update the list
      await refreshPlaylists();

      // Go back to list view
      handleBackToList();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('❌ Delete failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete playlist';
      setError(errorMsg + '. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyToPersonal = async () => {
    if (!currentPlaylist || !currentUser) return;

    console.log('📋 Copying playlist to Personal:', currentPlaylist.id, currentPlaylist.title);

    setCopyingPlaylist(true);

    try {
      const { data: newPlaylist, error: copyError } = await db.playlists.copyToPersonal(
        currentPlaylist.id,
        currentUser.id
      );

      if (copyError) {
        console.error('❌ Copy error:', copyError);
        throw copyError;
      }

      console.log('✅ Playlist copied successfully:', newPlaylist);

      // Reload playlists to show the new personal playlist
      await refreshPlaylists();

      // Close confirmation dialog
      setShowCopyToPersonalConfirm(false);

      // Switch to Personal tab to show the copied playlist
      setActiveTab('personal');

      // Go back to list view
      handleBackToList();

      // Show success message
      setError(null);
    } catch (err) {
      console.error('❌ Copy failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to copy playlist';
      setError(errorMsg + '. Please try again.');
    } finally {
      setCopyingPlaylist(false);
      setShowCopyToPersonalConfirm(false);
    }
  };

  const handleSortChange = (newSort: 'position' | 'name' | 'duration' | 'rating') => {
    if (newSort === playlistSortBy) {
      // Same sort clicked - toggle direction
      setSortAscending(!sortAscending);
    } else {
      // Different sort clicked - reset to ascending and change sort
      setSortAscending(true);
      setPlaylistSortBy(newSort);
    }
  };

  // Reorder mode handlers
  const handleEnterReorderMode = () => {
    setIsReordering(true);
    setReorderedTracks([...playlistTracks]); // Copy current tracks
  };

  const handleCancelReorder = () => {
    setIsReordering(false);
    setReorderedTracks([]);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveReorder = async () => {
    if (!currentPlaylist) return;

    try {
      // Update positions for all tracks
      const updates = reorderedTracks.map((track, index) => ({
        id: track.id,
        position: index + 1,
      }));

      // Batch update positions
      await Promise.all(
        updates.map(({ id, position }) =>
          db.playlistItems.updatePosition(id, position)
        )
      );

      // Refresh playlist
      await loadPlaylistTracks(currentPlaylist.id);

      // Exit reorder mode
      setIsReordering(false);
      setReorderedTracks([]);
      setDraggedIndex(null);
      setDragOverIndex(null);
    } catch (err) {
      console.error('Error saving track order:', err);
      setError('Failed to save track order');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    setDragOverIndex(index);

    // Reorder tracks in local state
    const newTracks = [...reorderedTracks];
    const draggedTrack = newTracks[draggedIndex];
    newTracks.splice(draggedIndex, 1);
    newTracks.splice(index, 0, draggedTrack);

    setReorderedTracks(newTracks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  };

  const handleAddExistingTracks = async (selectedTrackIds: string[]) => {
    if (!currentPlaylist || !currentUser?.id) {
      console.error('Missing currentPlaylist or currentUser:', { currentPlaylist, currentUser });
      return;
    }

    try {
      console.log('Adding tracks to playlist:', { playlistId: currentPlaylist.id, trackIds: selectedTrackIds });

      // Get current playlist items to determine starting position
      const { data: items, error: fetchError } = await db.playlistItems.getByPlaylist(currentPlaylist.id);
      if (fetchError) {
        console.error('Error fetching playlist items:', fetchError);
        throw fetchError;
      }

      // Find the maximum position value and start from there
      const maxPosition = items && items.length > 0
        ? Math.max(...items.map((item: any) => item.position || 0))
        : 0;
      let nextPosition = maxPosition + 1;
      console.log('Starting position (max + 1):', nextPosition, 'from', items?.length, 'items');

      // Add each selected track to the playlist
      for (const trackId of selectedTrackIds) {
        const { data, error } = await db.playlistItems.add({
          playlist_id: currentPlaylist.id,
          track_id: trackId,
          added_by: currentUser.id,
          position: nextPosition++,
        });

        if (error) {
          console.error('Error adding track to playlist:', { trackId, error });
          throw error;
        }
        console.log('Successfully added track:', { trackId, data });
      }

      // Refresh playlist tracks
      console.log('Refreshing playlist tracks...');
      await loadPlaylistTracks(currentPlaylist.id);
      setShowTrackSelector(false);
      console.log('Tracks added successfully');
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      setError('Failed to add tracks to playlist. Please try again.');
    }
  };

  const playNextTrack = () => {
    const track = currentTrackRef.current;
    if (!track) return;

    // Determine which track list to use
    let trackList: any[] = [];

    if (activeTab === 'band' && viewMode === 'detail') {
      trackList = filteredPlaylistTracks.map((item: any) => item.tracks).filter(Boolean);
    } else if (activeTab === 'personal' && viewMode === 'detail') {
      trackList = filteredPlaylistTracks.map((item: any) => item.tracks).filter(Boolean);
    }

    if (trackList.length === 0) return;

    // Find current track index
    const currentIndex = trackList.findIndex((t: any) => t.id === track.id);

    // Play next track if there is one
    if (currentIndex >= 0 && currentIndex < trackList.length - 1) {
      const nextTrack = trackList[currentIndex + 1];
      handlePlayPause(nextTrack);
    }
  };

  /**
   * Update iOS Now Playing / Lock Screen metadata
   * Uses Media Session API to display track info when phone is locked
   */
  const updateMediaSessionMetadata = (track: any) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Unknown Track',
        artist: 'CoreTet',
        album: currentPlaylist?.title || 'My Library',
        artwork: [
          // Using a default artwork - could be customized per playlist/track in the future
          { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      // Setup media session action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        handlePlayPause();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        handlePlayPause();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (currentTrackRef.current) {
          playNextTrack(currentTrackRef.current);
        }
      });
    }
  };

  const handlePlayPause = async (track?: any) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();

        // Setup audio event listeners
        audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
        audioRef.current.addEventListener('canplay', () => setIsLoading(false));
        audioRef.current.addEventListener('error', () => {
          setAudioError('Failed to load audio file');
          setIsLoading(false);
          setIsPlaying(false);
        });
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          playNextTrack();
        });
      }

      // If no track provided, toggle current track
      const targetTrack = track || currentTrack;
      if (!targetTrack) return;

      if (currentTrack?.id === targetTrack.id && isPlaying) {
        // Pause current track
        audioRef.current.pause();
        setIsPlaying(false);

        // Update playback state for lock screen
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      } else {
        // Play new or resume track
        setAudioError(null);

        if (currentTrack?.id !== targetTrack.id) {
          // New track - load and play
          setIsLoading(true);
          audioRef.current.src = targetTrack.file_url;
          setCurrentTrack(targetTrack);
          currentTrackRef.current = targetTrack; // Update ref for event listeners

          // Update iOS Now Playing metadata
          updateMediaSessionMetadata(targetTrack);
        }

        await audioRef.current.play();
        setIsPlaying(true);

        // Update playback state for lock screen
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioError('Failed to play audio');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  // Fetch aggregated ratings for tracks
  const fetchAggregatedRatings = async (trackIds: string[]) => {
    if (trackIds.length === 0) return;

    try {
      const aggregated: Record<string, { listened: number; liked: number; loved: number }> = {};

      // Initialize all tracks with zero counts
      trackIds.forEach(id => {
        aggregated[id] = { listened: 0, liked: 0, loved: 0 };
      });

      // Fetch all ratings for these tracks
      const promises = trackIds.map(id => db.ratings.getByTrack(id));
      const results = await Promise.all(promises);

      results.forEach((result, index) => {
        const trackId = trackIds[index];
        if (result.data && result.data.length > 0) {
          result.data.forEach((rating: any) => {
            if (rating.rating === 'listened') aggregated[trackId].listened++;
            else if (rating.rating === 'liked') aggregated[trackId].liked++;
            else if (rating.rating === 'loved') aggregated[trackId].loved++;
          });
        }
      });

      setAggregatedRatings(prev => ({ ...prev, ...aggregated }));
    } catch (error) {
      console.error('Error fetching aggregated ratings:', error);
    }
  };

  // Fetch user's tracks and ratings
  useEffect(() => {
    const fetchUserTracks = async () => {
      if (!currentUser?.id) return;

      try {
        // Fetch tracks created by user
        const { data: userTracks, error } = await db.tracks.getByUser(currentUser.id);
        if (error) {
          console.error('Failed to fetch tracks:', error);
          return;
        }

        // Fetch band tracks if in a band
        let bandTracks: any[] = [];
        if (currentBand) {
          const { data: bandTracksData, error: bandError } = await db.tracks.getByBand(currentBand.id);
          if (bandError) {
            console.error('Failed to fetch band tracks:', bandError);
          } else {
            bandTracks = bandTracksData || [];
          }
        }

        // Combine and deduplicate tracks
        const allTracks = [...(userTracks || [])];
        const seenIds = new Set(allTracks.map((t: any) => t.id));
        bandTracks.forEach(track => {
          if (!seenIds.has(track.id)) {
            allTracks.push(track);
          }
        });

        setTracks(allTracks);

        // Fetch user's ratings
        const { data: ratingsData } = await db.ratings.getByUser(currentUser.id);
        if (ratingsData) {
          const ratingsMap: Record<string, 'listened' | 'liked' | 'loved'> = {};
          ratingsData.forEach((rating: any) => {
            ratingsMap[rating.track_id] = rating.rating;
          });
          setTrackRatings(ratingsMap);
        }

        // Fetch aggregated ratings for all tracks
        if (allTracks && allTracks.length > 0) {
          await fetchAggregatedRatings(allTracks.map((t: any) => t.id));
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    fetchUserTracks();
  }, [currentUser?.id, currentBand?.id]);

  const handleRate = async (trackId: string, rating: 'listened' | 'liked' | 'loved') => {
    if (!currentUser?.id) return;

    try {
      const currentUserRating = trackRatings[trackId];

      // If clicking same rating, remove it
      if (currentUserRating === rating) {
        await db.ratings.delete(trackId, currentUser.id);
        setTrackRatings(prev => {
          const newRatings = { ...prev };
          delete newRatings[trackId];
          return newRatings;
        });
      } else {
        // Otherwise, set new rating
        await db.ratings.upsert(trackId, rating, currentUser.id);
        setTrackRatings(prev => ({ ...prev, [trackId]: rating }));
      }

      // Refresh aggregated ratings for this track
      await fetchAggregatedRatings([trackId]);
    } catch (error) {
      console.error('Error rating track:', error);
    }
  };

  /**
   * Edit Tracks Feature
   *
   * Allows playlist owners to remove multiple tracks from a playlist using checkbox selection.
   *
   * Flow:
   * 1. User opens three-dot menu → "Edit Tracks"
   * 2. Checkboxes appear next to each track
   * 3. Header buttons change to "Cancel" and "Delete (N)"
   * 4. User selects tracks via checkboxes
   * 5. "Delete (N)" button removes selected tracks
   * 6. Success message shows "N track(s) removed" for 3 seconds
   *
   * Features:
   * - Parallel deletion using Promise.all for performance
   * - Stops playback if current track is deleted
   * - Resets edit mode and refreshes view automatically
   * - Only visible to playlist owners
   * - No confirmation dialog (removes from playlist, doesn't delete from library)
   */
  const handleToggleEditMode = () => {
    setIsEditingTracks(!isEditingTracks);
    setSelectedTrackIds([]);
    setShowPlaylistMenu(false);
  };

  const handleToggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleDeleteSelectedTracks = async () => {
    if (!currentPlaylist || selectedTrackIds.length === 0) return;

    const trackCount = selectedTrackIds.length;

    try {
      // Delete all selected tracks in parallel
      const deletePromises = selectedTrackIds.map(trackId =>
        db.playlistItems.removeByTrack(currentPlaylist.id, trackId)
      );

      const results = await Promise.all(deletePromises);

      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Failed to remove some tracks:', errors);
        setError(`Failed to remove ${errors.length} of ${trackCount} tracks from playlist`);
      }

      // Stop playback if current track was deleted
      if (currentTrack && selectedTrackIds.includes(currentTrack.id) && isPlaying) {
        handlePlayPause();
      }

      // Show success message
      const successCount = trackCount - errors.length;
      if (successCount > 0) {
        setError(`${successCount} track${successCount > 1 ? 's' : ''} removed`);
        setTimeout(() => setError(null), 3000);
      }

      // Reset edit mode and reload tracks
      setIsEditingTracks(false);
      setSelectedTrackIds([]);
      await loadPlaylistTracks(currentPlaylist.id);
    } catch (err) {
      console.error('Error removing tracks:', err);
      setError('Failed to remove tracks from playlist');
    }
  };

  const filteredTracks = useMemo(() => {
    return bandScopedTracks
      .filter(track => {
        if (ratingFilter === 'all') return true;
        if (ratingFilter === 'unrated') return !trackRatings[track.id];
        return trackRatings[track.id] === ratingFilter;
      })
      .map(track => ({
        ...track,
        isPlaying: track.id === currentTrack?.id && isPlaying
      }));
  }, [bandScopedTracks, currentTrack, isPlaying, ratingFilter, trackRatings]);

  const filteredPlaylistTracks = useMemo(() => {
    const filtered = playlistTracks.filter(item => {
      if (!item.tracks) return false;
      if (ratingFilter === 'all') return true;
      if (ratingFilter === 'unrated') return !trackRatings[item.tracks.id];
      return trackRatings[item.tracks.id] === ratingFilter;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (!a.tracks || !b.tracks) return 0;

      let comparison = 0;

      switch (playlistSortBy) {
        case 'name':
          comparison = a.tracks.title.localeCompare(b.tracks.title);
          break;
        case 'duration':
          comparison = (a.tracks.duration_seconds || 0) - (b.tracks.duration_seconds || 0);
          break;
        case 'rating': {
          const ratingOrder = { loved: 3, liked: 2, listened: 1 };
          const ratingA = trackRatings[a.tracks.id];
          const ratingB = trackRatings[b.tracks.id];
          const scoreA = ratingA ? ratingOrder[ratingA] : 0;
          const scoreB = ratingB ? ratingOrder[ratingB] : 0;
          comparison = scoreA - scoreB;
          break;
        }
        case 'position':
        default:
          comparison = a.position - b.position;
      }

      // Apply ascending/descending direction
      return sortAscending ? comparison : -comparison;
    });

    return sorted;
  }, [playlistTracks, ratingFilter, trackRatings, playlistSortBy, sortAscending]);

  // Check if current playlist is owned by the user (moved to component level)
  const isPlaylistOwner = currentPlaylist ? filteredCreatedPlaylists.some(p => p.id === currentPlaylist.id) : false;

  const renderContent = () => {
    // Select correct playlists based on active tab
    const currentCreatedPlaylists = activeTab === 'band' ? bandCreatedPlaylists :
                                     activeTab === 'personal' ? personalCreatedPlaylists :
                                     filteredCreatedPlaylists;
    const currentFollowedPlaylists = activeTab === 'personal' ? personalFollowedPlaylists : [];

    // Determine which playlists to display based on tab and filter
    // Band tab always shows created playlists (no following option)
    // Personal tab respects the mine/following filter
    const displayedPlaylists = activeTab === 'band'
      ? currentCreatedPlaylists
      : (playlistFilter === 'mine' ? currentCreatedPlaylists : currentFollowedPlaylists);

    switch (activeTab) {
      case 'band':
      case 'personal':
        return (
          <div style={{
            padding: designTokens.spacing.md,
          }}>

            {showCreatePlaylist && (
              <div style={{
                backgroundColor: designTokens.colors.surface.secondary,
                padding: designTokens.spacing.md,
                borderRadius: designTokens.borderRadius.md,
                marginBottom: designTokens.spacing.md,
              }}>
                <input
                  type="text"
                  placeholder="Playlist title..."
                  value={newPlaylistTitle}
                  onChange={(e) => {
                    setNewPlaylistTitle(e.target.value);
                    setError(null);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && !createPlaylistLoading && handleCreatePlaylist()}
                  disabled={createPlaylistLoading}
                  style={{
                    width: '100%',
                    padding: designTokens.spacing.sm,
                    border: `1px solid ${error ? designTokens.colors.system.error : designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    marginBottom: designTokens.spacing.sm,
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                  }}
                  autoFocus
                />
                {error && (
                  <div style={{
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: designTokens.colors.feedback.error.bg,
                    border: `1px solid ${designTokens.colors.feedback.error.border}`,
                    borderRadius: designTokens.borderRadius.sm,
                    color: designTokens.colors.feedback.error.text,
                    fontSize: designTokens.typography.fontSizes.caption,
                    marginBottom: designTokens.spacing.sm,
                  }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={createPlaylistLoading}
                    style={{
                      padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                      backgroundColor: designTokens.colors.primary.blue,
                      color: designTokens.colors.text.inverse,
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: createPlaylistLoading ? 'not-allowed' : 'pointer',
                      opacity: createPlaylistLoading ? 0.6 : 1,
                    }}
                  >
                    {createPlaylistLoading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreatePlaylist(false);
                      setNewPlaylistTitle('');
                      setError(null);
                    }}
                    disabled={createPlaylistLoading}
                    style={{
                      padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                      backgroundColor: designTokens.colors.borders.default,
                      color: designTokens.colors.text.muted,
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: createPlaylistLoading ? 'not-allowed' : 'pointer',
                      opacity: createPlaylistLoading ? 0.6 : 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Playlist Filter Toggle - only show in Personal tab */}
            {viewMode !== 'detail' && activeTab === 'personal' && (
              <div style={{
                display: 'flex',
                gap: designTokens.spacing.sm,
                marginBottom: designTokens.spacing.md,
                padding: designTokens.spacing.xs,
                backgroundColor: designTokens.colors.neutral.offWhite,
                borderRadius: designTokens.borderRadius.md,
              }}>
                <button
                  onClick={() => setPlaylistFilter('mine')}
                  style={{
                    flex: 1,
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                    backgroundColor: playlistFilter === 'mine' ? designTokens.colors.primary.blue : 'transparent',
                    color: playlistFilter === 'mine' ? designTokens.colors.text.inverse : designTokens.colors.neutral.charcoal,
                    border: 'none',
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  My Playlists
                </button>
                <button
                  onClick={() => setPlaylistFilter('following')}
                  style={{
                    flex: 1,
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                    backgroundColor: playlistFilter === 'following' ? designTokens.colors.primary.blue : 'transparent',
                    color: playlistFilter === 'following' ? designTokens.colors.text.inverse : designTokens.colors.neutral.charcoal,
                    border: 'none',
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Following {currentFollowedPlaylists.length > 0 && `(${currentFollowedPlaylists.length})`}
                </button>
              </div>
            )}

            {viewMode === 'detail' && currentPlaylist ? (
              <div>
                {/* Edit title modal */}
                {editingPlaylistTitle && (
                  <div style={{
                    backgroundColor: designTokens.colors.surface.secondary,
                    padding: designTokens.spacing.md,
                    borderRadius: designTokens.borderRadius.md,
                    marginBottom: designTokens.spacing.md,
                  }}>
                    <h3 style={{ margin: `0 0 ${designTokens.spacing.md} 0`, fontSize: designTokens.typography.fontSizes.body, fontWeight: designTokens.typography.fontWeights.semibold }}>Edit Playlist Title</h3>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        setError(null);
                      }}
                      placeholder="Playlist title..."
                      style={{
                        width: '100%',
                        padding: designTokens.spacing.sm,
                        border: `1px solid ${error ? designTokens.colors.system.error : designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.sm,
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        marginBottom: designTokens.spacing.sm,
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                      }}
                      autoFocus
                    />
                    {error && (
                      <div style={{
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                        backgroundColor: designTokens.colors.feedback.error.bg,
                        border: `1px solid ${designTokens.colors.feedback.error.border}`,
                        borderRadius: designTokens.borderRadius.sm,
                        color: designTokens.colors.feedback.error.text,
                        fontSize: designTokens.typography.fontSizes.caption,
                        marginBottom: designTokens.spacing.sm,
                      }}>
                        {error}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                      <button
                        onClick={handleEditPlaylistTitle}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          backgroundColor: designTokens.colors.primary.blue,
                          color: designTokens.colors.text.inverse,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingPlaylistTitle(null);
                          setError(null);
                        }}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          backgroundColor: designTokens.colors.borders.default,
                          color: designTokens.colors.text.muted,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete confirmation modal */}
                {showDeleteConfirm && (
                  <div style={{
                    backgroundColor: designTokens.colors.ratings.loved.bgLight,
                    padding: designTokens.spacing.md,
                    borderRadius: designTokens.borderRadius.md,
                    marginBottom: designTokens.spacing.md,
                    border: `1px solid ${designTokens.colors.system.error}`,
                  }}>
                    <h3 style={{ margin: `0 0 ${designTokens.spacing.sm} 0`, fontSize: designTokens.typography.fontSizes.body, fontWeight: designTokens.typography.fontWeights.semibold, color: designTokens.colors.system.error }}>Delete Playlist?</h3>
                    <p style={{ margin: `0 0 ${designTokens.spacing.lg} 0`, fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.feedback.error.text }}>
                      This will permanently delete "{currentPlaylist.title}" and all its contents. This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                      <button
                        onClick={handleDeletePlaylist}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          backgroundColor: designTokens.colors.system.error,
                          color: designTokens.colors.text.inverse,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: 'pointer',
                          fontWeight: designTokens.typography.fontWeights.medium,
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          backgroundColor: designTokens.colors.borders.default,
                          color: designTokens.colors.text.muted,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Copy to Personal confirmation modal */}
                {showCopyToPersonalConfirm && (
                  <div style={{
                    backgroundColor: designTokens.colors.surface.secondary,
                    padding: designTokens.spacing.md,
                    borderRadius: designTokens.borderRadius.md,
                    marginBottom: designTokens.spacing.md,
                    border: `1px solid ${designTokens.colors.primary.blue}`,
                  }}>
                    <h3 style={{ margin: `0 0 ${designTokens.spacing.sm} 0`, fontSize: designTokens.typography.fontSizes.body, fontWeight: designTokens.typography.fontWeights.semibold, color: designTokens.colors.primary.blue }}>Copy to Personal?</h3>
                    <p style={{ margin: `0 0 ${designTokens.spacing.md} 0`, fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.neutral.charcoal }}>
                      This will create a personal copy of "{currentPlaylist.title}" that you can share outside the band.
                    </p>
                    <p style={{ margin: `0 0 ${designTokens.spacing.lg} 0`, fontSize: designTokens.typography.fontSizes.caption, color: designTokens.colors.text.muted }}>
                      Note: Ratings and comments will not be copied.
                    </p>
                    <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                      <button
                        onClick={handleCopyToPersonal}
                        disabled={copyingPlaylist}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          backgroundColor: designTokens.colors.primary.blue,
                          color: designTokens.colors.text.inverse,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: copyingPlaylist ? 'not-allowed' : 'pointer',
                          fontWeight: designTokens.typography.fontWeights.medium,
                          opacity: copyingPlaylist ? 0.6 : 1,
                        }}
                      >
                        {copyingPlaylist ? 'Copying...' : 'Copy Playlist'}
                      </button>
                      <button
                        onClick={() => setShowCopyToPersonalConfirm(false)}
                        disabled={copyingPlaylist}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          backgroundColor: designTokens.colors.borders.default,
                          color: designTokens.colors.text.muted,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: copyingPlaylist ? 'not-allowed' : 'pointer',
                          opacity: copyingPlaylist ? 0.6 : 1,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showTrackSelector && (
                  <TrackSelectorModal
                    tracks={bandScopedTracks}
                    existingTrackIds={playlistTracks.map(item => item.tracks?.id).filter(Boolean)}
                    onAddTracks={handleAddExistingTracks}
                    onCancel={() => setShowTrackSelector(false)}
                  />
                )}

                {showPlaylistUploader && (
                  <div style={{
                    backgroundColor: designTokens.colors.surface.secondary,
                    padding: designTokens.spacing.md,
                    borderRadius: designTokens.borderRadius.md,
                    marginBottom: designTokens.spacing.md,
                  }}>
                    <AudioUploader
                      multiple={true}
                      options={{ bandId: currentBand?.id }}
                      onUploadComplete={async (results) => {
                        console.log('Upload complete, results:', results);
                        setShowPlaylistUploader(false);

                        // Add all uploaded tracks to current playlist
                        if (results.length > 0 && currentPlaylist) {
                          console.log('Adding uploaded tracks to playlist:', currentPlaylist.id);

                          const { data: items, error: fetchError } = await db.playlistItems.getByPlaylist(currentPlaylist.id);
                          if (fetchError) {
                            console.error('Error fetching playlist items:', fetchError);
                            setError('Failed to add tracks to playlist. Please try again.');
                            return;
                          }

                          // Find the maximum position value and start from there
                          const maxPosition = items && items.length > 0
                            ? Math.max(...items.map((item: any) => item.position || 0))
                            : 0;
                          let nextPosition = maxPosition + 1;
                          console.log('Starting position for uploaded tracks (max + 1):', nextPosition, 'from', items?.length, 'items');

                          // Add each track to the playlist
                          for (const result of results) {
                            const { data, error } = await db.playlistItems.add({
                              playlist_id: currentPlaylist.id,
                              track_id: result.trackId,
                              added_by: currentUser?.id || '',
                              position: nextPosition++,
                            });

                            if (error) {
                              console.error('Error adding uploaded track to playlist:', { trackId: result.trackId, error });
                              setError('Failed to add tracks to playlist. Please try again.');
                              return;
                            }
                            console.log('Successfully added uploaded track:', { trackId: result.trackId, data });
                          }

                          // Refresh playlist tracks
                          console.log('Refreshing playlist tracks after upload...');
                          await loadPlaylistTracks(currentPlaylist.id);

                          // Refresh tracks list
                          if (currentUser?.id) {
                            db.tracks.getByUser(currentUser.id).then(({ data }) => {
                              setTracks(data || []);
                            });
                          }
                          console.log('Upload to playlist complete');
                        } else {
                          console.log('No results or no currentPlaylist:', { resultsCount: results.length, currentPlaylist });
                        }
                      }}
                      onUploadError={(error) => {
                        console.error('❌ Upload failed:', error);
                      }}
                      currentUser={currentUser ? {
                        id: currentUser.id,
                        email: currentUser.email || '',
                        phoneNumber: currentUser.phoneNumber || '',
                        name: currentUser.name || 'User'
                      } : undefined}
                    />
                    <button
                      onClick={() => setShowPlaylistUploader(false)}
                      style={{
                        marginTop: designTokens.spacing.sm,
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                        backgroundColor: designTokens.colors.borders.default,
                        color: designTokens.colors.text.muted,
                        border: 'none',
                        borderRadius: designTokens.borderRadius.sm,
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {playlistTracks.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: `${designTokens.spacing.xxl} ${designTokens.spacing.xl}`,
                    color: designTokens.colors.neutral.darkGray,
                  }}>
                    <Music size={48} style={{ margin: `0 auto ${designTokens.spacing.lg}`, opacity: 0.3 }} />
                    <p>No tracks in this playlist yet</p>
                  </div>
                ) : (
                  <div>
                    {/* Reorder Mode Actions */}
                    {isReordering && (
                      <div style={{
                        display: 'flex',
                        gap: designTokens.spacing.sm,
                        marginBottom: designTokens.spacing.lg,
                        padding: designTokens.spacing.md,
                        backgroundColor: designTokens.colors.primary.blueLight,
                        borderRadius: designTokens.borderRadius.md,
                        alignItems: 'center',
                      }}>
                        <GripVertical size={18} color={designTokens.colors.primary.blue} />
                        <span style={{
                          flex: 1,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          color: designTokens.colors.text.primary,
                          fontWeight: designTokens.typography.fontWeights.medium,
                        }}>
                          Drag tracks to reorder
                        </span>
                        <button
                          onClick={handleCancelReorder}
                          style={{
                            padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                            backgroundColor: designTokens.colors.surface.primary,
                            color: designTokens.colors.text.primary,
                            border: `1px solid ${designTokens.colors.borders.default}`,
                            borderRadius: designTokens.borderRadius.md,
                            fontSize: designTokens.typography.fontSizes.caption,
                            fontWeight: designTokens.typography.fontWeights.medium,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveReorder}
                          style={{
                            padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                            backgroundColor: designTokens.colors.primary.blue,
                            color: designTokens.colors.text.inverse,
                            border: 'none',
                            borderRadius: designTokens.borderRadius.md,
                            fontSize: designTokens.typography.fontSizes.caption,
                            fontWeight: designTokens.typography.fontWeights.semibold,
                            cursor: 'pointer',
                          }}
                        >
                          Save Order
                        </button>
                      </div>
                    )}

                    {(isReordering ? reorderedTracks : filteredPlaylistTracks).map((item: any, index: number) => (
                      item.tracks && (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: designTokens.spacing.sm,
                            opacity: draggedIndex === index ? 0.5 : 1,
                            transition: 'opacity 0.2s',
                          }}
                          draggable={isReordering}
                          onDragStart={() => isReordering && handleDragStart(index)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            isReordering && handleDragOver(index);
                          }}
                          onDragEnd={handleDragEnd}
                          onTouchStart={(e) => {
                            if (isReordering) {
                              handleDragStart(index);
                            }
                          }}
                          onTouchMove={(e) => {
                            if (isReordering && draggedIndex !== null) {
                              e.preventDefault();
                              const touch = e.touches[0];
                              const element = document.elementFromPoint(touch.clientX, touch.clientY);
                              const row = element?.closest('[data-track-index]');
                              if (row) {
                                const targetIndex = parseInt(row.getAttribute('data-track-index') || '0');
                                handleDragOver(targetIndex);
                              }
                            }
                          }}
                          onTouchEnd={handleDragEnd}
                          data-track-index={index}
                        >
                          {isReordering && (
                            <div style={{
                              cursor: 'grab',
                              color: designTokens.colors.text.secondary,
                              display: 'flex',
                              alignItems: 'center',
                              padding: designTokens.spacing.xs,
                            }}>
                              <GripVertical size={20} />
                            </div>
                          )}
                          {isEditingTracks && !isReordering && (
                            <input
                              type="checkbox"
                              checked={selectedTrackIds.includes(item.tracks.id)}
                              onChange={() => handleToggleTrackSelection(item.tracks.id)}
                              style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                              aria-label={`Select ${item.tracks.title}`}
                            />
                          )}
                          <div style={{ flex: 1, pointerEvents: isReordering ? 'none' : 'auto' }}>
                            <SwipeableTrackRow
                              track={{
                                id: item.tracks.id,
                                title: item.tracks.title,
                                duration_seconds: item.tracks.duration_seconds,
                                folder_path: item.tracks.folder_path
                              }}
                              isPlaying={currentTrack?.id === item.tracks.id && isPlaying}
                              currentRating={trackRatings[item.tracks.id]}
                              aggregatedRatings={aggregatedRatings[item.tracks.id]}
                              hasComments={trackCommentStatus[item.tracks.id]}
                              hasUnreadComments={trackUnreadStatus[item.tracks.id]}
                              onPlayPause={() => handlePlayPause(item.tracks)}
                              onRate={(rating) => handleRate(item.tracks.id, rating)}
                              onLongPress={() => handleOpenTrackDetail(item.tracks)}
                            />
                          </div>
                        </div>
                      )
                    ))}
                    {/* Spacer to prevent last track from hiding behind PlaybackBar/TabBar */}
                    <div style={{ height: '16px' }} />
                  </div>
                )}
              </div>
            ) : displayedPlaylists.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: `${designTokens.spacing.xxl} ${designTokens.spacing.xl}`,
                color: designTokens.colors.neutral.darkGray,
              }}>
                <Music size={48} style={{ margin: `0 auto ${designTokens.spacing.lg}`, opacity: 0.3 }} />
                <p>{activeTab === 'band' ? 'No playlists yet' : (playlistFilter === 'mine' ? 'No playlists yet' : 'Not following any playlists')}</p>
                <p style={{ fontSize: designTokens.typography.fontSizes.bodySmall, marginTop: designTokens.spacing.sm }}>
                  {activeTab === 'band'
                    ? 'Create your first playlist to start sharing music'
                    : (playlistFilter === 'mine'
                      ? 'Create your first playlist to start sharing music'
                      : 'Follow playlists shared with you to see them here')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
                {displayedPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    style={{
                      padding: designTokens.spacing.lg,
                      backgroundColor: currentPlaylist?.id === playlist.id ? designTokens.colors.surface.hover : designTokens.colors.surface.primary,
                      border: currentPlaylist?.id === playlist.id ? `2px solid ${designTokens.colors.primary.blue}` : `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: designTokens.typography.fontSizes.body,
                          fontWeight: designTokens.typography.fontWeights.semibold,
                          color: designTokens.colors.neutral.charcoal,
                          marginBottom: designTokens.spacing.xs,
                        }}>
                          {playlist.title}
                        </h3>
                        {playlist.description && (
                          <p style={{
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            color: designTokens.colors.neutral.darkGray,
                          }}>
                            {playlist.description}
                          </p>
                        )}
                      </div>
                      {playlistFilter === 'mine' && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();

                            // Use custom app scheme for direct app opening
                            const shareUrl = `coretet://playlist/${playlist.share_code}`;

                            // On native platforms, use native share sheet
                            if (Capacitor.isNativePlatform()) {
                              try {
                                const shareText = `Check out "${playlist.title}" on CoreTet\n\n${shareUrl}`;
                                console.log('Sharing with text:', shareText);

                                await Share.share({
                                  title: playlist.title,
                                  text: shareText,
                                  dialogTitle: 'Share Playlist',
                                });

                                console.log('Share completed successfully');
                              } catch (error) {
                                console.error('Share failed:', error);
                              }
                            } else {
                              // On web, copy web-friendly URL to clipboard
                              navigator.clipboard.writeText(shareUrl);
                              // Show temporary success message
                              const btn = e.currentTarget;
                              const originalHTML = btn.innerHTML;
                              btn.innerHTML = '✓ Copied!';
                              btn.style.color = '#48bb78';
                              setTimeout(() => {
                                btn.innerHTML = originalHTML;
                                btn.style.color = designTokens.colors.primary.blue;
                              }, 2000);
                            }
                          }}
                          style={{
                            padding: designTokens.spacing.sm,
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: designTokens.colors.primary.blue,
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            fontWeight: designTokens.typography.fontWeights.medium,
                          }}
                        >
                          <Upload size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div style={{
            padding: designTokens.spacing.md,
          }}>
            {currentUser && (
              <div style={{
                backgroundColor: designTokens.colors.surface.primary,
                border: `1px solid ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.md,
                padding: designTokens.spacing.lg,
                marginBottom: designTokens.spacing.lg,
              }}>
                <div style={{ marginBottom: designTokens.spacing.md }}>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.neutral.darkGray,
                    marginBottom: designTokens.spacing.xs,
                  }}>
                    Name
                  </p>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.body,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    color: designTokens.colors.neutral.charcoal,
                  }}>
                    {currentUser.name || 'User'}
                  </p>
                </div>

                {currentUser.email && (
                  <div style={{ marginBottom: designTokens.spacing.md }}>
                    <p style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.neutral.darkGray,
                      marginBottom: designTokens.spacing.xs,
                    }}>
                      Email
                    </p>
                    <p style={{
                      fontSize: designTokens.typography.fontSizes.body,
                      fontWeight: designTokens.typography.fontWeights.medium,
                      color: designTokens.colors.neutral.charcoal,
                    }}>
                      {currentUser.email}
                    </p>
                  </div>
                )}

                {currentUser.phoneNumber && (
                  <div style={{ marginBottom: designTokens.spacing.md }}>
                    <p style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.neutral.darkGray,
                      marginBottom: designTokens.spacing.xs,
                    }}>
                      Phone
                    </p>
                    <p style={{
                      fontSize: designTokens.typography.fontSizes.body,
                      fontWeight: designTokens.typography.fontWeights.medium,
                      color: designTokens.colors.neutral.charcoal,
                    }}>
                      {currentUser.phoneNumber}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/feedback')}
                  style={{
                    marginTop: designTokens.spacing.lg,
                    width: '100%',
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.primary.blue,
                    color: designTokens.colors.text.inverse,
                    border: 'none',
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: designTokens.spacing.sm,
                  }}
                >
                  <MessageSquare size={18} />
                  Community Feedback
                </button>

                <button
                  onClick={() => setShowTutorial(true)}
                  style={{
                    marginTop: designTokens.spacing.md,
                    width: '100%',
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.surface.secondary,
                    color: designTokens.colors.primary.blue,
                    border: `1px solid ${designTokens.colors.primary.blue}`,
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: designTokens.spacing.sm,
                  }}
                >
                  <HelpCircle size={18} />
                  How to Use CoreTet
                </button>

                <button
                  onClick={() => auth.signOut()}
                  style={{
                    marginTop: designTokens.spacing.md,
                    width: '100%',
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.surface.secondary,
                    color: designTokens.colors.text.muted,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={baseStyle}>
      {/* Fixed Header */}
      <div style={{
        flexShrink: 0,
        backgroundColor: designTokens.colors.surface.primary,
        borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
        {/* Top header with logo, action button, and user button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        }}>
          {/* Left: CoreTet Circle Logo or Back Button */}
          {(activeTab === 'band' || activeTab === 'personal') && viewMode === 'detail' ? (
            <button
              onClick={handleBackToList}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: designTokens.spacing.sm,
                backgroundColor: 'transparent',
                color: designTokens.colors.primary.blue,
                border: 'none',
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <button
              onClick={() => {
                console.log('🎵 C icon clicked, opening Band Modal');
                setShowBandModal(true);
              }}
              style={{
                width: designTokens.spacing.xxl,
                height: designTokens.spacing.xxl,
                borderRadius: designTokens.borderRadius.full,
                backgroundColor: designTokens.colors.primary.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: designTokens.colors.text.inverse,
                fontSize: designTokens.typography.fontSizes.h3,
                fontWeight: designTokens.typography.fontWeights.bold,
                flexShrink: 0,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              C
            </button>
          )}

          {/* Center: Action Button */}
          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            {activeTab === 'band' && viewMode === 'list' && (
              <button
                onClick={() => setShowCreatePlaylist(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: designTokens.colors.primary.blue,
                  color: designTokens.colors.text.inverse,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.xxl,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                New
              </button>
            )}
            {activeTab === 'personal' && viewMode === 'list' && (
              <button
                onClick={() => setShowUploader(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: designTokens.colors.primary.blue,
                  color: designTokens.colors.text.inverse,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.xxl,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Upload
              </button>
            )}
            {(activeTab === 'band' || activeTab === 'personal') && viewMode === 'detail' && isPlaylistOwner && (
              <div style={{ display: 'flex', gap: designTokens.spacing.xs, alignItems: 'center' }}>
                {isEditingTracks ? (
                  <>
                    <button
                      onClick={handleToggleEditMode}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.xs,
                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                        backgroundColor: designTokens.colors.surface.primary,
                        color: designTokens.colors.neutral.charcoal,
                        border: `1px solid ${designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.xxl,
                        fontSize: designTokens.typography.fontSizes.caption,
                        fontWeight: designTokens.typography.fontWeights.medium,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    {selectedTrackIds.length > 0 && (
                      <button
                        onClick={handleDeleteSelectedTracks}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: designTokens.spacing.xs,
                          padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                          backgroundColor: designTokens.colors.system.error,
                          color: designTokens.colors.text.inverse,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.xxl,
                          fontSize: designTokens.typography.fontSizes.caption,
                          fontWeight: designTokens.typography.fontWeights.medium,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                        Delete ({selectedTrackIds.length})
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <UploadButton
                      onFromLibrary={() => setShowTrackSelector(true)}
                      onUploadNew={() => setShowPlaylistUploader(true)}
                    />
                    <SortButton
                      currentSort={playlistSortBy}
                      sortAscending={sortAscending}
                      onSort={handleSortChange}
                      onReorder={handleEnterReorderMode}
                      showReorder={playlistSortBy === 'position' && playlistTracks.length > 1 && !isReordering}
                    />
                    <FilterButton
                      activeFilter={ratingFilter}
                      onFilterChange={setRatingFilter}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Menu/Settings button */}
          <div style={{ width: designTokens.spacing.xxl, flexShrink: 0, position: 'relative' }}>
            {/* Band Settings button (Band tab, list view, admin only) */}
            {activeTab === 'band' && viewMode === 'list' && (userRole === 'admin' || userRole === 'owner') && currentBand && (
              <button
                onClick={() => setShowBandSettings(true)}
                style={{
                  width: designTokens.spacing.xxl,
                  height: designTokens.spacing.xxl,
                  borderRadius: designTokens.borderRadius.full,
                  backgroundColor: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: designTokens.colors.neutral.charcoal,
                }}
              >
                <Settings size={20} />
              </button>
            )}
            {/* Playlist menu button (detail view, owner only) */}
            {(activeTab === 'band' || activeTab === 'personal') && viewMode === 'detail' && isPlaylistOwner && !isEditingTracks && (
              <button
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                style={{
                  width: designTokens.spacing.xxl,
                  height: designTokens.spacing.xxl,
                  borderRadius: designTokens.borderRadius.full,
                  backgroundColor: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: designTokens.colors.neutral.charcoal,
                }}
              >
                <MoreVertical size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Playlist menu dropdown */}
        {showPlaylistMenu && (activeTab === 'band' || activeTab === 'personal') && viewMode === 'detail' && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: designTokens.spacing.lg,
            backgroundColor: designTokens.colors.surface.primary,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.md,
            boxShadow: designTokens.shadows.elevated,
            zIndex: 1000,
            minWidth: '180px',
          }}>
            <button
              onClick={async () => {
                setShowPlaylistMenu(false);

                if (!currentPlaylist) return;

                const shareUrl = `coretet://playlist/${currentPlaylist.share_code}`;

                // On native platforms, use native share sheet
                if (Capacitor.isNativePlatform()) {
                  try {
                    const shareText = `Check out "${currentPlaylist.title}" on CoreTet\n\n${shareUrl}`;

                    await Share.share({
                      title: currentPlaylist.title,
                      text: shareText,
                      dialogTitle: 'Share Playlist',
                    });
                  } catch (error) {
                    console.error('Share failed:', error);
                  }
                } else {
                  // On web, copy to clipboard
                  navigator.clipboard.writeText(shareUrl);
                  // Could add a toast notification here
                }
              }}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.md,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.charcoal,
                borderBottom: `1px solid ${designTokens.colors.borders.default}`,
              }}
            >
              <Upload size={16} />
              Share Playlist
            </button>
            <button
              onClick={() => {
                setNewTitle(currentPlaylist?.title || '');
                setEditingPlaylistTitle(currentPlaylist?.id || null);
                setShowPlaylistMenu(false);
              }}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.md,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.charcoal,
                borderBottom: `1px solid ${designTokens.colors.borders.default}`,
              }}
            >
              <Edit2 size={16} />
              Edit Title
            </button>
            <button
              onClick={handleToggleEditMode}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.md,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.charcoal,
                borderBottom: `1px solid ${designTokens.colors.borders.default}`,
              }}
            >
              <Edit2 size={16} />
              Edit Tracks
            </button>
            {activeTab === 'band' && currentPlaylist && (
              <button
                onClick={() => {
                  setShowCopyToPersonalConfirm(true);
                  setShowPlaylistMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.md,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.primary.blue,
                  borderBottom: `1px solid ${designTokens.colors.borders.default}`,
                }}
              >
                <Upload size={16} />
                Copy to Personal
              </button>
            )}
            <button
              onClick={() => {
                setShowDeleteConfirm(true);
                setShowPlaylistMenu(false);
              }}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.md,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.system.error,
              }}
            >
              <Trash2 size={16} />
              Delete Playlist
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        onScroll={(e) => {
          // Prevent scrolling into negative territory (iOS bounce effect)
          const target = e.currentTarget;
          if (target.scrollTop < 0) {
            target.scrollTop = 0;
          }
        }}
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          overflowX: 'hidden' as const,
          paddingBottom: currentTrack ? '164px' : '84px', // Extra space: TabBar (60px) + PlaybackBar (~84px) + gap (8px) + margin (12px)
          WebkitOverflowScrolling: 'touch' as const,
        }}
      >
        {renderContent()}
      </div>

      {/* Fixed Footer - PlaybackBar (only show when track is selected) */}
      {currentTrack && (
        <div style={{
          position: 'fixed',
          bottom: '68px', // TabBar (60px) + small gap (8px)
          left: 0,
          right: 0,
          zIndex: 99, // Below TabBar (100) but above content
        }}>
          <PlaybackBar
            track={{
              id: currentTrack.id,
              title: currentTrack.title,
              file_url: currentTrack.file_url,
              duration_seconds: currentTrack.duration_seconds
            }}
            audioRef={audioRef}
            isPlaying={isPlaying}
            isLoading={isLoading}
            error={audioError}
            onPlayPause={() => handlePlayPause()}
          />
        </div>
      )}

      <TabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Track Detail Modal */}
      {selectedTrackForDetail && (
        <TrackDetailModal
          track={selectedTrackForDetail}
          onClose={handleCloseTrackDetail}
          currentUser={currentUser}
          audioRef={audioRef}
          currentTrack={currentTrack}
        />
      )}

      {/* Tutorial */}
      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}

      {/* Band Modal */}
      <BandModal
        isOpen={showBandModal}
        onClose={() => setShowBandModal(false)}
        userId={currentUser?.id || ''}
      />

      {/* Band Settings Modal */}
      {showBandSettings && currentBand && currentUser && (
        <BandSettings
          bandId={currentBand.id}
          bandName={currentBand.name}
          currentUserId={currentUser.id}
          isAdmin={userRole === 'admin' || userRole === 'owner'}
          onClose={() => setShowBandSettings(false)}
        />
      )}
    </div>
  );
}
