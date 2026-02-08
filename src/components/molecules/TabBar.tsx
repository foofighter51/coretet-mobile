import React, { memo } from 'react';
import { Folder, Music, List } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { TabId, TabItem } from '../../types';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: TabItem[] = [
  { id: 'library', label: 'Library', icon: Folder },
  { id: 'works', label: 'Works', icon: Music },
  { id: 'playlists', label: 'Set Lists', icon: List },
];

export const TabBar = memo(function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const designTokens = useDesignTokens();

  const handleTabClick = (tabId: TabId) => {
    onTabChange(tabId);
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
          const isActive = activeTab === tab.id;

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
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              aria-label={`${tab.label} tab`}
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