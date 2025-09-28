#!/usr/bin/env node

/**
 * Script to check current Supabase project setup
 * Inspects tables, policies, and configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'NEED_TO_GET_FROM_DASHBOARD') {
  console.log('❌ Missing Supabase credentials');
  console.log('Current URL:', supabaseUrl);
  console.log('Current Key:', supabaseAnonKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseSetup() {
  console.log('🔍 Checking Supabase Project Setup');
  console.log('📡 URL:', supabaseUrl);
  console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
  console.log('');

  // Check if we can connect
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('⚠️  profiles table:', error.message);
    } else {
      console.log('✅ profiles table: Connected');
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }

  // Check existing tables
  console.log('\n📋 Checking Tables:');
  const tablesToCheck = [
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

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists (${data?.length || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  // Check auth configuration
  console.log('\n🔐 Checking Auth Configuration:');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Auth Status:', user ? 'User authenticated' : 'Not authenticated');
  } catch (err) {
    console.log('Auth check failed:', err.message);
  }

  // Check app settings if table exists
  console.log('\n⚙️  Checking App Settings:');
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.log('❌ Could not read app_settings:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ App Settings:');
      data.forEach(setting => {
        console.log(`   ${setting.setting_key}:`, setting.setting_value);
      });
    } else {
      console.log('📝 No app settings configured yet');
    }
  } catch (err) {
    console.log('❌ App settings check failed:', err.message);
  }

  console.log('\n✅ Setup check complete!');
}

checkSupabaseSetup().catch(console.error);