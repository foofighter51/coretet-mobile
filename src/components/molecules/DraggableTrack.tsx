import React, { useRef, useState } from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { GripVertical } from 'lucide-react';

export interface DragTrackData {
  trackId: string;
  trackTitle: string;
  sourceType: 'work' | 'playlist' | 'library';
  sourceId?: string;
}

export interface DraggableTrackProps {
  /** Track data to transfer on drag */
  trackData: DragTrackData;
  /** Whether dragging is enabled */
  enabled?: boolean;
  /** Show drag handle icon */
  showHandle?: boolean;
  /** Children to render */
  children: React.ReactNode;
  /** Called when drag starts */
  onDragStart?: () => void;
  /** Called when drag ends */
  onDragEnd?: () => void;
}

/**
 * DraggableTrack - Wrapper to make tracks draggable to playlists
 *
 * Uses HTML5 Drag and Drop API for cross-component dragging.
 * Transfers track data as JSON in the dataTransfer object.
 */
export const DraggableTrack: React.FC<DraggableTrackProps> = ({
  trackData,
  enabled = true,
  showHandle = false,
  children,
  onDragStart,
  onDragEnd,
}) => {
  const designTokens = useDesignTokens();
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enabled) {
      e.preventDefault();
      return;
    }

    // Set the drag data
    e.dataTransfer.setData('application/json', JSON.stringify(trackData));
    e.dataTransfer.setData('text/plain', trackData.trackTitle);
    e.dataTransfer.effectAllowed = 'copy';

    // Set drag image (optional custom ghost)
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragRef.current, rect.width / 2, 20);
    }

    setIsDragging(true);
    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={dragRef}
      draggable={enabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: enabled ? 'grab' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: showHandle ? designTokens.spacing.xs : 0,
      }}
    >
      {showHandle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: designTokens.spacing.xs,
            color: designTokens.colors.text.muted,
            cursor: 'grab',
          }}
        >
          <GripVertical size={14} />
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export interface PlaylistDropZoneProps {
  /** Playlist ID to drop tracks into */
  playlistId: string;
  /** Playlist name for display */
  playlistName: string;
  /** Called when a track is dropped */
  onTrackDrop: (trackData: DragTrackData, playlistId: string) => void;
  /** Children to render */
  children: React.ReactNode;
  /** Whether the drop zone is active */
  active?: boolean;
}

/**
 * PlaylistDropZone - Makes a playlist accept dropped tracks
 */
export const PlaylistDropZone: React.FC<PlaylistDropZoneProps> = ({
  playlistId,
  playlistName,
  onTrackDrop,
  children,
  active = true,
}) => {
  const designTokens = useDesignTokens();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!active) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only set false if we're leaving the element itself, not a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!active) return;

    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        const trackData: DragTrackData = JSON.parse(jsonData);
        onTrackDrop(trackData, playlistId);
      }
    } catch (error) {
      console.error('Failed to parse dropped track data:', error);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
      {/* Drop indicator overlay */}
      {isDragOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `${designTokens.colors.primary.blue}20`,
            border: `2px dashed ${designTokens.colors.primary.blue}`,
            borderRadius: designTokens.borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <span
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
              backgroundColor: designTokens.colors.primary.blue,
              color: designTokens.colors.neutral.white,
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.medium,
            }}
          >
            Drop to add to {playlistName}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Hook to detect if something is being dragged
 */
export const useDragState = () => {
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('drop', handleDragEnd);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  return isDragging;
};

export default DraggableTrack;
