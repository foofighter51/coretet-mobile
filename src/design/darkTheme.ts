// Dark mode theme based on CoreTet Logo V8
// Background: #1a2332 (dark navy from logo)
// Accent/Primary: #e9a63c (gold from logo)
// Text: #ffffff (white from logo)

export const darkTheme = {
  colors: {
    primary: {
      blue: '#e9a63c',        // Gold from logo (replaces blue)
      blueHover: '#d9962c',   // Darker gold for hover
      blueLight: '#2a3545',   // Lighter background shade
      blueUltraLight: '#222d3a' // Even lighter shade
    },
    neutral: {
      white: '#ffffff',
      offWhite: '#f5f5f5',
      lightGray: '#2a3545',   // Lighter than background
      gray: '#8a95a0',
      darkGray: '#d0d4d8',    // Lighter for dark mode
      charcoal: '#ffffff'     // White in dark mode
    },
    accent: {
      teal: '#4ecdc4',
      amber: '#e9a63c',       // Logo gold
      green: '#48bb78',
      coral: '#fc8181'
    },
    system: {
      error: '#fc8181',
      warning: '#fbbf24',
      success: '#68d391'
    },
    border: {
      default: '#2a3545',
      divider: '#222d3a'
    },
    surface: {
      primary: '#222d3a',     // Lighter than main bg for cards
      secondary: '#1a2332',   // Main background (logo dark navy)
      tertiary: '#1a2332',    // Page background
      hover: '#2a3545',       // Hover state
      active: '#2a3545',      // Active state
      disabled: '#1f2a38',    // Disabled state
    },
    borders: {
      default: '#2a3545',
      light: '#222d3a',
      focus: '#e9a63c',       // Gold focus
      error: '#fc8181',
      divider: '#222d3a',
    },
    text: {
      primary: '#ffffff',     // White text from logo
      secondary: '#d0d4d8',   // Light gray text
      tertiary: '#8a95a0',    // Medium gray
      muted: '#6b7585',
      disabled: '#4b5563',
      inverse: '#1a2332',     // Dark text on light backgrounds
      link: '#e9a63c',        // Gold links
      success: '#68d391',
      error: '#fc8181',
      warning: '#fbbf24',
    },
    ratings: {
      listened: {
        bg: '#3b82f6',
        bgLight: '#1e3a5f',
        bgUltraLight: '#1a2f4d',
      },
      liked: {
        bg: '#10b981',
        bgLight: '#1a4d3a',
        bgUltraLight: '#163a2e',
      },
      loved: {
        bg: '#ef4444',
        bgLight: '#5f1a1a',
        bgUltraLight: '#4d1616',
      }
    },
    feedback: {
      error: {
        bg: '#5f1a1a',
        border: '#ef4444',
        text: '#fca5a5',
      },
      success: {
        bg: '#1a4d3a',
        border: '#10b981',
        text: '#86efac',
      },
      warning: {
        bg: '#4d3a1a',
        border: '#fbbf24',
        text: '#fde047',
      }
    }
  }
};
