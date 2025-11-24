# Deep RLS Policy Analysis - Potential Issues
Date: 2025-11-12
Analyst: Claude Code

## Executive Summary

After fixing the **band creation 403 error** (caused by SELECT policy blocking `.insert().select()` returns), I've conducted a comprehensive analysis of the codebase for similar patterns.

**Tables Analyzed**: 17 tables with RLS policies
**INSERT operations found**: 17
**INSERT+SELECT patterns**: 13

## The Fixed Issue (Bands Table)

### Problem
```typescript
// Code pattern
.from('bands').insert({...}).select().single()

// SELECT policy blocked this because:
// - INSERT succeeds
// - SELECT tries to return the row
// - Policy requires band_member relationship
// - But band_member INSERT happens NEXT
// Result: 403 Forbidden
```

### Solution
```sql
-- Allow SELECT for creator OR member
CREATE POLICY "authenticated_select_bands"
  ON bands FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM band_members WHERE band_id = bands.id AND user_id = auth.uid())
    OR
    created_by = auth.uid()  -- Added this clause
  );
```

## Potential Similar Issues Found

### 1. ⚠️ **CRITICAL: tracks table**

**Location**: `lib/supabase.ts:214-229`

```typescript
async create(track: {
  title: string;
  file_url: string;
  created_by: string;
  band_id?: string;  // ⚠️ Can be part of a band
}) {
  const { data, error } = await supabase
    .from('tracks')
    .insert(track)
    .select()  // ⚠️ Might fail if SELECT policy requires band_member check
    .single();
}
```

**Risk**: If tracks SELECT policy checks band membership, this could fail.

**Check needed**:
- What is the current SELECT policy on tracks?
- Does it allow `created_by = auth.uid()` OR just band members?

**SQL to run**:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'tracks' AND cmd = 'SELECT';
```

---

### 2. ⚠️ **MEDIUM: playlists table**

**Location**: `lib/supabase.ts:274-290`

```typescript
async create(playlist: {
  title: string;
  created_by: string;
  band_id?: string;  // ⚠️ Can be band playlist
}) {
  const { data, error } = await supabase
    .from('playlists')
    .insert({...})
    .select()  // ⚠️ Might fail if band_id is set
    .single();
}
```

**Risk**: Similar to bands - if playlist belongs to a band, SELECT might require membership.

**Check needed**:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'playlists' AND cmd = 'SELECT';
```

---

### 3. ⚠️ **MEDIUM: playlist_tracks table**

**Location**: `lib/supabase.ts:422-434`

```typescript
async add(item: {
  playlist_id: string;
  track_id: string;
  added_by: string;
  position: number;
}) {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .insert(item)
    .select()  // ⚠️ Does policy allow seeing just-added track?
    .single();
}
```

**Risk**: SELECT policy might require playlist ownership check.

**Check needed**:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'playlist_tracks' AND cmd IN ('INSERT', 'SELECT');
```

---

### 4. ⚠️ **MEDIUM: band_invites table**

**Location**: `lib/supabase.ts:760-772`

```typescript
async inviteMember(bandId: string, email: string, invitedBy: string, role: 'admin' | 'member' = 'member') {
  const { data, error } = await supabase
    .from('band_invites')
    .insert({
      band_id: bandId,
      email,
      invited_by: invitedBy,
      role,
    })
    .select()  // ⚠️ Does policy allow inviter to see their invite?
    .single();
}
```

**Risk**: SELECT policy might only allow invitee to see invite, not inviter.

**Check needed**:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'band_invites' AND cmd = 'SELECT';
```

---

### 5. ✅ **LOW RISK: profiles table**

**Location**: `lib/supabase.ts:139-151`

```typescript
async create(profile: {
  id: string;
  phone_number: string;
  name: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
}
```

**Risk**: LOW - Profiles are typically viewable by owner (id = auth.uid())

**Likely safe** because SELECT would check `id = auth.uid()` which works.

---

### 6. ✅ **LOW RISK: comments table**

**Location**: `lib/supabase.ts:533-548`

```typescript
async create(comment: {
  track_id: string;
  user_id: string;
  content: string;
  timestamp_seconds?: number;
}) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .single();  // ✅ No .select() - safe
}
```

**Risk**: NONE - Not using `.select()` so no conflict possible.

---

### 7. ⚠️ **MEDIUM: feedback table**

**Location**: `lib/supabase.ts:1195-1208`

```typescript
.from('feedback')
.insert(feedback)
.single();  // ✅ No .select() BUT...
```

**Risk**: MEDIUM - No immediate issue, but if code is changed to add `.select()`, it could break.

---

## Pattern Analysis

### Safe Patterns ✅
1. **`.insert().single()`** - No SELECT, safe
2. **Personal data** - `created_by = auth.uid()` or `user_id = auth.uid()` policies
3. **No RLS** - Tables without RLS (none found in production)

### Risky Patterns ⚠️
1. **`.insert().select().single()` + band relationship** - Requires "creator OR member" clause
2. **`.insert().select().single()` + ownership chain** - Requires checking full chain
3. **WITH CHECK (created_by = auth.uid())** - Should be `WITH CHECK (true)` for INSERT

### Anti-Patterns ❌
1. **SELECT USING queries same table** - Causes recursion (already fixed in band_members)
2. **WITH CHECK references row being inserted** - Fails validation (already fixed in bands)

## Recommended Actions

### Immediate (Critical)
1. **Run ANALYZE_ALL_TABLE_POLICIES.sql** to get current policy state
2. **Check tracks SELECT policy** - Most likely to have same issue as bands
3. **Check playlists SELECT policy** - Second most likely issue

### Short-term (This Week)
4. **Review all policies** with `migrations/ANALYZE_ALL_TABLE_POLICIES.sql`
5. **Add "creator OR member" pattern** where needed
6. **Test each `.insert().select()` operation** in isolation

### Long-term (Future Proofing)
7. **Document policy patterns** in codebase
8. **Create policy templates** for common patterns
9. **Add integration tests** for INSERT+SELECT operations
10. **Consider helper functions** to encapsulate multi-step operations

## Testing Strategy

For each table with `.insert().select()`:

```sql
-- 1. Check policies
SELECT tablename, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'TABLE_NAME'
ORDER BY cmd;

-- 2. Test INSERT as authenticated user
-- (Use Dan's account: 929a7b64-b93e-430e-8a6f-7d0cc2c8d182)
BEGIN;
  INSERT INTO table_name (...) VALUES (...) RETURNING *;
ROLLBACK;

-- 3. If it works, policies are OK
-- If it fails, add "created_by = auth.uid()" clause to SELECT policy
```

## Files to Review

1. **All migrations** with SELECT policies
2. **lib/supabase.ts** - All functions using `.insert().select()`
3. **Current database policies** - Run diagnostic SQL

## SQL Diagnostic Script

Created: `/Users/exleymini/Apps/coretet-band/migrations/ANALYZE_ALL_TABLE_POLICIES.sql`

This will show:
- ✅ All tables with INSERT+SELECT
- ⚠️ Policies with potential issues
- 🔍 Recursion risks
- 📊 Current policy status

## Next Steps

**DO NOT MAKE CHANGES YET** - This is analysis only.

1. Run `ANALYZE_ALL_TABLE_POLICIES.sql` in Supabase SQL Editor
2. Review results
3. Test each identified risk in staging/dev
4. Create targeted fixes only for confirmed issues
5. Follow migration workflow (no manual SQL!)

## Conclusion

**High Confidence Issues**: 0 (bands was the only one, now fixed)
**Medium Confidence Issues**: 4 (tracks, playlists, playlist_tracks, band_invites)
**Requires Investigation**: 13 total INSERT operations

**Risk Level**: MEDIUM
- Production is stable after bands fix
- No user reports of other 403 errors
- Issues are latent (might trigger under specific conditions)

**Recommendation**:
1. Run diagnostics this week
2. Fix any confirmed issues in next Build (24)
3. Add integration tests
