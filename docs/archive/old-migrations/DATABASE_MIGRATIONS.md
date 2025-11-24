# Database Migrations Guide

**Last Updated:** 2025-11-18

---

## Migration Files Created (2025-11-18)

### Batch 1: Core Infrastructure Updates

1. `20251118160000_add_phone_to_profiles.sql` - Phone number indexing
2. `20251118160100_add_tier_system.sql` - Tier and subscription columns
3. `20251118160200_add_band_storage.sql` - Band storage tracking
4. `20251118160300_storage_triggers.sql` - Auto-update storage on track changes
5. `20251118160400_sms_sharing_tables.sql` - SMS sharing infrastructure
6. `20251118160500_init_sms_credits.sql` - Initialize credits for existing users

---

## Applying Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# 1. Make sure you're connected to your project
supabase link --project-ref YOUR_PROJECT_REF

# 2. Check migration status
supabase migration list

# 3. Apply migrations to remote database
supabase db push

# 4. Verify migrations applied
supabase migration list
```

### Option 2: Manual Application (via SQL Editor)

If you don't have Supabase CLI set up:

1. Go to Supabase Dashboard → SQL Editor
2. Copy each migration file content
3. Paste and run in order (160000 → 160100 → 160200 → etc.)
4. Verify each completes successfully before proceeding

**IMPORTANT:** Run migrations in order! They have dependencies.

---

## Verification Steps

After applying all migrations, run these verification queries:

### 1. Check Profiles Table
```sql
-- Verify new columns exist
SELECT
  COUNT(*) as total_users,
  COUNT(phone_number) as users_with_phone,
  COUNT(CASE WHEN tier = 'free' THEN 1 END) as free_tier,
  COUNT(CASE WHEN tier = 'band' THEN 1 END) as band_tier,
  SUM(storage_used) as total_storage_used
FROM profiles;
```

### 2. Check Bands Table
```sql
-- Verify storage columns
SELECT
  COUNT(*) as total_bands,
  SUM(storage_used) as total_storage,
  AVG(max_members) as avg_max_members
FROM bands;
```

### 3. Check Triggers
```sql
-- Verify triggers created
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname LIKE '%storage%'
ORDER BY tgname;
```

### 4. Check SMS Tables
```sql
-- Verify tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'shared_playlists',
  'playlist_access_grants',
  'playlist_followers',
  'sms_credits',
  'producer_waitlist'
);
```

### 5. Check SMS Credits
```sql
-- Verify credits initialized
SELECT
  p.tier,
  COUNT(*) as user_count,
  AVG(sc.credits_total) as avg_credits,
  SUM(sc.credits_remaining) as total_remaining
FROM profiles p
LEFT JOIN sms_credits sc ON sc.user_id = p.id
GROUP BY p.tier;
```

---

## Rollback Procedures

### Rollback: 20251118160500_init_sms_credits.sql

```sql
BEGIN;

-- Delete all SMS credits
DELETE FROM sms_credits;

COMMIT;
```

### Rollback: 20251118160400_sms_sharing_tables.sql

```sql
BEGIN;

-- Drop tables in reverse order (due to foreign keys)
DROP TABLE IF EXISTS producer_waitlist CASCADE;
DROP TABLE IF EXISTS sms_credits CASCADE;
DROP TABLE IF EXISTS playlist_followers CASCADE;
DROP TABLE IF EXISTS playlist_access_grants CASCADE;
DROP TABLE IF EXISTS shared_playlists CASCADE;

COMMIT;
```

### Rollback: 20251118160300_storage_triggers.sql

```sql
BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS track_insert_storage_update ON tracks;
DROP TRIGGER IF EXISTS track_delete_storage_update ON tracks;
DROP TRIGGER IF EXISTS track_update_storage_update ON tracks;

-- Drop functions
DROP FUNCTION IF EXISTS update_storage_on_track_insert();
DROP FUNCTION IF EXISTS update_storage_on_track_delete();
DROP FUNCTION IF EXISTS update_storage_on_track_update();

COMMIT;
```

### Rollback: 20251118160200_add_band_storage.sql

```sql
BEGIN;

-- Remove columns from bands
ALTER TABLE bands
  DROP COLUMN IF EXISTS storage_used,
  DROP COLUMN IF EXISTS storage_limit,
  DROP COLUMN IF EXISTS max_members;

-- Drop index
DROP INDEX IF EXISTS idx_bands_storage;

COMMIT;
```

### Rollback: 20251118160100_add_tier_system.sql

```sql
BEGIN;

-- Remove columns from profiles
ALTER TABLE profiles
  DROP COLUMN IF EXISTS tier,
  DROP COLUMN IF EXISTS storage_used,
  DROP COLUMN IF EXISTS storage_limit,
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS trial_ends_at,
  DROP COLUMN IF EXISTS last_active_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_profiles_tier;
DROP INDEX IF EXISTS idx_profiles_subscription_status;

COMMIT;
```

### Rollback: 20251118160000_add_phone_to_profiles.sql

```sql
BEGIN;

-- Drop indexes (phone_number column already existed, so we don't drop it)
DROP INDEX IF EXISTS idx_profiles_phone_unique;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_phone;

COMMIT;
```

---

## Testing Migrations Locally

### Using Supabase CLI + Docker

```bash
# 1. Start local Supabase
supabase start

# 2. Apply migrations to local database
supabase db reset

# 3. Test functionality
# - Insert test data
# - Verify triggers work
# - Check constraints

# 4. Stop local Supabase
supabase stop
```

### Manual Testing

```sql
-- Test 1: Insert a track, verify storage updates
INSERT INTO tracks (title, file_url, file_size, created_by)
VALUES ('Test Track', 'test.mp3', 5000000, 'user-id-here');

-- Check storage increased
SELECT storage_used FROM profiles WHERE id = 'user-id-here';

-- Delete track
DELETE FROM tracks WHERE title = 'Test Track';

-- Check storage decreased
SELECT storage_used FROM profiles WHERE id = 'user-id-here';
```

```sql
-- Test 2: Verify tier constraints
UPDATE profiles SET tier = 'invalid' WHERE id = 'user-id-here';
-- Should fail with constraint violation

UPDATE profiles SET tier = 'band' WHERE id = 'user-id-here';
-- Should succeed
```

```sql
-- Test 3: Verify SMS credits
SELECT * FROM sms_credits WHERE user_id = 'user-id-here';
-- Should show credits based on tier
```

---

## Common Issues & Fixes

### Issue: Migration fails due to existing data

**Symptom:** `ERROR: column already exists`

**Fix:** Migrations use `IF NOT EXISTS` and `IF EXISTS`, should be idempotent

If issue persists:
```sql
-- Check what exists
\d profiles
\d bands

-- Manually verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
```

### Issue: Trigger not firing

**Symptom:** Storage not updating when tracks inserted

**Fix:**
```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname LIKE '%storage%';

-- Check function exists
SELECT proname FROM pg_proc WHERE proname LIKE '%storage%';

-- Re-create trigger
DROP TRIGGER IF EXISTS track_insert_storage_update ON tracks;
-- Then re-run migration file
```

### Issue: Foreign key constraint violation

**Symptom:** Cannot create SMS tables

**Fix:** Ensure profiles and playlists tables exist first
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('profiles', 'playlists');
```

---

## Post-Migration Tasks

### 1. Regenerate TypeScript Types

```bash
# Update database types from new schema
npm run db:types

# Check git diff
git diff lib/database.types.ts

# Commit changes
git add lib/database.types.ts
git commit -m "chore: regenerate database types after migrations"
```

### 2. Update Application Code

- [ ] Import new types
- [ ] Update queries to use new columns
- [ ] Add tier enforcement logic
- [ ] Add storage check before uploads
- [ ] Create phone number input components

### 3. Notify Existing Users

- [ ] Create modal prompting for phone number
- [ ] Show on first login after migration
- [ ] Allow skip but remind later
- [ ] Track which users have added phone

---

## Migration History

| Date | Migration | Purpose | Status |
|------|-----------|---------|--------|
| 2025-11-18 | 160000-160500 | Tier system + SMS sharing | ✅ Created |
| 2025-11-12 | Baseline | Document existing schema | ✅ Applied |

---

## Next Migrations (Planned)

### Future: Make phone_number required

Once all active users have phone numbers:

```sql
-- File: 20251125_make_phone_required.sql
ALTER TABLE profiles
  ALTER COLUMN phone_number SET NOT NULL;
```

**Prerequisites:**
- All active users must have phone_number populated
- Run verification query first:
  ```sql
  SELECT COUNT(*) FROM profiles WHERE phone_number IS NULL;
  -- Should return 0
  ```

---

## Support

If migrations fail or you need help:

1. **Check logs:** Supabase Dashboard → Database → Logs
2. **Verify prerequisite:** All tables/columns exist
3. **Test locally:** Use `supabase db reset` with Docker
4. **Rollback if needed:** Use rollback procedures above
5. **Document issue:** Note error message, affected migration

---

**Migrations are ready to apply!** ✅

Start with local testing, then apply to production when verified.
