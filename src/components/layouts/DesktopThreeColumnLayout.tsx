import React from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { DesktopSidebarWithTree } from './DesktopSidebarWithTree';
import { TabId } from '../../types';

interface SetListItem {
  id: string;
  title: string;
  track_count?: number;
}

interface DesktopThreeColumnLayoutProps {
  children: React.ReactNode;
  detailPanel?: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSettingsClick: () => void;
  onUploadClick: () => void;
  onSignOut: () => void;
  bandName?: string;
  userName?: string;
  /** Set lists for the tree navigation */
  setLists?: SetListItem[];
  /** Currently selected set list ID */
  selectedSetListId?: string | null;
  /** Callback when a set list is selected */
  onSetListSelect?: (setList: SetListItem) => void;
  /** Callback to create new set list */
  onCreateSetList?: () => void;
  /** Whether detail panel should be shown */
  showDetailPanel?: boolean;
}

/**
 * DesktopThreeColumnLayout - Three-column layout for desktop web app
 *
 * Column 1: Sidebar (240px fixed) - Navigation + Set List tree
 * Column 2: Track List (flex: 1) - Main content area
 * Column 3: Detail Panel (flex: 1) - Track details, waveform, comments (equal width to track list)
 */
export const DesktopThreeColumnLayout: React.FC<DesktopThreeColumnLayoutProps> = ({
  children,
  detailPanel,
  activeTab,
  onTabChange,
  onSettingsClick,
  onUploadClick,
  onSignOut,
  bandName,
  userName,
  setLists = [],
  selectedSetListId,
  onSetListSelect,
  onCreateSetList,
  showDetailPanel = true,
}) => {
  const designTokens = useDesignTokens();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: designTokens.colors.surface.tertiary,
      }}
    >
      {/* Column 1: Sidebar with tree navigation */}
      <DesktopSidebarWithTree
        activeTab={activeTab}
        onTabChange={onTabChange}
        onSettingsClick={onSettingsClick}
        onUploadClick={onUploadClick}
        onSignOut={onSignOut}
        bandName={bandName}
        userName={userName}
        setLists={setLists}
        selectedSetListId={selectedSetListId}
        onSetListSelect={onSetListSelect}
        onCreateSetList={onCreateSetList}
      />

      {/* Column 2: Track List / Main Content */}
      <main
        style={{
          marginLeft: designTokens.layout.sidebar.width,
          flex: 1,
          minWidth: 0, // Allow flex shrink
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: designTokens.colors.surface.primary,
          borderRight: showDetailPanel && detailPanel
            ? `1px solid ${designTokens.colors.borders.default}`
            : 'none',
        }}
      >
        {children}
      </main>

      {/* Column 3: Detail Panel - equal width to track list */}
      {showDetailPanel && detailPanel && (
        <aside
          style={{
            flex: 1, // Equal width to track list (both flex: 1)
            minWidth: 0, // Allow flex shrink
            minHeight: '100vh',
            backgroundColor: designTokens.colors.surface.secondary,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {detailPanel}
        </aside>
      )}
    </div>
  );
};

export default DesktopThreeColumnLayout;
