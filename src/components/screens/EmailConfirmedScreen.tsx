import React, { useEffect, useState } from 'react';
import { CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { useTheme } from '../../contexts/ThemeContext';
import { Capacitor } from '@capacitor/core';

export function EmailConfirmedScreen() {
  const designTokens = useDesignTokens();
  const { isDarkMode } = useTheme();
  const [countdown, setCountdown] = useState(5);
  const [attemptedDeepLink, setAttemptedDeepLink] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Try to open the app via deep link
    if (!isNative && !attemptedDeepLink) {
      setAttemptedDeepLink(true);

      // Try deep link first
      window.location.href = 'coretet://';

      // If still on page after 2 seconds, show web instructions
      setTimeout(() => {
        // Check if we're still on the page (deep link didn't work)
        if (document.hasFocus()) {
          // User is still here, show instructions
        }
      }, 2000);
    }

    // Countdown for auto-redirect on web
    if (countdown > 0 && !isNative) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isNative, attemptedDeepLink]);

  // On native, this should never show (deep link should work)
  if (isNative) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: designTokens.colors.surface.tertiary,
        fontFamily: designTokens.typography.fontFamily,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '375px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e6f7e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={40} color="#008000" />
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: designTokens.colors.neutral.charcoal,
            margin: '0 0 12px 0',
          }}>
            Email confirmed!
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: '1.5',
            color: designTokens.colors.neutral.darkGray,
            margin: '0',
          }}>
            Redirecting you to CoreTet...
          </p>
        </div>
      </div>
    );
  }

  // Web view - show instructions to open app
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      backgroundColor: designTokens.colors.surface.tertiary,
      fontFamily: designTokens.typography.fontFamily,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#e6f7e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <CheckCircle size={40} color="#008000" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 12px 0',
        }}>
          Email confirmed!
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '18px',
          lineHeight: '1.5',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 32px 0',
        }}>
          Your account is ready. Let's get you into the app.
        </p>

        {/* Instructions Card */}
        <div style={{
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.lg,
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <Smartphone size={24} color={designTokens.colors.primary.blue} />
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: 0,
            }}>
              Next steps:
            </h2>
          </div>

          <ol style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '16px',
            lineHeight: '1.8',
            color: designTokens.colors.neutral.darkGray,
          }}>
            <li>Open the CoreTet app on your device</li>
            <li>Sign in with your email and password</li>
            <li>Start collaborating with your band!</li>
          </ol>
        </div>

        {/* Manual open app button */}
        <button
          onClick={() => {
            window.location.href = 'coretet://';
          }}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: designTokens.colors.primary.blue,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          Open CoreTet App
        </button>

        {/* App Store Links (future) */}
        <div style={{
          padding: '16px',
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.md,
          border: `1px solid ${designTokens.colors.borders.default}`,
        }}>
          <p style={{
            fontSize: '14px',
            color: designTokens.colors.text.muted,
            margin: '0 0 8px 0',
          }}>
            Don't have the app yet?
          </p>
          <p style={{
            fontSize: '14px',
            color: designTokens.colors.primary.blue,
            fontWeight: '600',
            margin: 0,
          }}>
            Download from TestFlight (Coming Soon)
          </p>
        </div>
      </div>
    </div>
  );
}
