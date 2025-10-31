import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import SupabaseAuthService, { AuthUser } from '../utils/supabaseAuthService';
import { ErrorHandler, ErrorInfo } from '../utils/errorMessages';

export type ScreenId = 'welcome' | 'phone' | 'verify' | 'onboarding' | 'bandAction' | 'bandCreation' | 'bandJoining' | 'waitlist' | 'main' | 'passwordReset' | 'forgotPassword' | 'devLogin';

interface AuthContextType {
  // User state
  currentUser: AuthUser | null;
  currentScreen: ScreenId;

  // Form state
  email: string; // Changed from phoneNumber for testing
  password: string;
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
  setPassword: (password: string) => void;
  setVerificationCode: (code: string) => void;
  setUserName: (name: string) => void;
  setCurrentScreen: (screen: ScreenId) => void;
  setCurrentError: (error: ErrorInfo | null) => void;

  // Auth operations
  signUp: () => Promise<void>;
  signIn: () => Promise<void>;
  sendVerificationCode: () => Promise<void>;
  verifyCode: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  devSignUp: () => Promise<void>;
  login: (user: AuthUser) => Promise<void>;
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
  const [password, setPassword] = useState('');
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

  const login = useCallback(async (user: AuthUser) => {
    try {
      setCurrentUser(user);
      // Navigate based on profile completeness
      if (!user.name || user.name.trim() === '') {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('main');
      }
      setCurrentError(null);
    } catch (error) {
      console.error('❌ Error during login:', error);
      setCurrentError(ErrorHandler.parseError(error, 'authentication'));
    }
  }, []);

  // Check for existing auth session on mount
  useEffect(() => {
    const checkAuthSession = async () => {
      // Check if this is a password reset flow
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        setCurrentScreen('passwordReset');
        return;
      }

      const user = await authService.getCurrentUser();
      if (user) {
        login(user);
      }
    };

    checkAuthSession();

    // Listen for auth state changes (simplified to avoid circular calls)
    const { data: { subscription } } = authService.onAuthStateChange((user) => {

      if (!user) {
        setCurrentUser(null);
        setCurrentScreen('phone');
        setCurrentError(null);
      } else {
        // Set user state directly without calling login() to avoid circular calls
        setCurrentUser(user);
        setCurrentError(null);

        // Navigate based on profile completeness
        if (!user.name || user.name.trim() === '') {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('main');
        }

      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [authService, login]);

  const signUp = useCallback(async () => {
    if (!email.trim()) {
      setCurrentError(ErrorHandler.phoneVerification.emptyPhone());
      return;
    }

    if (!password.trim()) {
      setCurrentError(ErrorHandler.parseError('Password is required', 'authentication'));
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const result = await authService.signUpWithPassword(email, password);

      if (result.success) {
        // For email/password, user needs to confirm email before signing in
        // Show verification screen with instructions
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
          setCurrentError(ErrorHandler.parseError(result.message || 'Unknown error', 'authentication'));
        }
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      setCurrentError(ErrorHandler.parseError(error, 'authentication'));
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, authService, login]);

  const signIn = useCallback(async () => {
    if (!email.trim()) {
      setCurrentError(ErrorHandler.phoneVerification.emptyPhone());
      return;
    }

    if (!password.trim()) {
      setCurrentError(ErrorHandler.parseError('Password is required', 'authentication'));
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const result = await authService.signInWithPassword(email, password);

      if (result.success && result.user) {
        await login(result.user);
      } else {
        if (result.error) {
          setCurrentError(result.error);
        } else {
          setCurrentError(ErrorHandler.parseError(result.message || 'Unknown error', 'authentication'));
        }
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
      setCurrentError(ErrorHandler.parseError(error, 'authentication'));
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, authService, login]);

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

  const sendPasswordReset = useCallback(async () => {
    if (!email.trim()) {
      setCurrentError(ErrorHandler.phoneVerification.emptyPhone());
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const result = await authService.sendPasswordResetEmail(email);

      if (result.success) {
        setCurrentScreen('verify');
      } else {
        if (result.error) {
          setCurrentError(result.error);
        } else {
          setCurrentError(ErrorHandler.parseError(result.message || 'Failed to send password reset email', 'authentication'));
        }
      }
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      setCurrentError(ErrorHandler.parseError(error, 'authentication'));
    } finally {
      setAuthLoading(false);
    }
  }, [email, authService]);

  const devSignUp = useCallback(async () => {
    if (!email.trim()) {
      setCurrentError(ErrorHandler.phoneVerification.emptyPhone());
      return;
    }

    if (!password.trim()) {
      setCurrentError(ErrorHandler.parseError('Password is required', 'authentication'));
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const result = await authService.signUpWithPassword(email, password, true); // Skip access check

      if (result.success) {
        if (result.user) {
          await login(result.user);
        } else {
          // Email confirmation required
          setCurrentScreen('verify');
        }
      } else {
        if (result.error) {
          setCurrentError(result.error);
        } else {
          setCurrentError(ErrorHandler.parseError(result.message || 'Unknown error', 'authentication'));
        }
      }
    } catch (error) {
      console.error('Failed to create dev account:', error);
      setCurrentError(ErrorHandler.parseError(error, 'authentication'));
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, authService, login]);

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
    password,
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
    setPassword,
    setVerificationCode,
    setUserName,
    setCurrentScreen,
    setCurrentError,

    // Auth operations
    signUp,
    signIn,
    sendVerificationCode,
    verifyCode,
    completeOnboarding,
    sendPasswordReset,
    devSignUp,
    login,
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