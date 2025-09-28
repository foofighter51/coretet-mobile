/**
 * CoreTet Demo App - Automated Demo Version
 * Shows off all functionality with scripted interactions
 */

import React, { useState, useEffect } from 'react';
import { DemoController } from './DemoController';
import App from '../App';

// Mock data for demo purposes
const demoMockTracks = [
  {
    title: "Midnight Jazz",
    artist: "Alex Chen",
    ensemble: "Summer Indie Band", 
    duration: "3:42",
    durationSeconds: 222,
    albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=280&fit=crop",
    rating: 'love' as const
  },
  {
    title: "Electric Dreams",
    artist: "Emma Rodriguez", 
    ensemble: "Electronic Fusion",
    duration: "4:15",
    durationSeconds: 255,
    albumArt: "https://images.unsplash.com/photo-1571974599782-87624638275c?w=280&h=280&fit=crop",
    rating: 'like' as const
  },
  {
    title: "Acoustic Sunrise", 
    artist: "David Park",
    ensemble: "Acoustic Collective",
    duration: "5:28",
    durationSeconds: 328,
    albumArt: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=280&h=280&fit=crop",
    rating: 'none' as const
  }
];

const demoMockCollaborators = [
  {
    name: "Sarah Martinez",
    role: "Vocalist & Songwriter",
    status: 'online' as const,
    skills: ["Vocals", "Lyrics", "Piano"],
    projectsCount: 3,
    isConnected: true
  },
  {
    name: "Mike Douglas", 
    role: "Producer & Engineer",
    status: 'away' as const,
    skills: ["Production", "Mixing", "Mastering"],
    projectsCount: 5,
    isConnected: false
  },
  {
    name: "Lisa Kim",
    role: "Multi-instrumentalist", 
    status: 'online' as const,
    skills: ["Guitar", "Bass", "Drums"],
    projectsCount: 2,
    isConnected: true
  }
];

interface DemoAppProps {
  showDemo?: boolean;
  onCloseDemo?: () => void;
}

export const DemoApp: React.FC<DemoAppProps> = ({ showDemo = false, onCloseDemo }) => {
  const [demoStep, setDemoStep] = useState<any>(null);
  const [appProps, setAppProps] = useState<any>({});

  // Demo automation based on current step
  useEffect(() => {
    if (!demoStep) return;

    switch (demoStep.id) {
      case 'onboarding':
        // Simulate onboarding completion
        setTimeout(() => {
          setAppProps(prev => ({
            ...prev,
            hasCompletedOnboarding: false,
            isInitialLoading: false
          }));
        }, 2000);
        break;

      case 'homescreen':
        // Show home screen with bands
        setAppProps(prev => ({
          ...prev,
          hasCompletedOnboarding: true,
          activeTab: 'bands',
          selectedBand: null
        }));
        break;

      case 'tracklist':
        // Show track listing
        setAppProps(prev => ({
          ...prev,
          activeTab: 'bands',
          selectedBand: { id: '1', name: 'Summer Indie Band', memberCount: 4 }
        }));
        // Simulate track interaction
        setTimeout(() => {
          setAppProps(prev => ({
            ...prev,
            playingTrack: demoMockTracks[0].title
          }));
        }, 3000);
        break;

      case 'nowplaying':
        // Show now playing screen
        setAppProps(prev => ({
          ...prev,
          isNowPlayingOpen: true,
          currentTrack: demoMockTracks[0],
          playingTrack: demoMockTracks[0].title,
          currentTime: 45
        }));
        break;

      case 'trackupload':
        // Show upload screen
        setAppProps(prev => ({
          ...prev,
          showUploadScreen: true,
          isNowPlayingOpen: false
        }));
        break;

      case 'collaboration':
        // Show collaborators tab
        setAppProps(prev => ({
          ...prev,
          activeTab: 'collaborators',
          showUploadScreen: false,
          selectedBand: null
        }));
        break;

      case 'invites':
        // Show invite flow
        setAppProps(prev => ({
          ...prev,
          showInviteFlow: true
        }));
        break;

      case 'comments':
        // Show comment thread
        setAppProps(prev => ({
          ...prev,
          showCommentThread: true,
          commentTrack: demoMockTracks[0],
          showInviteFlow: false
        }));
        break;

      case 'profile':
        // Show profile screen
        setAppProps(prev => ({
          ...prev,
          activeTab: 'profile',
          showCommentThread: false
        }));
        break;

      default:
        break;
    }
  }, [demoStep]);

  const handleDemoStep = (step: any) => {
    setDemoStep(step);
  };

  return (
    <div className="relative">
      {/* Main App */}
      <div className="w-mobile h-mobile bg-off-white mx-auto overflow-hidden">
        <App {...appProps} />
      </div>

      {/* Demo Controls Overlay */}
      {showDemo && (
        <DemoController
          onDemoStep={handleDemoStep}
          currentApp={<App {...appProps} />}
        />
      )}
    </div>
  );
};

export default DemoApp;