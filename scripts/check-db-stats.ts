/**
 * Quick script to check database statistics for MVP migration planning
 * Run with: npx tsx scripts/check-db-stats.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tvvztlizyciaafqkigwe.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY environment variable');
  console.log('💡 Please set it in your .env file');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function checkDatabaseStats() {
  console.log('📊 Checking CoreTet Database Statistics...\n');

  try {
    // Count tracks
    const { count: trackCount, error: trackError } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true });

    if (trackError) throw trackError;
    console.log(`✅ Total Tracks: ${trackCount || 0}`);

    // Count playlists
    const { count: playlistCount, error: playlistError } = await supabase
      .from('playlists')
      .select('*', { count: 'exact', head: true });

    if (playlistError) throw playlistError;
    console.log(`✅ Total Playlists: ${playlistCount || 0}`);

    // Count playlist items
    const { count: playlistItemCount, error: playlistItemError } = await supabase
      .from('playlist_items')
      .select('*', { count: 'exact', head: true });

    if (playlistItemError) throw playlistItemError;
    console.log(`✅ Total Playlist Items: ${playlistItemCount || 0}`);

    // Count comments
    const { count: commentCount, error: commentError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    if (commentError) throw commentError;
    console.log(`✅ Total Comments: ${commentCount || 0}`);

    // Count timestamped comments
    const { count: timestampedComments, error: timestampError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .not('timestamp_seconds', 'is', null);

    if (timestampError) throw timestampError;
    console.log(`✅ Timestamped Comments: ${timestampedComments || 0}`);

    // Count track ratings
    const { count: ratingCount, error: ratingError } = await supabase
      .from('track_ratings')
      .select('*', { count: 'exact', head: true });

    if (ratingError) throw ratingError;
    console.log(`✅ Total Track Ratings: ${ratingCount || 0}`);

    // Count bands
    const { count: bandCount, error: bandError } = await supabase
      .from('bands')
      .select('*', { count: 'exact', head: true });

    if (bandError) throw bandError;
    console.log(`✅ Total Bands: ${bandCount || 0}`);

    // Count users
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;
    console.log(`✅ Total Users: ${userCount || 0}`);

    // Sample track data
    const { data: sampleTracks, error: sampleError } = await supabase
      .from('tracks')
      .select('id, title, band_id, created_at')
      .limit(5);

    if (sampleError) throw sampleError;
    console.log(`\n📝 Sample Tracks:`);
    sampleTracks?.forEach((track, i) => {
      console.log(`  ${i + 1}. "${track.title}" (${track.id.substring(0, 8)}...)`);
    });

    // Check for version-like patterns in track titles
    const { data: versionTracks, error: versionError } = await supabase
      .from('tracks')
      .select('title')
      .or('title.ilike.%version%,title.ilike.%v2%,title.ilike.%v3%,title.ilike.%v4%');

    if (versionError) throw versionError;
    console.log(`\n🔍 Tracks with version-like names: ${versionTracks?.length || 0}`);
    if (versionTracks && versionTracks.length > 0) {
      versionTracks.slice(0, 5).forEach(track => {
        console.log(`  - "${track.title}"`);
      });
    }

    // Sample playlist data
    const { data: samplePlaylists, error: playlistSampleError } = await supabase
      .from('playlists')
      .select('id, title, band_id')
      .limit(3);

    if (playlistSampleError) throw playlistSampleError;
    console.log(`\n📋 Sample Playlists:`);
    samplePlaylists?.forEach((playlist, i) => {
      console.log(`  ${i + 1}. "${playlist.title}" (${playlist.id.substring(0, 8)}...)`);
    });

    console.log('\n✅ Database check complete!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabaseStats();
