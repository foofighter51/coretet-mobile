#!/usr/bin/env node

/**
 * Direct schema check using information_schema
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchemaDirectly() {
  console.log('🔍 Direct Schema Check');
  console.log('');

  // Query information_schema to see all tables
  const { data, error } = await supabase.rpc('get_tables_info');

  if (error) {
    console.log('❌ Could not query schema directly:', error.message);
    console.log('ℹ️  This is expected - using alternative method...');

    // Alternative: try to select from each table with LIMIT 0
    const tables = [
      'profiles',
      'user_access_control',
      'app_settings',
      'ensembles',
      'ensemble_members',
      'songs',
      'versions',
      'ratings',
      'comments'
    ];

    console.log('\n📋 Testing Table Access:');
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
  } else {
    console.log('✅ Tables found:', data);
  }

  console.log('\n✅ Direct schema check complete!');
}

checkSchemaDirectly().catch(console.error);