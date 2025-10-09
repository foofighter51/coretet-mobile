import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Music, Share2, ArrowLeft, Play, Pause, X, Check, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { TrackRowWithPlayer } from '../molecules/TrackRowWithPlayer';
import { TabBar } from '../molecules/TabBar';
import { AudioUploader } from '../molecules/AudioUploader';
import { PlaybackBar } from '../molecules/PlaybackBar';
import { SwipeableTrackRow } from '../molecules/SwipeableTrackRow';
import { Track, TabId } from '../../types';
import { db, auth } from '../../../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import DeepLinkService from '../../utils/deepLinkHandler';

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
      backgroundColor: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: designTokens.spacing.md,
      marginBottom: designTokens.spacing.md,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
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
            padding: '4px',
          }}
        >
          <X size={20} color={designTokens.colors.neutral.darkGray} />
        </button>
      </div>

      {availableTracks.length === 0 ? (
        <p style={{
          fontSize: '14px',
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          padding: '20px',
        }}>
          All your tracks are already in this playlist
        </p>
      ) : (
        <>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
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
                    gap: '12px',
                    padding: '12px',
                    borderBottom: '1px solid #f7fafc',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#ebf8ff' : '#ffffff',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: `2px solid ${isSelected ? designTokens.colors.primary.blue : '#cbd5e0'}`,
                    backgroundColor: isSelected ? designTokens.colors.primary.blue : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && <Check size={14} color="#ffffff" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: designTokens.colors.neutral.charcoal,
                      margin: 0,
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
                        margin: '2px 0 0 0',
                      }}>
                        {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onAddTracks(selectedTracks)}
              disabled={selectedTracks.length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedTracks.length > 0 ? designTokens.colors.primary.blue : '#cbd5e0',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
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
};

export function MainDashboard({ currentUser }: MainDashboardProps) {
  const navigate = useNavigate();
  const { playlists, createdPlaylists, followedPlaylists, currentPlaylist, createPlaylist, setCurrentPlaylist } = usePlaylist();

  const [activeTab, setActiveTab] = useState<TabId>('playlists');
  const [playlistFilter, setPlaylistFilter] = useState<'mine' | 'following'>('mine');
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [showUploader, setShowUploader] = useState(false);
  const [showPlaylistUploader, setShowPlaylistUploader] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);

  // Audio playback state - consolidated
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const currentTrackRef = useRef<any | null>(null); // Ref to track current track for event listeners
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [trackRatings, setTrackRatings] = useState<Record<string, 'listened' | 'liked' | 'loved'>>({});
  const [ratingFilter, setRatingFilter] = useState<'all' | 'listened' | 'liked' | 'loved' | 'unrated'>('all');
  const [playlistSortBy, setPlaylistSortBy] = useState<'position' | 'name' | 'duration' | 'rating'>('position');
  const [sortAscending, setSortAscending] = useState(true);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [createPlaylistLoading, setCreatePlaylistLoading] = useState(false);

  // Playlist management state
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [editingPlaylistTitle, setEditingPlaylistTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRatingChange = useCallback((track: Track, rating: 'like' | 'love' | 'none') => {
    console.log(`Rating changed for ${track.title}: ${rating}`);
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      setError('Please enter a playlist title');
      return;
    }

    setCreatePlaylistLoading(true);
    setError(null);

    try {
      await createPlaylist(newPlaylistTitle.trim());
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

  const handlePlaylistClick = async (playlist: any) => {
    setCurrentPlaylist(playlist);
    setViewMode('detail');

    // Fetch playlist tracks
    try {
      const { data, error } = await db.playlistItems.getByPlaylist(playlist.id);
      if (error) {
        console.error('Failed to fetch playlist tracks:', error);
        return;
      }
      setPlaylistTracks(data || []);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentPlaylist(null);
    setPlaylistTracks([]);
    setShowPlaylistMenu(false);
    setEditingPlaylistTitle(null);
    setShowDeleteConfirm(false);
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

    try {
      const { error: deleteError } = await db.playlists.delete(currentPlaylist.id);

      if (deleteError) throw deleteError;

      // Reload playlists to update the list
      await loadPlaylists();

      // Go back to list view
      handleBackToList();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete playlist';
      setError(errorMsg + '. Please try again.');
      setShowDeleteConfirm(false);
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

  const handleAddExistingTracks = async (selectedTrackIds: string[]) => {
    if (!currentPlaylist || !currentUser?.id) return;

    try {
      // Get current playlist items to determine starting position
      const { data: items } = await db.playlistItems.getByPlaylist(currentPlaylist.id);
      let nextPosition = (items?.length || 0) + 1;

      // Add each selected track to the playlist
      for (const trackId of selectedTrackIds) {
        await db.playlistItems.add({
          playlist_id: currentPlaylist.id,
          track_id: trackId,
          added_by: currentUser.id,
          position: nextPosition++,
        });
      }

      // Refresh playlist tracks
      const { data } = await db.playlistItems.getByPlaylist(currentPlaylist.id);
      setPlaylistTracks(data || []);
      setShowTrackSelector(false);
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
    }
  };

  const playNextTrack = () => {
    const track = currentTrackRef.current;
    console.log('🎵 playNextTrack called, currentTrack:', track?.title);
    if (!track) return;

    // Determine which track list to use
    let trackList: any[] = [];

    if (activeTab === 'tracks') {
      // Use filtered tracks from the Tracks tab
      trackList = filteredTracks;
      console.log('🎵 Using filtered tracks, count:', trackList.length);
    } else if (activeTab === 'playlists' && viewMode === 'detail') {
      // Use filtered playlist tracks
      trackList = filteredPlaylistTracks.map((item: any) => item.tracks).filter(Boolean);
      console.log('🎵 Using playlist tracks, count:', trackList.length);
    }

    if (trackList.length === 0) {
      console.log('🎵 No tracks in list, returning');
      return;
    }

    // Find current track index
    const currentIndex = trackList.findIndex((t: any) => t.id === track.id);
    console.log('🎵 Current index:', currentIndex, 'Total tracks:', trackList.length);

    // Play next track if there is one
    if (currentIndex >= 0 && currentIndex < trackList.length - 1) {
      const nextTrack = trackList[currentIndex + 1];
      console.log('🎵 Playing next track:', nextTrack.title);
      handlePlayPause(nextTrack);
    } else {
      console.log('🎵 No next track available (last track or not found)');
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
          console.log('🎵 Track ended event fired');
          setIsPlaying(false);
          // Auto-play next track
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
      } else {
        // Play new or resume track
        setAudioError(null);

        if (currentTrack?.id !== targetTrack.id) {
          // New track - load and play
          setIsLoading(true);
          audioRef.current.src = targetTrack.file_url;
          setCurrentTrack(targetTrack);
          currentTrackRef.current = targetTrack; // Update ref for event listeners
        }

        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioError('Failed to play audio');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  // Fetch user's tracks and ratings
  useEffect(() => {
    const fetchUserTracks = async () => {
      if (!currentUser?.id) return;

      try {
        const { data, error } = await db.tracks.getByUser(currentUser.id);
        if (error) {
          console.error('Failed to fetch tracks:', error);
          return;
        }
        setTracks(data || []);

        // Fetch user's ratings
        const { data: ratingsData } = await db.ratings.getByUser(currentUser.id);
        if (ratingsData) {
          const ratingsMap: Record<string, 'listened' | 'liked' | 'loved'> = {};
          ratingsData.forEach((rating: any) => {
            ratingsMap[rating.track_id] = rating.rating;
          });
          setTrackRatings(ratingsMap);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    fetchUserTracks();
  }, [currentUser?.id]);

  const handleRate = async (trackId: string, rating: 'listened' | 'liked' | 'loved') => {
    if (!currentUser?.id) return;

    try {
      await db.ratings.upsert(trackId, rating, currentUser.id);
      setTrackRatings(prev => ({ ...prev, [trackId]: rating }));
    } catch (error) {
      console.error('Error rating track:', error);
    }
  };

  const handleRemoveTrackFromPlaylist = async (trackId: string) => {
    if (!currentPlaylist || !isPlaylistOwner) return;

    try {
      const { error } = await db.playlistItems.removeByTrack(currentPlaylist.id, trackId);

      if (error) {
        console.error('Failed to remove track:', error);
        setError('Failed to remove track from playlist');
        return;
      }

      // Stop playback if this track is currently playing
      if (currentTrack?.id === trackId && isPlaying) {
        handlePlayPause();
      }

      // Reload playlist tracks
      await loadPlaylistTracks(currentPlaylist.id);
    } catch (err) {
      console.error('Error removing track:', err);
      setError('Failed to remove track from playlist');
    }
  };

  const filteredTracks = useMemo(() => {
    return tracks
      .filter(track => {
        if (ratingFilter === 'all') return true;
        if (ratingFilter === 'unrated') return !trackRatings[track.id];
        return trackRatings[track.id] === ratingFilter;
      })
      .map(track => ({
        ...track,
        isPlaying: track.id === currentTrack?.id && isPlaying
      }));
  }, [tracks, currentTrack, isPlaying, ratingFilter, trackRatings]);

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
  const isPlaylistOwner = currentPlaylist ? createdPlaylists.some(p => p.id === currentPlaylist.id) : false;

  const renderContent = () => {
    switch (activeTab) {
      case 'tracks':
        return (
          <div style={{
            padding: designTokens.spacing.md,
          }}>

            {showUploader && (
              <div style={{
                backgroundColor: '#f7fafc',
                padding: designTokens.spacing.md,
                borderRadius: '8px',
                marginBottom: designTokens.spacing.md,
              }}>
                <AudioUploader
                  multiple={true}
                  onUploadComplete={(results) => {
                    console.log('✅ Upload successful:', results);
                    setShowUploader(false);
                    // Refresh tracks list
                    if (currentUser?.id) {
                      db.tracks.getByUser(currentUser.id).then(({ data }) => {
                        setTracks(data || []);
                      });
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
                  onClick={() => setShowUploader(false)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#e2e8f0',
                    color: '#4a5568',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {tracks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: designTokens.colors.neutral.darkGray,
              }}>
                <Music size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>No tracks uploaded yet</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Upload your first track to get started
                </p>
              </div>
            ) : (
              <div>
                {/* Rating Filter */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                }}>
                  {(['all', 'listened', 'liked', 'loved', 'unrated'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setRatingFilter(filter)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: ratingFilter === filter ? designTokens.colors.primary.blue : '#f7fafc',
                        color: ratingFilter === filter ? '#ffffff' : designTokens.colors.neutral.darkGray,
                        border: ratingFilter === filter ? 'none' : '1px solid #e2e8f0',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                      }}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>

                {filteredTracks.map((track) => (
                  <SwipeableTrackRow
                    key={track.id}
                    track={{
                      id: track.id,
                      title: track.title,
                      duration_seconds: track.duration_seconds,
                      folder_path: track.folder_path
                    }}
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    currentRating={trackRatings[track.id]}
                    onPlayPause={() => handlePlayPause(track)}
                    onRate={(rating) => handleRate(track.id, rating)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'playlists':
        return (
          <div style={{
            padding: designTokens.spacing.md,
          }}>

            {showCreatePlaylist && (
              <div style={{
                backgroundColor: '#f7fafc',
                padding: designTokens.spacing.md,
                borderRadius: '8px',
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
                    padding: '10px',
                    border: `1px solid ${error ? '#fc8181' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px',
                  }}
                  autoFocus
                />
                {error && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '6px',
                    color: '#c00',
                    fontSize: '13px',
                    marginBottom: '8px',
                  }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={createPlaylistLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: designTokens.colors.primary.blue,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
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
                      padding: '8px 16px',
                      backgroundColor: '#e2e8f0',
                      color: '#4a5568',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: createPlaylistLoading ? 'not-allowed' : 'pointer',
                      opacity: createPlaylistLoading ? 0.6 : 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Playlist Filter Toggle */}
            {viewMode !== 'detail' && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: designTokens.spacing.md,
                padding: '4px',
                backgroundColor: designTokens.colors.neutral.offWhite,
                borderRadius: '8px',
              }}>
                <button
                  onClick={() => setPlaylistFilter('mine')}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: playlistFilter === 'mine' ? designTokens.colors.primary.blue : 'transparent',
                    color: playlistFilter === 'mine' ? '#ffffff' : designTokens.colors.neutral.charcoal,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
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
                    padding: '8px 16px',
                    backgroundColor: playlistFilter === 'following' ? designTokens.colors.primary.blue : 'transparent',
                    color: playlistFilter === 'following' ? '#ffffff' : designTokens.colors.neutral.charcoal,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Following {followedPlaylists.length > 0 && `(${followedPlaylists.length})`}
                </button>
              </div>
            )}

            {viewMode === 'detail' && currentPlaylist ? (
              <div>
                {/* Edit title modal */}
                {editingPlaylistTitle && (
                  <div style={{
                    backgroundColor: '#f7fafc',
                    padding: designTokens.spacing.md,
                    borderRadius: '8px',
                    marginBottom: designTokens.spacing.md,
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Edit Playlist Title</h3>
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
                        padding: '10px',
                        border: `1px solid ${error ? '#fc8181' : '#e2e8f0'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        marginBottom: '8px',
                      }}
                      autoFocus
                    />
                    {error && (
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '6px',
                        color: '#c00',
                        fontSize: '13px',
                        marginBottom: '8px',
                      }}>
                        {error}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleEditPlaylistTitle}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: designTokens.colors.primary.blue,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
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
                          padding: '8px 16px',
                          backgroundColor: '#e2e8f0',
                          color: '#4a5568',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
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
                    backgroundColor: '#fff5f5',
                    padding: designTokens.spacing.md,
                    borderRadius: '8px',
                    marginBottom: designTokens.spacing.md,
                    border: '1px solid #feb2b2',
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#c53030' }}>Delete Playlist?</h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#742a2a' }}>
                      This will permanently delete "{currentPlaylist.title}" and all its contents. This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleDeletePlaylist}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#e53e3e',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#e2e8f0',
                          color: '#4a5568',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showTrackSelector && (
                  <TrackSelectorModal
                    tracks={tracks}
                    existingTrackIds={playlistTracks.map(item => item.tracks?.id).filter(Boolean)}
                    onAddTracks={handleAddExistingTracks}
                    onCancel={() => setShowTrackSelector(false)}
                  />
                )}

                {showPlaylistUploader && (
                  <div style={{
                    backgroundColor: '#f7fafc',
                    padding: designTokens.spacing.md,
                    borderRadius: '8px',
                    marginBottom: designTokens.spacing.md,
                  }}>
                    <AudioUploader
                      multiple={true}
                      onUploadComplete={async (results) => {
                        console.log('✅ Upload successful:', results);
                        setShowPlaylistUploader(false);

                        // Add all uploaded tracks to current playlist
                        if (results.length > 0 && currentPlaylist) {
                          const { data: items } = await db.playlistItems.getByPlaylist(currentPlaylist.id);
                          let nextPosition = (items?.length || 0) + 1;

                          // Add each track to the playlist
                          for (const result of results) {
                            await db.playlistItems.add({
                              playlist_id: currentPlaylist.id,
                              track_id: result.trackId,
                              added_by: currentUser?.id || '',
                              position: nextPosition++,
                            });
                          }

                          // Refresh playlist tracks
                          const { data } = await db.playlistItems.getByPlaylist(currentPlaylist.id);
                          setPlaylistTracks(data || []);

                          // Refresh tracks list
                          if (currentUser?.id) {
                            db.tracks.getByUser(currentUser.id).then(({ data }) => {
                              setTracks(data || []);
                            });
                          }
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
                        marginTop: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#e2e8f0',
                        color: '#4a5568',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
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
                    padding: '40px 20px',
                    color: designTokens.colors.neutral.darkGray,
                  }}>
                    <Music size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>No tracks in this playlist yet</p>
                  </div>
                ) : (
                  <div>
                    {/* Sort Options */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '12px',
                      overflowX: 'auto',
                      paddingBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: designTokens.colors.neutral.darkGray,
                        padding: '6px 0',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}>Sort:</span>
                      {(['position', 'name', 'duration', 'rating'] as const).map(sort => {
                        const isActive = playlistSortBy === sort;
                        const label = sort === 'position' ? 'Default' : sort.charAt(0).toUpperCase() + sort.slice(1);

                        // Show arrow only for active sort (except position/default)
                        const showArrow = isActive && sort !== 'position';
                        const arrow = sortAscending ? ' ↑' : ' ↓';

                        return (
                          <button
                            key={sort}
                            onClick={() => handleSortChange(sort)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: isActive ? designTokens.colors.primary.blue : '#ffffff',
                              color: isActive ? '#ffffff' : designTokens.colors.neutral.darkGray,
                              border: isActive ? 'none' : '1px solid #e2e8f0',
                              borderRadius: '16px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s',
                            }}
                          >
                            {label}{showArrow ? arrow : ''}
                          </button>
                        );
                      })}
                    </div>

                    {/* Rating Filter */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '16px',
                      overflowX: 'auto',
                      paddingBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: designTokens.colors.neutral.darkGray,
                        padding: '6px 0',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}>Filter:</span>
                      {(['all', 'listened', 'liked', 'loved', 'unrated'] as const).map(filter => (
                        <button
                          key={filter}
                          onClick={() => setRatingFilter(filter)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: ratingFilter === filter ? designTokens.colors.primary.blue : '#f7fafc',
                            color: ratingFilter === filter ? '#ffffff' : designTokens.colors.neutral.darkGray,
                            border: ratingFilter === filter ? 'none' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                          }}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>

                    {filteredPlaylistTracks.map((item: any) => (
                      item.tracks && (
                        <SwipeableTrackRow
                          key={item.id}
                          track={{
                            id: item.tracks.id,
                            title: item.tracks.title,
                            duration_seconds: item.tracks.duration_seconds,
                            folder_path: item.tracks.folder_path
                          }}
                          isPlaying={currentTrack?.id === item.tracks.id && isPlaying}
                          currentRating={trackRatings[item.tracks.id]}
                          onPlayPause={() => handlePlayPause(item.tracks)}
                          onRate={(rating) => handleRate(item.tracks.id, rating)}
                          onRemove={isPlaylistOwner ? () => handleRemoveTrackFromPlaylist(item.tracks.id) : undefined}
                          showRemoveButton={isPlaylistOwner}
                        />
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (playlistFilter === 'mine' ? createdPlaylists : followedPlaylists).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: designTokens.colors.neutral.darkGray,
              }}>
                <Music size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>{playlistFilter === 'mine' ? 'No playlists yet' : 'Not following any playlists'}</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  {playlistFilter === 'mine'
                    ? 'Create your first playlist to start sharing music'
                    : 'Follow playlists shared with you to see them here'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(playlistFilter === 'mine' ? createdPlaylists : followedPlaylists).map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    style={{
                      padding: '16px',
                      backgroundColor: currentPlaylist?.id === playlist.id ? '#ebf8ff' : '#ffffff',
                      border: currentPlaylist?.id === playlist.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                      borderRadius: '8px',
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
                          fontSize: '16px',
                          fontWeight: '600',
                          color: designTokens.colors.neutral.charcoal,
                          marginBottom: '4px',
                        }}>
                          {playlist.title}
                        </h3>
                        {playlist.description && (
                          <p style={{
                            fontSize: '14px',
                            color: designTokens.colors.neutral.darkGray,
                          }}>
                            {playlist.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();

                          // Use custom app scheme for direct app opening
                          const shareUrl = `coretet://playlist/${playlist.share_code}`;

                          // On native platforms, use native share sheet
                          if (Capacitor.isNativePlatform()) {
                            try {
                              // Only use text field to avoid "2 Links" issue on iOS
                              // iOS Share treats text and url as separate items
                              await Share.share({
                                title: `Check out ${playlist.title} on CoreTet`,
                                text: shareUrl,
                                dialogTitle: 'Share Playlist',
                              });
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
                          padding: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: designTokens.colors.primary.blue,
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        <Share2 size={20} />
                      </button>
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
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{
                    fontSize: '14px',
                    color: designTokens.colors.neutral.darkGray,
                    marginBottom: '4px',
                  }}>
                    Name
                  </p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: designTokens.colors.neutral.charcoal,
                  }}>
                    {currentUser.name || 'User'}
                  </p>
                </div>

                {currentUser.email && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{
                      fontSize: '14px',
                      color: designTokens.colors.neutral.darkGray,
                      marginBottom: '4px',
                    }}>
                      Email
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: designTokens.colors.neutral.charcoal,
                    }}>
                      {currentUser.email}
                    </p>
                  </div>
                )}

                {currentUser.phoneNumber && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{
                      fontSize: '14px',
                      color: designTokens.colors.neutral.darkGray,
                      marginBottom: '4px',
                    }}>
                      Phone
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: designTokens.colors.neutral.charcoal,
                    }}>
                      {currentUser.phoneNumber}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/feedback')}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: designTokens.colors.primary.blue,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <MessageSquare size={18} />
                  Community Feedback
                </button>

                <button
                  onClick={() => auth.signOut()}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#f7fafc',
                    color: '#4a5568',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        {/* Top header with logo, action button, and user button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        }}>
          {/* Left: CoreTet Circle Logo or Back Button */}
          {activeTab === 'playlists' && viewMode === 'detail' ? (
            <button
              onClick={handleBackToList}
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
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.primary.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              C
            </div>
          )}

          {/* Center: Action Button */}
          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            {activeTab === 'playlists' && viewMode === 'list' && (
              <button
                onClick={() => setShowCreatePlaylist(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: designTokens.colors.primary.blue,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                New
              </button>
            )}
            {activeTab === 'tracks' && (
              <button
                onClick={() => setShowUploader(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: designTokens.colors.primary.blue,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Upload
              </button>
            )}
            {activeTab === 'playlists' && viewMode === 'detail' && isPlaylistOwner && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowTrackSelector(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: '#ffffff',
                    color: designTokens.colors.primary.blue,
                    border: `1px solid ${designTokens.colors.primary.blue}`,
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  From Library
                </button>
                <button
                  onClick={() => setShowPlaylistUploader(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: designTokens.colors.primary.blue,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  Upload New
                </button>
              </div>
            )}
          </div>

          {/* Right: Menu button for playlist detail or Spacer */}
          <div style={{ width: '40px', flexShrink: 0, position: 'relative' }}>
            {activeTab === 'playlists' && viewMode === 'detail' && isPlaylistOwner && (
              <button
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
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
        {showPlaylistMenu && activeTab === 'playlists' && viewMode === 'detail' && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '180px',
          }}>
            <button
              onClick={() => {
                setNewTitle(currentPlaylist?.title || '');
                setEditingPlaylistTitle(currentPlaylist?.id || null);
                setShowPlaylistMenu(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: designTokens.colors.neutral.charcoal,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <Edit2 size={16} />
              Edit Title
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(true);
                setShowPlaylistMenu(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#e53e3e',
              }}
            >
              <Trash2 size={16} />
              Delete Playlist
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        paddingBottom: currentTrack ? '200px' : '88px', // Extra space for PlaybackBar when playing
      }}>
        {renderContent()}
      </div>

      {/* Fixed Footer - PlaybackBar (only show when track is selected) */}
      {currentTrack && (
        <div style={{
          position: 'fixed',
          bottom: '80px', // Stick to TabBar (adjusted to match actual TabBar height)
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
        onTabChange={setActiveTab}
      />
    </div>
  );
}
