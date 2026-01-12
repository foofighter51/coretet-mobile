import React from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';

const baseStyle = {
  fontFamily: designTokens.typography.fontFamily,
  width: '100%',
  maxWidth: '425px',
  minHeight: '100vh',
  margin: '0 auto',
  position: 'relative' as const
};

interface WaitlistScreenProps {
  waitlistPosition?: number;
  message: string;
}

export function WaitlistScreen({ waitlistPosition, message }: WaitlistScreenProps) {
  const { setCurrentScreen } = useAuth();

  return (
    <div style={{
      ...baseStyle,
      backgroundColor: designTokens.colors.neutral.white,
      padding: designTokens.spacing.xxxl,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Waitlist Icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '40px',
        backgroundColor: designTokens.colors.primary.blue + '20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: designTokens.spacing.lg,
        fontSize: '32px'
      }}>
        🎵
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: designTokens.typography.fontSizes.h2,
        fontWeight: designTokens.typography.fontWeights.semibold,
        margin: `0 0 ${designTokens.spacing.md} 0`,
        color: designTokens.colors.neutral.charcoal
      }}>
        {waitlistPosition ? `You are #${waitlistPosition}` : 'You are on the list!'}
      </h1>

      {/* Subtitle */}
      <h2 style={{
        fontSize: designTokens.typography.fontSizes.h4,
        fontWeight: designTokens.typography.fontWeights.normal,
        margin: `0 0 ${designTokens.spacing.lg} 0`,
        color: designTokens.colors.neutral.darkGray
      }}>
        CoreTet Beta Waitlist
      </h2>

      {/* Message */}
      <p style={{
        fontSize: designTokens.typography.fontSizes.body,
        color: designTokens.colors.neutral.darkGray,
        lineHeight: designTokens.typography.lineHeights.body,
        margin: `0 0 ${designTokens.spacing.xxxl} 0`,
        maxWidth: '320px'
      }}>
        {message}
      </p>

      {/* Info Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.md,
        marginBottom: designTokens.spacing.xxxl,
        width: '100%'
      }}>
        <div style={{
          padding: designTokens.spacing.lg,
          backgroundColor: designTokens.colors.neutral.lightGray,
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <h4 style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            margin: `0 0 ${designTokens.spacing.xs} 0`,
            color: designTokens.colors.neutral.charcoal
          }}>
            What happens next?
          </h4>
          <p style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.darkGray,
            margin: 0,
            lineHeight: designTokens.typography.lineHeights.body
          }}>
            We'll send you an email when it's your turn to join. No need to check back here.
          </p>
        </div>

        <div style={{
          padding: designTokens.spacing.lg,
          backgroundColor: designTokens.colors.neutral.lightGray,
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <h4 style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            margin: `0 0 ${designTokens.spacing.xs} 0`,
            color: designTokens.colors.neutral.charcoal
          }}>
            Why the wait?
          </h4>
          <p style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.darkGray,
            margin: 0,
            lineHeight: designTokens.typography.lineHeights.body
          }}>
            We're launching in small groups to ensure the best experience for everyone.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.md,
        width: '100%'
      }}>
        <button
          onClick={() => setCurrentScreen('phone')}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '24px',
            border: `2px solid ${designTokens.colors.primary.blue}`,
            backgroundColor: 'transparent',
            color: designTokens.colors.primary.blue,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
            e.currentTarget.style.color = designTokens.colors.neutral.white;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = designTokens.colors.primary.blue;
          }}
        >
          Try Different Email
        </button>

        <p style={{
          fontSize: designTokens.typography.fontSizes.caption,
          color: designTokens.colors.neutral.gray,
          margin: 0,
          textAlign: 'center'
        }}>
          Already have an invitation? Use the email we sent you.
        </p>
      </div>
    </div>
  );
}