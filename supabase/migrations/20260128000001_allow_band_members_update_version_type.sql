-- Migration: Allow band members to update version_type on tracks
-- Previously only track creators could update tracks, but band members need to set version types

-- Drop the restrictive update policy if it exists
DROP POLICY IF EXISTS "Track creators can update tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update their own tracks" ON tracks;
DROP POLICY IF EXISTS "tracks_update_own" ON tracks;

-- Create a more permissive update policy that allows:
-- 1. Track creators to update their own tracks (any field)
-- 2. Band members to update tracks in their band (for version_type and other metadata)
CREATE POLICY "Band members can update tracks in their band"
  ON tracks FOR UPDATE TO authenticated
  USING (
    -- User created the track
    created_by = auth.uid()
    OR
    -- User is a member of the band that owns this track
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = tracks.band_id
      AND bm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- User created the track
    created_by = auth.uid()
    OR
    -- User is a member of the band that owns this track
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = tracks.band_id
      AND bm.user_id = auth.uid()
    )
  );
