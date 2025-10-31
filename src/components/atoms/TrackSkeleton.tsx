import React from 'react';
import { designTokens } from '../../design/designTokens';

interface TrackSkeletonProps {
  count?: number;
}

export const TrackSkeleton: React.FC<TrackSkeletonProps> = ({ count = 3 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.sm }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.primary,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.md,
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* Play button skeleton */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: designTokens.colors.neutral.lightGray,
          }} />

          {/* Track info skeleton */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
            <div style={{
              height: '16px',
              width: '70%',
              backgroundColor: designTokens.colors.neutral.lightGray,
              borderRadius: designTokens.borderRadius.sm,
            }} />
            <div style={{
              height: '14px',
              width: '40%',
              backgroundColor: designTokens.colors.neutral.lightGray,
              borderRadius: designTokens.borderRadius.sm,
            }} />
          </div>

          {/* Rating skeleton */}
          <div style={{
            width: '60px',
            height: '24px',
            backgroundColor: designTokens.colors.neutral.lightGray,
            borderRadius: designTokens.borderRadius.sm,
          }} />
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
