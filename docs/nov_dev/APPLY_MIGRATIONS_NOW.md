# Apply Database Migrations - Step by Step Guide

**Created**: 2025-11-22
**Status**: Ready to execute
**Database**: Supabase (PostgreSQL)

## Pre-Flight Checklist

- [ ] Confirm you're on development database (not production)
- [ ] Backup current database state
- [ ] Review all 6 migration files
- [ ] Set aside 30 minutes for careful execution

---

## Migration Execution Order

Execute these migrations in **EXACT ORDER** via Supabase SQL Editor:

### Migration 1: Phone Number Indexing
**File**: `supabase/migrations/20251118160000_add_phone_to_profiles.sql`

**What it does**:
- Converts empty string phone numbers to NULL (fixes duplicate issue)
- Adds unique index on phone_number (where not null)
- Adds performance indexes for email and phone lookups

**Expected outcome**:
- 10 users with empty strings → converted to NULL
- Unique constraint created successfully
- Verification shows users_with_phone count

**Run in Supabase SQL Editor**:
1. Copy entire file contents
2. Paste into SQL Editor
3. Click "Run"
4. Check verification results at bottom

**Success indicators**:
```
total_users | users_with_phone | users_without_phone
-----------+-----------------+--------------------
     12    |        2        |         10
```

---

### Migration 2: Tier System
**File**: `supabase/migrations/20251118160100_add_tier_system.sql`

**What it does**:
- Adds tier column (free/band/producer)
- Adds storage_used, storage_limit columns
- Adds Stripe integration columns
- Sets all existing users to 'free' tier with 1GB limit

**Expected outcome**:
- All users have tier = 'free'
- All users have storage_limit = 1073741824 (1GB)
- Indexes created for performance

**Success indicators**:
```
tier  | user_count | total_storage_used | avg_storage_limit
------+-----------+-------------------+------------------
free  |    12     |         0         |    1073741824
```

---

### Migration 3: Band Storage Tracking
**File**: `supabase/migrations/20251118160200_add_band_storage.sql`

**What it does**:
- Adds storage_used, storage_limit to bands table
- Sets default 25GB limit per band
- Adds max_members column (default 10)

**Expected outcome**:
- All bands have storage_limit = 26843545600 (25GB)
- All bands have max_members = 10

**Success indicators**:
```
total_bands | total_storage_used | avg_storage_limit | avg_max_members
-----------+-------------------+------------------+----------------
     X     |         0         |   26843545600    |       10
```

---

### Migration 4: Storage Triggers
**File**: `supabase/migrations/20251118160300_storage_triggers.sql`

**What it does**:
- Creates triggers to auto-update storage_used when tracks are uploaded/deleted
- Handles both personal (band_id IS NULL) and band tracks
- Creates functions: `update_storage_on_track_insert()` and `update_storage_on_track_delete()`

**Expected outcome**:
- Triggers created successfully
- No immediate data changes (only affects future uploads/deletes)

**Success indicators**:
- Query returns "Storage triggers created successfully"
- Check triggers exist: `SELECT * FROM pg_trigger WHERE tgname LIKE '%storage%';`

---

### Migration 5: SMS Sharing Tables
**File**: `supabase/migrations/20251118160400_sms_sharing_tables.sql`

**What it does**:
- Creates `shared_playlists` table (share tokens, analytics)
- Creates `playlist_access_grants` table (SMS access codes)
- Adds `source` column to existing `playlist_followers` table
- Creates `sms_credits` table (monthly SMS allowance)
- Creates `producer_waitlist` table

**Expected outcome**:
- 5 tables exist (4 new + 1 updated)
- All indexes created
- No data inserted yet (empty tables)

**Success indicators**:
```
status                      | shared_playlists_exists | access_grants_exists | followers_exists | sms_credits_exists | waitlist_exists
---------------------------+------------------------+---------------------+-----------------+-------------------+----------------
SMS sharing tables created |           1            |          1          |        1        |         1         |        1
```

---

### Migration 6: Initialize SMS Credits
**File**: `supabase/migrations/20251118160500_init_sms_credits.sql`

**What it does**:
- Grants initial SMS credits to all existing users based on tier
  - Free: 10 credits/month
  - Band: 50 credits/month
  - Producer: 200 credits/month
- Sets period to current month

**Expected outcome**:
- 12 users get 10 credits each (all are 'free' tier)
- Period starts today, ends in 1 month

**Success indicators**:
```
tier  | user_count | total_credits | avg_credits_used
------+-----------+--------------+-----------------
free  |    12     |     120      |        0
```

---

## Post-Migration Steps

### 1. Regenerate TypeScript Types
```bash
npm run db:types
```

**Expected**: `lib/database.types.ts` updated with new columns/tables

### 2. Verify Schema Changes
```sql
-- Check profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('tier', 'storage_used', 'phone_number');

-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('shared_playlists', 'playlist_access_grants', 'sms_credits', 'producer_waitlist');

-- Check triggers exist
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%storage%';
```

### 3. Test Storage Triggers
```sql
-- Test 1: Upload a track (personal workspace)
-- Manually insert a test track and verify storage_used increases
-- (Will be replaced by actual app upload flow)

-- Test 2: Delete a track
-- Manually delete test track and verify storage_used decreases
```

### 4. Update Application Code

**Next development tasks** (in order):
1. Create TypeScript constants for tiers (`src/constants/tiers.ts`)
2. Create phone utility functions (`src/utils/phone.ts`)
3. Create access code generator (`src/utils/accessCodes.ts`)
4. Build storage check service (`src/services/storage.ts`)
5. Build tier enforcement service (`src/services/tiers.ts`)
6. Update sign-up form to include phone number
7. Create phone verification flow
8. Create upgrade modals/screens
9. Testing and validation

---

## Rollback Procedures

### If Migration 1 Fails:
```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_profiles_phone_unique;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_phone;
```

### If Migration 2 Fails:
```sql
-- Remove tier columns
ALTER TABLE profiles
  DROP COLUMN IF EXISTS tier,
  DROP COLUMN IF EXISTS storage_used,
  DROP COLUMN IF EXISTS storage_limit,
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS trial_ends_at,
  DROP COLUMN IF EXISTS last_active_at;
```

### If Migration 3 Fails:
```sql
-- Remove band storage columns
ALTER TABLE bands
  DROP COLUMN IF EXISTS storage_used,
  DROP COLUMN IF EXISTS storage_limit,
  DROP COLUMN IF EXISTS max_members;
```

### If Migration 4 Fails:
```sql
-- Remove triggers
DROP TRIGGER IF EXISTS track_insert_storage_trigger ON tracks;
DROP TRIGGER IF EXISTS track_delete_storage_trigger ON tracks;

-- Remove functions
DROP FUNCTION IF EXISTS update_storage_on_track_insert();
DROP FUNCTION IF EXISTS update_storage_on_track_delete();
```

### If Migration 5 Fails:
```sql
-- Remove new tables
DROP TABLE IF EXISTS producer_waitlist;
DROP TABLE IF EXISTS sms_credits;
DROP TABLE IF EXISTS playlist_access_grants;
DROP TABLE IF EXISTS shared_playlists;

-- Remove column from existing table
ALTER TABLE playlist_followers DROP COLUMN IF EXISTS source;
```

### If Migration 6 Fails:
```sql
-- Clear SMS credits
DELETE FROM sms_credits;
```

---

## Common Issues and Fixes

### Issue: "relation already exists"
**Cause**: Migration was partially applied before
**Fix**: Skip to next migration or use `IF NOT EXISTS` clauses (already in migrations)

### Issue: "column already exists"
**Cause**: Column was added manually or in previous attempt
**Fix**: Use `ADD COLUMN IF NOT EXISTS` (already in migrations)

### Issue: "duplicate key value violates unique constraint"
**Cause**: Unexpected duplicate data
**Fix**: Run inspection query to find duplicates, clean up manually, then retry

### Issue: "permission denied"
**Cause**: Insufficient database permissions
**Fix**: Ensure you're logged in as database owner/admin in Supabase

---

## Verification Checklist

After all migrations complete:

- [ ] Migration 1: Phone indexes created, empty strings converted to NULL
- [ ] Migration 2: All users have tier='free', storage_limit=1GB
- [ ] Migration 3: All bands have storage_limit=25GB, max_members=10
- [ ] Migration 4: Storage triggers exist and fire on track insert/delete
- [ ] Migration 5: 5 tables exist (shared_playlists, playlist_access_grants, playlist_followers updated, sms_credits, producer_waitlist)
- [ ] Migration 6: All users have SMS credits for current month
- [ ] TypeScript types regenerated (`npm run db:types`)
- [ ] No console errors in Supabase SQL Editor
- [ ] All verification queries return expected results

---

## Ready to Execute

**Execute migrations in order**: 1 → 2 → 3 → 4 → 5 → 6

**Time estimate**: 15-30 minutes (including verification)

**Point of no return**: After Migration 4 (triggers start affecting data)

**Recommendation**: Execute migrations 1-3 first, verify, then proceed with 4-6.

---

## Next Steps After Migrations

See [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) for full 3-week plan.

**Immediate next tasks**:
1. Regenerate database types
2. Create tier constants
3. Create phone utility functions
4. Update sign-up flow to collect phone numbers

**Goal**: Prepare current codebase for public launch with tier system and SMS sharing.
