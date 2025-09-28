import React, { useEffect } from 'react';
import './styles.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { PhoneVerificationScreen } from './components/screens/PhoneVerificationScreen';
import { CodeVerificationScreen } from './components/screens/CodeVerificationScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { BandActionScreen } from './components/screens/BandActionScreen';
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
  const { currentScreen } = useAuth();

  useEffect(() => {
    testConnection();
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
    case 'bandAction':
      return <BandActionScreen />;
    case 'main':
      return <MainDashboard />;
    default:
      return <PhoneVerificationScreen />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}