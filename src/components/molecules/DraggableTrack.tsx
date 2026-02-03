import React, { useRef, useState } from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { GripVertical } from 'lucide-react';

export interface DragTrackData {
  trackId: string;
  trackTitle: string;
  sourceType: 'work' | 'playlist' | 'library';
  sourceId?: string;
  /** Array of all selected track IDs for multi-select drag */
  trackIds?: string[];
  /** Total count of tracks being dragged */
  trackCount?: number;
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
  /** Whether this track is currently selected in multi-select mode */
  isSelected?: boolean;
  /** All currently selected track IDs (for multi-select drag) */
  selectedTrackIds?: string[];
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
  isSelected = false,
  selectedTrackIds = [],
}) => {
  const designTokens = useDesignTokens();
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enabled) {
      e.preventDefault();
      return;
    }

    // Build drag data - include all selected tracks if this track is selected
    const isMultiSelect = isSelected && selectedTrackIds.length > 1;
    const dragPayload: DragTrackData = isMultiSelect
      ? {
          ...trackData,
          trackIds: selectedTrackIds,
          trackCount: selectedTrackIds.length,
        }
      : trackData;

    // Set the drag data
    e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
    e.dataTransfer.setData('text/plain',
      isMultiSelect ? `${selectedTrackIds.length} tracks` : trackData.trackTitle
    );
    e.dataTransfer.effectAllowed = 'copy';

    // Create custom drag ghost for multi-select
    if (isMultiSelect) {
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        background: ${designTokens.colors.primary.blue};
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-family: ${designTokens.typography.fontFamily};
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      ghost.innerHTML = `<span style="font-size: 16px;">&#9835;</span> ${selectedTrackIds.length} tracks`;
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 60, 20);
      // Clean up ghost element after drag starts
      setTimeout(() => document.body.removeChild(ghost), 0);
    } else if (dragRef.current) {
      // Default: use the element itself
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
