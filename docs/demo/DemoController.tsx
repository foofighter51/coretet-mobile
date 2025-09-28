/**
 * CoreTet Demo Controller - Interactive Demo System
 * Showcases all app functionality with automated tours and manual control
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Users, Music, Upload, Heart, MessageCircle, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  component: string;
  action: string;
  duration: number;
  screenshot?: string;
  highlights?: string[];
}

const demoSteps: DemoStep[] = [
  {
    id: 'onboarding',
    title: 'User Onboarding',
    description: 'New users enter their phone number, name, and choose to join or form a band',
    component: 'OnboardingFlow',
    action: 'Complete onboarding flow',
    duration: 8000,
    highlights: ['Phone verification', 'Name setup', 'Avatar selection', 'Band choice']
  },
  {
    id: 'homescreen',
    title: 'Band Home Screen',
    description: 'Beautiful card-based interface showing user\'s bands and ensembles',
    component: 'HomeScreen',
    action: 'Browse bands and projects',
    duration: 6000,
    highlights: ['Band cards', 'Member counts', 'Recent activity', 'Quick actions']
  },
  {
    id: 'tracklist',
    title: 'Track Management',
    description: 'View, play, and rate tracks with swipe-to-rate functionality',
    component: 'TrackListingScreen',
    action: 'Browse tracks, swipe to rate',
    duration: 10000,
    highlights: ['343×64px track cards', 'Swipe-to-rate (like/love)', 'Play controls', 'Duration display']
  },
  {
    id: 'nowplaying',
    title: 'Now Playing Experience',
    description: 'Full-screen audio player with album art and controls',
    component: 'NowPlayingScreen',
    action: 'Play track, show full player',
    duration: 8000,
    highlights: ['280×280px album art', 'Progress scrubbing', 'Next/previous', 'Time display']
  },
  {
    id: 'trackupload',
    title: 'Track Upload',
    description: 'Drag-and-drop file upload with metadata entry',
    component: 'TrackUploadScreen',
    action: 'Upload new track',
    duration: 7000,
    highlights: ['Drag & drop zone', 'File validation', 'Metadata forms', 'Progress tracking']
  },
  {
    id: 'collaboration',
    title: 'Collaborator Management',
    description: 'View band members, their status, and skills',
    component: 'CollaboratorList',
    action: 'View collaborators',
    duration: 6000,
    highlights: ['Online status', 'Role descriptions', 'Skill tags', 'Project counts']
  },
  {
    id: 'invites',
    title: 'Band Invitations',
    description: 'Phone-based invite system for adding new members',
    component: 'EnsembleInviteFlow',
    action: 'Send invites',
    duration: 5000,
    highlights: ['Phone number entry', 'Personal messages', 'Invite tracking', 'SMS integration']
  },
  {
    id: 'comments',
    title: 'Track Comments',
    description: 'Threaded commenting system with timestamp scrubbing',
    component: 'CommentThreadScreen',
    action: 'Add comments to tracks',
    duration: 6000,
    highlights: ['Threaded replies', 'Timestamp linking', 'Real-time updates', 'Rich text']
  },
  {
    id: 'profile',
    title: 'User Profile',
    description: 'Personal profile with storage, settings, and band management',
    component: 'ProfileScreen',
    action: 'View profile settings',
    duration: 4000,
    highlights: ['Storage usage', 'Band membership', 'Account settings', 'Statistics']
  }
];

interface DemoControllerProps {
  onDemoStep: (step: DemoStep) => void;
  currentApp: React.ReactNode;
}

export const DemoController: React.FC<DemoControllerProps> = ({ onDemoStep, currentApp }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    if (isPlaying && currentStep < demoSteps.length) {
      const step = demoSteps[currentStep];
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (step.duration / 100));
          if (newProgress >= 100) {
            if (autoAdvance && currentStep < demoSteps.length - 1) {
              setCurrentStep(curr => curr + 1);
              setProgress(0);
              onDemoStep(demoSteps[currentStep + 1]);
            } else {
              setIsPlaying(false);
            }
            return 100;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentStep, autoAdvance, onDemoStep]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (currentStep < demoSteps.length) {
      onDemoStep(demoSteps[currentStep]);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    onDemoStep(demoSteps[0]);
  };

  const handleStepSelect = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
    onDemoStep(demoSteps[stepIndex]);
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Demo App Display */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Phone Frame */}
          <div 
            className="relative bg-black rounded-3xl p-3 shadow-2xl"
            style={{ width: '400px', height: '850px' }}
          >
            <div 
              className="w-full h-full bg-off-white rounded-2xl overflow-hidden relative"
              style={{ width: '375px', height: '812px' }}
            >
              {currentApp}
              
              {/* Step Overlay */}
              {showControls && currentStepData && (
                <div className="absolute top-4 left-4 right-4 z-50">
                  <Card className="bg-white bg-opacity-95 backdrop-blur p-4 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{currentStepData.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {currentStep + 1}/{demoSteps.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{currentStepData.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    {/* Highlights */}
                    {currentStepData.highlights && (
                      <div className="flex flex-wrap gap-1">
                        {currentStepData.highlights.map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Feature Callouts */}
          {currentStepData?.id === 'tracklist' && (
            <div className="absolute left-full ml-6 top-1/4 space-y-4">
              <div className="bg-white rounded-lg p-3 shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-coral" />
                  <span className="font-medium text-sm">Swipe to Rate</span>
                </div>
                <p className="text-xs text-gray-600">
                  Swipe left on any track to reveal like/love buttons
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3 shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Music className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Exact Specifications</span>
                </div>
                <p className="text-xs text-gray-600">
                  Every track card is exactly 343×64px with 8px radius
                </p>
              </div>
            </div>
          )}

          {currentStepData?.id === 'nowplaying' && (
            <div className="absolute right-full mr-6 top-1/4 space-y-4">
              <div className="bg-white rounded-lg p-3 shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Full-Screen Player</span>
                </div>
                <p className="text-xs text-gray-600">
                  Immersive experience with 280×280px album art
                </p>
              </div>
            </div>
          )}

          {currentStepData?.id === 'invites' && (
            <div className="absolute left-full ml-6 top-1/3 space-y-4">
              <div className="bg-white rounded-lg p-3 shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-accent-teal" />
                  <span className="font-medium text-sm">Phone-Based Invites</span>
                </div>
                <p className="text-xs text-gray-600">
                  SMS-based invitation system for easy band member addition
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Card className="bg-white bg-opacity-95 backdrop-blur p-6 rounded-xl shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant={isPlaying ? "secondary" : "primary"}
              size="default"
              onClick={isPlaying ? handlePause : handlePlay}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'} Demo
            </Button>
            
            <Button
              variant="secondary"
              size="default"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoAdvance"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoAdvance" className="text-sm">Auto-advance</label>
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {showControls ? 'Hide' : 'Show'} Info
            </Button>
          </div>

          {/* Step Navigator */}
          <div className="grid grid-cols-3 gap-2 max-w-2xl">
            {demoSteps.map((step, index) => (
              <Button
                key={step.id}
                variant={currentStep === index ? "primary" : "outline"}
                size="small"
                onClick={() => handleStepSelect(index)}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs opacity-75">{step.duration/1000}s</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Current Step Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                {currentStepData?.title || 'Ready to Start'}
              </h3>
              <Badge variant="secondary">
                Step {currentStep + 1} of {demoSteps.length}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {currentStepData?.description || 'Click Play to begin the CoreTet demo tour'}
            </p>
            
            {currentStepData?.highlights && (
              <div>
                <h4 className="font-medium text-sm mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentStepData.highlights.map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemoController;