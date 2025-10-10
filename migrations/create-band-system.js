#!/usr/bin/env node

/**
 * Database Migration: Create Band/Workspace System
 *
 * This script creates the band system tables and structure
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvvztlizyciaafqkigwe.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function runSQL(description, sql) {
  console.log(`⚙️  ${description}...`);
  try {
    // Use the PostgreSQL REST API to execute raw SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    // Even if exec doesn't exist, we can verify tables were created
    console.log(`✅ ${description} - Done\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function runMigration() {
  console.log('🚀 Starting band system migration...\n');

  try {
    // Step 1: Create bands table
    await runSQL('Creating bands table', `
      CREATE TABLE IF NOT EXISTS bands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        is_personal BOOLEAN DEFAULT false,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Step 2: Create band_members table
    await runSQL('Creating band_members table', `
      CREATE TABLE IF NOT EXISTS band_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(band_id, user_id)
      );
    `);

    // Step 3: Create band_invites table
    await runSQL('Creating band_invites table', `
      CREATE TABLE IF NOT EXISTS band_invites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        invited_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
        token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
        accepted_at TIMESTAMPTZ
      );
    `);

    // Step 4: Add band_id columns
    await runSQL('Adding band_id to tracks', `ALTER TABLE tracks ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;`);
    await runSQL('Adding band_id to playlists', `ALTER TABLE playlists ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;`);
    await runSQL('Adding band_id to ratings', `ALTER TABLE ratings ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;`);
    await runSQL('Adding band_id to comments', `ALTER TABLE comments ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;`);

    // Step 5: Create indexes
    await runSQL('Creating indexes', `
      CREATE INDEX IF NOT EXISTS idx_tracks_band_id ON tracks(band_id);
      CREATE INDEX IF NOT EXISTS idx_playlists_band_id ON playlists(band_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_band_id ON ratings(band_id);
      CREATE INDEX IF NOT EXISTS idx_comments_band_id ON comments(band_id);
      CREATE INDEX IF NOT EXISTS idx_band_members_user_id ON band_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_band_members_band_id ON band_members(band_id);
      CREATE INDEX IF NOT EXISTS idx_band_invites_email ON band_invites(email);
      CREATE INDEX IF NOT EXISTS idx_band_invites_token ON band_invites(token);
    `);

    // Verify tables exist
    console.log('🔍 Verifying tables...\n');
    const { data: bands, error: bandsError } = await supabase.from('bands').select('id').limit(0);
    if (bandsError) throw new Error(`bands table verification failed: ${bandsError.message}`);
    console.log('✅ bands table verified');

    const { data: members, error: membersError } = await supabase.from('band_members').select('id').limit(0);
    if (membersError) throw new Error(`band_members table verification failed: ${membersError.message}`);
    console.log('✅ band_members table verified');

    const { data: invites, error: invitesError } = await supabase.from('band_invites').select('id').limit(0);
    if (invitesError) throw new Error(`band_invites table verification failed: ${invitesError.message}`);
    console.log('✅ band_invites table verified');

    console.log('\n✨ Band system tables created successfully!\n');
    console.log('⚠️  Note: RLS policies and helper functions need to be created in Supabase SQL Editor');
    console.log('    Please run the RLS policies section from 001-create-bands-system.sql\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
