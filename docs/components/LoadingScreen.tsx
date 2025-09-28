import { LoadingState } from "./LoadingState";

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  className?: string;
}

export function LoadingScreen({ 
  message = "Loading CoreTet...", 
  showLogo = true,
  className = "" 
}: LoadingScreenProps) {
  return (
    <div className={`min-h-screen bg-off-white flex flex-col items-center justify-center ${className}`}>
      {showLogo && (
        <div className="mb-8">
          <h1 
            className="text-rdio-primary mb-2"
            style={{ 
              fontSize: '32px',
              fontWeight: '600',
              lineHeight: '1.2'
            }}
          >
            CoreTet
          </h1>
          <p 
            className="text-rdio-secondary text-center"
            style={{ 
              fontSize: '16px',
              fontWeight: '400',
              lineHeight: '1.4'
            }}
          >
            Music collaboration app
          </p>
        </div>
      )}
      
      <LoadingState 
        message={message}
        size="lg"
      />
    </div>
  );
}