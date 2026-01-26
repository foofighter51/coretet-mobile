import { useState, useEffect } from 'react';

/**
 * Responsive breakpoint state
 * - Mobile: < 768px (smartphones)
 * - Tablet: 768px - 1024px (iPads)
 * - Desktop: > 1024px (laptops, desktops)
 */
export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Hook to detect current viewport breakpoint
 * Updates on window resize with debouncing
 *
 * @example
 * const { isDesktop, isMobile, breakpoint } = useResponsive();
 *
 * if (isDesktop) {
 *   return <DesktopLayout />;
 * } else {
 *   return <MobileLayout />;
 * }
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // SSR-safe initialization
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;

    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width,
      height,
      breakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
    };
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events (wait 100ms after last resize)
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        setState({
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
          width,
          height,
          breakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return state;
}

/**
 * Convenience hook: Check if viewport is desktop
 * @returns true if width >= 1024px
 */
export function useIsDesktop(): boolean {
  const { isDesktop } = useResponsive();
  return isDesktop;
}

/**
 * Convenience hook: Check if viewport is mobile
 * @returns true if width < 768px
 */
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

/**
 * Convenience hook: Check if viewport is tablet
 * @returns true if 768px <= width < 1024px
 */
export function useIsTablet(): boolean {
  const { isTablet } = useResponsive();
  return isTablet;
}
