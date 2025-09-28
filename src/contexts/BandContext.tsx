import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { db } from '../../lib/supabase';
import { ErrorHandler, ErrorInfo } from '../utils/errorMessages';
import { useAuth } from './AuthContext';

interface Band {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  authorized_phone_1?: string;
  authorized_phone_2?: string;
  authorized_phone_3?: string;
  authorized_phone_4?: string;
}

interface BandContextType {
  // State
  bands: Band[];
  currentBand: Band | null;
  loading: boolean;
  error: ErrorInfo | null;

  // Band creation
  createBand: (bandData: {
    name: string;
    description?: string;
    authorizedPhones: string[];
  }) => Promise<{ success: boolean; band?: Band; error?: ErrorInfo }>;

  // Band joining
  joinBand: (inviteCode: string) => Promise<{ success: boolean; band?: Band; error?: ErrorInfo }>;

  // Band management
  fetchUserBands: () => Promise<void>;
  setCurrentBand: (band: Band | null) => void;
  setError: (error: ErrorInfo | null) => void;
}

const BandContext = createContext<BandContextType | undefined>(undefined);

interface BandProviderProps {
  children: ReactNode;
}

export function BandProvider({ children }: BandProviderProps) {
  const { currentUser } = useAuth();

  // State
  const [bands, setBands] = useState<Band[]>([]);
  const [currentBand, setCurrentBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const createBand = useCallback(async (bandData: {
    name: string;
    description?: string;
    authorizedPhones: string[];
  }) => {
    if (!currentUser) {
      const error = ErrorHandler.onboarding.saveFailed();
      setError(error);
      return { success: false, error };
    }

    if (!bandData.name.trim()) {
      const error = ErrorHandler.bandCreation.emptyBandName();
      setError(error);
      return { success: false, error };
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare band data with normalized phone numbers
      const ensembleData: any = {
        name: bandData.name.trim(),
        description: bandData.description?.trim() || null,
      };

      // Add up to 4 authorized phone numbers
      bandData.authorizedPhones.forEach((phone, index) => {
        if (phone.trim() && index < 4) {
          ensembleData[`authorized_phone_${index + 1}`] = phone.trim();
        }
      });

      console.log('Creating band with data:', ensembleData);

      const { data, error: supabaseError } = await db.ensembles.create(ensembleData);

      if (supabaseError) {
        console.error('Band creation error:', supabaseError);

        // Check for specific error types
        if (supabaseError.message.includes('duplicate') || supabaseError.message.includes('unique')) {
          const error = ErrorHandler.bandCreation.duplicateBandName();
          setError(error);
          return { success: false, error };
        }

        const error = ErrorHandler.bandCreation.createFailed();
        setError(error);
        return { success: false, error };
      }

      if (data) {
        console.log('✅ Band created successfully:', data);

        // Add to local bands list
        setBands(prev => [...prev, data]);
        setCurrentBand(data);

        return { success: true, band: data };
      }

      const error = ErrorHandler.bandCreation.createFailed();
      setError(error);
      return { success: false, error };

    } catch (error) {
      console.error('Failed to create band:', error);
      const errorInfo = ErrorHandler.parseError(error, 'bandCreation');
      setError(errorInfo);
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const joinBand = useCallback(async (inviteCode: string) => {
    if (!currentUser) {
      const error = ErrorHandler.onboarding.saveFailed();
      setError(error);
      return { success: false, error };
    }

    if (!inviteCode.trim()) {
      const error = ErrorHandler.bandJoining.emptyInviteCode();
      setError(error);
      return { success: false, error };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Joining band with invite code:', inviteCode);

      const { data, error: supabaseError } = await db.ensembles.joinWithCode(
        inviteCode.trim().toUpperCase(),
        currentUser.phoneNumber
      );

      if (supabaseError) {
        console.error('Band joining error:', supabaseError);

        // Parse specific error messages
        const errorInfo = ErrorHandler.parseError(supabaseError.message, 'bandJoining');
        setError(errorInfo);
        return { success: false, error: errorInfo };
      }

      if (data) {
        console.log('✅ Successfully joined band');

        // Refresh user's bands list
        await fetchUserBands();

        return { success: true };
      }

      const error = ErrorHandler.bandJoining.joinFailed();
      setError(error);
      return { success: false, error };

    } catch (error) {
      console.error('Failed to join band:', error);
      const errorInfo = ErrorHandler.parseError(error, 'bandJoining');
      setError(errorInfo);
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUserBands = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching user bands...');

      const { data, error: supabaseError } = await db.ensembles.getByUser();

      if (supabaseError) {
        console.error('Failed to fetch bands:', supabaseError);

        // For test authentication, if not authenticated just set empty bands
        if (supabaseError.message?.includes('Not authenticated')) {
          console.log('📝 Test user - starting with empty bands list');
          setBands([]);
          setLoading(false);
          return;
        }

        const errorInfo = ErrorHandler.parseError(supabaseError, 'bandJoining');
        setError(errorInfo);
        return;
      }

      if (data) {
        // Extract ensembles from the nested structure
        const userBands = data
          .map(item => item.ensembles)
          .filter(Boolean) as Band[];

        console.log('✅ Fetched user bands:', userBands);
        setBands(userBands);

        // Set current band to first one if none selected
        if (userBands.length > 0 && !currentBand) {
          setCurrentBand(userBands[0]);
        }
      }

    } catch (error) {
      console.error('Failed to fetch user bands:', error);

      // For test authentication, if not authenticated just set empty bands
      if (error instanceof Error && error.message?.includes('Not authenticated')) {
        console.log('📝 Test user - starting with empty bands list');
        setBands([]);
        setLoading(false);
        return;
      }

      const errorInfo = ErrorHandler.parseError(error, 'bandJoining');
      setError(errorInfo);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentBand]);

  const value: BandContextType = {
    // State
    bands,
    currentBand,
    loading,
    error,

    // Actions
    createBand,
    joinBand,
    fetchUserBands,
    setCurrentBand,
    setError
  };

  return (
    <BandContext.Provider value={value}>
      {children}
    </BandContext.Provider>
  );
}

export function useBand() {
  const context = useContext(BandContext);
  if (context === undefined) {
    throw new Error('useBand must be used within a BandProvider');
  }
  return context;
}