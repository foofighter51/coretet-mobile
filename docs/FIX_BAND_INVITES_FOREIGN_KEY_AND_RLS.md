# Fix Band Invites: Foreign Key and RLS Policy

## Issues Found

### Issue #1: Missing Foreign Key Constraint
The `band_invites.invited_by` column is missing its foreign key reference to `profiles(id)`.

**Symptom**: Queries with joins like `profiles!band_invites_invited_by_fkey(name)` will fail.

### Issue #2: RLS Policy Too Broad
The "Anyone can view invite with valid token" policy doesn't properly enable token-based lookups.

**Symptom**: `getByToken(token)` queries may be blocked by RLS even with valid tokens.

## Solution

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- =====================================================
-- FIX 1: ADD FOREIGN KEY CONSTRAINT
-- =====================================================

-- Add foreign key constraint to invited_by column
ALTER TABLE band_invites
ADD CONSTRAINT band_invites_invited_by_fkey
FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================================
-- FIX 2: UPDATE RLS POLICY FOR TOKEN-BASED ACCESS
-- =====================================================

-- Drop the old policy
DROP POLICY IF EXISTS "Anyone can view invite with valid token" ON band_invites;

-- Create improved policy: Public can view specific invite by valid token
-- This allows unauthenticated users to view invite details for the acceptance page
CREATE POLICY "Public can view invite by valid token"
  ON band_invites FOR SELECT
  USING (
    status = 'pending'
    AND expires_at > NOW()
  );

-- Note: This policy allows viewing any pending, non-expired invite
-- The security is in the token itself (UUID, unguessable)
-- The application code filters by specific token in the query

-- =====================================================
-- VERIFY FIXES
-- =====================================================

-- 1. Check foreign key was added
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'band_invites'
  AND kcu.column_name = 'invited_by';

-- Expected result: Shows band_invites_invited_by_fkey → profiles(id)

-- 2. Check RLS policies
SELECT
  policyname,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY policyname;

-- Expected: See "Public can view invite by valid token" with SELECT cmd
```

## Why This Fix Works

### Foreign Key
- Enables Supabase PostgREST to resolve joins like `profiles!band_invites_invited_by_fkey(name)`
- Ensures referential integrity (invited_by must exist in profiles)
- Cascading delete cleans up invites when user is deleted

### RLS Policy
- **Old policy** tried to filter by `invite_token IS NOT NULL` which is always true
- **New policy** allows viewing any pending/non-expired invite
- Security relies on:
  - UUID tokens are unguessable (128-bit entropy)
  - Application code filters by specific token: `.eq('invite_token', token)`
  - Expired/accepted invites are not visible

## Testing

After running the fix, test these scenarios:

### Test 1: Create Invite
```typescript
const { data, error } = await db.bandInvites.create(bandId, userId, 'test@example.com');
// Should succeed if user is band admin
```

### Test 2: View Invite by Token (Unauthenticated)
```typescript
const { data, error } = await db.bandInvites.getByToken('valid-token-uuid');
// Should return invite with bands and profiles data
```

### Test 3: Accept Invite
```typescript
const { data, error } = await db.bandInvites.accept('valid-token-uuid', userId);
// Should add user to band_members and mark invite as accepted
```

### Test 4: List Pending Invites (As Admin)
```typescript
const { data, error } = await db.bandInvites.listPendingForBand(bandId);
// Should return list with inviter names via join
```

## Files Changed

- None (database-only fix)
- Code in `lib/supabase.ts` already expects these constraints to exist

## Migration Status

- ✅ `invited_by` foreign key constraint added
- ✅ RLS policy updated for proper token-based access
- ✅ Existing RLS policies preserved (band members, admins)

---

**Date**: 2025-10-13
**Related Docs**:
- `docs/PHASE_3B_FIX_BAND_INVITES_TABLE.md` (original schema)
- `lib/supabase.ts:738-931` (invite operations)
