import React from 'react';
import { TabBar } from './TabBar';

interface ScreenTemplateProps {
  children: React.ReactNode;
  
  // Navigation Bar Props
  navigationTitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  showNavigationBar?: boolean;
  
  // Tab Bar Props
  showTabBar?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  
  // Layout Props
  className?: string;
  contentClassName?: string;
}

export function ScreenTemplate({
  children,
  navigationTitle,
  leftAction,
  rightAction,
  showNavigationBar = true,
  showTabBar = true,
  activeTab,
  onTabChange,
  className,
  contentClassName
}: ScreenTemplateProps) {
  return (
    <div 
      className={`w-mobile h-mobile bg-off-white mx-auto overflow-hidden flex flex-col ${className || ''}`}
    >
      {/* 1. Status Bar: 44px system default */}
      <div style={{ height: '44px' }} className="bg-white" />
      
      {/* 2. Navigation Bar: 44px white background */}
      {showNavigationBar && (
        <header 
          className="bg-white sticky top-0 z-20 flex-shrink-0"
          style={{ 
            height: '44px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e1e4e8',
            boxShadow: '0px 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          <div 
            className="flex items-center justify-between px-4 h-full"
          >
            {/* Left Action */}
            <div style={{ width: '44px' }} className="flex justify-start">
              {leftAction}
            </div>

            {/* Center Title */}
            <div className="flex-1 flex justify-center">
              {navigationTitle && (
                <h1 
                  className="text-center"
                  style={{ 
                    fontSize: '20px',
                    fontWeight: '600',
                    lineHeight: '24px',
                    color: '#1e252b'
                  }}
                >
                  {navigationTitle}
                </h1>
              )}
            </div>

            {/* Right Action */}
            <div style={{ width: '44px' }} className="flex justify-end">
              {rightAction}
            </div>
          </div>
        </header>
      )}
      
      {/* 3. Content Area: Variable height, #fafbfc background */}
      <main 
        className={`flex-1 overflow-y-auto overflow-x-hidden list-view-content ${contentClassName || ''}`}
        style={{ 
          backgroundColor: 'var(--list-background)',
          paddingTop: 'var(--content-padding-top)',
          paddingLeft: 'var(--content-padding-horizontal)',
          paddingRight: 'var(--content-padding-horizontal)',
          paddingBottom: showTabBar ? '107px' : '24px', // 83px tab bar + 24px bottom padding
          // Elastic bounce scroll behavior
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </main>
      
      {/* 4. Tab Bar: 83px including safe area */}
      {showTabBar && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex-shrink-0">
          <TabBar 
            activeTab={activeTab || 'ensembles'} 
            onTabChange={onTabChange || (() => {})} 
          />
        </div>
      )}
    </div>
  );
}

// Section spacing utility component
export function ScreenSection({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <section 
      className={className}
      style={{ marginBottom: '24px' }}
    >
      {children}
    </section>
  );
}

// Card grid utility component with exact 8px spacing
export function CardGrid({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {children}
    </div>
  );
}