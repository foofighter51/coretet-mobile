interface LoadingSpinnerProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function LoadingSpinner({ 
  size = 24, 
  strokeWidth = 2, 
  className = "" 
}: LoadingSpinnerProps) {
  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="60"
          opacity="0.3"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="15"
          strokeDashoffset="15"
          className="origin-center"
        />
      </svg>
    </div>
  );
}