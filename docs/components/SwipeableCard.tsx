import React, { useState, useRef, useCallback } from 'react';

interface SwipeAction {
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  haptic?: boolean;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  swipeThreshold?: number;
  maxSwipe?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  swipeThreshold = 40,
  maxSwipe = 80,
  onSwipeStart,
  onSwipeEnd,
  className,
  disabled = false
}: SwipeableCardProps) {
  const [isSwipeRevealed, setIsSwipeRevealed] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Haptic feedback utility
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 25,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const updateCardTransform = useCallback((translateX: number) => {
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${translateX}px)`;
    }
  }, []);

  const handleStart = useCallback((clientX: number) => {
    if (disabled) return;

    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
    onSwipeStart?.();
  }, [disabled, onSwipeStart]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;

    const diff = clientX - startX;
    const absDiff = Math.abs(diff);
    const direction = diff > 0 ? 'right' : 'left';

    // Determine available actions for current direction
    const availableActions = direction === 'right' ? leftActions : rightActions;
    if (availableActions.length === 0) return;

    // Apply resistance and limit swipe distance
    const maxAllowedSwipe = Math.min(maxSwipe, availableActions.length * 60);
    let constrainedDiff = diff;

    if (absDiff > maxAllowedSwipe) {
      // Apply increasing resistance beyond max swipe
      const excess = absDiff - maxAllowedSwipe;
      const resistance = 1 - Math.min(excess / 100, 0.8);
      constrainedDiff = diff > 0
        ? maxAllowedSwipe + (excess * resistance)
        : -(maxAllowedSwipe + (excess * resistance));
    }

    setCurrentX(clientX);
    setSwipeDirection(direction);
    updateCardTransform(constrainedDiff);

    // Haptic feedback at threshold
    if (absDiff >= swipeThreshold && !isSwipeRevealed) {
      triggerHaptic('light');
    }
  }, [isDragging, startX, maxSwipe, leftActions, rightActions, swipeThreshold, isSwipeRevealed, triggerHaptic, updateCardTransform]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    const diff = currentX - startX;
    const absDiff = Math.abs(diff);
    const direction = diff > 0 ? 'right' : 'left';

    // Determine available actions for current direction
    const availableActions = direction === 'right' ? leftActions : rightActions;

    if (absDiff >= swipeThreshold && availableActions.length > 0) {
      // Reveal actions
      const targetTranslate = direction === 'right' ? maxSwipe : -maxSwipe;
      setIsSwipeRevealed(direction);
      updateCardTransform(targetTranslate);
      triggerHaptic('medium');
    } else {
      // Snap back
      setIsSwipeRevealed(null);
      updateCardTransform(0);
    }

    setSwipeDirection(null);
    onSwipeEnd?.();
  }, [isDragging, currentX, startX, swipeThreshold, leftActions, rightActions, maxSwipe, updateCardTransform, triggerHaptic, onSwipeEnd]);

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleActionClick = useCallback((action: SwipeAction) => {
    action.onClick();
    if (action.haptic !== false) {
      triggerHaptic('medium');
    }
    // Reset swipe state
    setIsSwipeRevealed(null);
    updateCardTransform(0);
  }, [triggerHaptic, updateCardTransform]);

  const resetSwipe = useCallback(() => {
    if (isSwipeRevealed) {
      setIsSwipeRevealed(null);
      updateCardTransform(0);
    }
  }, [isSwipeRevealed, updateCardTransform]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={resetSwipe}
    >
      {/* Left Actions (revealed by swiping right) */}
      {leftActions.length > 0 && (
        <div
          className="absolute left-0 top-0 h-full flex items-center"
          style={{ width: `${leftActions.length * 60}px`, transform: 'translateX(-100%)' }}
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
              className="flex items-center justify-center h-full hover:bg-opacity-80 transition-colors"
              style={{
                width: '60px',
                backgroundColor: action.color
              }}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {/* Right Actions (revealed by swiping left) */}
      {rightActions.length > 0 && (
        <div
          className="absolute right-0 top-0 h-full flex items-center"
          style={{ width: `${rightActions.length * 60}px` }}
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
              className="flex items-center justify-center h-full hover:bg-opacity-80 transition-colors"
              style={{
                width: '60px',
                backgroundColor: action.color
              }}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {/* Main Card Content */}
      <div
        ref={cardRef}
        className="relative bg-white swipe-container"
        style={{
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
}

// Hook for swipe gesture handling
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 50
) {
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startX || !startY) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const diffX = startX - currentX;
    const diffY = startY - currentY;

    // Check if horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diffX < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  }, [startX, startY, threshold, onSwipeLeft, onSwipeRight]);

  const handleTouchEnd = useCallback(() => {
    setStartX(null);
    setStartY(null);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}