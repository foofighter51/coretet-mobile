# Clerk Cleanup - 2025-10-21

## Summary
Removed misleading Clerk references from codebase. The app uses **Supabase native auth** (email/password), not Clerk.

## Changes Made

### ✅ Phase 1: Safe Cleanup (Completed)

#### 1. **Created Function Rename Migration**
- **File:** `supabase/migrations/20251021_rename_clerk_to_current_user.sql`
- **Action:** Created `current_user_id()` function
- **Safety:** Kept `clerk_user_id()` as alias for backwards compatibility
- **Impact:** Zero downtime, no breaking changes

#### 2. **Removed Unused Files**
- ✅ Deleted `src/lib/clerk.ts` (never imported)
- ✅ Deleted `src/utils/clerkSupabaseSync.ts` (never imported)
- **Verified:** Build still succeeds

#### 3. **Cleaned .env.local**
- ✅ Removed `GEMINI_API_KEY` (only used in dev scripts, not app)
- ✅ Removed `VITE_CLERK_PUBLISHABLE_KEY`
- ✅ Removed `CLERK_SECRET_KEY`
- **Verified:** File properly gitignored

#### 4. **Build Verification**
```bash
npm run build
✓ built in 1.67s
```
No errors ✅

---

## What Still Needs to Be Done

### ⏳ Phase 2: Update RLS Policies (Future)

**When:** After testing Phase 1 in development/production

**Migration files that reference `clerk_user_id()`:**
1. `supabase/migrations/001_clerk_rls_and_rename_to_bands.sql` (67 instances)
2. `supabase/migrations/20251017_enable_tracks_rls_phase1.sql` (13 instances)
3. `supabase/migrations/20251016_add_comment_views.sql` (5 instances)
4. `supabase/migrations/002_simplify_to_tracks.sql` (1 DROP statement)

**Strategy:** Create new migration that updates policies to use `current_user_id()`

**Example policy update:**
```sql
-- OLD
USING (created_by::text = public.clerk_user_id())

-- NEW
USING (created_by::text = public.current_user_id())
```

### 📝 Phase 3: Documentation Updates (Low Priority)

Update these docs to reflect Supabase auth (not critical):
- `docs/CLERK-SUPABASE-SETUP.md`
- `docs/MIGRATION_COMPLETE.md`
- `docs/security/2025-10-16-security-audit.md`
- `docs/security/security-implementation-roadmap.md`
- `docs/eod-status/2025-10-01-eod.md`

---

## Testing Checklist

### Before Applying Phase 1 Migration

- [ ] Backup production database
- [ ] Test in development first
- [ ] Verify both functions work:
  ```sql
  SELECT
    public.current_user_id() as new_function,
    public.clerk_user_id() as old_function,
    public.current_user_id() = public.clerk_user_id() as match;
  ```

### After Applying Phase 1 Migration

- [ ] Login/logout works
- [ ] Track upload works
- [ ] RLS policies still enforce correctly
- [ ] Band member access works
- [ ] Playlist following works

### Before Phase 2 (Policy Updates)

- [ ] Phase 1 has been stable for 7+ days
- [ ] No RLS-related bugs reported
- [ ] Create rollback migration
- [ ] Test policy changes in development

---

## Function Behavior

**Both functions extract user ID from JWT `sub` claim:**

```sql
-- New function (recommended)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Old function (deprecated, alias for backwards compatibility)
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT public.current_user_id();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**Compatible with:**
- ✅ Supabase Auth (current setup)
- ✅ Clerk JWT (if switching in future)
- ✅ Any auth provider using standard JWT with `sub` claim

---

## Why This Approach?

### Two-Phase Strategy Rationale

**Phase 1 (Alias approach):**
- ✅ Zero downtime
- ✅ No immediate policy changes needed
- ✅ Can roll back easily
- ✅ Test in production safely

**Phase 2 (Policy updates):**
- Only after Phase 1 is proven stable
- Can be done gradually, table by table
- Clear rollback path
- No rush - both functions work identically

### Alternative Approaches (Not Chosen)

❌ **Direct rename in old migrations:**
- Risky - migrations already applied in production
- Could break rollback capability
- Migration history should be immutable

❌ **Big-bang policy update:**
- Higher risk of breaking something
- Harder to test incrementally
- More complex rollback

---

## Security Impact

**No security change** - this is a naming cleanup only:
- ✅ RLS policies unchanged
- ✅ Auth flow unchanged
- ✅ JWT validation unchanged
- ✅ No new permissions granted

---

## Apply Migration to Database

**Development:**
```bash
# Apply the migration
psql $SUPABASE_DB_URL -f supabase/migrations/20251021_rename_clerk_to_current_user.sql

# Verify both functions exist
psql $SUPABASE_DB_URL -c "SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%user_id%';"
```

**Production:**
```bash
# Use Supabase CLI
supabase db push

# Or apply manually via Supabase Dashboard > SQL Editor
```

---

## Rollback Plan

If Phase 1 causes issues (unlikely):

```sql
-- Remove new function, keep old one
DROP FUNCTION IF EXISTS public.current_user_id();

-- Ensure old function works standalone
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## Files Modified This Session

### Created
- `supabase/migrations/20251021_rename_clerk_to_current_user.sql`
- `docs/eod-status/2025-10-21-clerk-cleanup.md` (this file)

### Modified
- `.env.local` - Removed Clerk keys and GEMINI key

### Deleted
- `src/lib/clerk.ts`
- `src/utils/clerkSupabaseSync.ts`

---

## Next Steps

1. **Test Phase 1 migration in development**
   - Apply migration to dev database
   - Test all auth flows
   - Verify RLS works correctly

2. **Apply to production** (after dev testing passes)
   - Backup database first
   - Apply migration
   - Monitor for issues

3. **Plan Phase 2** (after 7 days of stable Phase 1)
   - Create policy update migration
   - Test in development
   - Apply to production
   - Drop old `clerk_user_id()` alias

---

**Date:** 2025-10-21
**Status:** Phase 1 Complete - Ready for Testing
**Risk Level:** LOW (backwards compatible changes only)
