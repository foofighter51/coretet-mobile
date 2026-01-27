import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Share2, Settings, LogOut, Upload, Plus, List, Music, Trash2 } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { TabId } from '../../types';

interface SetListItem {
  id: string;
  title: string;
  track_count?: number;
}

interface WorkItem {
  id: string;
  name: string;
  version_count?: number;
  hero_track_id?: string | null;
}

interface DesktopSidebarWithTreeProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSettingsClick: () => void;
  onUploadClick: () => void;
  onSignOut: () => void;
  onRecycleBinClick?: () => void;
  bandName?: string;
  userName?: string;
  setLists?: SetListItem[];
  selectedSetListId?: string | null;
  onSetListSelect?: (setList: SetListItem) => void;
  onCreateSetList?: () => void;
  /** Works (song projects) containing multiple track versions */
  works?: WorkItem[];
  selectedWorkId?: string | null;
  onWorkSelect?: (work: WorkItem) => void;
  onCreateWork?: () => void;
}

export const DesktopSidebarWithTree: React.FC<DesktopSidebarWithTreeProps> = ({
  activeTab,
  onTabChange,
  onSettingsClick,
  onUploadClick,
  onSignOut,
  onRecycleBinClick,
  bandName,
  userName,
  setLists = [],
  selectedSetListId,
  onSetListSelect,
  onCreateSetList,
  works = [],
  selectedWorkId,
  onWorkSelect,
  onCreateWork,
}) => {
  const designTokens = useDesignTokens();
  const [setListsExpanded, setSetListsExpanded] = useState(true);
  const [worksExpanded, setWorksExpanded] = useState(true);
  const [sharedExpanded, setSharedExpanded] = useState(false);

  const handleSetListClick = (setList: SetListItem) => {
    onSetListSelect?.(setList);
    onTabChange('playlists');
  };

  const handleWorkClick = (work: WorkItem) => {
    onWorkSelect?.(work);
    onTabChange('works');
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
      {/* Logo & Brand */}
      <div
        style={{
          padding: designTokens.spacing.md,
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
          <img
            src="/logo-light.png"
            alt="CoreTet"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: 0,
              marginTop: '4px',
            }}
          >
            {bandName}
          </p>
        )}
      </div>

      {/* Navigation Tree */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: designTokens.spacing.sm }}>
        {/* Set Lists Section */}
        <div style={{ marginBottom: designTokens.spacing.sm }}>
          {/* Set Lists Header (expandable) */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
              backgroundColor: activeTab === 'playlists' && !selectedSetListId
                ? designTokens.colors.surface.active
                : 'transparent',
              borderRadius: designTokens.borderRadius.sm,
              color: activeTab === 'playlists'
                ? designTokens.colors.primary.blue
                : designTokens.colors.text.primary,
              cursor: 'pointer',
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              fontFamily: designTokens.typography.fontFamily,
            }}
            onClick={() => {
              setSetListsExpanded(!setListsExpanded);
              onTabChange('playlists');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSetListsExpanded(!setListsExpanded);
                onTabChange('playlists');
              }
            }}
          >
            {setListsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <List size={18} />
            <span style={{ flex: 1 }}>Set Lists</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateSetList?.();
              }}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.text.tertiary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Create new set list"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Set Lists Tree Items */}
          {setListsExpanded && (
            <div style={{ marginLeft: '24px', marginTop: '2px' }}>
              {setLists.length === 0 ? (
                <div
                  style={{
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.muted,
                    fontStyle: 'italic',
                  }}
                >
                  No set lists yet
                </div>
              ) : (
                setLists.map((setList) => (
                  <button
                    key={setList.id}
                    onClick={() => handleSetListClick(setList)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: designTokens.spacing.sm,
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: selectedSetListId === setList.id
                        ? designTokens.colors.surface.active
                        : 'transparent',
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      color: selectedSetListId === setList.id
                        ? designTokens.colors.primary.blue
                        : designTokens.colors.text.secondary,
                      cursor: 'pointer',
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      fontFamily: designTokens.typography.fontFamily,
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {setList.title}
                    </span>
                    {setList.track_count !== undefined && (
                      <span
                        style={{
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.text.muted,
                          flexShrink: 0,
                        }}
                      >
                        {setList.track_count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Works Section (Song Projects) */}
        <div style={{ marginBottom: designTokens.spacing.sm }}>
          {/* Works Header (expandable) */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
              backgroundColor: activeTab === 'works' && !selectedWorkId
                ? designTokens.colors.surface.active
                : 'transparent',
              borderRadius: designTokens.borderRadius.sm,
              color: activeTab === 'works'
                ? designTokens.colors.primary.blue
                : designTokens.colors.text.primary,
              cursor: 'pointer',
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              fontFamily: designTokens.typography.fontFamily,
            }}
            onClick={() => {
              setWorksExpanded(!worksExpanded);
              onTabChange('works');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setWorksExpanded(!worksExpanded);
                onTabChange('works');
              }
            }}
          >
            {worksExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Music size={18} />
            <span style={{ flex: 1 }}>Works</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateWork?.();
              }}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                color: designTokens.colors.text.tertiary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Create new work"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Works Tree Items */}
          {worksExpanded && (
            <div style={{ marginLeft: '24px', marginTop: '2px' }}>
              {works.length === 0 ? (
                <div
                  style={{
                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.text.muted,
                    fontStyle: 'italic',
                  }}
                >
                  No works yet
                </div>
              ) : (
                works.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => handleWorkClick(work)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: designTokens.spacing.sm,
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: selectedWorkId === work.id
                        ? designTokens.colors.surface.active
                        : 'transparent',
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      color: selectedWorkId === work.id
                        ? designTokens.colors.primary.blue
                        : designTokens.colors.text.secondary,
                      cursor: 'pointer',
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      fontFamily: designTokens.typography.fontFamily,
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {work.name}
                    </span>
                    {work.version_count !== undefined && (
                      <span
                        style={{
                          fontSize: designTokens.typography.fontSizes.caption,
                          color: designTokens.colors.text.muted,
                          flexShrink: 0,
                        }}
                      >
                        {work.version_count} {work.version_count === 1 ? 'version' : 'versions'}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Shared With Me Section */}
        <div style={{ marginBottom: designTokens.spacing.sm }}>
          <button
            onClick={() => {
              setSharedExpanded(!sharedExpanded);
              onTabChange('shared');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
              backgroundColor: activeTab === 'shared'
                ? designTokens.colors.surface.active
                : 'transparent',
              border: 'none',
              borderRadius: designTokens.borderRadius.sm,
              color: activeTab === 'shared'
                ? designTokens.colors.primary.blue
                : designTokens.colors.text.primary,
              cursor: 'pointer',
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              fontFamily: designTokens.typography.fontFamily,
              textAlign: 'left',
            }}
          >
            {sharedExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Share2 size={18} />
            <span>Shared With Me</span>
          </button>
        </div>

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.sm,
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
            marginTop: designTokens.spacing.md,
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
        >
          <Upload size={18} />
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
            gap: designTokens.spacing.sm,
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
            marginBottom: designTokens.spacing.xs,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: designTokens.borderRadius.sm,
            color: designTokens.colors.text.secondary,
            cursor: 'pointer',
            fontSize: designTokens.typography.fontSizes.body,
            fontFamily: designTokens.typography.fontFamily,
            textAlign: 'left',
          }}
        >
          <Settings size={18} />
          Settings
        </button>

        {/* Recycle Bin */}
        {onRecycleBinClick && (
          <button
            onClick={onRecycleBinClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.sm,
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
              marginBottom: designTokens.spacing.sm,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: designTokens.borderRadius.sm,
              color: designTokens.colors.text.secondary,
              cursor: 'pointer',
              fontSize: designTokens.typography.fontSizes.body,
              fontFamily: designTokens.typography.fontFamily,
              textAlign: 'left',
            }}
          >
            <Trash2 size={18} />
            Recycle Bin
          </button>
        )}

        {/* User Info & Sign Out */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.sm}`,
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
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebarWithTree;
