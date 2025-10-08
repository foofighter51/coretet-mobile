import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvvztlizyciaafqkigwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dnp0bGl6eWNpYWFmcWtpZ3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjM2MzcsImV4cCI6MjA3NDQ5OTYzN30.fagEaJdGnM2EGGr5MlXtYrak_KPNt_y6BJhczgo8Eeo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRLS() {
  console.log('Testing track insert with current RLS...');

  // Try to insert a test track
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      created_by: 'test-user',
      title: 'Test Track',
      file_url: 'https://example.com/test.mp3',
      file_size: 1000,
      duration_seconds: 180
    })
    .select();

  if (error) {
    console.error('❌ Insert failed:', error.message);
    console.log('This confirms RLS is blocking inserts.');
    console.log('\nPlease run this SQL in Supabase Dashboard > SQL Editor:');
    console.log('ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;');
  } else {
    console.log('✅ Insert succeeded:', data);
    // Clean up test data
    if (data && data[0]) {
      await supabase.from('tracks').delete().eq('id', data[0].id);
      console.log('Test track cleaned up');
    }
  }
}

fixRLS();
