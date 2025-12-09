import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../../lib/supabase';
import { useBand } from './BandContext';

interface SetList {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  is_public: boolean;
  share_code: string;
  created_at: string;
  updated_at: string;
}

interface SetListContextType {
  setLists: SetList[];
  createdSetLists: SetList[];
  followedSetLists: SetList[];
  currentSetList: SetList | null;
  isLoading: boolean;
  error: string | null;
  createSetList: (title: string, description?: string, bandId?: string) => Promise<void>;
  setCurrentSetList: (setList: SetList | null) => void;
  refreshSetLists: () => Promise<void>;
  deleteSetList: (setListId: string) => Promise<void>;
  addTrackToSetList: (setListId: string, trackId: string) => Promise<void>;
}

const SetListContext = createContext<SetListContextType | undefined>(undefined);

export const SetListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [setLists, setSetLists] = useState<SetList[]>([]);
  const [createdSetLists, setCreatedSetLists] = useState<SetList[]>([]);
  const [followedSetLists, setFollowedSetLists] = useState<SetList[]>([]);
  const [currentSetList, setCurrentSetList] = useState<SetList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const { currentBand } = useBand();

  // Get current user from Supabase auth
  useEffect(() => {
    const getCurrentUser = async () => {
      const { user } = await auth.getCurrentUser();
      setSupabaseUserId(user?.id || null);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setSupabaseUserId(session?.user?.id || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user's playlists (both created and followed)
  const refreshSetLists = async () => {
    if (!supabaseUserId) {
      setSetLists([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch playlists created by user
      const { data: createdSetLists, error: createdError } = await db.setLists.getByUser(supabaseUserId);

      if (createdError) {
        console.error('Failed to fetch created setLists:', createdError);
        setError(createdError.message || 'Failed to fetch playlists');
        return;
      }

      // Fetch playlists followed by user
      const { data: followedData, error: followedError } = await db.setListFollowers.getFollowedSetLists(supabaseUserId);

      if (followedError) {
        console.error('Failed to fetch followed setLists:', followedError);
        // Don't fail completely, just use created playlists
      }

      // Extract set list objects from followed data
      const followedSetListsData = followedData?.map(item => item.set_lists).filter(Boolean) || [];

      // Fetch band playlists if user is in a band
      let bandSetListsData: any[] = [];
      if (currentBand) {
        const { data: bandSetLists, error: bandError } = await db.setLists.getByBand(currentBand.id);
        if (bandError) {
          console.error('Failed to fetch band setLists:', bandError);
        } else {
          bandSetListsData = bandSetLists || [];
        }
      }

      // Store created and followed separately
      setCreatedSetLists(createdSetLists || []);
      setFollowedSetLists(followedSetListsData);

      // Combine and deduplicate: created + followed + band playlists
      const allSetLists = [...(createdSetLists || [])];
      const seenIds = new Set(allSetLists.map(p => p.id));

      // Add followed playlists
      followedSetListsData.forEach(playlist => {
        if (!seenIds.has(playlist.id)) {
          allSetLists.push(playlist);
          seenIds.add(playlist.id);
        }
      });

      // Add band playlists (if not already included)
      bandSetListsData.forEach(playlist => {
        if (!seenIds.has(playlist.id)) {
          allSetLists.push(playlist);
          seenIds.add(playlist.id);
        }
      });

      setSetLists(allSetLists);
    } catch (err) {
      console.error('Error fetching setLists:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new playlist
  const createSetList = async (title: string, description?: string, bandId?: string) => {
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await db.setLists.create({
        title,
        description,
        created_by: supabaseUserId,
        is_public: true, // Always public for MVP
        band_id: bandId,
      });

      if (createError) {
        console.error('Failed to create playlist:', createError);
        throw new Error(createError.message || 'Failed to create playlist');
      }

      // Refresh playlists to include the new one
      await refreshSetLists();

      // Set as current playlist
      if (data) {
        setCurrentSetList(data as SetList);
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a playlist
  const deleteSetList = async (setListId: string) => {
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await db.setLists.delete(setListId);

      if (deleteError) {
        console.error('Failed to delete playlist:', deleteError);
        throw new Error(deleteError.message || 'Failed to delete playlist');
      }

      // Clear current playlist if it was deleted
      if (currentSetList?.id === setListId) {
        setCurrentSetList(null);
      }

      // Refresh playlists
      await refreshSetLists();
    } catch (err) {
      console.error('Error deleting playlist:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add track to playlist
  const addTrackToSetList = async (setListId: string, trackId: string) => {
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current playlist items to determine position
      const { data: items } = await db.setListEntries.getBySetList(setListId);
      const nextPosition = (items?.length || 0) + 1;

      const { error: addError } = await db.setListEntries.add({
        set_list_id: setListId,
        track_id: trackId,
        added_by: supabaseUserId,
        position: nextPosition,
      });

      if (addError) {
        console.error('Failed to add track to playlist:', addError);
        throw new Error(addError.message || 'Failed to add track to playlist');
      }

      // Refresh playlists if needed
      await refreshSetLists();
    } catch (err) {
      console.error('Error adding track to playlist:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch playlists when user changes
  useEffect(() => {
    if (supabaseUserId) {
      refreshSetLists();
    }
  }, [supabaseUserId]);

  // Refresh playlists when band changes
  useEffect(() => {
    if (supabaseUserId) {
      refreshSetLists();
    }
  }, [currentBand?.id, supabaseUserId]);

  const value: SetListContextType = {
    setLists,
    createdSetLists,
    followedSetLists,
    currentSetList,
    isLoading,
    error,
    createSetList,
    setCurrentSetList,
    refreshSetLists,
    deleteSetList,
    addTrackToSetList,
  };

  return <SetListContext.Provider value={value}>{children}</SetListContext.Provider>;
};

export const useSetList = () => {
  const context = useContext(SetListContext);
  if (!context) {
    throw new Error('useSetList must be used within a SetListProvider');
  }
  return context;
};
