# File Organization & Cleanup Plan

**Created**: 2025-11-24
**Purpose**: Consolidate migration files and documentation into organized structure

---

## Current Situation

Files are scattered across multiple directories:
- `/migrations/` - Old diagnostic/debug SQL files (should archive)
- `/supabase/migrations/` - Official migration files (keep)
- `/docs/nov_dev/` - New development documentation (keep)
- `/docs/` - Old migration docs (should consolidate)
- Root directory - Quick start guides (move to docs)

---

## Recommended File Structure

```
/Users/exleymini/Apps/coretet-band/
│
├── supabase/
│   └── migrations/                    # ✅ KEEP - Official migrations only
│       ├── 20251112142500_baseline_schema.sql
│       ├── 20251112143000_fix_security_warnings.sql
│       ├── 20251112144000_fix_rls_policies.sql
│       ├── 20251112144500_fix_recursion.sql
│       ├── 20251112145000_fix_bands_insert.sql
│       ├── 20251118160000_add_phone_to_profiles.sql
│       ├── 20251118160100_add_tier_system.sql
│       ├── 20251118160200_add_band_storage.sql
│       ├── 20251118160300_storage_triggers.sql
│       ├── 20251118160400_sms_sharing_tables.sql
│       ├── 20251118160500_init_sms_credits.sql
│       └── archive/                   # Old migrations
│
├── docs/
│   ├── nov_dev/                       # ✅ KEEP - Current development docs
│   │   ├── README.md                  # Overview of November dev push
│   │   ├── MIGRATIONS_COMPLETE_STATUS.md
│   │   ├── CURRENT_CODEBASE_TASKS.md
│   │   ├── USER_IDENTITY_AND_AUTH.md
│   │   ├── PLATFORM_STRATEGY.md
│   │   ├── CoreTet_Development_Brief_FINAL.md
│   │   ├── CoreTet_Pre_Implementation_Checklist.md
│   │   ├── CoreTet_Quick_Start.md
│   │   └── CoreTet_SMS_Sharing_System.md
│   │
│   ├── reference/                     # ✅ KEEP - Reference documentation
│   │   ├── CORETET_PROJECT_SPEC.md
│   │   └── DATABASE_SCHEMA.md
│   │
│   ├── ai/                           # ✅ KEEP - AI assistant context
│   │   └── CLAUDE_CODE_CONTEXT.md
│   │
│   ├── eod-status/                   # ✅ KEEP - Daily status updates
│   │   ├── 2025-11-06-eod.md
│   │   ├── 2025-11-11-invite-rls-fixed.md
│   │   ├── 2025-11-12-eod.md
│   │   ├── 2025-11-17-eod.md
│   │   └── 2025-11-24-migrations-complete.md
│   │
│   └── archive/                      # ✅ KEEP - Historical context
│       ├── clerk-migration/
│       ├── 2025-11-12-rls-audit/     # Move old RLS docs here
│       └── 2025-11-11-invite-debug/  # Already archived
│
├── migrations/                        # ⚠️ CLEANUP NEEDED
│   ├── README.md                     # Update to explain archive
│   ├── VERIFY_ALL_MIGRATIONS.sql     # Move to docs/nov_dev/
│   └── archive/                      # Archive all debug files
│       └── 2025-11-11-debug/         # Move all old SQL here
│
└── [root]
    ├── README.md                     # ✅ KEEP - Main project README
    └── [NO MIGRATION DOCS]           # Move to docs/

```

---

## Cleanup Actions

### 1. Archive `/migrations/` Debug Files

**Move these to** `/migrations/archive/2025-11-debug/`:
- All `CHECK_*.sql` files (diagnostic queries)
- All `FIX_*.sql` files (old fixes, already applied)
- All `DEBUG_*.sql` files
- All `TEST_*.sql` files
- `INSPECT_CURRENT_SCHEMA.sql`
- `VERIFY_ALL_MIGRATIONS.sql` (keep copy in docs)

**Keep in** `/migrations/`:
- `README.md` (update to explain purpose)
- `001-create-bands-system.sql` (historical reference)
- `002-create-personal-bands.sql` (historical reference)

### 2. Consolidate Documentation

**Move to** `/docs/archive/2025-11-12-rls-audit/`:
- `/docs/CODEBASE_RLS_ANALYSIS_2025-11-12.md`
- `/docs/CODEBASE_RLS_DEEP_ANALYSIS_2025-11-12.md`
- `/docs/CURRENT_TASK_LIST_2025-11-12.md`
- `/docs/FINAL_RLS_AUDIT_CONCLUSION_2025-11-12.md`
- `/docs/RLS_POLICY_AUDIT_RESULTS_2025-11-12.md`
- `/docs/TASK_STATUS_2025-11-12.md`

**Move to** `/docs/archive/2025-11-11-invite-debug/`:
- `/docs/DAN_*.md` (all Dan debugging docs)

**Move to** `/docs/archive/old-migrations/`:
- `/docs/APPLY_RLS_MIGRATION_SUPABASE_SQL_EDITOR.md`
- `/docs/DATABASE_MIGRATIONS.md`
- `/docs/ENSEMBLE_TO_BANDS_MIGRATION.md`
- `/docs/MIGRATION_COMPLETE.md`
- `/docs/MIGRATION_SYNC_ISSUE_2025-11-12.md`
- `/docs/MIGRATION_SYSTEM_FIXED_2025-11-12.md`

**Keep in** `/docs/`:
- `README_DATABASE_SECTION.md` (useful reference)
- `UI_UX_REVIEW_BRIEF.md` (current, relevant)

### 3. Remove Quick Start Guides from Root

**Move to** `/docs/nov_dev/`:
- `/MIGRATIONS_QUICK_START.md` → `/docs/nov_dev/MIGRATIONS_QUICK_START.md`
- `/MIGRATION_CHECKLIST.md` → `/docs/nov_dev/MIGRATION_CHECKLIST.md`

### 4. Create Single Source of Truth

**Create** `/docs/nov_dev/README.md`:
```markdown
# November Development Push

## Current Status
- ✅ Database migrations complete (6 migrations applied)
- ⏭️ Week 1: Constants & utilities (starting Nov 25)

## Key Documents
- [MIGRATIONS_COMPLETE_STATUS.md](./MIGRATIONS_COMPLETE_STATUS.md) - What was done
- [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) - What's next (3-week plan)
- [USER_IDENTITY_AND_AUTH.md](./USER_IDENTITY_AND_AUTH.md) - Auth architecture
- [PLATFORM_STRATEGY.md](./PLATFORM_STRATEGY.md) - 3-platform strategy

## Development Briefs
- [CoreTet_Development_Brief_FINAL.md](./CoreTet_Development_Brief_FINAL.md)
- [CoreTet_Pre_Implementation_Checklist.md](./CoreTet_Pre_Implementation_Checklist.md)
- [CoreTet_Quick_Start.md](./CoreTet_Quick_Start.md)
- [CoreTet_SMS_Sharing_System.md](./CoreTet_SMS_Sharing_System.md)

## Next Steps
See [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) for detailed 3-week plan.
```

### 5. Update Main README

**Add to** `/README.md`:
```markdown
## 📚 Documentation

- **Current Development**: [docs/nov_dev/](./docs/nov_dev/) - November development push
- **Database**: [docs/reference/DATABASE_SCHEMA.md](./docs/reference/DATABASE_SCHEMA.md)
- **Project Spec**: [docs/reference/CORETET_PROJECT_SPEC.md](./docs/reference/CORETET_PROJECT_SPEC.md)
- **Daily Status**: [docs/eod-status/](./docs/eod-status/) - End of day updates

## 🗄️ Database Migrations

All migrations are in [supabase/migrations/](./supabase/migrations/).

**Latest migrations** (Nov 24, 2025):
- Tier system (free/band/producer)
- SMS sharing infrastructure
- Automated storage tracking

See [docs/nov_dev/MIGRATIONS_COMPLETE_STATUS.md](./docs/nov_dev/MIGRATIONS_COMPLETE_STATUS.md) for details.
```

---

## Cleanup Script

```bash
#!/bin/bash
# Run from project root: /Users/exleymini/Apps/coretet-band/

echo "🧹 Starting file organization cleanup..."

# 1. Archive /migrations/ debug files
echo "📦 Archiving debug files..."
mkdir -p migrations/archive/2025-11-debug
mv migrations/CHECK_*.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/FIX_*.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/DEBUG_*.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/TEST_*.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/INSPECT_CURRENT_SCHEMA.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/ANALYZE_*.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/AUDIT_*.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/FULL_DIAGNOSTIC.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/LIST_ALL_FUNCTIONS.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/TRULY_BYPASS_RLS_IN_FUNCTION.sql migrations/archive/2025-11-debug/ 2>/dev/null
mv migrations/WHAT_POLICIES_EXIST_NOW.sql migrations/archive/2025-11-debug/ 2>/dev/null

# 2. Move VERIFY script to docs (keep copy)
cp migrations/VERIFY_ALL_MIGRATIONS.sql docs/nov_dev/VERIFY_ALL_MIGRATIONS.sql
mv migrations/VERIFY_ALL_MIGRATIONS.sql migrations/archive/2025-11-debug/

# 3. Archive old RLS docs
echo "📦 Archiving old RLS audit docs..."
mkdir -p docs/archive/2025-11-12-rls-audit
mv docs/CODEBASE_RLS_ANALYSIS_2025-11-12.md docs/archive/2025-11-12-rls-audit/ 2>/dev/null
mv docs/CODEBASE_RLS_DEEP_ANALYSIS_2025-11-12.md docs/archive/2025-11-12-rls-audit/ 2>/dev/null
mv docs/CURRENT_TASK_LIST_2025-11-12.md docs/archive/2025-11-12-rls-audit/ 2>/dev/null
mv docs/FINAL_RLS_AUDIT_CONCLUSION_2025-11-12.md docs/archive/2025-11-12-rls-audit/ 2>/dev/null
mv docs/RLS_POLICY_AUDIT_RESULTS_2025-11-12.md docs/archive/2025-11-12-rls-audit/ 2>/dev/null
mv docs/TASK_STATUS_2025-11-12.md docs/archive/2025-11-12-rls-audit/ 2>/dev/null

# 4. Archive Dan debugging docs
echo "📦 Archiving Dan debug docs..."
mkdir -p docs/archive/2025-11-11-invite-debug
mv docs/DAN_*.md docs/archive/2025-11-11-invite-debug/ 2>/dev/null

# 5. Archive old migration docs
echo "📦 Archiving old migration docs..."
mkdir -p docs/archive/old-migrations
mv docs/APPLY_RLS_MIGRATION_SUPABASE_SQL_EDITOR.md docs/archive/old-migrations/ 2>/dev/null
mv docs/DATABASE_MIGRATIONS.md docs/archive/old-migrations/ 2>/dev/null
mv docs/ENSEMBLE_TO_BANDS_MIGRATION.md docs/archive/old-migrations/ 2>/dev/null
mv docs/MIGRATION_COMPLETE.md docs/archive/old-migrations/ 2>/dev/null
mv docs/MIGRATION_SYNC_ISSUE_2025-11-12.md docs/archive/old-migrations/ 2>/dev/null
mv docs/MIGRATION_SYSTEM_FIXED_2025-11-12.md docs/archive/old-migrations/ 2>/dev/null

# 6. Move quick start guides to docs
echo "📦 Moving quick start guides to docs..."
mv MIGRATIONS_QUICK_START.md docs/nov_dev/
mv MIGRATION_CHECKLIST.md docs/nov_dev/

# 7. Clean up supabase/migrations backups
echo "🧹 Cleaning up backup files..."
rm supabase/migrations/*.bak 2>/dev/null
rm supabase/migrations/*_OLD.sql 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📁 File organization:"
echo "  - Official migrations: supabase/migrations/"
echo "  - Current dev docs: docs/nov_dev/"
echo "  - Archived debug files: migrations/archive/2025-11-debug/"
echo "  - Archived RLS docs: docs/archive/2025-11-12-rls-audit/"
echo "  - Archived invite debug: docs/archive/2025-11-11-invite-debug/"
echo "  - Archived old migrations: docs/archive/old-migrations/"
```

---

## What to Keep vs Archive

### ✅ KEEP (Active/Current)
- `supabase/migrations/*.sql` (official migrations)
- `docs/nov_dev/` (all current development docs)
- `docs/reference/` (project specs)
- `docs/ai/` (AI context)
- `docs/eod-status/` (daily updates)
- `migrations/README.md` (updated)
- `migrations/001-*.sql` and `002-*.sql` (historical reference)

### 📦 ARCHIVE (Old/Debug)
- All `CHECK_*.sql` files (diagnostic queries)
- All `FIX_*.sql` files (already applied)
- All `DEBUG_*.sql` files (troubleshooting)
- All old migration docs in `/docs/`
- All Dan debugging docs
- All RLS audit docs (Nov 12)
- Backup files (*.bak, *_OLD.sql)

### 🗑️ DELETE (Safe to Remove)
- `*.bak` files
- `*_OLD.sql` files
- Duplicate files

---

## Next Steps

1. **Run cleanup script** (creates organized structure)
2. **Create `/docs/nov_dev/README.md`** (single source of truth)
3. **Update main `/README.md`** (add documentation section)
4. **Update `/migrations/README.md`** (explain archive)
5. **Git commit**: "chore: Organize migration files and documentation"

---

## Benefits

- ✅ Clear separation: official migrations vs debug files
- ✅ Single source of truth: `/docs/nov_dev/README.md`
- ✅ Historical context preserved in archives
- ✅ Easier to find current documentation
- ✅ Clean root directory
- ✅ Logical file structure
