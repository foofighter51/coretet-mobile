import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function clearAllUsers() {
  console.log('🧹 Clearing all users and profiles from Supabase...');

  try {
    // First, get all profiles and delete them individually
    console.log('📝 Getting all profiles...');
    const { data: profiles, error: getProfilesError } = await supabase
      .from('profiles')
      .select('id');

    if (getProfilesError) {
      console.log('❌ Failed to get profiles:', getProfilesError.message);
    } else {
      console.log(`📝 Found ${profiles?.length || 0} profiles`);

      if (profiles && profiles.length > 0) {
        for (const profile of profiles) {
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id);

          if (deleteError) {
            console.log(`❌ Failed to delete profile ${profile.id}:`, deleteError.message);
          } else {
            console.log(`✅ Deleted profile ${profile.id}`);
          }
        }
      }
    }

    // Get all user access control entries and delete them
    console.log('🔐 Getting all user_access_control entries...');
    const { data: accessEntries, error: getAccessError } = await supabase
      .from('user_access_control')
      .select('id');

    if (getAccessError) {
      console.log('❌ Failed to get user_access_control:', getAccessError.message);
    } else {
      console.log(`🔐 Found ${accessEntries?.length || 0} access control entries`);

      if (accessEntries && accessEntries.length > 0) {
        for (const entry of accessEntries) {
          const { error: deleteError } = await supabase
            .from('user_access_control')
            .delete()
            .eq('id', entry.id);

          if (deleteError) {
            console.log(`❌ Failed to delete access entry ${entry.id}:`, deleteError.message);
          } else {
            console.log(`✅ Deleted access entry ${entry.id}`);
          }
        }
      }
    }

    // Note: We cannot delete auth.users with anon key, but clearing related tables should help
    console.log('ℹ️  Note: Cannot delete auth.users with anon key, but related tables are cleared');

    console.log('\n🎉 Database cleanup complete!');
    console.log('💡 You may need to manually delete users in Supabase Dashboard > Authentication > Users');
    console.log('🔗 https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe/auth/users');

  } catch (err) {
    console.log('💥 Unexpected error:', err.message);
  }
}

clearAllUsers().catch(console.error);