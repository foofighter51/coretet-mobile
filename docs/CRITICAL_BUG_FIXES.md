# Critical Bug Fixes for Audio Upload Service

**Date**: January 25, 2026
**Priority**: URGENT - Production Blockers
**Impact**: Storage quota system completely broken, freemium model non-functional

---

## Bug Analysis Summary

The audio upload service has **three critical bugs** that break the storage quota system:

1. ❌ **No quota check before upload** → Users can upload unlimited files
2. ❌ **Delete doesn't decrement quota** → Quota never goes down
3. ❌ **Upload doesn't increment quota** → Quota tracking is inaccurate
4. ❌ **Delete uses wrong file path** → Files never actually deleted from storage

Additionally:
5. ⚠️ **Batch upload errors not returned to UI** → Users can't see what failed

---

## Architecture Context

### Current Storage System

**Database Schema** (`profiles` table):
```sql
storage_used   BIGINT  -- Bytes currently used
storage_limit  BIGINT  -- Bytes allowed (default: 1GB = 1073741824)
```

**Storage Bucket**: `audio-files` (not `tracks` as initially assumed)

**File Path Structure**:
```
audio-files/
  └── {userId}/
      └── YYYY-MM-DD_{title}_{uuid}.mp3
```

**Helper Functions Available** (in `lib/supabase.ts`):
- `db.profiles.getById(userId)` - Get profile with storage info
- `db.profiles.update(userId, updates)` - Update profile
- `storage.uploadAudio(file, path)` - Upload to audio-files bucket
- `storage.deleteFile(path)` - Delete from audio-files bucket
- `storage.getSignedUrl(path, expiresIn)` - Generate signed URL

---

## Bug Fix Implementation

### Fix #1: Add Storage Quota Check BEFORE Upload

**Location**: `src/utils/audioUploadService.ts` - Line ~82 (before Step 4: Cloud Upload)

**Code to Add**:

```typescript
// Step 3.5: CHECK STORAGE QUOTA (NEW)
this.updateProgress('processing', 65, 'Checking storage quota...');

const { data: profile, error: profileError } = await db.profiles.getById(
  this.currentUser.id
);

if (profileError || !profile) {
  throw new Error('Failed to check storage quota. Please try again.');
}

const currentUsage = profile.storage_used || 0;
const quotaLimit = profile.storage_limit || 1073741824; // Default 1GB
const newTotal = currentUsage + file.size;

if (newTotal > quotaLimit) {
  const usageFormatted = AudioProcessor.formatFileSize(currentUsage);
  const limitFormatted = AudioProcessor.formatFileSize(quotaLimit);
  const fileFormatted = AudioProcessor.formatFileSize(file.size);

  throw new Error(
    `Storage quota exceeded.\n\n` +
    `Current usage: ${usageFormatted} of ${limitFormatted}\n` +
    `This file: ${fileFormatted}\n` +
    `Would total: ${AudioProcessor.formatFileSize(newTotal)}\n\n` +
    `Delete some files or upgrade your plan for more storage.`
  );
}

this.updateProgress('processing', 68, 'Quota check passed');
```

**Why This Works**:
- Checks quota BEFORE uploading to cloud (fails fast)
- Uses existing `db.profiles.getById()` helper
- Provides clear error message with formatted sizes
- Falls back to 1GB default if storage_limit is null

---

### Fix #2: Increment Storage Quota AFTER Upload

**Location**: `src/utils/audioUploadService.ts` - Line ~141 (after successful track creation)

**Replace This**:
```typescript
const { data: track, error: dbError } = await db.tracks.create(trackData);

if (dbError) {
  // Cleanup uploaded file if database save fails
  await storage.deleteFile(filePath);
  throw new Error(`Database save failed: ${dbError.message}`);
}

// Step 7: Complete
this.updateProgress('complete', 100, 'Upload successful!');
```

**With This**:
```typescript
const { data: track, error: dbError } = await db.tracks.create(trackData);

if (dbError) {
  // Cleanup uploaded file if database save fails
  await storage.deleteFile(filePath);
  throw new Error(`Database save failed: ${dbError.message}`);
}

// Step 6.5: INCREMENT STORAGE QUOTA (NEW)
this.updateProgress('saving', 95, 'Updating storage quota...');

const { error: quotaError } = await supabase
  .from('profiles')
  .update({
    storage_used: supabase.raw(`COALESCE(storage_used, 0) + ${processedAudio.compressedSize}`)
  })
  .eq('id', this.currentUser.id);

if (quotaError) {
  console.error('⚠️ Quota update failed:', quotaError);
  // Don't throw - upload succeeded, quota will be corrected by sync job
}

// Step 7: Complete
this.updateProgress('complete', 100, 'Upload successful!');
```

**Why This Works**:
- Uses SQL `COALESCE(storage_used, 0)` to handle null values
- Uses `supabase.raw()` for atomic SQL increment (prevents race conditions)
- Non-blocking: Logs error but doesn't fail the upload
- Uses actual file size (`processedAudio.compressedSize`)

---

### Fix #3: Fix Delete File Path Extraction + Decrement Quota

**Location**: `src/utils/audioUploadService.ts` - Line ~240 (entire `deleteAudio` method)

**Replace Entire Method With**:

```typescript
/**
 * Delete audio file and associated data
 * Also decrements storage quota
 */
static async deleteAudio(trackId: string): Promise<void> {
  try {
    // Step 1: Get track data
    const { data: track, error: fetchError } = await db.tracks.getById(trackId);

    if (fetchError || !track) {
      throw new Error(`Track not found: ${trackId}`);
    }

    // Step 2: Extract correct file path from signed URL
    // Signed URL format: https://.../storage/v1/object/sign/audio-files/USER_ID/FILENAME.mp3?token=...
    // We need: "USER_ID/FILENAME.mp3"

    const url = new URL(track.file_url);
    let filePath: string | null = null;

    // Try to extract path from signed URL
    const signedPathMatch = url.pathname.match(/\/object\/sign\/audio-files\/(.+)/);
    if (signedPathMatch) {
      filePath = signedPathMatch[1].split('?')[0]; // Remove query params
    } else {
      // Fallback: Try to extract from public URL format
      const publicPathMatch = url.pathname.match(/\/audio-files\/(.+)/);
      if (publicPathMatch) {
        filePath = publicPathMatch[1];
      }
    }

    if (!filePath) {
      console.error('❌ Could not extract file path from URL:', track.file_url);
      // Continue to delete DB record even if storage path is unclear
    }

    // Step 3: Delete from storage (if we have a valid path)
    if (filePath) {
      const { error: storageError } = await storage.deleteFile(filePath);

      if (storageError) {
        console.error('⚠️ Storage deletion failed (file may not exist):', storageError);
        // Don't throw - continue to delete DB record
      } else {
        console.log(`✅ Deleted file from storage: ${filePath}`);
      }
    }

    // Step 4: Delete from database (cascades to versions, comments, ratings, etc.)
    const { error: dbError } = await db.tracks.delete(trackId);

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }

    // Step 5: DECREMENT STORAGE QUOTA (NEW)
    const fileSize = track.file_size || 0;

    if (fileSize > 0) {
      const { error: quotaError } = await supabase
        .from('profiles')
        .update({
          storage_used: supabase.raw(`GREATEST(COALESCE(storage_used, 0) - ${fileSize}, 0)`)
        })
        .eq('id', track.created_by);

      if (quotaError) {
        console.error('⚠️ Quota decrement failed:', quotaError);
        // Don't throw - deletion succeeded, quota will be corrected by sync job
      } else {
        console.log(`✅ Decremented storage quota by ${AudioProcessor.formatFileSize(fileSize)}`);
      }
    }

    console.log(`✅ Successfully deleted track ${trackId}`);

  } catch (error) {
    console.error('❌ Error deleting audio:', error);
    throw error;
  }
}
```

**Why This Works**:
- **Fixed path extraction**: Handles both signed URL and public URL formats
- **Graceful degradation**: Continues even if storage deletion fails (file may not exist)
- **Quota decrement**: Uses `GREATEST(..., 0)` to prevent negative values
- **Atomic operation**: Uses SQL for thread-safe quota updates
- **Proper bucket**: Uses `audio-files` bucket (not `tracks`)
- **Better logging**: Clear console messages for debugging

---

### Fix #4: Return Failed Uploads to UI

**Location**: `src/utils/audioUploadService.ts` - Line ~162 (entire `uploadMultipleAudios` method)

**Update Method Signature and Return**:

```typescript
/**
 * Upload multiple audio files
 * Returns successful uploads and failed uploads separately
 */
async uploadMultipleAudios(
  files: File[],
  options: UploadOptions = {}
): Promise<{
  successful: UploadResult[];
  failed: Array<{ filename: string; error: string; size: number }>;
}> {
  const results: UploadResult[] = [];
  const failures: Array<{ filename: string; error: string; size: number }> = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      this.updateProgress(
        'processing',
        Math.round((i / total) * 100),
        `Uploading ${i + 1} of ${total}: ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}`
      );

      const result = await this.uploadAudio(file, {
        ...options,
        title: options.title || file.name.replace(/\.[^/.]+$/, '')
      });

      results.push(result);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to upload ${file.name}:`, errorMsg);

      // NEW: Add to failures array
      failures.push({
        filename: file.name,
        error: errorMsg,
        size: file.size
      });

      // Update progress with error info
      this.updateProgress(
        'processing',
        Math.round((i / total) * 100),
        `Failed: ${file.name.substring(0, 20)}... - ${errorMsg.substring(0, 50)}`
      );

      // Brief delay to show error message
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Final summary
  const successCount = results.length;
  const failCount = failures.length;
  let message = `Complete: ${successCount}/${total} uploaded`;

  if (failCount > 0) {
    message += `, ${failCount} failed`;
  }

  this.updateProgress(
    failCount > 0 ? 'processing' : 'complete',
    100,
    message
  );

  // NEW: Return both successful and failed uploads
  return { successful: results, failed: failures };
}
```

**Why This Works**:
- Returns structured data with both successes and failures
- UI can now display which files failed and why
- Longer error message delay (1500ms instead of 1000ms)
- Clearer final summary message

---

### Fix #5: Add Helper to Supabase Client (Optional but Recommended)

**Location**: `lib/supabase.ts` - Inside `db.profiles` object (around line ~210)

**Add These Helper Methods**:

```typescript
// Add inside db.profiles object:

async incrementStorage(userId: string, bytes: number) {
  const { error } = await supabase
    .from('profiles')
    .update({
      storage_used: supabase.raw(`COALESCE(storage_used, 0) + ${bytes}`)
    })
    .eq('id', userId);

  return { error };
},

async decrementStorage(userId: string, bytes: number) {
  const { error } = await supabase
    .from('profiles')
    .update({
      storage_used: supabase.raw(`GREATEST(COALESCE(storage_used, 0) - ${bytes}, 0)`)
    })
    .eq('id', userId);

  return { error };
},

async getStorageQuota(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('storage_used, storage_limit')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return {
      used: 0,
      limit: 1073741824, // 1GB default
      available: 1073741824,
      percentUsed: 0,
      error
    };
  }

  const used = data.storage_used || 0;
  const limit = data.storage_limit || 1073741824;
  const available = Math.max(0, limit - used);
  const percentUsed = (used / limit) * 100;

  return {
    used,
    limit,
    available,
    percentUsed: Math.round(percentUsed * 10) / 10, // 1 decimal place
    error: null
  };
},
```

**Why This Helps**:
- Centralizes storage quota logic
- Can be reused across the app
- Provides formatted quota data for UI

**Then Update Upload Service to Use These**:

```typescript
// In uploadAudio() - quota check:
const { used, limit, available, error } = await db.profiles.getStorageQuota(
  this.currentUser.id
);

if (error) {
  throw new Error('Failed to check storage quota');
}

if (file.size > available) {
  throw new Error(
    `Storage quota exceeded.\n\n` +
    `Available: ${AudioProcessor.formatFileSize(available)}\n` +
    `This file: ${AudioProcessor.formatFileSize(file.size)}\n\n` +
    `Delete some files or upgrade for more storage.`
  );
}

// In uploadAudio() - after successful upload:
await db.profiles.incrementStorage(this.currentUser.id, processedAudio.compressedSize);

// In deleteAudio() - after successful delete:
await db.profiles.decrementStorage(track.created_by, track.file_size || 0);
```

---

## Database Trigger Alternative (Recommended Long-term)

Instead of manually incrementing/decrementing in code, create database triggers:

**Migration**: `supabase/migrations/[timestamp]_storage_quota_triggers.sql`

```sql
-- Function to update storage quota on track insert
CREATE OR REPLACE FUNCTION increment_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET storage_used = COALESCE(storage_used, 0) + COALESCE(NEW.file_size, 0)
  WHERE id = NEW.created_by;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update storage quota on track delete
CREATE OR REPLACE FUNCTION decrement_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET storage_used = GREATEST(COALESCE(storage_used, 0) - COALESCE(OLD.file_size, 0), 0)
  WHERE id = OLD.created_by;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger on track insert
CREATE TRIGGER track_insert_update_quota
  AFTER INSERT ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION increment_storage_quota();

-- Trigger on track delete
CREATE TRIGGER track_delete_update_quota
  AFTER DELETE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION decrement_storage_quota();

-- Comment for documentation
COMMENT ON FUNCTION increment_storage_quota() IS 'Automatically increments profile storage_used when track is created';
COMMENT ON FUNCTION decrement_storage_quota() IS 'Automatically decrements profile storage_used when track is deleted';
```

**Benefits of Database Triggers**:
- ✅ Automatic quota tracking (no manual code)
- ✅ Can't be bypassed (enforced at DB level)
- ✅ Handles edge cases (bulk deletes, cascades)
- ✅ Reduces application code complexity

**Tradeoff**:
- ⚠️ Harder to debug (logic is in database)
- ⚠️ Need to handle track_versions separately

---

## Testing Checklist

### Test 1: Quota Check Prevents Over-Upload

```bash
# 1. Create test user with 10MB quota
UPDATE profiles SET storage_limit = 10485760 WHERE email = 'test@example.com';

# 2. Upload 5MB file → Should succeed
# Check: storage_used = 5MB

# 3. Upload another 4MB file → Should succeed
# Check: storage_used = 9MB

# 4. Try to upload 2MB file → SHOULD FAIL with quota error
# Error message should show: "Available: 1 MB, This file: 2 MB"
```

**Expected Result**: ❌ Upload blocked with clear error message

---

### Test 2: Delete Decrements Quota

```bash
# 1. User has 9MB used (from Test 1)
# 2. Delete the 5MB file
# Check: storage_used = 4MB

# 3. Try to upload 6MB file → Should succeed now
# Check: storage_used = 10MB
```

**Expected Result**: ✅ Quota decremented, new upload allowed

---

### Test 3: Delete Actually Removes File from Storage

```bash
# 1. Note the file URL before delete
# 2. Delete the track
# 3. Try to access the old URL → Should fail (403 or 404)
# 4. Check Supabase storage dashboard → File should be gone
```

**Expected Result**: ✅ File physically deleted from storage bucket

---

### Test 4: Batch Upload Error Handling

```bash
# 1. Create 5 files:
#    - valid1.mp3 (2MB) ✅
#    - valid2.mp3 (3MB) ✅
#    - invalid.txt (1MB) ❌ (wrong format)
#    - toolarge.mp3 (10MB) ❌ (exceeds remaining quota)
#    - valid3.mp3 (1MB) ✅

# 2. Upload all 5 together
# 3. Should return:
#    successful: [valid1, valid2, valid3]
#    failed: [
#      { filename: 'invalid.txt', error: 'Unsupported format' },
#      { filename: 'toolarge.mp3', error: 'Storage quota exceeded' }
#    ]
```

**Expected Result**:
- ✅ 3 successful uploads
- ❌ 2 failed uploads with reasons
- UI displays failed list with errors

---

### Test 5: Storage Quota Edge Cases

```bash
# Test 5a: Null storage_used (new user)
UPDATE profiles SET storage_used = NULL WHERE email = 'test@example.com';
# Upload 5MB file → Should work, storage_used = 5MB

# Test 5b: Negative storage_used (corrupted data)
UPDATE profiles SET storage_used = -1000 WHERE email = 'test@example.com';
# Upload 5MB file → Should work, storage_used = 5MB (corrected)

# Test 5c: Delete when storage_used is less than file_size
UPDATE profiles SET storage_used = 2000 WHERE email = 'test@example.com';
# Delete 5MB file → storage_used should be 0 (not negative)
```

**Expected Result**: ✅ All edge cases handled gracefully with COALESCE and GREATEST

---

## Deployment Steps

1. **Backup database** (critical!)
   ```bash
   # Export current profiles table
   supabase db dump --table profiles > profiles_backup.sql
   ```

2. **Apply code fixes** (in order):
   - Fix #5 (optional): Add helpers to `lib/supabase.ts`
   - Fix #1: Add quota check before upload
   - Fix #2: Add quota increment after upload
   - Fix #3: Fix delete method
   - Fix #4: Update batch upload return type

3. **Test locally** with checklist above

4. **Deploy to production**:
   ```bash
   git add .
   git commit -m "fix: Critical storage quota bugs - check before upload, increment/decrement quota"
   git push
   ```

5. **Run quota sync script** (optional - fix existing data):
   ```sql
   -- Recalculate storage_used for all users
   UPDATE profiles p
   SET storage_used = (
     SELECT COALESCE(SUM(t.file_size), 0)
     FROM tracks t
     WHERE t.created_by = p.id
   );
   ```

6. **Monitor logs** for quota-related errors

---

## Priority Order

**IMMEDIATE (Today)**:
1. Fix #1: Add quota check before upload (prevents new damage)
2. Fix #2: Increment quota after upload (fixes tracking going forward)
3. Fix #3: Fix delete + decrement quota (allows recovery)

**SOON (This Week)**:
4. Fix #4: Return failed uploads to UI (better UX)
5. Test all edge cases
6. Run quota sync script on production

**LATER (Next Sprint)**:
7. Add database triggers (long-term reliability)
8. Add storage quota UI dashboard
9. Add admin tools to adjust quotas

---

## Rollback Plan

If fixes cause issues:

1. **Immediate rollback**:
   ```bash
   git revert HEAD
   git push
   ```

2. **Restore profiles table** (if quota data corrupted):
   ```bash
   psql < profiles_backup.sql
   ```

3. **Disable quota checks** (temporary):
   ```typescript
   // In uploadAudio(), comment out quota check:
   // if (newTotal > quotaLimit) { ... }
   ```

---

## Success Metrics

After fixes are deployed, verify:

- ✅ No uploads exceeding storage_limit
- ✅ storage_used increases on upload
- ✅ storage_used decreases on delete
- ✅ Files actually deleted from storage bucket
- ✅ Batch upload errors shown in UI
- ✅ No negative storage_used values
- ✅ No user complaints about "quota exceeded" errors

---

## Future Enhancements

Once quota system is working:

1. **Storage quota dashboard** in UI
   - Progress bar showing usage
   - List of largest files
   - Upgrade prompt when near limit

2. **Quota enforcement improvements**
   - Soft limit warnings at 80%, 90%, 95%
   - Grace period before hard block
   - Email notifications near limit

3. **Storage optimization**
   - Auto-delete old files (with user consent)
   - Compress uploaded audio
   - Deduplicate identical files

4. **Admin tools**
   - Manually adjust user quotas
   - View quota usage stats
   - Identify quota abusers

---

**Document Status**: Ready for Implementation
**Estimated Time**: 2-3 hours (coding + testing)
**Risk Level**: Medium (modifies critical upload path)
**Recommended Tester**: Manual testing + automated quota tests
