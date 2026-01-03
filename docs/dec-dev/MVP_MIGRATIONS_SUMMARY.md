# CoreTet MVP Migrations - Summary & Status

**Created**: 2025-12-05
**Status**: ✅ **Ready to Apply**
**Breaking Changes**: ⚠️ YES (playlists → set_lists)

---

## 📦 What Was Created

### 4 Database Migrations

All migrations are in `/supabase/migrations/`:

| # | File | Purpose | Breaking |
|---|------|---------|----------|
| 1 | `20251205000001_create_track_versions.sql` | Track versions + Hero system | No |
| 2 | `20251205000002_create_track_listens.sql` | Listened indicator (80% threshold) | No |
| 3 | `20251205000003_create_keywords_system.sql` | Freeform keywords for organization | No |
| 4 | `20251205000004_migrate_playlists_to_setlists.sql` | Rename playlists → set_lists + versions | **YES** |

### Supporting Files

| File | Purpose |
|------|---------|
| `VERIFY_MVP_MIGRATIONS.sql` | Verification script - run after migrations |
| `MVP_IMPLEMENTATION_GUIDE.md` | Complete frontend implementation guide |
| `MVP_MIGRATIONS_SUMMARY.md` | This file |
| `scripts/check-db-stats.ts` | Database statistics helper |

---

## 🎯 Features Implemented

### 1. Hero System (Track Versions)

**What it does**:
- Multiple versions per track
- One "Hero" version featured by default
- Other versions accessible via carousel/dropdown
- Admin can promote any version to Hero
- Storage tracking works with versions

**Database**:
- ✅ `track_versions` table
- ✅ `tracks.hero_version_id` column
- ✅ Unique constraint: 1 hero per track
- ✅ Storage triggers for version uploads/deletes
- ✅ RLS policies (band members can view, admins can manage)

**Data Migration**:
- All existing tracks → version 1 (is_hero = true)
- Safe, non-destructive

---

### 2. Listened Indicator

**What it does**:
- Tracks when user listens to 80%+ of track
- Shows band members who has/hasn't listened
- Soft accountability ("everyone on the same page")

**Database**:
- ✅ `track_listens` table
- ✅ Helper function: `record_track_listen()`
- ✅ View: `track_listen_stats` (aggregated data)
- ✅ Unique constraint: one listen per user per version
- ✅ RLS policies

**Integration**:
- Audio player calls function at 80% playback
- UI shows "3/5 listened" on track cards

---

### 3. Keywords

**What it does**:
- Freeform keyword tagging (admin creates)
- Filter tracks by keyword
- Organize growing libraries
- Visual pills/badges on track cards

**Database**:
- ✅ `keywords` table (case-insensitive, unique per band)
- ✅ `track_keywords` junction table
- ✅ Helper functions: `get_or_create_keyword()`, `add_keyword_to_track()`
- ✅ View: `keyword_stats` (usage counts)
- ✅ RLS policies (admins create, members view)

**Suggested Keywords**:
Upbeat, Ballad, Instrumental, Needs vocals, Needs mixing, Cover, Original, Jam-friendly, Short, Encore

---

### 4. Set Lists (renamed from Playlists)

**What it does**:
- Ordered sequences for performances
- Select specific version per track
- Same track can appear with different versions
- Curated by admin

**Database**:
- ✅ `playlists` → `set_lists`
- ✅ `playlist_items` → `set_list_entries`
- ✅ `set_list_entries.version_id` (instead of just track_id)
- ✅ `playlist_followers` → `set_list_followers`
- ✅ `shared_playlists` → `shared_set_lists`
- ✅ `playlist_access_grants` → `set_list_access_grants`
- ✅ View: `set_list_details` (entries with version info)
- ✅ Updated RLS policies

**Data Migration**:
- All existing playlist entries → hero version of each track
- Safe, preserves existing data

---

## ⚠️ Breaking Changes

### What Breaks

**Table Renames** (Migration #4):
```
playlists              → set_lists
playlist_items         → set_list_entries
playlist_followers     → set_list_followers
shared_playlists       → shared_set_lists
playlist_access_grants → set_list_access_grants
```

**Column Renames**:
```
playlist_id         → set_list_id (everywhere)
shared_playlist_id  → shared_set_list_id
```

**Schema Changes**:
```
set_list_entries now has:
  - version_id (new, references track_versions)
  - track_id (kept for backward compat, but version_id is primary)
```

### Frontend Files to Update

**Must update**:
- [lib/supabase.ts](../../lib/supabase.ts) - All `db.playlists.*` → `db.setLists.*`
- [src/contexts/PlaylistContext.tsx](../../src/contexts/PlaylistContext.tsx) - Rename to SetListContext
- All components referencing playlists

**Search for**:
```bash
grep -r "playlists" src/
grep -r "playlist_items" src/
grep -r "PlaylistContext" src/
```

---

## 🚀 How to Apply Migrations

### Step 1: Backup Database

**Critical**: Backup before running breaking changes.

```bash
# Via Supabase Dashboard
# Project Settings → Database → Create backup
```

### Step 2: Run Migrations

**Option A: Supabase CLI** (recommended):
```bash
supabase db push
```

**Option B: SQL Editor** (Supabase Dashboard):
1. Copy/paste each migration file (in order: 1→2→3→4)
2. Run one at a time
3. Check for errors

**Option C: Direct psql**:
```bash
psql <connection-string> -f supabase/migrations/20251205000001_create_track_versions.sql
# Repeat for 2, 3, 4
```

### Step 3: Verify Success

```bash
psql <connection-string> -f supabase/migrations/VERIFY_MVP_MIGRATIONS.sql
```

Expected output: All ✅ checks pass

### Step 4: Regenerate Types

```bash
npm run db:types
```

This updates `lib/database.types.ts` with new tables.

---

## ✅ Expected Results

After migrations:

**New Tables**:
- track_versions (with existing tracks as version 1)
- track_listens
- keywords
- track_keywords

**Renamed Tables**:
- set_lists (was playlists)
- set_list_entries (was playlist_items)
- set_list_followers (was playlist_followers)
- shared_set_lists (was shared_playlists)
- set_list_access_grants (was playlist_access_grants)

**New Columns**:
- tracks.hero_version_id
- set_list_entries.version_id

**Helper Functions**:
- record_track_listen()
- get_or_create_keyword()
- add_keyword_to_track()

**Views**:
- track_listen_stats
- keyword_stats
- set_list_details

---

## 🧪 Testing Plan

### Smoke Tests (Immediately After Migration)

1. **Check existing data**:
   - [ ] All tracks still visible
   - [ ] All set lists (playlists) still work
   - [ ] Can play existing tracks
   - [ ] No 404 errors on playlist pages

2. **Check new features**:
   - [ ] Can see track versions
   - [ ] Can upload new version
   - [ ] Can set hero version
   - [ ] Can create keyword
   - [ ] Can add keyword to track
   - [ ] Can create set list with version selection

### Full Feature Tests (Before Launch)

**Track Versions**:
- [ ] Upload 3 versions of a track
- [ ] Set version 2 as hero
- [ ] Verify version 1 is still accessible
- [ ] Delete version 3
- [ ] Check storage updated correctly

**Listened Indicator**:
- [ ] Play track to 80%
- [ ] Verify listen recorded
- [ ] Check band member list shows you listened
- [ ] Verify other members show "not listened"

**Keywords**:
- [ ] Create 3 keywords (Upbeat, Ballad, Cover)
- [ ] Add "Upbeat" to 5 tracks
- [ ] Filter by "Upbeat"
- [ ] Verify only those 5 tracks show
- [ ] Try case variations (upbeat, UPBEAT)

**Set Lists**:
- [ ] Create set list "Friday Night Set"
- [ ] Add 5 tracks
- [ ] For track with multiple versions, select non-hero version
- [ ] Verify set list plays correct version
- [ ] Reorder entries
- [ ] Delete set list

---

## 🔄 Rollback Procedures

If migrations fail or break production:

### Quick Rollback (Restore from Backup)

```bash
# Via Supabase Dashboard
# Project Settings → Database → Restore from backup
```

### Manual Rollback (Use Migration Rollback Sections)

Each migration file has rollback SQL at the bottom. Run in **reverse order** (4→3→2→1).

**WARNING**: Migration #4 rollback is complex (table renames). Backup is safer.

---

## 📊 Database Impact

**Current State** (from Nov 24 EOD):
- 12 users
- 20 bands
- Unknown track count (will migrate all to version 1)
- Unknown playlist count (will rename to set_lists)

**After Migration**:
- Same data, new structure
- All tracks have ≥1 version
- All set list entries reference versions
- Storage tracking works with versions

---

## 🎯 Next Steps

### Immediate (After Migrations Run)

1. ✅ Run migrations
2. ✅ Verify with VERIFY_MVP_MIGRATIONS.sql
3. ✅ Regenerate TypeScript types (`npm run db:types`)
4. ⏳ Update frontend code (see Implementation Guide)

### Implementation (Days 1-8)

Follow [MVP_IMPLEMENTATION_GUIDE.md](./MVP_IMPLEMENTATION_GUIDE.md):
- Days 1-2: Track Versions UI
- Days 3-4: Listened Indicator UI
- Days 5-6: Keywords UI
- Days 7-8: Set Lists UI updates

### Polish (Week 2+)

- UI/UX refinements
- Comments timestamp sync fix (separate task)
- Mobile testing
- Performance optimization
- Onboarding tooltips

---

## 📞 Questions & Issues

**If migrations fail**:
1. Check Supabase logs for errors
2. Review VERIFY script output
3. Check for data conflicts
4. Review RLS policy errors

**Common issues**:
- Foreign key violations (old references to playlists)
- Duplicate hero versions (constraint violation)
- RLS policy blocks (auth issues)
- Missing version_id on set_list_entries

**Support**:
- See rollback procedures in each migration file
- Check Implementation Guide for frontend fixes
- Test in local/staging first if possible

---

## 🎉 Success Criteria

Migrations are successful when:

✅ All migrations run without errors
✅ VERIFY_MVP_MIGRATIONS.sql shows all ✅
✅ TypeScript types regenerate successfully
✅ Existing tracks/playlists still work
✅ No 404s or broken queries
✅ Can upload new version
✅ Can create keywords
✅ Can create set lists with version selection

---

**Status**: ✅ **Ready to Apply**
**Risk Level**: ⚠️ **Medium** (Breaking changes, test carefully)
**Estimated Time**: 5-10 minutes for migrations, 8-10 days for full implementation

