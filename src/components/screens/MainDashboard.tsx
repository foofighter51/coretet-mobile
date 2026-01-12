import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Music, Upload, ArrowLeft, Play, Pause, X, Check, MessageSquare, MoreVertical, Edit2, Trash2, Headphones, ThumbsUp, Heart, HelpCircle, Settings, GripVertical, Users, Share2 } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { useTheme } from '../../contexts/ThemeContext';
import { useSetList } from '../../contexts/SetListContext';
import { useBand } from '../../contexts/BandContext';
import { TrackRowWithPlayer } from '../molecules/TrackRowWithPlayer';
import { TabBar } from '../molecules/TabBar';
import { AudioUploader } from '../molecules/AudioUploader';
import { PlaybackBar } from '../molecules/PlaybackBar';
import { SwipeableTrackRow } from '../molecules/SwipeableTrackRow';
import { Tutorial } from '../molecules/Tutorial';
import { BandModal } from '../molecules/BandModal';
import { BandSettings } from '../molecules/BandSettings';
import { SettingsModal } from '../molecules/SettingsModal';
import { IntroModal } from '../molecules/IntroModal';
import { EmptyState } from '../molecules/EmptyState';
import { TrackDetailModal } from '../molecules/TrackDetailModal';
import { InlineSpinner } from '../atoms/InlineSpinner';
import { TrackSkeleton } from '../atoms/TrackSkeleton';
import { SortButton } from '../molecules/SortButton';
import { FilterButton } from '../molecules/FilterButton';
import { UploadButton } from '../molecules/UploadButton';
import { DropdownMenu } from '../ui/DropdownMenu';
import { DialogModal } from '../ui/DialogModal';
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
  const designTokens = useDesignTokens();
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

export function MainDashboard({ currentUser }: MainDashboardProps) {
  const navigate = useNavigate();
  const designTokens = useDesignTokens();
  const { isDarkMode } = useTheme();

  const baseStyle: React.CSSProperties = {
    fontFamily: designTokens.typography.fontFamily,
    width: '100%',
    maxWidth: '425px',
    minHeight: '100vh',
    height: '100vh', // Use static viewport height - prevents keyboard resize
    margin: '0 auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    backgroundColor: designTokens.colors.surface.tertiary, // Use theme background
  };
  const { setLists, createdSetLists, followedSetLists, currentSetList, createSetList, setCurrentSetList, refreshSetLists, isLoading: setListsLoading } = useSetList();
  const { currentBand, userBands, userRole, switchBand } = useBand();

  // Filter set lists for Band tab - only show set lists with matching band_id
  const bandCreatedPlaylists = useMemo(() => {
    if (!currentBand) return [];
    // Use 'setLists' instead of 'createdSetLists' to include set lists from all band members
    return setLists.filter((p: any) => p.band_id === currentBand.id);
  }, [setLists, currentBand]);

  // Filter set lists for Personal tab - only show set lists with NULL band_id
  const personalCreatedPlaylists = useMemo(() => {
    return createdSetLists.filter((p: any) => !p.band_id);
  }, [createdSetLists]);

  // Following set lists are user-level (not band-filtered)
  const personalFollowedPlaylists = useMemo(() => {
    return followedSetLists;
  }, [followedSetLists]);

  // Legacy filter (kept for backwards compatibility, can be removed later)
  const filteredCreatedPlaylists = useMemo(() => {
    if (!currentBand) return createdSetLists;
    return createdSetLists.filter((p: any) => !p.band_id || p.band_id === currentBand.id);
  }, [createdSetLists, currentBand]);

  const filteredFollowedPlaylists = useMemo(() => {
    if (!currentBand) return followedSetLists;
    return followedSetLists.filter((p: any) => !p.band_id || p.band_id === currentBand.id);
  }, [followedSetLists, currentBand]);

  const [activeTab, setActiveTab] = useState<TabId>('playlists');
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
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showPlaylistUploader, setShowPlaylistUploader] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [showBandModal, setShowBandModal] = useState(false);
  const [showBandSettings, setShowBandSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

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
  const [createSetListLoading, setCreatePlaylistLoading] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [deletingPlaylist, setDeletingPlaylist] = useState(false);
  const [deletingTracks, setDeletingTracks] = useState(false);

  // Playlist management state
  const [editingPlaylistTitle, setEditingPlaylistTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Ref for iOS keyboard handling in edit playlist title
  const playlistTitleInputRef = useRef<HTMLInputElement>(null);
  // Ref for iOS keyboard handling in create playlist
  const createSetListInputRef = useRef<HTMLInputElement>(null);

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

  // Tutorial and Intro state
  const [showTutorial, setShowTutorial] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

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
      // Pass band_id only if in Band tab, otherwise null for Personal playlists
      const bandId = activeTab === 'playlists' ? currentBand?.id : null;
      await createSetList(newPlaylistTitle.trim(), undefined, bandId);
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

  const loadPlaylistTracks = async (setListId: string) => {
    setLoadingTracks(true);
    try {
      const { data, error } = await db.setListEntries.getBySetList(setListId);
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
    } finally {
      setLoadingTracks(false);
    }
  };

  const handlePlaylistClick = async (playlist: any) => {
    setCurrentSetList(playlist);
    setViewMode('detail');
    await loadPlaylistTracks(playlist.id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentSetList(null);
    setPlaylistTracks([]);
    setShowPlaylistMenu(false);
    setEditingPlaylistTitle(null);
    setShowDeleteConfirm(false);
    setShowAllTracks(false);
    // Reset edit tracks mode
    setIsEditingTracks(false);
    setSelectedTrackIds([]);
  };

  // Handle tab changes - reset view mode when switching tabs from detail view
  const handleTabChange = (newTab: TabId) => {
    if (viewMode === 'detail' && (activeTab === 'playlists' || activeTab === 'playlists')) {
      handleBackToList();
    }
    setActiveTab(newTab);
  };

  const handleEditPlaylistTitle = async () => {
    if (!currentSetList || !newTitle.trim()) {
      setError('Please enter a playlist title');
      return;
    }

    try {
      const { data, error: updateError } = await db.setLists.update(currentSetList.id, {
        title: newTitle.trim(),
      });

      if (updateError) throw updateError;

      // Update current playlist
      setCurrentSetList({ ...currentSetList, title: newTitle.trim() });

      // Refresh the playlist list to show updated title
      await refreshSetLists();

      setEditingPlaylistTitle(null);
      setShowPlaylistMenu(false);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update playlist';
      setError(errorMsg + '. Please try again.');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!currentSetList || deletingPlaylist) return;

    setDeletingPlaylist(true);
    try {
      const { error: deleteError } = await db.setLists.delete(currentSetList.id);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      // Reload playlists to update the list
      await refreshSetLists();

      // Go back to list view
      handleBackToList();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('❌ Delete failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete playlist';
      setError(errorMsg + '. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setDeletingPlaylist(false);
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
    if (!currentSetList) return;

    try {
      // Update positions for all tracks
      const updates = reorderedTracks.map((track, index) => ({
        id: track.id,
        position: index + 1,
      }));

      // Batch update positions
      await Promise.all(
        updates.map(({ id, position }) =>
          db.setListEntries.updatePosition(id, position)
        )
      );

      // Refresh playlist
      await loadPlaylistTracks(currentSetList.id);

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
    if (!currentSetList || !currentUser?.id) {
      console.error('Missing currentSetList or currentUser:', { currentSetList, currentUser });
      return;
    }

    try {

      // Get current playlist items to determine starting position
      const { data: items, error: fetchError } = await db.setListEntries.getBySetList(currentSetList.id);
      if (fetchError) {
        console.error('Error fetching playlist items:', fetchError);
        throw fetchError;
      }

      // Find the maximum position value and start from there
      const maxPosition = items && items.length > 0
        ? Math.max(...items.map((item: any) => item.position || 0))
        : 0;
      let nextPosition = maxPosition + 1;

      // Add each selected track to the playlist
      for (const trackId of selectedTrackIds) {
        const { data, error } = await db.setListEntries.add({
          set_list_id: currentSetList.id,
          track_id: trackId,
          added_by: currentUser.id,
          position: nextPosition++,
        });

        if (error) {
          console.error('Error adding track to playlist:', { trackId, error });
          throw error;
        }
      }

      // Refresh playlist tracks
      await loadPlaylistTracks(currentSetList.id);
      setShowTrackSelector(false);
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

    if (activeTab === 'playlists' && viewMode === 'detail') {
      trackList = filteredPlaylistTracks.map((item: any) => item.tracks).filter(Boolean);
    } else if (activeTab === 'playlists' && viewMode === 'detail') {
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
        album: currentSetList?.title || 'My Library',
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
    if (!currentSetList || selectedTrackIds.length === 0 || deletingTracks) return;

    const trackCount = selectedTrackIds.length;
    setDeletingTracks(true);

    try {
      // Delete all selected tracks in parallel
      const deletePromises = selectedTrackIds.map(trackId =>
        db.setListEntries.removeByTrack(currentSetList.id, trackId)
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
      await loadPlaylistTracks(currentSetList.id);
    } catch (err) {
      console.error('Error removing tracks:', err);
      setError('Failed to remove tracks from playlist');
    } finally {
      setDeletingTracks(false);
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
    // If showing all tracks, convert bandScopedTracks to playlist format
    const tracksToFilter = showAllTracks
      ? bandScopedTracks.map((track, index) => ({
          id: track.id,
          tracks: track,
          position: index,
          set_list_id: null,
        }))
      : playlistTracks;

    const filtered = tracksToFilter.filter(item => {
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
  }, [playlistTracks, showAllTracks, bandScopedTracks, ratingFilter, trackRatings, playlistSortBy, sortAscending]);

  // Check if current playlist is owned by the user (moved to component level)
  const isPlaylistOwner = currentSetList ? filteredCreatedPlaylists.some(p => p.id === currentSetList.id) : false;

  const renderContent = () => {
    // Select correct playlists based on active tab
    const currentCreatedPlaylists = activeTab === 'playlists' ? bandCreatedPlaylists :
                                     activeTab === 'playlists' ? personalCreatedPlaylists :
                                     filteredCreatedPlaylists;
    const currentFollowedPlaylists = activeTab === 'playlists' ? personalFollowedPlaylists : [];

    // Determine which playlists to display based on tab and filter
    // Band tab always shows created playlists (no following option)
    // Personal tab respects the mine/following filter
    const displayedPlaylists = currentCreatedPlaylists;

    switch (activeTab) {
      case 'playlists':
      
        return (
          <div style={{
            padding: designTokens.spacing.md,
          }}>

            {showCreatePlaylist && (
              <DialogModal
                isOpen={true}
                onClose={() => {
                  setShowCreatePlaylist(false);
                  setNewPlaylistTitle('');
                  setError(null);
                }}
                title="Create New Playlist"
                size="sm"
                hasKeyboardInput={true}
                keyboardInputRef={createSetListInputRef}
                footer={
                  <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setShowCreatePlaylist(false);
                        setNewPlaylistTitle('');
                        setError(null);
                      }}
                      disabled={createSetListLoading}
                      style={{
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                        backgroundColor: 'transparent',
                        border: `1px solid ${designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.sm,
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        cursor: createSetListLoading ? 'not-allowed' : 'pointer',
                        opacity: createSetListLoading ? 0.6 : 1,
                        color: designTokens.colors.text.secondary,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePlaylist}
                      disabled={createSetListLoading}
                      style={{
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                        backgroundColor: designTokens.colors.primary.blue,
                        color: designTokens.colors.text.inverse,
                        border: 'none',
                        borderRadius: designTokens.borderRadius.sm,
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        cursor: createSetListLoading ? 'not-allowed' : 'pointer',
                        opacity: createSetListLoading ? 0.6 : 1,
                      }}
                    >
                      {createSetListLoading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                }
              >
                <div>
                  <input
                    ref={createSetListInputRef}
                    type="text"
                    placeholder="Playlist title..."
                    value={newPlaylistTitle}
                    onChange={(e) => {
                      setNewPlaylistTitle(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !createSetListLoading && newPlaylistTitle.trim()) {
                        handleCreatePlaylist();
                      }
                    }}
                    disabled={createSetListLoading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    style={{
                      width: '100%',
                      padding: designTokens.spacing.md,
                      border: `1px solid ${error ? designTokens.colors.system.error : designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      fontSize: designTokens.typography.fontSizes.body,
                      marginBottom: error ? designTokens.spacing.sm : 0,
                      boxSizing: 'border-box',
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
                    }}>
                      {error}
                    </div>
                  )}
                </div>
              </DialogModal>
            )}

            {viewMode === 'detail' && (currentSetList || showAllTracks) ? (
              <div>
                {/* Edit title modal */}
                {editingPlaylistTitle && (
                  <DialogModal
                    isOpen={true}
                    onClose={() => {
                      setEditingPlaylistTitle(null);
                      setError(null);
                    }}
                    title="Edit Playlist Title"
                    size="sm"
                    hasKeyboardInput={true}
                    keyboardInputRef={playlistTitleInputRef}
                    footer={
                      <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setEditingPlaylistTitle(null);
                            setError(null);
                          }}
                          style={{
                            padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                            backgroundColor: 'transparent',
                            border: `1px solid ${designTokens.colors.borders.default}`,
                            borderRadius: designTokens.borderRadius.sm,
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            cursor: 'pointer',
                            color: designTokens.colors.text.secondary,
                          }}
                        >
                          Cancel
                        </button>
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
                      </div>
                    }
                  >
                    <div>
                      <input
                        ref={playlistTitleInputRef}
                        type="text"
                        value={newTitle}
                        onChange={(e) => {
                          setNewTitle(e.target.value);
                          setError(null);
                        }}
                        placeholder="Playlist title..."
                        style={{
                          width: '100%',
                          padding: designTokens.spacing.md,
                          border: `1px solid ${error ? designTokens.colors.system.error : designTokens.colors.borders.default}`,
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.body,
                          marginBottom: error ? designTokens.spacing.sm : 0,
                          boxSizing: 'border-box',
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTitle.trim()) {
                            handleEditPlaylistTitle();
                          }
                        }}
                      />
                      {error && (
                        <div style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                          backgroundColor: designTokens.colors.feedback.error.bg,
                          border: `1px solid ${designTokens.colors.feedback.error.border}`,
                          borderRadius: designTokens.borderRadius.sm,
                          color: designTokens.colors.feedback.error.text,
                          fontSize: designTokens.typography.fontSizes.caption,
                        }}>
                          {error}
                        </div>
                      )}
                    </div>
                  </DialogModal>
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
                      This will permanently delete "{currentSetList.title}" and all its contents. This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                      <button
                        onClick={handleDeletePlaylist}
                        disabled={deletingPlaylist}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          backgroundColor: designTokens.colors.system.error,
                          color: designTokens.colors.text.inverse,
                          border: 'none',
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: deletingPlaylist ? 'not-allowed' : 'pointer',
                          opacity: deletingPlaylist ? 0.6 : 1,
                          fontWeight: designTokens.typography.fontWeights.medium,
                        }}
                      >
                        {deletingPlaylist ? 'Deleting...' : 'Delete'}
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
                      context={activeTab}
                      bandName={activeTab === 'playlists' ? currentBand?.name : undefined}
                      onUploadComplete={async (results) => {
                        setShowPlaylistUploader(false);

                        // Add all uploaded tracks to current playlist
                        if (results.length > 0 && currentSetList) {

                          const { data: items, error: fetchError } = await db.setListEntries.getBySetList(currentSetList.id);
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

                          // Add each track to the playlist
                          for (const result of results) {
                            const { data, error } = await db.setListEntries.add({
                              set_list_id: currentSetList.id,
                              track_id: result.trackId,
                              added_by: currentUser?.id || '',
                              position: nextPosition++,
                            });

                            if (error) {
                              console.error('Error adding uploaded track to playlist:', { trackId: result.trackId, error });
                              setError('Failed to add tracks to playlist. Please try again.');
                              return;
                            }
                          }

                          // Refresh playlist tracks
                          await loadPlaylistTracks(currentSetList.id);

                          // Refresh tracks list
                          if (currentUser?.id) {
                            db.tracks.getByUser(currentUser.id).then(({ data }) => {
                              setTracks(data || []);
                            });
                          }
                        } else {
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

                {(showAllTracks ? bandScopedTracks.length === 0 : playlistTracks.length === 0) ? (
                  <EmptyState
                    icon={Upload}
                    title="No tracks yet"
                    description={
                      showAllTracks
                        ? "Upload tracks to see them here"
                        : isPlaylistOwner
                        ? "Tap the Upload button above to add your first track"
                        : "The playlist owner hasn't added any tracks yet"
                    }
                  />
                ) : loadingTracks ? (
                  <TrackSkeleton count={5} />
                ) : (
                  <div>
                    {/* Reorder Mode Actions */}
                    {isReordering && !showAllTracks && (
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
            ) : setListsLoading ? (
              <InlineSpinner message="Loading playlists..." />
            ) : displayedPlaylists.length === 0 ? (
              <EmptyState
                icon={Music}
                title="No playlists yet"
                description="Create your first playlist to start sharing music with your band"
                action={{
                  label: 'Create Playlist',
                  onClick: () => setShowCreatePlaylist(true),
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
                {displayedPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    style={{
                      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                      backgroundColor: currentSetList?.id === playlist.id ? designTokens.colors.surface.hover : designTokens.colors.surface.primary,
                      border: currentSetList?.id === playlist.id ? `2px solid ${designTokens.colors.primary.blue}` : `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: designTokens.spacing.sm,
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: designTokens.typography.fontSizes.body,
                          fontWeight: designTokens.typography.fontWeights.semibold,
                          color: designTokens.colors.neutral.charcoal,
                          margin: 0,
                          marginBottom: '2px',
                        }}>
                          {playlist.title}
                        </h3>
                        <p style={{
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.neutral.gray,
                          margin: 0,
                        }}>
                          {playlist.set_list_entries?.[0]?.count ?? 0} {(playlist.set_list_entries?.[0]?.count ?? 0) === 1 ? 'track' : 'tracks'}
                        </p>
                        {playlist.description && (
                          <p style={{
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            color: designTokens.colors.neutral.darkGray,
                            marginTop: '6px',
                            marginBottom: 0,
                          }}>
                            {playlist.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'shared':
        return (
          <div style={{
            padding: '16px',
            paddingBottom: '100px',
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '16px',
              color: designTokens.colors.neutral.charcoal,
            }}>
              Shared With Me
            </h2>

            <EmptyState
              icon={Share2}
              title="No shared set lists yet"
              description="When other bands share set lists with you, they'll appear here."
            />
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
        paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
      }}>
        {/* Top header with logo, action button, and user button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        }}>
          {/* Left: CoreTet Circle Logo or Back Button */}
          {(activeTab === 'playlists' || activeTab === 'playlists') && viewMode === 'detail' ? (
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
            <div
              style={{
                width: designTokens.spacing.xxl,
                height: designTokens.spacing.xxl,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                padding: 0,
              }}
            >
              <img
                src={isDarkMode ? "/logo.png" : "/logo-light.png"}
                alt="CoreTet"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* Center: Action Button */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: designTokens.spacing.xs }}>
            {/* Action Buttons */}
            {activeTab === 'playlists' && viewMode === 'list' && (
              <div style={{ display: 'flex', gap: designTokens.spacing.sm, alignItems: 'center' }}>
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
                <button
                  onClick={() => {
                    setShowAllTracks(true);
                    setViewMode('detail');
                    setCurrentSetList(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.xs,
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                    backgroundColor: 'transparent',
                    color: designTokens.colors.text.primary,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.xxl,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Music size={16} />
                  View All
                </button>
              </div>
            )}
            {(activeTab === 'playlists' || activeTab === 'playlists') && viewMode === 'detail' && (
              <div style={{ display: 'flex', gap: designTokens.spacing.xs, alignItems: 'center' }}>
                {showAllTracks ? (
                  <h2 style={{
                    fontSize: designTokens.typography.fontSizes.h3,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    color: designTokens.colors.text.primary,
                    margin: 0,
                  }}>
                    All Tracks
                  </h2>
                ) : (userRole === 'admin' || userRole === 'owner') && isEditingTracks ? (
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
                        disabled={deletingTracks}
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
                          cursor: deletingTracks ? 'not-allowed' : 'pointer',
                          opacity: deletingTracks ? 0.6 : 1,
                        }}
                      >
                        <Trash2 size={14} />
                        {deletingTracks ? 'Deleting...' : `Delete (${selectedTrackIds.length})`}
                      </button>
                    )}
                  </>
                ) : (userRole === 'admin' || userRole === 'owner') && (
                  <>
                    <UploadButton
                      onUploadNew={() => setShowPlaylistUploader(true)}
                      onFromLibrary={() => setShowTrackSelector(true)}
                      label="Add"
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

          {/* Right: Header action buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            {/* Playlist menu button (detail view, band admin only) */}
            {(activeTab === 'playlists' || activeTab === 'playlists') && viewMode === 'detail' && (userRole === 'admin' || userRole === 'owner') && !isEditingTracks && !showAllTracks && (
              <DropdownMenu
                trigger={
                  <button
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
                }
                align="right"
              >
                {/* Share Playlist - TODO: Review external sharing permissions for bands */}
                <button
                  onClick={async () => {
                    if (!currentSetList) return;

                    const shareUrl = `coretet://playlist/${currentSetList.share_code}`;

                    // On native platforms, use native share sheet
                    if (Capacitor.isNativePlatform()) {
                      try {
                        const shareText = `Check out "${currentSetList.title}" on CoreTet\n\n${shareUrl}`;

                        await Share.share({
                          title: currentSetList.title,
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

                {/* Admin-only actions */}
                <button
                  onClick={() => {
                    setNewTitle(currentSetList?.title || '');
                    setEditingPlaylistTitle(currentSetList?.id || null);
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
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
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
              </DropdownMenu>
            )}

            {/* Settings button (always visible) */}
            <button
              onClick={() => setShowSettings(true)}
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
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
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
          currentBand={currentBand}
          userRole={userRole}
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
        onOpenBandSettings={() => setShowBandSettings(true)}
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

      {/* User Settings Modal */}
      {showSettings && currentUser && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentUser={currentUser}
          onShowIntro={() => {
            setShowSettings(false);
            setShowIntro(true);
          }}
          onSignOut={async () => {
            await auth.signOut();
            // Navigation handled by App.tsx auth listener
          }}
        />
      )}

      {/* Intro Modal */}
      <IntroModal
        isOpen={showIntro}
        onClose={() => setShowIntro(false)}
      />


    </div>
  );
}
