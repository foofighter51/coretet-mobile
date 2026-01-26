/**
 * Debug component to test responsive hook
 * Add this temporarily to MainDashboard to verify breakpoints work
 *
 * Usage:
 * import { ResponsiveDebug } from '../debug/ResponsiveDebug';
 *
 * // Add near top of render:
 * <ResponsiveDebug />
 */

import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useDesignTokens } from '../../design/useDesignTokens';

export const ResponsiveDebug: React.FC = () => {
  const { isMobile, isTablet, isDesktop, width, breakpoint } = useResponsive();
  const tokens = useDesignTokens();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#00ff00',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        pointerEvents: 'none',
        lineHeight: '1.6',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ffff00' }}>
        📐 Responsive Debug
      </div>
      <div>Width: {width}px</div>
      <div>Breakpoint: <span style={{ color: '#00ffff' }}>{breakpoint}</span></div>
      <div>Mobile: {isMobile ? '✅' : '❌'} (&lt; 768px)</div>
      <div>Tablet: {isTablet ? '✅' : '❌'} (768-1024px)</div>
      <div>Desktop: {isDesktop ? '✅' : '❌'} (&gt;= 1024px)</div>
      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
        MaxWidth: {isMobile ? '425px' : 'full'}
      </div>
    </div>
  );
};
