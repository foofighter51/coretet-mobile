interface CollaboratorCardSkeletonProps {
  count?: number;
  className?: string;
}

export function CollaboratorCardSkeleton({ count = 3, className = "" }: CollaboratorCardSkeletonProps) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div 
          key={i}
          className="bg-white rounded-lg shadow-subtle p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            {/* Avatar Skeleton */}
            <div 
              className="bg-gray-200 rounded-full flex-shrink-0"
              style={{ width: '56px', height: '56px' }}
            />
            
            <div className="flex-1 min-w-0">
              {/* Name */}
              <div 
                className="bg-gray-200 rounded mb-2"
                style={{ height: '18px', width: '120px' }}
              />
              
              {/* Role */}
              <div 
                className="bg-gray-200 rounded mb-3"
                style={{ height: '14px', width: '140px' }}
              />
              
              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div 
                  className="bg-gray-200 rounded-full"
                  style={{ height: '24px', width: '60px' }}
                />
                <div 
                  className="bg-gray-200 rounded-full"
                  style={{ height: '24px', width: '48px' }}
                />
                <div 
                  className="bg-gray-200 rounded-full"
                  style={{ height: '24px', width: '54px' }}
                />
              </div>
              
              {/* Stats and Connect Button */}
              <div className="flex items-center justify-between">
                <div 
                  className="bg-gray-200 rounded"
                  style={{ height: '12px', width: '80px' }}
                />
                <div 
                  className="bg-gray-200 rounded"
                  style={{ height: '32px', width: '80px', borderRadius: '16px' }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}