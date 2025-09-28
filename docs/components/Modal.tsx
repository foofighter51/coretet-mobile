import React, { useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showBackButton?: boolean;
  showCloseButton?: boolean;
  preventBackgroundClose?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'medium',
  showBackButton = true,
  showCloseButton = false,
  preventBackgroundClose = false,
  className
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus trap the modal
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventBackgroundClose) {
      onClose();
    }
  }, [onClose, preventBackgroundClose]);

  // Size classes
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    fullscreen: 'w-full h-full max-w-none'
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackgroundClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          bg-white rounded-lg shadow-elevated overflow-hidden
          ${sizeClasses[size]}
          ${size !== 'fullscreen' ? 'mx-4 my-8' : ''}
          ${className}
        `}
        style={{
          maxHeight: size === 'fullscreen' ? '100vh' : '90vh',
          width: size === 'fullscreen' ? '375px' : undefined,
          margin: size === 'fullscreen' ? '0 auto' : undefined
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showBackButton || showCloseButton) && (
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-gray-200"
            style={{
              height: size === 'fullscreen' ? '88px' : '56px',
              paddingTop: size === 'fullscreen' ? '44px' : undefined
            }}
          >
            <div className="flex items-center">
              {showBackButton && (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 transition-colors touch-target"
                  aria-label="Go back"
                >
                  <ChevronLeft size={24} className="text-rdio-primary" />
                </button>
              )}
            </div>

            {title && (
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold text-rdio-primary truncate">
                  {title}
                </h2>
              </div>
            )}

            <div className="flex items-center">
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 transition-colors touch-target"
                  aria-label="Close"
                >
                  <X size={24} className="text-rdio-secondary" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto momentum-scroll"
          style={{
            maxHeight: size === 'fullscreen'
              ? 'calc(100vh - 88px)'
              : title || showBackButton || showCloseButton
              ? 'calc(90vh - 56px)'
              : '90vh'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Full-screen modal variant for mobile
export function FullScreenModal({
  isOpen,
  onClose,
  children,
  title,
  className
}: Omit<ModalProps, 'size'>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="fullscreen"
      title={title}
      preventBackgroundClose={true}
      className={className}
    >
      {children}
    </Modal>
  );
}

// Sheet modal (slides up from bottom)
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className
}: Omit<ModalProps, 'size'>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`
          relative bg-white rounded-t-lg shadow-elevated overflow-hidden
          w-full max-w-md mx-4 mb-4
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          ${className}
        `}
        style={{ maxHeight: '80vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>

        {title && (
          <div className="px-4 pb-3">
            <h3 className="text-lg font-semibold text-center">{title}</h3>
          </div>
        )}

        <div className="overflow-y-auto momentum-scroll px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}