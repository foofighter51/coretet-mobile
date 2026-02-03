import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Clock, User, Pencil, Trash2, X, Check } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { formatTimestamp } from '../../utils/waveformGenerator';

export interface TimestampedComment {
  id: string;
  timestamp_seconds: number | null;
  user_name: string;
  content: string;
  created_at: string;
  user_id?: string;
  avatar_url?: string | null;
  // Track context for feed mode
  track_id?: string;
  track_title?: string;
  version_type?: string | null;
}

export interface TimestampedCommentListProps {
  /** Array of comments to display */
  comments: TimestampedComment[];
  /** Current playback time in seconds */
  currentTime: number;
  /** Duration of the audio in seconds */
  duration: number;
  /** Called when user clicks on a comment to seek */
  onCommentClick?: (comment: TimestampedComment) => void;
  /** Called when user wants to reply to a comment */
  onReply?: (commentId: string) => void;
  /** Current user ID (for highlighting own comments) */
  currentUserId?: string;
  /** ID of the currently highlighted comment */
  highlightedCommentId?: string | null;
  /** Whether to auto-scroll to the current comment during playback */
  autoScroll?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: number | string;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether to show track context (for feed mode) */
  showTrackContext?: boolean;
  /** Called when user edits a comment */
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  /** Called when user deletes a comment */
  onDeleteComment?: (commentId: string) => Promise<void>;
  /** When true, skip internal sorting and use comments in received order */
  skipSort?: boolean;
}

/**
 * TimestampedCommentList - Displays comments with optional timestamps
 *
 * Features:
 * - Comments sorted by timestamp (ascending)
 * - Highlight comment when playhead is near its timestamp
 * - Click comment to seek to timestamp
 * - Display timestamp as clickable badge
 * - Auto-scroll to keep current comment visible
 */
export const TimestampedCommentList: React.FC<TimestampedCommentListProps> = ({
  comments,
  currentTime,
  duration,
  onCommentClick,
  onReply,
  currentUserId,
  highlightedCommentId,
  autoScroll = true,
  maxHeight = 300,
  emptyMessage = 'No comments yet',
  showTrackContext = false,
  onEditComment,
  onDeleteComment,
  skipSort = false,
}) => {
  const designTokens = useDesignTokens();
  const listRef = useRef<HTMLDivElement>(null);
  const activeCommentRef = useRef<HTMLDivElement>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle starting to edit a comment
  const handleStartEdit = useCallback((comment: TimestampedComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  }, []);

  // Handle saving an edit
  const handleSaveEdit = useCallback(async () => {
    if (!editingCommentId || !editContent.trim() || !onEditComment) return;
    setIsSubmitting(true);
    try {
      await onEditComment(editingCommentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent('');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingCommentId, editContent, onEditComment]);

  // Handle canceling an edit
  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditContent('');
  }, []);

  // Handle deleting a comment
  const handleDelete = useCallback(async (commentId: string) => {
    if (!onDeleteComment) return;
    setIsSubmitting(true);
    try {
      await onDeleteComment(commentId);
      setDeleteConfirmId(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [onDeleteComment]);

  // Sort comments by timestamp (null timestamps go at the end)
  // When skipSort is true, use comments in received order (parent handles sorting)
  const sortedComments = useMemo(() => {
    if (skipSort) {
      return comments;
    }
    return [...comments].sort((a, b) => {
      if (a.timestamp_seconds === null && b.timestamp_seconds === null) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (a.timestamp_seconds === null) return 1;
      if (b.timestamp_seconds === null) return -1;
      return a.timestamp_seconds - b.timestamp_seconds;
    });
  }, [comments, skipSort]);

  // Find the comment that should be active based on current time
  const activeCommentId = useMemo(() => {
    if (highlightedCommentId) return highlightedCommentId;

    // Find the most recent comment that's before or at the current time
    const timestampedComments = sortedComments.filter(c => c.timestamp_seconds !== null);
    let activeComment: TimestampedComment | null = null;

    for (const comment of timestampedComments) {
      if (comment.timestamp_seconds! <= currentTime + 2) { // 2 second window
        activeComment = comment;
      } else {
        break;
      }
    }

    // Only highlight if we're within 2 seconds of the timestamp
    if (activeComment && Math.abs(activeComment.timestamp_seconds! - currentTime) <= 2) {
      return activeComment.id;
    }

    return null;
  }, [sortedComments, currentTime, highlightedCommentId]);

  // Auto-scroll to active comment
  useEffect(() => {
    if (autoScroll && activeCommentRef.current && listRef.current) {
      activeCommentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeCommentId, autoScroll]);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (sortedComments.length === 0) {
    return (
      <div
        style={{
          padding: designTokens.spacing.xl,
          textAlign: 'center',
          color: designTokens.colors.text.muted,
          fontSize: designTokens.typography.fontSizes.body,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      style={{
        maxHeight,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.sm,
      }}
    >
      {sortedComments.map(comment => {
        const isActive = comment.id === activeCommentId;
        const isOwnComment = comment.user_id === currentUserId;
        const hasTimestamp = comment.timestamp_seconds !== null;

        return (
          <div
            key={comment.id}
            ref={isActive ? activeCommentRef : undefined}
            onClick={() => hasTimestamp && onCommentClick?.(comment)}
            style={{
              padding: designTokens.spacing.md,
              backgroundColor: isActive
                ? `${designTokens.colors.accent.coral}15`
                : designTokens.colors.surface.secondary,
              borderRadius: designTokens.borderRadius.md,
              borderLeft: isActive
                ? `3px solid ${designTokens.colors.accent.coral}`
                : '3px solid transparent',
              cursor: hasTimestamp ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Header: User + Timestamp */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: designTokens.spacing.xs,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.xs,
                }}
              >
                {/* Avatar or icon */}
                {comment.avatar_url ? (
                  <img
                    src={comment.avatar_url}
                    alt={comment.user_name}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: designTokens.colors.primary.blueLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={14} color={designTokens.colors.primary.blue} />
                  </div>
                )}

                <span
                  style={{
                    fontWeight: designTokens.typography.fontWeights.medium,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: isOwnComment
                      ? designTokens.colors.primary.blue
                      : designTokens.colors.text.primary,
                  }}
                >
                  {comment.user_name}
                  {isOwnComment && (
                    <span style={{ fontWeight: 'normal', color: designTokens.colors.text.muted }}> (you)</span>
                  )}
                </span>

                {/* Track context for feed mode */}
                {showTrackContext && comment.track_title && (
                  <span
                    style={{
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.text.muted,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ color: designTokens.colors.text.tertiary }}>•</span>
                    on "{comment.track_title}"
                    {comment.version_type && (
                      <span
                        style={{
                          padding: `1px 6px`,
                          fontSize: designTokens.typography.fontSizes.label,
                          backgroundColor: designTokens.colors.surface.tertiary,
                          borderRadius: designTokens.borderRadius.sm,
                          color: designTokens.colors.text.secondary,
                          textTransform: 'capitalize',
                        }}
                      >
                        {comment.version_type}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Timestamp badge */}
              {hasTimestamp && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: `2px ${designTokens.spacing.xs}`,
                    backgroundColor: isActive
                      ? designTokens.colors.accent.coral
                      : designTokens.colors.surface.primary,
                    borderRadius: designTokens.borderRadius.sm,
                    color: isActive
                      ? designTokens.colors.neutral.white
                      : designTokens.colors.accent.coral,
                    fontSize: designTokens.typography.fontSizes.caption,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    fontFamily: 'monospace',
                  }}
                  title="Click to seek to this timestamp"
                >
                  <Clock size={10} />
                  {formatTimestamp(comment.timestamp_seconds!)}
                </div>
              )}
            </div>

            {/* Comment content or edit mode */}
            {editingCommentId === comment.id ? (
              <div style={{ marginTop: designTokens.spacing.xs }}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: designTokens.spacing.sm,
                    fontSize: designTokens.typography.fontSizes.body,
                    color: designTokens.colors.text.primary,
                    backgroundColor: designTokens.colors.surface.primary,
                    border: `1px solid ${designTokens.colors.primary.blue}`,
                    borderRadius: designTokens.borderRadius.sm,
                    resize: 'vertical',
                    minHeight: '60px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSaveEdit();
                    }
                    if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: designTokens.spacing.xs, marginTop: designTokens.spacing.xs }}>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSubmitting || !editContent.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: designTokens.colors.primary.blue,
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.neutral.white,
                      fontSize: designTokens.typography.fontSizes.caption,
                      cursor: isSubmitting || !editContent.trim() ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || !editContent.trim() ? 0.5 : 1,
                    }}
                  >
                    <Check size={12} />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: 'transparent',
                      border: `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.text.secondary,
                      fontSize: designTokens.typography.fontSizes.caption,
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : deleteConfirmId === comment.id ? (
              <div style={{ marginTop: designTokens.spacing.xs }}>
                <p style={{
                  margin: 0,
                  marginBottom: designTokens.spacing.xs,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.system.error,
                }}>
                  Delete this comment?
                </p>
                <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isSubmitting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: designTokens.colors.system.error,
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.neutral.white,
                      fontSize: designTokens.typography.fontSizes.caption,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={isSubmitting}
                    style={{
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: 'transparent',
                      border: `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.text.secondary,
                      fontSize: designTokens.typography.fontSizes.caption,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p
                  style={{
                    margin: 0,
                    fontSize: designTokens.typography.fontSizes.body,
                    color: designTokens.colors.text.primary,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {comment.content}
                </p>

                {/* Footer: Relative time + Edit/Delete buttons */}
                <div
                  style={{
                    marginTop: designTokens.spacing.xs,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: designTokens.typography.fontSizes.caption,
                    color: designTokens.colors.text.muted,
                  }}
                >
                  <span>{formatRelativeTime(comment.created_at)}</span>

                  {/* Edit/Delete buttons for own comments */}
                  {isOwnComment && (onEditComment || onDeleteComment) && (
                    <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
                      {onEditComment && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(comment);
                          }}
                          style={{
                            padding: 4,
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: designTokens.borderRadius.sm,
                            color: designTokens.colors.text.muted,
                            cursor: 'pointer',
                          }}
                          title="Edit comment"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      {onDeleteComment && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(comment.id);
                          }}
                          style={{
                            padding: 4,
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: designTokens.borderRadius.sm,
                            color: designTokens.colors.text.muted,
                            cursor: 'pointer',
                          }}
                          title="Delete comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimestampedCommentList;
