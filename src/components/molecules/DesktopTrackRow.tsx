import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ThumbsUp, Heart, MoreVertical, Trash2, MessageCircle, Folder, Tag } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { VersionTypeSelector, VersionType } from './VersionTypeSelector';
import { getTrackGridTemplate } from './TrackListHeader';

interface DesktopTrackRowProps {
  track: {
    id: string;
    title: string;
    duration_seconds?: number;
    folder_path?: string;
    version_type?: string | null;
  };
  isPlaying: boolean;
  currentRating?: 'liked' | 'loved' | null;
  aggregatedRatings?: {
    liked: number;
    loved: number;
  };
  hasComments?: boolean;
  hasUnreadComments?: boolean;
  /** Available version types for the selector */
  versionTypes?: VersionType[];
  onPlayPause: () => void;
  onRate: (rating: 'liked' | 'loved') => void;
  onDelete?: () => void;
  onClick?: () => void;
  isDeleting?: boolean;
  /** Called when version type changes */
  onVersionTypeChange?: (versionType: string | null) => void;
  /** Called when creating a custom version type */
  onCreateVersionType?: (name: string) => Promise<void>;
}

export const DesktopTrackRow: React.FC<DesktopTrackRowProps> = ({
  track,
  isPlaying,
  currentRating,
  aggregatedRatings,
  hasComments,
  hasUnreadComments,
  versionTypes = [],
  onPlayPause,
  onRate,
  onDelete,
  onClick,
  isDeleting = false,
  onVersionTypeChange,
  onCreateVersionType,
}) => {
  const designTokens = useDesignTokens();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRowClick = () => {
    if (!showMenu && !showDeleteConfirm) {
      onClick?.();
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 140, // 140px is the menu width
      });
    }
    setShowMenu(!showMenu);
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
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

  // Close menu when clicking outside
  const handleRowMouseLeave = () => {
    setIsHovered(false);
    setShowMenu(false);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: getTrackGridTemplate(),
        alignItems: 'center',
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
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
      onMouseLeave={handleRowMouseLeave}
      onClick={handleRowClick}
    >
      {/* Column 1: Play/Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
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

      {/* Column 2: Title + Folder */}
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div
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
        </div>
        {track.folder_path && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.text.tertiary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Folder size={10} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.folder_path}</span>
          </div>
        )}
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

      {/* Column 5: Rating Badges */}
      <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
        {aggregatedRatings?.loved && aggregatedRatings.loved > 0 ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: `2px ${designTokens.spacing.xs}`,
              backgroundColor: designTokens.colors.ratings.loved.bgLight,
              borderRadius: '10px',
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.system.error,
            }}
          >
            <Heart size={10} fill="currentColor" />
            {aggregatedRatings.loved}
          </span>
        ) : null}
        {aggregatedRatings?.liked && aggregatedRatings.liked > 0 ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: `2px ${designTokens.spacing.xs}`,
              backgroundColor: designTokens.colors.ratings.liked.bgLight,
              borderRadius: '10px',
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.system.success,
            }}
          >
            <ThumbsUp size={10} fill="currentColor" />
            {aggregatedRatings.liked}
          </span>
        ) : null}
        {(!aggregatedRatings || (aggregatedRatings.liked === 0 && aggregatedRatings.loved === 0)) && (
          <span style={{ color: designTokens.colors.text.muted, fontSize: designTokens.typography.fontSizes.caption }}>
            —
          </span>
        )}
      </div>

      {/* Column 6: Comments Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {hasComments ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: hasUnreadComments
                ? designTokens.colors.primary.blue
                : designTokens.colors.text.tertiary,
            }}
          >
            <MessageCircle size={16} />
          </div>
        ) : (
          <span style={{ color: designTokens.colors.text.muted, fontSize: designTokens.typography.fontSizes.caption }}>
            —
          </span>
        )}
      </div>

      {/* Column 7: Actions (Rate buttons + More menu) */}
      <div
        style={{
          display: 'flex',
          gap: designTokens.spacing.xs,
          justifyContent: 'flex-end',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!showDeleteConfirm ? (
          <>
            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRate('liked');
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: designTokens.borderRadius.sm,
                border: currentRating === 'liked'
                  ? 'none'
                  : `1px solid ${designTokens.colors.borders.default}`,
                backgroundColor: currentRating === 'liked'
                  ? designTokens.colors.ratings.liked.bg
                  : 'transparent',
                color: currentRating === 'liked'
                  ? designTokens.colors.neutral.white
                  : designTokens.colors.text.tertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Like"
            >
              <ThumbsUp size={12} fill={currentRating === 'liked' ? 'currentColor' : 'none'} />
            </button>

            {/* Love Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRate('loved');
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: designTokens.borderRadius.sm,
                border: currentRating === 'loved'
                  ? 'none'
                  : `1px solid ${designTokens.colors.borders.default}`,
                backgroundColor: currentRating === 'loved'
                  ? designTokens.colors.ratings.loved.bg
                  : 'transparent',
                color: currentRating === 'loved'
                  ? designTokens.colors.neutral.white
                  : designTokens.colors.text.tertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Love"
            >
              <Heart size={12} fill={currentRating === 'loved' ? 'currentColor' : 'none'} />
            </button>

            {/* More Menu (three dots) */}
            {onDelete && (
              <>
                <button
                  ref={menuButtonRef}
                  onClick={handleMenuToggle}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: designTokens.borderRadius.sm,
                    border: `1px solid ${designTokens.colors.borders.default}`,
                    backgroundColor: showMenu
                      ? designTokens.colors.surface.secondary
                      : 'transparent',
                    color: designTokens.colors.text.tertiary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="More options"
                >
                  <MoreVertical size={12} />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div
                    style={{
                      position: 'fixed',
                      top: menuPosition.top,
                      left: menuPosition.left,
                      backgroundColor: designTokens.colors.surface.primary,
                      borderRadius: designTokens.borderRadius.sm,
                      boxShadow: designTokens.shadows.elevated,
                      border: `1px solid ${designTokens.colors.borders.default}`,
                      zIndex: 9999,
                      minWidth: '140px',
                    }}
                  >
                    <button
                      onClick={handleDeleteClick}
                      style={{
                        width: '100%',
                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.sm,
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: designTokens.colors.system.error,
                        cursor: 'pointer',
                        fontSize: designTokens.typography.fontSizes.body,
                        fontFamily: designTokens.typography.fontFamily,
                        textAlign: 'left',
                      }}
                    >
                      <Trash2 size={16} />
                      Delete track
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Delete Confirmation - inline in actions column */
          <div
            style={{
              display: 'flex',
              gap: designTokens.spacing.xs,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.text.secondary,
                whiteSpace: 'nowrap',
              }}
            >
              Delete?
            </span>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              style={{
                padding: `2px ${designTokens.spacing.xs}`,
                borderRadius: designTokens.borderRadius.sm,
                border: 'none',
                backgroundColor: designTokens.colors.system.error,
                color: designTokens.colors.neutral.white,
                fontSize: designTokens.typography.fontSizes.caption,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.7 : 1,
              }}
            >
              {isDeleting ? '...' : 'Yes'}
            </button>
            <button
              onClick={handleCancelDelete}
              style={{
                padding: `2px ${designTokens.spacing.xs}`,
                borderRadius: designTokens.borderRadius.sm,
                border: `1px solid ${designTokens.colors.borders.default}`,
                backgroundColor: 'transparent',
                color: designTokens.colors.text.primary,
                fontSize: designTokens.typography.fontSizes.caption,
                cursor: 'pointer',
              }}
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
