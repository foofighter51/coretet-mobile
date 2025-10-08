import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvvztlizyciaafqkigwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dnp0bGl6eWNpYWFmcWtpZ3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjM2MzcsImV4cCI6MjA3NDQ5OTYzN30.fagEaJdGnM2EGGr5MlXtYrak_KPNt_y6BJhczgo8Eeo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profiles in database:', data);
    console.log(`Total profiles: ${data.length}`);
  }
}

checkProfiles();
