import React, { useState, useEffect, useRef } from 'react';
import { X, Headphones, ThumbsUp, Heart } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db } from '../../../lib/supabase';
import { DialogModal } from '../ui/DialogModal';
import { InlineSpinner } from '../atoms/InlineSpinner';

interface TrackDetailModalProps {
  track: any;
  onClose: () => void;
  currentUser: any;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTrack: any;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({
  track,
  onClose,
  currentUser,
  audioRef,
  currentTrack,
}) => {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<number | null>(null);

  // Ref for iOS keyboard handling
  const commentInputRef = useRef<HTMLInputElement>(null);

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
    <DialogModal
      isOpen={true}
      onClose={onClose}
      title={track.title}
      subtitle={track.duration_seconds ?
        `${Math.floor(track.duration_seconds / 60)}:${String(Math.floor(track.duration_seconds % 60)).padStart(2, '0')}`
        : 'Unknown'}
      size="md"
      hasKeyboardInput={true}
      keyboardInputRef={commentInputRef}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xl }}>
        {/* Ratings Section */}
        <div>
          <h3 style={{
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.text.primary,
            marginBottom: designTokens.spacing.md,
            marginTop: 0,
          }}>
            Ratings
          </h3>

          {loadingRatings ? (
            <InlineSpinner size={24} message="Loading ratings..." />
          ) : ratings.length === 0 ? (
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              textAlign: 'center',
              padding: designTokens.spacing.xl,
              margin: 0,
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
            marginTop: 0,
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
                ref={commentInputRef}
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
            <InlineSpinner size={24} message="Loading comments..." />
          ) : comments.length === 0 ? (
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              textAlign: 'center',
              padding: designTokens.spacing.xl,
              margin: 0,
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
    </DialogModal>
  );
};
