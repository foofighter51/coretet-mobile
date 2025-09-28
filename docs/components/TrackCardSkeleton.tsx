interface TrackCardSkeletonProps {
  count?: number;
  className?: string;
}

export function TrackCardSkeleton({ count = 1, className = "" }: TrackCardSkeletonProps) {
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div 
          key={i}
          className="bg-white animate-pulse"
          style={{ 
            width: '343px', 
            height: '96px',
            borderRadius: '8px',
            boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Main Content Area - Height: 52px */}
          <div 
            className="flex items-center"
            style={{ 
              height: '52px',
              padding: '0 12px'
            }}
          >
            {/* Album Art Skeleton - Exactly 56x56px */}
            <div 
              className="bg-gray-200 flex-shrink-0"
              style={{ 
                width: '56px', 
                height: '56px',
                borderRadius: '4px',
                backgroundColor: '#e5e7eb'
              }}
            />

            {/* Track Info Skeleton - 8px spacing */}
            <div 
              className="flex-1 min-w-0 flex flex-col justify-center"
              style={{ 
                marginLeft: '8px',
                height: '56px'
              }}
            >
              {/* Title Row */}
              <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                {/* Track title skeleton */}
                <div 
                  className="bg-gray-200"
                  style={{ 
                    height: '16px', 
                    width: '140px',
                    borderRadius: '2px',
                    backgroundColor: '#e5e7eb'
                  }}
                />
                
                {/* Duration skeleton */}
                <div 
                  className="bg-gray-200"
                  style={{ 
                    height: '12px', 
                    width: '32px',
                    borderRadius: '2px',
                    backgroundColor: '#e5e7eb',
                    marginLeft: '8px'
                  }}
                />
              </div>

              {/* Artist skeleton */}
              <div 
                className="bg-gray-200"
                style={{ 
                  height: '14px', 
                  width: '100px',
                  borderRadius: '2px',
                  backgroundColor: '#e5e7eb'
                }}
              />
            </div>
          </div>

          {/* Interaction Bar Skeleton - Exactly 44px height */}
          <div 
            className="flex items-center justify-between"
            style={{ 
              height: '44px',
              borderTop: '1px solid #f0f1f3',
              padding: '0 12px'
            }}
          >
            <div className="flex items-center" style={{ gap: '8px' }}>
              {/* Comment button skeleton */}
              <div 
                className="bg-gray-200"
                style={{ 
                  width: '40px', 
                  height: '28px',
                  borderRadius: '4px',
                  backgroundColor: '#e5e7eb'
                }}
              />
              
              {/* Star button skeleton */}
              <div 
                className="bg-gray-200"
                style={{ 
                  width: '20px', 
                  height: '16px',
                  borderRadius: '2px',
                  backgroundColor: '#e5e7eb'
                }}
              />
            </div>

            {/* ADD button skeleton */}
            <div 
              className="bg-gray-200"
              style={{ 
                width: '60px', 
                height: '28px',
                borderRadius: '4px',
                backgroundColor: '#e5e7eb'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}