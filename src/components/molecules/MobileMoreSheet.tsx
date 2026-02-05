import React from 'react';
import { Share2, Settings, User, LogOut, ChevronRight, Trash2 } from 'lucide-react';
import { BottomSheetModal } from '../ui/BottomSheetModal';
import { useDesignTokens } from '../../design/useDesignTokens';

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShared: () => void;
  onOpenSettings: () => void;
  onOpenRecycleBin?: () => void;
  onSignOut: () => void;
  userName?: string;
  userEmail?: string;
}

/**
 * MobileMoreSheet - Bottom sheet with secondary navigation options
 *
 * Accessible from the "More" tab on mobile. Contains:
 * - Shared With Me (secondary navigation)
 * - Settings
 * - Recycle Bin
 * - Sign Out
 */
export function MobileMoreSheet({
  isOpen,
  onClose,
  onNavigateToShared,
  onOpenSettings,
  onOpenRecycleBin,
  onSignOut,
  userName,
  userEmail,
}: MobileMoreSheetProps) {
  const designTokens = useDesignTokens();

  const menuItems = [
    {
      id: 'shared',
      label: 'Shared With Me',
      icon: Share2,
      onClick: () => {
        onClose();
        onNavigateToShared();
      },
      showChevron: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        onClose();
        onOpenSettings();
      },
      showChevron: true,
    },
    ...(onOpenRecycleBin ? [{
      id: 'recycle',
      label: 'Recycle Bin',
      icon: Trash2,
      onClick: () => {
        onClose();
        onOpenRecycleBin();
      },
      showChevron: true,
    }] : []),
  ];

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="More"
    >
      {/* User Info Section */}
      {(userName || userEmail) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            padding: designTokens.spacing.md,
            marginBottom: designTokens.spacing.md,
            backgroundColor: designTokens.colors.surface.secondary,
            borderRadius: designTokens.borderRadius.md,
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.primary.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={24} color={designTokens.colors.neutral.white} />
          </div>
          <div style={{ flex: 1 }}>
            {userName && (
              <p
                style={{
                  margin: 0,
                  fontSize: designTokens.typography.fontSizes.body,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.text.primary,
                }}
              >
                {userName}
              </p>
            )}
            {userEmail && (
              <p
                style={{
                  margin: 0,
                  marginTop: designTokens.spacing.xs,
                  fontSize: designTokens.typography.fontSizes.caption,
                  color: designTokens.colors.text.muted,
                }}
              >
                {userEmail}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: designTokens.spacing.xs,
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.md,
                padding: designTokens.spacing.md,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: designTokens.borderRadius.md,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.surface.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={20} color={designTokens.colors.text.secondary} />
              <span
                style={{
                  flex: 1,
                  fontSize: designTokens.typography.fontSizes.body,
                  color: designTokens.colors.text.primary,
                }}
              >
                {item.label}
              </span>
              {item.showChevron && (
                <ChevronRight size={18} color={designTokens.colors.text.muted} />
              )}
            </button>
          );
        })}
      </div>

      {/* Sign Out Button */}
      <div
        style={{
          marginTop: designTokens.spacing.lg,
          paddingTop: designTokens.spacing.md,
          borderTop: `1px solid ${designTokens.colors.borders.default}`,
        }}
      >
        <button
          onClick={() => {
            onClose();
            onSignOut();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            padding: designTokens.spacing.md,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: designTokens.borderRadius.md,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${designTokens.colors.system.error}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={20} color={designTokens.colors.system.error} />
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.system.error,
            }}
          >
            Sign Out
          </span>
        </button>
      </div>
    </BottomSheetModal>
  );
}

export default MobileMoreSheet;
