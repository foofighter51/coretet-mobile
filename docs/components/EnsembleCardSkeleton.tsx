interface EnsembleCardSkeletonProps {
  count?: number;
  className?: string;
}

export function EnsembleCardSkeleton({ count = 6, className = "" }: EnsembleCardSkeletonProps) {
  return (
    <div 
      className={`grid grid-cols-2 gap-4 ${className}`}
      style={{ gridTemplateColumns: '1fr 1fr' }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div 
          key={i}
          className="bg-white rounded-lg shadow-subtle overflow-hidden animate-pulse"
          style={{ height: '140px' }}
        >
          {/* Cover Image Skeleton */}
          <div 
            className="bg-gray-200"
            style={{ height: '80px' }}
          />
          
          {/* Content Skeleton */}
          <div className="p-3">
            {/* Ensemble Name */}
            <div 
              className="bg-gray-200 rounded mb-2"
              style={{ height: '16px', width: '100px' }}
            />
            
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div 
                className="bg-gray-200 rounded"
                style={{ height: '12px', width: '60px' }}
              />
              <div 
                className="bg-gray-200 rounded"
                style={{ height: '12px', width: '40px' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}