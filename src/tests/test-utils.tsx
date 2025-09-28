/**
 * CoreTet Design System - Test Utilities
 * Common utilities for testing design consistency
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Custom render function with design system providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Wrapper component with design system context
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '16px',
      width: '375px', // CoreTet mobile width
      backgroundColor: '#fafbfc' // CoreTet off-white background
    }}>
      {children}
    </div>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Design token validation utilities
export const validateColor = (element: Element, property: string, expectedHex: string): boolean => {
  const computed = window.getComputedStyle(element).getPropertyValue(property);
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  return computed.replace(/\s/g, '') === hexToRgb(expectedHex).replace(/\s/g, '');
};

export const validateDimensions = (element: Element, expectedWidth: number, expectedHeight: number): boolean => {
  const rect = element.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  
  return width === expectedWidth && height === expectedHeight;
};

export const validateTypography = (element: Element, expectedFont: {
  size: string;
  weight: string;
  lineHeight: string;
  family?: string;
}): boolean => {
  const computed = window.getComputedStyle(element);
  
  const fontSize = computed.getPropertyValue('font-size');
  const fontWeight = computed.getPropertyValue('font-weight');
  const lineHeight = computed.getPropertyValue('line-height');
  const fontFamily = computed.getPropertyValue('font-family');
  
  let isValid = fontSize === expectedFont.size &&
                fontWeight === expectedFont.weight &&
                lineHeight === expectedFont.lineHeight;
  
  if (expectedFont.family) {
    isValid = isValid && fontFamily.includes(expectedFont.family);
  }
  
  return isValid;
};

export const validateSpacing = (element: Element, property: string, expectedPx: number): boolean => {
  const computed = window.getComputedStyle(element).getPropertyValue(property);
  const value = parseInt(computed.replace('px', ''));
  
  return value === expectedPx;
};

export const validateBorderRadius = (element: Element, expectedPx: number): boolean => {
  const computed = window.getComputedStyle(element).getPropertyValue('border-radius');
  const value = parseInt(computed.replace('px', ''));
  
  return value === expectedPx;
};

export const validateShadow = (element: Element, expectedShadow: string): boolean => {
  const computed = window.getComputedStyle(element).getPropertyValue('box-shadow');
  
  // Normalize shadow values for comparison
  const normalize = (shadow: string) => shadow.replace(/\s+/g, ' ').trim();
  
  return normalize(computed) === normalize(expectedShadow);
};

export const validateTransition = (element: Element, expectedDuration: string): boolean => {
  const computed = window.getComputedStyle(element).getPropertyValue('transition');
  
  return computed.includes(expectedDuration);
};

export const validateTouchTarget = (element: Element, minSize: number = 44): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= minSize && rect.height >= minSize;
};

export const validateContrastRatio = (foregroundColor: string, backgroundColor: string): number => {
  // Simplified contrast calculation for testing
  // In production, use a proper contrast calculation library
  const getLuminance = (color: string): number => {
    // Extract RGB values
    const rgb = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (!rgb) return 0.5; // Default neutral luminance
    
    const [, r, g, b] = rgb.map(Number);
    
    // Convert to relative luminance (simplified)
    const sRGB = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const l1 = getLuminance(foregroundColor);
  const l2 = getLuminance(backgroundColor);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const validateAccessibility = async (container: Element): Promise<void> => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Animation testing utilities
export const waitForAnimation = (duration: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

export const validateAnimationState = (element: Element, property: string, expectedValue: string): boolean => {
  const computed = window.getComputedStyle(element).getPropertyValue(property);
  return computed === expectedValue;
};

// Performance testing utilities
export const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const validatePerformance = (renderTime: number, maxTime: number = 100): boolean => {
  return renderTime <= maxTime;
};

// Gesture simulation utilities
export const simulateSwipe = (element: Element, direction: 'left' | 'right', distance: number = 100): void => {
  const startX = direction === 'left' ? distance : 0;
  const endX = direction === 'left' ? 0 : distance;
  
  // Simulate touch events
  const touchStart = new TouchEvent('touchstart', {
    touches: [new Touch({
      identifier: 0,
      target: element,
      clientX: startX,
      clientY: 0,
    })]
  });
  
  const touchMove = new TouchEvent('touchmove', {
    touches: [new Touch({
      identifier: 0,
      target: element,
      clientX: endX,
      clientY: 0,
    })]
  });
  
  const touchEnd = new TouchEvent('touchend', {
    changedTouches: [new Touch({
      identifier: 0,
      target: element,
      clientX: endX,
      clientY: 0,
    })]
  });
  
  element.dispatchEvent(touchStart);
  element.dispatchEvent(touchMove);
  element.dispatchEvent(touchEnd);
};

export const simulatePress = (element: Element): void => {
  // Simulate mouse press
  const mouseDown = new MouseEvent('mousedown', { bubbles: true });
  const mouseUp = new MouseEvent('mouseup', { bubbles: true });
  
  element.dispatchEvent(mouseDown);
  setTimeout(() => element.dispatchEvent(mouseUp), 100);
};

// Responsive testing utilities
export const setViewportSize = (width: number, height: number): void => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  window.dispatchEvent(new Event('resize'));
};

export const validateResponsiveBreakpoint = (element: Element, breakpoint: number): boolean => {
  const width = element.getBoundingClientRect().width;
  return width <= breakpoint;
};

// Error boundary for testing error states
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Test error boundary caught an error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Mock intersection observer for testing
export const mockIntersectionObserver = (): void => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

// Mock resize observer for testing
export const mockResizeObserver = (): void => {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

// Export custom render as default
export { customRender as render };
export * from '@testing-library/react';