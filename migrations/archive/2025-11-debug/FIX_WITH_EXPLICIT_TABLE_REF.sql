-- ============================================================
-- FIX: Use explicit table.column references to avoid ambiguity
-- ============================================================
-- Problem: Unqualified column names are being interpreted wrong
-- Solution: Use explicit band_members.column references everywhere
-- ============================================================

DROP POLICY IF EXISTS "Allow band member inserts" ON band_members;

CREATE POLICY "Allow band member inserts"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: User being inserted has a valid pending invite
    EXISTS (
      SELECT 1
      FROM band_invites bi
      WHERE bi.band_id = band_members.band_id  -- Explicit reference to NEW row
      AND bi.invited_email = (
        SELECT email FROM profiles WHERE id = band_members.user_id  -- Explicit reference to NEW row
      )
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    )
    -- Case 2: Current authenticated user is admin/owner of the band
    OR band_members.band_id IN (  -- Explicit reference
      SELECT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 3: First member (band creation)
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm WHERE bm.band_id = band_members.band_id  -- Explicit both sides
    )
  );

-- Verify - check if it STILL has the bug
SELECT
  'Policy after explicit references' as check,
  policyname,
  CASE
    WHEN with_check LIKE '%bi.band_id = bi.band_id%' THEN '❌ STILL HAS BUG'
    WHEN with_check LIKE '%bm.band_id = bm.band_id%' THEN '❌ STILL HAS BUG (case 3)'
    WHEN with_check LIKE '%band_members.band_id%' THEN '✅ Uses explicit reference'
    ELSE '? Check manually'
  END as diagnosis,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';
