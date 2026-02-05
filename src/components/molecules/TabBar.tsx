import React, { memo } from 'react';
import { Folder, Music, List, MoreHorizontal } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { TabId, TabItem } from '../../types';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  /** Called when More tab is pressed (opens bottom sheet) */
  onMorePress?: () => void;
}

const tabs: TabItem[] = [
  { id: 'library', label: 'Library', icon: Folder },
  { id: 'works', label: 'Works', icon: Music },
  { id: 'playlists', label: 'Set Lists', icon: List },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export const TabBar = memo(function TabBar({ activeTab, onTabChange, onMorePress }: TabBarProps) {
  const designTokens = useDesignTokens();

  const handleTabClick = (tabId: TabId) => {
    if (tabId === 'more') {
      // More tab opens a bottom sheet instead of switching tabs
      onMorePress?.();
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: designTokens.colors.surface.primary,
        borderTop: `1px solid ${designTokens.colors.borders.default}`,
        padding: `${designTokens.spacing.xs} 0`,
        paddingBottom: '20px',
        minHeight: '60px',
        width: '100%',
      }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // More tab is never "active" - it opens a sheet
          const isActive = tab.id !== 'more' && activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: `4px ${designTokens.spacing.xs}`,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: isActive ? designTokens.colors.primary.blue : designTokens.colors.neutral.gray,
                fontFamily: designTokens.typography.fontFamily,
                transition: 'color 0.2s ease'
              }}
              role={tab.id === 'more' ? 'button' : 'tab'}
              aria-selected={tab.id !== 'more' ? isActive : undefined}
              aria-controls={tab.id !== 'more' ? `${tab.id}-panel` : undefined}
              aria-label={tab.id === 'more' ? 'More options' : `${tab.label} tab`}
              aria-haspopup={tab.id === 'more' ? 'menu' : undefined}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = designTokens.colors.neutral.darkGray;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = designTokens.colors.neutral.gray;
                }
              }}
            >
              <Icon size={20} aria-hidden="true" />
              <span
                style={{
                  fontSize: designTokens.typography.fontSizes.caption,
                  fontWeight: isActive ? designTokens.typography.fontWeights.semibold : designTokens.typography.fontWeights.normal
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});