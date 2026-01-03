import React, { useState } from 'react';
import { X } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

type IntroStep = 'intro1' | 'intro2' | 'intro3';

interface IntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<IntroStep>('intro1');

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // Reset to first screen when opened
  React.useEffect(() => {
    if (isOpen) {
      setStep('intro1');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const introScreens = [
    {
      step: 'intro1' as const,
      icon: '🎵',
      title: 'Share music with your band',
      description: 'Upload tracks, organize into set lists, and collaborate with your bandmates—all in one private space.',
    },
    {
      step: 'intro2' as const,
      icon: '💬',
      title: 'Get feedback at exact moments',
      description: 'Leave timestamped comments on tracks. Click any comment to jump right to that moment.',
    },
    {
      step: 'intro3' as const,
      icon: '🔒',
      title: 'Invite-only and private',
      description: 'Your tracks are never public. Only invited band members can access your music.',
    },
  ];

  const currentIntroIndex = introScreens.findIndex(s => s.step === step);
  const currentIntro = introScreens[currentIntroIndex];

  // Safety check - if we can't find the current screen, return null
  if (!currentIntro) {
    return null;
  }

  const isLastScreen = currentIntroIndex === introScreens.length - 1;

  const handleNext = () => {
    if (isLastScreen) {
      onClose();
    } else {
      setStep(introScreens[currentIntroIndex + 1].step);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: designTokens.colors.neutral.white,
          borderRadius: designTokens.borderRadius.lg,
          width: '100%',
          maxWidth: '500px',
          padding: '32px',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: designTokens.borderRadius.full,
            backgroundColor: designTokens.colors.surface.secondary,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: designTokens.colors.neutral.darkGray,
          }}
          aria-label="Close intro"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{
          fontSize: '72px',
          marginBottom: '24px',
        }}>
          {currentIntro.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 16px 0',
        }}>
          {currentIntro.title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 48px 0',
        }}>
          {currentIntro.description}
        </p>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px',
        }}>
          {introScreens.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentIntroIndex
                  ? designTokens.colors.primary.blue
                  : designTokens.colors.neutral.lightGray,
              }}
            />
          ))}
        </div>

        {/* Next/Done button */}
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: designTokens.colors.primary.blue,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {isLastScreen ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
};
