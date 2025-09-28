import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, Music, Users } from 'lucide-react';
import './styles.css';
import { designTokens } from './design/designTokens';
import { BandCard } from './components/molecules/BandCard';
import { TrackRow } from './components/molecules/TrackRow';
import { TrackRowWithPlayer } from './components/molecules/TrackRowWithPlayer';
import { TabBar } from './components/molecules/TabBar';
import { AudioUploader } from './components/molecules/AudioUploader';
import { Band, Track, TabId, ScreenId } from './types';
import TestAuthService, { TestUser } from './utils/testAuthService';
import { supabase, db } from '../lib/supabase';
import { ErrorHandler, ErrorInfo } from './utils/errorMessages';
import { ErrorDisplay } from './components/molecules/ErrorDisplay';

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

// Data will come from Supabase in production

const baseStyle = {
  fontFamily: designTokens.typography.fontFamily,
  width: '100%',
  maxWidth: '425px',
  minHeight: '100vh',
  margin: '0 auto',
  position: 'relative' as const
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('playlists');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedAction, setSelectedAction] = useState<'join' | 'form' | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [testCode, setTestCode] = useState<string>(''); // For displaying test code in dev
  const [currentUser, setCurrentUser] = useState<TestUser | null>(null); // Current authenticated user

  // Band creation/joining state
  const [bandName, setBandName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [authorizedPhone1, setAuthorizedPhone1] = useState('');
  const [authorizedPhone2, setAuthorizedPhone2] = useState('');
  const [authorizedPhone3, setAuthorizedPhone3] = useState('');
  const [authorizedPhone4, setAuthorizedPhone4] = useState('');
  const [bandActionScreen, setBandActionScreen] = useState<'main' | 'create' | 'join'>('main');
  const [tracks, setTracks] = useState<Track[]>(() => {
    console.log('🎸 Initializing tracks state with empty array');
    return [];
  });

  const handlePlay = useCallback((track: Track) => {
    setPlayingTrack(playingTrack === track.id ? null : track.id);
  }, [playingTrack]);

  const handleRatingChange = useCallback((track: Track, rating: 'like' | 'love' | 'none') => {
    setTracks(prev => prev.map(t =>
      t.id === track.id ? { ...t, rating } : t
    ));
  }, []);

  const handleBandClick = useCallback((band: Band) => {
    console.log('Band clicked:', band);
    // Navigate to band details or open band tracks
  }, []);

  // Authentication handlers
  const handleSendCode = useCallback(async () => {
    if (!phoneNumber.trim()) {
      setCurrentError(ErrorHandler.phoneVerification.emptyPhone());
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const authService = TestAuthService.getInstance();
      const result = await authService.sendVerificationCode(phoneNumber);

      if (result.success) {
        console.log('✅ Code sent successfully:', result.message);
        if (result.testCode) {
          setTestCode(result.testCode);
          console.log('🧪 Test code for development:', result.testCode);
        }
        setCurrentScreen('verify');
      } else {
        // Use the structured error from TestAuthService
        if (result.error) {
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
  }, [phoneNumber]);

  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode.trim()) {
      setCurrentError(ErrorHandler.codeVerification.emptyCode());
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const authService = TestAuthService.getInstance();
      const result = await authService.verifyCode(phoneNumber, verificationCode);

      if (result.success && result.user) {
        console.log('✅ Phone verified successfully');
        setCurrentUser(result.user);
        // If user has no name, go to onboarding first
        if (!result.user.name || result.user.name.trim() === '') {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('main');
        }
      } else {
        // Use the structured error from TestAuthService
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
  }, [phoneNumber, verificationCode]);

  // Handle onboarding completion
  const handleCompleteOnboarding = useCallback(() => {
    setCurrentError(null); // Clear any previous errors

    if (!userName.trim()) {
      setCurrentError(ErrorHandler.onboarding.emptyName());
      return;
    }

    if (!selectedAction) {
      setCurrentError(ErrorHandler.onboarding.noActionSelected());
      return;
    }

    const authService = TestAuthService.getInstance();
    const updatedUser = authService.updateUserName(userName);

    if (updatedUser) {
      setCurrentUser(updatedUser);
      console.log(`👤 User ${userName} chose to: ${selectedAction === 'join' ? 'join a band' : 'start a new band'}`);

      // Navigate to appropriate band action screen
      if (selectedAction === 'join') {
        setBandActionScreen('join');
      } else {
        setBandActionScreen('create');
      }
      setCurrentScreen('bandAction');
    } else {
      setCurrentError(ErrorHandler.onboarding.saveFailed());
    }
  }, [userName, selectedAction]);

  // Handle band creation
  const handleCreateBand = useCallback(async () => {
    if (!bandName.trim()) {
      setCurrentError(ErrorHandler.bandCreation.emptyBandName());
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const { data, error } = await db.ensembles.create({
        name: bandName.trim(),
        authorized_phone_1: authorizedPhone1.trim() || null,
        authorized_phone_2: authorizedPhone2.trim() || null,
        authorized_phone_3: authorizedPhone3.trim() || null,
        authorized_phone_4: authorizedPhone4.trim() || null,
      });

      if (error) {
        setCurrentError(ErrorHandler.parseError(error, 'bandCreation'));
      } else {
        console.log('✅ Band created successfully:', data);
        alert(`Band "${bandName}" created! Invite code: ${data.invite_code}`);
        setCurrentScreen('main');
      }
    } catch (error) {
      console.error('Failed to create band:', error);
      setCurrentError(ErrorHandler.parseError(error, 'bandCreation'));
    } finally {
      setAuthLoading(false);
    }
  }, [bandName, authorizedPhone1, authorizedPhone2, authorizedPhone3, authorizedPhone4]);

  // Handle band joining
  const handleJoinBand = useCallback(async () => {
    if (!inviteCode.trim()) {
      setCurrentError(ErrorHandler.bandJoining.emptyInviteCode());
      return;
    }

    if (!currentUser?.phoneNumber) {
      setCurrentError({
        title: 'User Error',
        message: 'User phone number not found',
        action: 'Please restart the authentication process',
        type: 'error'
      });
      return;
    }

    setAuthLoading(true);
    setCurrentError(null);

    try {
      const { data, error } = await db.ensembles.joinWithCode(
        inviteCode.trim().toUpperCase(),
        currentUser.phoneNumber
      );

      if (error) {
        setCurrentError(ErrorHandler.parseError(error, 'bandJoining'));
      } else {
        console.log('✅ Joined band successfully:', data);
        alert('Successfully joined the band!');
        setCurrentScreen('main');
      }
    } catch (error) {
      console.error('Failed to join band:', error);
      setCurrentError(ErrorHandler.parseError(error, 'bandJoining'));
    } finally {
      setAuthLoading(false);
    }
  }, [inviteCode, currentUser?.phoneNumber]);

  // Test Supabase connection on mount (disabled for test auth)
  useEffect(() => {
    // testConnection(); // Disabled while using placeholder Supabase URLs
    console.log('🧪 Test authentication mode - Supabase test disabled');
  }, []);

  // Memoize expensive computations
  const filteredTracks = useMemo(() => {
    console.log('🎵 filteredTracks recalculating:', {
      tracksLength: tracks.length,
      tracks: tracks.map(t => ({ id: t.id, title: t.title })),
      playingTrack
    });
    return tracks.map(track => ({
      ...track,
      isPlaying: playingTrack === track.id
    }));
  }, [tracks, playingTrack]);

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: designTokens.colors.neutral.white,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        padding: designTokens.spacing.xxxl,
        boxSizing: 'border-box'
      }}>
        {/* Top spacing */}
        <div style={{ flex: '1' }} />

        {/* Logo */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '60px',
          backgroundColor: designTokens.colors.primary.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          flexShrink: 0
        }}>
          <span style={{
            fontSize: designTokens.typography.fontSizes.giant,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.neutral.white
          }}>
            CT
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: designTokens.typography.fontWeights.light,
          textAlign: 'center',
          margin: `${designTokens.spacing.xxxl} 0 0 0`,
          color: designTokens.colors.neutral.charcoal,
          lineHeight: '1.2'
        }}>
          Welcome to CoreTet
        </h1>

        {/* Bottom spacing */}
        <div style={{ flex: '2' }} />

        {/* Button positioned at bottom */}
        <button
          onClick={() => setCurrentScreen('phone')}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: designTokens.colors.primary.blue,
            color: designTokens.colors.neutral.white,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'background-color 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
          }}
        >
          GET STARTED
        </button>
      </div>
    );
  }

  // Phone Number Screen
  if (currentScreen === 'phone') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: designTokens.colors.neutral.white,
        padding: designTokens.spacing.xxxl,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Top spacing */}
        <div style={{ flex: '1' }} />

        {/* Content */}
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: designTokens.typography.fontWeights.normal,
            textAlign: 'center',
            margin: `0 0 ${designTokens.spacing.xxxl} 0`,
            color: designTokens.colors.neutral.charcoal,
            lineHeight: '1.3'
          }}>
            Enter your phone number
          </h1>

          <div style={{ marginBottom: designTokens.spacing.lg }}>
            <input
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                border: phoneNumber
                  ? `2px solid ${designTokens.colors.primary.blue}`
                  : `2px solid ${designTokens.colors.neutral.lightGray}`,
                borderRadius: '12px',
                fontSize: designTokens.typography.fontSizes.body,
                outline: 'none',
                backgroundColor: designTokens.colors.neutral.white,
                fontFamily: designTokens.typography.fontFamily,
                boxSizing: 'border-box'
              }}
              aria-label="Phone number input"
            />
          </div>

          <p style={{
            fontSize: designTokens.typography.fontSizes.body,
            color: designTokens.colors.neutral.darkGray,
            textAlign: 'center',
            margin: '0'
          }}>
            We'll text you a verification code
          </p>
        </div>

        <ErrorDisplay
          error={currentError}
          onDismiss={() => setCurrentError(null)}
        />

        {/* Test Code Display (Development Only) */}
        {testCode && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            padding: designTokens.spacing.md,
            margin: `${designTokens.spacing.lg} 0`,
            color: '#1976d2',
            fontSize: designTokens.typography.fontSizes.bodySmall,
            textAlign: 'center'
          }}>
            🧪 Test Code: <strong>{testCode}</strong>
          </div>
        )}

        {/* Bottom spacing */}
        <div style={{ flex: '1' }} />

        {/* Button */}
        <button
          onClick={handleSendCode}
          disabled={!phoneNumber || authLoading}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: phoneNumber
              ? designTokens.colors.primary.blue
              : designTokens.colors.neutral.gray,
            color: designTokens.colors.neutral.white,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: phoneNumber ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'background-color 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (phoneNumber) {
              e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
            }
          }}
          onMouseLeave={(e) => {
            if (phoneNumber) {
              e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
            }
          }}
        >
          {authLoading ? 'SENDING...' : 'CONTINUE'}
        </button>
      </div>
    );
  }

  // Verification Code Screen
  if (currentScreen === 'verify') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: designTokens.colors.neutral.white,
        padding: designTokens.spacing.xxxl,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Top spacing */}
        <div style={{ flex: '1' }} />

        {/* Content */}
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: designTokens.typography.fontWeights.normal,
            textAlign: 'center',
            margin: `0 0 ${designTokens.spacing.lg} 0`,
            color: designTokens.colors.neutral.charcoal,
            lineHeight: '1.3'
          }}>
            Enter verification code
          </h1>

          <p style={{
            fontSize: designTokens.typography.fontSizes.body,
            color: designTokens.colors.neutral.darkGray,
            textAlign: 'center',
            margin: `0 0 ${designTokens.spacing.xxxl} 0`
          }}>
            We sent a 6-digit code to {phoneNumber}
          </p>

          <div style={{
            display: 'flex',
            gap: designTokens.spacing.xs,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: designTokens.spacing.xxxl,
            width: '100%',
            padding: `0 ${designTokens.spacing.sm}`
          }}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={verificationCode[index] || ''}
                onChange={(e) => {
                  const newCode = verificationCode.split('');
                  newCode[index] = e.target.value;
                  setVerificationCode(newCode.join(''));

                  // Auto-focus next input
                  if (e.target.value && index < 5) {
                    const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  // Handle backspace to move to previous input
                  if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                    const prevInput = e.target.parentElement?.children[index - 1] as HTMLInputElement;
                    prevInput?.focus();
                  }
                }}
                style={{
                  width: '40px',
                  height: '48px',
                  border: verificationCode[index]
                    ? `2px solid ${designTokens.colors.primary.blue}`
                    : `2px solid ${designTokens.colors.neutral.lightGray}`,
                  borderRadius: '8px',
                  fontSize: '20px',
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: designTokens.colors.neutral.white,
                  fontFamily: designTokens.typography.fontFamily,
                  boxSizing: 'border-box',
                  flex: '0 0 auto'
                }}
                aria-label={`Verification code digit ${index + 1}`}
              />
            ))}
          </div>

          <p style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.gray,
            textAlign: 'center',
            margin: '0'
          }}>
            Didn't receive a code?{' '}
            <button
              onClick={handleSendCode}
              style={{
                background: 'none',
                border: 'none',
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
              Resend
            </button>
          </p>
        </div>

        <ErrorDisplay
          error={currentError}
          onDismiss={() => setCurrentError(null)}
        />

        {/* Bottom spacing */}
        <div style={{ flex: '1' }} />

        {/* Button */}
        <button
          onClick={handleVerifyCode}
          disabled={verificationCode.length !== 6 || authLoading}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: verificationCode.length === 6
              ? designTokens.colors.primary.blue
              : designTokens.colors.neutral.lightGray,
            color: designTokens.colors.neutral.white,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: verificationCode.length === 6 ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'background-color 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (verificationCode.length === 6) {
              e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
            }
          }}
          onMouseLeave={(e) => {
            if (verificationCode.length === 6) {
              e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
            }
          }}
        >
          {authLoading ? 'VERIFYING...' : 'VERIFY'}
        </button>
      </div>
    );
  }

  // Onboarding Screen
  if (currentScreen === 'onboarding') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: designTokens.colors.neutral.white,
        padding: designTokens.spacing.xxxl,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Content */}
        <div>
          <h1 style={{
            fontSize: '40px',
            fontWeight: designTokens.typography.fontWeights.light,
            textAlign: 'left',
            margin: `0 0 ${designTokens.spacing.xxxl} 0`,
            color: designTokens.colors.neutral.charcoal,
            lineHeight: designTokens.typography.lineHeights.h1
          }}>
            Almost done!
          </h1>

        {/* Upload Photo */}
        <div style={{
          marginBottom: designTokens.spacing.lg,
          border: `2px solid ${designTokens.colors.neutral.lightGray}`,
          borderRadius: '12px',
          padding: designTokens.spacing.lg
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: designTokens.colors.neutral.lightGray,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: designTokens.spacing.sm
          }}>
            <span style={{ fontSize: '24px' }}>👤</span>
          </div>
          <p style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.gray,
            margin: `0 0 ${designTokens.spacing.sm} 0`
          }}>
            Optional photo
          </p>
          <input
            type="file"
            accept="image/*"
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              marginBottom: designTokens.spacing.sm
            }}
          />
        </div>

        {/* Name Input */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <label style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.charcoal,
            marginBottom: designTokens.spacing.sm,
            display: 'block',
            fontWeight: designTokens.typography.fontWeights.medium
          }}>
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing.md,
              border: userName
                ? `2px solid ${designTokens.colors.primary.blue}`
                : `2px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '12px',
              fontSize: designTokens.typography.fontSizes.body,
              outline: 'none',
              backgroundColor: designTokens.colors.neutral.white,
              fontFamily: designTokens.typography.fontFamily,
              boxSizing: 'border-box'
            }}
            aria-label="Your name"
          />
        </div>

        <h2 style={{
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.medium,
          margin: `0 0 ${designTokens.spacing.sm} 0`,
          color: designTokens.colors.neutral.charcoal
        }}>
          What would you like to do?
        </h2>

        <p style={{
          fontSize: designTokens.typography.fontSizes.bodySmall,
          color: designTokens.colors.neutral.gray,
          margin: `0 0 ${designTokens.spacing.lg} 0`,
          textAlign: 'center'
        }}>
          Most people start by joining an existing band
        </p>

        {/* Join Band Option - Primary */}
        <button
          onClick={() => setSelectedAction('join')}
          style={{
            width: '100%',
            padding: designTokens.spacing.lg,
            border: `2px solid ${selectedAction === 'join' ? designTokens.colors.primary.blue : designTokens.colors.primary.blue}`,
            borderRadius: '12px',
            backgroundColor: selectedAction === 'join'
              ? designTokens.colors.primary.blueUltraLight
              : designTokens.colors.primary.blueUltraLight,
            textAlign: 'left',
            cursor: 'pointer',
            marginBottom: designTokens.spacing.md
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.sm,
            marginBottom: designTokens.spacing.xs
          }}>
            <div style={{
              backgroundColor: designTokens.colors.primary.blue,
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={16} color={designTokens.colors.neutral.white} />
            </div>
            <h3 style={{
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.semibold,
              margin: '0',
              color: designTokens.colors.neutral.charcoal
            }}>
              Join a Band
            </h3>
          </div>
          <p style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.neutral.darkGray,
            margin: '0'
          }}>
            Connect with existing bands and collaborators
          </p>
        </button>

        {/* Form Band Option - Secondary */}
        <button
          onClick={() => setSelectedAction('form')}
          style={{
            width: '100%',
            padding: designTokens.spacing.md,
            border: `2px solid ${selectedAction === 'form' ? designTokens.colors.primary.blue : designTokens.colors.neutral.lightGray}`,
            borderRadius: '8px',
            backgroundColor: selectedAction === 'form'
              ? designTokens.colors.primary.blueUltraLight
              : designTokens.colors.neutral.white,
            textAlign: 'left',
            cursor: 'pointer',
            marginBottom: designTokens.spacing.xxxl
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.sm,
            marginBottom: designTokens.spacing.xs
          }}>
            <div style={{
              backgroundColor: designTokens.colors.accent.teal,
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={16} color={designTokens.colors.neutral.white} />
            </div>
            <h3 style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              fontWeight: designTokens.typography.fontWeights.medium,
              margin: '0',
              color: designTokens.colors.neutral.charcoal
            }}>
              Start a New Band
            </h3>
          </div>
          <p style={{
            fontSize: designTokens.typography.fontSizes.caption,
            color: designTokens.colors.neutral.gray,
            margin: '0'
          }}>
            Have a musical idea? Create your own collaborative project
          </p>
        </button>
        </div>

        <ErrorDisplay
          error={currentError}
          onDismiss={() => setCurrentError(null)}
        />

        {/* Complete Setup Button */}
        <button
          onClick={handleCompleteOnboarding}
          disabled={!userName.trim() || !selectedAction}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: (userName.trim() && selectedAction)
              ? designTokens.colors.primary.blue
              : designTokens.colors.neutral.lightGray,
            color: designTokens.colors.neutral.white,
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: (userName.trim() && selectedAction) ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'background-color 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (userName && selectedAction) {
              e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
            }
          }}
          onMouseLeave={(e) => {
            if (userName && selectedAction) {
              e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
            }
          }}
        >
          COMPLETE SETUP
        </button>
      </div>
    );
  }

  // Band Action Screen (Create or Join)
  if (currentScreen === 'bandAction') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: designTokens.colors.neutral.white,
        padding: designTokens.spacing.xxxl,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Content */}
        <div>
          <h1 style={{
            fontSize: '40px',
            fontWeight: designTokens.typography.fontWeights.light,
            textAlign: 'left',
            margin: `0 0 ${designTokens.spacing.xxxl} 0`,
            color: designTokens.colors.neutral.charcoal,
            lineHeight: designTokens.typography.lineHeights.h1
          }}>
            {bandActionScreen === 'create' ? 'Create Your Band' : 'Join a Band'}
          </h1>

          {bandActionScreen === 'create' ? (
            /* Band Creation Form */
            <>
              {/* Band Name */}
              <div style={{ marginBottom: designTokens.spacing.lg }}>
                <label style={{
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.neutral.charcoal,
                  marginBottom: designTokens.spacing.sm,
                  display: 'block',
                  fontWeight: designTokens.typography.fontWeights.medium
                }}>
                  Band Name
                </label>
                <input
                  type="text"
                  placeholder="Enter band name"
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: designTokens.spacing.md,
                    border: bandName
                      ? `2px solid ${designTokens.colors.primary.blue}`
                      : `2px solid ${designTokens.colors.neutral.lightGray}`,
                    borderRadius: '12px',
                    fontSize: designTokens.typography.fontSizes.body,
                    outline: 'none',
                    backgroundColor: designTokens.colors.neutral.white,
                    fontFamily: designTokens.typography.fontFamily,
                    boxSizing: 'border-box'
                  }}
                  aria-label="Band name"
                />
              </div>

              {/* Invite Members Section */}
              <div style={{ marginBottom: designTokens.spacing.lg }}>
                <h3 style={{
                  fontSize: designTokens.typography.fontSizes.body,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  margin: `0 0 ${designTokens.spacing.sm} 0`,
                  color: designTokens.colors.neutral.charcoal
                }}>
                  Invite Members (Optional)
                </h3>
                <p style={{
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  color: designTokens.colors.neutral.gray,
                  margin: `0 0 ${designTokens.spacing.md} 0`
                }}>
                  Add phone numbers of up to 4 members who can join your band
                </p>

                {/* Phone Number Inputs */}
                {[
                  { value: authorizedPhone1, setter: setAuthorizedPhone1, placeholder: "Member 1 phone number" },
                  { value: authorizedPhone2, setter: setAuthorizedPhone2, placeholder: "Member 2 phone number" },
                  { value: authorizedPhone3, setter: setAuthorizedPhone3, placeholder: "Member 3 phone number" },
                  { value: authorizedPhone4, setter: setAuthorizedPhone4, placeholder: "Member 4 phone number" }
                ].map((field, index) => (
                  <input
                    key={index}
                    type="tel"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: designTokens.spacing.md,
                      border: `2px solid ${designTokens.colors.neutral.lightGray}`,
                      borderRadius: '12px',
                      fontSize: designTokens.typography.fontSizes.body,
                      outline: 'none',
                      backgroundColor: designTokens.colors.neutral.white,
                      fontFamily: designTokens.typography.fontFamily,
                      boxSizing: 'border-box',
                      marginBottom: designTokens.spacing.sm
                    }}
                    aria-label={field.placeholder}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Band Joining Form */
            <div style={{ marginBottom: designTokens.spacing.lg }}>
              <label style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.charcoal,
                marginBottom: designTokens.spacing.sm,
                display: 'block',
                fontWeight: designTokens.typography.fontWeights.medium
              }}>
                Invite Code
              </label>
              <input
                type="text"
                placeholder="Enter 8-character invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                style={{
                  width: '100%',
                  padding: designTokens.spacing.md,
                  border: inviteCode
                    ? `2px solid ${designTokens.colors.primary.blue}`
                    : `2px solid ${designTokens.colors.neutral.lightGray}`,
                  borderRadius: '12px',
                  fontSize: designTokens.typography.fontSizes.body,
                  outline: 'none',
                  backgroundColor: designTokens.colors.neutral.white,
                  fontFamily: designTokens.typography.fontFamily,
                  boxSizing: 'border-box',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}
                aria-label="Invite code"
              />
              <p style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.gray,
                margin: `${designTokens.spacing.sm} 0 0 0`
              }}>
                Ask your band leader for the invite code
              </p>
            </div>
          )}

          <ErrorDisplay
            error={currentError}
            onDismiss={() => setCurrentError(null)}
          />
        </div>

        {/* Bottom buttons */}
        <div>
          {/* Back button */}
          <button
            onClick={() => setCurrentScreen('onboarding')}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '28px',
              border: `2px solid ${designTokens.colors.neutral.lightGray}`,
              backgroundColor: designTokens.colors.neutral.white,
              color: designTokens.colors.neutral.charcoal,
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              cursor: 'pointer',
              marginBottom: designTokens.spacing.md,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            BACK
          </button>

          {/* Action button */}
          <button
            onClick={bandActionScreen === 'create' ? handleCreateBand : handleJoinBand}
            disabled={authLoading || (bandActionScreen === 'create' ? !bandName.trim() : !inviteCode.trim())}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '28px',
              border: 'none',
              backgroundColor: (authLoading || (bandActionScreen === 'create' ? !bandName.trim() : !inviteCode.trim()))
                ? designTokens.colors.neutral.lightGray
                : designTokens.colors.primary.blue,
              color: designTokens.colors.neutral.white,
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.semibold,
              cursor: (authLoading || (bandActionScreen === 'create' ? !bandName.trim() : !inviteCode.trim())) ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'background-color 0.2s ease'
            }}
          >
            {authLoading ? 'LOADING...' : (bandActionScreen === 'create' ? 'CREATE BAND' : 'JOIN BAND')}
          </button>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div style={{
      ...baseStyle,
      backgroundColor: designTokens.colors.neutral.offWhite,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: designTokens.colors.neutral.white,
        borderBottom: `1px solid ${designTokens.colors.neutral.lightGray}`,
        padding: designTokens.spacing.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Search and Filter - Persistent across all tabs */}
        <div style={{
          display: 'flex',
          gap: designTokens.spacing.sm,
          alignItems: 'stretch',
          width: '100%'
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search
              size={18}
              color={designTokens.colors.neutral.gray}
              style={{
                position: 'absolute',
                left: designTokens.spacing.sm,
                zIndex: 1,
                pointerEvents: 'none'
              }}
              aria-hidden="true"
            />
            <input
              placeholder="Search tracks, collaborators..."
              style={{
                flex: 1,
                height: '44px',
                padding: `0 ${designTokens.spacing.sm} 0 36px`,
                border: `2px solid ${designTokens.colors.neutral.lightGray}`,
                borderRadius: '12px',
                fontSize: designTokens.typography.fontSizes.body,
                outline: 'none',
                backgroundColor: designTokens.colors.neutral.white,
                fontFamily: designTokens.typography.fontFamily,
                boxSizing: 'border-box'
              }}
              aria-label="Search tracks and collaborators"
            />
          </div>
          <button style={{
            height: '44px',
            padding: `0 ${designTokens.spacing.lg}`,
            border: `2px solid ${designTokens.colors.primary.blue}`,
            borderRadius: '12px',
            backgroundColor: designTokens.colors.neutral.white,
            color: designTokens.colors.primary.blue,
            fontSize: designTokens.typography.fontSizes.bodySmall,
            fontWeight: designTokens.typography.fontWeights.semibold,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.xs,
            whiteSpace: 'nowrap'
          }}>
            <Filter size={16} />
            FILTER
          </button>
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          padding: designTokens.spacing.lg,
          height: 'calc(100vh - 120px)',
          overflow: 'auto',
          paddingBottom: '80px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        role="main"
        aria-live="polite"
      >


        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div role="tabpanel" id="playlists-panel" aria-labelledby="playlists-tab">

            {/* Show All Tracks Option */}
            <div style={{
              backgroundColor: designTokens.colors.primary.blueUltraLight,
              borderRadius: '12px',
              padding: designTokens.spacing.md,
              marginBottom: designTokens.spacing.lg,
              border: `2px solid ${designTokens.colors.primary.blue}`,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('tracks')}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.sm
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: designTokens.colors.primary.blue,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Music size={20} color={designTokens.colors.neutral.white} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: designTokens.typography.fontSizes.body,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    margin: '0',
                    color: designTokens.colors.neutral.charcoal
                  }}>
                    Show All Tracks
                  </h3>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.neutral.darkGray,
                    margin: '0'
                  }}>
                    {tracks.length} tracks shared with you
                  </p>
                </div>
              </div>
            </div>

            {/* Empty Playlists State */}
            <div style={{
              textAlign: 'center',
              padding: `40px ${designTokens.spacing.lg}`
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '30px',
                border: `2px solid ${designTokens.colors.neutral.lightGray}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `0 auto ${designTokens.spacing.md} auto`
              }}>
                <Music size={24} color={designTokens.colors.primary.blue} />
              </div>
              <h3 style={{
                fontSize: designTokens.typography.fontSizes.h3,
                fontWeight: designTokens.typography.fontWeights.semibold,
                margin: `0 0 ${designTokens.spacing.sm} 0`,
                color: designTokens.colors.neutral.charcoal
              }}>
                No playlists yet
              </h3>
              <p style={{
                fontSize: designTokens.typography.fontSizes.bodySmall,
                color: designTokens.colors.neutral.darkGray,
                margin: `0 0 ${designTokens.spacing.lg} 0`,
                lineHeight: designTokens.typography.lineHeights.body
              }}>
                Create playlists to organize tracks and share them with your bandmates.
              </p>
              <button style={{
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.xl}`,
                border: 'none',
                borderRadius: '20px',
                backgroundColor: designTokens.colors.primary.blue,
                color: designTokens.colors.neutral.white,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blueHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
              }}
              >
                CREATE PLAYLIST
              </button>
            </div>
          </div>
        )}

        {/* Tracks Tab - Still accessible but not in main nav */}
        {activeTab === 'tracks' && (
          <div role="tabpanel" id="tracks-panel" aria-labelledby="tracks-tab">

            <div
              style={{
                marginBottom: designTokens.spacing.md
              }}
              role="list"
              aria-label="Your tracks"
            >
              {filteredTracks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: `${designTokens.spacing.xxxl} ${designTokens.spacing.lg}`,
                  color: designTokens.colors.neutral.gray
                }}>
                  <Music size={48} style={{ marginBottom: designTokens.spacing.md, opacity: 0.5 }} />
                  <h3 style={{
                    fontSize: designTokens.typography.fontSizes.body,
                    fontWeight: designTokens.typography.fontWeights.medium,
                    margin: `0 0 ${designTokens.spacing.sm} 0`,
                    color: designTokens.colors.neutral.charcoal
                  }}>
                    No tracks yet
                  </h3>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.neutral.gray,
                    margin: '0'
                  }}>
                    Upload your first track to get started
                  </p>
                </div>
              ) : (
                filteredTracks.map((track) => (
                  <TrackRowWithPlayer
                    key={track.id}
                    track={track}
                    isPlaying={track.isPlaying}
                    onPlay={handlePlay}
                    onRatingChange={handleRatingChange}
                    audioUrl={track.audioUrl}
                    showExpandedPlayer={true}
                  />
                ))
              )}
            </div>

            {/* Track count moved to bottom */}
            <p style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.neutral.darkGray,
              textAlign: 'center',
              margin: '0'
            }}>
              {tracks.length} tracks
            </p>

            {/* Back to Playlists */}
            <button
              onClick={() => setActiveTab('playlists')}
              style={{
                width: '100%',
                padding: designTokens.spacing.sm,
                border: `1px solid ${designTokens.colors.neutral.lightGray}`,
                borderRadius: '8px',
                backgroundColor: designTokens.colors.neutral.white,
                color: designTokens.colors.neutral.charcoal,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.medium,
                cursor: 'pointer',
                marginTop: designTokens.spacing.lg
              }}
            >
              ← Back to Playlists
            </button>
          </div>
        )}

        {/* Add/Upload Tab */}
        {activeTab === 'add' && (
          <div role="tabpanel" id="add-panel" aria-labelledby="add-tab">
            <h2 style={{
              fontSize: designTokens.typography.fontSizes.h4,
              fontWeight: designTokens.typography.fontWeights.bold,
              color: designTokens.colors.neutral.black,
              margin: `0 0 ${designTokens.spacing.lg} 0`,
              textAlign: 'center'
            }}>
              Upload Audio
            </h2>

            <AudioUploader
              multiple={true}
              onUploadComplete={(results) => {
                console.log('✅ Upload complete:', results);
                // TODO: Refresh tracks list, show success message
                // For now, switch back to playlists tab to see uploaded tracks
                setTimeout(() => {
                  setActiveTab('playlists');
                }, 2000);
              }}
              onUploadError={(error) => {
                console.error('❌ Upload error:', error);
                // TODO: Show error toast/notification
              }}
              options={{
                versionType: 'rough_demo',
                targetVolume: 0.7, // Consistent 70% volume to prevent audio whiplash
                normalizeAudio: true
              }}
            />

            <div style={{
              marginTop: designTokens.spacing.xl,
              padding: designTokens.spacing.lg,
              backgroundColor: `${designTokens.colors.primary.blue}10`,
              borderRadius: designTokens.borderRadius.md,
              border: `1px solid ${designTokens.colors.primary.blue}20`
            }}>
              <h3 style={{
                fontSize: designTokens.typography.fontSizes.bodyLarge,
                fontWeight: designTokens.typography.fontWeights.semibold,
                color: designTokens.colors.neutral.black,
                margin: `0 0 ${designTokens.spacing.sm} 0`
              }}>
                ✨ Smart Audio Processing
              </h3>
              <ul style={{
                fontSize: designTokens.typography.fontSizes.body,
                color: designTokens.colors.neutral.darkGray,
                margin: 0,
                paddingLeft: designTokens.spacing.lg,
                lineHeight: '1.5'
              }}>
                <li>Automatic volume normalization to 70% (prevents audio whiplash)</li>
                <li>MP3 compression for faster uploads and streaming</li>
                <li>Quality preservation with 192kbps encoding</li>
                <li>Support for MP3, WAV, AAC, M4A, FLAC, and OGG formats</li>
                <li>Up to 100MB per file</li>
              </ul>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div role="tabpanel" id="profile-panel" aria-labelledby="profile-tab">

            {/* User Profile */}
            <div style={{
              backgroundColor: designTokens.colors.neutral.white,
              borderRadius: '12px',
              padding: designTokens.spacing.lg,
              marginBottom: designTokens.spacing.lg,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.md,
                marginBottom: designTokens.spacing.md
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: designTokens.colors.primary.blue,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: designTokens.typography.fontSizes.h2,
                  fontWeight: designTokens.typography.fontWeights.semibold,
                  color: designTokens.colors.neutral.white
                }}>
                  E
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: designTokens.typography.fontSizes.h3,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    margin: `0 0 4px 0`,
                    color: designTokens.colors.neutral.charcoal
                  }}>
                    Eric
                  </h3>
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    color: designTokens.colors.neutral.gray,
                    margin: '0'
                  }}>
                    +1 (312) 841-1256
                  </p>
                </div>
              </div>

              <div style={{
                padding: designTokens.spacing.sm,
                backgroundColor: designTokens.colors.neutral.offWhite,
                borderRadius: '8px',
                marginBottom: designTokens.spacing.md
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing.sm,
                  marginBottom: designTokens.spacing.xs
                }}>
                  <Users size={16} color={designTokens.colors.primary.blue} />
                  <span style={{
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    fontWeight: designTokens.typography.fontWeights.semibold,
                    color: designTokens.colors.neutral.charcoal
                  }}>
                    Current Band
                  </span>
                </div>
                <p style={{
                  fontSize: designTokens.typography.fontSizes.body,
                  color: designTokens.colors.neutral.darkGray,
                  margin: '0'
                }}>
                  Summer Indie Band
                </p>
              </div>

              <button style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                border: `2px solid ${designTokens.colors.primary.blue}`,
                borderRadius: '8px',
                backgroundColor: designTokens.colors.neutral.white,
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: designTokens.spacing.sm,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
                e.currentTarget.style.color = designTokens.colors.neutral.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
                e.currentTarget.style.color = designTokens.colors.primary.blue;
              }}
              >
                Edit Profile
              </button>
            </div>

            {/* Additional Profile Options */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.sm,
              marginTop: designTokens.spacing.lg
            }}>
              <button style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                border: `2px solid ${designTokens.colors.primary.blue}`,
                borderRadius: '8px',
                backgroundColor: designTokens.colors.neutral.white,
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
                e.currentTarget.style.color = designTokens.colors.neutral.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
                e.currentTarget.style.color = designTokens.colors.primary.blue;
              }}
              >
                Notifications
              </button>

              <button style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                border: `2px solid ${designTokens.colors.primary.blue}`,
                borderRadius: '8px',
                backgroundColor: designTokens.colors.neutral.white,
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
                e.currentTarget.style.color = designTokens.colors.neutral.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
                e.currentTarget.style.color = designTokens.colors.primary.blue;
              }}
              >
                Storage
              </button>

              <button style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                border: `2px solid ${designTokens.colors.primary.blue}`,
                borderRadius: '8px',
                backgroundColor: designTokens.colors.neutral.white,
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                fontWeight: designTokens.typography.fontWeights.semibold,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.primary.blue;
                e.currentTarget.style.color = designTokens.colors.neutral.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
                e.currentTarget.style.color = designTokens.colors.primary.blue;
              }}
              >
                Invite
              </button>
            </div>
          </div>
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}