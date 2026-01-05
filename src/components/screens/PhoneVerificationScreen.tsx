import React from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from '../molecules/ErrorDisplay';

export function PhoneVerificationScreen() {
  const {
    authLoading,
    currentError,
    setCurrentError,
    sendVerificationCode
  } = useAuth();

  // Local form state
  const [email, setEmail] = React.useState('');

  const handleSendCode = () => {
    sendVerificationCode(email);
  };

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
          Enter your email address
        </h1>

        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              border: email
                ? `2px solid ${designTokens.colors.primary.blue}`
                : `2px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '12px',
              fontSize: designTokens.typography.fontSizes.body,
              outline: 'none',
              backgroundColor: designTokens.colors.neutral.white,
              fontFamily: designTokens.typography.fontFamily,
              boxSizing: 'border-box'
            }}
            aria-label="Phone number input"
          />
        </div>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: '0'
        }}>
          We'll email you a verification link
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
        onClick={handleSendCode}
        disabled={!email || authLoading}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '28px',
          border: 'none',
          backgroundColor: email
            ? designTokens.colors.primary.blue
            : designTokens.colors.neutral.gray,
          color: designTokens.colors.neutral.white,
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          cursor: email ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          if (email) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
          }
        }}
        onMouseLeave={(e) => {
          if (email) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
          }
        }}
      >
        {authLoading ? 'SENDING...' : 'CONTINUE'}
      </button>
    </div>
  );
}