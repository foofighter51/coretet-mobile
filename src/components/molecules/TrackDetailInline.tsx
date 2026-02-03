import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, User, Calendar, Clock, Tag, Pencil, Send } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { WaveformVisualizer, TimestampedComment } from './WaveformVisualizer';
import { TimestampedCommentList } from './TimestampedCommentList';
import { VersionTypeSelector, VersionType } from './VersionTypeSelector';
import { WaveformData } from '../../utils/waveformGenerator';

export interface TrackDetailInlineTrack {
  id: string;
  title: string;
  file_url: string;
  duration_seconds?: number;
  created_at: string;
  created_by?: string;
  uploader_name?: string;
  version_type?: string | null;
  version_notes?: string | null;
}

export interface TrackDetailInlineProps {
  /** Track to display */
  track: TrackDetailInlineTrack;
  /** Whether this track is currently playing */
  isPlaying?: boolean;
  /** Current playback time in seconds */
  currentTime?: number;
  /** Comments for this specific track */
  comments?: TimestampedComment[];
  /** Current user ID (for edit/delete permissions) */
  currentUserId?: string;
  /** Cached waveform data */
  waveformData?: WaveformData;
  /** Available version types */
  versionTypes?: VersionType[];
  /** Called when back button is clicked */
  onBack: () => void;
  /** Called when play/pause is requested */
  onPlayPause?: () => void;
  /** Called when user seeks to a position */
  onSeek?: (time: number) => void;
  /** Called when user adds a comment */
  onAddComment?: (content: string, timestampSeconds?: number) => void;
  /** Called when a comment is clicked to seek */
  onCommentClick?: (comment: TimestampedComment) => void;
  /** Called when waveform is generated */
  onWaveformGenerated?: (data: WaveformData) => void;
  /** Called when version type changes */
  onVersionTypeChange?: (versionType: string | null) => void;
  /** Called when a custom version type is created */
  onCreateVersionType?: (name: string) => Promise<void>;
  /** Called when track title is updated */
  onUpdateTitle?: (title: string) => Promise<void>;
  /** Called when version notes are updated */
  onUpdateVersionNotes?: (notes: string | null) => Promise<void>;
  /** Whether user can edit track details */
  canEdit?: boolean;
  /** Called when user edits a comment */
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  /** Called when user deletes a comment */
  onDeleteComment?: (commentId: string) => Promise<void>;
}

/**
 * TrackDetailInline - Simplified track detail panel for inline display
 *
 * A streamlined version of TrackDetailPanel designed to fit in the
 * contextual right panel of WorkDetailView. Includes:
 * - Back navigation
 * - Waveform visualization
 * - Track metadata
 * - Track-specific comments with add/edit/delete
 */
export const TrackDetailInline: React.FC<TrackDetailInlineProps> = ({
  track,
  isPlaying = false,
  currentTime = 0,
  comments = [],
  currentUserId,
  waveformData,
  versionTypes = [],
  onBack,
  onPlayPause,
  onSeek,
  onAddComment,
  onCommentClick,
  onWaveformGenerated,
  onVersionTypeChange,
  onCreateVersionType,
  onUpdateTitle,
  onUpdateVersionNotes,
  canEdit = false,
  onEditComment,
  onDeleteComment,
}) => {
  const designTokens = useDesignTokens();
  const [commentInput, setCommentInput] = useState('');
  const [commentTimestamp, setCommentTimestamp] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(track.title);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(track.version_notes || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Format helpers
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

  // Handle adding a comment at timestamp
  const handleAddCommentAtTimestamp = useCallback((timestamp: number) => {
    setCommentTimestamp(timestamp);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  }, []);

  // Handle submitting a comment
  const handleSubmitComment = useCallback(() => {
    if (!commentInput.trim() || !onAddComment) return;
    onAddComment(commentInput.trim(), commentTimestamp ?? undefined);
    setCommentInput('');
    setCommentTimestamp(null);
  }, [commentInput, commentTimestamp, onAddComment]);

  // Handle title save
  const handleSaveTitle = useCallback(async () => {
    if (titleValue.trim() && titleValue !== track.title && onUpdateTitle) {
      await onUpdateTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  }, [titleValue, track.title, onUpdateTitle]);

  // Handle notes save
  const handleSaveNotes = useCallback(async () => {
    if (onUpdateVersionNotes) {
      const newNotes = notesValue.trim() || null;
      if (newNotes !== (track.version_notes || null)) {
        await onUpdateVersionNotes(newNotes);
      }
    }
    setIsEditingNotes(false);
  }, [notesValue, track.version_notes, onUpdateVersionNotes]);

  // Sync state when track changes
  React.useEffect(() => {
    setTitleValue(track.title);
    setNotesValue(track.version_notes || '');
    setIsEditingTitle(false);
    setIsEditingNotes(false);
  }, [track.id, track.title, track.version_notes]);

  // Focus title input when editing starts
  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Version type badge colors
  const getTypeBadgeColor = (type?: string | null) => {
    if (!type) return { bg: designTokens.colors.surface.tertiary, text: designTokens.colors.text.muted };
    const lowerType = type.toLowerCase();
    if (lowerType.includes('demo')) return { bg: '#FFF3E0', text: '#E65100' };
    if (lowerType.includes('rough') || lowerType.includes('working')) return { bg: '#E3F2FD', text: '#1565C0' };
    if (lowerType.includes('final') || lowerType.includes('master')) return { bg: '#E8F5E9', text: '#2E7D32' };
    if (lowerType.includes('live')) return { bg: '#FCE4EC', text: '#C2185B' };
    if (lowerType.includes('remix') || lowerType.includes('acoustic')) return { bg: '#F3E5F5', text: '#7B1FA2' };
    return { bg: designTokens.colors.surface.tertiary, text: designTokens.colors.text.secondary };
  };

  const typeBadgeColors = getTypeBadgeColor(track.version_type);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header with back button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing.sm,
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          backgroundColor: designTokens.colors.surface.secondary,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.xs,
            padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: designTokens.borderRadius.sm,
            color: designTokens.colors.primary.blue,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          Comments
        </button>
      </div>

      {/* Track Title */}
      <div
        style={{
          padding: designTokens.spacing.md,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setTitleValue(track.title);
                  setIsEditingTitle(false);
                }
              }}
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
              }}
            />
          ) : (
            <>
              <h3
                style={{
                  flex: 1,
                  margin: 0,
                  fontSize: designTokens.typography.fontSizes.h4,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.text.primary,
                }}
              >
                {track.title}
              </h3>
              {canEdit && onUpdateTitle && (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    padding: designTokens.spacing.xs,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: designTokens.colors.text.muted,
                    cursor: 'pointer',
                  }}
                  title="Edit title"
                >
                  <Pencil size={14} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            marginTop: designTokens.spacing.sm,
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.text.muted,
            flexWrap: 'wrap',
          }}
        >
          {track.uploader_name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} />
              {track.uploader_name}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {formatDate(track.created_at)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {formatDuration(track.duration_seconds)}
          </span>
        </div>

        {/* Version Type */}
        <div style={{ marginTop: designTokens.spacing.sm }}>
          {canEdit && onVersionTypeChange ? (
            <VersionTypeSelector
              value={track.version_type || null}
              types={versionTypes}
              onChange={onVersionTypeChange}
              onCreateType={onCreateVersionType}
              compact
              placeholder="Add type..."
            />
          ) : track.version_type ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: `2px ${designTokens.spacing.xs}`,
                backgroundColor: typeBadgeColors.bg,
                color: typeBadgeColors.text,
                borderRadius: designTokens.borderRadius.sm,
                fontSize: designTokens.typography.fontSizes.caption,
                fontWeight: designTokens.typography.fontWeights.medium,
                textTransform: 'capitalize',
              }}
            >
              <Tag size={10} />
              {track.version_type}
            </span>
          ) : null}
        </div>
      </div>

      {/* Waveform */}
      <div
        style={{
          padding: designTokens.spacing.md,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        }}
      >
        <WaveformVisualizer
          audioUrl={track.file_url}
          duration={track.duration_seconds || 0}
          currentTime={currentTime}
          isPlaying={isPlaying}
          comments={comments}
          cachedWaveformData={waveformData}
          onSeek={onSeek}
          onAddComment={handleAddCommentAtTimestamp}
          onCommentClick={onCommentClick}
          onWaveformGenerated={onWaveformGenerated}
          height={60}
          showCommentMarkers={true}
        />
      </div>

      {/* Version Notes */}
      {(track.version_notes || (canEdit && onUpdateVersionNotes)) && (
        <div
          style={{
            padding: designTokens.spacing.md,
            borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          }}
        >
          <div
            style={{
              fontSize: designTokens.typography.fontSizes.caption,
              fontWeight: designTokens.typography.fontWeights.medium,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.xs,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Version Notes
          </div>
          {isEditingNotes ? (
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleSaveNotes}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setNotesValue(track.version_notes || '');
                  setIsEditingNotes(false);
                }
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSaveNotes();
                }
              }}
              autoFocus
              placeholder="What changed in this version?"
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
                minHeight: '60px',
                boxSizing: 'border-box',
              }}
            />
          ) : track.version_notes ? (
            <div
              onClick={() => canEdit && onUpdateVersionNotes && setIsEditingNotes(true)}
              style={{
                padding: designTokens.spacing.sm,
                backgroundColor: designTokens.colors.surface.tertiary,
                borderRadius: designTokens.borderRadius.sm,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.text.secondary,
                fontStyle: 'italic',
                cursor: canEdit && onUpdateVersionNotes ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'flex-start',
                gap: designTokens.spacing.sm,
              }}
              title={canEdit && onUpdateVersionNotes ? 'Click to edit' : undefined}
            >
              <span style={{ flex: 1 }}>"{track.version_notes}"</span>
              {canEdit && onUpdateVersionNotes && (
                <Pencil size={12} style={{ opacity: 0.5, flexShrink: 0, marginTop: '2px' }} />
              )}
            </div>
          ) : canEdit && onUpdateVersionNotes ? (
            <button
              onClick={() => setIsEditingNotes(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.text.muted,
                backgroundColor: 'transparent',
                border: `1px dashed ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.sm,
                cursor: 'pointer',
              }}
            >
              <Pencil size={12} />
              Add version notes...
            </button>
          ) : null}
        </div>
      )}

      {/* Comments Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div
          style={{
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
            fontSize: designTokens.typography.fontSizes.caption,
            fontWeight: designTokens.typography.fontWeights.medium,
            color: designTokens.colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: `1px solid ${designTokens.colors.borders.default}`,
          }}
        >
          Track Comments ({comments.length})
        </div>

        {/* Comment List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: designTokens.spacing.sm }}>
          <TimestampedCommentList
            comments={comments}
            currentTime={currentTime}
            duration={track.duration_seconds || 0}
            onCommentClick={onCommentClick}
            currentUserId={currentUserId}
            emptyMessage="No comments on this track yet."
            showTrackContext={false}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
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
                  minHeight: '40px',
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
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackDetailInline;
