# Migration Sync Issue - 2025-11-12

## Problem
The Supabase migration system is out of sync between local and remote. This happened because:
1. Many SQL files were applied directly to the production database (via SQL Editor or manual execution)
2. Multiple local migration files have duplicate timestamps (20251003, 20251007, 20251022, 20251112)
3. The `supabase_migrations.schema_migrations` table on remote doesn't match local files

## Current State

### Duplicate Local Migrations
```
20251003_disable_tracks_rls.sql
20251003133102_add_track_ratings.sql
20251003162627_add_folder_path.sql

20251007_add_feedback_screenshots.sql
20251007_add_feedback_system.sql
20251007_add_playlist_followers.sql

20251022_add_user_signup_notifications.sql
20251022_fix_profiles_id_type.sql
20251022_fix_profiles_id_type_complete.sql
20251022_fix_profiles_id_uuid_with_policies.sql
20251022_uuid_migration_final.sql

20251112140418_fix_security_warnings.sql
```

### Issues
1. Migrations with same date prefix confuse Supabase CLI
2. Some migrations exist on remote but not locally
3. Some local migrations were never tracked in remote history table
4. Manual SQL fixes (FIX_ALL_RLS_ISSUES_COMPREHENSIVE.sql, etc.) bypassed migration system

## Solutions

### Option A: Start Fresh with Baseline (RECOMMENDED)
**Safest for production database**
1. Create a new baseline migration from current remote schema
2. Archive all old migration files
3. Reset migration history
4. Moving forward, ALL changes go through migration system

**Steps:**
```bash
# 1. Pull current remote schema as baseline
supabase db pull --schema public

# 2. This creates a new migration with current state
# 3. Archive old migrations
mkdir -p supabase/migrations/archive
mv supabase/migrations/00*.sql supabase/migrations/archive/
mv supabase/migrations/2025*.sql supabase/migrations/archive/

# 4. Keep only the new baseline migration
# 5. Future: ALWAYS use `supabase migration new <name>` for new migrations
```

**Pros:**
- Clean slate
- Remote database untouched (no risk to production)
- Future migrations work correctly

**Cons:**
- Loses detailed migration history (but we have git history)

### Option B: Repair Each Migration Manually
**More complex, preserves history**
1. Rename duplicate local files to have unique timestamps
2. Mark each migration's status correctly (applied/reverted)
3. Ensure local matches remote

**Steps:**
```bash
# Rename duplicates to have unique second-level timestamps
mv 20251003_disable_tracks_rls.sql 20251003000000_disable_tracks_rls.sql
# ... repeat for all duplicates with incrementing timestamps

# Then repair history for each
supabase migration repair --status applied 20251003000000
# ... repeat for all
```

**Pros:**
- Preserves detailed migration history

**Cons:**
- Time-consuming
- Error-prone
- Doesn't fix root cause (manual SQL bypassing migrations)

### Option C: Hybrid Approach
1. Keep working migrations (001-004, properly timestamped ones)
2. Create single "catch-up" migration for all manual SQL changes
3. Document manual changes in the catch-up migration

## Recommendation

**Use Option A (Start Fresh with Baseline)** because:
1. Production database is working and stable (Build 23 shipped)
2. Git history preserves all SQL changes for reference
3. Future migrations will work correctly
4. No risk of breaking production
5. Clean foundation going forward

## Moving Forward

### Rules for Future Migrations
1. **NEVER** apply SQL directly to production
2. **ALWAYS** use: `supabase migration new <descriptive_name>`
3. **ALWAYS** test locally first: `supabase db reset`
4. **ALWAYS** push via: `supabase db push`
5. Keep migration files in git
6. One logical change per migration
7. Unique timestamps (use CLI, don't create manually)

### Emergency Hotfixes
If you MUST apply SQL directly:
1. Apply to production via SQL Editor
2. **IMMEDIATELY** create matching migration file: `supabase migration new hotfix_<description>`
3. Copy the SQL into the migration file
4. Push to sync: `supabase db push`

## Decision Needed

Which option do you want to proceed with?
- **Option A**: Clean baseline (RECOMMENDED) - safest, quickest
- **Option B**: Repair manually - preserves history, time-consuming
- **Option C**: Hybrid - middle ground
