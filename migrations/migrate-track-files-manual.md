# Track File Migration: Move to User Subfolders

## Problem
Current tracks are stored in `audio-files/audio/*` but should be in `audio-files/{userId}/*`

## Solution Options

### Option A: JavaScript Migration Script (Recommended)

Use this Node.js script that uses Supabase's JavaScript SDK:

```javascript
// run-migration.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // NOT anon key!

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateTrackFiles() {
  console.log('Starting migration...');

  // Step 1: Get all tracks that need migration
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, created_by, file_url')
    .like('file_url', 'audio/%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch tracks:', error);
    return;
  }

  console.log(`Found ${tracks.length} tracks to migrate`);

  let successCount = 0;
  let failCount = 0;

  // Step 2: Process each track
  for (const track of tracks) {
    try {
      // Extract filename from old path
      const oldPath = track.file_url.replace(/^audio\//, '');
      const newPath = `${track.created_by}/${oldPath}`;

      console.log(`Migrating: ${oldPath} -> ${newPath}`);

      // Copy file to new location
      const { data: copyData, error: copyError } = await supabase.storage
        .from('audio-files')
        .copy(oldPath, newPath);

      if (copyError) {
        console.error(`Failed to copy ${oldPath}:`, copyError);
        failCount++;
        continue;
      }

      // Update database
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ file_url: newPath })
        .eq('id', track.id);

      if (updateError) {
        console.error(`Failed to update track ${track.id}:`, updateError);
        failCount++;
        continue;
      }

      // Delete old file
      const { error: deleteError } = await supabase.storage
        .from('audio-files')
        .remove([oldPath]);

      if (deleteError) {
        console.warn(`Failed to delete old file ${oldPath}:`, deleteError);
        // Don't count as failure since file was copied and DB updated
      }

      successCount++;
      console.log(`✅ Successfully migrated track ${track.id}`);

    } catch (err) {
      console.error(`Error processing track ${track.id}:`, err);
      failCount++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

// Run migration
migrateTrackFiles().catch(console.error);
```

**To run:**
1. Save as `migrations/run-migration.js`
2. Install dependencies: `npm install @supabase/supabase-js`
3. Get your **Service Role Key** from Supabase Dashboard → Settings → API
4. Run: `node migrations/run-migration.js`

---

### Option B: Manual SQL + Storage UI (Safer for Testing)

If you want more control, do it manually:

#### Step 1: Identify tracks to migrate
```sql
SELECT
  id,
  title,
  created_by,
  file_url,
  created_by || '/' || regexp_replace(file_url, '^audio/', '') as new_path
FROM tracks
WHERE file_url LIKE 'audio/%'
ORDER BY created_at DESC;
```

#### Step 2: For each track (manually in Supabase Dashboard):
1. Go to Storage → audio-files bucket
2. Find file in `audio/` folder
3. Download file
4. Create folder named `{created_by}` if it doesn't exist
5. Upload file to that folder
6. Copy the new path

#### Step 3: Update database
```sql
-- Update one track at a time (safer)
UPDATE tracks
SET file_url = '{new_path_from_step2}'
WHERE id = '{track_id}';
```

#### Step 4: Delete old file
Go back to Storage UI and delete the old file from `audio/` folder.

---

### Option C: SQL-Only (If storage.copy works)

```sql
-- Test on ONE track first!
DO $$
DECLARE
  test_track_id UUID := 'PASTE_TRACK_ID_HERE';
  track_record RECORD;
  old_path TEXT;
  new_path TEXT;
BEGIN
  SELECT id, created_by, file_url INTO track_record
  FROM tracks
  WHERE id = test_track_id;

  -- Generate paths
  old_path := regexp_replace(track_record.file_url, '^audio/', '');
  new_path := track_record.created_by || '/' || old_path;

  RAISE NOTICE 'Old path: %', old_path;
  RAISE NOTICE 'New path: %', new_path;

  -- Try to copy (this may not work depending on Supabase version)
  -- PERFORM storage.copy('audio-files', old_path, 'audio-files', new_path);

  -- Update database
  UPDATE tracks SET file_url = new_path WHERE id = test_track_id;

  RAISE NOTICE 'Updated database for track %', test_track_id;
END $$;
```

---

## Recommended Approach

**Use Option A (JavaScript script)** - It's the most reliable and gives you full control.

Test it on 2-3 tracks first by modifying the query to add `.limit(3)` before `.order()`.

Let me know if you want me to create the full Node.js script as a runnable file!
