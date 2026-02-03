import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Star, Clock, Calendar, User, ChevronRight, Plus, MoreVertical, Pencil, Trash2, ArrowLeft, MessageSquare, Send, Tag, ThumbsUp, Heart, MessageCircle, ListPlus } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { WaveformVisualizer, TimestampedComment } from '../molecules/WaveformVisualizer';
import { TimestampedCommentList } from '../molecules/TimestampedCommentList';
import { RatingSummary, RatingValue, CollaboratorRatings, CumulativeRatings } from '../molecules/RatingSummary';
import { VersionTypeSelector, VersionType } from '../molecules/VersionTypeSelector';
import { TrackListHeader, getTrackGridTemplate } from '../molecules/TrackListHeader';
import { WaveformData } from '../../utils/waveformGenerator';
import { useIsDesktop } from '../../hooks/useResponsive';
import { VersionTimeline } from './VersionTimeline';
import { TimelineTrackVersion } from '../molecules/VersionTimelineCard';

interface TrackVersion {
  id: string;
  title: string;
  file_url: string;
  duration_seconds?: number;
  created_at: string;
  created_by?: string;
  uploader_name?: string;
  is_hero?: boolean;
  folder_path?: string;
  version_type?: string | null;
}

interface WorkDetailViewProps {
  work: {
    id: string;
    name: string;
    description?: string | null;
    hero_track_id?: string | null;
    created_at: string;
  };
  versions: TrackVersion[];
  currentTrackId?: string | null;
  isPlaying?: boolean;
  onPlayTrack: (track: TrackVersion) => void;
  onSetHero?: (trackId: string) => void;
  onAddVersion?: () => void;
  /** Called when user wants to add existing tracks from library */
  onAddExistingTracks?: () => void;
  onTrackClick?: (track: TrackVersion) => void;
  onRename?: (newName: string) => void;
  onUpdateDescription?: (description: string | null) => void;
  onDelete?: () => void;
  onBack?: () => void;
  /** Whether the current user can edit Work metadata (band admins only) */
  canEdit?: boolean;
  // New props for enhanced Work experience
  /** Current playback time in seconds */
  currentTime?: number;
  /** Comments on this Work */
  comments?: TimestampedComment[];
  /** Personal rating (current user) */
  personalRating?: RatingValue;
  /** Collaborator ratings */
  collaboratorRatings?: CollaboratorRatings;
  /** Cumulative ratings */
  cumulativeRatings?: CumulativeRatings;
  /** Current user ID */
  currentUserId?: string;
  /** Cached waveform data for hero track */
  heroWaveformData?: WaveformData;
  /** Called when user seeks to a position */
  onSeek?: (time: number) => void;
  /** Called when user adds a comment */
  onAddComment?: (content: string, timestampSeconds?: number) => void;
  /** Called when user clicks a comment to seek */
  onCommentClick?: (comment: TimestampedComment) => void;
  /** Called when user clicks a comment on a different track - switches to that track and seeks */
  onCommentTrackSelect?: (trackId: string, timestamp: number) => void;
  /** Called when user changes their rating */
  onRate?: (rating: RatingValue) => void;
  /** Called when waveform is generated (for caching) */
  onWaveformGenerated?: (data: WaveformData) => void;
  /** Show waveform section */
  showWaveform?: boolean;
  /** Show comments section */
  showComments?: boolean;
  /** Show ratings section */
  showRatings?: boolean;
  /** Available version types */
  versionTypes?: VersionType[];
  /** Called when user changes a track's version type */
  onVersionTypeChange?: (trackId: string, versionType: string | null) => void;
  /** Called when user creates a custom version type */
  onCreateVersionType?: (name: string) => Promise<void>;
  /** Per-track ratings (trackId -> rating value) */
  trackRatings?: Record<string, RatingValue>;
  /** Per-track aggregated ratings (trackId -> {liked, loved}) */
  trackAggregatedRatings?: Record<string, { liked: number; loved: number }>;
  /** Per-track comment counts (trackId -> count) */
  trackCommentCounts?: Record<string, number>;
}

/**
 * WorkDetailView - Displays a "Work" (song project) and all its versions
 *
 * A Work represents a song/composition as a creative project containing
 * multiple track versions (demos, acoustic, studio, live, remixes, etc.)
 */
export const WorkDetailView: React.FC<WorkDetailViewProps> = ({
  work,
  versions,
  currentTrackId,
  isPlaying = false,
  onPlayTrack,
  onSetHero,
  onAddVersion,
  onAddExistingTracks,
  onTrackClick,
  onRename,
  onUpdateDescription,
  onDelete,
  onBack,
  canEdit = false,
  // New enhanced props
  currentTime = 0,
  comments = [],
  personalRating,
  collaboratorRatings = { liked: 0, loved: 0 },
  cumulativeRatings = { liked: 0, loved: 0 },
  currentUserId,
  heroWaveformData,
  onSeek,
  onAddComment,
  onCommentClick,
  onCommentTrackSelect,
  onRate,
  onWaveformGenerated,
  showWaveform = true,
  showComments = true,
  showRatings = true,
  versionTypes = [],
  onVersionTypeChange,
  onCreateVersionType,
  trackRatings = {},
  trackAggregatedRatings = {},
  trackCommentCounts = {},
}) => {
  const designTokens = useDesignTokens();
  const isDesktop = useIsDesktop();
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(work.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'versions' | 'comments'>('versions');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(work.description || '');
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentTimestamp, setCommentTimestamp] = useState<number | null>(null);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus rename input when renaming starts
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  // Sync description value when work changes
  useEffect(() => {
    setDescriptionValue(work.description || '');
    setIsEditingDescription(false);
  }, [work.id, work.description]);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== work.name && onRename) {
      onRename(renameValue.trim());
    }
    setIsRenaming(false);
  };

  // Handle adding a comment
  const handleSubmitComment = useCallback(() => {
    if (!commentInput.trim() || !onAddComment) return;

    onAddComment(commentInput.trim(), commentTimestamp ?? undefined);
    setCommentInput('');
    setCommentTimestamp(null);
    setIsAddingComment(false);
  }, [commentInput, commentTimestamp, onAddComment]);

  // Handle saving description
  const handleSaveDescription = useCallback(async () => {
    if (!onUpdateDescription) return;
    const newDescription = descriptionValue.trim() || null;
    if (newDescription === (work.description || null)) {
      setIsEditingDescription(false);
      return;
    }

    setIsSavingDescription(true);
    try {
      await onUpdateDescription(newDescription);
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Failed to update description:', error);
    } finally {
      setIsSavingDescription(false);
    }
  }, [descriptionValue, work.description, onUpdateDescription]);

  // Handle clicking on waveform to add comment at timestamp
  const handleAddCommentAtTimestamp = useCallback((timestamp: number) => {
    setCommentTimestamp(timestamp);
    setIsAddingComment(true);
    setActiveTab('comments');
    // Focus the comment input after a short delay
    setTimeout(() => commentInputRef.current?.focus(), 100);
  }, []);

  // Handle comment click to seek - switch tracks if comment is on different version
  const handleCommentSeek = useCallback((comment: TimestampedComment) => {
    // If comment has track context and it's a different track, switch to it
    if (comment.track_id && comment.track_id !== currentTrackId) {
      // Find the track in versions and trigger play at timestamp
      const targetTrack = versions.find(v => v.id === comment.track_id);
      if (targetTrack && comment.timestamp_seconds !== null && onCommentTrackSelect) {
        onCommentTrackSelect(comment.track_id, comment.timestamp_seconds);
        return;
      }
    }

    // Same track or no track context - just seek within current track
    if (comment.timestamp_seconds !== null && onSeek) {
      onSeek(comment.timestamp_seconds);
    }
    onCommentClick?.(comment);
  }, [currentTrackId, versions, onSeek, onCommentClick, onCommentTrackSelect]);

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

  // Sort versions: hero first, then by date (newest first)
  const sortedVersions = [...versions].sort((a, b) => {
    if (a.id === work.hero_track_id) return -1;
    if (b.id === work.hero_track_id) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const heroVersion = sortedVersions.find(v => v.id === work.hero_track_id);
  const otherVersions = sortedVersions.filter(v => v.id !== work.hero_track_id);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: designTokens.colors.surface.primary,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: designTokens.spacing.lg,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.xs }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: designTokens.spacing.xs,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.text.secondary,
                cursor: 'pointer',
              }}
              title="Back to Works"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') {
                  setRenameValue(work.name);
                  setIsRenaming(false);
                }
              }}
              style={{
                flex: 1,
                fontSize: designTokens.typography.fontSizes.h2,
                fontWeight: designTokens.typography.fontWeights.bold,
                color: designTokens.colors.text.primary,
                backgroundColor: designTokens.colors.surface.secondary,
                border: `1px solid ${designTokens.colors.primary.blue}`,
                borderRadius: designTokens.borderRadius.sm,
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                outline: 'none',
              }}
            />
          ) : (
            <h1
              style={{
                flex: 1,
                fontSize: designTokens.typography.fontSizes.h2,
                fontWeight: designTokens.typography.fontWeights.bold,
                color: designTokens.colors.text.primary,
                margin: 0,
              }}
            >
              {work.name}
            </h1>
          )}

          {/* Menu button */}
          {(onRename || onDelete) && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: designTokens.spacing.xs,
                  backgroundColor: showMenu ? designTokens.colors.surface.secondary : 'transparent',
                  border: 'none',
                  borderRadius: designTokens.borderRadius.sm,
                  color: designTokens.colors.text.secondary,
                  cursor: 'pointer',
                }}
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: designTokens.spacing.xs,
                    backgroundColor: designTokens.colors.surface.secondary,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.md,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    minWidth: '160px',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  {onRename && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setIsRenaming(true);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.sm,
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: designTokens.colors.text.primary,
                        fontSize: designTokens.typography.fontSizes.body,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Pencil size={16} />
                      Rename
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.sm,
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: designTokens.colors.system.error,
                        fontSize: designTokens.typography.fontSizes.body,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p
          style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.secondary,
            margin: 0,
            marginLeft: onBack ? '36px' : 0,
          }}
        >
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </p>

        {/* Description Section */}
        {(work.description || canEdit) && (
          <div
            style={{
              marginTop: designTokens.spacing.md,
              marginLeft: onBack ? '36px' : 0,
            }}
          >
            {isEditingDescription ? (
              <div>
                <textarea
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  placeholder="Add notes about this song..."
                  disabled={isSavingDescription}
                  onBlur={handleSaveDescription}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setDescriptionValue(work.description || '');
                      setIsEditingDescription(false);
                    }
                    // Ctrl/Cmd + Enter to save
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSaveDescription();
                    }
                  }}
                  autoFocus
                  rows={3}
                  style={{
                    width: '100%',
                    padding: designTokens.spacing.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.secondary,
                    backgroundColor: designTokens.colors.surface.secondary,
                    border: `1px solid ${designTokens.colors.primary.blue}`,
                    borderRadius: designTokens.borderRadius.sm,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <div
                  style={{
                    marginTop: designTokens.spacing.xs,
                    fontSize: designTokens.typography.fontSizes.caption,
                    color: designTokens.colors.text.muted,
                  }}
                >
                  Press Escape to cancel, Cmd/Ctrl+Enter to save
                </div>
              </div>
            ) : work.description ? (
              <div
                onClick={() => canEdit && setIsEditingDescription(true)}
                style={{
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.text.secondary,
                  fontStyle: 'italic',
                  cursor: canEdit ? 'pointer' : 'default',
                  padding: designTokens.spacing.sm,
                  backgroundColor: designTokens.colors.surface.secondary,
                  borderRadius: designTokens.borderRadius.sm,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: designTokens.spacing.sm,
                }}
                title={canEdit ? 'Click to edit' : undefined}
              >
                <span style={{ flex: 1 }}>{work.description}</span>
                {canEdit && (
                  <Pencil
                    size={14}
                    style={{
                      opacity: 0.5,
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  />
                )}
              </div>
            ) : canEdit ? (
              <button
                onClick={() => setIsEditingDescription(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                  padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.text.muted,
                  backgroundColor: 'transparent',
                  border: `1px dashed ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.sm,
                  cursor: 'pointer',
                }}
              >
                <Pencil size={12} />
                Add notes about this song...
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
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
          onClick={() => setShowDeleteConfirm(false)}
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
              Delete Work?
            </h3>
            <p style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.text.secondary,
              margin: 0,
              marginBottom: designTokens.spacing.lg,
            }}>
              This will move "{work.name}" to the recycle bin. You can restore it within 30 days.
            </p>
            <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete?.();
                }}
                style={{
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                  backgroundColor: designTokens.colors.system.error,
                  border: 'none',
                  borderRadius: designTokens.borderRadius.sm,
                  color: designTokens.colors.neutral.white,
                  fontSize: designTokens.typography.fontSizes.body,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waveform Section (for hero track) */}
      {showWaveform && heroVersion && (
        <div
          style={{
            padding: designTokens.spacing.md,
            borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          }}
        >
          <WaveformVisualizer
            audioUrl={heroVersion.file_url}
            duration={heroVersion.duration_seconds || 0}
            currentTime={currentTrackId === heroVersion.id ? currentTime : 0}
            isPlaying={isPlaying && currentTrackId === heroVersion.id}
            comments={comments}
            cachedWaveformData={heroWaveformData}
            onSeek={onSeek}
            onAddComment={handleAddCommentAtTimestamp}
            onCommentClick={handleCommentSeek}
            onWaveformGenerated={onWaveformGenerated}
            height={80}
            showCommentMarkers={true}
          />
        </div>
      )}

      {/* Ratings Section */}
      {showRatings && onRate && (
        <div
          style={{
            padding: designTokens.spacing.md,
            borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          }}
        >
          <RatingSummary
            personal={personalRating ?? null}
            collaborators={collaboratorRatings}
            cumulative={cumulativeRatings}
            onRate={onRate}
            orientation="horizontal"
            compact
          />
        </div>
      )}

      {/* Desktop: Side-by-side layout (60% Versions / 40% Comments) */}
      {isDesktop && showComments ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {/* Left: Versions Timeline (60%) */}
          <div
            style={{
              flex: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRight: `1px solid ${designTokens.colors.borders.default}`,
              overflow: 'hidden',
            }}
          >
            {/* Section Header */}
            <div
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                borderBottom: `1px solid ${designTokens.colors.borders.default}`,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.medium,
                color: designTokens.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Versions ({versions.length})
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: designTokens.spacing.md }}>
              {versions.length > 0 ? (
                <VersionTimeline
                  versions={versions as TimelineTrackVersion[]}
                  heroTrackId={work.hero_track_id}
                  currentTrackId={currentTrackId}
                  isPlaying={isPlaying}
                  versionTypes={versionTypes}
                  trackAggregatedRatings={trackAggregatedRatings}
                  trackCommentCounts={trackCommentCounts}
                  onPlayTrack={onPlayTrack}
                  onTrackClick={onTrackClick}
                  onSetHero={onSetHero}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: designTokens.spacing.xl,
                    color: designTokens.colors.text.muted,
                  }}
                >
                  <p style={{ margin: 0, marginBottom: designTokens.spacing.md }}>
                    No versions yet.
                  </p>
                </div>
              )}
            </div>
            {/* Add Version/Tracks Buttons */}
            {(onAddVersion || onAddExistingTracks) && (
              <div
                style={{
                  padding: designTokens.spacing.sm,
                  borderTop: `1px solid ${designTokens.colors.borders.default}`,
                  display: 'flex',
                  gap: designTokens.spacing.sm,
                }}
              >
                {onAddExistingTracks && (
                  <button
                    onClick={onAddExistingTracks}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: designTokens.spacing.xs,
                      padding: designTokens.spacing.xs,
                      backgroundColor: 'transparent',
                      border: `1px dashed ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.text.secondary,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: 'pointer',
                    }}
                  >
                    <ListPlus size={14} />
                    Add Tracks
                  </button>
                )}
                {onAddVersion && (
                  <button
                    onClick={onAddVersion}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: designTokens.spacing.xs,
                      padding: designTokens.spacing.xs,
                      backgroundColor: 'transparent',
                      border: `1px dashed ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.text.secondary,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    Upload
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Comments Feed (40%) */}
          <div
            style={{
              flex: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Section Header */}
            <div
              style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                borderBottom: `1px solid ${designTokens.colors.borders.default}`,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.medium,
                color: designTokens.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
              }}
            >
              <MessageSquare size={14} />
              Comments ({comments.length})
            </div>
            {/* Comment List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: designTokens.spacing.md }}>
              <TimestampedCommentList
                comments={comments}
                currentTime={currentTime}
                duration={heroVersion?.duration_seconds || 0}
                onCommentClick={handleCommentSeek}
                currentUserId={currentUserId}
                emptyMessage="No comments yet. Click on the waveform to add a comment at a specific time."
                showTrackContext={true}
              />
            </div>
            {/* Comment Input */}
            {onAddComment && (
              <div
                style={{
                  padding: designTokens.spacing.sm,
                  borderTop: `1px solid ${designTokens.colors.borders.default}`,
                  backgroundColor: designTokens.colors.surface.secondary,
                }}
              >
                {commentTimestamp !== null && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.xs,
                      marginBottom: designTokens.spacing.xs,
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.accent.coral,
                    }}
                  >
                    <Clock size={12} />
                    @ {Math.floor(commentTimestamp / 60)}:{String(Math.floor(commentTimestamp % 60)).padStart(2, '0')}
                    <button
                      onClick={() => setCommentTimestamp(null)}
                      style={{
                        marginLeft: designTokens.spacing.xs,
                        padding: '2px 6px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.sm,
                        color: designTokens.colors.text.muted,
                        fontSize: designTokens.typography.fontSizes.caption,
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                  <textarea
                    ref={commentInputRef}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add a comment..."
                    style={{
                      flex: 1,
                      padding: designTokens.spacing.sm,
                      backgroundColor: designTokens.colors.surface.primary,
                      border: `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.text.primary,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      fontFamily: designTokens.typography.fontFamily,
                      resize: 'none',
                      minHeight: '50px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmitComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentInput.trim()}
                    style={{
                      padding: designTokens.spacing.sm,
                      backgroundColor: commentInput.trim()
                        ? designTokens.colors.primary.blue
                        : designTokens.colors.surface.tertiary,
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      color: commentInput.trim()
                        ? designTokens.colors.neutral.white
                        : designTokens.colors.text.muted,
                      cursor: commentInput.trim() ? 'pointer' : 'not-allowed',
                      alignSelf: 'flex-end',
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
        {/* Mobile: Tabs - Versions / Comments */}
        {showComments && (
          <div
            style={{
              display: 'flex',
              borderBottom: `1px solid ${designTokens.colors.borders.default}`,
            }}
          >
            <button
              onClick={() => setActiveTab('versions')}
              style={{
                flex: 1,
                padding: designTokens.spacing.sm,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'versions'
                  ? `2px solid ${designTokens.colors.primary.blue}`
                  : '2px solid transparent',
                color: activeTab === 'versions'
                  ? designTokens.colors.primary.blue
                  : designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: 'pointer',
              }}
            >
              Versions ({versions.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              style={{
                flex: 1,
                padding: designTokens.spacing.sm,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'comments'
                  ? `2px solid ${designTokens.colors.primary.blue}`
                  : '2px solid transparent',
                color: activeTab === 'comments'
                  ? designTokens.colors.primary.blue
                  : designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.xs,
              }}
            >
              <MessageSquare size={16} />
              Comments ({comments.length})
            </button>
          </div>
        )}

        {/* Mobile: Comments Tab Content */}
        {showComments && activeTab === 'comments' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Comment List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: designTokens.spacing.md }}>
              <TimestampedCommentList
                comments={comments}
                currentTime={currentTime}
                duration={heroVersion?.duration_seconds || 0}
                onCommentClick={handleCommentSeek}
                currentUserId={currentUserId}
                emptyMessage="No comments yet. Click on the waveform to add a comment at a specific time."
                showTrackContext={true}
              />
            </div>

            {/* Comment Input */}
            {onAddComment && (
              <div
                style={{
                  padding: designTokens.spacing.md,
                  borderTop: `1px solid ${designTokens.colors.borders.default}`,
                  backgroundColor: designTokens.colors.surface.secondary,
                }}
              >
                {commentTimestamp !== null && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: designTokens.spacing.xs,
                      marginBottom: designTokens.spacing.xs,
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.accent.coral,
                    }}
                  >
                    <Clock size={12} />
                    @ {Math.floor(commentTimestamp / 60)}:{String(Math.floor(commentTimestamp % 60)).padStart(2, '0')}
                    <button
                      onClick={() => setCommentTimestamp(null)}
                      style={{
                        marginLeft: designTokens.spacing.xs,
                        padding: '2px 6px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${designTokens.colors.borders.default}`,
                        borderRadius: designTokens.borderRadius.sm,
                        color: designTokens.colors.text.muted,
                        fontSize: designTokens.typography.fontSizes.caption,
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                  <textarea
                    ref={commentInputRef}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add a comment..."
                    style={{
                      flex: 1,
                      padding: designTokens.spacing.sm,
                      backgroundColor: designTokens.colors.surface.primary,
                      border: `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.text.primary,
                      fontSize: designTokens.typography.fontSizes.body,
                      fontFamily: designTokens.typography.fontFamily,
                      resize: 'none',
                      minHeight: '60px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmitComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentInput.trim()}
                    style={{
                      padding: designTokens.spacing.sm,
                      backgroundColor: commentInput.trim()
                        ? designTokens.colors.primary.blue
                        : designTokens.colors.surface.tertiary,
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      color: commentInput.trim()
                        ? designTokens.colors.neutral.white
                        : designTokens.colors.text.muted,
                      cursor: commentInput.trim() ? 'pointer' : 'not-allowed',
                      alignSelf: 'flex-end',
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile: Version Timeline (conditionally shown based on tab) */}
        {(!showComments || activeTab === 'versions') && (
      <>
      <div style={{ flex: 1, overflowY: 'auto', padding: designTokens.spacing.md }}>
        {/* Version Timeline - Visual journal of song evolution */}
        {versions.length > 0 ? (
          <VersionTimeline
            versions={versions as TimelineTrackVersion[]}
            heroTrackId={work.hero_track_id}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            versionTypes={versionTypes}
            trackAggregatedRatings={trackAggregatedRatings}
            trackCommentCounts={trackCommentCounts}
            onPlayTrack={onPlayTrack}
            onTrackClick={onTrackClick}
            onSetHero={onSetHero}
          />
        ) : (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: designTokens.spacing.xl,
              color: designTokens.colors.text.muted,
            }}
          >
            <p style={{ margin: 0, marginBottom: designTokens.spacing.md }}>
              No versions yet. Add tracks from your library or upload new ones.
            </p>
            <div style={{ display: 'flex', gap: designTokens.spacing.sm, justifyContent: 'center' }}>
              {onAddExistingTracks && (
                <button
                  onClick={onAddExistingTracks}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.xs,
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: designTokens.colors.primary.blue,
                    color: designTokens.colors.neutral.white,
                    border: 'none',
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.body,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                  }}
                >
                  <ListPlus size={16} />
                  Add Tracks
                </button>
              )}
              {onAddVersion && (
                <button
                  onClick={onAddVersion}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.xs,
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: 'transparent',
                    color: designTokens.colors.text.secondary,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.body,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} />
                  Upload New
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Version/Tracks Buttons (when versions exist) */}
      {(onAddVersion || onAddExistingTracks) && versions.length > 0 && (
        <div
          style={{
            padding: designTokens.spacing.md,
            borderTop: `1px solid ${designTokens.colors.borders.default}`,
            display: 'flex',
            gap: designTokens.spacing.sm,
          }}
        >
          {onAddExistingTracks && (
            <button
              onClick={onAddExistingTracks}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                padding: designTokens.spacing.sm,
                backgroundColor: 'transparent',
                border: `1px dashed ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSizes.body,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ListPlus size={16} />
              Add Tracks
            </button>
          )}
          {onAddVersion && (
            <button
              onClick={onAddVersion}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                padding: designTokens.spacing.sm,
                backgroundColor: 'transparent',
                border: `1px dashed ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSizes.body,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={16} />
              Upload New
            </button>
          )}
        </div>
      )}
      </>
      )}
      </>
      )}
    </div>
  );
};

// Version Row Component
interface VersionRowProps {
  track: TrackVersion;
  isHero?: boolean;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  isHovered: boolean;
  isDesktop?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPlay: () => void;
  onClick?: () => void;
  onSetHero?: () => void;
  designTokens: ReturnType<typeof useDesignTokens>;
  formatDuration: (seconds?: number) => string;
  formatDate: (dateString: string) => string;
  versionTypes?: VersionType[];
  onVersionTypeChange?: (versionType: string | null) => void;
  onCreateVersionType?: (name: string) => Promise<void>;
  /** Aggregated ratings for this track */
  aggregatedRatings?: { liked: number; loved: number };
  /** Comment count for this track */
  commentCount?: number;
}

const VersionRow: React.FC<VersionRowProps> = ({
  track,
  isHero,
  isCurrentTrack,
  isPlaying,
  isHovered,
  isDesktop = false,
  onMouseEnter,
  onMouseLeave,
  onPlay,
  onClick,
  onSetHero,
  designTokens,
  formatDuration,
  formatDate,
  versionTypes = [],
  onVersionTypeChange,
  onCreateVersionType,
  aggregatedRatings = { liked: 0, loved: 0 },
  commentCount = 0,
}) => {
  // Desktop: Use grid layout matching TrackListHeader columns
  if (isDesktop) {
    return (
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{
          display: 'grid',
          gridTemplateColumns: getTrackGridTemplate(),
          alignItems: 'center',
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
          backgroundColor: isHovered
            ? designTokens.colors.surface.hover
            : designTokens.colors.surface.primary,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
        }}
      >
        {/* Column 1: Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          style={{
            width: '32px',
            height: '32px',
            minWidth: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isPlaying
              ? designTokens.colors.primary.blue
              : designTokens.colors.surface.secondary,
            color: isPlaying
              ? designTokens.colors.neutral.white
              : designTokens.colors.primary.blue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Column 2: Title */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
            <span
              style={{
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
                color: designTokens.colors.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {track.title}
            </span>
            {isHero && (
              <Star
                size={12}
                color={designTokens.colors.accent.gold}
                fill={designTokens.colors.accent.gold}
              />
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.text.tertiary,
            }}
          >
            {track.uploader_name && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={10} />
                {track.uploader_name}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={10} />
              {formatDate(track.created_at)}
            </span>
          </div>
        </div>

        {/* Column 3: Duration */}
        <div
          style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.secondary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatDuration(track.duration_seconds)}
        </div>

        {/* Column 4: Version Type */}
        <div onClick={(e) => e.stopPropagation()}>
          {onVersionTypeChange ? (
            <VersionTypeSelector
              value={track.version_type || null}
              types={versionTypes}
              onChange={onVersionTypeChange}
              onCreateType={onCreateVersionType}
              compact
              placeholder="—"
            />
          ) : track.version_type ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: `2px ${designTokens.spacing.xs}`,
                backgroundColor: `${designTokens.colors.primary.blue}15`,
                border: `1px solid ${designTokens.colors.primary.blue}30`,
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.caption,
              }}
            >
              <Tag size={10} />
              {track.version_type}
            </span>
          ) : (
            <span style={{ color: designTokens.colors.text.muted, fontSize: designTokens.typography.fontSizes.caption }}>
              —
            </span>
          )}
        </div>

        {/* Column 5: Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
          {(aggregatedRatings.liked > 0 || aggregatedRatings.loved > 0) ? (
            <>
              {aggregatedRatings.liked > 0 && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: designTokens.colors.primary.blue,
                  fontSize: designTokens.typography.fontSizes.caption
                }}>
                  <ThumbsUp size={12} />
                  {aggregatedRatings.liked}
                </span>
              )}
              {aggregatedRatings.loved > 0 && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: designTokens.colors.accent.coral,
                  fontSize: designTokens.typography.fontSizes.caption
                }}>
                  <Heart size={12} />
                  {aggregatedRatings.loved}
                </span>
              )}
            </>
          ) : (
            <span style={{ color: designTokens.colors.text.muted, fontSize: designTokens.typography.fontSizes.caption }}>
              —
            </span>
          )}
        </div>

        {/* Column 6: Comments */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {commentCount > 0 ? (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: designTokens.colors.text.secondary,
              fontSize: designTokens.typography.fontSizes.caption
            }}>
              <MessageCircle size={12} />
              {commentCount}
            </span>
          ) : (
            <span style={{ color: designTokens.colors.text.muted, fontSize: designTokens.typography.fontSizes.caption }}>
              —
            </span>
          )}
        </div>

        {/* Column 7: Actions */}
        <div
          style={{
            display: 'flex',
            gap: designTokens.spacing.xs,
            justifyContent: 'flex-end',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          {onSetHero && !isHero && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetHero();
              }}
              style={{
                padding: `2px ${designTokens.spacing.xs}`,
                backgroundColor: 'transparent',
                border: `1px solid ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSizes.caption,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
              title="Set as featured version"
            >
              <Star size={10} />
              Featured
            </button>
          )}
          <ChevronRight size={16} color={designTokens.colors.text.muted} />
        </div>
      </div>
    );
  }

  // Mobile: Original compact layout
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.sm,
        padding: designTokens.spacing.sm,
        backgroundColor: isCurrentTrack
          ? designTokens.colors.surface.active
          : isHovered
          ? designTokens.colors.surface.secondary
          : isHero
          ? designTokens.colors.surface.secondary
          : 'transparent',
        borderRadius: designTokens.borderRadius.sm,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease',
        border: isHero ? `1px solid ${designTokens.colors.borders.default}` : '1px solid transparent',
      }}
    >
      {/* Play Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isCurrentTrack
            ? designTokens.colors.primary.blue
            : designTokens.colors.surface.tertiary,
          color: isCurrentTrack
            ? designTokens.colors.neutral.white
            : designTokens.colors.text.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
      </button>

      {/* Track Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.xs,
          }}
        >
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: isCurrentTrack
                ? designTokens.typography.fontWeights.semibold
                : designTokens.typography.fontWeights.medium,
              color: isCurrentTrack
                ? designTokens.colors.primary.blue
                : designTokens.colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {track.title}
          </span>
          {isHero && (
            <Star
              size={12}
              color={designTokens.colors.accent.gold}
              fill={designTokens.colors.accent.gold}
            />
          )}
          {/* Version Type Selector */}
          {onVersionTypeChange && (
            <div onClick={(e) => e.stopPropagation()}>
              <VersionTypeSelector
                value={track.version_type || null}
                types={versionTypes}
                onChange={onVersionTypeChange}
                onCreateType={onCreateVersionType}
                compact
                placeholder="type"
              />
            </div>
          )}
          {/* Show type as read-only tag if no change handler */}
          {!onVersionTypeChange && track.version_type && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: `2px ${designTokens.spacing.xs}`,
                backgroundColor: `${designTokens.colors.primary.blue}15`,
                border: `1px solid ${designTokens.colors.primary.blue}`,
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.caption,
              }}
            >
              <Tag size={10} />
              {track.version_type}
            </span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.text.muted,
            marginTop: '2px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {formatDuration(track.duration_seconds)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {formatDate(track.created_at)}
          </span>
          {track.uploader_name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} />
              {track.uploader_name}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing.xs,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        {onSetHero && !isHero && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetHero();
            }}
            style={{
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
              backgroundColor: 'transparent',
              border: `1px solid ${designTokens.colors.borders.default}`,
              borderRadius: designTokens.borderRadius.sm,
              color: designTokens.colors.text.secondary,
              fontSize: designTokens.typography.fontSizes.caption,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Set as featured version"
          >
            <Star size={12} />
            Make Featured
          </button>
        )}
        <ChevronRight size={16} color={designTokens.colors.text.muted} />
      </div>
    </div>
  );
};

export default WorkDetailView;
