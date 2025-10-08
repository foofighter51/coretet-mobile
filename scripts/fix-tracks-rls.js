// Quick script to disable RLS on tracks table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableTracksRLS() {
  console.log('Disabling RLS on tracks table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;'
  });

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✅ RLS disabled on tracks table');
}

disableTracksRLS();
