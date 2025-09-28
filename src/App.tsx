import React, { useEffect } from 'react';
import './styles.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BandProvider } from './contexts/BandContext';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { PhoneVerificationScreen } from './components/screens/PhoneVerificationScreen';
import { CodeVerificationScreen } from './components/screens/CodeVerificationScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { BandActionScreen } from './components/screens/BandActionScreen';
import { BandCreationScreen } from './components/screens/BandCreationScreen';
import { BandJoiningScreen } from './components/screens/BandJoiningScreen';
import { WaitlistScreen } from './components/screens/WaitlistScreen';
import { MainDashboard } from './components/screens/MainDashboard';
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
  const { currentScreen, setCurrentScreen, waitlistPosition, waitlistMessage } = useAuth();

  useEffect(() => {
    // TODO: Enable when Supabase credentials are configured
    // testConnection();
  }, []);

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'phone':
      return <PhoneVerificationScreen />;
    case 'verify':
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
    default:
      return <PhoneVerificationScreen />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BandProvider>
        <AppRoutes />
      </BandProvider>
    </AuthProvider>
  );
}