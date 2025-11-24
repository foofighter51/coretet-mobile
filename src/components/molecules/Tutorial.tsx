import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, List, Share, Star, MessageSquare, MessageCircle } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { DialogModal } from '../ui/DialogModal';

interface TutorialStep {
  title: string;
  content: string;
  icon: React.ReactNode;
  tip?: string;
}

interface TutorialProps {
  onClose: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to CoreTet',
    content: 'CoreTet helps bands collaborate on music by sharing tracks, creating playlists, rating songs, and providing feedback to each other.',
    icon: <MessageCircle size={48} color={designTokens.colors.primary.blue} />,
  },
  {
    title: 'Upload Your Tracks',
    content: 'Tap the Upload button on the Tracks tab to add your music files. CoreTet supports MP3, WAV, and other common audio formats.',
    icon: <Upload size={48} color={designTokens.colors.primary.blue} />,
    tip: '💡 Tip: To upload from cloud services like Google Drive or Dropbox, use the Files app on iOS. Download files to your phone first, then upload to CoreTet through the file picker.',
  },
  {
    title: 'Create Playlists',
    content: 'Organize tracks into playlists on the Playlists tab. Tap "+ New" to create a playlist, then add tracks from your library using "+ From Library".',
    icon: <List size={48} color={designTokens.colors.primary.blue} />,
  },
  {
    title: 'Share with Bandmates',
    content: 'Share playlists with your bandmates using the share icon. They can follow your playlists and see updates when you add new tracks.',
    icon: <Share size={48} color={designTokens.colors.primary.blue} />,
  },
  {
    title: 'Rate Tracks',
    content: 'Swipe right on any track to rate it. Choose from Listened (headphones), Liked (thumbs up), or Loved (heart). Tap the same rating again to remove it.',
    icon: <Star size={48} color={designTokens.colors.primary.blue} />,
    tip: '💡 Tip: Aggregated ratings show who rated each track. Your rating appears in color, while others appear in gray.',
  },
  {
    title: 'Add Comments',
    content: 'Long-press on any track to open the Track Detail Modal. Here you can see all ratings and add comments to discuss the track with your bandmates.',
    icon: <MessageSquare size={48} color={designTokens.colors.primary.blue} />,
  },
  {
    title: 'Send Feedback',
    content: 'Have ideas or found a bug? Use the "Community Feedback" button in your Profile tab to submit feature requests or report issues.',
    icon: <MessageCircle size={48} color={designTokens.colors.primary.blue} />,
  },
];

export function Tutorial({ onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <DialogModal
      isOpen={true}
      onClose={onClose}
      title={step.title}
      size="md"
      footer={
        <>
          {/* Progress dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: designTokens.spacing.sm,
            marginBottom: designTokens.spacing.lg,
          }}>
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: index === currentStep
                    ? designTokens.colors.primary.blue
                    : designTokens.colors.borders.default,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: 'transparent',
                color: isFirstStep ? designTokens.colors.text.disabled : designTokens.colors.primary.blue,
                border: 'none',
                cursor: isFirstStep ? 'not-allowed' : 'pointer',
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
              }}
            >
              {!isFirstStep && <ChevronLeft size={20} />}
              {!isFirstStep && 'Previous'}
            </button>

            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.muted,
              margin: 0,
            }}>
              {currentStep + 1} / {tutorialSteps.length}
            </p>

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                backgroundColor: designTokens.colors.primary.blue,
                color: designTokens.colors.text.inverse,
                border: 'none',
                borderRadius: designTokens.borderRadius.sm,
                cursor: 'pointer',
                fontSize: designTokens.typography.fontSizes.body,
                fontWeight: designTokens.typography.fontWeights.medium,
              }}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight size={20} />}
            </button>
          </div>
        </>
      }
    >
      {/* Icon */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: designTokens.spacing.xl,
      }}>
        {step.icon}
      </div>

      {/* Content */}
      <p style={{
        fontSize: designTokens.typography.fontSizes.body,
        color: designTokens.colors.text.secondary,
        lineHeight: '1.6',
        textAlign: 'center',
        marginBottom: step.tip ? designTokens.spacing.lg : 0,
      }}>
        {step.content}
      </p>

      {/* Tip box */}
      {step.tip && (
        <div style={{
          padding: designTokens.spacing.md,
          backgroundColor: designTokens.colors.surface.secondary,
          borderRadius: designTokens.borderRadius.md,
        }}>
          <p style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.primary,
            margin: 0,
            lineHeight: '1.5',
          }}>
            {step.tip}
          </p>
        </div>
      )}
    </DialogModal>
  );
}
