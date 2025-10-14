import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db } from '../../lib/supabase';

interface Band {
  id: string;
  name: string;
  created_by: string;
  is_personal: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface BandMember {
  id: string;
  band_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

interface BandContextType {
  currentBand: Band | null;
  userBands: Band[];
  userRole: 'owner' | 'admin' | 'member' | null;
  isLoading: boolean;
  switchBand: (bandId: string) => Promise<void>;
  refreshBands: () => Promise<void>;
}

const BandContext = createContext<BandContextType | undefined>(undefined);

export const useBand = () => {
  const context = useContext(BandContext);
  if (!context) {
    throw new Error('useBand must be used within a BandProvider');
  }
  return context;
};

interface BandProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const BandProvider: React.FC<BandProviderProps> = ({ children, userId }) => {
  const [currentBand, setCurrentBand] = useState<Band | null>(null);
  const [userBands, setUserBands] = useState<Band[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's bands
  const loadUserBands = async () => {
    if (!userId) {
      setUserBands([]);
      setCurrentBand(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎸 Loading bands for user:', userId);
      const bands = await db.bands.getUserBands(userId);
      console.log('🎸 Found', bands.length, 'bands:', bands.map(b => b.name));
      setUserBands(bands);

      // Load current band from localStorage or use first band
      const savedBandId = localStorage.getItem(`currentBand_${userId}`);
      let bandToSet = bands.find(b => b.id === savedBandId) || bands[0] || null;

      if (bandToSet) {
        console.log('🎸 Setting current band:', bandToSet.name, bandToSet.id);
        setCurrentBand(bandToSet);

        // Get user's role in this band
        const members = await db.bands.getBandMembers(bandToSet.id);
        const userMember = members.find(m => m.user_id === userId);
        console.log('🎸 User role in band:', userMember?.role);
        setUserRole(userMember?.role || null);
      } else {
        console.log('⚠️ No band to set for user');
      }
    } catch (error) {
      console.error('❌ Error loading bands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different band
  const switchBand = async (bandId: string) => {
    const band = userBands.find(b => b.id === bandId);
    if (!band || !userId) return;

    setCurrentBand(band);
    localStorage.setItem(`currentBand_${userId}`, bandId);

    // Update user role for new band
    const members = await db.bands.getBandMembers(bandId);
    const userMember = members.find(m => m.user_id === userId);
    setUserRole(userMember?.role || null);
  };

  // Refresh bands list
  const refreshBands = async () => {
    setIsLoading(true);
    await loadUserBands();
  };

  useEffect(() => {
    loadUserBands();
  }, [userId]);

  return (
    <BandContext.Provider
      value={{
        currentBand,
        userBands,
        userRole,
        isLoading,
        switchBand,
        refreshBands,
      }}
    >
      {children}
    </BandContext.Provider>
  );
};