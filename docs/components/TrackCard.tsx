import React, { useState, useRef } from "react";
import { Play, Pause, ThumbsUp, Heart } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

interface TrackCardProps {
  title: string;
  duration: string;
  subtitle?: string;
  isPlaying?: boolean;
  isLoading?: boolean;
  onPlayPause?: () => void;
  rating?: 'none' | 'like' | 'love';
  onRate?: (rating: 'like' | 'love') => void;
}

export function TrackCard({
  title,
  duration,
  subtitle,
  isPlaying = false,
  isLoading = false,
  onPlayPause,
  rating = 'none',
  onRate
}: TrackCardProps) {
  const [isSwipeRevealed, setIsSwipeRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touchX = e.touches[0].clientX;
    const diff = startX - touchX;
    
    // Only allow swipe left (diff > 0)
    if (diff > 0 && diff <= 80) {
      setCurrentX(touchX);
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(-${diff}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const diff = startX - currentX;
    
    if (diff > 40) {
      // Reveal rating options
      setIsSwipeRevealed(true);
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(-80px)';
      }
    } else {
      // Snap back
      setIsSwipeRevealed(false);
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0px)';
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const mouseX = e.clientX;
    const diff = startX - mouseX;
    
    if (diff > 0 && diff <= 80) {
      setCurrentX(mouseX);
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(-${diff}px)`;
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const diff = startX - currentX;
    
    if (diff > 40) {
      setIsSwipeRevealed(true);
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(-80px)';
      }
    } else {
      setIsSwipeRevealed(false);
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0px)';
      }
    }
  };

  // Add global mouse event listeners for better drag support
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, currentX]);

  const handleRating = (ratingType: 'like' | 'love') => {
    // Haptic feedback for rating action
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    onRate?.(ratingType);
    // Hide swipe after rating
    setIsSwipeRevealed(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0px)';
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Reset swipe if clicking outside the revealed area
    if (isSwipeRevealed && !isDragging) {
      setIsSwipeRevealed(false);
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0px)';
      }
    }
  };

  return (
    <div 
      className="relative bg-white overflow-hidden"
      style={{ 
        width: '343px', 
        height: '64px',
        borderRadius: '8px',
        boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff'
      }}
      onClick={handleContainerClick}
    >
      {/* Rating Actions (Hidden behind the card) */}
      <div 
        className="absolute right-0 top-0 h-full flex items-center"
        style={{ width: '80px' }}
      >
        <button
          onClick={() => handleRating('like')}
          className="flex items-center justify-center h-full bg-accent-teal hover:bg-opacity-80 transition-colors"
          style={{ width: '40px' }}
        >
          <ThumbsUp size={20} className="text-white" />
        </button>
        <button
          onClick={() => handleRating('love')}
          className="flex items-center justify-center h-full bg-red-500 hover:bg-opacity-80 transition-colors"
          style={{ width: '40px' }}
        >
          <Heart size={20} className="text-white" />
        </button>
      </div>

      {/* Main Track Card */}
      <div
        ref={cardRef}
        className="absolute inset-0 bg-white flex items-center cursor-pointer touch-feedback swipe-container"
        style={{
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '0 12px'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Play/Pause Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayPause?.();
          }}
          disabled={isLoading}
          className="flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
          style={{ 
            width: '40px', 
            height: '40px',
            borderRadius: '50%',
            marginRight: '12px'
          }}
        >
          {isLoading ? (
            <LoadingSpinner size={20} className="text-rdio-primary" />
          ) : isPlaying ? (
            <Pause size={20} className="text-rdio-primary" />
          ) : (
            <Play size={20} className="text-rdio-primary ml-0.5" />
          )}
        </button>

        {/* Track Info */}
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4
              className="truncate"
              style={{
                fontSize: '16px',
                fontWeight: '500',
                lineHeight: '1.2',
                color: '#1e252b',
                marginBottom: subtitle ? '2px' : '0'
              }}
            >
              {title}
            </h4>
            {subtitle && (
              <p
                className="truncate"
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  lineHeight: '1.2',
                  color: '#9da7b0',
                  margin: '0'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Duration and Rating */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Rating Icon */}
            {rating !== 'none' && (
              <div className="flex items-center">
                {rating === 'like' ? (
                  <ThumbsUp size={16} className="text-accent-teal opacity-60" />
                ) : (
                  <Heart size={16} className="text-red-500 opacity-60" />
                )}
              </div>
            )}
            
            {/* Duration */}
            <span 
              style={{ 
                fontSize: '14px',
                fontWeight: '400',
                color: '#9da7b0'
              }}
            >
              {duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}