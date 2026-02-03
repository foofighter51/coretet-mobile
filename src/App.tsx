import React, { useEffect, useState } from 'react';
import './styles.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SetListProvider } from './contexts/SetListContext';
import { BandProvider } from './contexts/BandContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainDashboard } from './components/screens/MainDashboard';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { PublicPlaylistView } from './components/screens/PublicPlaylistView';
import { PublicWorkView } from './components/screens/PublicWorkView';
import { PhoneAuthScreen } from './components/screens/PhoneAuthScreen';
import { EmailConfirmedScreen } from './components/screens/EmailConfirmedScreen';
// TEMPORARILY HIDDEN FOR TESTFLIGHT (TestFlight has its own feedback system)
// TODO: Re-enable after TestFlight phase
// import { FeedbackBoard } from './components/screens/FeedbackBoard';
// import { FeedbackDashboard } from './components/screens/FeedbackDashboard';
import { LandingPage } from './components/screens/LandingPage';
import { NewLandingPage } from './components/screens/NewLandingPage';
import { AcceptInvite } from './components/screens/AcceptInvite';
import { AdminInviteCodesScreen } from './components/screens/AdminInviteCodesScreen';
import { AdminRouteGuard } from './components/guards/AdminRouteGuard';
import { Spinner } from './components/atoms/Spinner';
// Development-only component playground
const ComponentPlayground = import.meta.env.DEV
  ? React.lazy(() => import('./components/screens/ComponentPlayground'))
  : null;
import DeepLinkService from './utils/deepLinkHandler';
import { Capacitor } from '@capacitor/core';
import { auth, db } from '../lib/supabase';
import { designTokens } from './design/designTokens';
import './utils/feedbackCLI';

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
    <BandProvider userId={user.id}>
      <SetListProvider>
        <MainDashboard currentUser={{
          id: user.id,
          email: user.email || '',
          phoneNumber: user.phone || '',
          name: profile?.name || ''
        }} />
      </SetListProvider>
    </BandProvider>
  );
}

// Deep link handler component
function DeepLinkHandler() {
  const navigate = useNavigate();
  const hasProcessedLaunchUrl = React.useRef(false);

  React.useEffect(() => {
    // Initialize deep linking on native platforms
    if (Capacitor.isNativePlatform()) {
      DeepLinkService.initialize();

      // Add listener for deep links
      const handleDeepLink = (path: string, params: Record<string, string>) => {

        // Ensure path starts with /
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        // Small delay to ensure router is ready
        setTimeout(() => {
          navigate(cleanPath, { replace: true });
        }, 100);
      };

      DeepLinkService.addListener(handleDeepLink);

      // Check if app was launched from a deep link - ONLY ONCE
      if (!hasProcessedLaunchUrl.current) {
        DeepLinkService.getLaunchUrl().then(url => {
          if (url) {
            hasProcessedLaunchUrl.current = true;
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


              // Navigate to the deep link path with longer delay for auth
              setTimeout(() => {
                navigate(path, { replace: true });
              }, 500);
            } catch (error) {
              console.error('❌ Failed to parse deep link URL:', error, url);
            }
          }
        });
      }

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
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <DeepLinkHandler />
          <Routes>
          {/* Email confirmation success page */}
          <Route path="/auth/confirmed" element={<EmailConfirmedScreen />} />

          {/* Development-only component playground */}
          {import.meta.env.DEV && ComponentPlayground && (
            <Route path="/dev/playground" element={
              <React.Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}><Spinner label="Loading playground..." /></div>}>
                <ComponentPlayground />
              </React.Suspense>
            } />
          )}

          {/* Invite acceptance - handles its own authentication */}
          <Route path="/invite/:token" element={
            <ErrorBoundary>
              {user ? (
                <BandProvider userId={user.id}>
                  <AcceptInvite />
                </BandProvider>
              ) : (
                <AcceptInvite />
              )}
            </ErrorBoundary>
          } />

          {/* Playlist view - REQUIRES AUTHENTICATION (private WIP songs - NOT PUBLIC) */}
          <Route path="/playlist/:shareCode" element={
            <ErrorBoundary>
              {user ? <PublicPlaylistView /> : (Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <LandingPage />)}
            </ErrorBoundary>
          } />

          {/* Work (song project) public view - PUBLIC WHEN is_public=true */}
          <Route path="/work/:shareCode" element={
            <ErrorBoundary>
              <PublicWorkView />
            </ErrorBoundary>
          } />

        {/* TEMPORARILY HIDDEN FOR TESTFLIGHT (TestFlight has its own feedback system) */}
        {/* TODO: Re-enable after TestFlight phase */}
        {/* Feedback board - requires authentication */}
        {/* <Route path="/feedback" element={
          user ? <FeedbackBoard /> : (Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <LandingPage />)
        } /> */}

        {/* Feedback dashboard - requires authentication (admin only) */}
        {/* <Route path="/admin/feedback" element={
          user ? <FeedbackDashboard /> : (Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <LandingPage />)
        } /> */}

        {/* Admin routes - requires authentication and admin role */}
        <Route path="/admin/codes" element={
          <ErrorBoundary>
            {user ? (
              <AdminRouteGuard userId={user.id}>
                <AdminInviteCodesScreen />
              </AdminRouteGuard>
            ) : (
              <PhoneAuthScreen />
            )}
          </ErrorBoundary>
        } />

        {/* App routes - only accessible on native app or when authenticated */}
        <Route path="/app/*" element={
          <ErrorBoundary>
            {user ? <AppContent user={user} /> : <PhoneAuthScreen />}
          </ErrorBoundary>
        } />

        {/* Landing page for web visitors, or app if authenticated */}
        <Route path="/" element={
          <ErrorBoundary>
            {Capacitor.isNativePlatform()
              ? (user ? <AppContent user={user} /> : <PhoneAuthScreen />)
              : (user ? <AppContent user={user} /> : <NewLandingPage />)}
          </ErrorBoundary>
        } />

        {/* Catch-all - show landing page on web, auth screen on native */}
        <Route path="*" element={
          Capacitor.isNativePlatform() ? <PhoneAuthScreen /> : <NewLandingPage />
        } />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}