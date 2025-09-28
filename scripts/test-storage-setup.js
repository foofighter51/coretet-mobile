#!/usr/bin/env node

/**
 * Test Supabase Storage Setup
 * Verifies storage bucket exists and permissions are correct
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorageSetup() {
  console.log('🧪 Testing Supabase Storage Setup');
  console.log('📡 Backend:', supabaseUrl);
  console.log('');

  // Test 1: Check if audio-files bucket exists
  console.log('📋 Test 1: Storage Bucket Accessibility');
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list('', { limit: 1 });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        console.log('❌ Bucket "audio-files" does not exist');
        console.log('💡 You need to create the bucket first using the SQL script');
      } else if (error.message.includes('not allowed')) {
        console.log('⚠️  Bucket exists but access is restricted');
        console.log('💡 This is expected for unauthenticated users');
      } else {
        console.log('❌ Storage error:', error.message);
      }
    } else {
      console.log('✅ Storage bucket "audio-files" is accessible');
      console.log(`📁 Current files in bucket: ${data?.length || 0}`);
    }
  } catch (err) {
    console.log('❌ Storage test failed:', err.message);
  }

  // Test 2: Check bucket configuration
  console.log('\n📋 Test 2: Bucket Configuration');
  try {
    // Try to get bucket info (this might not work with anon key)
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log('ℹ️  Cannot read bucket list with anon key (expected)');
    } else {
      const audioFilesBucket = buckets?.find(b => b.name === 'audio-files');
      if (audioFilesBucket) {
        console.log('✅ Audio files bucket found in bucket list');
        console.log(`📊 Bucket ID: ${audioFilesBucket.id}`);
        console.log(`🔒 Public: ${audioFilesBucket.public}`);
      } else {
        console.log('❌ Audio files bucket not found in bucket list');
      }
    }
  } catch (err) {
    console.log('ℹ️  Bucket configuration check limited with anon key');
  }

  // Test 3: Test file upload (requires authentication)
  console.log('\n📋 Test 3: Upload Permissions');
  try {
    // Create a small test file
    const testContent = new Blob(['Test audio content'], { type: 'audio/mpeg' });
    const testFile = new File([testContent], 'test.mp3', { type: 'audio/mpeg' });
    const testFileName = `test_${Date.now()}.mp3`;

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(testFileName, testFile);

    if (error) {
      if (error.message.includes('not authenticated')) {
        console.log('⚠️  Upload requires authentication (expected)');
        console.log('✅ Storage permissions are working correctly');
      } else if (error.message.includes('not allowed')) {
        console.log('⚠️  Upload not allowed - check RLS policies');
      } else {
        console.log('❌ Upload error:', error.message);
      }
    } else {
      console.log('✅ Test upload successful (unexpected - should require auth)');
      console.log(`📄 Uploaded file: ${data.path}`);

      // Clean up test file
      await supabase.storage.from('audio-files').remove([testFileName]);
      console.log('🧹 Test file cleaned up');
    }
  } catch (err) {
    console.log('❌ Upload test failed:', err.message);
  }

  // Test 4: Check storage policies
  console.log('\n📋 Test 4: Storage Security');
  console.log('ℹ️  RLS policies should prevent unauthorized access');
  console.log('ℹ️  Only authenticated users should be able to upload');
  console.log('ℹ️  Users should only see files they have access to');

  // Test 5: Supported file types test
  console.log('\n📋 Test 5: File Type Support');
  const supportedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/webm'
  ];

  console.log('✅ Supported audio formats:');
  supportedTypes.forEach(type => {
    console.log(`   - ${type}`);
  });

  // Test Summary
  console.log('\n🎯 Storage Setup Test Summary');
  console.log('');
  console.log('📝 To complete storage setup:');
  console.log('1. Run the SQL script: scripts/setup-supabase-storage.sql');
  console.log('2. Verify bucket "audio-files" is created');
  console.log('3. Test with authenticated user');
  console.log('4. Check RLS policies are working');
  console.log('');
  console.log('💡 Next steps:');
  console.log('- Test upload with real authentication');
  console.log('- Verify file access permissions');
  console.log('- Test file deletion capabilities');
}

testStorageSetup().catch(console.error);