import React, { ReactNode, useEffect, useRef, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '../../constants/zIndex';

// Size presets for modals
const SIZE_PRESETS = {
  sm: { maxWidth: '400px', maxHeight: '60vh' },
  md: { maxWidth: '600px', maxHeight: '80vh' },
  lg: { maxWidth: '800px', maxHeight: '85vh' },
  full: { maxWidth: '100%', maxHeight: '100vh' },
} as const;

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;

  // Layout
  size?: keyof typeof SIZE_PRESETS;
  position?: 'center' | 'bottom';
  fullScreenMobile?: boolean;

  // Behavior
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  preventScroll?: boolean;

  // Styling
  backdropOpacity?: number;
  animation?: 'fade' | 'slideUp' | 'none';
  className?: string;

  // Z-Index
  zIndex?: number;

  // iOS Keyboard Support
  hasKeyboardInput?: boolean;
  keyboardInputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  size = 'md',
  position = 'center',
  fullScreenMobile = false,
  closeOnBackdrop = true,
  closeOnEsc = true,
  preventScroll = true,
  backdropOpacity = 0.5,
  animation = 'fade',
  className,
  zIndex = Z_INDEX.MODAL,
  hasKeyboardInput = false,
  keyboardInputRef,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // iOS keyboard adjustment - scroll input into view when keyboard appears
  useEffect(() => {
    if (!isOpen || !hasKeyboardInput || !keyboardInputRef?.current) return;

    const handleFocus = () => {
      // Wait for iOS keyboard animation to complete
      setTimeout(() => {
        keyboardInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    };

    const input = keyboardInputRef.current;
    input?.addEventListener('focus', handleFocus);

    return () => {
      input?.removeEventListener('focus', handleFocus);
    };
  }, [isOpen, hasKeyboardInput, keyboardInputRef]);

  // Scroll lock - DISABLED for iOS compatibility
  // The app already has overflow: hidden on body globally (see styles.css)
  // Manipulating body styles causes iOS viewport issues with keyboard
  // See: BandModal.tsx line 20-21 for documentation
  useEffect(() => {
    // No-op: scroll locking handled by global CSS
  }, [isOpen, preventScroll]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeStyles = SIZE_PRESETS[size];

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    display: 'flex',
    alignItems: position === 'bottom' ? 'flex-end' : 'center',
    justifyContent: 'center',
    zIndex,
    padding: position === 'bottom' ? 0 : '16px',
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: position === 'bottom' ? '16px 16px 0 0' : '12px',
    width: '100%',
    maxWidth: fullScreenMobile ? '100%' : sizeStyles.maxWidth,
    maxHeight: sizeStyles.maxHeight,
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
  };

  // Add animation class based on position
  const animationClass =
    animation === 'slideUp' ? 'modal-slide-up' :
    animation === 'fade' ? 'modal-fade' :
    '';

  const modalClassName = `${animationClass} ${className || ''}`.trim();

  const content = (
    <>
      <div style={backdropStyles} onClick={handleBackdropClick}>
        <div
          ref={modalRef}
          style={modalStyles}
          className={modalClassName}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes modalSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes modalFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-slide-up {
          animation: modalSlideUp 0.3s ease-out;
        }

        .modal-fade {
          animation: modalFade 0.2s ease-out;
        }
      `}</style>
    </>
  );

  // Render in portal for proper stacking
  return createPortal(content, document.body);
}
