import { X } from "lucide-react";

interface UploadErrorProps {
  fileName: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function UploadError({ fileName, onRetry, onDismiss, className = "" }: UploadErrorProps) {
  return (
    <div className={`bg-error-light border border-error-border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center flex-shrink-0 mt-1">
          <X size={16} className="text-white" />
        </div>
        
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
            Upload failed
          </h4>
          <p 
            className="text-rdio-secondary mb-3 truncate"
            style={{ 
              fontSize: '14px', 
              fontWeight: '400', 
              lineHeight: '1.4' 
            }}
          >
            {fileName}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-rdio-primary hover:text-primary-hover transition-colors"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  textDecoration: 'underline' 
                }}
              >
                Tap to retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-rdio-secondary hover:text-text-primary transition-colors"
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '400' 
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        
        {/* Dismiss X */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rdio-secondary hover:text-error transition-colors p-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}