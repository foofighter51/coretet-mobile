/**
 * Integration Tests for Storage Quota System
 *
 * IMPORTANT: These tests run against a REAL database
 * Run against a TEST/STAGING environment, NOT production
 *
 * Usage:
 * 1. Set SUPABASE_TEST_USER_ID environment variable
 * 2. Run: npm run test:integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase, db, storage } from '../../lib/supabase';
import { AudioUploadService } from '../../src/utils/audioUploadService';
import AudioProcessor from '../../src/utils/audioProcessor';

const TEST_USER_ID = process.env.SUPABASE_TEST_USER_ID;

if (!TEST_USER_ID) {
  console.error('⚠️ SUPABASE_TEST_USER_ID not set. Skipping integration tests.');
  process.exit(0);
}

describe('Storage Quota Integration Tests', () => {
  let uploadedTrackIds: string[] = [];
  let originalStorageUsed: number;
  let testUser: any;

  beforeAll(async () => {
    // Fetch test user profile
    const { data: profile } = await db.profiles.getById(TEST_USER_ID);
    testUser = profile;
    originalStorageUsed = profile?.storage_used || 0;

    console.log('📊 Test user storage:', {
      used: AudioProcessor.formatFileSize(originalStorageUsed),
      limit: AudioProcessor.formatFileSize(profile?.storage_limit || 0),
    });
  });

  afterAll(async () => {
    // Cleanup: Delete all uploaded test tracks
    console.log(`🧹 Cleaning up ${uploadedTrackIds.length} test tracks...`);

    for (const trackId of uploadedTrackIds) {
      try {
        await AudioUploadService.deleteAudio(trackId);
        console.log(`  ✅ Deleted track ${trackId}`);
      } catch (error) {
        console.error(`  ❌ Failed to delete track ${trackId}:`, error);
      }
    }

    // Verify quota returned to original value
    const { data: finalProfile } = await db.profiles.getById(TEST_USER_ID);
    const finalStorageUsed = finalProfile?.storage_used || 0;

    console.log('📊 Final storage:', {
      original: AudioProcessor.formatFileSize(originalStorageUsed),
      final: AudioProcessor.formatFileSize(finalStorageUsed),
      diff: AudioProcessor.formatFileSize(finalStorageUsed - originalStorageUsed),
    });

    expect(finalStorageUsed).toBe(originalStorageUsed);
  });

  /**
   * INTEGRATION TEST #1: Full Upload Flow with Quota
   */
  it('should upload file and increment quota correctly', async () => {
    // Create a small test audio file (1MB)
    const testAudioData = new ArrayBuffer(1 * 1024 * 1024);
    const testFile = new File([testAudioData], 'integration-test.mp3', {
      type: 'audio/mpeg',
    });

    const progressLogs: string[] = [];
    const service = new AudioUploadService(
      (progress) => {
        progressLogs.push(`[${progress.stage}] ${progress.message}`);
      },
      {
        id: TEST_USER_ID,
        email: testUser.email,
        phoneNumber: testUser.phone_number || '',
        name: testUser.name || 'Test User',
      }
    );

    // Get storage before upload
    const { data: profileBefore } = await db.profiles.getById(TEST_USER_ID);
    const storageBefore = profileBefore?.storage_used || 0;

    // Perform upload
    const result = await service.uploadAudio(testFile, {
      title: 'Integration Test Track',
    });

    // Track for cleanup
    uploadedTrackIds.push(result.trackId);

    // Verify upload result
    expect(result.trackId).toBeDefined();
    expect(result.fileUrl).toBeDefined();
    expect(result.metadata).toBeDefined();

    // Verify quota was incremented
    const { data: profileAfter } = await db.profiles.getById(TEST_USER_ID);
    const storageAfter = profileAfter?.storage_used || 0;

    const expectedIncrease = testFile.size;
    const actualIncrease = storageAfter - storageBefore;

    console.log('📊 Quota increment:', {
      before: AudioProcessor.formatFileSize(storageBefore),
      after: AudioProcessor.formatFileSize(storageAfter),
      expected: AudioProcessor.formatFileSize(expectedIncrease),
      actual: AudioProcessor.formatFileSize(actualIncrease),
    });

    expect(actualIncrease).toBe(expectedIncrease);

    // Verify progress callbacks were triggered
    expect(progressLogs).toContainEqual(expect.stringContaining('Checking storage quota'));
    expect(progressLogs).toContainEqual(expect.stringContaining('Quota check passed'));
    expect(progressLogs).toContainEqual(expect.stringContaining('Updating storage quota'));
    expect(progressLogs).toContainEqual(expect.stringContaining('Upload successful'));
  });

  /**
   * INTEGRATION TEST #2: Quota Exceeded Prevention
   */
  it('should reject upload when quota would be exceeded', async () => {
    // Get current quota
    const { data: profile } = await db.profiles.getById(TEST_USER_ID);
    const currentUsed = profile?.storage_used || 0;
    const limit = profile?.storage_limit || 1073741824;

    // Create file larger than remaining quota
    const remainingSpace = limit - currentUsed;
    const tooLargeFileSize = remainingSpace + (10 * 1024 * 1024); // +10MB over limit

    const tooLargeFile = new File(
      [new ArrayBuffer(tooLargeFileSize)],
      'too-large.mp3',
      { type: 'audio/mpeg' }
    );

    const service = new AudioUploadService(undefined, {
      id: TEST_USER_ID,
      email: testUser.email,
      phoneNumber: testUser.phone_number || '',
      name: testUser.name || 'Test User',
    });

    // Attempt upload - should be rejected
    await expect(
      service.uploadAudio(tooLargeFile, { title: 'Too Large' })
    ).rejects.toThrow(/Storage quota exceeded/);

    // Verify quota unchanged
    const { data: profileAfter } = await db.profiles.getById(TEST_USER_ID);
    expect(profileAfter?.storage_used).toBe(currentUsed);
  });

  /**
   * INTEGRATION TEST #3: Delete Flow with Quota Decrement
   */
  it('should delete file and decrement quota correctly', async () => {
    // First upload a file
    const testFile = new File(
      [new ArrayBuffer(2 * 1024 * 1024)], // 2MB
      'delete-test.mp3',
      { type: 'audio/mpeg' }
    );

    const service = new AudioUploadService(undefined, {
      id: TEST_USER_ID,
      email: testUser.email,
      phoneNumber: testUser.phone_number || '',
      name: testUser.name || 'Test User',
    });

    const uploadResult = await service.uploadAudio(testFile, {
      title: 'Delete Test Track',
    });

    const trackId = uploadResult.trackId;

    // Get quota after upload
    const { data: profileAfterUpload } = await db.profiles.getById(TEST_USER_ID);
    const storageAfterUpload = profileAfterUpload?.storage_used || 0;

    // Delete the track
    await AudioUploadService.deleteAudio(trackId);

    // Get quota after delete
    const { data: profileAfterDelete } = await db.profiles.getById(TEST_USER_ID);
    const storageAfterDelete = profileAfterDelete?.storage_used || 0;

    // Verify quota was decremented by file size
    const expectedDecrease = testFile.size;
    const actualDecrease = storageAfterUpload - storageAfterDelete;

    console.log('📊 Quota decrement:', {
      afterUpload: AudioProcessor.formatFileSize(storageAfterUpload),
      afterDelete: AudioProcessor.formatFileSize(storageAfterDelete),
      expected: AudioProcessor.formatFileSize(expectedDecrease),
      actual: AudioProcessor.formatFileSize(actualDecrease),
    });

    expect(actualDecrease).toBe(expectedDecrease);

    // Verify track no longer exists in database
    const { data: deletedTrack } = await db.tracks.getById(trackId);
    expect(deletedTrack).toBeNull();
  });

  /**
   * INTEGRATION TEST #4: Batch Upload with Mixed Results
   */
  it('should handle batch upload with both successes and failures', async () => {
    const files = [
      new File([new ArrayBuffer(512 * 1024)], 'batch1.mp3', {
        type: 'audio/mpeg',
      }), // 512KB
      new File([new ArrayBuffer(512 * 1024)], 'batch2.mp3', {
        type: 'audio/mpeg',
      }), // 512KB
      new File([new ArrayBuffer(512 * 1024)], 'batch3.mp3', {
        type: 'audio/mpeg',
      }), // 512KB
    ];

    const service = new AudioUploadService(undefined, {
      id: TEST_USER_ID,
      email: testUser.email,
      phoneNumber: testUser.phone_number || '',
      name: testUser.name || 'Test User',
    });

    const storageBefore = (await db.profiles.getById(TEST_USER_ID)).data
      ?.storage_used || 0;

    const result = await service.uploadMultipleAudios(files);

    // Track successful uploads for cleanup
    uploadedTrackIds.push(...result.successful.map((r) => r.trackId));

    // Verify return structure
    expect(result).toHaveProperty('successful');
    expect(result).toHaveProperty('failed');
    expect(Array.isArray(result.successful)).toBe(true);
    expect(Array.isArray(result.failed)).toBe(true);

    // At least some should succeed (assuming quota is available)
    expect(result.successful.length).toBeGreaterThan(0);

    // Verify quota increased by total size of successful uploads
    const storageAfter = (await db.profiles.getById(TEST_USER_ID)).data
      ?.storage_used || 0;
    const totalSuccessfulSize = result.successful.length * (512 * 1024);
    const actualIncrease = storageAfter - storageBefore;

    console.log('📊 Batch upload quota:', {
      before: AudioProcessor.formatFileSize(storageBefore),
      after: AudioProcessor.formatFileSize(storageAfter),
      expected: AudioProcessor.formatFileSize(totalSuccessfulSize),
      actual: AudioProcessor.formatFileSize(actualIncrease),
      successful: result.successful.length,
      failed: result.failed.length,
    });

    expect(actualIncrease).toBe(totalSuccessfulSize);
  });

  /**
   * INTEGRATION TEST #5: File Path Extraction from Real URLs
   */
  it('should correctly extract file path from various URL formats', async () => {
    // Upload a file to get real URLs
    const testFile = new File(
      [new ArrayBuffer(256 * 1024)], // 256KB
      'url-test.mp3',
      { type: 'audio/mpeg' }
    );

    const service = new AudioUploadService(undefined, {
      id: TEST_USER_ID,
      email: testUser.email,
      phoneNumber: testUser.phone_number || '',
      name: testUser.name || 'Test User',
    });

    const uploadResult = await service.uploadAudio(testFile, {
      title: 'URL Path Test',
    });

    uploadedTrackIds.push(uploadResult.trackId);

    // Fetch track to see real URL format
    const { data: track } = await db.tracks.getById(uploadResult.trackId);

    console.log('🔗 Real file URL:', track?.file_url);

    // Verify URL is accessible
    expect(track?.file_url).toBeDefined();
    expect(track?.file_url).toContain('audio-files');
    expect(track?.file_url).toContain(TEST_USER_ID);

    // Delete should work with this real URL
    await AudioUploadService.deleteAudio(uploadResult.trackId);

    // Remove from cleanup list (already deleted)
    uploadedTrackIds = uploadedTrackIds.filter(
      (id) => id !== uploadResult.trackId
    );
  });

  /**
   * INTEGRATION TEST #6: Quota Calculation Accuracy
   */
  it('should maintain accurate quota across multiple operations', async () => {
    const operations = [
      { action: 'upload', size: 1 * 1024 * 1024 }, // +1MB
      { action: 'upload', size: 2 * 1024 * 1024 }, // +2MB
      { action: 'delete', trackIndex: 0 }, // -1MB
      { action: 'upload', size: 500 * 1024 }, // +500KB
      { action: 'delete', trackIndex: 1 }, // -2MB
    ];

    const service = new AudioUploadService(undefined, {
      id: TEST_USER_ID,
      email: testUser.email,
      phoneNumber: testUser.phone_number || '',
      name: testUser.name || 'Test User',
    });

    const startStorage = (await db.profiles.getById(TEST_USER_ID)).data
      ?.storage_used || 0;

    const tempTrackIds: string[] = [];
    let expectedStorage = startStorage;

    for (const op of operations) {
      if (op.action === 'upload') {
        const file = new File([new ArrayBuffer(op.size!)], 'test.mp3', {
          type: 'audio/mpeg',
        });
        const result = await service.uploadAudio(file, { title: 'Test' });
        tempTrackIds.push(result.trackId);
        uploadedTrackIds.push(result.trackId);
        expectedStorage += op.size!;
      } else if (op.action === 'delete') {
        const trackId = tempTrackIds[op.trackIndex!];
        const { data: track } = await db.tracks.getById(trackId);
        await AudioUploadService.deleteAudio(trackId);
        expectedStorage -= track?.file_size || 0;
        uploadedTrackIds = uploadedTrackIds.filter((id) => id !== trackId);
      }

      // Check quota after each operation
      const { data: profile } = await db.profiles.getById(TEST_USER_ID);
      const actualStorage = profile?.storage_used || 0;

      console.log(`📊 After ${op.action}:`, {
        expected: AudioProcessor.formatFileSize(expectedStorage),
        actual: AudioProcessor.formatFileSize(actualStorage),
        diff: actualStorage - expectedStorage,
      });

      expect(actualStorage).toBe(expectedStorage);
    }
  });
});
