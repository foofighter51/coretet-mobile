# Migrations Directory

**Purpose**: Diagnostic queries and historical SQL files
**Status**: Archived (active migrations are in `/supabase/migrations/`)

---

## ⚠️ Important Note

**This directory is for reference only.**

Official migrations are located in:
```
/supabase/migrations/
```

This directory contains:
- Historical migration files (001, 002)
- Archived diagnostic queries
- Debugging scripts from past issues

---

## Directory Structure

```
/migrations/
├── README.md                      # This file
├── 001-create-bands-system.sql    # Historical: Original bands system
├── 002-create-personal-bands.sql  # Historical: Personal bands creation
├── run-migration.js               # Track file reorganization script
├── migrate-track-files-*.sql/md   # Track file migration docs
└── archive/
    └── 2025-11-debug/            # Archived diagnostic queries
        ├── CHECK_*.sql           # Schema inspection queries
        ├── FIX_*.sql             # Old fix attempts (already applied)
        ├── DEBUG_*.sql           # Debugging queries
        └── TEST_*.sql            # Test queries
```

---

## Historical Files (Keep for Reference)

### 001-create-bands-system.sql
Original migration that created the bands system when transitioning from "ensembles" to "bands".

**Status**: Already applied to production
**Date**: ~2025-10-22

### 002-create-personal-bands.sql
Migration to create personal bands for each user (workspace concept).

**Status**: Already applied to production
**Date**: ~2025-10-22

### Track File Reorganization
Scripts to reorganize audio files from flat `audio/*` to user-based `{userId}/*` structure.

**Files**:
- `run-migration.js` - Automated Node.js script
- `migrate-track-files-to-user-folders.sql` - SQL-based migration
- `migrate-track-files-manual.md` - Manual migration guide

**Status**: Available for use when needed
**Use case**: Organize storage by user for better management

---

## Archived Files (2025-11-debug/)

These files were used during November 2025 debugging sessions:

### Diagnostic Queries (CHECK_*.sql)
- Used to inspect current database state
- Helped identify RLS policy issues
- Helped identify empty string phone numbers
- All issues now resolved

### Fix Attempts (FIX_*.sql)
- Various attempts to fix RLS policies
- Various attempts to fix recursion issues
- Various attempts to fix invite acceptance
- All successfully resolved via official migrations

### Debug Queries (DEBUG_*.sql)
- User-specific debugging (Dan, Stephen, etc.)
- Auth context debugging
- RLS policy debugging
- All issues now resolved

### Test Queries (TEST_*.sql)
- Policy logic testing
- Function testing
- Insert testing
- All tests passed

---

## Official Migrations Location

**All official migrations are in**: `/supabase/migrations/`

**Latest migrations** (Nov 24, 2025):
```
20251118160000_add_phone_to_profiles.sql       # Phone indexing
20251118160100_add_tier_system.sql             # Tier system
20251118160200_add_band_storage.sql            # Band storage tracking
20251118160300_storage_triggers.sql            # Automated storage updates
20251118160400_sms_sharing_tables.sql          # SMS sharing infrastructure
20251118160500_init_sms_credits.sql            # SMS credits initialization
```

**Status**: All applied successfully ✅

See [/docs/nov_dev/MIGRATIONS_COMPLETE_STATUS.md](../docs/nov_dev/MIGRATIONS_COMPLETE_STATUS.md) for details.

---

## When to Use This Directory

### ✅ DO Use for:
- Reference: Look up historical migration logic
- Debugging: Review past issues and solutions
- Learning: Understand how past problems were solved
- Context: Understand schema evolution
- Storage migration: Run track file reorganization when needed

### ❌ DON'T Use for:
- Creating new migrations (use `/supabase/migrations/`)
- Running schema migrations (use Supabase SQL Editor with `/supabase/migrations/` files)
- Production schema changes (always use official migration process)

---

## Creating New Migrations

**Always create migrations in** `/supabase/migrations/`:

```bash
# Create new migration
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql

# Example
touch supabase/migrations/20251125100000_add_new_feature.sql
```

**Migration naming convention**:
```
YYYYMMDDHHmmss_description_in_snake_case.sql

Example:
20251125100000_add_user_preferences.sql
```

**Always include**:
- BEGIN/COMMIT transaction blocks
- Verification query at end
- Comments explaining purpose
- IF EXISTS / IF NOT EXISTS guards

---

## Documentation

For complete migration documentation, see:
- [/docs/nov_dev/MIGRATIONS_COMPLETE_STATUS.md](../docs/nov_dev/MIGRATIONS_COMPLETE_STATUS.md)
- [/docs/nov_dev/CURRENT_CODEBASE_TASKS.md](../docs/nov_dev/CURRENT_CODEBASE_TASKS.md)
- [/docs/nov_dev/README.md](../docs/nov_dev/README.md)

---

## Archive Policy

Files are archived when:
- Issue is resolved via official migration
- Diagnostic queries no longer needed
- Debugging session complete
- File clutters active development

Archives preserved for:
- Historical reference
- Future debugging context
- Team learning
- Documentation purposes

**Archive location**: `/migrations/archive/YYYY-MM-description/`

---

**Last updated**: 2025-11-24
**Status**: Directory organized and archived
**Next migration**: To be created in `/supabase/migrations/`
