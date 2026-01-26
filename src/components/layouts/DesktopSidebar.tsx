import React from 'react';
import { List, Share2, Settings, LogOut, Music, Upload } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { TabId } from '../../types';

interface DesktopSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSettingsClick: () => void;
  onUploadClick: () => void;
  onSignOut: () => void;
  bandName?: string;
  userName?: string;
}

interface NavItem {
  id: TabId | 'settings' | 'upload';
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  onSettingsClick,
  onUploadClick,
  onSignOut,
  bandName,
  userName,
}) => {
  const designTokens = useDesignTokens();

  const navItems: NavItem[] = [
    { id: 'playlists', label: 'Set Lists', icon: List },
    { id: 'shared', label: 'Shared With Me', icon: Share2 },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'settings') {
      onSettingsClick();
    } else if (item.id === 'upload') {
      onUploadClick();
    } else {
      onTabChange(item.id as TabId);
    }
  };

  return (
    <aside
      style={{
        width: designTokens.layout.sidebar.width,
        height: '100vh',
        backgroundColor: designTokens.colors.surface.primary,
        borderRight: `1px solid ${designTokens.colors.borders.default}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        fontFamily: designTokens.typography.fontFamily,
      }}
    >
      {/* Logo / App Name */}
      <div
        style={{
          padding: designTokens.spacing.lg,
          borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.sm,
          }}
        >
          <Music size={28} color={designTokens.colors.primary.blue} />
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: designTokens.typography.fontWeights.bold,
              color: designTokens.colors.text.primary,
            }}
          >
            CoreTet
          </span>
        </div>
        {bandName && (
          <p
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              marginTop: designTokens.spacing.xs,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {bandName}
          </p>
        )}
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, padding: designTokens.spacing.md }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.md,
                padding: `${designTokens.spacing.md} ${designTokens.spacing.md}`,
                marginBottom: designTokens.spacing.xs,
                backgroundColor: isActive
                  ? designTokens.colors.surface.active
                  : 'transparent',
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                color: isActive
                  ? designTokens.colors.primary.blue
                  : designTokens.colors.text.primary,
                cursor: 'pointer',
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: isActive
                  ? designTokens.typography.fontWeights.semibold
                  : designTokens.typography.fontWeights.normal,
                fontFamily: designTokens.typography.fontFamily,
                textAlign: 'left',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    designTokens.colors.surface.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            padding: `${designTokens.spacing.md} ${designTokens.spacing.md}`,
            marginTop: designTokens.spacing.lg,
            backgroundColor: designTokens.colors.primary.blue,
            border: 'none',
            borderRadius: designTokens.borderRadius.sm,
            color: designTokens.colors.neutral.white,
            cursor: 'pointer',
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            fontFamily: designTokens.typography.fontFamily,
            textAlign: 'left',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              designTokens.colors.primary.blueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              designTokens.colors.primary.blue;
          }}
        >
          <Upload size={20} />
          Upload Track
        </button>
      </nav>

      {/* Bottom Section - Settings & User */}
      <div
        style={{
          padding: designTokens.spacing.md,
          borderTop: `1px solid ${designTokens.colors.borders.default}`,
        }}
      >
        {/* Settings */}
        <button
          onClick={onSettingsClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.md,
            padding: `${designTokens.spacing.md} ${designTokens.spacing.md}`,
            marginBottom: designTokens.spacing.sm,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: designTokens.borderRadius.sm,
            color: designTokens.colors.text.secondary,
            cursor: 'pointer',
            fontSize: designTokens.typography.fontSizes.body,
            fontFamily: designTokens.typography.fontFamily,
            textAlign: 'left',
            transition: 'background-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              designTokens.colors.surface.hover;
            e.currentTarget.style.color = designTokens.colors.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = designTokens.colors.text.secondary;
          }}
        >
          <Settings size={20} />
          Settings
        </button>

        {/* User Info & Sign Out */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
            backgroundColor: designTokens.colors.surface.secondary,
            borderRadius: designTokens.borderRadius.sm,
          }}
        >
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {userName || 'User'}
          </span>
          <button
            onClick={onSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: designTokens.spacing.xs,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: designTokens.borderRadius.sm,
              color: designTokens.colors.text.muted,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = designTokens.colors.system.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = designTokens.colors.text.muted;
            }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
