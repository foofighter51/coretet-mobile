import React from 'react';
import { HelpCircle, Moon, Sun } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { useTheme } from '../../contexts/ThemeContext';
import { BottomSheetModal } from '../ui/BottomSheetModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
  };
  onShowIntro: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowIntro,
  onSignOut,
}) => {
  const designTokens = useDesignTokens();
  const { isDarkMode, toggleTheme } = useTheme();

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

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            marginTop: designTokens.spacing.md,
            width: '100%',
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.secondary,
            color: designTokens.colors.primary.blue,
            border: `1px solid ${designTokens.colors.borders.default}`,
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
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
            border: `1px solid ${designTokens.colors.borders.default}`,
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

        {/* DEV: Test Full Onboarding Button */}
        <button
          onClick={async () => {
            if (!confirm('This will reset your profile name and onboarding state to test the signup flow. You can restore your name afterwards. Continue?')) {
              return;
            }

            try {
              // Import db dynamically
              const { db } = await import('../../../lib/supabase');

              if (!currentUser.id) {
                alert('User ID not found');
                return;
              }

              // Reset profile name to 'User' (triggers onboarding)
              await db.profiles.update(currentUser.id, { name: 'User' });

              // Clear onboarding flag
              localStorage.removeItem('onboarding_v1_completed');

              // Reload to trigger full onboarding
              window.location.reload();
            } catch (error) {
              console.error('Failed to reset onboarding:', error);
              alert('Failed to reset onboarding state');
            }
          }}
          style={{
            marginTop: designTokens.spacing.md,
            width: '100%',
            padding: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.secondary,
            color: designTokens.colors.neutral.darkGray,
            border: `1px solid ${designTokens.colors.borders.default}`,
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
          🧪 Test Full Onboarding (DEV)
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
