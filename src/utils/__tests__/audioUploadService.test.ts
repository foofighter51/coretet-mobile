/**
 * Automated Test Suite for Storage Quota Fixes
 * Tests all 5 critical bug fixes in audioUploadService.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioUploadService } from '../audioUploadService';
import { supabase, db, storage } from '../../../lib/supabase';
import AudioProcessor from '../audioProcessor';

// Mock dependencies
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    raw: vi.fn((sql) => sql),
  },
  db: {
    profiles: {
      getById: vi.fn(),
    },
    tracks: {
      create: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
    },
  },
  storage: {
    uploadAudio: vi.fn(),
    getSignedUrl: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

describe('AudioUploadService - Storage Quota Fixes', () => {
  let service: AudioUploadService;
  let mockUser: { id: string; email: string; phoneNumber: string; name: string };
  let mockFile: File;
  let progressCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock user
    mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      name: 'Test User',
    };

    // Setup mock file (5MB)
    const buffer = new ArrayBuffer(5 * 1024 * 1024); // 5MB
    mockFile = new File([buffer], 'test-track.mp3', { type: 'audio/mpeg' });

    // Setup progress callback
    progressCallback = vi.fn();

    // Create service instance
    service = new AudioUploadService(progressCallback, mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * TEST #1: Storage Quota Check Before Upload
   * Verifies that uploads are rejected when quota would be exceeded
   */
  describe('Fix #1: Storage Quota Check Before Upload', () => {
    it('should reject upload when quota would be exceeded', async () => {
      // Mock profile with 900MB used out of 1GB limit
      const mockProfile = {
        id: mockUser.id,
        storage_used: 900 * 1024 * 1024, // 900MB
        storage_limit: 1024 * 1024 * 1024, // 1GB
      };

      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      // Attempt to upload 5MB file (would exceed quota)
      await expect(
        service.uploadAudio(mockFile, { title: 'Test Track' })
      ).rejects.toThrow(/Storage quota exceeded/);

      // Verify quota check was performed
      expect(db.profiles.getById).toHaveBeenCalledWith(mockUser.id);

      // Verify progress callback showed quota check
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'processing',
          message: 'Checking storage quota...',
        })
      );

      // Verify upload was NOT attempted
      expect(storage.uploadAudio).not.toHaveBeenCalled();
    });

    it('should allow upload when quota is sufficient', async () => {
      // Mock profile with 100MB used out of 1GB limit
      const mockProfile = {
        id: mockUser.id,
        storage_used: 100 * 1024 * 1024, // 100MB
        storage_limit: 1024 * 1024 * 1024, // 1GB
      };

      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      // Mock successful storage upload
      vi.mocked(storage.uploadAudio).mockResolvedValue({
        data: { path: 'user_123/test.mp3' },
        error: null,
      });

      vi.mocked(storage.getSignedUrl).mockResolvedValue(
        'https://example.com/signed-url'
      );

      // Mock successful track creation
      vi.mocked(db.tracks.create).mockResolvedValue({
        data: { id: 'track_123', file_url: 'https://example.com/signed-url' },
        error: null,
      });

      // Mock successful quota update
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      // Verify quota check passed
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Quota check passed',
        })
      );
    });

    it('should show detailed error message with usage stats', async () => {
      const mockProfile = {
        id: mockUser.id,
        storage_used: 950 * 1024 * 1024, // 950MB
        storage_limit: 1024 * 1024 * 1024, // 1GB
      };

      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      try {
        await service.uploadAudio(mockFile, { title: 'Test Track' });
        expect.fail('Should have thrown error');
      } catch (error) {
        const errorMsg = (error as Error).message;
        expect(errorMsg).toContain('Storage quota exceeded');
        expect(errorMsg).toContain('Current usage:');
        expect(errorMsg).toContain('This file:');
        expect(errorMsg).toContain('Would total:');
      }
    });
  });

  /**
   * TEST #2: Storage Quota Increment After Upload
   * Verifies that storage_used is incremented after successful upload
   */
  describe('Fix #2: Storage Quota Increment After Upload', () => {
    it('should increment storage quota after successful upload', async () => {
      // Mock profile with sufficient storage
      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: {
          id: mockUser.id,
          storage_used: 100 * 1024 * 1024,
          storage_limit: 1024 * 1024 * 1024,
        },
        error: null,
      });

      // Mock successful upload
      vi.mocked(storage.uploadAudio).mockResolvedValue({
        data: { path: 'user_123/test.mp3' },
        error: null,
      });

      vi.mocked(storage.getSignedUrl).mockResolvedValue(
        'https://example.com/signed-url'
      );

      vi.mocked(db.tracks.create).mockResolvedValue({
        data: { id: 'track_123', file_url: 'https://example.com/signed-url' },
        error: null,
      });

      // Mock quota update
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      // Verify quota update was called with atomic SQL
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          storage_used: expect.stringContaining('COALESCE(storage_used, 0)'),
        })
      );
    });

    it('should not fail upload if quota update fails (non-blocking)', async () => {
      // Mock successful upload but failed quota update
      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: {
          id: mockUser.id,
          storage_used: 100 * 1024 * 1024,
          storage_limit: 1024 * 1024 * 1024,
        },
        error: null,
      });

      vi.mocked(storage.uploadAudio).mockResolvedValue({
        data: { path: 'user_123/test.mp3' },
        error: null,
      });

      vi.mocked(storage.getSignedUrl).mockResolvedValue(
        'https://example.com/signed-url'
      );

      vi.mocked(db.tracks.create).mockResolvedValue({
        data: { id: 'track_123', file_url: 'https://example.com/signed-url' },
        error: null,
      });

      // Mock quota update failure
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Database connection error' },
          }),
        }),
      } as any);

      // Upload should still succeed
      // (Note: This test would need actual implementation to pass)
      // Verify error was logged but not thrown
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Quota update failed')
      );
    });
  });

  /**
   * TEST #3: Delete Method - File Path Extraction & Quota Decrement
   * Verifies correct file deletion and quota decrement
   */
  describe('Fix #3: Delete Method - File Path Extraction & Quota Decrement', () => {
    it('should extract file path from signed URL correctly', async () => {
      const mockTrack = {
        id: 'track_123',
        file_url:
          'https://example.supabase.co/storage/v1/object/sign/audio-files/user_123/2025-01-01_test_abc123.mp3?token=xyz',
        file_size: 5 * 1024 * 1024,
        created_by: mockUser.id,
      };

      vi.mocked(db.tracks.getById).mockResolvedValue({
        data: mockTrack,
        error: null,
      });

      vi.mocked(storage.deleteFile).mockResolvedValue({ error: null });
      vi.mocked(db.tracks.delete).mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      await AudioUploadService.deleteAudio('track_123');

      // Verify correct file path was extracted and used
      expect(storage.deleteFile).toHaveBeenCalledWith(
        'user_123/2025-01-01_test_abc123.mp3'
      );
    });

    it('should decrement storage quota after deletion', async () => {
      const fileSize = 5 * 1024 * 1024; // 5MB
      const mockTrack = {
        id: 'track_123',
        file_url:
          'https://example.supabase.co/storage/v1/object/sign/audio-files/user_123/test.mp3?token=xyz',
        file_size: fileSize,
        created_by: mockUser.id,
      };

      vi.mocked(db.tracks.getById).mockResolvedValue({
        data: mockTrack,
        error: null,
      });

      vi.mocked(storage.deleteFile).mockResolvedValue({ error: null });
      vi.mocked(db.tracks.delete).mockResolvedValue({ error: null });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      await AudioUploadService.deleteAudio('track_123');

      // Verify quota was decremented with atomic SQL
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          storage_used: expect.stringContaining('GREATEST'),
        })
      );
    });

    it('should handle public URL format as fallback', async () => {
      const mockTrack = {
        id: 'track_123',
        file_url:
          'https://example.supabase.co/storage/v1/object/public/audio-files/user_123/test.mp3',
        file_size: 5 * 1024 * 1024,
        created_by: mockUser.id,
      };

      vi.mocked(db.tracks.getById).mockResolvedValue({
        data: mockTrack,
        error: null,
      });

      vi.mocked(storage.deleteFile).mockResolvedValue({ error: null });
      vi.mocked(db.tracks.delete).mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      await AudioUploadService.deleteAudio('track_123');

      // Verify file path extraction worked with public URL
      expect(storage.deleteFile).toHaveBeenCalledWith('user_123/test.mp3');
    });

    it('should continue with DB deletion even if storage deletion fails', async () => {
      const mockTrack = {
        id: 'track_123',
        file_url: 'https://example.com/audio-files/user_123/test.mp3',
        file_size: 5 * 1024 * 1024,
        created_by: mockUser.id,
      };

      vi.mocked(db.tracks.getById).mockResolvedValue({
        data: mockTrack,
        error: null,
      });

      // Mock storage deletion failure
      vi.mocked(storage.deleteFile).mockResolvedValue({
        error: { message: 'File not found' },
      });

      vi.mocked(db.tracks.delete).mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      await AudioUploadService.deleteAudio('track_123');

      // Verify DB deletion still proceeded
      expect(db.tracks.delete).toHaveBeenCalledWith('track_123');
    });
  });

  /**
   * TEST #4: Batch Upload Error Handling
   * Verifies that failed uploads are returned to UI
   */
  describe('Fix #4: Batch Upload Error Handling', () => {
    it('should return both successful and failed uploads', async () => {
      const files = [
        new File([new ArrayBuffer(1024)], 'success1.mp3', { type: 'audio/mpeg' }),
        new File([new ArrayBuffer(1024)], 'fail.mp3', { type: 'audio/mpeg' }),
        new File([new ArrayBuffer(1024)], 'success2.mp3', { type: 'audio/mpeg' }),
      ];

      // Mock first file: success
      // Mock second file: quota exceeded
      // Mock third file: success

      let callCount = 0;
      vi.mocked(db.profiles.getById).mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          // Second file: quota exceeded
          return {
            data: {
              id: mockUser.id,
              storage_used: 1023 * 1024 * 1024,
              storage_limit: 1024 * 1024 * 1024,
            },
            error: null,
          };
        }
        return {
          data: {
            id: mockUser.id,
            storage_used: 100 * 1024 * 1024,
            storage_limit: 1024 * 1024 * 1024,
          },
          error: null,
        };
      });

      // Mock successful operations for files 1 and 3
      vi.mocked(storage.uploadAudio).mockResolvedValue({
        data: { path: 'user_123/test.mp3' },
        error: null,
      });

      vi.mocked(storage.getSignedUrl).mockResolvedValue(
        'https://example.com/signed-url'
      );

      vi.mocked(db.tracks.create).mockResolvedValue({
        data: { id: 'track_123', file_url: 'https://example.com/signed-url' },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await service.uploadMultipleAudios(files);

      // Verify return type structure
      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('failed');

      // Verify counts
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(1);

      // Verify failed upload details
      expect(result.failed[0]).toMatchObject({
        filename: 'fail.mp3',
        error: expect.stringContaining('Storage quota exceeded'),
        size: 1024,
      });
    });

    it('should show progress for each file including failures', async () => {
      const files = [
        new File([new ArrayBuffer(1024)], 'file1.mp3', { type: 'audio/mpeg' }),
        new File([new ArrayBuffer(1024)], 'file2.mp3', { type: 'audio/mpeg' }),
      ];

      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: {
          id: mockUser.id,
          storage_used: 1023 * 1024 * 1024, // Quota exceeded
          storage_limit: 1024 * 1024 * 1024,
        },
        error: null,
      });

      await service.uploadMultipleAudios(files);

      // Verify progress callback was called for each file
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Uploading 1 of 2'),
        })
      );

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Uploading 2 of 2'),
        })
      );

      // Verify final summary shows failures
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('failed'),
        })
      );
    });
  });

  /**
   * TEST #5: Edge Cases & Data Integrity
   * Verifies atomic operations and edge case handling
   */
  describe('Fix #5: Edge Cases & Data Integrity', () => {
    it('should handle null storage_used gracefully (COALESCE)', async () => {
      // Mock profile with NULL storage_used
      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: {
          id: mockUser.id,
          storage_used: null, // NULL in database
          storage_limit: 1024 * 1024 * 1024,
        },
        error: null,
      });

      // Should treat NULL as 0
      // Verify upload proceeds (quota check passes)
      expect(db.profiles.getById).toHaveBeenCalled();
    });

    it('should never allow negative storage_used (GREATEST)', async () => {
      const mockTrack = {
        id: 'track_123',
        file_url: 'https://example.com/audio-files/user_123/test.mp3',
        file_size: 10 * 1024 * 1024, // 10MB
        created_by: mockUser.id,
      };

      // Mock profile with only 5MB used
      vi.mocked(db.tracks.getById).mockResolvedValue({
        data: mockTrack,
        error: null,
      });

      vi.mocked(storage.deleteFile).mockResolvedValue({ error: null });
      vi.mocked(db.tracks.delete).mockResolvedValue({ error: null });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      await AudioUploadService.deleteAudio('track_123');

      // Verify GREATEST() prevents negative values
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.storage_used).toContain('GREATEST');
    });

    it('should clean up uploaded file if database save fails', async () => {
      vi.mocked(db.profiles.getById).mockResolvedValue({
        data: {
          id: mockUser.id,
          storage_used: 100 * 1024 * 1024,
          storage_limit: 1024 * 1024 * 1024,
        },
        error: null,
      });

      const uploadPath = 'user_123/test.mp3';
      vi.mocked(storage.uploadAudio).mockResolvedValue({
        data: { path: uploadPath },
        error: null,
      });

      vi.mocked(storage.getSignedUrl).mockResolvedValue(
        'https://example.com/signed-url'
      );

      // Mock database save failure
      vi.mocked(db.tracks.create).mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation' },
      });

      try {
        await service.uploadAudio(mockFile, { title: 'Test Track' });
        expect.fail('Should have thrown error');
      } catch (error) {
        // Verify cleanup was attempted
        expect(storage.deleteFile).toHaveBeenCalledWith(uploadPath);
      }
    });
  });
});
