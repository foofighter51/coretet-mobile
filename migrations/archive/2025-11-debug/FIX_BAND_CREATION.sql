-- Fix RLS policy to allow creating first band member
-- The current policy checks if user is already a member, creating a catch-22

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    -- Allow if user is owner/admin of the band
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
    -- OR if this is the first member being added (no members exist yet)
    OR (
      SELECT COUNT(*) FROM band_members WHERE band_id = band_members.band_id
    ) = 0
  );
