import React from 'react';

export interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  error?: string;
  children?: React.ReactNode;
  variant?: 'spinner' | 'progress' | 'skeleton' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large'; className?: string }> = ({
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

export const ProgressBar: React.FC<{
  progress: number;
  message?: string;
  className?: string;
  showPercentage?: boolean;
}> = ({
  progress,
  message,
  className = '',
  showPercentage = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {message && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{message}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-900">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'button';
}> = ({
  lines = 3,
  className = '',
  variant = 'text'
}) => {
  if (variant === 'circle') {
    return <div className={`animate-pulse bg-gray-300 rounded-full w-12 h-12 ${className}`} />;
  }

  if (variant === 'button') {
    return <div className={`animate-pulse bg-gray-300 rounded-lg h-10 w-24 ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-300 rounded-lg h-4 w-3/4 mb-2" />
        <div className="bg-gray-300 rounded-lg h-4 w-1/2 mb-2" />
        <div className="bg-gray-300 rounded-lg h-4 w-5/6" />
      </div>
    );
  }

  // Text variant
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="bg-gray-300 rounded-lg h-4"
          style={{
            width: i === lines - 1 ? '75%' : '100%'
          }}
        />
      ))}
    </div>
  );
};

export const PulseLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  message,
  progress,
  error,
  children,
  variant = 'spinner',
  size = 'medium',
  className = ''
}) => {
  if (error) {
    return (
      <div className={`flex items-center justify-center p-4 text-red-600 ${className}`}>
        <div className="text-center">
          <div className="text-lg mb-2">⚠️ Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!isLoading) {
    return <>{children}</>;
  }

  const renderLoader = () => {
    switch (variant) {
      case 'progress':
        return <ProgressBar progress={progress || 0} message={message} />;
      case 'skeleton':
        return <SkeletonLoader />;
      case 'pulse':
        return (
          <div className="flex items-center space-x-2">
            <PulseLoader />
            {message && <span className="text-sm text-gray-600">{message}</span>}
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size={size} />
            {message && <span className="text-sm text-gray-600">{message}</span>}
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      {renderLoader()}
    </div>
  );
};

export default LoadingState;