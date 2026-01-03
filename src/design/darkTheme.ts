// Dark mode theme based on logo colors
// Background: #26313e
// Accent/Primary: #e9a63c (amber from logo)
// Text: #ffffff

export const darkTheme = {
  colors: {
    primary: {
      blue: '#e9a63c',        // Amber accent (replaces blue)
      blueHover: '#d9962c',   // Darker amber for hover
      blueLight: '#3a4756',   // Lighter background shade
      blueUltraLight: '#2f3a47' // Even lighter shade
    },
    neutral: {
      white: '#ffffff',
      offWhite: '#f5f5f5',
      lightGray: '#3a4756',   // Lighter than background
      gray: '#9da7b0',
      darkGray: '#c4c4c4',    // Lighter for dark mode
      charcoal: '#ffffff'     // White in dark mode
    },
    accent: {
      teal: '#4ecdc4',
      amber: '#e9a63c',       // Logo amber
      green: '#48bb78',
      coral: '#fc8181'
    },
    system: {
      error: '#fc8181',
      warning: '#fbbf24',
      success: '#68d391'
    },
    border: {
      default: '#3a4756',
      divider: '#2f3a47'
    },
    surface: {
      primary: '#2f3a47',     // Lighter than main bg for cards
      secondary: '#26313e',   // Main background
      tertiary: '#26313e',    // Page background
      hover: '#3a4756',       // Hover state
      active: '#3a4756',      // Active state
      disabled: '#2a3542',    // Disabled state
    },
    borders: {
      default: '#3a4756',
      light: '#2f3a47',
      focus: '#e9a63c',       // Amber focus
      error: '#fc8181',
      divider: '#2f3a47',
    },
    text: {
      primary: '#ffffff',     // White text
      secondary: '#c4c4c4',   // Light gray text
      tertiary: '#9da7b0',    // Medium gray
      muted: '#6b7280',
      disabled: '#4b5563',
      inverse: '#26313e',     // Dark text on light backgrounds
      link: '#e9a63c',        // Amber links
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
