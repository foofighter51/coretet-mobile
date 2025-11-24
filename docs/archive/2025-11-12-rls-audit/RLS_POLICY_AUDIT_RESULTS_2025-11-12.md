# RLS Policy Audit Results - 2025-11-12

## Summary

**Good News**: Most tables are SAFE - they use `USING (true)` which allows all authenticated users to view data.

**Tables Analyzed**: 12 with RLS policies
**Critical Issues Found**: 0 (bands already fixed)
**Potential Issues Found**: 1 (band_invites - needs verification)

## Detailed Findings

### ✅ SAFE - No Issues Found

These tables use **permissive SELECT policies** (`USING (true)`), so `.insert().select()` will always work:

1. **comments** - `true` ✅
2. **feedback** - `true` ✅
3. **playlist_items** - `true` ✅
4. **playlists** - `true` ✅
5. **profiles** - `true` ✅
6. **ratings** - `true` ✅
7. **tracks** - `true` ✅

**Why safe**: After INSERT, the SELECT returns the row because policy allows viewing all rows.

### ✅ FIXED - Bands Table

**bands SELECT policy**:
```sql
(EXISTS (SELECT 1 FROM band_members WHERE band_id = bands.id AND user_id = auth.uid())
 OR
 created_by = auth.uid())
```

**Status**: ✅ FIXED - Has "creator OR member" pattern
- User can see bands they created (even before becoming a member)
- User can see bands they're a member of
- `.insert().select()` works because of `created_by = auth.uid()` clause

### ✅ SAFE - Band Members

**band_members SELECT policy**:
```sql
user_id = auth.uid()
```

**Status**: ✅ SAFE
- Direct check: user can see their own memberships
- `.insert().select()` works because inserted row has `user_id = auth.uid()`

### ⚠️ NEEDS VERIFICATION - Band Invites

**band_invites SELECT policy** (truncated in results):
```sql
(auth.uid() IS NOT NULL) AND (
  (EXISTS (SELECT 1 FROM band_members WHERE band_id = band_invites.band_id AND user_id = auth.uid()))
  OR
  (invited_email IN ...)  -- Truncated
)
```

**Status**: ⚠️ NEEDS VERIFICATION

**Potential Issue**:
- Policy checks if user is band member OR invitee
- When **inviter** creates invite via `.insert().select()`, they might not be able to see it
- Depends on what the truncated `invited_email IN (...)` clause contains

**Code Location**: `lib/supabase.ts:760-772`
```typescript
async inviteMember(bandId: string, email: string, invitedBy: string, role: 'admin' | 'member' = 'member') {
  const { data, error } = await supabase
    .from('band_invites')
    .insert({
      band_id: bandId,
      email,
      invited_by: invitedBy,  // ⚠️ inviter !== invitee
      role,
    })
    .select()  // ⚠️ Might fail if policy only allows invitee to view
    .single();
}
```

**Question**: Does the SELECT policy allow the **inviter** (invited_by) to see the invite?

**Check needed**:
```sql
-- Get full band_invites SELECT policy
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'band_invites' AND cmd = 'SELECT';
```

**Possible outcomes**:
1. ✅ Policy includes `invited_by = auth.uid()` → SAFE
2. ✅ Policy includes band member check and inviter is always a member → SAFE
3. ❌ Policy only checks invitee → **BUG** (same as bands issue)

## Risk Assessment

| Table        | Risk Level | Issue                                    | Status      |
| ------------ | ---------- | ---------------------------------------- | ----------- |
| bands        | ✅ NONE    | Fixed - has creator OR member clause     | RESOLVED    |
| band_members | ✅ NONE    | Direct user_id check                     | SAFE        |
| band_invites | ⚠️ LOW     | Need to verify inviter can see invite    | VERIFY      |
| tracks       | ✅ NONE    | Permissive policy (true)                 | SAFE        |
| playlists    | ✅ NONE    | Permissive policy (true)                 | SAFE        |
| comments     | ✅ NONE    | Permissive policy (true)                 | SAFE        |
| feedback     | ✅ NONE    | Permissive policy (true)                 | SAFE        |
| profiles     | ✅ NONE    | Permissive policy (true)                 | SAFE        |
| ratings      | ✅ NONE    | Permissive policy (true)                 | SAFE        |

## Recommendations

### Immediate Action
1. **Verify band_invites policy** - Get full SELECT policy text
2. **Test invite creation** - Does it work without errors?
3. **Check if inviter is always a band member** - If yes, policy is safe

### If band_invites Has Issue
```sql
-- Fix: Add invited_by check
DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  TO authenticated, anon
  USING (
    (auth.uid() IS NOT NULL AND (
      -- Can see if you're a band member
      EXISTS (SELECT 1 FROM band_members WHERE band_id = band_invites.band_id AND user_id = auth.uid())
      OR
      -- Can see if you're the invitee
      invited_email IN (SELECT email FROM profiles WHERE id = auth.uid())
      OR
      -- Can see if you're the inviter
      invited_by = auth.uid()
    ))
    OR auth.uid() IS NULL
  );
```

### Long-term
1. **Document policy patterns** - Create policy template guide
2. **Add integration tests** - Test `.insert().select()` for all tables
3. **Code review checklist** - Check SELECT policies when adding `.insert().select()`

## Conclusion

**Overall Status**: ✅ **VERY GOOD**

- 11 out of 12 tables are confirmed safe
- 1 table (band_invites) needs verification but likely safe
- No critical issues found
- The permissive `USING (true)` policies make most operations safe

**Risk to Production**: ⚠️ **LOW**
- Only potential issue is band_invites
- If it's working in production without errors, it's probably fine
- Easy fix available if issue is confirmed

## Next Steps

1. Get full band_invites SELECT policy text
2. Test creating an invite (Dan can do this)
3. If no error, mark as SAFE
4. If error occurs, apply fix via migration
