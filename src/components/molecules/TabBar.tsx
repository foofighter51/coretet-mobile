import React, { memo } from 'react';
import { Users, Music, List } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { TabId, TabItem } from '../../types';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: TabItem[] = [
  { id: 'playlists', label: 'Playlists', icon: List },
  { id: 'tracks', label: 'Tracks', icon: Music },
  { id: 'profile', label: 'Profile', icon: Users }
];

export const TabBar = memo(function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      style={{
        flexShrink: 0,
        backgroundColor: designTokens.colors.neutral.white,
        borderTop: `1px solid ${designTokens.colors.neutral.lightGray}`,
        padding: `${designTokens.spacing.xs} 0`,
        paddingBottom: 'calc(var(--safe-area-inset-bottom, 0px) + 8px)',
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
              onClick={() => onTabChange(tab.id)}
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