/**
 * Track File Migration Script
 *
 * Reorganizes audio files from audio/* to {userId}/* structure
 *
 * Usage:
 *   1. Set environment variables (or edit script with your keys)
 *   2. Run: node migrations/run-migration.js
 *   3. Add --dry-run flag to test without making changes
 *   4. Add --limit=5 to test on just 5 tracks first
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY';
const BUCKET_NAME = 'audio-files';

// Parse command line args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

// Initialize Supabase client with service role key (has admin permissions)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Main migration function
 */
async function migrateTrackFiles() {
  console.log('🚀 Starting track file migration...');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no changes will be made)' : '✏️  LIVE (files will be moved)'}`);
  if (limit) console.log(`Limit: Processing ${limit} tracks`);
  console.log('');

  // Step 1: Get all tracks that need migration
  console.log('📊 Fetching tracks from database...');
  let query = supabase
    .from('tracks')
    .select('id, title, created_by, file_url, created_at')
    .or('file_url.like.audio/%,file_url.like.%/audio/%') // Match old structure
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: tracks, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch tracks:', error);
    process.exit(1);
  }

  if (!tracks || tracks.length === 0) {
    console.log('✅ No tracks need migration!');
    return;
  }

  console.log(`Found ${tracks.length} tracks to migrate\n`);

  // Step 2: Process each track
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    console.log(`\n[${i + 1}/${tracks.length}] Processing: ${track.title}`);
    console.log(`  Track ID: ${track.id}`);
    console.log(`  User ID: ${track.created_by}`);

    try {
      // Extract old path from file_url
      // Handle both raw paths and signed URLs
      let oldPath = track.file_url;

      // Remove any URL prefix (signed URLs have full domain)
      oldPath = oldPath.replace(/^.*\/storage\/v1\/object\/(public|sign)\/audio-files\//, '');
      // Remove query parameters (signed URL tokens)
      oldPath = oldPath.replace(/\?.*$/, '');

      console.log(`  Old path: ${oldPath}`);

      // Check if already migrated
      if (!oldPath.startsWith('audio/')) {
        console.log(`  ⏭️  Skipped: Already in user folder`);
        skippedCount++;
        continue;
      }

      // Generate new path: {userId}/{filename}
      const filename = oldPath.replace(/^audio\//, '');
      const newPath = `${track.created_by}/${filename}`;

      console.log(`  New path: ${newPath}`);

      if (isDryRun) {
        console.log(`  🔍 DRY RUN: Would move to ${newPath}`);
        successCount++;
        continue;
      }

      // Step 2a: Copy file to new location
      console.log(`  📋 Copying file...`);
      const { data: copyData, error: copyError } = await supabase.storage
        .from(BUCKET_NAME)
        .copy(oldPath, newPath);

      if (copyError) {
        console.error(`  ❌ Copy failed:`, copyError.message);
        failCount++;
        continue;
      }

      console.log(`  ✅ File copied successfully`);

      // Step 2b: Update database with new path
      console.log(`  💾 Updating database...`);
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ file_url: newPath })
        .eq('id', track.id);

      if (updateError) {
        console.error(`  ❌ Database update failed:`, updateError.message);
        // Try to cleanup copied file
        await supabase.storage.from(BUCKET_NAME).remove([newPath]);
        failCount++;
        continue;
      }

      console.log(`  ✅ Database updated`);

      // Step 2c: Delete old file
      console.log(`  🗑️  Deleting old file...`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([oldPath]);

      if (deleteError) {
        console.warn(`  ⚠️  Failed to delete old file (not critical):`, deleteError.message);
        // Don't count as failure since migration succeeded
      } else {
        console.log(`  ✅ Old file deleted`);
      }

      successCount++;
      console.log(`  ✅ Track migrated successfully!`);

    } catch (err) {
      console.error(`  ❌ Unexpected error:`, err.message);
      failCount++;
    }
  }

  // Step 3: Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`📝 Total processed: ${tracks.length}`);
  console.log('='.repeat(60));

  if (isDryRun) {
    console.log('\n💡 This was a dry run. Run without --dry-run to perform actual migration.');
  }

  if (failCount > 0) {
    console.log('\n⚠️  Some tracks failed to migrate. Check errors above.');
    process.exit(1);
  }
}

// Run migration
console.log('');
migrateTrackFiles()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Migration script failed:', err);
    process.exit(1);
  });
