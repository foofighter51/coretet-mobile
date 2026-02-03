import React, { useState } from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import type { DragTrackData } from './DraggableTrack';

export interface WorkDropZoneProps {
  /** ID of the work this drop zone represents */
  workId: string;
  /** Called when tracks are dropped onto this work */
  onTrackDrop: (trackData: DragTrackData, workId: string) => void;
  /** Children to render (the Work item) */
  children: React.ReactNode;
  /** Whether drag is currently active (to show drop affordance) */
  active?: boolean;
}

/**
 * WorkDropZone - Wraps Work items to make them drop targets for tracks
 *
 * Uses HTML5 Drag and Drop API to accept tracks dragged from Set Lists.
 * Shows visual feedback when a valid drag is hovering over the zone.
 */
export const WorkDropZone: React.FC<WorkDropZoneProps> = ({
  workId,
  onTrackDrop,
  children,
  active = true,
}) => {
  const designTokens = useDesignTokens();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!active) return;

    // Check if the drag contains track data
    const types = e.dataTransfer.types;
    if (types.includes('application/json') || types.includes('text/plain')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only reset if we're actually leaving this element (not entering a child)
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
        onTrackDrop(trackData, workId);
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
        borderRadius: designTokens.borderRadius.sm,
        transition: 'all 0.15s ease',
        backgroundColor: isDragOver
          ? `${designTokens.colors.primary.blue}15`
          : 'transparent',
        outline: isDragOver
          ? `2px dashed ${designTokens.colors.primary.blue}`
          : 'none',
        outlineOffset: '-2px',
      }}
    >
      {children}
    </div>
  );
};

export default WorkDropZone;
