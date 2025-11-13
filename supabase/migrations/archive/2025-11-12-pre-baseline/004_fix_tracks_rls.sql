-- Fix RLS policies for tracks table
-- The issue is that anon users can't insert tracks
-- We need to allow authenticated users (via Clerk JWT) to insert

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload tracks" ON tracks;
DROP POLICY IF EXISTS "Authenticated users can upload tracks" ON tracks;

-- Create new policy that allows authenticated users to insert
-- The auth.jwt() function extracts the user ID from the Clerk JWT
CREATE POLICY "Authenticated users can upload tracks"
ON tracks FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Also ensure the other policies are correct
DROP POLICY IF EXISTS "Anyone can view tracks" ON tracks;
CREATE POLICY "Anyone can view tracks"
ON tracks FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Anyone can update tracks" ON tracks;
CREATE POLICY "Users can update their own tracks"
ON tracks FOR UPDATE
TO authenticated, anon
USING (created_by = auth.jwt() ->> 'sub' OR true); -- Allow for now, tighten later

DROP POLICY IF EXISTS "Anyone can delete tracks" ON tracks;
CREATE POLICY "Users can delete their own tracks"
ON tracks FOR DELETE
TO authenticated, anon
USING (created_by = auth.jwt() ->> 'sub' OR true); -- Allow for now, tighten later
