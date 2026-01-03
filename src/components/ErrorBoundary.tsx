import React, { Component, ReactNode } from 'react';
import { designTokens } from '../design/designTokens';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console (can be replaced with error reporting service later)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '24px',
          backgroundColor: designTokens.colors.surface.tertiary,
          fontFamily: designTokens.typography.fontFamily,
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '400px',
            width: '100%',
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: '16px',
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.text.secondary,
              marginBottom: '24px',
              lineHeight: '1.5',
            }}>
              We encountered an unexpected error. Please try again.
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                backgroundColor: designTokens.colors.surface.secondary,
                border: `1px solid ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.md,
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '200px',
              }}>
                <p style={{
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: designTokens.colors.system.error,
                  marginBottom: '8px',
                  fontWeight: designTokens.typography.fontWeights.semibold,
                }}>
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: designTokens.colors.text.tertiary,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: designTokens.colors.primary.blue,
                color: designTokens.colors.text.inverse,
                border: 'none',
                borderRadius: designTokens.borderRadius.md,
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.semibold,
                cursor: 'pointer',
                fontFamily: designTokens.typography.fontFamily,
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: 'transparent',
                color: designTokens.colors.text.secondary,
                border: `1px solid ${designTokens.colors.borders.default}`,
                borderRadius: designTokens.borderRadius.md,
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: 'pointer',
                fontFamily: designTokens.typography.fontFamily,
                marginTop: '12px',
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
