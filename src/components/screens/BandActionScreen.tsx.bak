import React, { useState } from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';

export function BandActionScreen() {
  const { setCurrentScreen } = useAuth();
  const [selectedAction, setSelectedAction] = useState<'join' | 'form' | null>(null);

  return (
    <div style={{
      fontFamily: designTokens.typography.fontFamily,
      width: '100%',
      maxWidth: '425px',
      minHeight: '100vh',
      margin: '0 auto',
      backgroundColor: designTokens.colors.neutral.white,
      padding: designTokens.spacing.xxxl,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: designTokens.typography.fontWeights.normal,
        textAlign: 'center',
        margin: `0 0 ${designTokens.spacing.xxxl} 0`,
        color: designTokens.colors.neutral.charcoal
      }}>
        What would you like to do?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
        <button
          onClick={() => {
            setSelectedAction('join');
            setCurrentScreen('bandJoining');
          }}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: designTokens.colors.primary.blue,
            color: designTokens.colors.neutral.white,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: 'pointer'
          }}
        >
          JOIN A BAND
        </button>

        <button
          onClick={() => {
            setSelectedAction('form');
            setCurrentScreen('bandCreation');
          }}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: `2px solid ${designTokens.colors.primary.blue}`,
            backgroundColor: 'transparent',
            color: designTokens.colors.primary.blue,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: 'pointer'
          }}
        >
          START A NEW BAND
        </button>

        <button
          onClick={() => setCurrentScreen('main')}
          style={{
            marginTop: designTokens.spacing.lg,
            background: 'none',
            border: 'none',
            color: designTokens.colors.neutral.gray,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            cursor: 'pointer'
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}