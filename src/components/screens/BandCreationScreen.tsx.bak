import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { useBand } from '../../contexts/BandContext';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from '../molecules/ErrorDisplay';

interface BandCreationScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function BandCreationScreen({ onBack, onSuccess }: BandCreationScreenProps) {
  const { createBand, loading, error, setError } = useBand();
  const { currentUser } = useAuth();

  const [bandName, setBandName] = useState('');
  const [description, setDescription] = useState('');
  const [memberPhones, setMemberPhones] = useState<string[]>(['', '', '', '']);

  const baseStyle = {
    fontFamily: designTokens.typography.fontFamily,
    width: '100%',
    maxWidth: '425px',
    minHeight: '100vh',
    margin: '0 auto',
    position: 'relative' as const
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...memberPhones];
    newPhones[index] = value;
    setMemberPhones(newPhones);
  };

  const handleCreateBand = async () => {
    if (!bandName.trim()) {
      return;
    }

    setError(null);

    // Filter out empty phone numbers
    const authorizedPhones = memberPhones.filter(phone => phone.trim());

    const result = await createBand({
      name: bandName,
      description,
      authorizedPhones
    });

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
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
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
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: designTokens.typography.fontSizes.h2,
          fontWeight: designTokens.typography.fontWeights.semibold,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.lg} 0`,
          color: designTokens.colors.neutral.charcoal
        }}>
          Start a New Band
        </h1>

        <p style={{
          fontSize: designTokens.typography.fontSizes.body,
          color: designTokens.colors.neutral.darkGray,
          textAlign: 'center',
          margin: `0 0 ${designTokens.spacing.xxxl} 0`
        }}>
          Create a band and invite members to collaborate
        </p>

        {/* Band Name */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.neutral.darkGray,
            marginBottom: designTokens.spacing.xs
          }}>
            Band Name *
          </label>
          <input
            type="text"
            placeholder="Enter your band name"
            value={bandName}
            onChange={(e) => setBandName(e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              border: bandName
                ? `2px solid ${designTokens.colors.primary.blue}`
                : `2px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '12px',
              fontSize: designTokens.typography.fontSizes.body,
              outline: 'none',
              backgroundColor: designTokens.colors.neutral.white,
              fontFamily: designTokens.typography.fontFamily,
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.neutral.darkGray,
            marginBottom: designTokens.spacing.xs
          }}>
            Description (Optional)
          </label>
          <textarea
            placeholder="Describe your band's style or goals"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              border: `2px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '12px',
              fontSize: designTokens.typography.fontSizes.body,
              outline: 'none',
              backgroundColor: designTokens.colors.neutral.white,
              fontFamily: designTokens.typography.fontFamily,
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Member Phone Numbers */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.neutral.darkGray,
            marginBottom: designTokens.spacing.xs
          }}>
            Member Phone Numbers
          </label>
          <p style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.gray,
            margin: `0 0 ${designTokens.spacing.sm} 0`
          }}>
            Add phone numbers of people who can join this band
          </p>

          {memberPhones.map((phone, index) => (
            <input
              key={index}
              type="tel"
              placeholder={`Member ${index + 1} phone (optional)`}
              value={phone}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                border: `2px solid ${designTokens.colors.neutral.lightGray}`,
                borderRadius: '12px',
                fontSize: designTokens.typography.fontSizes.body,
                outline: 'none',
                backgroundColor: designTokens.colors.neutral.white,
                fontFamily: designTokens.typography.fontFamily,
                boxSizing: 'border-box',
                marginBottom: designTokens.spacing.sm
              }}
            />
          ))}
        </div>

        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
        />
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreateBand}
        disabled={!bandName.trim() || loading}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '28px',
          border: 'none',
          backgroundColor: bandName.trim() && !loading
            ? designTokens.colors.primary.blue
            : designTokens.colors.neutral.gray,
          color: designTokens.colors.neutral.white,
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.semibold,
          cursor: bandName.trim() && !loading ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s ease',
          marginTop: designTokens.spacing.lg
        }}
        onMouseEnter={(e) => {
          if (bandName.trim() && !loading) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
          }
        }}
        onMouseLeave={(e) => {
          if (bandName.trim() && !loading) {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
          }
        }}
      >
        {loading ? 'CREATING...' : 'CREATE BAND'}
      </button>
    </div>
  );
}