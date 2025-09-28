/**
 * CoreTet Feature Showcase - Interactive Demo Highlights
 * Demonstrates key features with animations and callouts
 */

import React, { useState, useEffect } from 'react';
import { Play, Heart, Users, Upload, MessageCircle, Star, Zap, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrackCard } from '../components/TrackCard';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  demo: React.ReactNode;
  stats?: string;
}

const features: Feature[] = [
  {
    id: 'design',
    title: 'Pixel-Perfect Design',
    description: 'Every component follows exact specifications with Rdio-inspired aesthetics',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-primary text-white',
    demo: (
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Exact Specifications:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Track cards: exactly 343×64px</li>
            <li>• Buttons: exactly 44px or 28px height</li>
            <li>• Icons: exactly 24px or 16px</li>
            <li>• 8px grid spacing system</li>
            <li>• SF Pro Display typography</li>
          </ul>
        </div>
        <TrackCard
          title="Design Demo Track"
          artist="CoreTet Team"
          duration="3:42"
          rating="love"
          onPlayPause={() => {}}
          onRate={() => {}}
        />
      </div>
    ),
    stats: '100% consistent spacing'
  },
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration',
    description: 'Work together seamlessly with live status, comments, and instant feedback',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-accent-teal text-white',
    demo: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            SM
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Sarah Martinez</div>
            <div className="text-xs text-gray-500">Online • Vocalist</div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            MD
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Mike Douglas</div>
            <div className="text-xs text-gray-500">Away • Producer</div>
          </div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        </div>
      </div>
    ),
    stats: 'Live status updates'
  },
  {
    id: 'rating',
    title: 'Swipe-to-Rate System',
    description: 'Intuitive Like/Love feedback system with beautiful swipe interactions',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-coral text-white',
    demo: (
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <strong>Try it:</strong> Swipe left on any track card to reveal rating buttons
        </div>
        <div className="relative">
          <TrackCard
            title="Swipe Demo Track"
            artist="Interactive Example"
            duration="2:30"
            rating="none"
            onPlayPause={() => {}}
            onRate={() => {}}
            showRating={true}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
              👍
            </div>
            <div className="w-6 h-6 bg-coral rounded-full flex items-center justify-center text-white text-xs">
              ❤️
            </div>
          </div>
        </div>
      </div>
    ),
    stats: 'Gesture-based feedback'
  },
  {
    id: 'upload',
    title: 'Smart Upload System',
    description: 'Drag-and-drop file uploads with automatic metadata detection',
    icon: <Upload className="w-6 h-6" />,
    color: 'bg-accent-green text-white',
    demo: (
      <div className="space-y-3">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">Drag & drop audio files here</p>
          <p className="text-xs text-gray-500 mt-1">Supports MP3, WAV, AIFF, M4A</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">new_song.mp3</span>
            <span className="text-gray-500">3.2 MB</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-1 mt-2">
            <div className="bg-green-500 h-1 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>
    ),
    stats: 'Multiple format support'
  },
  {
    id: 'comments',
    title: 'Contextual Comments',
    description: 'Timestamp-linked comments for precise feedback on specific moments',
    icon: <MessageCircle className="w-6 h-6" />,
    color: 'bg-accent-amber text-black',
    demo: (
      <div className="space-y-3">
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              AC
            </div>
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-medium">Alex Chen</span>
                <span className="text-blue-500 ml-2">@2:15</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Love the guitar tone at this moment! 🎸
              </p>
              <div className="text-xs text-gray-400 mt-1">2 minutes ago</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
              SM
            </div>
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-medium">Sarah M.</span>
                <span className="text-blue-500 ml-2">@3:42</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Can we add harmony here?
              </p>
              <div className="text-xs text-gray-400 mt-1">5 minutes ago</div>
            </div>
          </div>
        </div>
      </div>
    ),
    stats: 'Timestamp precision'
  },
  {
    id: 'player',
    title: 'Immersive Audio Player',
    description: 'Full-screen experience with beautiful album art and smooth controls',
    icon: <Play className="w-6 h-6" />,
    color: 'bg-primary text-white',
    demo: (
      <div className="bg-gradient-to-b from-blue-500 to-blue-700 p-6 rounded-lg text-white text-center">
        <div className="w-32 h-32 bg-white bg-opacity-20 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <Music className="w-12 h-12 text-white" />
        </div>
        <h3 className="font-medium mb-1">Summer Nights</h3>
        <p className="text-sm opacity-75 mb-4">Alex Chen • Summer Indie Band</p>
        <div className="flex items-center justify-center gap-4">
          <button className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            ⏮
          </button>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600">
            ⏸
          </button>
          <button className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            ⏭
          </button>
        </div>
        <div className="mt-4">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
            <div className="bg-white h-1 rounded-full w-1/3"></div>
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-75">
            <span>1:23</span>
            <span>3:42</span>
          </div>
        </div>
      </div>
    ),
    stats: '280×280px album art'
  }
];

export const FeatureShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentFeature = features[activeFeature];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-off-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light mb-4 text-primary">CoreTet Feature Showcase</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the powerful features that make CoreTet the ultimate music collaboration platform
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            onClick={() => {
              setActiveFeature(index);
              setIsAutoPlaying(false);
            }}
            className={`p-4 rounded-lg text-left transition-all duration-300 ${
              activeFeature === index
                ? feature.color + ' transform scale-105 shadow-lg'
                : 'bg-white hover:bg-gray-50 shadow-default'
            }`}
          >
            <div className="mb-2">{feature.icon}</div>
            <h3 className={`font-medium text-sm mb-1 ${
              activeFeature === index ? 'text-current' : 'text-gray-900'
            }`}>
              {feature.title}
            </h3>
            {feature.stats && (
              <p className={`text-xs ${
                activeFeature === index ? 'text-current opacity-75' : 'text-gray-500'
              }`}>
                {feature.stats}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Active Feature Display */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Feature Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${currentFeature.color}`}>
              {currentFeature.icon}
            </div>
            <div>
              <h2 className="text-2xl font-medium text-gray-900">{currentFeature.title}</h2>
              {currentFeature.stats && (
                <Badge variant="secondary" className="mt-1">
                  {currentFeature.stats}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentFeature.description}
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Key Benefits:</h3>
            {activeFeature === 0 && (
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Rdio-inspired aesthetic with modern touches
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Pixel-perfect specifications for every component
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Consistent 8px grid spacing system
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  WCAG AA accessibility compliant
                </li>
              </ul>
            )}
            {activeFeature === 1 && (
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-teal rounded-full"></div>
                  Real-time online status for all band members
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-teal rounded-full"></div>
                  Instant notifications for new uploads and comments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-teal rounded-full"></div>
                  Role-based permissions and project management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-teal rounded-full"></div>
                  Cross-device synchronization
                </li>
              </ul>
            )}
            {activeFeature === 2 && (
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                  Intuitive swipe-left gesture to reveal ratings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                  Like (👍) and Love (❤️) system for nuanced feedback
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                  Visual feedback with color-coded responses
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                  Aggregate rating displays for quick insights
                </li>
              </ul>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <Button
              variant={isAutoPlaying ? "secondary" : "primary"}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center gap-2"
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAutoPlaying ? 'Pause' : 'Play'} Auto-Demo
            </Button>
            
            <div className="text-sm text-gray-500">
              {activeFeature + 1} of {features.length}
            </div>
          </div>
        </div>

        {/* Feature Demo */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="font-medium mb-4 text-gray-900">Interactive Demo</h3>
          {currentFeature.demo}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveFeature(index);
                setIsAutoPlaying(false);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeFeature === index ? 'bg-primary w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 p-6 bg-white rounded-xl shadow-default">
        <div className="text-center">
          <div className="text-2xl font-medium text-primary mb-1">100%</div>
          <div className="text-sm text-gray-600">Design Consistency</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-primary mb-1">60fps</div>
          <div className="text-sm text-gray-600">Smooth Animations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-primary mb-1">44px</div>
          <div className="text-sm text-gray-600">Touch Targets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-primary mb-1">AA</div>
          <div className="text-sm text-gray-600">WCAG Compliant</div>
        </div>
      </div>
    </div>
  );
};