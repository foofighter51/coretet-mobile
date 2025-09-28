import React from 'react';
import { designTokens } from '../../design/designTokens';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from '../molecules/ErrorDisplay';

const baseStyle = {
  fontFamily: designTokens.typography.fontFamily,
  width: '100%',
  maxWidth: '425px',
  minHeight: '100vh',
  margin: '0 auto',
  position: 'relative' as const
};

export function CodeVerificationScreen() {
  const {
    phoneNumber,
    verificationCode,
    setVerificationCode,
    authLoading,
    currentError,
    setCurrentError,
    sendVerificationCode,
    verifyCode
  } = useAuth();

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
          margin: `0 0 ${designTokens.spacing.lg} 0`,
          color: designTokens.colors.neutral.charcoal,
          lineHeight: '1.3'
        }}>
          Enter verification code
        </h1>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.xxxl} 0`
        }}>
          We sent a 6-digit code to {phoneNumber}
        </p>

        <div style={{
          display: 'flex',
          gap: designTokens.spacing.xs,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: designTokens.spacing.xxxl,
          width: '100%',
          padding: `0 ${designTokens.spacing.sm}`
        }}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={verificationCode[index] || ''}
              onChange={(e) => {
                const newCode = verificationCode.split('');
                newCode[index] = e.target.value;
                setVerificationCode(newCode.join(''));

                // Auto-focus next input
                if (e.target.value && index < 5) {
                  const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                  nextInput?.focus();
                }
              }}
              onKeyDown={(e) => {
                // Handle backspace to move to previous input
                if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                  const prevInput = e.target.parentElement?.children[index - 1] as HTMLInputElement;
                  prevInput?.focus();
                }
              }}
              style={{
                width: '40px',
                height: '48px',
                border: verificationCode[index]
                  ? `2px solid ${designTokens.colors.primary.blue}`
                  : `2px solid ${designTokens.colors.neutral.lightGray}`,
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: designTokens.typography.fontWeights.semibold,
                textAlign: 'center',
                outline: 'none',
                backgroundColor: designTokens.colors.neutral.white,
                fontFamily: designTokens.typography.fontFamily,
                boxSizing: 'border-box',
                flex: '0 0 auto'
              }}
              aria-label={`Verification code digit ${index + 1}`}
            />
          ))}
        </div>

        <p style={{
          fontSize: designTokens.typography.fontSizes.bodySmall,
          color: designTokens.colors.neutral.gray,
          textAlign: 'center',
          margin: '0'
        }}>
          Didn't receive a code?{' '}
          <button
            onClick={sendVerificationCode}
            style={{
              background: 'none',
              border: 'none',
              color: designTokens.colors.primary.blue,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
            Resend
          </button>
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
        onClick={verifyCode}
        disabled={verificationCode.length !== 6 || authLoading}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '28px',
          border: 'none',
          backgroundColor: verificationCode.length === 6
            ? designTokens.colors.primary.blue
            : designTokens.colors.neutral.lightGray,
          color: designTokens.colors.neutral.white,
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          cursor: verificationCode.length === 6 ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          if (verificationCode.length === 6) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
          }
        }}
        onMouseLeave={(e) => {
          if (verificationCode.length === 6) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
          }
        }}
      >
        {authLoading ? 'VERIFYING...' : 'VERIFY'}
      </button>
    </div>
  );
}