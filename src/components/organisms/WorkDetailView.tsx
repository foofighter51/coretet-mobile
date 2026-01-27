import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Star, Clock, Calendar, User, ChevronRight, Plus, MoreVertical, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

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
}

interface WorkDetailViewProps {
  work: {
    id: string;
    name: string;
    hero_track_id?: string | null;
    created_at: string;
  };
  versions: TrackVersion[];
  currentTrackId?: string | null;
  isPlaying?: boolean;
  onPlayTrack: (track: TrackVersion) => void;
  onSetHero?: (trackId: string) => void;
  onAddVersion?: () => void;
  onTrackClick?: (track: TrackVersion) => void;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
  onBack?: () => void;
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
  onTrackClick,
  onRename,
  onDelete,
  onBack,
}) => {
  const designTokens = useDesignTokens();
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(work.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

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

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== work.name && onRename) {
      onRename(renameValue.trim());
    }
    setIsRenaming(false);
  };

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

      {/* Version List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: designTokens.spacing.md }}>
        {/* Hero Version (if exists) */}
        {heroVersion && (
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                marginBottom: designTokens.spacing.sm,
              }}
            >
              <Star size={14} color={designTokens.colors.accent.gold} fill={designTokens.colors.accent.gold} />
              <span
                style={{
                  fontSize: designTokens.typography.fontSizes.caption,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: '#F5C542',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Featured Version
              </span>
            </div>
            <VersionRow
              track={heroVersion}
              isHero
              isCurrentTrack={currentTrackId === heroVersion.id}
              isPlaying={isPlaying && currentTrackId === heroVersion.id}
              isHovered={hoveredTrackId === heroVersion.id}
              onMouseEnter={() => setHoveredTrackId(heroVersion.id)}
              onMouseLeave={() => setHoveredTrackId(null)}
              onPlay={() => onPlayTrack(heroVersion)}
              onClick={() => onTrackClick?.(heroVersion)}
              designTokens={designTokens}
              formatDuration={formatDuration}
              formatDate={formatDate}
            />
          </div>
        )}

        {/* Other Versions */}
        {otherVersions.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: designTokens.spacing.sm,
              }}
            >
              <span
                style={{
                  fontSize: designTokens.typography.fontSizes.caption,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                All Versions
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {otherVersions.map((track) => (
                <VersionRow
                  key={track.id}
                  track={track}
                  isCurrentTrack={currentTrackId === track.id}
                  isPlaying={isPlaying && currentTrackId === track.id}
                  isHovered={hoveredTrackId === track.id}
                  onMouseEnter={() => setHoveredTrackId(track.id)}
                  onMouseLeave={() => setHoveredTrackId(null)}
                  onPlay={() => onPlayTrack(track)}
                  onClick={() => onTrackClick?.(track)}
                  onSetHero={onSetHero ? () => onSetHero(track.id) : undefined}
                  designTokens={designTokens}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {versions.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: designTokens.spacing.xl,
              color: designTokens.colors.text.muted,
            }}
          >
            <p style={{ margin: 0, marginBottom: designTokens.spacing.md }}>
              No versions yet. Add your first version of this song.
            </p>
            {onAddVersion && (
              <button
                onClick={onAddVersion}
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
                <Plus size={16} />
                Add Version
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Version Button (when versions exist) */}
      {onAddVersion && versions.length > 0 && (
        <div
          style={{
            padding: designTokens.spacing.md,
            borderTop: `1px solid ${designTokens.colors.borders.default}`,
          }}
        >
          <button
            onClick={onAddVersion}
            style={{
              width: '100%',
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
            Add New Version
          </button>
        </div>
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
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPlay: () => void;
  onClick?: () => void;
  onSetHero?: () => void;
  designTokens: ReturnType<typeof useDesignTokens>;
  formatDuration: (seconds?: number) => string;
  formatDate: (dateString: string) => string;
}

const VersionRow: React.FC<VersionRowProps> = ({
  track,
  isHero,
  isCurrentTrack,
  isPlaying,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onPlay,
  onClick,
  onSetHero,
  designTokens,
  formatDuration,
  formatDate,
}) => {
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
