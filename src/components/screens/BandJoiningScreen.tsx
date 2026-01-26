import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { useBand } from '../../contexts/BandContext';
import { ErrorDisplay } from '../molecules/ErrorDisplay';

interface BandJoiningScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function BandJoiningScreen({ onBack, onSuccess }: BandJoiningScreenProps) {
  const { joinBand, loading, error, setError } = useBand();

  const [inviteCode, setInviteCode] = useState('');

  const baseStyle = {
    fontFamily: designTokens.typography.fontFamily,
    width: '100%',
    // maxWidth: '425px', // REMOVED - desktop support
    minHeight: '100vh',
    margin: '0 auto',
    position: 'relative' as const
  };

  const handleInviteCodeChange = (value: string) => {
    // Only allow alphanumeric characters and limit to 8
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
    setInviteCode(cleaned);
  };

  const handleJoinBand = async () => {
    if (!inviteCode.trim() || inviteCode.length !== 8) {
      return;
    }

    setError(null);

    const result = await joinBand(inviteCode);

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <div style={{
      ...baseStyle,
      backgroundColor: designTokens.colors.neutral.white,
      padding: designTokens.spacing.lg,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: designTokens.spacing.lg
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.xs,
              background: 'none',
              border: 'none',
              color: designTokens.colors.primary.blue,
              fontSize: designTokens.typography.fontSizes.body,
              cursor: 'pointer',
              padding: designTokens.spacing.xs
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Content */}
        <div>
          <h1 style={{
            fontSize: designTokens.typography.fontSizes.h2,
            fontWeight: designTokens.typography.fontWeights.semibold,
            textAlign: 'center',
            margin: `0 0 ${designTokens.spacing.lg} 0`,
            color: designTokens.colors.neutral.charcoal
          }}>
            Join a Band
          </h1>

          <p style={{
            fontSize: designTokens.typography.fontSizes.body,
            color: designTokens.colors.neutral.darkGray,
            textAlign: 'center',
            margin: `0 0 ${designTokens.spacing.xxxl} 0`
          }}>
            Enter the 8-character invite code from your band leader
          </p>

          {/* Invite Code Input */}
          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.neutral.darkGray,
              marginBottom: designTokens.spacing.xs,
              textAlign: 'center'
            }}>
              Invite Code
            </label>
            <input
              type="text"
              placeholder="ABCD1234"
              value={inviteCode}
              onChange={(e) => handleInviteCodeChange(e.target.value)}
              style={{
                width: '100%',
                padding: designTokens.spacing.lg,
                border: inviteCode.length === 8
                  ? `2px solid ${designTokens.colors.primary.blue}`
                  : `2px solid ${designTokens.colors.neutral.lightGray}`,
                borderRadius: '12px',
                fontSize: '24px',
                fontWeight: designTokens.typography.fontWeights.semibold,
                textAlign: 'center',
                outline: 'none',
                backgroundColor: designTokens.colors.neutral.white,
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                letterSpacing: '4px',
                textTransform: 'uppercase'
              }}
              maxLength={8}
            />
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.neutral.gray,
              textAlign: 'center',
              margin: `${designTokens.spacing.sm} 0 0 0`
            }}>
              {inviteCode.length}/8 characters
            </p>
          </div>

          <div style={{
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.neutral.lightGray,
            borderRadius: '12px',
            marginBottom: designTokens.spacing.lg
          }}>
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.neutral.darkGray,
              margin: 0,
              lineHeight: designTokens.typography.lineHeights.body
            }}>
              <strong>Note:</strong> You must be added to the band's authorized member list by the band creator before you can join.
            </p>
          </div>
        </div>

        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
        />
      </div>

      {/* Join Button */}
      <button
        onClick={handleJoinBand}
        disabled={inviteCode.length !== 8 || loading}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '28px',
          border: 'none',
          backgroundColor: inviteCode.length === 8 && !loading
            ? designTokens.colors.primary.blue
            : designTokens.colors.neutral.gray,
          color: designTokens.colors.neutral.white,
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          cursor: inviteCode.length === 8 && !loading ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (inviteCode.length === 8 && !loading) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
          }
        }}
        onMouseLeave={(e) => {
          if (inviteCode.length === 8 && !loading) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
          }
        }}
      >
        {loading ? 'JOINING...' : 'JOIN BAND'}
      </button>
    </div>
  );
}