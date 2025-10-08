import React from 'react';
import { Music } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

export function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: designTokens.typography.fontFamily,
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: designTokens.colors.primary.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Music size={40} color="#ffffff" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 16px 0',
        }}>
          CoreTet
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '20px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 32px 0',
          lineHeight: '1.6',
        }}>
          Collaborate on music with your band
        </p>

        {/* Beta Badge */}
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#ebf8ff',
          border: `1px solid ${designTokens.colors.primary.blue}`,
          borderRadius: '20px',
          marginBottom: '32px',
        }}>
          <span style={{
            color: designTokens.colors.primary.blue,
            fontSize: '14px',
            fontWeight: '600',
          }}>
            🚀 Currently in Private Beta
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 40px 0',
          lineHeight: '1.8',
        }}>
          CoreTet is a collaborative music platform for bands and ensembles.
          Upload tracks, rate music together, and build shared playlists.
          Currently available for TestFlight beta testers.
        </p>

        {/* TestFlight Info */}
        <div style={{
          padding: '24px',
          backgroundColor: '#f7fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: designTokens.colors.neutral.charcoal,
            margin: '0 0 12px 0',
          }}>
            Beta Testing on iOS
          </h3>
          <p style={{
            fontSize: '14px',
            color: designTokens.colors.neutral.darkGray,
            margin: 0,
            lineHeight: '1.6',
          }}>
            CoreTet is currently available exclusively to invited TestFlight beta testers.
            All content is private and requires authentication to access.
          </p>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '14px',
          color: designTokens.colors.neutral.gray,
          margin: '40px 0 0 0',
        }}>
          © 2025 CoreTet. All rights reserved.
        </p>
      </div>
    </div>
  );
}
