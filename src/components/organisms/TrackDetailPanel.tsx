import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, ThumbsUp, Heart, MessageCircle, Download, Clock, Calendar, User, Folder, X, Music, Pencil, FileText, MoreVertical, Trash2, Check } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { WaveformVisualizer, TimestampedComment } from '../molecules/WaveformVisualizer';
import { WaveformData } from '../../utils/waveformGenerator';
import { KeywordSelector } from '../molecules/KeywordSelector';

interface TrackVersion {
  id: string;
  version_number: number;
  created_at: string;
  is_current: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  updated_at?: string;
  timestamp_seconds?: number;
}

interface WorkInfo {
  id: string;
  name: string;
  version_count?: number;
}

interface TrackDetailPanelProps {
  track: {
    id: string;
    title: string;
    file_url?: string;
    duration_seconds?: number;
    folder_path?: string;
    created_at?: string;
    uploaded_by?: string;
    version_notes?: string | null;
    composition_date?: string | null;
  } | null;
  /** Band ID for keyword management */
  bandId?: string;
  /** Current user ID for keyword management */
  userId?: string;
  /** Audio element ref for syncing playback progress with main player */
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  currentRating?: 'liked' | 'loved' | null;
  aggregatedRatings?: {
    liked: number;
    loved: number;
  };
  versions?: TrackVersion[];
  comments?: Comment[];
  /** Work (song project) this track belongs to */
  work?: WorkInfo | null;
  /** Cached waveform data for this track */
  cachedWaveformData?: WaveformData;
  /** Timestamped comments for waveform markers */
  timestampedComments?: TimestampedComment[];
  onPlayPause?: () => void;
  onRate?: (rating: 'liked' | 'loved') => void;
  onClose?: () => void;
  onVersionSelect?: (version: TrackVersion) => void;
  onAddComment?: (content: string, timestampSeconds?: number) => void;
  /** Called when user clicks to view the work */
  onWorkClick?: (work: WorkInfo) => void;
  /** Called when user seeks to a position */
  onSeek?: (time: number) => void;
  /** Called when waveform is generated (for caching) */
  onWaveformGenerated?: (data: WaveformData) => void;
  /** Whether the current user can edit track metadata (band admins only) */
  canEdit?: boolean;
  /** Called when user updates track metadata */
  onUpdateTrack?: (trackId: string, updates: {
    title?: string;
    version_notes?: string | null;
    composition_date?: string | null;
  }) => Promise<void>;
  /** Current user ID for determining comment ownership */
  currentUserId?: string;
  /** Called when user updates their own comment */
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  /** Called when user deletes their own comment */
  onDeleteComment?: (commentId: string) => Promise<void>;
}

/**
 * TrackDetailPanel - Right sidebar showing detailed track information
 *
 * Features:
 * - Track info (title, duration, folder, upload date)
 * - Playback controls with future waveform placeholder
 * - Version history
 * - Aggregated ratings
 * - Comment thread
 */
export const TrackDetailPanel: React.FC<TrackDetailPanelProps> = ({
  track,
  bandId,
  userId,
  audioRef,
  isPlaying = false,
  currentRating,
  aggregatedRatings,
  versions = [],
  comments = [],
  work,
  cachedWaveformData,
  timestampedComments = [],
  onPlayPause,
  onRate,
  onClose,
  onVersionSelect,
  onAddComment,
  onWorkClick,
  onSeek,
  onWaveformGenerated,
  canEdit = false,
  onUpdateTrack,
  currentUserId,
  onUpdateComment,
  onDeleteComment,
}) => {
  const designTokens = useDesignTokens();
  const [currentTime, setCurrentTime] = useState(0);
  const [commentTimestamp, setCommentTimestamp] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Version notes editing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Composition date editing
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDate, setEditDate] = useState('');

  // Comment editing state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [openMenuCommentId, setOpenMenuCommentId] = useState<string | null>(null);

  // Handle adding a comment at a specific timestamp from waveform
  const handleAddCommentAtTimestamp = useCallback((timestamp: number) => {
    setCommentTimestamp(timestamp);
  }, []);

  // Handle submitting a new comment
  const handleSubmitComment = useCallback(async () => {
    if (!newCommentText.trim() || !onAddComment) return;

    setIsSubmittingComment(true);
    try {
      await onAddComment(newCommentText.trim(), commentTimestamp ?? undefined);
      setNewCommentText('');
      setCommentTimestamp(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [newCommentText, commentTimestamp, onAddComment]);

  // Handle clicking on a comment marker to seek
  const handleCommentClick = useCallback((comment: TimestampedComment) => {
    if (comment.timestamp_seconds !== null && onSeek) {
      onSeek(comment.timestamp_seconds);
    }
  }, [onSeek]);

  // Handle entering edit mode
  const handleStartEdit = useCallback(() => {
    if (!canEdit || !track) return;
    setEditTitle(track.title);
    setIsEditing(true);
  }, [canEdit, track]);

  // Focus input when edit mode starts
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit state when track changes
  useEffect(() => {
    setIsEditing(false);
    setEditTitle('');
    setIsEditingNotes(false);
    setEditNotes('');
    setIsEditingDate(false);
    setEditDate('');
    // Reset comment editing state
    setEditingCommentId(null);
    setEditCommentText('');
    setDeleteConfirmId(null);
    setOpenMenuCommentId(null);
  }, [track?.id]);

  // Handle saving title
  const handleSaveTitle = useCallback(async () => {
    if (!track || !onUpdateTrack || !editTitle.trim()) return;
    if (editTitle.trim() === track.title) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateTrack(track.id, { title: editTitle.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update track title:', error);
    } finally {
      setIsSaving(false);
    }
  }, [track, editTitle, onUpdateTrack]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditTitle('');
  }, []);

  // Handle starting version notes edit
  const handleStartEditNotes = useCallback(() => {
    if (!canEdit || !track) return;
    setEditNotes(track.version_notes || '');
    setIsEditingNotes(true);
  }, [canEdit, track]);

  // Handle saving version notes
  const handleSaveNotes = useCallback(async () => {
    if (!track || !onUpdateTrack) return;
    const newNotes = editNotes.trim() || null;
    if (newNotes === (track.version_notes || null)) {
      setIsEditingNotes(false);
      return;
    }

    setIsSavingNotes(true);
    try {
      await onUpdateTrack(track.id, { version_notes: newNotes });
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Failed to update version notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  }, [track, editNotes, onUpdateTrack]);

  // Handle starting composition date edit
  const handleStartEditDate = useCallback(() => {
    if (!canEdit || !track) return;
    setEditDate(track.composition_date || '');
    setIsEditingDate(true);
  }, [canEdit, track]);

  // Handle saving composition date
  const handleSaveDate = useCallback(async () => {
    if (!track || !onUpdateTrack) return;
    const newDate = editDate || null;
    if (newDate === (track.composition_date || null)) {
      setIsEditingDate(false);
      return;
    }

    try {
      await onUpdateTrack(track.id, { composition_date: newDate });
      setIsEditingDate(false);
    } catch (error) {
      console.error('Failed to update composition date:', error);
    }
  }, [track, editDate, onUpdateTrack]);

  // Handle starting comment edit
  const handleStartEditComment = useCallback((comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
    setOpenMenuCommentId(null);
  }, []);

  // Handle saving comment edit
  const handleSaveCommentEdit = useCallback(async () => {
    if (!editingCommentId || !onUpdateComment || !editCommentText.trim()) return;

    setIsSavingComment(true);
    try {
      await onUpdateComment(editingCommentId, editCommentText.trim());
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsSavingComment(false);
    }
  }, [editingCommentId, editCommentText, onUpdateComment]);

  // Handle cancel comment edit
  const handleCancelCommentEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditCommentText('');
  }, []);

  // Handle delete comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!onDeleteComment) return;

    setIsDeletingComment(true);
    try {
      await onDeleteComment(commentId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsDeletingComment(false);
    }
  }, [onDeleteComment]);

  // Sync with audio playback progress
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('timeupdate', updateTime);

    // Set initial time if audio is already playing
    if (audio.currentTime > 0) {
      setCurrentTime(audio.currentTime);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [audioRef, track?.id]);

  // Reset time when track changes
  useEffect(() => {
    setCurrentTime(0);
  }, [track?.id]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!track) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: designTokens.spacing.xl,
          color: designTokens.colors.text.muted,
        }}
      >
        <MessageCircle size={48} strokeWidth={1} />
        <p style={{ marginTop: designTokens.spacing.md, textAlign: 'center' }}>
          Select a track to view details
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: designTokens.typography.fontFamily,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: designTokens.spacing.md,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: designTokens.spacing.sm,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            // Edit mode: show input field
            <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                onBlur={handleSaveTitle}
                disabled={isSaving}
                style={{
                  flex: 1,
                  fontSize: designTokens.typography.fontSizes.h4,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.text.primary,
                  backgroundColor: designTokens.colors.surface.secondary,
                  border: `1px solid ${designTokens.colors.primary.blue}`,
                  borderRadius: designTokens.borderRadius.sm,
                  padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                  outline: 'none',
                  minWidth: 0,
                }}
              />
            </div>
          ) : (
            // View mode: show title with optional edit button
            <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.xs }}>
              <h2
                style={{
                  fontSize: designTokens.typography.fontSizes.h4,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.text.primary,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {track.title}
              </h2>
              {canEdit && onUpdateTrack && (
                <button
                  onClick={handleStartEdit}
                  title="Edit title"
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: designTokens.borderRadius.sm,
                    color: designTokens.colors.text.muted,
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          )}
          {track.folder_path && !isEditing && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px',
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.tertiary,
              }}
            >
              <Folder size={12} />
              {track.folder_path}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: designTokens.borderRadius.sm,
              color: designTokens.colors.text.tertiary,
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: designTokens.spacing.md,
        }}
      >
        {/* Waveform Section */}
        <div
          style={{
            backgroundColor: designTokens.colors.surface.tertiary,
            borderRadius: designTokens.borderRadius.md,
            padding: designTokens.spacing.lg,
            marginBottom: designTokens.spacing.lg,
          }}
        >
          {/* Waveform Visualizer */}
          {track.file_url ? (
            <div style={{ marginBottom: designTokens.spacing.md }}>
              <WaveformVisualizer
                audioUrl={track.file_url}
                duration={track.duration_seconds || 0}
                currentTime={currentTime}
                isPlaying={isPlaying}
                comments={timestampedComments}
                cachedWaveformData={cachedWaveformData}
                onSeek={onSeek}
                onAddComment={handleAddCommentAtTimestamp}
                onCommentClick={handleCommentClick}
                onWaveformGenerated={onWaveformGenerated}
                height={80}
                showCommentMarkers={true}
              />
            </div>
          ) : (
            <div
              style={{
                height: '80px',
                backgroundColor: designTokens.colors.surface.primary,
                borderRadius: designTokens.borderRadius.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: designTokens.spacing.md,
                border: `1px dashed ${designTokens.colors.borders.default}`,
              }}
            >
              <span style={{ color: designTokens.colors.text.muted, fontSize: designTokens.typography.fontSizes.bodySmall }}>
                No audio file available
              </span>
            </div>
          )}

          {/* Playback Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.md,
            }}
          >
            <button
              onClick={onPlayPause}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: designTokens.colors.primary.blue,
                color: designTokens.colors.neutral.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '2px' }} />}
            </button>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: '4px',
                  backgroundColor: designTokens.colors.surface.primary,
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${track.duration_seconds ? (currentTime / track.duration_seconds) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: designTokens.colors.primary.blue,
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.secondary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatDuration(currentTime)} / {formatDuration(track.duration_seconds)}
            </span>
          </div>

          {/* Timestamp Comment Indicator */}
          {commentTimestamp !== null && (
            <div
              style={{
                marginTop: designTokens.spacing.sm,
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                backgroundColor: `${designTokens.colors.accent.coral}15`,
                borderRadius: designTokens.borderRadius.sm,
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.accent.coral,
              }}
            >
              <Clock size={12} />
              Adding comment at {Math.floor(commentTimestamp / 60)}:{String(Math.floor(commentTimestamp % 60)).padStart(2, '0')}
              <button
                onClick={() => setCommentTimestamp(null)}
                style={{
                  marginLeft: 'auto',
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
        </div>

        {/* Track Info */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <h3
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Track Info
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
              <Clock size={14} color={designTokens.colors.text.tertiary} />
              <span style={{ fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.text.secondary }}>
                Duration: {formatDuration(track.duration_seconds)}
              </span>
            </div>
            {track.created_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                <Calendar size={14} color={designTokens.colors.text.tertiary} />
                <span style={{ fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.text.secondary }}>
                  Uploaded: {formatDate(track.created_at)}
                </span>
              </div>
            )}
            {/* Composition Date (Written) */}
            {(track.composition_date || canEdit) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                <Pencil size={14} color={designTokens.colors.text.tertiary} />
                {isEditingDate ? (
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    onBlur={handleSaveDate}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveDate();
                      if (e.key === 'Escape') {
                        setEditDate('');
                        setIsEditingDate(false);
                      }
                    }}
                    autoFocus
                    style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.text.secondary,
                      backgroundColor: designTokens.colors.surface.secondary,
                      border: `1px solid ${designTokens.colors.primary.blue}`,
                      borderRadius: designTokens.borderRadius.sm,
                      padding: `2px ${designTokens.spacing.xs}`,
                      outline: 'none',
                    }}
                  />
                ) : track.composition_date ? (
                  <span
                    onClick={() => canEdit && handleStartEditDate()}
                    style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.text.secondary,
                      cursor: canEdit ? 'pointer' : 'default',
                    }}
                    title={canEdit ? 'Click to edit' : undefined}
                  >
                    Written: {formatDate(track.composition_date)}
                  </span>
                ) : canEdit ? (
                  <button
                    onClick={handleStartEditDate}
                    style={{
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      color: designTokens.colors.text.muted,
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dashed',
                    }}
                  >
                    Add written date...
                  </button>
                ) : null}
              </div>
            )}
            {track.uploaded_by && (
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                <User size={14} color={designTokens.colors.text.tertiary} />
                <span style={{ fontSize: designTokens.typography.fontSizes.bodySmall, color: designTokens.colors.text.secondary }}>
                  By: {track.uploaded_by}
                </span>
              </div>
            )}
            {work && (
              <button
                onClick={() => onWorkClick?.(work)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  backgroundColor: designTokens.colors.surface.secondary,
                  border: `1px solid ${designTokens.colors.borders.default}`,
                  borderRadius: designTokens.borderRadius.sm,
                  padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                  cursor: onWorkClick ? 'pointer' : 'default',
                  marginTop: designTokens.spacing.xs,
                }}
              >
                <Music size={14} color={designTokens.colors.primary.blue} />
                <span style={{
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.text.primary,
                }}>
                  Part of: <strong>{work.name}</strong>
                </span>
                {work.version_count && work.version_count > 1 && (
                  <span style={{
                    fontSize: designTokens.typography.fontSizes.caption,
                    color: designTokens.colors.text.muted,
                  }}>
                    ({work.version_count} versions)
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Version Notes Section */}
        {(track.version_notes || canEdit) && (
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <h3
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: designTokens.spacing.sm,
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.sm,
              }}
            >
              <FileText size={14} />
              Version Notes
            </h3>
            {isEditingNotes ? (
              <div>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="What changed in this version?"
                  disabled={isSavingNotes}
                  onBlur={handleSaveNotes}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditNotes('');
                      setIsEditingNotes(false);
                    }
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSaveNotes();
                    }
                  }}
                  autoFocus
                  rows={3}
                  style={{
                    width: '100%',
                    padding: designTokens.spacing.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.primary,
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
                  Escape to cancel, Cmd/Ctrl+Enter to save
                </div>
              </div>
            ) : track.version_notes ? (
              <div
                onClick={() => canEdit && handleStartEditNotes()}
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
                <span style={{ flex: 1 }}>"{track.version_notes}"</span>
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
                onClick={handleStartEditNotes}
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
                  width: '100%',
                }}
              >
                <Pencil size={12} />
                Add notes about this version...
              </button>
            ) : null}
          </div>
        )}

        {/* Keywords Section */}
        {bandId && userId && track && (
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <h3
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: designTokens.spacing.sm,
              }}
            >
              Keywords
            </h3>
            <KeywordSelector
              trackId={track.id}
              bandId={bandId}
              userId={userId}
            />
          </div>
        )}

        {/* Ratings Section */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <h3
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Ratings
          </h3>
          <div style={{ display: 'flex', gap: designTokens.spacing.md }}>
            {/* Like Button */}
            <button
              onClick={() => onRate?.('liked')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                padding: designTokens.spacing.sm,
                borderRadius: designTokens.borderRadius.sm,
                border: currentRating === 'liked'
                  ? 'none'
                  : `1px solid ${designTokens.colors.borders.default}`,
                backgroundColor: currentRating === 'liked'
                  ? designTokens.colors.ratings.liked.bg
                  : 'transparent',
                color: currentRating === 'liked'
                  ? designTokens.colors.neutral.white
                  : designTokens.colors.text.secondary,
                cursor: 'pointer',
                fontSize: designTokens.typography.fontSizes.body,
                fontFamily: designTokens.typography.fontFamily,
              }}
            >
              <ThumbsUp size={18} fill={currentRating === 'liked' ? 'currentColor' : 'none'} />
              <span>{aggregatedRatings?.liked || 0}</span>
            </button>

            {/* Love Button */}
            <button
              onClick={() => onRate?.('loved')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                padding: designTokens.spacing.sm,
                borderRadius: designTokens.borderRadius.sm,
                border: currentRating === 'loved'
                  ? 'none'
                  : `1px solid ${designTokens.colors.borders.default}`,
                backgroundColor: currentRating === 'loved'
                  ? designTokens.colors.ratings.loved.bg
                  : 'transparent',
                color: currentRating === 'loved'
                  ? designTokens.colors.neutral.white
                  : designTokens.colors.text.secondary,
                cursor: 'pointer',
                fontSize: designTokens.typography.fontSizes.body,
                fontFamily: designTokens.typography.fontFamily,
              }}
            >
              <Heart size={18} fill={currentRating === 'loved' ? 'currentColor' : 'none'} />
              <span>{aggregatedRatings?.loved || 0}</span>
            </button>
          </div>
        </div>

        {/* Versions Section */}
        {versions.length > 0 && (
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <h3
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: designTokens.spacing.sm,
              }}
            >
              Versions ({versions.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => onVersionSelect?.(version)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: designTokens.spacing.sm,
                    backgroundColor: version.is_current
                      ? designTokens.colors.surface.active
                      : 'transparent',
                    border: `1px solid ${version.is_current ? designTokens.colors.primary.blue : designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.sm,
                    cursor: 'pointer',
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontFamily: designTokens.typography.fontFamily,
                    color: designTokens.colors.text.primary,
                  }}
                >
                  <span>
                    v{version.version_number}
                    {version.is_current && (
                      <span style={{ color: designTokens.colors.primary.blue, marginLeft: '8px' }}>
                        (current)
                      </span>
                    )}
                  </span>
                  <span style={{ color: designTokens.colors.text.tertiary }}>
                    {formatDate(version.created_at)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div>
          <h3
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: designTokens.spacing.sm,
            }}
          >
            Comments ({comments.length})
          </h3>

          {/* Comment Input */}
          {onAddComment && (
            <div style={{ marginBottom: designTokens.spacing.md }}>
              {commentTimestamp !== null && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.xs,
                    marginBottom: designTokens.spacing.xs,
                    padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                    backgroundColor: `${designTokens.colors.accent.coral}15`,
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.caption,
                    color: designTokens.colors.accent.coral,
                  }}
                >
                  <Clock size={12} />
                  Comment at {Math.floor(commentTimestamp / 60)}:{String(Math.floor(commentTimestamp % 60)).padStart(2, '0')}
                  <button
                    onClick={() => setCommentTimestamp(null)}
                    style={{
                      marginLeft: 'auto',
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
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSubmittingComment && handleSubmitComment()}
                  placeholder={commentTimestamp !== null
                    ? `Comment at ${Math.floor(commentTimestamp / 60)}:${String(Math.floor(commentTimestamp % 60)).padStart(2, '0')}...`
                    : "Add a comment..."}
                  disabled={isSubmittingComment}
                  style={{
                    flex: 1,
                    padding: designTokens.spacing.sm,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontFamily: designTokens.typography.fontFamily,
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newCommentText.trim() || isSubmittingComment}
                  style={{
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                    backgroundColor: newCommentText.trim() && !isSubmittingComment
                      ? designTokens.colors.primary.blue
                      : designTokens.colors.text.disabled,
                    color: designTokens.colors.text.inverse,
                    border: 'none',
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontFamily: designTokens.typography.fontFamily,
                    cursor: newCommentText.trim() && !isSubmittingComment ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.muted,
                fontStyle: 'italic',
              }}
            >
              No comments yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
              {comments.map((comment) => {
                const isOwnComment = currentUserId && comment.user_id === currentUserId;
                const isEditing = editingCommentId === comment.id;
                const isDeleting = deleteConfirmId === comment.id;
                const isMenuOpen = openMenuCommentId === comment.id;
                const wasEdited = comment.updated_at && comment.updated_at !== comment.created_at;

                return (
                  <div
                    key={comment.id}
                    onClick={() => {
                      // If comment has timestamp and not in edit mode, seek to it
                      if (!isEditing && !isDeleting && comment.timestamp_seconds !== undefined && comment.timestamp_seconds !== null && onSeek) {
                        onSeek(comment.timestamp_seconds);
                      }
                    }}
                    style={{
                      padding: designTokens.spacing.sm,
                      backgroundColor: isDeleting
                        ? `${designTokens.colors.status.error}10`
                        : designTokens.colors.surface.tertiary,
                      borderRadius: designTokens.borderRadius.sm,
                      cursor: !isEditing && !isDeleting && comment.timestamp_seconds !== undefined && comment.timestamp_seconds !== null ? 'pointer' : 'default',
                      border: isDeleting ? `1px solid ${designTokens.colors.status.error}` : 'none',
                    }}
                  >
                    {/* Delete Confirmation */}
                    {isDeleting ? (
                      <div>
                        <p
                          style={{
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            color: designTokens.colors.text.primary,
                            marginBottom: designTokens.spacing.sm,
                          }}
                        >
                          Delete this comment?
                        </p>
                        <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            disabled={isDeletingComment}
                            style={{
                              padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                              fontSize: designTokens.typography.fontSizes.caption,
                              backgroundColor: 'transparent',
                              border: `1px solid ${designTokens.colors.borders.default}`,
                              borderRadius: designTokens.borderRadius.sm,
                              color: designTokens.colors.text.secondary,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComment(comment.id);
                            }}
                            disabled={isDeletingComment}
                            style={{
                              padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                              fontSize: designTokens.typography.fontSizes.caption,
                              backgroundColor: designTokens.colors.status.error,
                              border: 'none',
                              borderRadius: designTokens.borderRadius.sm,
                              color: designTokens.colors.text.inverse,
                              cursor: isDeletingComment ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isDeletingComment ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ) : isEditing ? (
                      /* Edit Mode */
                      <div onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') handleCancelCommentEdit();
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSaveCommentEdit();
                          }}
                          disabled={isSavingComment}
                          autoFocus
                          rows={2}
                          style={{
                            width: '100%',
                            padding: designTokens.spacing.xs,
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            color: designTokens.colors.text.primary,
                            backgroundColor: designTokens.colors.surface.primary,
                            border: `1px solid ${designTokens.colors.primary.blue}`,
                            borderRadius: designTokens.borderRadius.sm,
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            marginBottom: designTokens.spacing.xs,
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: designTokens.typography.fontSizes.caption,
                              color: designTokens.colors.text.muted,
                            }}
                          >
                            Esc to cancel, Cmd+Enter to save
                          </span>
                          <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
                            <button
                              onClick={handleCancelCommentEdit}
                              disabled={isSavingComment}
                              style={{
                                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                                fontSize: designTokens.typography.fontSizes.caption,
                                backgroundColor: 'transparent',
                                border: `1px solid ${designTokens.colors.borders.default}`,
                                borderRadius: designTokens.borderRadius.sm,
                                color: designTokens.colors.text.secondary,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveCommentEdit}
                              disabled={!editCommentText.trim() || isSavingComment}
                              style={{
                                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                                fontSize: designTokens.typography.fontSizes.caption,
                                backgroundColor: editCommentText.trim() && !isSavingComment
                                  ? designTokens.colors.primary.blue
                                  : designTokens.colors.text.disabled,
                                border: 'none',
                                borderRadius: designTokens.borderRadius.sm,
                                color: designTokens.colors.text.inverse,
                                cursor: editCommentText.trim() && !isSavingComment ? 'pointer' : 'not-allowed',
                              }}
                            >
                              {isSavingComment ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                            <span
                              style={{
                                fontSize: designTokens.typography.fontSizes.bodySmall,
                                fontWeight: designTokens.typography.fontWeights.medium,
                                color: designTokens.colors.text.primary,
                              }}
                            >
                              {comment.user_name}
                            </span>
                            {comment.timestamp_seconds !== undefined && comment.timestamp_seconds !== null && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  padding: `1px ${designTokens.spacing.xs}`,
                                  backgroundColor: `${designTokens.colors.accent.coral}20`,
                                  border: `1px solid ${designTokens.colors.accent.coral}`,
                                  borderRadius: designTokens.borderRadius.sm,
                                  fontSize: designTokens.typography.fontSizes.caption,
                                  color: designTokens.colors.accent.coral,
                                  fontWeight: designTokens.typography.fontWeights.medium,
                                }}
                                title="Click to jump to this timestamp"
                              >
                                <Clock size={10} />
                                {Math.floor(comment.timestamp_seconds / 60)}:{String(Math.floor(comment.timestamp_seconds % 60)).padStart(2, '0')}
                              </span>
                            )}
                            {wasEdited && (
                              <span
                                style={{
                                  fontSize: designTokens.typography.fontSizes.caption,
                                  color: designTokens.colors.text.muted,
                                  fontStyle: 'italic',
                                }}
                              >
                                (edited)
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
                            <span
                              style={{
                                fontSize: designTokens.typography.fontSizes.caption,
                                color: designTokens.colors.text.muted,
                              }}
                            >
                              {formatDate(comment.created_at)}
                            </span>
                            {/* Edit/Delete Menu - only for own comments */}
                            {isOwnComment && onUpdateComment && onDeleteComment && (
                              <div style={{ position: 'relative' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuCommentId(isMenuOpen ? null : comment.id);
                                  }}
                                  style={{
                                    padding: '2px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: designTokens.borderRadius.sm,
                                    color: designTokens.colors.text.muted,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title="More options"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                {isMenuOpen && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: '100%',
                                      right: 0,
                                      marginTop: '4px',
                                      backgroundColor: designTokens.colors.surface.primary,
                                      border: `1px solid ${designTokens.colors.borders.default}`,
                                      borderRadius: designTokens.borderRadius.sm,
                                      boxShadow: designTokens.shadows.elevated,
                                      zIndex: 10,
                                      minWidth: '100px',
                                    }}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditComment(comment);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: designTokens.spacing.xs,
                                        width: '100%',
                                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                                        fontSize: designTokens.typography.fontSizes.bodySmall,
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: designTokens.colors.text.primary,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                      }}
                                    >
                                      <Pencil size={12} />
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(comment.id);
                                        setOpenMenuCommentId(null);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: designTokens.spacing.xs,
                                        width: '100%',
                                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                                        fontSize: designTokens.typography.fontSizes.bodySmall,
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: designTokens.colors.status.error,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                      }}
                                    >
                                      <Trash2 size={12} />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: designTokens.typography.fontSizes.bodySmall,
                            color: designTokens.colors.text.secondary,
                            margin: 0,
                          }}
                        >
                          {comment.content}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDetailPanel;
