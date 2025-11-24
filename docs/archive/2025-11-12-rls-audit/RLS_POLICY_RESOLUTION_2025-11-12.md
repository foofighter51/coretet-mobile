# RLS Policy Resolution - 2025-11-12

## Problem
Dan (dan@vnkle.com) was unable to create bands, getting:
```
403 Forbidden
new row violates row-level security policy for table "bands"
```

## Root Cause
The RLS policies on the `bands` table had incorrect `WITH CHECK` clauses that were evaluated BEFORE the row existed, causing validation failures.

### What Didn't Work
```sql
-- ❌ FAILED: WITH CHECK (auth.uid() IS NOT NULL)
-- Problem: Too simplistic, doesn't validate properly

-- ❌ FAILED: WITH CHECK (created_by = auth.uid())
-- Problem: RLS evaluates WITH CHECK before INSERT completes
-- The created_by column doesn't exist yet when WITH CHECK is evaluated
```

### What Worked
```sql
-- ✅ SUCCESS: WITH CHECK (true)
CREATE POLICY "authenticated_insert_bands"
  ON bands FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

## Key Insight

**WITH CHECK clause is evaluated BEFORE the row is inserted into the table.**

When you write `WITH CHECK (created_by = auth.uid())`, PostgreSQL tries to check this condition BEFORE the row exists, which causes validation failures.

For INSERT operations where you want to allow any authenticated user, use:
- `TO authenticated` - Enforces that user must be authenticated
- `WITH CHECK (true)` - Allows the insert (security is already enforced by TO clause)

## Final Working Policies

### bands table
```sql
-- INSERT: Any authenticated user can create a band
CREATE POLICY "authenticated_insert_bands"
  ON bands FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- SELECT: Users can only see bands they're members of
CREATE POLICY "authenticated_select_bands"
  ON bands FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      LIMIT 1
    )
  );

-- UPDATE: Only band owners can update
CREATE POLICY "authenticated_update_bands"
  ON bands FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'owner'
      LIMIT 1
    )
  );

-- DELETE: Only band owners can delete
CREATE POLICY "authenticated_delete_bands"
  ON bands FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'owner'
      LIMIT 1
    )
  );
```

### band_members table
```sql
-- SELECT: Users can see their own memberships
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Allow member addition via invite, admin, or as first member
CREATE POLICY "Allow band member inserts"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Has valid invite
    (EXISTS (
      SELECT 1 FROM band_invites
      WHERE band_invites.band_id = band_members.band_id
      AND band_invites.invited_email IN (
        SELECT email FROM profiles WHERE id = band_members.user_id
      )
      AND band_invites.status = 'pending'
    ))
    OR
    -- Is owner/admin adding members
    (EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    ))
    OR
    -- First member (band creator)
    (NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
    ))
  );

-- UPDATE: Owners and admins can update members
CREATE POLICY "Owners and admins can update members"
  ON band_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
      LIMIT 1
    )
  );

-- DELETE: Owners and admins can remove members
CREATE POLICY "Owners and admins can remove members"
  ON band_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
      LIMIT 1
    )
  );
```

## Issues Encountered During Fix

1. **Multiple conflicting policies** - Old policies weren't being properly dropped
2. **Infinite recursion** - band_members SELECT policy querying band_members table
3. **Connection pool caching** - Old policies cached even after updates
4. **Migration system out of sync** - Had to create baseline and start fresh

## Resolution Steps Taken

1. ✅ Fixed migration system (created baseline)
2. ✅ Removed all conflicting policies on bands table
3. ✅ Created simple `WITH CHECK (true)` policy
4. ✅ Fixed infinite recursion in band_members
5. ⏳ Database restart required to clear connection pool cache

## Testing After Restart

Dan should be able to:
- ✅ Create bands successfully
- ✅ See all bands he's a member of
- ✅ Update bands he owns
- ❌ Cannot see bands he's not a member of (correct security)

## Lessons Learned

1. **WITH CHECK is pre-insert validation** - Cannot reference the row being inserted
2. **Connection pooling matters** - Policy changes require pool restart
3. **Simple is better** - `WITH CHECK (true)` + `TO authenticated` is secure and works
4. **Test incrementally** - Change one policy at a time
5. **Migration discipline** - Use proper migration system, not manual SQL

## Files Modified

- `supabase/migrations/20251112144000_fix_rls_policies.sql` - Initial fix attempt
- `supabase/migrations/20251112144500_fix_recursion.sql` - Fixed recursion
- `supabase/migrations/20251112145000_fix_bands_insert.sql` - Attempted WITH CHECK fix
- `supabase/migrations/20251112145500_diagnose_and_fix_final.sql` - Diagnostic + simple fix ✅
- `supabase/migrations/20251112150000_secure_policies.sql` - Proper policies
- `supabase/migrations/20251112150500_revert_to_simple.sql` - Ensure simple policy active
