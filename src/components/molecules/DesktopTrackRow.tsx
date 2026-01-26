import React, { useState } from 'react';
import { Play, Pause, ThumbsUp, Heart, Trash2, MessageCircle, Folder } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

interface DesktopTrackRowProps {
  track: {
    id: string;
    title: string;
    duration_seconds?: number;
    folder_path?: string;
  };
  isPlaying: boolean;
  currentRating?: 'liked' | 'loved' | null;
  aggregatedRatings?: {
    liked: number;
    loved: number;
  };
  hasComments?: boolean;
  hasUnreadComments?: boolean;
  onPlayPause: () => void;
  onRate: (rating: 'liked' | 'loved') => void;
  onDelete?: () => void;
  onClick?: () => void;
  isDeleting?: boolean;
}

export const DesktopTrackRow: React.FC<DesktopTrackRowProps> = ({
  track,
  isPlaying,
  currentRating,
  aggregatedRatings,
  hasComments,
  hasUnreadComments,
  onPlayPause,
  onRate,
  onDelete,
  onClick,
  isDeleting = false,
}) => {
  const designTokens = useDesignTokens();
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleRowClick = () => {
    if (!showDeleteConfirm) {
      onClick?.();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
        backgroundColor: isHovered
          ? designTokens.colors.surface.hover
          : designTokens.colors.surface.primary,
        borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        opacity: isDeleting ? 0.5 : 1,
        fontFamily: designTokens.typography.fontFamily,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!showDeleteConfirm) setShowDeleteConfirm(false);
      }}
      onClick={handleRowClick}
    >
      {/* Play/Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        style={{
          width: '40px',
          height: '40px',
          minWidth: '40px',
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
          marginRight: designTokens.spacing.md,
          transition: 'all 0.15s ease',
        }}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
      </button>

      {/* Track Info */}
      <div style={{ flex: 1, minWidth: 0, marginRight: designTokens.spacing.md }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.sm,
          }}
        >
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
          {track.folder_path && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.text.tertiary,
              }}
            >
              <Folder size={12} />
              {track.folder_path}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.secondary,
          }}
        >
          {formatDuration(track.duration_seconds)}
        </span>
      </div>

      {/* Rating Badges */}
      {aggregatedRatings && (aggregatedRatings.liked > 0 || aggregatedRatings.loved > 0) && (
        <div
          style={{
            display: 'flex',
            gap: designTokens.spacing.sm,
            marginRight: designTokens.spacing.md,
          }}
        >
          {aggregatedRatings.loved > 0 && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                backgroundColor: designTokens.colors.ratings.loved.bgLight,
                borderRadius: '12px',
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.system.error,
              }}
            >
              <Heart size={12} fill="currentColor" />
              {aggregatedRatings.loved}
            </span>
          )}
          {aggregatedRatings.liked > 0 && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                backgroundColor: designTokens.colors.ratings.liked.bgLight,
                borderRadius: '12px',
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.system.success,
              }}
            >
              <ThumbsUp size={12} fill="currentColor" />
              {aggregatedRatings.liked}
            </span>
          )}
        </div>
      )}

      {/* Comments Indicator */}
      {hasComments && (
        <div
          style={{
            marginRight: designTokens.spacing.md,
            color: hasUnreadComments
              ? designTokens.colors.primary.blue
              : designTokens.colors.text.tertiary,
          }}
        >
          <MessageCircle size={18} />
        </div>
      )}

      {/* Action Buttons - Show on Hover */}
      {isHovered && !showDeleteConfirm && (
        <div
          style={{
            display: 'flex',
            gap: designTokens.spacing.xs,
            marginLeft: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rate Liked */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRate('liked');
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: designTokens.borderRadius.sm,
              border: 'none',
              backgroundColor: currentRating === 'liked'
                ? designTokens.colors.ratings.liked.bg
                : designTokens.colors.surface.secondary,
              color: currentRating === 'liked'
                ? designTokens.colors.neutral.white
                : designTokens.colors.text.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Like"
          >
            <ThumbsUp size={16} />
          </button>

          {/* Rate Loved */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRate('loved');
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: designTokens.borderRadius.sm,
              border: 'none',
              backgroundColor: currentRating === 'loved'
                ? designTokens.colors.ratings.loved.bg
                : designTokens.colors.surface.secondary,
              color: currentRating === 'loved'
                ? designTokens.colors.neutral.white
                : designTokens.colors.text.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Love"
          >
            <Heart size={16} />
          </button>

          {/* Delete */}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: designTokens.borderRadius.sm,
                border: 'none',
                backgroundColor: designTokens.colors.surface.secondary,
                color: designTokens.colors.text.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Delete track"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            display: 'flex',
            gap: designTokens.spacing.sm,
            alignItems: 'center',
            marginLeft: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
            }}
          >
            Delete permanently?
          </span>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            style={{
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
              borderRadius: designTokens.borderRadius.sm,
              border: 'none',
              backgroundColor: designTokens.colors.system.error,
              color: designTokens.colors.neutral.white,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.medium,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={handleCancelDelete}
            style={{
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
              borderRadius: designTokens.borderRadius.sm,
              border: `1px solid ${designTokens.colors.borders.default}`,
              backgroundColor: designTokens.colors.surface.primary,
              color: designTokens.colors.text.primary,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
