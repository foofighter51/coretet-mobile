import React, { useState } from 'react';
import { ThumbsUp, Heart } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

export type RatingValue = 'liked' | 'loved' | null;

export interface CollaboratorRatings {
  liked: number;
  loved: number;
  /** Names of collaborators who rated (for tooltip) */
  userNames?: string[];
}

export interface CumulativeRatings {
  liked: number;
  loved: number;
}

export interface RatingSummaryProps {
  /** Current user's rating */
  personal: RatingValue;
  /** Aggregated ratings from collaborators */
  collaborators: CollaboratorRatings;
  /** Total cumulative ratings */
  cumulative: CumulativeRatings;
  /** Called when user changes their rating */
  onRate: (rating: RatingValue) => void;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Whether to show the band section */
  showBandSection?: boolean;
  /** Whether to show the cumulative section */
  showCumulativeSection?: boolean;
  /** Compact mode - shows less detail */
  compact?: boolean;
}

/**
 * RatingSummary - Displays personal, collaborator, and cumulative ratings
 *
 * Three-tier rating display:
 * 1. Personal: Current user's rating (interactive)
 * 2. Band: Collaborators' aggregated ratings
 * 3. Total: All ratings combined
 */
export const RatingSummary: React.FC<RatingSummaryProps> = ({
  personal,
  collaborators,
  cumulative,
  onRate,
  orientation = 'vertical',
  isLoading = false,
  showBandSection = true,
  showCumulativeSection = true,
  compact = false,
}) => {
  const designTokens = useDesignTokens();
  const [hoveredRating, setHoveredRating] = useState<RatingValue>(null);

  const totalCollaborators = collaborators.liked + collaborators.loved;

  const handleRatingClick = (rating: RatingValue) => {
    if (isLoading) return;
    // Toggle off if clicking the same rating
    if (personal === rating) {
      onRate(null);
    } else {
      onRate(rating);
    }
  };

  const RatingButton: React.FC<{
    rating: RatingValue;
    icon: React.ReactNode;
    activeColor: string;
    label?: string;
  }> = ({ rating, icon, activeColor, label }) => {
    const isActive = personal === rating;
    const isHovered = hoveredRating === rating;

    return (
      <button
        onClick={() => handleRatingClick(rating)}
        onMouseEnter={() => setHoveredRating(rating)}
        onMouseLeave={() => setHoveredRating(null)}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: designTokens.spacing.xs,
          padding: compact
            ? `${designTokens.spacing.xs} ${designTokens.spacing.sm}`
            : `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
          backgroundColor: isActive
            ? `${activeColor}20`
            : isHovered
              ? designTokens.colors.surface.secondary
              : 'transparent',
          border: `1px solid ${isActive ? activeColor : designTokens.colors.borders.subtle}`,
          borderRadius: designTokens.borderRadius.md,
          color: isActive ? activeColor : designTokens.colors.text.secondary,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.5 : 1,
          fontFamily: designTokens.typography.fontFamily,
          fontSize: designTokens.typography.fontSizes.bodySmall,
          fontWeight: isActive
            ? designTokens.typography.fontWeights.medium
            : designTokens.typography.fontWeights.regular,
        }}
        title={`Rate as ${rating}`}
      >
        {icon}
        {label && !compact && <span>{label}</span>}
      </button>
    );
  };

  const RatingCount: React.FC<{
    icon: React.ReactNode;
    count: number;
    color: string;
    label?: string;
  }> = ({ icon, count, color, label }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: count > 0 ? color : designTokens.colors.text.muted,
        fontSize: designTokens.typography.fontSizes.bodySmall,
      }}
      title={label}
    >
      {icon}
      <span style={{ fontWeight: designTokens.typography.fontWeights.medium }}>
        {count}
      </span>
    </div>
  );

  const containerStyle: React.CSSProperties = orientation === 'horizontal'
    ? {
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.lg,
        flexWrap: 'wrap',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.md,
      };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: designTokens.spacing.sm,
  };

  return (
    <div style={containerStyle}>
      {/* Personal Rating Section */}
      <div style={sectionStyle}>
        {!compact && (
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: designTokens.typography.fontWeights.medium,
            }}
          >
            Your Rating
          </span>
        )}
        <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
          <RatingButton
            rating="liked"
            icon={<ThumbsUp size={compact ? 16 : 18} fill={personal === 'liked' ? 'currentColor' : 'none'} />}
            activeColor={designTokens.colors.primary.blue}
            label="Like"
          />
          <RatingButton
            rating="loved"
            icon={<Heart size={compact ? 16 : 18} fill={personal === 'loved' ? 'currentColor' : 'none'} />}
            activeColor={designTokens.colors.accent.coral}
            label="Love"
          />
        </div>
      </div>

      {/* Band (Collaborators) Section */}
      {showBandSection && totalCollaborators > 0 && (
        <div style={sectionStyle}>
          {!compact && (
            <span
              style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: designTokens.typography.fontWeights.medium,
              }}
            >
              Band ({totalCollaborators})
            </span>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.md,
              padding: compact ? 0 : `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
              backgroundColor: compact ? 'transparent' : designTokens.colors.surface.secondary,
              borderRadius: designTokens.borderRadius.sm,
            }}
          >
            <RatingCount
              icon={<ThumbsUp size={14} />}
              count={collaborators.liked}
              color={designTokens.colors.primary.blue}
              label={`${collaborators.liked} liked`}
            />
            <RatingCount
              icon={<Heart size={14} />}
              count={collaborators.loved}
              color={designTokens.colors.accent.coral}
              label={`${collaborators.loved} loved`}
            />
          </div>
          {/* Collaborator names tooltip */}
          {!compact && collaborators.userNames && collaborators.userNames.length > 0 && (
            <div
              style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.text.muted,
              }}
            >
              {collaborators.userNames.slice(0, 3).join(', ')}
              {collaborators.userNames.length > 3 && ` +${collaborators.userNames.length - 3} more`}
            </div>
          )}
        </div>
      )}

      {/* Cumulative Section */}
      {showCumulativeSection && (cumulative.liked > 0 || cumulative.loved > 0) && (
        <div style={sectionStyle}>
          {!compact && (
            <span
              style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: designTokens.typography.fontWeights.medium,
              }}
            >
              Total ({cumulative.liked + cumulative.loved})
            </span>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.md,
              padding: compact ? 0 : `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
              backgroundColor: compact ? 'transparent' : designTokens.colors.surface.secondary,
              borderRadius: designTokens.borderRadius.sm,
            }}
          >
            <RatingCount
              icon={<ThumbsUp size={14} />}
              count={cumulative.liked}
              color={designTokens.colors.primary.blue}
              label={`${cumulative.liked} total likes`}
            />
            <RatingCount
              icon={<Heart size={14} />}
              count={cumulative.loved}
              color={designTokens.colors.accent.coral}
              label={`${cumulative.loved} total loves`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact inline rating display (for cards, list items)
 */
export const RatingSummaryInline: React.FC<{
  personal: RatingValue;
  totalLiked: number;
  totalLoved: number;
  onRate?: (rating: RatingValue) => void;
  size?: 'sm' | 'md';
}> = ({ personal, totalLiked, totalLoved, onRate, size = 'md' }) => {
  const designTokens = useDesignTokens();
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.sm,
      }}
    >
      <button
        onClick={() => onRate?.(personal === 'liked' ? null : 'liked')}
        disabled={!onRate}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: 4,
          background: 'none',
          border: 'none',
          cursor: onRate ? 'pointer' : 'default',
          color: personal === 'liked'
            ? designTokens.colors.primary.blue
            : designTokens.colors.text.muted,
        }}
        title={`${totalLiked} likes`}
      >
        <ThumbsUp size={iconSize} fill={personal === 'liked' ? 'currentColor' : 'none'} />
        {totalLiked > 0 && (
          <span style={{ fontSize: designTokens.typography.fontSizes.caption }}>
            {totalLiked}
          </span>
        )}
      </button>

      <button
        onClick={() => onRate?.(personal === 'loved' ? null : 'loved')}
        disabled={!onRate}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: 4,
          background: 'none',
          border: 'none',
          cursor: onRate ? 'pointer' : 'default',
          color: personal === 'loved'
            ? designTokens.colors.accent.coral
            : designTokens.colors.text.muted,
        }}
        title={`${totalLoved} loves`}
      >
        <Heart size={iconSize} fill={personal === 'loved' ? 'currentColor' : 'none'} />
        {totalLoved > 0 && (
          <span style={{ fontSize: designTokens.typography.fontSizes.caption }}>
            {totalLoved}
          </span>
        )}
      </button>
    </div>
  );
};

export default RatingSummary;
