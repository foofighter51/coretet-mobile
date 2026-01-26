import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useDesignTokens } from '../../design/useDesignTokens';
import { DesktopSidebar } from './DesktopSidebar';
import { TabBar } from '../molecules/TabBar';
import { TabId } from '../../types';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSettingsClick: () => void;
  onUploadClick: () => void;
  onSignOut: () => void;
  bandName?: string;
  userName?: string;
  /** Whether to show bottom padding for PlaybackBar on mobile */
  hasPlaybackBar?: boolean;
}

/**
 * AdaptiveLayout - Responsive layout wrapper
 *
 * Desktop (>= 1024px):
 * - Left sidebar with navigation
 * - Main content area with proper max-width
 * - No bottom tab bar
 *
 * Mobile (< 1024px):
 * - No sidebar
 * - Bottom tab bar
 * - Full-width content
 */
export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onSettingsClick,
  onUploadClick,
  onSignOut,
  bandName,
  userName,
  hasPlaybackBar = false,
}) => {
  const { isDesktop } = useResponsive();
  const designTokens = useDesignTokens();

  if (isDesktop) {
    // Desktop Layout: Sidebar + Content Area
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: designTokens.colors.surface.tertiary,
        }}
      >
        {/* Sidebar */}
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          onSettingsClick={onSettingsClick}
          onUploadClick={onUploadClick}
          onSignOut={onSignOut}
          bandName={bandName}
          userName={userName}
        />

        {/* Main Content Area */}
        <main
          style={{
            marginLeft: designTokens.layout.sidebar.width,
            flex: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Content Container with max-width for readability */}
          <div
            style={{
              flex: 1,
              width: '100%',
              maxWidth: designTokens.layout.content.maxWidth,
              margin: '0 auto',
              padding: designTokens.layout.content.padding,
              boxSizing: 'border-box',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile Layout: Content + Bottom Tab Bar
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: designTokens.colors.surface.tertiary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          paddingBottom: hasPlaybackBar ? '164px' : '80px', // TabBar + PlaybackBar if playing
        }}
      >
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default AdaptiveLayout;
