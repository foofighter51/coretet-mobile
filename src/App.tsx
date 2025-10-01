import React from 'react';
import './styles.css';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { BandProvider } from './contexts/BandContext';
import { MainDashboard } from './components/screens/MainDashboard';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { publishableKey } from './lib/clerk';

// Simple auth screen with Clerk
function AuthScreen() {
  return (
    <div style={{
      padding: '40px 24px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 'normal',
        textAlign: 'center',
        margin: '0 0 16px 0',
        color: '#2d3748'
      }}>
        Welcome to CoreTet
      </h1>

      <p style={{
        fontSize: '16px',
        color: '#4a5568',
        textAlign: 'center',
        margin: '0 0 32px 0'
      }}>
        Sign in to start collaborating with your band
      </p>

      <SignInButton mode="modal">
        <button style={{
          backgroundColor: '#3182ce',
          color: '#ffffff',
          border: 'none',
          borderRadius: '28px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Sign In / Sign Up
        </button>
      </SignInButton>
    </div>
  );
}

// Main app content for authenticated users
function AppContent() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  // Sync user profile (direct DB access, RLS disabled temporarily)
  React.useEffect(() => {
    if (user && isLoaded) {
      const setupAuth = async () => {
        try {
          console.log('🔑 Setting up profile for user:', user.id);

          // Create profile directly (RLS disabled for now)
          const { ClerkSupabaseSync } = await import('./utils/clerkSupabaseSync');
          const result = await ClerkSupabaseSync.syncUserProfileDirect(user);

          if (result.success) {
            console.log('✅ Profile synced:', result.profile);
          } else {
            console.error('❌ Profile sync failed:', result.error);
          }
        } catch (error) {
          console.error('❌ Auth setup error:', error);
        }
      };

      setupAuth();
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        Loading...
      </div>
    );
  }

  // Check if user needs onboarding (no name set)
  const needsOnboarding = !user?.firstName && !user?.lastName;

  if (needsOnboarding) {
    return (
      <OnboardingScreen />
    );
  }

  // Convert Clerk user to our AuthUser format for BandProvider
  const authUser = {
    id: user?.id || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phoneNumber: user?.primaryPhoneNumber?.phoneNumber || '',
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  };

  return (
    <BandProvider currentUser={authUser}>
      <div style={{ position: 'relative' }}>
        {/* User button in top right */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 1000
        }}>
          <UserButton />
        </div>

        <MainDashboard />
      </div>
    </BandProvider>
  );
}

// Root app with Clerk provider
export default function App() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        variables: {
          colorPrimary: '#3182ce'
        }
      }}
      localization={{
        signUp: {
          start: {
            title: 'Join CoreTet',
            subtitle: 'Create your account to start collaborating'
          }
        }
      }}
    >
      <SignedOut>
        <AuthScreen />
      </SignedOut>
      <SignedIn>
        <AppContent />
      </SignedIn>
    </ClerkProvider>
  );
}