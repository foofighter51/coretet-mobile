import MockAudioUploadService from '../src/utils/mockAudioUpload.js';

async function testMockUpload() {
  console.log('🧪 Testing mock upload service...');

  // Track progress
  const progressUpdates = [];
  const onProgress = (progress) => {
    progressUpdates.push(progress);
    console.log(`📊 ${progress.stage}: ${progress.progress}% - ${progress.message}`);
  };

  const mockService = new MockAudioUploadService(onProgress);

  try {
    // Create a fake audio file for testing
    const testFile = new File(['fake audio data'], 'test-song.mp3', { type: 'audio/mpeg' });

    console.log('\n🎵 Testing single file upload...');
    const result = await mockService.uploadAudio(testFile, {
      targetVolume: 0.7,
      maxBitrate: 192
    });

    console.log('\n✅ Upload completed successfully!');
    console.log('📋 Result:', {
      versionId: result.versionId,
      fileUrl: result.fileUrl,
      compressionSavings: result.compressionSavings
    });

    console.log('\n📈 Progress stages captured:', progressUpdates.length);
    progressUpdates.forEach((update, index) => {
      console.log(`  ${index + 1}. ${update.stage} (${update.progress}%): ${update.message}`);
    });

    console.log('\n🎯 Mock upload test successful!');

  } catch (error) {
    console.error('❌ Mock upload test failed:', error.message);
  }
}

testMockUpload().catch(console.error);