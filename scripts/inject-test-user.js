import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function injectTestUser() {
  console.log('🧪 Injecting test user directly into Supabase...');

  const testUser = {
    email: 'ericexley@gmail.com',
    password: 'TestPassword123!'
  };

  try {
    // Try to create the user
    console.log('👤 Creating user:', testUser.email);

    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true // Skip email confirmation
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  User already exists, updating password...');

        // Try to update existing user's password
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          data?.user?.id || 'unknown',
          { password: testUser.password }
        );

        if (updateError) {
          console.log('❌ Password update failed:', updateError.message);
          console.log('🔄 Trying alternative approach - sign up with force...');

          // Alternative: Just try normal signup
          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testUser.email,
            password: testUser.password
          });

          if (!signupError) {
            console.log('✅ User created/updated via signup');
            console.log('👤 User ID:', signupData.user?.id);
          } else {
            console.log('❌ Signup also failed:', signupError.message);
          }
        } else {
          console.log('✅ Password updated successfully');
        }
      } else {
        console.log('❌ User creation failed:', error.message);
      }
    } else {
      console.log('✅ User created successfully!');
      console.log('👤 User ID:', data.user?.id);
      console.log('📧 Email:', data.user?.email);
      console.log('✉️  Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    }

    // Now create/update profile
    console.log('📝 Creating/updating user profile...');

    const profileData = {
      id: data?.user?.id || 'test-user-id',
      name: 'Eric Exley',
      phone_number: testUser.email, // Using email as phone_number since it's required
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData);

    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
    } else {
      console.log('✅ Profile created/updated successfully');
    }

    console.log('\n🎉 Test user setup complete!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('\nYou can now sign in with these credentials in the app.');

  } catch (err) {
    console.log('💥 Unexpected error:', err.message);
  }
}

injectTestUser().catch(console.error);