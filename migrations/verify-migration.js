#!/usr/bin/env node

/**
 * Verify band system migration completed successfully
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvvztlizyciaafqkigwe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kGPlEFvmSbgejlt7ulUPVg_qu8p-FlP';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
  console.log('🔍 Verifying band system migration...\n');

  try {
    // Check Bedeker band exists
    const { data: bands, error: bandsError } = await supabase
      .from('bands')
      .select('*')
      .eq('name', 'Bedeker');

    if (bandsError) {
      console.log('❌ Error querying bands:', bandsError.message);
    } else if (bands && bands.length > 0) {
      console.log('✅ Bedeker band created:', bands[0].id);
      const bandId = bands[0].id;

      // Check band members
      const { data: members, error: membersError } = await supabase
        .from('band_members')
        .select('*')
        .eq('band_id', bandId);

      if (!membersError && members) {
        console.log(`✅ Band has ${members.length} member(s)`);
        members.forEach(m => console.log(`   - User ${m.user_id} (${m.role})`));
      }

      // Check migrated tracks
      const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select('id, title, band_id')
        .eq('band_id', bandId);

      if (!tracksError && tracks) {
        console.log(`✅ ${tracks.length} tracks migrated to Bedeker`);
      }

      // Check migrated playlists
      const { data: playlists, error: playlistsError } = await supabase
        .from('playlists')
        .select('id, name, band_id')
        .eq('band_id', bandId);

      if (!playlistsError && playlists) {
        console.log(`✅ ${playlists.length} playlists migrated to Bedeker`);
      }

    } else {
      console.log('❌ Bedeker band not found');
    }

    console.log('\n✨ Verification complete!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verify();
