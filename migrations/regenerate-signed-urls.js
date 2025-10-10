/**
 * Regenerate Signed URLs for Migrated Tracks
 *
 * After moving files, we need to update signed URLs in the database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET_NAME = 'audio-files';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function regenerateSignedUrls() {
  console.log('🔄 Regenerating signed URLs for all tracks...\n');

  // Get all tracks
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, title, file_url')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch tracks:', error);
    process.exit(1);
  }

  console.log(`Found ${tracks.length} tracks\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    console.log(`[${i + 1}/${tracks.length}] ${track.title}`);

    try {
      // Extract path (remove any existing signed URL parts)
      let path = track.file_url;
      path = path.replace(/^.*\/storage\/v1\/object\/(public|sign)\/audio-files\//, '');
      path = path.replace(/\?.*$/, '');

      console.log(`  Path: ${path}`);

      // Generate new signed URL (1 year expiry)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, 31536000);

      if (signedError) {
        console.error(`  ❌ Failed to generate signed URL:`, signedError.message);
        failCount++;
        continue;
      }

      // Update database
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ file_url: signedData.signedUrl })
        .eq('id', track.id);

      if (updateError) {
        console.error(`  ❌ Failed to update database:`, updateError.message);
        failCount++;
        continue;
      }

      successCount++;
      console.log(`  ✅ Updated`);

    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(60));
}

regenerateSignedUrls()
  .then(() => {
    console.log('\n✨ Signed URLs regenerated');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Failed:', err);
    process.exit(1);
  });
