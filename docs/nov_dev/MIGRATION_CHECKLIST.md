# Database Migration Checklist

**Date**: 2025-11-22
**Status**: Ready to execute

---

## Pre-Flight

- [ ] Confirmed on development database (not production)
- [ ] Reviewed all 6 migration files
- [ ] Read [MIGRATIONS_QUICK_START.md](MIGRATIONS_QUICK_START.md)
- [ ] Opened Supabase SQL Editor

---

## Execute Migrations (In Order)

### Migration 1: Phone Number Indexing
- [ ] Opened `supabase/migrations/20251118160000_add_phone_to_profiles.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"
- [ ] Verified results show empty strings converted to NULL
- [ ] No errors in output

**Expected result**:
```
total_users | users_with_phone | users_without_phone
-----------+-----------------+--------------------
     12    |        2        |         10
```

---

### Migration 2: Tier System
- [ ] Opened `supabase/migrations/20251118160100_add_tier_system.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"
- [ ] Verified all users have tier='free'
- [ ] No errors in output

**Expected result**:
```
tier  | user_count | total_storage_used | avg_storage_limit
------+-----------+-------------------+------------------
free  |    12     |         0         |    1073741824
```

---

### Migration 3: Band Storage
- [ ] Opened `supabase/migrations/20251118160200_add_band_storage.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"
- [ ] Verified bands have storage_limit=25GB
- [ ] No errors in output

**Expected result**:
```
total_bands | total_storage_used | avg_storage_limit | avg_max_members
-----------+-------------------+------------------+----------------
     X     |         0         |   26843545600    |       10
```

---

### Migration 4: Storage Triggers
- [ ] Opened `supabase/migrations/20251118160300_storage_triggers.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"
- [ ] Verified "Storage triggers created successfully"
- [ ] No errors in output

---

### Migration 5: SMS Sharing Tables
- [ ] Opened `supabase/migrations/20251118160400_sms_sharing_tables.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"
- [ ] Verified 5 tables exist (all = 1)
- [ ] No errors in output

**Expected result**:
```
status                      | shared_playlists_exists | access_grants_exists | followers_exists | sms_credits_exists | waitlist_exists
---------------------------+------------------------+---------------------+-----------------+-------------------+----------------
SMS sharing tables created |           1            |          1          |        1        |         1         |        1
```

---

### Migration 6: SMS Credits
- [ ] Opened `supabase/migrations/20251118160500_init_sms_credits.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"
- [ ] Verified all users have SMS credits
- [ ] No errors in output

**Expected result**:
```
tier  | user_count | total_credits | avg_credits_used
------+-----------+--------------+-----------------
free  |    12     |     120      |        0
```

---

## Post-Migration Verification

- [ ] Opened `migrations/VERIFY_ALL_MIGRATIONS.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"
- [ ] All checks show ✅ PASS
- [ ] No ❌ FAIL results

---

## Update Application Code

- [ ] Ran `npm run db:types` to regenerate TypeScript types
- [ ] Verified `lib/database.types.ts` was updated
- [ ] Committed migration files to git
- [ ] Committed updated database.types.ts to git

```bash
git add supabase/migrations/*.sql
git add lib/database.types.ts
git commit -m "feat: Add tier system, SMS sharing, and storage tracking

- Migration 1: Phone number unique indexing
- Migration 2: Tier system (free/band/producer)
- Migration 3: Band storage tracking
- Migration 4: Auto-update storage triggers
- Migration 5: SMS sharing infrastructure
- Migration 6: Initialize SMS credits

All users initialized to 'free' tier with 1GB storage limit.
Bands initialized to 25GB storage limit.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Next Development Tasks

See [docs/nov_dev/CURRENT_CODEBASE_TASKS.md](docs/nov_dev/CURRENT_CODEBASE_TASKS.md)

**Immediate next steps**:
- [ ] Create `src/constants/tiers.ts`
- [ ] Create `src/utils/phone.ts`
- [ ] Create `src/utils/accessCodes.ts`
- [ ] Create `src/services/storage.ts`
- [ ] Create `src/services/tiers.ts`
- [ ] Update sign-up form to collect phone
- [ ] Build phone verification flow
- [ ] Create upgrade modals

---

## Rollback (If Needed)

If something goes wrong, see rollback procedures in:
[docs/nov_dev/APPLY_MIGRATIONS_NOW.md](docs/nov_dev/APPLY_MIGRATIONS_NOW.md)

---

## Notes

**Date completed**: _______________

**Issues encountered**: _______________

**Time taken**: _______________

**Database verified**: ☐ Yes ☐ No

**TypeScript types updated**: ☐ Yes ☐ No

**Ready for next phase**: ☐ Yes ☐ No
