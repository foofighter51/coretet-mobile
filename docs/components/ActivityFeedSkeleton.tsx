interface ActivityFeedSkeletonProps {
  count?: number;
  className?: string;
}

export function ActivityFeedSkeleton({ count = 5, className = "" }: ActivityFeedSkeletonProps) {
  return (
    <div className={`bg-white rounded-lg shadow-subtle p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div 
          className="bg-gray-200 rounded animate-pulse"
          style={{ height: '24px', width: '140px' }}
        />
        <div 
          className="bg-gray-200 rounded animate-pulse"
          style={{ height: '16px', width: '80px' }}
        />
      </div>
      
      {/* Activity Items */}
      <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
          <div 
            key={i}
            className="flex items-center gap-3 animate-pulse"
          >
            {/* Avatar */}
            <div 
              className="bg-gray-200 rounded-full flex-shrink-0"
              style={{ width: '40px', height: '40px' }}
            />
            
            <div className="flex-1 min-w-0">
              {/* Activity Text */}
              <div 
                className="bg-gray-200 rounded mb-1"
                style={{ height: '14px', width: `${Math.random() * 60 + 200}px` }}
              />
              
              {/* Timestamp */}
              <div 
                className="bg-gray-200 rounded"
                style={{ height: '12px', width: '60px' }}
              />
            </div>
            
            {/* Action Icon */}
            <div 
              className="bg-gray-200 rounded"
              style={{ width: '16px', height: '16px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}