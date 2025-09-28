import React, { memo } from 'react';
import { Users, Music } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { Band } from '../../types';

interface BandCardProps {
  band: Band;
  onClick?: (band: Band) => void;
}

export const BandCard = memo(function BandCard({ band, onClick }: BandCardProps) {
  const handleClick = () => {
    onClick?.(band);
  };

  return (
    <div
      style={{
        backgroundColor: designTokens.colors.neutral.white,
        borderRadius: '12px',
        padding: '0',
        marginBottom: designTokens.spacing.md,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={handleClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Band: ${band.title}, ${band.memberCount} members, ${band.trackCount} tracks`}
    >
      {band.image && (
        <img
          src={band.image}
          alt={`${band.title} band image`}
          style={{
            width: '100%',
            height: '120px',
            objectFit: 'cover'
          }}
        />
      )}
      <div style={{ padding: '12px' }}>
        <h3 style={{
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          margin: '0 0 4px 0',
          color: designTokens.colors.neutral.charcoal,
          fontFamily: designTokens.typography.fontFamily
        }}>
          {band.title}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: designTokens.typography.fontSizes.bodySmall,
          color: designTokens.colors.neutral.darkGray
        }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label={`${band.memberCount} members`}
          >
            <Users size={14} aria-hidden="true" />
            {band.memberCount}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            aria-label={`${band.trackCount} tracks`}
          >
            <Music size={14} aria-hidden="true" />
            {band.trackCount}
          </span>
        </div>
        <p style={{
          fontSize: designTokens.typography.fontSizes.caption,
          color: designTokens.colors.neutral.gray,
          margin: '4px 0 0 0'
        }}>
          {band.lastActivity}
        </p>
      </div>
    </div>
  );
});