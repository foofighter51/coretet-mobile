import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface ListViewProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isEmpty?: boolean;
  emptyState?: {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  className?: string;
}

export function ListView({
  children,
  onRefresh,
  isRefreshing = false,
  isEmpty = false,
  emptyState,
  className
}: ListViewProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);

  const PULL_THRESHOLD = 60;
  const MAX_PULL_DISTANCE = 100;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || isRefreshing) return;

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && scrollContainer.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [onRefresh, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !onRefresh || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();

      // Calculate pull distance with diminishing returns
      const rawDistance = Math.max(0, deltaY);
      const pullDistance = Math.min(
        rawDistance * 0.5, // 50% resistance
        MAX_PULL_DISTANCE
      );

      setPullDistance(pullDistance);
    }

    lastTouchY.current = currentY;
  }, [isPulling, onRefresh, isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling || !onRefresh) return;

    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      onRefresh();
    }

    // Animate back to zero
    setPullDistance(0);
  }, [isPulling, pullDistance, onRefresh, isRefreshing]);

  // Add haptic feedback (if available)
  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  // Trigger haptic when reaching threshold
  useEffect(() => {
    if (pullDistance >= PULL_THRESHOLD && isPulling) {
      triggerHapticFeedback();
    }
  }, [pullDistance, isPulling, triggerHapticFeedback]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTriggerRefresh = pullDistance >= PULL_THRESHOLD;

  return (
    <div className={`relative flex-1 overflow-hidden ${className}`}>
      {/* Enhanced Pull to refresh indicator */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-200 ease-out"
        style={{
          transform: `translate(-50%, ${Math.max(-40, pullDistance - 40)}px)`,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
              shouldTriggerRefresh ? 'bg-rdio-primary text-white' : 'text-rdio-primary'
            }`}
            style={{
              transform: `scale(${0.8 + pullProgress * 0.4}) rotate(${pullProgress * 180}deg)`
            }}
          >
            <RotateCcw
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </div>
          {pullDistance > 20 && (
            <div className="mt-2 text-xs text-rdio-secondary">
              {shouldTriggerRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </div>
          )}
        </div>
      </div>

      {/* List content */}
      <div
        ref={scrollContainerRef}
        className="list-container h-full overflow-y-auto touch-target"
        style={{
          WebkitOverflowScrolling: 'touch',
          transform: `translateY(${isPulling ? pullDistance * 0.3 : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isEmpty && emptyState ? (
          <div className="list-empty-state">
            <EmptyState
              icon={emptyState.icon}
              title={emptyState.title}
              description={emptyState.description}
              actionLabel={emptyState.actionLabel}
              onAction={emptyState.onAction}
            />
          </div>
        ) : (
          <div className="flex flex-col list-card-spacing">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Track List specialized component
interface TrackListViewProps extends Omit<ListViewProps, 'children'> {
  tracks: React.ReactNode[];
}

export function TrackListView({ tracks, ...props }: TrackListViewProps) {
  return (
    <ListView 
      {...props}
      isEmpty={tracks.length === 0}
    >
      {tracks.map((track, index) => (
        <div key={index}>
          {track}
        </div>
      ))}
    </ListView>
  );
}

// Ensemble Grid specialized component  
interface EnsembleGridViewProps extends Omit<ListViewProps, 'children'> {
  ensembles: React.ReactNode[];
}

export function EnsembleGridView({ ensembles, ...props }: EnsembleGridViewProps) {
  return (
    <ListView 
      {...props}
      isEmpty={ensembles.length === 0}
    >
      <div className="ensemble-grid">
        {ensembles.map((ensemble, index) => (
          <div key={index} className="ensemble-card">
            {ensemble}
          </div>
        ))}
      </div>
    </ListView>
  );
}

// Member List specialized component
interface MemberListViewProps extends Omit<ListViewProps, 'children'> {
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'away' | 'offline';
    onClick?: () => void;
  }>;
  onRefresh?: () => void;
}

export function MemberListView({ members, ...props }: MemberListViewProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Pull to refresh indicator */}
      {props.isRefreshing && (
        <div className="list-pull-refresh">
          <RotateCcw 
            size={20} 
            className="animate-spin" 
          />
        </div>
      )}

      {/* Member list content */}
      <div 
        className="h-full overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          backgroundColor: '#ffffff'
        }}
      >
        {props.isEmpty && props.emptyState ? (
          <div className="list-empty-state">
            <EmptyState
              icon={props.emptyState.icon}
              title={props.emptyState.title}
              description={props.emptyState.description}
              actionLabel={props.emptyState.actionLabel}
              onAction={props.emptyState.onAction}
            />
          </div>
        ) : (
          <>
            {members.map((member) => (
              <div 
                key={member.id}
                className="member-row cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={member.onClick}
              >
                {/* Avatar */}
                <div className="member-avatar bg-rdio-primary text-white flex items-center justify-center text-sm font-medium mr-3">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>

                {/* Member info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate">{member.name}</h4>
                    {member.status && (
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          member.status === 'online' ? 'bg-accent-green' :
                          member.status === 'away' ? 'bg-accent-amber' :
                          'bg-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  {member.role && (
                    <p className="caption text-rdio-secondary truncate">
                      {member.role}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}