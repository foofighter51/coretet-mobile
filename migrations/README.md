# Database Migrations

## Track File Reorganization Migration

### Purpose
Reorganize audio files from flat `audio/*` structure to user-based `{userId}/*` structure for better organization.

### Files
- `run-migration.js` - Automated Node.js script (recommended)
- `migrate-track-files-to-user-folders.sql` - SQL-based migration (alternative)
- `migrate-track-files-manual.md` - Manual migration guide (safest but slowest)

---

## How to Run (Recommended Method)

### 1. Get Your Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy the **`service_role` key** (NOT the `anon` key!)

⚠️ **WARNING**: Service role key has admin access - keep it secret!

### 2. Test Migration (Dry Run)
```bash
# Set environment variable
export SUPABASE_SERVICE_KEY="your-service-role-key-here"

# Run dry run on 5 tracks to test
node migrations/run-migration.js --dry-run --limit=5
```

This will show you what would happen without making any changes.

### 3. Test on a Few Real Tracks
```bash
# Process just 5 tracks to verify everything works
node migrations/run-migration.js --limit=5
```

Check in the app that these 5 tracks still play correctly!

### 4. Run Full Migration
```bash
# Process all tracks
node migrations/run-migration.js
```

---

## What the Script Does

For each track with old structure (`audio/filename.m4a`):

1. **Copy** file to new location (`{userId}/filename.m4a`)
2. **Update** database `tracks.file_url` with new path
3. **Delete** old file from `audio/` folder
4. **Log** results (success/fail/skip)

---

## Safety Features

- ✅ Dry run mode (`--dry-run`) - test without changes
- ✅ Limit mode (`--limit=N`) - process only N tracks
- ✅ Skip already migrated tracks automatically
- ✅ Rollback on failure - if database update fails, copied file is deleted
- ✅ Non-critical delete failures don't fail migration
- ✅ Detailed logging for debugging

---

## Troubleshooting

### "Failed to copy" errors
- Check that files exist in `audio-files` bucket at the old path
- Verify service role key has storage permissions

### "Database update failed" errors
- Check service role key has write access to `tracks` table
- Verify track IDs are valid UUIDs

### Tracks don't play after migration
- Check that `file_url` was updated correctly:
  ```sql
  SELECT id, title, file_url FROM tracks WHERE id = 'problem-track-id';
  ```
- Verify file exists at new location in Supabase Storage UI
- App may need to refresh signed URLs (should happen automatically on next load)

---

## Rollback Plan

If something goes wrong and you need to rollback:

```sql
-- 1. List migrated tracks (new structure)
SELECT id, title, file_url, created_by
FROM tracks
WHERE file_url ~ '^[0-9a-f]{8}-';

-- 2. Manually move files back in Storage UI
-- From: {userId}/filename.m4a
-- To: audio/filename.m4a

-- 3. Update database to old paths
UPDATE tracks
SET file_url = 'audio/' || regexp_replace(file_url, '^[^/]+/', '')
WHERE file_url ~ '^[0-9a-f]{8}-';
```

---

## After Migration

1. Verify tracks play in app
2. Check Supabase Storage - should see user folders
3. Old `audio/` folder should be empty (or delete manually)
4. Commit migration scripts to git for documentation

---

## Alternative: Manual Migration (Safest)

See `migrate-track-files-manual.md` for step-by-step manual process.

Good for:
- Very small number of tracks (< 20)
- Want maximum control
- Uncomfortable with automated scripts
