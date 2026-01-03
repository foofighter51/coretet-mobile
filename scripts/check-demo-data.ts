import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvvztlizyciaafqkigwe.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkData() {
  const DEMO_EMAIL = 'demo@coretet.app';

  // Get user
  const { data: users } = await supabase.auth.admin.listUsers();
  const demoUser = users?.users?.find(u => u.email === DEMO_EMAIL);

  if (!demoUser) {
    console.log('❌ Demo user not found');
    return;
  }

  console.log('✅ Demo user:', demoUser.id);

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', demoUser.id)
    .single();

  console.log('Profile:', profile ? '✅ exists' : '❌ missing', profileError || '');

  // Check bands
  const { data: bands, error: bandsError } = await supabase
    .from('bands')
    .select('*')
    .eq('created_by', demoUser.id);

  console.log('Bands:', bands?.length || 0, bandsError || '');

  // Check set lists
  const { data: setLists, error: setListsError } = await supabase
    .from('set_lists')
    .select('*')
    .eq('created_by', demoUser.id);

  console.log('Set Lists:', setLists?.length || 0, setListsError || '');
  if (setLists && setLists.length > 0) {
    console.log('  Titles:', setLists.map(sl => sl.title));
  }

  // Check tracks
  const { data: tracks, error: tracksError } = await supabase
    .from('tracks')
    .select('*')
    .eq('created_by', demoUser.id);

  console.log('Tracks:', tracks?.length || 0, tracksError || '');
  if (tracks && tracks.length > 0) {
    console.log('  Titles:', tracks.slice(0, 5).map(t => t.title));
  }

  if (tracks && tracks.length > 0) {
    console.log('\nSample track:', tracks[0]);
  }
}

checkData();
