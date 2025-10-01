# Ensemble → Bands Migration Guide

This guide will help you migrate from "ensembles" to "bands" naming and enable Clerk-compatible RLS.

## Step 1: Apply Database Migration

### Option A: Using Supabase CLI (Recommended)

```bash
cd /Users/exleymini/Apps/coretet-band
supabase db push
```

### Option B: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy the entire contents of `supabase/migrations/001_clerk_rls_and_rename_to_bands.sql`
3. Paste into SQL Editor
4. Click "Run"

## Step 2: Regenerate TypeScript Types

After the migration, regenerate your database types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Or get your project ID and use:
```bash
npx supabase gen types typescript --project-id tvvztlizyciaafqkigwe > lib/database.types.ts
```

## Step 3: Update TypeScript Code

These files need to be updated to use "bands" instead of "ensembles":

### Files to Update:

1. **lib/supabase.ts** - Replace ensemble → band
2. **src/contexts/BandContext.tsx** - Already uses "band" but may have ensemble references
3. **src/components/screens/MainDashboard.tsx** - Update ensemble references
4. **src/utils/audioUploadService.ts** - Update any ensemble references
5. **supabase/functions/create-band/index.ts** - Update Edge Function

### Search and Replace:

```bash
# Find all TypeScript files with "ensemble" references
grep -r "ensemble" --include="*.ts" --include="*.tsx" src/ lib/ supabase/functions/

# Then manually update each file, or use find/replace in VSCode:
# - ensemble_id → band_id
# - ensemble_members → band_members
# - ensembles → bands
# - Ensemble → Band (for types/interfaces)
```

## Step 4: Update Supabase Client Calls

Update any direct database calls to use the new table names:

**Before:**
```typescript
const { data } = await supabase
  .from('ensembles')
  .select('*, ensemble_members(*)')
```

**After:**
```typescript
const { data } = await supabase
  .from('bands')
  .select('*, band_members(*)')
```

## Step 5: Test RLS Policies with Clerk

The new RLS policies use `auth.clerk_user_id()` which extracts the Clerk user ID from JWT claims.

**Test checklist:**

1. ✅ User can view their own profile
2. ✅ User can create a band
3. ✅ User can only see bands they're a member of
4. ✅ User can add members to their band
5. ✅ User can upload files to their band
6. ✅ User CANNOT see other users' bands
7. ✅ User CANNOT access other users' files

## Step 6: Configure Clerk JWT Template

For RLS policies to work, Clerk must include the user ID in the JWT:

1. Go to https://dashboard.clerk.com
2. Navigate to **JWT Templates**
3. Create or edit your Supabase template
4. Ensure the `sub` claim contains the user ID:

```json
{
  "sub": "{{user.id}}"
}
```

5. Use this JWT in requests to Supabase

## What Changed

### Database Changes

| Before | After |
|--------|-------|
| `ensembles` table | `bands` table |
| `ensemble_members` table | `band_members` table |
| `ensemble_id` column | `band_id` column |
| `get_ensemble_member_count()` | `get_band_member_count()` |

### RLS Changes

| Before | After |
|--------|-------|
| `auth.uid()` (Supabase Auth) | `auth.clerk_user_id()` (Clerk JWT) |
| RLS disabled | RLS enabled on all tables |
| No policies | Comprehensive Clerk-compatible policies |

### Security Improvements

✅ **RLS Enabled** on all tables
✅ **Clerk Authentication** via JWT claims
✅ **User Isolation** - users can only access their own data
✅ **Band Privacy** - users can only see bands they belong to
✅ **Proper Authorization** - creators have special permissions

## Rollback Plan

If something goes wrong:

```sql
-- Rename bands back to ensembles
ALTER TABLE bands RENAME TO ensembles;
ALTER TABLE band_members RENAME TO ensemble_members;
ALTER TABLE band_members RENAME COLUMN band_id TO ensemble_id;
ALTER TABLE playlists RENAME COLUMN band_id TO ensemble_id;

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ensembles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;
```

## Verification

After migration, verify:

```bash
# Check tables renamed
psql -h db.YOUR_PROJECT.supabase.co -U postgres -c "\\dt"

# Check RLS enabled
psql -h db.YOUR_PROJECT.supabase.co -U postgres -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"

# Check policies created
psql -h db.YOUR_PROJECT.supabase.co -U postgres -c "SELECT schemaname, tablename, policyname FROM pg_policies;"
```

## Next Steps

After successful migration:

1. ✅ Update frontend code to use "bands" terminology
2. ✅ Test all CRUD operations
3. ✅ Verify RLS policies work correctly
4. ✅ Update documentation and UI text
5. ✅ Deploy Edge Functions with new table names

---

**Need help?** Check the migration file at:
`supabase/migrations/001_clerk_rls_and_rename_to_bands.sql`
