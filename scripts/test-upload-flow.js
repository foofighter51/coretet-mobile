import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testUploadFlow() {
  console.log('🧪 Testing complete upload flow...');

  try {
    // Test 1: Check storage bucket access
    console.log('\n📁 Testing storage bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.log('❌ Bucket access error:', bucketError.message);
    } else {
      console.log('✅ Storage buckets accessible:', buckets.map(b => b.name));

      // Check if audio-files bucket exists
      const audioFilesBucket = buckets.find(b => b.name === 'audio-files');
      if (audioFilesBucket) {
        console.log('✅ audio-files bucket found');
      } else {
        console.log('❌ audio-files bucket not found');
      }
    }

    // Test 2: Test file upload permissions
    console.log('\n📤 Testing file upload permissions...');
    const testFile = new Blob(['test audio data'], { type: 'audio/mpeg' });
    const fileName = `test-${Date.now()}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(`test/${fileName}`, testFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.log('❌ Upload error:', uploadError.message);
    } else {
      console.log('✅ File uploaded successfully:', uploadData.path);

      // Test getting signed URL
      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from('audio-files')
        .createSignedUrl(`test/${fileName}`, 3600);

      if (signedError) {
        console.log('❌ Signed URL error:', signedError.message);
      } else {
        console.log('✅ Signed URL created successfully');
      }

      // Clean up test file
      await supabase.storage
        .from('audio-files')
        .remove([`test/${fileName}`]);
      console.log('🧹 Test file cleaned up');
    }

    // Test 3: Test versions table insert
    console.log('\n💾 Testing versions table insert...');
    const testVersion = {
      title: 'Test Upload',
      file_url: 'https://example.com/test.mp3',
      file_size: 1024,
      duration_seconds: 30,
      version_type: 'other',
      uploaded_by: '12345678-1234-1234-1234-123456789012', // Test UUID
    };

    const { data: versionData, error: versionError } = await supabase
      .from('versions')
      .insert(testVersion)
      .select()
      .single();

    if (versionError) {
      console.log('❌ Versions insert error:', versionError.message);
      console.log('❌ Error details:', versionError);
    } else {
      console.log('✅ Version record created successfully:', versionData.id);

      // Clean up test version
      await supabase
        .from('versions')
        .delete()
        .eq('id', versionData.id);
      console.log('🧹 Test version cleaned up');
    }

    console.log('\n🎯 Upload flow test complete!');

  } catch (error) {
    console.log('💥 Unexpected error:', error.message);
  }
}

testUploadFlow().catch(console.error);