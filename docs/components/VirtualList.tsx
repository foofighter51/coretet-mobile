import React, { useState, useEffect, useMemo, useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight
      });
    }

    return {
      totalHeight,
      visibleItems,
      startIndex,
      endIndex
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight, WebkitOverflowScrolling: 'touch' }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        {visibleItems.visibleItems.map(({ item, index, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Specialized Virtual Track List for CoreTet
interface VirtualTrackListProps {
  tracks: Array<{
    id: string;
    title: string;
    artist?: string;
    duration: string;
    isPlaying?: boolean;
    rating?: 'none' | 'like' | 'love';
    onPlayPause?: () => void;
    onRate?: (rating: 'like' | 'love') => void;
  }>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  renderTrack: (track: any, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualTrackList({
  tracks,
  onRefresh,
  isRefreshing = false,
  renderTrack,
  className
}: VirtualTrackListProps) {
  const TRACK_HEIGHT = 72; // 64px + 8px margin
  const CONTAINER_HEIGHT = 400; // Adjust based on available screen space

  return (
    <div className={`virtual-track-list ${className}`}>
      {tracks.length > 50 ? (
        <VirtualList
          items={tracks}
          itemHeight={TRACK_HEIGHT}
          containerHeight={CONTAINER_HEIGHT}
          renderItem={renderTrack}
          className="bg-off-white"
        />
      ) : (
        // Use regular list for smaller lists
        <div
          className="overflow-y-auto bg-off-white"
          style={{
            height: CONTAINER_HEIGHT,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex flex-col list-card-spacing p-4">
            {tracks.map((track, index) => (
              <div key={track.id || index}>
                {renderTrack(track, index)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}