import React from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';

// Shared column widths - export for use in DesktopTrackRow
// Optimized for ~1200px+ viewport with good spacing between columns
export const TRACK_COLUMNS = {
  play: '44px',
  title: 'minmax(180px, 1fr)',
  duration: '90px',
  type: '120px',
  rating: '100px',
  comments: '90px',
  actions: '130px',
} as const;

export const getTrackGridTemplate = () =>
  `${TRACK_COLUMNS.play} ${TRACK_COLUMNS.title} ${TRACK_COLUMNS.duration} ${TRACK_COLUMNS.type} ${TRACK_COLUMNS.rating} ${TRACK_COLUMNS.comments} ${TRACK_COLUMNS.actions}`;

interface TrackListHeaderProps {
  /** Hide certain columns if not needed */
  hideType?: boolean;
  hideComments?: boolean;
}

/**
 * TrackListHeader - Column labels for the track list
 *
 * Provides consistent column headers that align with DesktopTrackRow grid layout
 */
export const TrackListHeader: React.FC<TrackListHeaderProps> = ({
  hideType = false,
  hideComments = false,
}) => {
  const designTokens = useDesignTokens();

  const headerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getTrackGridTemplate(),
    alignItems: 'center',
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
    borderBottom: `1px solid ${designTokens.colors.borders.default}`,
    backgroundColor: designTokens.colors.surface.secondary,
    fontSize: designTokens.typography.fontSizes.caption,
    fontWeight: designTokens.typography.fontWeights.medium,
    color: designTokens.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const columnStyle: React.CSSProperties = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={headerStyle}>
      {/* Play column - no label */}
      <div />

      {/* Title */}
      <div style={columnStyle}>Title</div>

      {/* Duration */}
      <div style={columnStyle}>Duration</div>

      {/* Type */}
      <div style={{ ...columnStyle, opacity: hideType ? 0 : 1 }}>Type</div>

      {/* Rating */}
      <div style={columnStyle}>Rating</div>

      {/* Comments */}
      <div style={{ ...columnStyle, opacity: hideComments ? 0 : 1, textAlign: 'center' }}>
        Comments
      </div>

      {/* Actions - no label */}
      <div />
    </div>
  );
};

export default TrackListHeader;
