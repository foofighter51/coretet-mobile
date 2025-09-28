import { AlertTriangle, X, Wifi, WifiOff, Upload, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorBannerProps {
  type?: 'error' | 'connection' | 'upload' | 'warning';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  isVisible?: boolean;
  className?: string;
}

export function ErrorBanner({
  type = 'error',
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  isVisible = true,
  className = ""
}: ErrorBannerProps) {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'connection':
        return <WifiOff size={20} className="text-error flex-shrink-0" />;
      case 'upload':
        return <X size={20} className="text-error flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-error flex-shrink-0" />;
      default:
        return <AlertCircle size={20} className="text-error flex-shrink-0" />;
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div 
        className="bg-error-light border-b border-error-border px-4 py-3 shadow-subtle"
        style={{ minHeight: '60px' }}
      >
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          {/* Icon */}
          {getIcon()}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 
              className="text-error mb-1"
              style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                lineHeight: '1.4' 
              }}
            >
              {title}
            </h4>
            {message && (
              <p 
                className="text-rdio-secondary"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '400', 
                  lineHeight: '1.4' 
                }}
              >
                {message}
              </p>
            )}
          </div>
          
          {/* Action Button */}
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="outline"
              size="sm"
              className="text-rdio-primary border-rdio-primary hover:bg-rdio-primary hover:text-white flex-shrink-0"
              style={{ borderRadius: '16px' }}
            >
              {actionLabel}
            </Button>
          )}
          
          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-rdio-secondary hover:text-error transition-colors p-1 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}