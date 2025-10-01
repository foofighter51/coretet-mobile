import React, { useEffect } from 'react';
import './styles.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BandProvider } from './contexts/BandContext';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { EmailPasswordScreen } from './components/screens/EmailPasswordScreen';
import { PhoneVerificationScreen } from './components/screens/PhoneVerificationScreen';
import { CodeVerificationScreen } from './components/screens/CodeVerificationScreen';
import { MagicLinkVerificationScreen } from './components/screens/MagicLinkVerificationScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { BandActionScreen } from './components/screens/BandActionScreen';
import { BandCreationScreen } from './components/screens/BandCreationScreen';
import { BandJoiningScreen } from './components/screens/BandJoiningScreen';
import { WaitlistScreen } from './components/screens/WaitlistScreen';
import { MainDashboard } from './components/screens/MainDashboard';
import { PasswordResetScreen } from './components/screens/PasswordResetScreen';
import { ForgotPasswordScreen } from './components/screens/ForgotPasswordScreen';
import { supabase } from '../lib/supabase';

// Test Supabase connection
const testConnection = async () => {
  console.log('🔄 Testing Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' });

    if (error) {
      console.error('❌ Connection failed:', error);
    } else {
      console.log('✅ Connected! Profile count:', data);
    }
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
};

function AppRoutes() {
  const { currentScreen, setCurrentScreen, waitlistPosition, waitlistMessage, email, currentUser } = useAuth();

  useEffect(() => {
    // TODO: Enable when Supabase credentials are configured
    // testConnection();
  }, []);

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'phone':
      return <EmailPasswordScreen />;
    case 'verify':
      // Check auth mode to determine verification type
      const authMode = import.meta.env.VITE_AUTH_MODE;
      if (authMode === 'email') {
        return (
          <MagicLinkVerificationScreen
            email={email}
            onSuccess={() => setCurrentScreen('onboarding')}
            onBack={() => setCurrentScreen('phone')}
          />
        );
      } else if (authMode === 'password') {
        return (
          <MagicLinkVerificationScreen
            email={email}
            onSuccess={() => setCurrentScreen('phone')}
            onBack={() => setCurrentScreen('phone')}
            isEmailConfirmation={true}
          />
        );
      }
      return <CodeVerificationScreen />;
    case 'onboarding':
      return <OnboardingScreen />;
    case 'waitlist':
      return (
        <WaitlistScreen
          waitlistPosition={waitlistPosition}
          message={waitlistMessage || 'You have been added to the waitlist'}
        />
      );
    case 'bandAction':
      return <BandActionScreen />;
    case 'bandCreation':
      return (
        <BandCreationScreen
          onBack={() => setCurrentScreen('bandAction')}
          onSuccess={() => setCurrentScreen('main')}
        />
      );
    case 'bandJoining':
      return (
        <BandJoiningScreen
          onBack={() => setCurrentScreen('bandAction')}
          onSuccess={() => setCurrentScreen('main')}
        />
      );
    case 'main':
      return <MainDashboard />;
    case 'passwordReset':
      return (
        <PasswordResetScreen
          onBack={() => setCurrentScreen('phone')}
          onSuccess={() => setCurrentScreen('main')}
        />
      );
    case 'forgotPassword':
      return (
        <ForgotPasswordScreen
          onBack={() => setCurrentScreen('phone')}
        />
      );
    default:
      return <EmailPasswordScreen />;
  }
}

function AppWithProviders() {
  const { currentUser } = useAuth();

  return (
    <BandProvider currentUser={currentUser}>
      <AppRoutes />
    </BandProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  );
}