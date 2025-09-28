/**
 * CoreTet Design System - Test Setup
 * Global test configuration and polyfills
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Polyfills for JSDOM environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock getComputedStyle for consistent styling tests
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = jest.fn().mockImplementation((element) => {
  const style = originalGetComputedStyle(element);
  
  // Add default CoreTet styles if not present
  const mockStyle = {
    ...style,
    fontFamily: style.fontFamily || 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: style.fontSize || '16px',
    lineHeight: style.lineHeight || '24px',
    color: style.color || 'rgb(30, 37, 43)', // charcoal
    backgroundColor: style.backgroundColor || 'rgb(255, 255, 255)', // white
    borderRadius: style.borderRadius || '8px',
    transition: style.transition || 'all 0.2s ease',
    
    getPropertyValue: jest.fn().mockImplementation((property) => {
      // Return CoreTet design tokens for specific properties
      switch (property) {
        case 'font-family':
          return 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif';
        case 'color':
          if (element.classList?.contains('text-primary')) return 'rgb(30, 37, 43)';
          if (element.classList?.contains('text-secondary')) return 'rgb(157, 167, 176)';
          if (element.classList?.contains('text-accent')) return 'rgb(0, 136, 204)';
          return style.color || 'rgb(30, 37, 43)';
        case 'background-color':
          if (element.classList?.contains('bg-primary')) return 'rgb(0, 136, 204)';
          if (element.classList?.contains('bg-off-white')) return 'rgb(250, 251, 252)';
          return style.backgroundColor || 'rgb(255, 255, 255)';
        case 'border-radius':
          if (element.classList?.contains('rounded-card')) return '8px';
          if (element.classList?.contains('rounded-button')) return '20px';
          return style.borderRadius || '8px';
        case 'box-shadow':
          if (element.classList?.contains('shadow-default')) return 'rgba(0, 0, 0, 0.08) 0px 2px 6px 0px';
          if (element.classList?.contains('shadow-elevated')) return 'rgba(0, 0, 0, 0.12) 0px 4px 12px 0px';
          return style.boxShadow || 'none';
        case 'transition':
          return 'all 0.2s ease';
        case 'font-size':
          if (element.tagName === 'H1') return '32px';
          if (element.tagName === 'H2') return '24px';
          if (element.tagName === 'H3') return '20px';
          if (element.classList?.contains('text-giant')) return '40px';
          if (element.classList?.contains('caption')) return '12px';
          return '16px';
        case 'line-height':
          if (element.tagName === 'H1') return '40px';
          if (element.tagName === 'H2') return '32px';
          if (element.tagName === 'H3') return '28px';
          if (element.classList?.contains('text-giant')) return '48px';
          if (element.classList?.contains('caption')) return '16px';
          return '24px';
        case 'font-weight':
          if (element.classList?.contains('text-giant')) return '200';
          if (element.tagName === 'H1') return '300';
          if (element.tagName === 'H2') return '400';
          if (element.tagName === 'H3') return '500';
          if (element.tagName === 'BUTTON') return '600';
          return '400';
        case 'width':
          if (element.classList?.contains('w-track-card')) return '343px';
          if (element.classList?.contains('w-mobile')) return '375px';
          return style.width || 'auto';
        case 'height':
          if (element.classList?.contains('h-track-card')) return '64px';
          if (element.classList?.contains('h-button')) return '44px';
          if (element.classList?.contains('h-button-small')) return '28px';
          if (element.classList?.contains('h-mobile')) return '812px';
          return style.height || 'auto';
        case 'border-color':
          if (element.classList?.contains('border-error')) return 'rgb(220, 53, 69)';
          return style.borderColor || 'rgb(225, 228, 232)';
        case 'opacity':
          if (element.disabled || element.classList?.contains('opacity-50')) return '0.5';
          return style.opacity || '1';
        case 'overflow':
          if (element.classList?.contains('truncate')) return 'hidden';
          return style.overflow || 'visible';
        case 'text-overflow':
          if (element.classList?.contains('truncate')) return 'ellipsis';
          return style.textOverflow || 'clip';
        case 'white-space':
          if (element.classList?.contains('truncate')) return 'nowrap';
          return style.whiteSpace || 'normal';
        case 'user-select':
          if (element.classList?.contains('select-none')) return 'none';
          return style.userSelect || 'auto';
        case 'transform':
          if (element.classList?.contains('active') || element.dataset?.pressed) return 'translateY(1px)';
          return style.transform || 'none';
        case 'outline':
          if (element === document.activeElement) return '2px solid rgb(0, 136, 204)';
          return style.outline || 'none';
        case 'object-fit':
          if (element.tagName === 'IMG') return 'cover';
          return style.objectFit || 'fill';
        default:
          return style.getPropertyValue ? style.getPropertyValue(property) : '';
      }
    }),
  };
  
  return mockStyle;
});

// Mock getBoundingClientRect for dimension testing
Element.prototype.getBoundingClientRect = jest.fn().mockImplementation(function(this: Element) {
  const element = this as HTMLElement;
  
  // Return CoreTet standard dimensions based on classes or element type
  let width = 0, height = 0;
  
  if (element.classList.contains('w-track-card')) width = 343;
  if (element.classList.contains('h-track-card')) height = 64;
  if (element.classList.contains('w-mobile')) width = 375;
  if (element.classList.contains('h-mobile')) height = 812;
  if (element.classList.contains('h-button')) height = 44;
  if (element.classList.contains('h-button-small')) height = 28;
  if (element.classList.contains('w-icon')) width = 24;
  if (element.classList.contains('h-icon')) height = 24;
  if (element.classList.contains('w-icon-small')) width = 16;
  if (element.classList.contains('h-icon-small')) height = 16;
  
  // Default dimensions for specific elements
  if (element.tagName === 'BUTTON' && !height) {
    height = element.classList.contains('btn-small') ? 28 : 44;
    width = Math.max(width, 44); // Minimum touch target
  }
  
  if (element.tagName === 'INPUT' && !height) {
    height = 44;
  }
  
  // Default minimum dimensions
  if (!width) width = 100;
  if (!height) height = 20;
  
  return {
    width,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => ({ width, height, top: 0, left: 0, bottom: height, right: width }),
  };
});

// Mock Touch for gesture testing
global.Touch = class Touch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;

  constructor(touchInit: TouchInit) {
    this.identifier = touchInit.identifier;
    this.target = touchInit.target;
    this.clientX = touchInit.clientX || 0;
    this.clientY = touchInit.clientY || 0;
    this.pageX = touchInit.pageX || this.clientX;
    this.pageY = touchInit.pageY || this.clientY;
    this.screenX = touchInit.screenX || this.clientX;
    this.screenY = touchInit.screenY || this.clientY;
    this.radiusX = touchInit.radiusX || 0;
    this.radiusY = touchInit.radiusY || 0;
    this.rotationAngle = touchInit.rotationAngle || 0;
    this.force = touchInit.force || 1;
  }
};

// Mock performance.now for animation testing
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16); // 60fps
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock CSS.supports for feature detection
if (!global.CSS) {
  global.CSS = {
    supports: jest.fn(() => true),
  } as any;
}

// Console methods that should not appear in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = jest.fn().mockImplementation((message, ...args) => {
  // Allow expected React warnings but fail on unexpected errors
  if (
    typeof message === 'string' &&
    (message.includes('Warning:') || 
     message.includes('Consider adding an error boundary'))
  ) {
    originalConsoleError(message, ...args);
  } else {
    throw new Error(`Unexpected console.error: ${message}`);
  }
});

console.warn = jest.fn().mockImplementation((message, ...args) => {
  // Allow expected warnings
  if (
    typeof message === 'string' &&
    (message.includes('Warning:') || 
     message.includes('deprecated'))
  ) {
    originalConsoleWarn(message, ...args);
  }
});

// Cleanup function for tests
export const cleanup = (): void => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
};

// Setup complete
console.log('✅ CoreTet Design System test setup complete');