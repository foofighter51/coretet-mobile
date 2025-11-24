# 🚀 Database Migrations - Quick Start

**Status**: ✅ Ready to execute
**Time needed**: 15-30 minutes
**Full guide**: [docs/nov_dev/APPLY_MIGRATIONS_NOW.md](docs/nov_dev/APPLY_MIGRATIONS_NOW.md)

---

## Execute in Supabase SQL Editor (In Order)

### 1️⃣ Phone Number Indexing
```
File: supabase/migrations/20251118160000_add_phone_to_profiles.sql
Action: Copy entire file → Paste in SQL Editor → Run
Expected: Converts 10 empty strings to NULL, creates unique index
```

### 2️⃣ Tier System
```
File: supabase/migrations/20251118160100_add_tier_system.sql
Action: Copy entire file → Paste in SQL Editor → Run
Expected: All users get tier='free', storage_limit=1GB
```

### 3️⃣ Band Storage
```
File: supabase/migrations/20251118160200_add_band_storage.sql
Action: Copy entire file → Paste in SQL Editor → Run
Expected: All bands get storage_limit=25GB, max_members=10
```

### 4️⃣ Storage Triggers
```
File: supabase/migrations/20251118160300_storage_triggers.sql
Action: Copy entire file → Paste in SQL Editor → Run
Expected: Auto-update storage on track upload/delete
```

### 5️⃣ SMS Sharing Tables
```
File: supabase/migrations/20251118160400_sms_sharing_tables.sql
Action: Copy entire file → Paste in SQL Editor → Run
Expected: Creates 4 new tables + updates playlist_followers
```

### 6️⃣ SMS Credits
```
File: supabase/migrations/20251118160500_init_sms_credits.sql
Action: Copy entire file → Paste in SQL Editor → Run
Expected: All users get 10 SMS credits/month
```

---

## After All Migrations Complete

```bash
# Regenerate TypeScript types
npm run db:types

# Verify changes
git status
# Should show: lib/database.types.ts modified
```

---

## Verification

Each migration includes a verification query that runs automatically at the end.

**Example output from Migration 1**:
```
total_users | users_with_phone | users_without_phone
-----------+-----------------+--------------------
     12    |        2        |         10
```

---

## Troubleshooting

**Error**: "relation already exists" → **Fix**: Skip to next migration (IF NOT EXISTS protects you)

**Error**: "column already exists" → **Fix**: Skip to next migration (IF NOT EXISTS protects you)

**Error**: "permission denied" → **Fix**: Log in as database admin in Supabase

**Error**: Something else → **Fix**: See full rollback procedures in [APPLY_MIGRATIONS_NOW.md](docs/nov_dev/APPLY_MIGRATIONS_NOW.md)

---

## What Changes

**profiles table**:
- ✅ phone_number (unique index, converted empty → NULL)
- ✅ tier ('free' | 'band' | 'producer')
- ✅ storage_used, storage_limit
- ✅ stripe_customer_id, stripe_subscription_id, subscription_status

**bands table**:
- ✅ storage_used, storage_limit, max_members

**New tables**:
- ✅ shared_playlists (SMS sharing links)
- ✅ playlist_access_grants (SMS access codes)
- ✅ sms_credits (monthly allowance)
- ✅ producer_waitlist (upgrade requests)

**playlist_followers table**:
- ✅ source column added ('manual' | 'sms_share' | 'band_member')

**Triggers**:
- ✅ Auto-update storage_used on track insert
- ✅ Auto-update storage_used on track delete

---

## Next Development Steps

1. ✅ Migrations complete
2. ⏭️ Regenerate database types
3. ⏭️ Create tier constants (`src/constants/tiers.ts`)
4. ⏭️ Create phone utilities (`src/utils/phone.ts`)
5. ⏭️ Update sign-up flow (add phone field)
6. ⏭️ Build storage enforcement service
7. ⏭️ Build tier enforcement service

**See**: [CURRENT_CODEBASE_TASKS.md](docs/nov_dev/CURRENT_CODEBASE_TASKS.md) for full 3-week plan

---

**Ready?** Start with Migration 1 in Supabase SQL Editor! 🚀
