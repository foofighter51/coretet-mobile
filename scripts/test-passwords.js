import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function tryCommonPasswords() {
  console.log('🔑 Trying common passwords for ericexley@gmail.com...');

  const passwords = ['NewPassword123!', 'Testuser1234', 'testpassword', 'password123', 'coretet123'];

  for (const pwd of passwords) {
    console.log('🔄 Trying password:', pwd);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ericexley@gmail.com',
        password: pwd
      });

      if (!error && data.user) {
        console.log('✅ SUCCESS! Working password is:', pwd);
        console.log('👤 User ID:', data.user.id);
        console.log('📧 Email confirmed:', Boolean(data.user.email_confirmed_at));
        return pwd;
      } else {
        console.log('❌', pwd, 'failed:', error?.message || 'Unknown error');
      }
    } catch (err) {
      console.log('💥 Exception with', pwd, ':', err.message);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('❌ None of the common passwords worked');
  return null;
}

tryCommonPasswords().catch(console.error);