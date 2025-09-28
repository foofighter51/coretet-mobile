import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import SupabaseAuthService, { AuthUser } from '../utils/supabaseAuthService';
import { ErrorHandler, ErrorInfo } from '../utils/errorMessages';

export type ScreenId = 'welcome' | 'phone' | 'verify' | 'onboarding' | 'bandAction' | 'bandCreation' | 'bandJoining' | 'waitlist' | 'main';

interface AuthContextType {
  // User state
  currentUser: AuthUser | null;
  currentScreen: ScreenId;

  // Form state
  email: string; // Changed from phoneNumber for testing
  verificationCode: string;
  userName: string;

  // UI state
  authLoading: boolean;
  currentError: ErrorInfo | null;

  // Waitlist state
  waitlistPosition?: number;
  waitlistMessage?: string;

  // Actions
  setEmail: (email: string) => void; // Changed from setPhoneNumber
  setVerificationCode: (code: string) => void;
  setUserName: (name: string) => void;
  setCurrentScreen: (screen: ScreenId) => void;
  setCurrentError: (error: ErrorInfo | null) => void;

  // Auth operations
  sendVerificationCode: () => Promise<void>;
  verifyCode: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // User state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('phone');

  // Form state
  const [email, setEmail] = useState(''); // Changed from phoneNumber
  const [verificationCode, setVerificationCode] = useState('');
  const [userName, setUserName] = useState('');

  // UI state
  const [authLoading, setAuthLoading] = useState(false);
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);

  // Waitlist state
  const [waitlistPosition, setWaitlistPosition] = useState<number | undefined>();
  const [waitlistMessage, setWaitlistMessage] = useState<string | undefined>();

  // Initialize auth service
  const authService = SupabaseAuthService.getInstance();

  // Check for existing auth session on mount
  useEffect(() => {
    const checkAuthSession = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        if (!user.name || user.name.trim() === '') {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('main');
        }
      }
    };

    checkAuthSession();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (!user) {
        setCurrentScreen('phone');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [authService]);

  const sendVerificationCode = useCallback(async () => {
    if (!email.trim()) {
      setCurrentError(ErrorHandler.phoneVerification.emptyPhone()); // Reusing error for now
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const result = await authService.sendVerificationCode(email);

      if (result.success) {
        console.log('✅ Code sent successfully:', result.message);
        setCurrentScreen('verify');
      } else {
        // Check if this is a waitlist response
        if (result.accessCheck && !result.accessCheck.allowed) {
          setWaitlistPosition(result.accessCheck.waitlist_position);
          setWaitlistMessage(result.accessCheck.message || 'You have been added to the waitlist');
          setCurrentScreen('waitlist');
        } else if (result.error) {
          setCurrentError(result.error);
        } else {
          setCurrentError(ErrorHandler.parseError(result.message || 'Unknown error', 'phoneVerification'));
        }
      }
    } catch (error) {
      console.error('Failed to send verification code:', error);
      setCurrentError(ErrorHandler.parseError(error, 'phoneVerification'));
    } finally {
      setAuthLoading(false);
    }
  }, [email, authService]);

  const verifyCode = useCallback(async () => {
    if (!verificationCode.trim()) {
      setCurrentError(ErrorHandler.codeVerification.emptyCode());
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const result = await authService.verifyCode(email, verificationCode);

      if (result.success && result.user) {
        console.log('✅ Phone verified successfully');
        setCurrentUser(result.user);
        // If user has no name, go to onboarding first
        if (!result.user.name || result.user.name.trim() === '') {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('bandAction');
        }
      } else {
        if (result.error) {
          setCurrentError(result.error);
        } else {
          setCurrentError(ErrorHandler.parseError(result.message || 'Unknown error', 'codeVerification'));
        }
      }
    } catch (error) {
      console.error('Failed to verify code:', error);
      setCurrentError(ErrorHandler.parseError(error, 'codeVerification'));
    } finally {
      setAuthLoading(false);
    }
  }, [email, verificationCode, authService]);

  const completeOnboarding = useCallback(async () => {
    if (!userName.trim()) {
      setCurrentError(ErrorHandler.onboarding.emptyName());
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const result = await authService.updateUserProfile(userName);

      if (result.success && result.user) {
        setCurrentUser(result.user);
        setCurrentScreen('bandAction');
        setCurrentError(null);
      } else {
        if (result.error) {
          setCurrentError(result.error);
        } else {
          setCurrentError(ErrorHandler.onboarding.saveFailed());
        }
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setCurrentError(ErrorHandler.onboarding.saveFailed());
    } finally {
      setAuthLoading(false);
    }
  }, [userName, authService]);

  const logout = useCallback(async () => {
    setAuthLoading(true);
    try {
      await authService.signOut();
      setCurrentUser(null);
      setCurrentScreen('phone');
      setEmail('');
      setVerificationCode('');
      setUserName('');
      setCurrentError(null);
      console.log('👋 User logged out');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setAuthLoading(false);
    }
  }, [authService]);

  const value: AuthContextType = {
    // User state
    currentUser,
    currentScreen,

    // Form state
    email,
    verificationCode,
    userName,

    // UI state
    authLoading,
    currentError,

    // Waitlist state
    waitlistPosition,
    waitlistMessage,

    // Actions
    setEmail,
    setVerificationCode,
    setUserName,
    setCurrentScreen,
    setCurrentError,

    // Auth operations
    sendVerificationCode,
    verifyCode,
    completeOnboarding,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}