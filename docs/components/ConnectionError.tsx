import { WifiOff } from "lucide-react";
import { Button } from "./ui/button";

interface ConnectionErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function ConnectionError({ onRetry, className = "" }: ConnectionErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      {/* Wi-Fi Off Icon */}
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-error flex items-center justify-center bg-white">
          <WifiOff size={32} className="text-error" strokeWidth={1.5} />
        </div>
      </div>

      {/* Error Message */}
      <h3 
        className="mb-3 text-error"
        style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          lineHeight: '1.4' 
        }}
      >
        No connection
      </h3>

      {/* Description */}
      <p 
        className="mb-8 text-rdio-secondary max-w-sm"
        style={{ 
          fontSize: '14px', 
          fontWeight: '400', 
          lineHeight: '1.5' 
        }}
      >
        Check your internet connection and try again. Make sure you're connected to Wi-Fi or cellular data.
      </p>

      {/* Retry Button */}
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-rdio-primary hover:bg-primary-hover text-white px-6 py-3"
          style={{ borderRadius: '20px', fontSize: '16px', fontWeight: '500' }}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}