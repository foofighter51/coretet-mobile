-- Fix RLS policy to allow creating first band member
-- The issue: self-referencing band_id in the subquery

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    -- Allow if user is owner/admin of the band
    band_id IN (
      SELECT bm.band_id FROM band_members bm
      WHERE bm.user_id = auth.uid()::TEXT
      AND bm.role IN ('owner', 'admin')
    )
    -- OR if this is the first member being added (using NEW.band_id)
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm2
      WHERE bm2.band_id = band_id
    )
  );
