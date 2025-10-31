import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

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
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: designTokens.colors.neutral.white,
          borderTopLeftRadius: designTokens.borderRadius.lg,
          borderTopRightRadius: designTokens.borderRadius.lg,
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: designTokens.colors.neutral.white,
            borderBottom: `1px solid ${designTokens.colors.borders.default}`,
            padding: designTokens.spacing.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.neutral.charcoal,
              margin: 0,
            }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              width: designTokens.spacing.xxl,
              height: designTokens.spacing.xxl,
              borderRadius: designTokens.borderRadius.full,
              backgroundColor: designTokens.colors.surface.secondary,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: designTokens.colors.neutral.darkGray,
            }}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: designTokens.spacing.md }}>
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
        </div>

        {/* Add slide up animation */}
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};
