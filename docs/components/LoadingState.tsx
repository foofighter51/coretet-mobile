import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  size = 'md',
  className = "" 
}: LoadingStateProps) {
  const sizeConfig = {
    sm: { spinner: 16, text: '12px' },
    md: { spinner: 24, text: '14px' },
    lg: { spinner: 32, text: '16px' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <LoadingSpinner 
        size={config.spinner} 
        strokeWidth={2}
        className="text-rdio-primary"
      />
      <p 
        className="text-rdio-secondary text-center"
        style={{ 
          fontSize: config.text,
          fontWeight: '400',
          lineHeight: '1.4'
        }}
      >
        {message}
      </p>
    </div>
  );
}