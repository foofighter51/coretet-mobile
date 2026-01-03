import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { supabase } from '../../../lib/supabase';

interface EmailConfirmationScreenProps {
  email: string;
  onResendSuccess?: () => void;
  onBackToSignIn: () => void;
}

export function EmailConfirmationScreen({
  email,
  onResendSuccess,
  onBackToSignIn
}: EmailConfirmationScreenProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          setResendError('Too many requests. Please wait a few minutes before trying again.');
        } else {
          setResendError(error.message);
        }
      } else {
        setResendSuccess(true);
        setCountdown(60);
        setCanResend(false);
        onResendSuccess?.();
      }
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
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
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: designTokens.colors.primary.lightBlue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Mail size={40} color={designTokens.colors.primary.blue} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 12px 0',
        }}>
          Check your email
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 8px 0',
        }}>
          We sent a confirmation link to
        </p>
        <p style={{
          fontSize: '16px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 32px 0',
        }}>
          {email}
        </p>

        {/* Instructions */}
        <div style={{
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.md,
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: designTokens.colors.neutral.charcoal,
            margin: '0 0 12px 0',
          }}>
            Next steps:
          </p>
          <ol style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: designTokens.colors.neutral.darkGray,
          }}>
            <li>Open the email from CoreTet</li>
            <li>Click "Confirm your email"</li>
            <li>You'll be redirected back to the app</li>
          </ol>
          <p style={{
            fontSize: '13px',
            color: designTokens.colors.text.muted,
            margin: '12px 0 0 0',
            fontStyle: 'italic',
          }}>
            💡 Can't find it? Check your spam/junk folder
          </p>
        </div>

        {/* Success message for resend */}
        {resendSuccess && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#e6f7e6',
            border: '1px solid #90ee90',
            borderRadius: '8px',
            color: '#008000',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            <CheckCircle size={18} />
            Email sent! Check your inbox.
          </div>
        )}

        {/* Error message for resend */}
        {resendError && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c00',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {resendError}
          </div>
        )}

        {/* Resend button */}
        <button
          onClick={handleResendEmail}
          disabled={!canResend || isResending}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: canResend ? designTokens.colors.primary.blue : designTokens.colors.surface.secondary,
            color: canResend ? '#ffffff' : designTokens.colors.text.muted,
            border: canResend ? 'none' : `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: canResend && !isResending ? 'pointer' : 'not-allowed',
            opacity: isResending ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          {isResending ? (
            <>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Sending...
            </>
          ) : canResend ? (
            <>
              <RefreshCw size={18} />
              Resend confirmation email
            </>
          ) : (
            `Resend available in ${countdown}s`
          )}
        </button>

        {/* Back to sign in */}
        <button
          onClick={onBackToSignIn}
          style={{
            width: '100%',
            padding: '14px',
            background: 'none',
            border: 'none',
            color: designTokens.colors.primary.blue,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
