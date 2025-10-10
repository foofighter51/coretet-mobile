#!/usr/bin/env node

/**
 * Verify band system tables were created
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvvztlizyciaafqkigwe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kGPlEFvmSbgejlt7ulUPVg_qu8p-FlP';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
  console.log('🔍 Verifying band system tables...\n');

  try {
    // Try to query each table
    const { data: bands, error: bandsError } = await supabase.from('bands').select('id').limit(0);
    if (!bandsError) {
      console.log('✅ bands table exists');
    } else {
      console.log('❌ bands table error:', bandsError.message);
    }

    const { data: members, error: membersError } = await supabase.from('band_members').select('id').limit(0);
    if (!membersError) {
      console.log('✅ band_members table exists');
    } else {
      console.log('❌ band_members table error:', membersError.message);
    }

    const { data: invites, error: invitesError } = await supabase.from('band_invites').select('id').limit(0);
    if (!invitesError) {
      console.log('✅ band_invites table exists');
    } else {
      console.log('❌ band_invites table error:', invitesError.message);
    }

    // Check band_id columns exist
    const { data: tracks, error: tracksError } = await supabase.from('tracks').select('band_id').limit(0);
    if (!tracksError) {
      console.log('✅ tracks.band_id column exists');
    } else {
      console.log('❌ tracks.band_id error:', tracksError.message);
    }

    const { data: playlists, error: playlistsError } = await supabase.from('playlists').select('band_id').limit(0);
    if (!playlistsError) {
      console.log('✅ playlists.band_id column exists');
    } else {
      console.log('❌ playlists.band_id error:', playlistsError.message);
    }

    console.log('\n✨ Verification complete!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verify();
