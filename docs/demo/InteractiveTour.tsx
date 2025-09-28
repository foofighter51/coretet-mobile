/**
 * CoreTet Interactive Tour - Guided Walkthrough Component
 * Provides step-by-step guided tours for new users and demos
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'swipe' | 'type' | 'wait';
  duration?: number;
  highlight?: boolean;
  screenshot?: string;
}

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  tourType: 'onboarding' | 'features' | 'advanced';
  autoPlay?: boolean;
}

const tourSteps: Record<string, TourStep[]> = {
  onboarding: [
    {
      id: 'welcome',
      target: 'app-container',
      title: 'Welcome to CoreTet!',
      content: 'The music collaboration platform that brings the classic Rdio aesthetic into the modern age. Let\'s explore together!',
      position: 'center',
      duration: 3000,
      highlight: false
    },
    {
      id: 'onboarding-phone',
      target: 'phone-input',
      title: 'Start with Your Phone',
      content: 'Enter your phone number to create your account. We use SMS for secure verification.',
      position: 'bottom',
      action: 'type',
      duration: 4000,
      highlight: true
    },
    {
      id: 'onboarding-name',
      target: 'name-input',
      title: 'Tell Us Your Name',
      content: 'Your name will be displayed to bandmates and collaborators.',
      position: 'bottom',
      action: 'type',
      duration: 3000,
      highlight: true
    },
    {
      id: 'band-choice',
      target: 'band-choice-buttons',
      title: 'Join or Form?',
      content: 'Choose whether to join an existing band or start your own musical journey.',
      position: 'top',
      action: 'click',
      duration: 4000,
      highlight: true
    }
  ],
  features: [
    {
      id: 'home-screen',
      target: 'band-cards',
      title: 'Your Musical Ecosystem',
      content: 'Beautiful card-based interface showing all your bands and projects. Each card displays member counts and recent activity.',
      position: 'center',
      duration: 5000,
      highlight: true
    },
    {
      id: 'track-cards',
      target: 'track-card',
      title: 'Pixel-Perfect Track Cards',
      content: 'Every track card is exactly 343×64 pixels with consistent spacing and beautiful typography.',
      position: 'right',
      duration: 4000,
      highlight: true
    },
    {
      id: 'swipe-rating',
      target: 'track-card',
      title: 'Swipe to Rate',
      content: 'Swipe left on any track to reveal Like 👍 and Love ❤️ buttons for quick feedback.',
      position: 'right',
      action: 'swipe',
      duration: 5000,
      highlight: true
    },
    {
      id: 'audio-player',
      target: 'now-playing',
      title: 'Immersive Playback',
      content: 'Full-screen audio experience with 280×280px album art and intuitive controls.',
      position: 'center',
      duration: 4000,
      highlight: true
    },
    {
      id: 'collaborators',
      target: 'collaborator-list',
      title: 'Real-Time Collaboration',
      content: 'See who\'s online, their roles, skills, and current projects. Music is better together!',
      position: 'left',
      duration: 4000,
      highlight: true
    }
  ],
  advanced: [
    {
      id: 'upload-system',
      target: 'upload-zone',
      title: 'Smart Upload System',
      content: 'Drag and drop audio files with automatic metadata detection and progress tracking.',
      position: 'top',
      duration: 4000,
      highlight: true
    },
    {
      id: 'comment-system',
      target: 'comment-thread',
      title: 'Contextual Comments',
      content: 'Leave comments linked to specific timestamps for precise feedback and discussions.',
      position: 'left',
      duration: 4000,
      highlight: true
    },
    {
      id: 'invite-system',
      target: 'invite-flow',
      title: 'Phone-Based Invites',
      content: 'Invite new band members using their phone numbers with personal messages.',
      position: 'center',
      duration: 4000,
      highlight: true
    },
    {
      id: 'profile-management',
      target: 'profile-screen',
      title: 'Your Creative Identity',
      content: 'Manage your profile, track storage usage, and view your musical journey statistics.',
      position: 'right',
      duration: 4000,
      highlight: true
    }
  ]
};

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  tourType,
  autoPlay = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const steps = tourSteps[tourType] || [];
  const currentStepData = steps[currentStep];

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying || !currentStepData) return;

    const duration = currentStepData.duration || 4000;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        if (newProgress >= 100) {
          if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
            setProgress(0);
          } else {
            setIsPlaying(false);
          }
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStepData, currentStep, steps.length]);

  // Target element highlighting
  useEffect(() => {
    if (!currentStepData?.target || !currentStepData.highlight) return;

    const targetElement = document.querySelector(`[data-tour-target="${currentStepData.target}"]`);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      
      if (highlightRef.current) {
        highlightRef.current.style.left = `${rect.left - 4}px`;
        highlightRef.current.style.top = `${rect.top - 4}px`;
        highlightRef.current.style.width = `${rect.width + 8}px`;
        highlightRef.current.style.height = `${rect.height + 8}px`;
        highlightRef.current.style.opacity = '1';
      }
    }
  }, [currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
      setProgress(0);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleStepSelect = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const getTooltipPosition = () => {
    if (!currentStepData) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    switch (currentStepData.position) {
      case 'top':
        return { top: '20%', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: '20%', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { top: '50%', left: '20%', transform: 'translateY(-50%)' };
      case 'right':
        return { top: '50%', right: '20%', transform: 'translateY(-50%)' };
      case 'center':
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  if (!isOpen || !currentStepData) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Highlight overlay */}
      {currentStepData.highlight && (
        <div
          ref={highlightRef}
          className="absolute pointer-events-none border-2 border-primary rounded-lg shadow-lg transition-all duration-500 opacity-0"
          style={{ zIndex: 51 }}
        />
      )}

      {/* Main tooltip */}
      <div
        className="absolute z-52 max-w-sm"
        style={getTooltipPosition()}
      >
        <Card className="bg-white shadow-2xl p-6 rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} of {steps.length}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {tourType} Tour
              </Badge>
            </div>
            <Button variant="ghost" size="small" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">{currentStepData.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Progress bar */}
          {isPlaying && (
            <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Action indicator */}
          {currentStepData.action && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                {currentStepData.action === 'click' && '👆 Click here'}
                {currentStepData.action === 'swipe' && '👈 Swipe left'}
                {currentStepData.action === 'type' && '⌨️ Type to continue'}
                {currentStepData.action === 'wait' && '⏳ Please wait...'}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="small"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant={isPlaying ? "secondary" : "primary"}
                size="small"
                onClick={handlePlayPause}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                variant="outline"
                size="small"
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="small"
              onClick={handleRestart}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </Button>
          </div>
        </Card>
      </div>

      {/* Step navigator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-52">
        <Card className="bg-white bg-opacity-95 backdrop-blur p-4 rounded-lg">
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepSelect(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStep === index 
                    ? 'bg-primary scale-125' 
                    : currentStep > index 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={step.title}
              />
            ))}
          </div>
          
          <div className="text-center mt-2">
            <div className="text-xs text-gray-600">
              {currentStepData.title}
            </div>
          </div>
        </Card>
      </div>

      {/* Skip tour button */}
      <div className="absolute top-8 right-8 z-52">
        <Button variant="secondary" onClick={onClose} className="bg-white bg-opacity-95">
          Skip Tour
        </Button>
      </div>
    </div>
  );
};

export default InteractiveTour;