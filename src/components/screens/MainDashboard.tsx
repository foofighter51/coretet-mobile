import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Music, Upload, ArrowLeft, Play, Pause, X, Check, MessageSquare, MoreVertical, Edit2, Trash2, Headphones, ThumbsUp, Heart, HelpCircle, Settings, GripVertical, Users, Share2, ArrowUpDown, Calendar } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { DesktopSidebar } from '../layouts/DesktopSidebar';
import { DesktopSidebarWithTree } from '../layouts/DesktopSidebarWithTree';
import { DesktopThreeColumnLayout } from '../layouts/DesktopThreeColumnLayout';
import { TrackDetailPanel } from '../organisms/TrackDetailPanel';
import { WorkDetailView } from '../organisms/WorkDetailView';
import { useSetList } from '../../contexts/SetListContext';
import { useBand } from '../../contexts/BandContext';
import { TrackRowWithPlayer } from '../molecules/TrackRowWithPlayer';
import { TabBar } from '../molecules/TabBar';
import { AudioUploader } from '../molecules/AudioUploader';
import { PlaybackBar } from '../molecules/PlaybackBar';
import { SwipeableTrackRow } from '../molecules/SwipeableTrackRow';
import { AdaptiveTrackRow } from '../molecules/AdaptiveTrackRow';
import { Tutorial } from '../molecules/Tutorial';
import { BandModal } from '../molecules/BandModal';
import { BandSettings } from '../molecules/BandSettings';
import { SettingsModal } from '../molecules/SettingsModal';
import { RecycleBinModal } from '../molecules/RecycleBinModal';
import { IntroModal } from '../molecules/IntroModal';
import { EmptyState } from '../molecules/EmptyState';
import { TrackDetailModal } from '../molecules/TrackDetailModal';
import { InlineSpinner } from '../atoms/InlineSpinner';
import { TrackSkeleton } from '../atoms/TrackSkeleton';
import { SortButton } from '../molecules/SortButton';
import { FilterButton, RatingFilter } from '../molecules/FilterButton';
import { PlaylistHeader, SortField, SortDirection } from '../molecules/PlaylistHeader';
import { TrackListHeader } from '../molecules/TrackListHeader';
import { VersionType } from '../molecules/VersionTypeSelector';
import { DraggableTrack, PlaylistDropZone, DragTrackData, useDragState } from '../molecules/DraggableTrack';
import { UploadButton } from '../molecules/UploadButton';
import { DropdownMenu } from '../ui/DropdownMenu';
import { DialogModal } from '../ui/DialogModal';
import { Track, TabId } from '../../types';
import { db, auth } from '../../../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import DeepLinkService from '../../utils/deepLinkHandler';
import AudioUploadService from '../../utils/audioUploadService';

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

// Work Track Selector Modal - Enhanced version for adding tracks to works
// Shows warning for tracks already in other works
function WorkTrackSelectorModal({ tracks, existingTrackIds, works, targetWorkId, onAddTracks, onCancel }: {
  tracks: any[];
  existingTrackIds: string[];
  works: any[];
  targetWorkId: string;
  onAddTracks: (trackIds: string[]) => void;
  onCancel: () => void;
}) {
  const designTokens = useDesignTokens();
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Filter out tracks already in this work
  const availableTracks = tracks.filter(track => !existingTrackIds.includes(track.id));

  // Check if a track is in another work
  const getTrackWorkInfo = (track: any) => {
    if (!track.version_group_id || track.version_group_id === targetWorkId) {
      return null;
    }
    const work = works.find(w => w.id === track.version_group_id);
    return work?.name || 'another work';
  };

  const toggleTrack = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const selectedInOtherWorks = selectedTracks.filter(id => {
    const track = tracks.find(t => t.id === id);
    return track?.version_group_id && track.version_group_id !== targetWorkId;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {availableTracks.length === 0 ? (
        <p style={{
          fontSize: designTokens.typography.fontSizes.bodySmall,
          color: designTokens.colors.text.secondary,
          textAlign: 'center',
          padding: designTokens.spacing.xl,
        }}>
          All your tracks are already in this work
        </p>
      ) : (
        <>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: designTokens.spacing.md,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.sm,
            backgroundColor: designTokens.colors.surface.secondary,
          }}>
            {availableTracks.map(track => {
              const isSelected = selectedTracks.includes(track.id);
              const inWorkName = getTrackWorkInfo(track);
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
                    backgroundColor: isSelected ? designTokens.colors.surface.hover : designTokens.colors.surface.secondary,
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.sm,
                      marginTop: designTokens.spacing.xs,
                    }}>
                      {track.duration_seconds && (
                        <span style={{
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.text.secondary,
                        }}>
                          {Math.floor(track.duration_seconds / 60)}:{String(Math.floor(track.duration_seconds % 60)).padStart(2, '0')}
                        </span>
                      )}
                      {inWorkName && (
                        <span style={{
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.accent.coral,
                          backgroundColor: `${designTokens.colors.accent.coral}15`,
                          padding: `1px ${designTokens.spacing.xs}`,
                          borderRadius: designTokens.borderRadius.sm,
                        }}>
                          In: {inWorkName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedInOtherWorks.length > 0 && (
            <p style={{
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.accent.coral,
              margin: 0,
              marginBottom: designTokens.spacing.sm,
            }}>
              {selectedInOtherWorks.length} track{selectedInOtherWorks.length > 1 ? 's' : ''} will be moved from other works
            </p>
          )}

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
  const { isMobile, isDesktop } = useResponsive();
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
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  // Audio playback state - consolidated
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const currentTrackRef = useRef<any | null>(null); // Ref to track current track for event listeners
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [trackRatings, setTrackRatings] = useState<Record<string, 'listened' | 'liked' | 'loved'>>({});
  const [aggregatedRatings, setAggregatedRatings] = useState<Record<string, { listened: number; liked: number; loved: number }>>({});
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
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
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null); // Track being permanently deleted
  const [detailPanelTrack, setDetailPanelTrack] = useState<any | null>(null); // Track shown in desktop detail panel
  const [detailPanelComments, setDetailPanelComments] = useState<any[]>([]); // Comments for detail panel track

  // Works (song projects) state
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWork, setSelectedWork] = useState<any | null>(null);
  const [workVersions, setWorkVersions] = useState<any[]>([]); // Tracks in the selected work
  const [workComments, setWorkComments] = useState<any[]>([]); // Aggregated comments for the selected work
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [showCreateWork, setShowCreateWork] = useState(false);
  const [newWorkName, setNewWorkName] = useState('');
  const [createWorkLoading, setCreateWorkLoading] = useState(false);
  const createWorkInputRef = useRef<HTMLInputElement>(null);

  // Add tracks to work state
  const [showAddTracksToWork, setShowAddTracksToWork] = useState(false);
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [tracksToMove, setTracksToMove] = useState<{ id: string; title: string; currentWorkName: string }[]>([]);
  const [pendingTrackIds, setPendingTrackIds] = useState<string[]>([]); // Track IDs pending after move confirmation
  const [pendingWorkDrop, setPendingWorkDrop] = useState<{
    trackIds: string[];
    workId: string;
    workName: string;
  } | null>(null); // For drag-drop to Work operations

  // Work sorting state
  type WorkSortField = 'created_at' | 'name' | 'updated_at' | 'version_count';
  const [workSortBy, setWorkSortBy] = useState<WorkSortField>('created_at');
  const [workSortAscending, setWorkSortAscending] = useState(false); // Default DESC for dates (newest first)

  // Playlist list sorting state (for sorting the list of playlists, not tracks within a playlist)
  type PlaylistListSortField = 'created_at' | 'title' | 'track_count';
  const [playlistListSortBy, setPlaylistListSortBy] = useState<PlaylistListSortField>('created_at');
  const [playlistListSortAscending, setPlaylistListSortAscending] = useState(false); // Default DESC for dates

  // Sorted works based on user selection
  const sortedWorks = useMemo(() => {
    const sorted = [...works].sort((a, b) => {
      let comparison = 0;
      switch (workSortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'version_count':
          comparison = (a.version_count || 0) - (b.version_count || 0);
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at || a.created_at).getTime() -
                       new Date(b.updated_at || b.created_at).getTime();
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return workSortAscending ? comparison : -comparison;
    });
    return sorted;
  }, [works, workSortBy, workSortAscending]);

  // Version types state
  const [versionTypes, setVersionTypes] = useState<VersionType[]>([]);

  // Drag-drop state for tracks to playlists
  const isDraggingTrack = useDragState();

  // Calculate content width: full width minus sidebar, equal split with detail panel if shown
  const showDetailPanel = isDesktop && detailPanelTrack;
  const contentWidth = isDesktop
    ? showDetailPanel
      ? `calc((100vw - ${designTokens.layout.sidebar.width}) / 2)` // Equal width with detail panel
      : `calc(100vw - ${designTokens.layout.sidebar.width})`
    : '100%';

  const baseStyle: React.CSSProperties = {
    fontFamily: designTokens.typography.fontFamily,
    width: contentWidth,
    maxWidth: isMobile ? '425px' : undefined,
    minHeight: '100vh',
    height: '100vh',
    margin: '0 auto',
    marginLeft: isDesktop ? designTokens.layout.sidebar.width : undefined,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    backgroundColor: designTokens.colors.surface.tertiary,
    transition: 'width 0.2s ease',
  };

  // Playlist management state
  const [editingPlaylistTitle, setEditingPlaylistTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit tracks mode
  const [isEditingTracks, setIsEditingTracks] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null); // For shift-click range selection

  // Comment indicators
  const [trackCommentStatus, setTrackCommentStatus] = useState<Record<string, boolean>>({});
  const [trackUnreadStatus, setTrackUnreadStatus] = useState<Record<string, boolean>>({});
  const [trackCommentCounts, setTrackCommentCounts] = useState<Record<string, number>>({});

  // Track detail modal state
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<any | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);

  // Ref for iOS keyboard handling in edit playlist title
  const playlistTitleInputRef = useRef<HTMLInputElement>(null);
  // Ref for iOS keyboard handling in create playlist
  const createSetListInputRef = useRef<HTMLInputElement>(null);

  // Handle opening track detail - uses side panel on desktop, modal on mobile
  const handleOpenTrackDetail = async (track: any) => {
    if (scrollContainerRef.current) {
      savedScrollPosition.current = scrollContainerRef.current.scrollTop;
    }

    // On desktop, use the detail panel instead of modal
    if (isDesktop) {
      setDetailPanelTrack(track);
    } else {
      setSelectedTrackForDetail(track);
    }

    // Mark comments as viewed when opening
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

        // Fetch comment status and counts for playlist tracks
        const commentStatus = await db.comments.checkTracksHaveComments(trackIds);
        setTrackCommentStatus(commentStatus);
        const commentCounts = await db.comments.getTrackCommentCounts(trackIds);
        setTrackCommentCounts(prev => ({ ...prev, ...commentCounts }));

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
    setShowAllTracks(false); // Exit library view when selecting a set list
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

  // Handle tab changes - reset view mode when LEAVING playlists tab from detail view
  const handleTabChange = (newTab: TabId) => {
    // Only reset when navigating AWAY from playlists tab while in detail view
    // (not when staying on playlists tab, e.g., clicking a different playlist)
    if (viewMode === 'detail' && activeTab === 'playlists' && newTab !== 'playlists') {
      handleBackToList();
    }
    // Clear selection when switching tabs
    setSelectedTrackIds([]);
    setSelectionAnchorId(null);
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
        description: newDescription.trim() || null,
      });

      if (updateError) throw updateError;

      // Update current playlist
      setCurrentSetList({
        ...currentSetList,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
      });

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

  // Reset sort/filter settings when switching playlists
  useEffect(() => {
    // Reset to default sort/filter when playlist changes
    setRatingFilter('all');
    setPlaylistSortBy('position');
    setSortAscending(true);
  }, [currentSetList?.id]);

  // Reset work sorting when band changes
  useEffect(() => {
    setWorkSortBy('created_at');
    setWorkSortAscending(false); // Default DESC (newest first)
  }, [currentBand?.id]);

  // Fetch works (version groups) for the current band
  useEffect(() => {
    const fetchWorks = async () => {
      if (!currentBand?.id) {
        setWorks([]);
        return;
      }

      setLoadingWorks(true);
      try {
        // Fetch version groups for this band
        const { data, error } = await db.versionGroups.getByBand(currentBand.id);

        if (error) {
          console.error('Failed to fetch works:', error);
          return;
        }

        // Get track counts for each group
        const worksWithCounts = await Promise.all(
          (data || []).map(async (group: any) => {
            const { data: tracks } = await db.versionGroups.getTracksInGroup(group.id);
            return {
              id: group.id,
              name: group.name,
              hero_track_id: group.hero_track_id,
              created_at: group.created_at,
              version_count: tracks?.length || 0,
            };
          })
        );

        setWorks(worksWithCounts);
      } catch (error) {
        console.error('Error fetching works:', error);
      } finally {
        setLoadingWorks(false);
      }
    };

    fetchWorks();
  }, [currentBand?.id]);

  // Default to 'works' tab when works are loaded (Works-first navigation)
  const hasSetDefaultTab = useRef(false);
  useEffect(() => {
    // Only switch to works tab on initial load when user has works
    // and hasn't already interacted with the tabs
    if (!hasSetDefaultTab.current && !loadingWorks && works.length > 0) {
      setActiveTab('works');
      hasSetDefaultTab.current = true;
    }
  }, [works, loadingWorks]);

  // Reset default tab flag when band changes
  useEffect(() => {
    hasSetDefaultTab.current = false;
  }, [currentBand?.id]);

  // Load version types when band changes
  useEffect(() => {
    const loadVersionTypes = async () => {
      const { data, error } = await db.versionTypes.getAll(currentBand?.id);
      if (!error && data) {
        setVersionTypes(data);
      }
    };
    loadVersionTypes();
  }, [currentBand?.id]);

  // Load comments when a track is shown in the detail panel
  useEffect(() => {
    const fetchDetailPanelComments = async () => {
      if (!detailPanelTrack?.id) {
        setDetailPanelComments([]);
        return;
      }

      try {
        const { data, error } = await db.comments.getByTrack(detailPanelTrack.id);

        if (error) {
          console.error('Failed to fetch comments for detail panel:', error);
          return;
        }

        // Map comments with user names from the joined profiles
        const commentsWithNames = (data || []).map((comment: any) => ({
          id: comment.id,
          user_id: comment.user_id,
          user_name: comment.profiles?.name || 'Unknown User',
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          timestamp_seconds: comment.timestamp_seconds,
        }));

        setDetailPanelComments(commentsWithNames);
      } catch (error) {
        console.error('Error fetching detail panel comments:', error);
      }
    };

    fetchDetailPanelComments();
  }, [detailPanelTrack?.id]);

  // Load work versions when a work is selected
  const loadWorkVersions = async (workId: string) => {
    try {
      // Fetch all tracks in this version group
      const { data, error } = await db.versionGroups.getTracksInGroup(workId);

      if (error) {
        console.error('Failed to fetch work versions:', error);
        return;
      }

      // The tracks already have the right format from the database
      setWorkVersions(data || []);

      // Fetch ratings and comment counts for these tracks
      const trackIds = (data || []).map((t: any) => t.id);
      if (trackIds.length > 0) {
        await fetchAggregatedRatings(trackIds);
        const commentCounts = await db.comments.getTrackCommentCounts(trackIds);
        setTrackCommentCounts(prev => ({ ...prev, ...commentCounts }));
      }
    } catch (error) {
      console.error('Error loading work versions:', error);
    }
  };

  // Load comments for a work (aggregated from all tracks)
  const loadWorkComments = async (workId: string) => {
    try {
      const { data, error } = await db.comments.getByWork(workId);

      if (error) {
        console.error('Failed to fetch work comments:', error);
        return;
      }

      // Transform to comment format with track context
      const comments = (data || []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        user_name: c.profiles?.name || 'Unknown',
        avatar_url: c.profiles?.avatar_url,
        content: c.content,
        timestamp_seconds: c.timestamp_seconds,
        created_at: c.created_at,
        updated_at: c.updated_at,
        // Track context for feed display
        track_id: c.tracks?.id,
        track_title: c.tracks?.title,
        version_type: c.tracks?.version_type,
      }));

      setWorkComments(comments);
    } catch (error) {
      console.error('Error loading work comments:', error);
    }
  };

  // Handle work selection from sidebar
  const handleWorkSelect = async (work: any) => {
    setSelectedWork(work);
    setShowAllTracks(false); // Exit library view when selecting a work
    // Load versions and comments in parallel
    await Promise.all([
      loadWorkVersions(work.id),
      loadWorkComments(work.id),
    ]);
  };

  // Refresh works list
  const refreshWorks = async () => {
    if (!currentBand) return;
    try {
      const { data, error } = await db.versionGroups.getByBand(currentBand.id);
      if (error) {
        console.error('Failed to refresh works:', error);
        return;
      }
      const worksWithCounts = await Promise.all(
        (data || []).map(async (group: any) => {
          const { data: tracks } = await db.versionGroups.getTracksInGroup(group.id);
          return {
            id: group.id,
            name: group.name,
            hero_track_id: group.hero_track_id,
            created_at: group.created_at,
            version_count: tracks?.length || 0,
          };
        })
      );
      setWorks(worksWithCounts);
    } catch (error) {
      console.error('Error refreshing works:', error);
    }
  };

  // Create new work
  const handleCreateWork = async () => {
    if (!newWorkName.trim() || !currentUser || !currentBand) return;

    setCreateWorkLoading(true);
    try {
      const { data, error } = await db.versionGroups.createEmpty({
        name: newWorkName.trim(),
        band_id: currentBand.id,
        created_by: currentUser.id,
      });

      if (error) {
        console.error('Failed to create work:', error);
        setError(`Failed to create work: ${error.message}`);
        return;
      }

      // Refresh works list and select the new work
      await refreshWorks();
      if (data) {
        setSelectedWork({
          id: data.id,
          name: data.name,
          hero_track_id: data.hero_track_id,
          created_at: data.created_at,
          version_count: 0,
        });
        setWorkVersions([]);
        setActiveTab('works');
      }

      setShowCreateWork(false);
      setNewWorkName('');
    } catch (error) {
      console.error('Error creating work:', error);
    } finally {
      setCreateWorkLoading(false);
    }
  };

  // Rename a work
  const handleRenameWork = async (newName: string) => {
    if (!selectedWork) return;

    try {
      const { error } = await db.versionGroups.rename(selectedWork.id, newName);

      if (error) {
        console.error('Failed to rename work:', error);
        setError(`Failed to rename work: ${error.message}`);
        return;
      }

      // Update local state
      setSelectedWork({ ...selectedWork, name: newName });
      await refreshWorks();
    } catch (error) {
      console.error('Error renaming work:', error);
    }
  };

  // Delete a work (moves to recycle bin)
  const handleDeleteWork = async () => {
    if (!selectedWork || !currentUser) return;

    try {
      const { error } = await db.versionGroups.delete(selectedWork.id, currentUser.id);

      if (error) {
        console.error('Failed to delete work:', error);
        setError(`Failed to delete work: ${error.message}`);
        return;
      }

      // Clear selection and refresh
      setSelectedWork(null);
      setWorkVersions([]);
      await refreshWorks();
    } catch (error) {
      console.error('Error deleting work:', error);
    }
  };

  // Add existing tracks to a work
  const handleAddTracksToWork = async (trackIds: string[]) => {
    if (!selectedWork || trackIds.length === 0) return;

    // Check if any tracks are in other works
    const tracksInOtherWorks = trackIds
      .map(id => {
        const track = bandScopedTracks.find(t => t.id === id);
        if (track?.version_group_id && track.version_group_id !== selectedWork.id) {
          const otherWork = works.find(w => w.id === track.version_group_id);
          return {
            id: track.id,
            title: track.title,
            currentWorkName: otherWork?.name || 'another work'
          };
        }
        return null;
      })
      .filter(Boolean) as { id: string; title: string; currentWorkName: string }[];

    if (tracksInOtherWorks.length > 0) {
      // Show confirmation dialog
      setTracksToMove(tracksInOtherWorks);
      setPendingTrackIds(trackIds);
      setShowMoveConfirmation(true);
      setShowAddTracksToWork(false);
      return;
    }

    // No conflicts, proceed directly
    await executeAddTracksToWork(trackIds);
  };

  // Execute the actual add tracks operation
  const executeAddTracksToWork = async (trackIds: string[]) => {
    if (!selectedWork) return;

    try {
      const { error } = await db.versionGroups.addTracksToWork(selectedWork.id, trackIds);

      if (error) {
        console.error('Failed to add tracks to work:', error);
        setError(`Failed to add tracks: ${error.message}`);
        return;
      }

      // Refresh work versions
      await loadWorkVersions(selectedWork.id);
      await refreshWorks();

      // Close modals
      setShowAddTracksToWork(false);
      setShowMoveConfirmation(false);
      setTracksToMove([]);
      setPendingTrackIds([]);
    } catch (error) {
      console.error('Error adding tracks to work:', error);
    }
  };

  // Confirm moving tracks from other works
  const handleConfirmMoveTracksToWork = async () => {
    // Check if this is a drag-drop operation or a modal-based add
    if (pendingWorkDrop) {
      await executePendingWorkDrop();
    } else {
      await executeAddTracksToWork(pendingTrackIds);
    }
  };

  // Cancel the move operation
  const handleCancelMoveTracksToWork = () => {
    setShowMoveConfirmation(false);
    setTracksToMove([]);
    setPendingTrackIds([]);
    setPendingWorkDrop(null);
    setShowAddTracksToWork(true); // Re-open the track selector
  };

  // Handle dropping tracks onto a Work in the sidebar
  const handleTrackDropOnWork = async (trackData: DragTrackData, workId: string) => {
    // Get track IDs from drag data (single or multiple)
    const trackIds = trackData.trackIds && trackData.trackIds.length > 0
      ? trackData.trackIds
      : [trackData.trackId];

    const targetWork = works.find(w => w.id === workId);

    // Check if any tracks are already in OTHER works
    const tracksInOtherWorks = trackIds
      .map(id => bandScopedTracks.find(t => t.id === id))
      .filter(t => t && t.version_group_id && t.version_group_id !== workId);

    if (tracksInOtherWorks.length > 0) {
      // Store pending drop and show move confirmation dialog
      setPendingWorkDrop({
        trackIds,
        workId,
        workName: targetWork?.name || 'Work',
      });
      setTracksToMove(tracksInOtherWorks.map(t => ({
        id: t!.id,
        title: t!.title,
        currentWorkName: works.find(w => w.id === t!.version_group_id)?.name || 'Unknown Work'
      })));
      setShowMoveConfirmation(true);
      return;
    }

    // No conflicts - add tracks directly
    try {
      const { error } = await db.versionGroups.addTracksToWork(workId, trackIds);

      if (error) {
        console.error('Failed to add tracks to work:', error);
        setError(`Failed to add tracks: ${error.message}`);
        return;
      }

      // Clear selection after successful drop
      setSelectedTrackIds([]);
      setSelectionAnchorId(null);

      // Refresh data
      await refreshWorks();
      if (selectedWork?.id === workId) {
        await loadWorkVersions(workId);
      }

      // Show success feedback
      const count = trackIds.length;
      setError(`${count} track${count > 1 ? 's' : ''} added to "${targetWork?.name || 'work'}"`);
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error adding tracks to work:', error);
      setError('Failed to add tracks to work');
    }
  };

  // Execute pending work drop after move confirmation
  const executePendingWorkDrop = async () => {
    if (!pendingWorkDrop) return;

    try {
      const { error } = await db.versionGroups.addTracksToWork(pendingWorkDrop.workId, pendingWorkDrop.trackIds);

      if (error) {
        console.error('Failed to add tracks to work:', error);
        setError(`Failed to add tracks: ${error.message}`);
        return;
      }

      // Clear selection and pending state
      setSelectedTrackIds([]);
      setSelectionAnchorId(null);
      setShowMoveConfirmation(false);
      setTracksToMove([]);
      setPendingWorkDrop(null);

      // Refresh data
      await refreshWorks();
      if (selectedWork?.id === pendingWorkDrop.workId) {
        await loadWorkVersions(pendingWorkDrop.workId);
      }

      // Show success feedback
      const count = pendingWorkDrop.trackIds.length;
      setError(`${count} track${count > 1 ? 's' : ''} moved to "${pendingWorkDrop.workName}"`);
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error adding tracks to work:', error);
      setError('Failed to add tracks to work');
    }
  };

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

  // Handle version type change for a track
  const handleVersionTypeChange = async (trackId: string, versionType: string | null) => {
    console.log('🔄 handleVersionTypeChange called:', { trackId, versionType });
    try {
      // Optimistically update local state for immediate UI feedback
      setPlaylistTracks(prev => prev.map(item =>
        item.tracks?.id === trackId
          ? { ...item, tracks: { ...item.tracks, version_type: versionType } }
          : item
      ));
      // Update tracks state (bandScopedTracks is derived from this via useMemo)
      setTracks(prev => prev.map(track =>
        track.id === trackId
          ? { ...track, version_type: versionType }
          : track
      ));
      setWorkVersions(prev => prev.map(track =>
        track.id === trackId
          ? { ...track, version_type: versionType }
          : track
      ));

      console.log('📡 Calling db.tracks.updateVersionType...');
      const { data, error } = await db.tracks.updateVersionType(trackId, versionType);
      console.log('📡 db.tracks.updateVersionType result:', { data, error });
      if (error) {
        console.error('❌ Failed to update version type:', error);
        // Revert optimistic update on error - refresh from server
        if (currentSetList) {
          const { data } = await db.setListEntries.getBySetList(currentSetList.id);
          setPlaylistTracks(data || []);
        }
        if (currentBand?.id) {
          const { data } = await db.tracks.getByBand(currentBand.id);
          setTracks(data || []);
        }
        return;
      }
      console.log('✅ Version type updated successfully:', { trackId, versionType, data });
    } catch (error) {
      console.error('❌ Error updating version type:', error);
    }
  };

  // Handle updating track metadata (title, etc.) - band admins only
  const handleUpdateTrack = async (trackId: string, updates: {
    title?: string;
    version_notes?: string | null;
    composition_date?: string | null;
  }) => {
    try {
      // Optimistically update local state
      const updateFields = { ...updates };

      setTracks(prev => prev.map(track =>
        track.id === trackId ? { ...track, ...updateFields } : track
      ));
      setPlaylistTracks(prev => prev.map(item =>
        item.tracks?.id === trackId
          ? { ...item, tracks: { ...item.tracks, ...updateFields } }
          : item
      ));
      setWorkVersions(prev => prev.map(track =>
        track.id === trackId ? { ...track, ...updateFields } : track
      ));
      // Update detail panel track
      if (detailPanelTrack?.id === trackId) {
        setDetailPanelTrack({ ...detailPanelTrack, ...updateFields });
      }

      const { error } = await db.tracks.update(trackId, updates);
      if (error) {
        console.error('Failed to update track:', error);
        // Revert optimistic update on error - refresh from server
        if (currentBand?.id) {
          const { data } = await db.tracks.getByBand(currentBand.id);
          setTracks(data || []);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating track:', error);
      throw error;
    }
  };

  // Handle creating a new custom version type for the band
  const handleCreateVersionType = async (name: string) => {
    if (!currentBand?.id) return;
    try {
      const { data, error } = await db.versionTypes.create(currentBand.id, name);
      if (error) {
        // Handle duplicate key error gracefully - type already exists
        if (error.code === '23505') {
          console.log('Version type already exists, refreshing list...');
        } else {
          console.error('Failed to create version type:', error);
          return;
        }
      }
      // Refresh version types list (includes existing or newly created type)
      const { data: updated } = await db.versionTypes.getAll(currentBand.id);
      if (updated) {
        setVersionTypes(updated);
      }
    } catch (error) {
      console.error('Error creating version type:', error);
    }
  };

  // Handle dropping a track onto a playlist
  const handleTrackDropOnPlaylist = async (trackData: DragTrackData, playlistId: string) => {
    try {
      // Get current max position in playlist
      const { data: entries } = await db.setListEntries.getBySetList(playlistId);
      const maxPosition = entries?.reduce((max: number, entry: any) =>
        Math.max(max, entry.position || 0), 0) || 0;

      // Add track to playlist
      const { error } = await db.setListEntries.create({
        set_list_id: playlistId,
        track_id: trackData.trackId,
        position: maxPosition + 1,
      });

      if (error) {
        console.error('Failed to add track to playlist:', error);
        return;
      }

      // Refresh playlist tracks if this is the current playlist
      if (currentSetList?.id === playlistId) {
        const { data } = await db.setListEntries.getBySetList(playlistId);
        setPlaylistTracks(data || []);
      }

      // Show success feedback (optional - could add a toast notification)
      console.log(`Track "${trackData.trackTitle}" added to playlist`);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
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

  // Handle track selection with keyboard modifiers (shift-click, cmd/ctrl-click)
  const handleTrackSelect = useCallback((
    trackId: string,
    modifiers: { shift: boolean; meta: boolean },
    orderedTrackIds: string[]
  ) => {
    if (modifiers.shift && selectionAnchorId) {
      // Shift-click: Select range from anchor to clicked track
      const anchorIdx = orderedTrackIds.indexOf(selectionAnchorId);
      const clickIdx = orderedTrackIds.indexOf(trackId);

      if (anchorIdx !== -1 && clickIdx !== -1) {
        const start = Math.min(anchorIdx, clickIdx);
        const end = Math.max(anchorIdx, clickIdx);
        setSelectedTrackIds(orderedTrackIds.slice(start, end + 1));
      }
    } else if (modifiers.meta) {
      // Command/Ctrl-click: Toggle individual track
      setSelectedTrackIds(prev => {
        if (prev.includes(trackId)) {
          return prev.filter(id => id !== trackId);
        } else {
          // Set anchor when adding
          setSelectionAnchorId(trackId);
          return [...prev, trackId];
        }
      });
    } else {
      // Plain click with selection active - set single selection and anchor
      setSelectedTrackIds([trackId]);
      setSelectionAnchorId(trackId);
    }
  }, [selectionAnchorId]);

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

  // Permanently delete a track (removes from storage and database)
  const handlePermanentlyDeleteTrack = async (trackId: string) => {
    if (!currentBand?.id || deletingTrackId) return;

    setDeletingTrackId(trackId);

    try {
      // Call AudioUploadService to delete file from storage and database
      await AudioUploadService.deleteAudio(trackId);

      // Stop playback if current track was deleted
      if (currentTrack?.id === trackId && isPlaying) {
        handlePlayPause();
      }

      // Reload playlist tracks if we're viewing a playlist
      if (currentSetList) {
        await loadPlaylistTracks(currentSetList.id);
      }

      // Show success message
      setError('Track deleted successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error permanently deleting track:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete track');
    } finally {
      setDeletingTrackId(null);
    }
  };

  // Helper to check if track matches rating filter
  const trackMatchesRatingFilter = (trackId: string): boolean => {
    if (ratingFilter === 'all') return true;

    const myRating = trackRatings[trackId];
    const ratings = aggregatedRatings[trackId];

    switch (ratingFilter) {
      case 'liked_by_me':
        return myRating === 'liked';
      case 'liked_by_multiple':
        return ratings ? ratings.liked >= 2 : false;
      case 'loved_by_me':
        return myRating === 'loved';
      case 'loved_by_multiple':
        return ratings ? ratings.loved >= 2 : false;
      case 'unrated':
        return !myRating;
      default:
        return true;
    }
  };

  const filteredTracks = useMemo(() => {
    return bandScopedTracks
      .filter(track => trackMatchesRatingFilter(track.id))
      .map(track => ({
        ...track,
        isPlaying: track.id === currentTrack?.id && isPlaying
      }));
  }, [bandScopedTracks, currentTrack, isPlaying, ratingFilter, trackRatings, aggregatedRatings]);

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
      return trackMatchesRatingFilter(item.tracks.id);
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
  }, [playlistTracks, showAllTracks, bandScopedTracks, ratingFilter, trackRatings, aggregatedRatings, playlistSortBy, sortAscending]);

  // Check if current playlist is owned by the user (moved to component level)
  const isPlaylistOwner = currentSetList ? filteredCreatedPlaylists.some(p => p.id === currentSetList.id) : false;

  // Select correct playlists based on active tab (moved outside renderContent for sidebar access)
  const currentCreatedPlaylists = activeTab === 'playlists' ? bandCreatedPlaylists :
                                   activeTab === 'playlists' ? personalCreatedPlaylists :
                                   filteredCreatedPlaylists;
  const currentFollowedPlaylists = activeTab === 'playlists' ? personalFollowedPlaylists : [];

  // Sort the playlist list based on user selection
  const sortedPlaylists = useMemo(() => {
    const playlists = [...currentCreatedPlaylists];
    return playlists.sort((a, b) => {
      let comparison = 0;
      switch (playlistListSortBy) {
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'track_count':
          const countA = a.set_list_entries?.[0]?.count ?? 0;
          const countB = b.set_list_entries?.[0]?.count ?? 0;
          comparison = countA - countB;
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return playlistListSortAscending ? comparison : -comparison;
    });
  }, [currentCreatedPlaylists, playlistListSortBy, playlistListSortAscending]);

  const displayedPlaylists = sortedPlaylists;

  const renderContent = () => {

    switch (activeTab) {
      case 'playlists':
      
        return (
          <div style={{
            padding: designTokens.spacing.md,
          }}>

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
                      <label
                        style={{
                          display: 'block',
                          marginBottom: designTokens.spacing.xs,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          fontWeight: designTokens.typography.fontWeights.medium,
                          color: designTokens.colors.text.secondary,
                        }}
                      >
                        Title
                      </label>
                      <input
                        ref={playlistTitleInputRef}
                        type="text"
                        value={newTitle}
                        onChange={(e) => {
                          setNewTitle(e.target.value);
                          setError(null);
                        }}
                        placeholder="Set list title..."
                        style={{
                          width: '100%',
                          padding: designTokens.spacing.md,
                          border: `1px solid ${error ? designTokens.colors.system.error : designTokens.colors.borders.default}`,
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.body,
                          marginBottom: designTokens.spacing.md,
                          boxSizing: 'border-box',
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTitle.trim()) {
                            handleEditPlaylistTitle();
                          }
                        }}
                      />

                      <label
                        style={{
                          display: 'block',
                          marginBottom: designTokens.spacing.xs,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          fontWeight: designTokens.typography.fontWeights.medium,
                          color: designTokens.colors.text.secondary,
                        }}
                      >
                        Description (optional)
                      </label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Add notes about this set list..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: designTokens.spacing.md,
                          border: `1px solid ${designTokens.colors.borders.default}`,
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSizes.body,
                          marginBottom: error ? designTokens.spacing.sm : 0,
                          boxSizing: 'border-box',
                          resize: 'vertical',
                          fontFamily: 'inherit',
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
                  <div style={{ width: '100%', overflow: 'hidden' }}>
                    {/* Playlist Header with Sort/Filter (visible on all screen sizes) */}
                    {!isReordering && (
                      <PlaylistHeader
                        sortBy={playlistSortBy as SortField}
                        sortDirection={sortAscending ? 'asc' : 'desc'}
                        ratingFilter={ratingFilter}
                        onSortChange={(field, direction) => {
                          setPlaylistSortBy(field as 'position' | 'name' | 'duration' | 'rating');
                          setSortAscending(direction === 'asc');
                        }}
                        onRatingFilterChange={setRatingFilter}
                        trackCount={showAllTracks ? bandScopedTracks.length : playlistTracks.length}
                      />
                    )}

                    {/* Column Headers (desktop only) */}
                    {isDesktop && !isReordering && <TrackListHeader />}

                    {/* Selection Indicator Bar */}
                    {selectedTrackIds.length > 0 && !isReordering && !isEditingTracks && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                          backgroundColor: `${designTokens.colors.primary.blue}10`,
                          borderBottom: `1px solid ${designTokens.colors.primary.blue}30`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            color: designTokens.colors.primary.blue,
                            fontWeight: designTokens.typography.fontWeights.medium,
                          }}
                        >
                          {selectedTrackIds.length} track{selectedTrackIds.length !== 1 ? 's' : ''} selected
                        </span>
                        <button
                          onClick={() => {
                            setSelectedTrackIds([]);
                            setSelectionAnchorId(null);
                          }}
                          style={{
                            padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                            backgroundColor: 'transparent',
                            color: designTokens.colors.primary.blue,
                            border: `1px solid ${designTokens.colors.primary.blue}`,
                            borderRadius: designTokens.borderRadius.sm,
                            fontSize: designTokens.typography.fontSizes.caption,
                            fontWeight: designTokens.typography.fontWeights.medium,
                            cursor: 'pointer',
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    )}

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
                            width: '100%',
                            minWidth: 0,
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
                          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', pointerEvents: isReordering ? 'none' : 'auto' }}>
                            <DraggableTrack
                              trackData={{
                                trackId: item.tracks.id,
                                trackTitle: item.tracks.title,
                                sourceType: 'playlist',
                                sourceId: currentSetList?.id,
                              }}
                              enabled={!isReordering && !isEditingTracks}
                              isSelected={selectedTrackIds.includes(item.tracks.id)}
                              selectedTrackIds={selectedTrackIds}
                            >
                              <AdaptiveTrackRow
                                track={{
                                  id: item.tracks.id,
                                  title: item.tracks.title,
                                  duration_seconds: item.tracks.duration_seconds,
                                  folder_path: item.tracks.folder_path,
                                  version_type: item.tracks.version_type,
                                }}
                                isPlaying={currentTrack?.id === item.tracks.id && isPlaying}
                                currentRating={trackRatings[item.tracks.id]}
                                aggregatedRatings={aggregatedRatings[item.tracks.id]}
                                hasComments={trackCommentStatus[item.tracks.id]}
                                hasUnreadComments={trackUnreadStatus[item.tracks.id]}
                                commentCount={trackCommentCounts[item.tracks.id]}
                                versionTypes={versionTypes}
                                onPlayPause={() => handlePlayPause(item.tracks)}
                                onRate={(rating) => handleRate(item.tracks.id, rating)}
                                onOpenDetails={() => handleOpenTrackDetail(item.tracks)}
                                onDelete={() => handlePermanentlyDeleteTrack(item.tracks.id)}
                                isDeleting={deletingTrackId === item.tracks.id}
                                onVersionTypeChange={(type) => handleVersionTypeChange(item.tracks.id, type)}
                                onCreateVersionType={handleCreateVersionType}
                                isSelected={selectedTrackIds.includes(item.tracks.id)}
                                onSelect={(trackId, modifiers) => {
                                  // Get ordered track IDs from visible tracks
                                  const orderedTrackIds = filteredPlaylistTracks
                                    .filter((t: any) => t.tracks)
                                    .map((t: any) => t.tracks.id);
                                  handleTrackSelect(trackId, modifiers, orderedTrackIds);
                                }}
                              />
                            </DraggableTrack>
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
              <>
                {/* Set Lists Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: designTokens.spacing.md,
                }}>
                  <h2 style={{
                    fontSize: designTokens.typography.fontSizes.h2,
                    fontWeight: designTokens.typography.fontWeights.bold,
                    color: designTokens.colors.text.primary,
                    margin: 0,
                  }}>
                    Set Lists
                  </h2>

                  {/* Sort Dropdown */}
                  <DropdownMenu
                    trigger={
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: designTokens.spacing.xs,
                          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                          backgroundColor: 'transparent',
                          border: `1px solid ${designTokens.colors.borders.default}`,
                          borderRadius: designTokens.borderRadius.sm,
                          color: designTokens.colors.text.secondary,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: 'pointer',
                        }}
                      >
                        <ArrowUpDown size={14} />
                        {playlistListSortBy === 'created_at' ? 'Date' :
                         playlistListSortBy === 'title' ? 'Name' : 'Tracks'}
                        <span style={{ fontSize: '10px' }}>{playlistListSortAscending ? '↑' : '↓'}</span>
                      </button>
                    }
                    align="right"
                  >
                    {[
                      { field: 'created_at' as const, label: 'Date Created' },
                      { field: 'title' as const, label: 'Name' },
                      { field: 'track_count' as const, label: 'Track Count' },
                    ].map((option) => (
                      <button
                        key={option.field}
                        onClick={() => {
                          if (option.field === playlistListSortBy) {
                            setPlaylistListSortAscending(!playlistListSortAscending);
                          } else {
                            setPlaylistListSortBy(option.field);
                            // Default direction: ASC for name, DESC for dates/counts
                            setPlaylistListSortAscending(option.field === 'title');
                          }
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                          backgroundColor: playlistListSortBy === option.field
                            ? designTokens.colors.surface.active
                            : 'transparent',
                          border: 'none',
                          color: designTokens.colors.text.primary,
                          fontSize: designTokens.typography.fontSizes.bodySmall,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span>{option.label}</span>
                        {playlistListSortBy === option.field && (
                          <span style={{ color: designTokens.colors.primary.blue }}>
                            {playlistListSortAscending ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ))}
                  </DropdownMenu>
                </div>
                <p style={{
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.text.secondary,
                  marginBottom: designTokens.spacing.lg,
                }}>
                  Organize tracks for performances, rehearsals, or listening sessions.
                </p>

                {/* Set Lists List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
                  {displayedPlaylists.map((playlist) => (
                    <PlaylistDropZone
                      key={playlist.id}
                      playlistId={playlist.id}
                      playlistName={playlist.title}
                      onTrackDrop={handleTrackDropOnPlaylist}
                      active={isDraggingTrack}
                    >
                      <div
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
                    </PlaylistDropZone>
                  ))}
                </div>
              </>
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

      case 'works':
        // If a work is selected, show the work detail view
        if (selectedWork) {
          return (
            <WorkDetailView
              work={selectedWork}
              versions={workVersions}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onPlayTrack={(track) => handlePlayPause(track)}
              onSetHero={async (trackId) => {
                // Update hero track for this work
                try {
                  await db.versionGroups.setHero(selectedWork.id, trackId);

                  // Refresh the work
                  setSelectedWork({ ...selectedWork, hero_track_id: trackId });
                  await loadWorkVersions(selectedWork.id);
                } catch (error) {
                  console.error('Error setting hero track:', error);
                }
              }}
              onAddVersion={() => setShowUploader(true)}
              onAddExistingTracks={() => setShowAddTracksToWork(true)}
              onTrackClick={(track) => handleOpenTrackDetail(track)}
              onRename={handleRenameWork}
              onUpdateDescription={async (description) => {
                try {
                  await db.versionGroups.update(selectedWork.id, { description });
                  setSelectedWork({ ...selectedWork, description });
                  // Refresh the works list
                  await refreshWorks();
                } catch (error) {
                  console.error('Error updating work description:', error);
                }
              }}
              onDelete={handleDeleteWork}
              onBack={() => setSelectedWork(null)}
              canEdit={userRole === 'admin' || userRole === 'owner'}
              versionTypes={versionTypes}
              onVersionTypeChange={handleVersionTypeChange}
              onCreateVersionType={handleCreateVersionType}
              trackRatings={trackRatings}
              trackAggregatedRatings={aggregatedRatings}
              trackCommentCounts={trackCommentCounts}
              // Comments feed props
              comments={workComments.map(c => ({
                id: c.id,
                user_id: c.user_id,
                user_name: c.user_name,
                avatar_url: c.avatar_url,
                content: c.content,
                timestamp_seconds: c.timestamp_seconds,
                created_at: c.created_at,
                track_id: c.track_id,
                track_title: c.track_title,
                version_type: c.version_type,
              }))}
              currentUserId={currentUser?.id}
              showComments={true}
              onAddComment={async (content, timestampSeconds) => {
                // Add comment to hero track or first available track
                const targetTrackId = selectedWork?.hero_track_id || workVersions[0]?.id;
                if (!targetTrackId || !currentUser?.id) return;

                try {
                  await db.comments.create({
                    track_id: targetTrackId,
                    user_id: currentUser.id,
                    content,
                    timestamp_seconds: timestampSeconds,
                  });

                  // Refresh work comments
                  await loadWorkComments(selectedWork.id);
                } catch (error) {
                  console.error('Failed to add comment:', error);
                }
              }}
              onCommentTrackSelect={(trackId, timestamp) => {
                // Find the track in work versions
                const track = workVersions.find(v => v.id === trackId);
                if (!track) return;

                // Start playing the track
                handlePlayPause(track);

                // Seek to timestamp after a brief delay to let audio load
                setTimeout(() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = timestamp;
                  }
                }, 150);
              }}
              // Sharing props
              shareCode={selectedWork?.share_code}
              isPublic={selectedWork?.is_public ?? false}
              onTogglePublic={async (isPublic) => {
                if (!selectedWork) return;
                try {
                  const { error } = await db.versionGroups.togglePublic(selectedWork.id, isPublic);
                  if (!error) {
                    setSelectedWork({ ...selectedWork, is_public: isPublic });
                    // Refresh the works list to update any share indicators
                    await refreshWorks();
                  }
                } catch (error) {
                  console.error('Error toggling public:', error);
                }
              }}
            />
          );
        }

        // Otherwise show list of works
        return (
          <div style={{
            padding: designTokens.spacing.md,
            paddingBottom: '100px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: designTokens.spacing.md,
            }}>
              <h2 style={{
                fontSize: designTokens.typography.fontSizes.h2,
                fontWeight: designTokens.typography.fontWeights.bold,
                color: designTokens.colors.text.primary,
                margin: 0,
              }}>
                Works
              </h2>

              {/* Sort Dropdown */}
              {works.length > 0 && (
                <DropdownMenu
                  trigger={
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.xs,
                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                        backgroundColor: 'transparent',
                        border: `1px solid ${designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.sm,
                        color: designTokens.colors.text.secondary,
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        cursor: 'pointer',
                      }}
                    >
                      <ArrowUpDown size={14} />
                      {workSortBy === 'created_at' ? 'Date' :
                       workSortBy === 'name' ? 'Name' :
                       workSortBy === 'updated_at' ? 'Updated' : 'Versions'}
                      <span style={{ fontSize: '10px' }}>{workSortAscending ? '↑' : '↓'}</span>
                    </button>
                  }
                  align="right"
                >
                  {[
                    { field: 'created_at' as const, label: 'Date Created' },
                    { field: 'name' as const, label: 'Name' },
                    { field: 'updated_at' as const, label: 'Last Updated' },
                    { field: 'version_count' as const, label: 'Versions' },
                  ].map((option) => (
                    <button
                      key={option.field}
                      onClick={() => {
                        if (option.field === workSortBy) {
                          setWorkSortAscending(!workSortAscending);
                        } else {
                          setWorkSortBy(option.field);
                          // Default direction: ASC for name, DESC for dates/counts
                          setWorkSortAscending(option.field === 'name');
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                        backgroundColor: workSortBy === option.field
                          ? designTokens.colors.surface.active
                          : 'transparent',
                        border: 'none',
                        color: designTokens.colors.text.primary,
                        fontSize: designTokens.typography.fontSizes.bodySmall,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{option.label}</span>
                      {workSortBy === option.field && (
                        <span style={{ color: designTokens.colors.primary.blue }}>
                          {workSortAscending ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </DropdownMenu>
              )}
            </div>
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.lg,
            }}>
              Your songs organized by project. Each work contains all versions of a song.
            </p>

            {loadingWorks ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: designTokens.spacing.xl }}>
                <InlineSpinner size={24} />
              </div>
            ) : sortedWorks.length === 0 ? (
              <EmptyState
                icon={Music}
                title="No works yet"
                description="Group your track versions into works to organize different iterations of each song."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
                {sortedWorks.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => handleWorkSelect(work)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: designTokens.spacing.md,
                      backgroundColor: designTokens.colors.surface.primary,
                      border: `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.md,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div>
                      <h3 style={{
                        fontSize: designTokens.typography.fontSizes.body,
                        fontWeight: designTokens.typography.fontWeights.semibold,
                        color: designTokens.colors.text.primary,
                        margin: 0,
                      }}>
                        {work.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.md,
                        marginTop: designTokens.spacing.xs,
                      }}>
                        <span style={{
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.text.muted,
                        }}>
                          {work.version_count} {work.version_count === 1 ? 'version' : 'versions'}
                        </span>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.text.muted,
                        }}>
                          <Calendar size={10} />
                          {new Date(work.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <Music size={20} color={designTokens.colors.text.muted} />
                  </button>
                ))}
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
      {/* Desktop Sidebar with tree navigation - only shown on desktop */}
      {isDesktop && (
        <DesktopSidebarWithTree
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSettingsClick={() => setShowSettings(true)}
          onUploadClick={() => setShowUploader(true)}
          onRecycleBinClick={() => setShowRecycleBin(true)}
          onSignOut={async () => {
            await auth.signOut();
          }}
          bandName={currentBand?.name}
          userName={currentUser?.name}
          showLibrary={showAllTracks}
          onLibraryClick={() => {
            setShowAllTracks(true);
            setViewMode('detail');
            setCurrentSetList(null);
            setSelectedWork(null);
            handleTabChange('playlists');
          }}
          setLists={displayedPlaylists.map(p => ({
            id: p.id,
            title: p.title,
            track_count: p.track_count,
          }))}
          selectedSetListId={currentSetList?.id}
          onSetListSelect={(setList) => {
            const fullPlaylist = displayedPlaylists.find(p => p.id === setList.id);
            if (fullPlaylist) {
              handlePlaylistClick(fullPlaylist);
            }
          }}
          onCreateSetList={() => setShowCreatePlaylist(true)}
          works={works.map(w => ({
            id: w.id,
            name: w.name,
            version_count: w.version_count,
            hero_track_id: w.hero_track_id,
          }))}
          selectedWorkId={selectedWork?.id}
          onWorkSelect={handleWorkSelect}
          onCreateWork={() => setShowCreateWork(true)}
          onTrackDropOnWork={handleTrackDropOnWork}
        />
      )}

      {/* Fixed Header - hidden on desktop since sidebar provides navigation */}
      {!isDesktop && (
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
                  <>
                    <h2 style={{
                      fontSize: designTokens.typography.fontSizes.h3,
                      fontWeight: designTokens.typography.fontWeights.semibold,
                      color: designTokens.colors.text.primary,
                      margin: 0,
                    }}>
                      All Tracks
                    </h2>
                    <SortButton
                      currentSort={playlistSortBy}
                      sortAscending={sortAscending}
                      onSort={handleSortChange}
                      showReorder={false}
                    />
                    <FilterButton
                      activeFilter={ratingFilter}
                      onFilterChange={setRatingFilter}
                    />
                  </>
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
                    setNewDescription(currentSetList?.description || '');
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
      )}

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
          // Desktop: no TabBar, just PlaybackBar space. Mobile: TabBar + PlaybackBar
          paddingBottom: isDesktop
            ? (currentTrack ? '100px' : '24px')
            : (currentTrack ? '164px' : '84px'),
          WebkitOverflowScrolling: 'touch' as const,
        }}
      >
        {renderContent()}
      </div>

      {/* Fixed Footer - PlaybackBar (only show when track is selected) */}
      {currentTrack && (
        <div style={{
          position: 'fixed',
          bottom: isDesktop ? '0px' : '68px', // Desktop: at bottom. Mobile: above TabBar (60px) + gap (8px)
          left: isDesktop ? designTokens.layout.sidebar.width : 0, // Desktop: offset by sidebar
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
            onTrackTitleClick={() => {
              if (isDesktop) {
                // On desktop, open the detail panel
                setDetailPanelTrack(currentTrack);
              } else {
                // On mobile, open the track detail modal
                handleOpenTrackDetail(currentTrack);
              }
            }}
          />
        </div>
      )}

      {/* Mobile Tab Bar - only shown on mobile */}
      {!isDesktop && (
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* Desktop Detail Panel - fixed on the right, equal width to track list */}
      {isDesktop && detailPanelTrack && (
        <aside
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: `calc((100vw - ${designTokens.layout.sidebar.width}) / 2)`, // Equal width to track list
            height: '100vh',
            backgroundColor: designTokens.colors.surface.secondary,
            borderLeft: `1px solid ${designTokens.colors.borders.default}`,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TrackDetailPanel
            track={{
              id: detailPanelTrack.id,
              title: detailPanelTrack.title,
              file_url: detailPanelTrack.file_url,
              duration_seconds: detailPanelTrack.duration_seconds,
              folder_path: detailPanelTrack.folder_path,
              created_at: detailPanelTrack.created_at,
              uploaded_by: detailPanelTrack.uploaded_by_name || detailPanelTrack.uploaded_by,
              version_notes: detailPanelTrack.version_notes,
              composition_date: detailPanelTrack.composition_date,
            }}
            bandId={currentBand?.id}
            userId={currentUser?.id}
            audioRef={currentTrack?.id === detailPanelTrack.id ? audioRef : undefined}
            isPlaying={currentTrack?.id === detailPanelTrack.id && isPlaying}
            currentRating={trackRatings[detailPanelTrack.id]}
            aggregatedRatings={aggregatedRatings[detailPanelTrack.id]}
            comments={detailPanelComments}
            onPlayPause={() => handlePlayPause(detailPanelTrack)}
            onRate={(rating) => handleRate(detailPanelTrack.id, rating)}
            onClose={() => setDetailPanelTrack(null)}
            onSeek={(time) => {
              // Start playing the track if not already the current track
              if (currentTrack?.id !== detailPanelTrack.id) {
                handlePlayPause(detailPanelTrack);
              }
              // Seek to the specified time
              if (audioRef.current) {
                audioRef.current.currentTime = time;
              }
            }}
            timestampedComments={detailPanelComments
              .filter(c => c.timestamp_seconds !== undefined && c.timestamp_seconds !== null)
              .map(c => ({
                id: c.id,
                timestamp_seconds: c.timestamp_seconds!,
                user_name: c.user_name,
                content: c.content,
                created_at: c.created_at,
              }))}
            onAddComment={async (content, timestampSeconds) => {
              if (!currentUser?.id) return;
              try {
                await db.comments.create({
                  track_id: detailPanelTrack.id,
                  user_id: currentUser.id,
                  content,
                  timestamp_seconds: timestampSeconds,
                });
                // Refresh comments
                const { data: newComments } = await db.comments.getByTrack(detailPanelTrack.id);
                if (newComments) {
                  const commentsWithNames = await Promise.all(
                    newComments.map(async (comment: any) => {
                      const { data: profile } = await db.profiles.getById(comment.user_id);
                      return {
                        id: comment.id,
                        user_id: comment.user_id,
                        user_name: profile?.name || 'Unknown User',
                        content: comment.content,
                        created_at: comment.created_at,
                        updated_at: comment.updated_at,
                        timestamp_seconds: comment.timestamp_seconds,
                      };
                    })
                  );
                  setDetailPanelComments(commentsWithNames);
                }
                // Update comment status
                setTrackCommentStatus(prev => ({ ...prev, [detailPanelTrack.id]: true }));
              } catch (error) {
                console.error('Failed to add comment:', error);
              }
            }}
            canEdit={userRole === 'admin' || userRole === 'owner'}
            onUpdateTrack={handleUpdateTrack}
            currentUserId={currentUser?.id}
            onUpdateComment={async (commentId, content) => {
              try {
                const { error } = await db.comments.update(commentId, content);
                if (error) throw error;
                // Update comment in local state
                setDetailPanelComments(prev =>
                  prev.map(c =>
                    c.id === commentId
                      ? { ...c, content, updated_at: new Date().toISOString() }
                      : c
                  )
                );
              } catch (error) {
                console.error('Failed to update comment:', error);
                throw error;
              }
            }}
            onDeleteComment={async (commentId) => {
              try {
                const { error } = await db.comments.delete(commentId);
                if (error) throw error;
                // Remove comment from local state
                setDetailPanelComments(prev => prev.filter(c => c.id !== commentId));
              } catch (error) {
                console.error('Failed to delete comment:', error);
                throw error;
              }
            }}
          />
        </aside>
      )}

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

      {/* Recycle Bin Modal */}
      {showRecycleBin && currentBand && (
        <RecycleBinModal
          isOpen={showRecycleBin}
          onClose={() => setShowRecycleBin(false)}
          bandId={currentBand.id}
          onItemRestored={() => {
            // Refresh works and tracks after restore
            refreshWorks();
          }}
        />
      )}

      {/* Add Tracks to Work Modal */}
      {showAddTracksToWork && selectedWork && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddTracksToWork(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: designTokens.colors.surface.primary,
              borderRadius: designTokens.borderRadius.lg,
              padding: designTokens.spacing.lg,
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designTokens.spacing.md }}>
              <h2 style={{ margin: 0, fontSize: designTokens.typography.fontSizes.h3, color: designTokens.colors.text.primary }}>
                Add Tracks to "{selectedWork.name}"
              </h2>
              <button
                onClick={() => setShowAddTracksToWork(false)}
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
            <WorkTrackSelectorModal
              tracks={bandScopedTracks}
              existingTrackIds={workVersions.map(v => v.id)}
              works={works}
              targetWorkId={selectedWork.id}
              onAddTracks={handleAddTracksToWork}
              onCancel={() => setShowAddTracksToWork(false)}
            />
          </div>
        </div>
      )}

      {/* Move Tracks Confirmation Dialog */}
      {showMoveConfirmation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={handleCancelMoveTracksToWork}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: designTokens.colors.surface.primary,
              borderRadius: designTokens.borderRadius.lg,
              padding: designTokens.spacing.xl,
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <h3 style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              margin: 0,
              marginBottom: designTokens.spacing.md,
            }}>
              Move Tracks?
            </h3>
            <p style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.text.secondary,
              margin: 0,
              marginBottom: designTokens.spacing.md,
            }}>
              The following tracks are already in other Works:
            </p>
            <ul style={{
              margin: 0,
              marginBottom: designTokens.spacing.md,
              paddingLeft: designTokens.spacing.lg,
              color: designTokens.colors.text.primary,
              fontSize: designTokens.typography.fontSizes.bodySmall,
            }}>
              {tracksToMove.map(track => (
                <li key={track.id} style={{ marginBottom: designTokens.spacing.xs }}>
                  <strong>{track.title}</strong> is in "{track.currentWorkName}"
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.muted,
              margin: 0,
              marginBottom: designTokens.spacing.lg,
            }}>
              Moving them will remove them from their current Works.
            </p>
            <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelMoveTracksToWork}
                style={{
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.sm,
                  color: designTokens.colors.text.secondary,
                  fontSize: designTokens.typography.fontSizes.body,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMoveTracksToWork}
                style={{
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: designTokens.colors.primary.blue,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.sm,
                  color: designTokens.colors.neutral.white,
                  fontSize: designTokens.typography.fontSizes.body,
                  cursor: 'pointer',
                }}
              >
                Move Tracks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intro Modal */}
      <IntroModal
        isOpen={showIntro}
        onClose={() => setShowIntro(false)}
      />

      {/* Create Set List Dialog - globally accessible */}
      {showCreatePlaylist && (
        <DialogModal
          isOpen={true}
          onClose={() => {
            setShowCreatePlaylist(false);
            setNewPlaylistTitle('');
            setError(null);
          }}
          title="Create New Set List"
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
              placeholder="Set list title..."
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

      {/* Create Work Dialog - globally accessible */}
      {showCreateWork && (
        <DialogModal
          isOpen={true}
          onClose={() => {
            setShowCreateWork(false);
            setNewWorkName('');
            setError(null);
          }}
          title="Create New Work"
          size="sm"
          hasKeyboardInput={true}
          keyboardInputRef={createWorkInputRef}
          footer={
            <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateWork(false);
                  setNewWorkName('');
                  setError(null);
                }}
                disabled={createWorkLoading}
                style={{
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.sm,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  cursor: createWorkLoading ? 'not-allowed' : 'pointer',
                  opacity: createWorkLoading ? 0.6 : 1,
                  color: designTokens.colors.text.secondary,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWork}
                disabled={createWorkLoading || !newWorkName.trim()}
                style={{
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: designTokens.colors.primary.blue,
                  color: designTokens.colors.text.inverse,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.sm,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  cursor: createWorkLoading || !newWorkName.trim() ? 'not-allowed' : 'pointer',
                  opacity: createWorkLoading || !newWorkName.trim() ? 0.6 : 1,
                }}
              >
                {createWorkLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          }
        >
          <div>
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              margin: 0,
              marginBottom: designTokens.spacing.md,
            }}>
              A work represents a song project containing all its versions (demos, recordings, mixes, etc.)
            </p>
            <input
              ref={createWorkInputRef}
              type="text"
              placeholder="Song name (e.g., 'Starlight', 'New Song #1')"
              value={newWorkName}
              onChange={(e) => {
                setNewWorkName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !createWorkLoading && newWorkName.trim()) {
                  handleCreateWork();
                }
              }}
              disabled={createWorkLoading}
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

    </div>
  );
}
