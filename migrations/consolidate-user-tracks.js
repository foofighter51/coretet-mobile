/**
 * Consolidate User Tracks Script
 *
 * Moves all tracks from multiple user IDs to a single primary user ID
 *
 * Use case: When a user has tracks under different IDs due to auth changes
 *
 * Usage:
 *   1. Set PRIMARY_USER_ID below to your main account ID
 *   2. Add user IDs to OLD_USER_IDS array (accounts to consolidate FROM)
 *   3. Run with --dry-run first to preview changes
 *   4. Run without --dry-run to perform consolidation
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET_NAME = 'audio-files';

// CONFIGURE THESE:
const PRIMARY_USER_ID = '506e6736-a353-4ecc-8084-bf68a082e5fb'; // Keep tracks under this ID (150 tracks)
const OLD_USER_IDS = [
  '6ec6442d-8a5b-4538-a798-8aba96cacf4e',  // 3 tracks (your old account)
  'user_33OdQ0HmagKTBUvTGsJSITNpm0h'       // 15 tracks (your old account)
]; // Merge tracks FROM these IDs (only your old accounts, not other testers)

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function consolidateTracks() {
  console.log('🔀 Track Consolidation Script');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN' : '✏️  LIVE'}`);
  console.log(`Primary User: ${PRIMARY_USER_ID}`);
  console.log(`Merging from: ${OLD_USER_IDS.length} old user IDs\n`);

  let totalMoved = 0;
  let totalFailed = 0;

  for (const oldUserId of OLD_USER_IDS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing user: ${oldUserId}`);
    console.log('='.repeat(60));

    // Get tracks for this old user ID
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('id, title, file_url')
      .eq('created_by', oldUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`❌ Failed to fetch tracks: ${error.message}`);
      continue;
    }

    if (!tracks || tracks.length === 0) {
      console.log('No tracks found for this user');
      continue;
    }

    console.log(`Found ${tracks.length} tracks to move\n`);

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      console.log(`[${i + 1}/${tracks.length}] ${track.title}`);

      try {
        // Extract current path
        let oldPath = track.file_url;
        oldPath = oldPath.replace(/^.*\/storage\/v1\/object\/(public|sign)\/audio-files\//, '');
        oldPath = oldPath.replace(/\?.*$/, '');

        console.log(`  Old path: ${oldPath}`);

        // Generate new path under primary user
        const filename = oldPath.split('/').pop(); // Get just the filename
        const newPath = `${PRIMARY_USER_ID}/${filename}`;

        console.log(`  New path: ${newPath}`);

        if (isDryRun) {
          console.log(`  🔍 DRY RUN: Would move and update database`);
          totalMoved++;
          continue;
        }

        // Move file in storage
        console.log(`  📋 Moving file...`);
        const { error: copyError } = await supabase.storage
          .from(BUCKET_NAME)
          .copy(oldPath, newPath);

        if (copyError) {
          // File might already exist at destination, check if it's identical
          if (copyError.message.includes('already exists')) {
            console.log(`  ℹ️  File already exists at destination, skipping copy`);
          } else {
            console.error(`  ❌ Copy failed: ${copyError.message}`);
            totalFailed++;
            continue;
          }
        } else {
          console.log(`  ✅ File moved`);
        }

        // Update database
        console.log(`  💾 Updating database...`);
        const { error: updateError } = await supabase
          .from('tracks')
          .update({
            created_by: PRIMARY_USER_ID,
            file_url: newPath
          })
          .eq('id', track.id);

        if (updateError) {
          console.error(`  ❌ Database update failed: ${updateError.message}`);
          totalFailed++;
          continue;
        }

        console.log(`  ✅ Database updated`);

        // Delete old file (only if copy succeeded)
        if (!copyError) {
          console.log(`  🗑️  Deleting old file...`);
          const { error: deleteError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([oldPath]);

          if (deleteError) {
            console.warn(`  ⚠️  Failed to delete old file: ${deleteError.message}`);
          } else {
            console.log(`  ✅ Old file deleted`);
          }
        }

        totalMoved++;
        console.log(`  ✅ Track consolidated!`);

      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
        totalFailed++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Consolidation Summary');
  console.log('='.repeat(60));
  console.log(`✅ Tracks moved: ${totalMoved}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log('='.repeat(60));

  if (isDryRun) {
    console.log('\n💡 This was a dry run. Run without --dry-run to perform consolidation.');
  }

  // Show final counts
  if (!isDryRun) {
    console.log('\n📊 Verifying final state...');
    const { data: finalCounts } = await supabase
      .from('tracks')
      .select('created_by')
      .in('created_by', [PRIMARY_USER_ID, ...OLD_USER_IDS]);

    const counts = {};
    finalCounts?.forEach(track => {
      counts[track.created_by] = (counts[track.created_by] || 0) + 1;
    });

    console.log('\nTracks per user ID:');
    Object.entries(counts).forEach(([userId, count]) => {
      const isPrimary = userId === PRIMARY_USER_ID;
      console.log(`  ${isPrimary ? '✅' : '⚠️ '} ${userId}: ${count} tracks`);
    });
  }
}

consolidateTracks()
  .then(() => {
    console.log('\n✨ Consolidation complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Consolidation failed:', err);
    process.exit(1);
  });
