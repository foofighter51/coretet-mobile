import React from 'react';
import { HelpCircle } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
  };
  onShowTutorial: () => void;
  onShowIntro: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowTutorial,
  onShowIntro,
  onSignOut,
}) => {
  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
    >
      {/* User Profile Section */}
      <div
        style={{
          backgroundColor: designTokens.colors.surface.primary,
          border: `1px solid ${designTokens.colors.borders.default}`,
          borderRadius: designTokens.borderRadius.md,
          padding: designTokens.spacing.lg,
          marginBottom: designTokens.spacing.lg,
        }}
      >
        <div style={{ marginBottom: designTokens.spacing.md }}>
          <p
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.neutral.darkGray,
              marginBottom: designTokens.spacing.xs,
            }}
          >
            Name
          </p>
          <p
            style={{
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              color: designTokens.colors.neutral.charcoal,
            }}
          >
            {currentUser.name || 'User'}
          </p>
        </div>

        {currentUser.email && (
          <div style={{ marginBottom: designTokens.spacing.md }}>
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.darkGray,
                marginBottom: designTokens.spacing.xs,
              }}
            >
              Email
            </p>
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
                color: designTokens.colors.neutral.charcoal,
              }}
            >
              {currentUser.email}
            </p>
          </div>
        )}

        {(currentUser.phoneNumber || currentUser.phone) && (
          <div style={{ marginBottom: designTokens.spacing.md }}>
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.darkGray,
                marginBottom: designTokens.spacing.xs,
              }}
            >
              Phone
            </p>
            <p
              style={{
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
                color: designTokens.colors.neutral.charcoal,
              }}
            >
              {currentUser.phoneNumber || currentUser.phone}
            </p>
          </div>
        )}

        {/* Tutorial Button */}
        <button
          onClick={onShowTutorial}
          style={{
            marginTop: designTokens.spacing.md,
            width: '100%',
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.secondary,
            color: designTokens.colors.primary.blue,
            border: `1px solid ${designTokens.colors.primary.blue}`,
            borderRadius: designTokens.borderRadius.sm,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: designTokens.spacing.sm,
          }}
        >
          <HelpCircle size={18} />
          How to Use CoreTet
        </button>

        {/* Replay Intro Button */}
        <button
          onClick={onShowIntro}
          style={{
            marginTop: designTokens.spacing.md,
            width: '100%',
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.secondary,
            color: designTokens.colors.primary.blue,
            border: `1px solid ${designTokens.colors.primary.blue}`,
            borderRadius: designTokens.borderRadius.sm,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: designTokens.spacing.sm,
          }}
        >
          <HelpCircle size={18} />
          Replay Intro Screens
        </button>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          style={{
            marginTop: designTokens.spacing.md,
            width: '100%',
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.secondary,
            color: designTokens.colors.text.muted,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.sm,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.medium,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </BottomSheetModal>
  );
};
