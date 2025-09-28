/**
 * TabBar Component
 * CoreTet Design System - Molecular Component
 */

import React, { useState, useCallback } from 'react';
import { Text } from '../../atoms/Text';
import { tabBarStyles } from './TabBar.styles';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode | string;
  badge?: number;
  disabled?: boolean;
  'aria-label'?: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  disabled = false,
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const [focusedTab, setFocusedTab] = useState<string | null>(null);

  const handleTabPress = useCallback((tabId: string) => {
    if (disabled) return;
    
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;

    if (tabId !== activeTab) {
      onTabChange(tabId);
    }
  }, [disabled, tabs, activeTab, onTabChange]);

  const handleTabMouseDown = useCallback((tabId: string) => {
    setPressedTab(tabId);
  }, []);

  const handleTabMouseUp = useCallback(() => {
    setPressedTab(null);
  }, []);

  const handleTabMouseLeave = useCallback(() => {
    setPressedTab(null);
  }, []);

  const handleTabFocus = useCallback((tabId: string) => {
    setFocusedTab(tabId);
  }, []);

  const handleTabBlur = useCallback(() => {
    setFocusedTab(null);
  }, []);

  const handleTabKeyDown = useCallback((event: React.KeyboardEvent, tabId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabPress(tabId);
    }
  }, [handleTabPress]);

  const containerStyles = {
    ...tabBarStyles.container,
    ...style,
  };

  return (
    <nav
      className={className}
      style={containerStyles}
      role="tablist"
      aria-label="Main navigation"
      data-testid={testId}
    >
      <div style={tabBarStyles.content}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isPressed = pressedTab === tab.id;
          const isFocused = focusedTab === tab.id;
          const isTabDisabled = disabled || tab.disabled;

          const tabStyles = {
            ...tabBarStyles.tab,
            ...(isTabDisabled && tabBarStyles.tabDisabled),
            ...(isPressed && tabBarStyles.tabPressed),
            ...(isFocused && tabBarStyles.tabFocused),
          };

          const tabContentStyles = {
            ...tabBarStyles.tabContent,
            ...(isActive && tabBarStyles.tabContentActive),
          };

          const iconStyles = {
            ...tabBarStyles.icon,
            ...(isActive ? tabBarStyles.iconActive : tabBarStyles.iconInactive),
          };

          const labelStyles = {
            ...tabBarStyles.label,
            ...(isActive ? tabBarStyles.labelActive : tabBarStyles.labelInactive),
            ...(isTabDisabled && tabBarStyles.labelDisabled),
          };

          return (
            <button
              key={tab.id}
              style={tabStyles}
              onClick={() => handleTabPress(tab.id)}
              onMouseDown={() => handleTabMouseDown(tab.id)}
              onMouseUp={handleTabMouseUp}
              onMouseLeave={handleTabMouseLeave}
              onFocus={() => handleTabFocus(tab.id)}
              onBlur={handleTabBlur}
              onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
              disabled={isTabDisabled}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-label={tab['aria-label'] || `${tab.label} tab`}
              tabIndex={isTabDisabled ? -1 : 0}
            >
              <div style={tabContentStyles}>
                <div style={tabBarStyles.iconContainer}>
                  {tab.icon && (
                    <div style={iconStyles}>
                      {typeof tab.icon === 'string' ? (
                        <span>{tab.icon}</span>
                      ) : (
                        tab.icon
                      )}
                    </div>
                  )}
                  
                  {tab.badge && tab.badge > 0 && (
                    <div style={tabBarStyles.badge}>
                      <span style={tabBarStyles.badgeText}>
                        {tab.badge > 99 ? '99+' : tab.badge.toString()}
                      </span>
                    </div>
                  )}
                </div>

                <Text
                  variant="caption"
                  style={labelStyles}
                  noSelect
                >
                  {tab.label}
                </Text>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;