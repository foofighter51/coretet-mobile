import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../../lib/supabase';

interface Playlist {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  is_public: boolean;
  share_code: string;
  created_at: string;
  updated_at: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  error: string | null;
  createPlaylist: (title: string, description?: string) => Promise<void>;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  refreshPlaylists: () => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

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
  const refreshPlaylists = async () => {
    if (!supabaseUserId) {
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch playlists created by user
      const { data: createdPlaylists, error: createdError } = await db.playlists.getByUser(supabaseUserId);

      if (createdError) {
        console.error('Failed to fetch created playlists:', createdError);
        setError(createdError.message || 'Failed to fetch playlists');
        return;
      }

      // Fetch playlists followed by user
      const { data: followedData, error: followedError } = await db.playlistFollowers.getFollowedPlaylists(supabaseUserId);

      if (followedError) {
        console.error('Failed to fetch followed playlists:', followedError);
        // Don't fail completely, just use created playlists
      }

      // Extract playlist objects from followed data and combine with created
      const followedPlaylists = followedData?.map(item => item.playlists).filter(Boolean) || [];

      // Combine and deduplicate (in case user follows their own playlist)
      const allPlaylists = [...(createdPlaylists || [])];
      const createdIds = new Set(allPlaylists.map(p => p.id));

      followedPlaylists.forEach(playlist => {
        if (!createdIds.has(playlist.id)) {
          allPlaylists.push(playlist);
        }
      });

      setPlaylists(allPlaylists);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new playlist
  const createPlaylist = async (title: string, description?: string) => {
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await db.playlists.create({
        title,
        description,
        created_by: supabaseUserId,
        is_public: true, // Always public for MVP
      });

      if (createError) {
        console.error('Failed to create playlist:', createError);
        throw new Error(createError.message || 'Failed to create playlist');
      }

      // Refresh playlists to include the new one
      await refreshPlaylists();

      // Set as current playlist
      if (data) {
        setCurrentPlaylist(data as Playlist);
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
  const deletePlaylist = async (playlistId: string) => {
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await db.playlists.delete(playlistId);

      if (deleteError) {
        console.error('Failed to delete playlist:', deleteError);
        throw new Error(deleteError.message || 'Failed to delete playlist');
      }

      // Clear current playlist if it was deleted
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
      }

      // Refresh playlists
      await refreshPlaylists();
    } catch (err) {
      console.error('Error deleting playlist:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add track to playlist
  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current playlist items to determine position
      const { data: items } = await db.playlistItems.getByPlaylist(playlistId);
      const nextPosition = (items?.length || 0) + 1;

      const { error: addError } = await db.playlistItems.add({
        playlist_id: playlistId,
        track_id: trackId,
        added_by: supabaseUserId,
        position: nextPosition,
      });

      if (addError) {
        console.error('Failed to add track to playlist:', addError);
        throw new Error(addError.message || 'Failed to add track to playlist');
      }

      // Refresh playlists if needed
      await refreshPlaylists();
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
      refreshPlaylists();
    }
  }, [supabaseUserId]);

  const value: PlaylistContextType = {
    playlists,
    currentPlaylist,
    isLoading,
    error,
    createPlaylist,
    setCurrentPlaylist,
    refreshPlaylists,
    deletePlaylist,
    addTrackToPlaylist,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};
