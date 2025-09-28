import { Users, Music } from "lucide-react";

interface EnsembleCardProps {
  id: string;
  name: string;
  memberCount: number;
  trackCount: number;
  lastActivity: string;
  coverImage?: string;
  onClick?: (ensembleId: string, ensembleName: string, memberCount: number) => void;
}

export function EnsembleCard({ 
  id,
  name, 
  memberCount, 
  trackCount, 
  lastActivity, 
  coverImage,
  onClick 
}: EnsembleCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-subtle cursor-pointer transition-all duration-200 hover:shadow-card ensemble-card overflow-hidden"
      style={{ 
        borderRadius: '8px',
        height: 'var(--ensemble-card-height)'
      }}
      onClick={() => onClick?.(id, name, memberCount)}
    >
      {/* Cover Image or Placeholder */}
      <div 
        className="w-full bg-gradient-to-br from-rdio-primary to-accent-teal flex items-center justify-center"
        style={{ 
          borderRadius: '8px 8px 0 0',
          height: '60px'
        }}
      >
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={name}
            className="w-full h-full object-cover"
            style={{ borderRadius: '8px 8px 0 0' }}
          />
        ) : (
          <Music size={24} className="text-white opacity-80" />
        )}
      </div>
      
      {/* Content */}
      <div 
        className="p-3 flex flex-col justify-between"
        style={{ height: '60px' }}
      >
        {/* Ensemble Name */}
        <h3 
          className="text-text-primary mb-1 line-clamp-1"
          style={{ 
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '1.3'
          }}
        >
          {name}
        </h3>
        
        {/* Stats */}
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-1">
            <Users size={10} className="text-rdio-secondary" />
            <span 
              className="text-rdio-secondary"
              style={{ 
                fontSize: '10px',
                fontWeight: '400',
                lineHeight: '1.2'
              }}
            >
              {memberCount}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Music size={10} className="text-rdio-secondary" />
            <span 
              className="text-rdio-secondary"
              style={{ 
                fontSize: '10px',
                fontWeight: '400',
                lineHeight: '1.2'
              }}
            >
              {trackCount}
            </span>
          </div>
        </div>
        
        {/* Last Activity */}
        <p 
          className="text-rdio-secondary truncate"
          style={{ 
            fontSize: '10px',
            fontWeight: '400',
            lineHeight: '1.2'
          }}
        >
          {lastActivity}
        </p>
      </div>
    </div>
  );
}