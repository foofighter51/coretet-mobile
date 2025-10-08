import React, { useEffect, useState } from 'react';
import './styles.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { MainDashboard } from './components/screens/MainDashboard';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { PublicPlaylistView } from './components/screens/PublicPlaylistView';
import { PhoneAuthScreen } from './components/screens/PhoneAuthScreen';
import { FeedbackBoard } from './components/screens/FeedbackBoard';
import { FeedbackDashboard } from './components/screens/FeedbackDashboard';
import { LandingPage } from './components/screens/LandingPage';
import { Spinner } from './components/atoms/Spinner';
import DeepLinkService from './utils/deepLinkHandler';
import { Capacitor } from '@capacitor/core';
import { auth, db } from '../lib/supabase';
import { designTokens } from './design/designTokens';

// User type from Supabase auth
interface User {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

// Main app content for authenticated users
function AppContent({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Sync user profile
  useEffect(() => {
    const setupProfile = async () => {
      try {
        console.log('🔑 Setting up profile for user:', user.id);

        // Get or create profile
        let { data: existingProfile, error } = await db.profiles.getById(user.id);

        if (error || !existingProfile) {
          // Create profile
          const name = user.user_metadata?.firstName || user.user_metadata?.name || user.phone || 'User';
          const { data: newProfile } = await db.profiles.create({
            id: user.id,
            phone_number: user.phone || '',
            name: name,
          });
          setProfile(newProfile);
        } else {
          setProfile(existingProfile);
        }
      } catch (error) {
        console.error('❌ Profile setup error:', error);
      } finally {
        setLoading(false);
      }
    };

    setupProfile();
  }, [user]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}>
        <Spinner size={48} label="Loading your profile..." />
      </div>
    );
  }

  // Check if user needs onboarding (no name set)
  const needsOnboarding = !profile?.name || profile.name === 'User';

  if (needsOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <PlaylistProvider>
      <MainDashboard currentUser={{
        id: user.id,
        email: user.email || '',
        phoneNumber: user.phone || '',
        name: profile?.name || ''
      }} />
    </PlaylistProvider>
  );
}

// Deep link handler component
function DeepLinkHandler() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Initialize deep linking on native platforms
    if (Capacitor.isNativePlatform()) {
      DeepLinkService.initialize();

      // Add listener for deep links
      const handleDeepLink = (path: string, params: Record<string, string>) => {
        console.log('📲 Deep link received, path:', path, 'params:', params);

        // Ensure path starts with /
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        console.log('📲 Navigating to:', cleanPath);

        // Small delay to ensure router is ready
        setTimeout(() => {
          navigate(cleanPath, { replace: true });
        }, 100);
      };

      DeepLinkService.addListener(handleDeepLink);

      // Check if app was launched from a deep link
      DeepLinkService.getLaunchUrl().then(url => {
        if (url) {
          console.log('📲 App launched from deep link:', url);
          try {
            const parsedUrl = new URL(url);
            let path = parsedUrl.pathname;

            // Handle coretet:// scheme - pathname might be empty, use host + pathname
            if (url.startsWith('coretet://')) {
              // For coretet://playlist/ABC123, host="playlist", pathname="/ABC123"
              // We need to combine them: /playlist/ABC123
              const host = parsedUrl.host || parsedUrl.hostname;
              path = host ? `/${host}${path}` : path;
            }

            console.log('📲 Extracted path:', path);
            console.log('📲 Will navigate to:', path);

            // Navigate to the deep link path with longer delay for auth
            setTimeout(() => {
              console.log('📲 Navigating now to:', path);
              navigate(path, { replace: true });
            }, 500);
          } catch (error) {
            console.error('❌ Failed to parse deep link URL:', error, url);
          }
        }
      });

      // Cleanup
      return () => {
        DeepLinkService.removeListener(handleDeepLink);
      };
    }
  }, [navigate]);

  return null;
}

// Root app with Supabase auth
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { user: currentUser } = await auth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}>
        <Spinner size={48} label="Loading your music library..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <DeepLinkHandler />
      <Routes>
        {/* Playlist view - REQUIRES AUTHENTICATION (private WIP songs - NOT PUBLIC) */}
        <Route path="/playlist/:shareCode" element={
          user ? <PublicPlaylistView /> : (Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <LandingPage />)
        } />

        {/* Feedback board - requires authentication */}
        <Route path="/feedback" element={
          user ? <FeedbackBoard /> : (Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <LandingPage />)
        } />

        {/* Feedback dashboard - requires authentication (admin only) */}
        <Route path="/admin/feedback" element={
          user ? <FeedbackDashboard /> : (Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <LandingPage />)
        } />

        {/* App routes - only accessible on native app or when authenticated */}
        <Route path="/app/*" element={
          user ? <AppContent user={user} /> : <PhoneAuthScreen />
        } />

        {/* Landing page for web visitors */}
        <Route path="/" element={
          Capacitor.isNativePlatform()
            ? (user ? <AppContent user={user} /> : <PhoneAuthScreen />)
            : <LandingPage />
        } />

        {/* Catch-all - show landing page on web, auth screen on native */}
        <Route path="*" element={
          Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <LandingPage />
        } />
      </Routes>
    </BrowserRouter>
  );
}