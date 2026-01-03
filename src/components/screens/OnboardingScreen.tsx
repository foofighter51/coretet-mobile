import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../lib/supabase';
import { designTokens } from '../../design/designTokens';

type OnboardingStep = 'name' | 'intro1' | 'intro2' | 'intro3';

export function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>('name');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has already seen the intro - if so, skip straight to saving
  // This component is only shown when profile.name is null, so if they've seen
  // the intro before, we should skip the intro screens
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('onboarding_v1_completed');
    // Only show intro if this is truly a new user (no flag set)
    // If flag exists, they've seen it before so skip to name entry
    if (hasSeenIntro === null) {
      // New user - will show intro after name entry
      setStep('name');
    } else {
      // Returning user (flag was cleared) - skip intro, go to name entry
      setStep('name');
    }
  }, []);

  const handleNameSubmit = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    setError(null);
    setStep('intro1');
  };

  const handleSkip = () => {
    completeOnboarding();
  };

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

      // Create Personal band for new user
      try {
        const personalBand = await db.bands.createBand('Personal', user.id, true);
        if (!personalBand) {
          // Log error but don't fail onboarding - band can be created later
          console.error('Failed to create personal band during onboarding');
        }
      } catch (bandError) {
        // Log error but don't fail onboarding
        console.error('Error creating personal band:', bandError);
      }

      // Mark intro as completed
      localStorage.setItem('onboarding_v1_completed', 'true');

      // Success - reload to refresh auth state and exit onboarding
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save name');
      setIsLoading(false);
    }
  };

  // Name entry step
  if (step === 'name') {
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userName.trim()) {
                handleNameSubmit();
              }
            }}
            disabled={isLoading}
            autoFocus
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck="false"
            inputMode="text"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: `1px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '8px',
              marginBottom: '16px',
              fontFamily: designTokens.typography.fontFamily,
              WebkitAppearance: 'none',
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
            onClick={handleNameSubmit}
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
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Intro screens
  const introScreens = [
    {
      step: 'intro1' as const,
      icon: '🎵',
      title: 'Share music with your band',
      description: 'Upload tracks, organize into set lists, and collaborate with your bandmates—all in one private space.',
    },
    {
      step: 'intro2' as const,
      icon: '💬',
      title: 'Get feedback at exact moments',
      description: 'Leave timestamped comments on tracks. Click any comment to jump right to that moment.',
    },
    {
      step: 'intro3' as const,
      icon: '🔒',
      title: 'Invite-only and private',
      description: 'Your tracks are never public. Only invited band members can access your music.',
    },
  ];

  const currentIntroIndex = introScreens.findIndex(s => s.step === step);
  const currentIntro = introScreens[currentIntroIndex];

  if (currentIntro) {
    const isLastScreen = currentIntroIndex === introScreens.length - 1;

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
          textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            fontSize: '72px',
            marginBottom: '24px',
          }}>
            {currentIntro.icon}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: designTokens.colors.neutral.charcoal,
            margin: '0 0 16px 0',
          }}>
            {currentIntro.title}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            lineHeight: '1.5',
            color: designTokens.colors.neutral.darkGray,
            margin: '0 0 48px 0',
          }}>
            {currentIntro.description}
          </p>

          {/* Progress dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}>
            {introScreens.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: index === currentIntroIndex
                    ? designTokens.colors.primary.blue
                    : designTokens.colors.neutral.lightGray,
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <button
              onClick={() => {
                if (isLastScreen) {
                  completeOnboarding();
                } else {
                  setStep(introScreens[currentIntroIndex + 1].step);
                }
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: designTokens.colors.primary.blue,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Saving...' : isLastScreen ? 'Get Started' : 'Next'}
            </button>

            <button
              onClick={handleSkip}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'transparent',
                color: designTokens.colors.neutral.darkGray,
                border: 'none',
                fontSize: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
