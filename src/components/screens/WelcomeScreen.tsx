import React from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';

export function WelcomeScreen() {
  const { setCurrentScreen } = useAuth();

  const baseStyle = {
    fontFamily: designTokens.typography.fontFamily,
    width: '100%',
    maxWidth: '425px',
    minHeight: '100vh',
    margin: '0 auto',
    position: 'relative' as const
  };

  return (
    <div style={{
      ...baseStyle,
      backgroundColor: designTokens.colors.neutral.white,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh',
      padding: designTokens.spacing.xxxl,
      boxSizing: 'border-box'
    }}>
      {/* Top spacing */}
      <div style={{ flex: '1' }} />

      {/* Logo */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '60px',
        backgroundColor: designTokens.colors.primary.blue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        flexShrink: 0
      }}>
        <span style={{
          fontSize: designTokens.typography.fontSizes.giant,
          fontWeight: designTokens.typography.fontWeights.semibold,
          color: designTokens.colors.neutral.white
        }}>
          CT
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: designTokens.typography.fontWeights.light,
        textAlign: 'center',
        margin: `${designTokens.spacing.xxxl} 0 0 0`,
        color: designTokens.colors.neutral.charcoal,
        lineHeight: '1.2'
      }}>
        Welcome to CoreTet
      </h1>

      {/* Bottom spacing */}
      <div style={{ flex: '2' }} />

      {/* Button positioned at bottom */}
      <button
        onClick={() => setCurrentScreen('phone')}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '28px',
          border: 'none',
          backgroundColor: designTokens.colors.primary.blue,
          color: designTokens.colors.neutral.white,
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
        }}
      >
        GET STARTED
      </button>
    </div>
  );
}