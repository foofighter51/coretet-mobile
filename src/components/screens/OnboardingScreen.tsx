import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { designTokens } from '../../design/designTokens';
import { ErrorDisplay } from '../molecules/ErrorDisplay';

const baseStyle = {
  fontFamily: designTokens.typography.fontFamily,
  width: '100%',
  maxWidth: '425px',
  minHeight: '100vh',
  margin: '0 auto',
  position: 'relative' as const
};

export function OnboardingScreen() {
  const { user } = useUser();
  const [userName, setUserName] = useState('');
  const [currentError, setCurrentError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const completeOnboarding = async () => {
    if (!userName.trim()) return;

    setIsLoading(true);
    setCurrentError(null);

    try {
      // Split the name into first and last name
      const nameParts = userName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Update the user's profile in Clerk
      await user?.update({
        firstName,
        lastName: lastName || undefined
      });

      // The App component will automatically detect the name change and navigate away
    } catch (error) {
      console.error('Error updating user profile:', error);
      setCurrentError({
        message: 'Failed to update profile. Please try again.',
        type: 'onboarding'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      ...baseStyle,
      backgroundColor: designTokens.colors.neutral.white,
      padding: designTokens.spacing.xxxl,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Top spacing */}
      <div style={{ flex: '1' }} />

      {/* Content */}
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: designTokens.typography.fontWeights.normal,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.xxxl} 0`,
          color: designTokens.colors.neutral.charcoal,
          lineHeight: '1.3'
        }}>
          What's your name?
        </h1>

        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <input
            type="text"
            placeholder="Enter your full name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              border: userName
                ? `2px solid ${designTokens.colors.primary.blue}`
                : `2px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '12px',
              fontSize: designTokens.typography.fontSizes.body,
              outline: 'none',
              backgroundColor: designTokens.colors.neutral.white,
              fontFamily: designTokens.typography.fontFamily,
              boxSizing: 'border-box'
            }}
            aria-label="Full name input"
          />
        </div>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: '0'
        }}>
          This is how other band members will see you
        </p>
      </div>

      <ErrorDisplay
        error={currentError}
        onDismiss={() => setCurrentError(null)}
      />

      {/* Bottom spacing */}
      <div style={{ flex: '1' }} />

      {/* Button */}
      <button
        onClick={completeOnboarding}
        disabled={!userName.trim() || isLoading}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '28px',
          border: 'none',
          backgroundColor: userName.trim() && !isLoading
            ? designTokens.colors.primary.blue
            : designTokens.colors.neutral.gray,
          color: designTokens.colors.neutral.white,
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          cursor: userName.trim() && !isLoading ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          if (userName.trim() && !isLoading) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
          }
        }}
        onMouseLeave={(e) => {
          if (userName.trim() && !isLoading) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
          }
        }}
      >
        {isLoading ? 'SAVING...' : 'CONTINUE'}
      </button>
    </div>
  );
}