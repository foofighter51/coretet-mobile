import React, { useState } from 'react';
import { db, auth } from '../../../lib/supabase';
import { designTokens } from '../../design/designTokens';

export function OnboardingScreen() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user } = await auth.getCurrentUser();
      if (!user) {
        setError('User not found');
        setIsLoading(false);
        return;
      }

      // Update profile with name
      const { data, error: updateError } = await db.profiles.update(user.id, { name: userName.trim() });

      if (updateError) {
        setError(updateError.message || 'Failed to save name');
        setIsLoading(false);
        return;
      }

      // Verify the update succeeded
      if (!data || data.name !== userName.trim()) {
        setError('Failed to verify name update. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success - reload to refresh auth state and exit onboarding
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save name');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      backgroundColor: '#ffffff',
      fontFamily: designTokens.typography.fontFamily,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '375px',
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 8px 0',
        }}>
          Welcome to CoreTet
        </h1>
        <p style={{
          fontSize: '16px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 32px 0',
        }}>
          What should we call you?
        </p>

        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            border: `1px solid ${designTokens.colors.neutral.lightGray}`,
            borderRadius: '8px',
            marginBottom: '16px',
            fontFamily: designTokens.typography.fontFamily,
          }}
        />

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c00',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={completeOnboarding}
          disabled={isLoading || !userName.trim()}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: designTokens.colors.primary.blue,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: (isLoading || !userName.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !userName.trim()) ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
