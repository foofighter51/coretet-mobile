import React, { useState, useCallback, useRef } from 'react';
import { Upload, Music, AlertCircle, CheckCircle, X, Cloud } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import AudioUploadService, { UploadProgress, UploadOptions, UploadResult } from '../../utils/audioUploadService';
import MockAudioUploadService, { MockUploadProgress, MockUploadResult } from '../../utils/mockAudioUpload';
import AudioProcessor from '../../utils/audioProcessor';
import NativeFilePicker, { PickedFile } from '../../utils/nativeFilePicker';
import { Capacitor } from '@capacitor/core';

interface AudioUploaderProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  options?: UploadOptions;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  currentUser?: { id: string; email: string; phoneNumber: string; name: string };
  context?: 'band' | 'personal';
  bandName?: string;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  options = {},
  multiple = false,
  disabled = false,
  className = '',
  currentUser,
  context = 'personal',
  bandName
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProgress = useCallback((progressData: UploadProgress) => {
    setProgress(progressData);
    if (progressData.error) {
      setError(progressData.error);
      onUploadError?.(progressData.error);
    }
  }, [onUploadError]);

  // Detect if Supabase is configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

  // Use mock service when Supabase isn't configured
  const uploadService = isSupabaseConfigured
    ? new AudioUploadService(handleProgress, currentUser)
    : new MockAudioUploadService(handleProgress);

  const handleFileSelection = useCallback(async (files: FileList | PickedFile[] | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadResults([]);

    try {
      // Convert PickedFile[] or FileList to File[]
      const fileArray: File[] = [];

      if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
          fileArray.push(files[i]);
        }
      } else {
        // PickedFile[] - convert Blob to File
        for (const pickedFile of files) {
          const file = new File([pickedFile.blob], pickedFile.name, {
            type: pickedFile.type,
          });
          // Preserve webkitRelativePath if available
          if (pickedFile.webkitRelativePath) {
            (file as any).webkitRelativePath = pickedFile.webkitRelativePath;
          }
          fileArray.push(file);
        }
      }

      // Enforce 50-file limit for bulk uploads
      const MAX_FILES = 50;
      if (fileArray.length > MAX_FILES) {
        throw new Error(`Too many files selected. Maximum is ${MAX_FILES} files per upload.`);
      }

      const results: UploadResult[] = [];

      if (multiple && fileArray.length > 1) {
        // Upload multiple files with folder paths
        const multipleResults = await uploadService.uploadMultipleAudios(fileArray, options);
        results.push(...multipleResults);
      } else {
        // Upload single file
        const result = await uploadService.uploadAudio(fileArray[0], options);
        results.push(result);
      }

      setUploadResults(results);
      onUploadComplete?.(results);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [multiple, options, onUploadComplete, onUploadError, uploadService]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
  }, [handleFileSelection]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || uploading) return;

    handleFileSelection(e.dataTransfer.files);
  }, [disabled, uploading, handleFileSelection]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(async () => {
    if (disabled || uploading) return;

    // Use native picker on mobile platforms (supports cloud storage)
    if (Capacitor.isNativePlatform()) {
      try {
        const pickedFiles = await NativeFilePicker.pickAudioFiles({ multiple });
        if (pickedFiles.length > 0) {
          await handleFileSelection(pickedFiles);
        }
      } catch (error) {
        console.error('Native file picker error:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);

        // Show helpful error message
        if (errorMsg.includes('canceled')) {
          setError('File picker canceled. If uploading from cloud storage (Google Drive, iCloud Drive, Dropbox), make sure the file has been downloaded to your device first.');
        } else {
          setError(`File picker error: ${errorMsg}. For cloud storage files, try downloading them to your device first.`);
        }
      }
    } else {
      // Use web file input on web platform
      fileInputRef.current?.click();
    }
  }, [disabled, uploading, multiple, handleFileSelection]);

  const clearResults = useCallback(() => {
    setUploadResults([]);
    setError(null);
  }, []);

  const getProgressMessage = () => {
    if (!progress) return '';

    switch (progress.stage) {
      case 'processing':
        return 'Preparing audio file...';
      case 'uploading':
        return 'Uploading to cloud storage...';
      case 'saving':
        return 'Saving metadata...';
      case 'complete':
        return 'Upload complete!';
      default:
        return progress.message;
    }
  };

  const dropzoneStyle = {
    border: `2px dashed ${
      error
        ? designTokens.colors.semantic.error
        : isDragOver
          ? designTokens.colors.primary.blue
          : designTokens.colors.neutral.lightGray
    }`,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.spacing.xl,
    backgroundColor: isDragOver
      ? `${designTokens.colors.primary.blue}10`
      : designTokens.colors.neutral.white,
    cursor: disabled || uploading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  };

  return (
    <div className={className}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple={multiple}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {/* Dropzone */}
      <div
        style={dropzoneStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={multiple ? "Upload multiple audio files" : "Upload audio file"}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {uploading ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: `3px solid ${designTokens.colors.neutral.lightGray}`,
              borderTop: `3px solid ${designTokens.colors.primary.blue}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{
              fontSize: designTokens.typography.fontSizes.body,
              color: designTokens.colors.neutral.darkGray,
              margin: '8px 0',
              fontWeight: designTokens.typography.fontWeights.medium
            }}>
              {getProgressMessage()}
            </p>
            {progress && (
              <div style={{
                width: '100%',
                maxWidth: '300px',
                height: '8px',
                backgroundColor: designTokens.colors.neutral.lightGray,
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '8px auto'
              }}>
                <div style={{
                  width: `${progress.progress}%`,
                  height: '100%',
                  backgroundColor: designTokens.colors.primary.blue,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            )}
          </div>
        ) : (
          <div>
            {error ? (
              <AlertCircle
                size={48}
                color={designTokens.colors.semantic.error}
                style={{ marginBottom: '16px' }}
              />
            ) : uploadResults.length > 0 ? (
              <CheckCircle
                size={48}
                color={designTokens.colors.semantic.success}
                style={{ marginBottom: '16px' }}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Upload
                  size={32}
                  color={designTokens.colors.primary.blue}
                  style={{ marginRight: '8px' }}
                />
                <Music
                  size={32}
                  color={designTokens.colors.neutral.gray}
                />
              </div>
            )}

            <h3 style={{
              fontSize: designTokens.typography.fontSizes.h6,
              fontWeight: designTokens.typography.fontWeights.semibold,
              color: designTokens.colors.neutral.black,
              margin: '0 0 8px 0'
            }}>
              {error
                ? 'Upload Failed'
                : uploadResults.length > 0
                  ? 'Upload Successful!'
                  : 'Upload Audio Files'
              }
            </h3>

            {error ? (
              <div>
                <p style={{
                  fontSize: designTokens.typography.fontSizes.body,
                  color: designTokens.colors.semantic.error,
                  margin: '0 0 16px 0'
                }}>
                  {error}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${designTokens.colors.semantic.error}`,
                    color: designTokens.colors.semantic.error,
                    padding: '8px 16px',
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : uploadResults.length > 0 ? (
              <div>
                <p style={{
                  fontSize: designTokens.typography.fontSizes.body,
                  color: designTokens.colors.semantic.success,
                  margin: '0 0 16px 0'
                }}>
                  {uploadResults.length} file{uploadResults.length > 1 ? 's' : ''} uploaded successfully
                </p>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearResults();
                    }}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${designTokens.colors.neutral.gray}`,
                      color: designTokens.colors.neutral.gray,
                      padding: '8px 16px',
                      borderRadius: designTokens.borderRadius.sm,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleClick}
                    style={{
                      background: designTokens.colors.primary.blue,
                      border: 'none',
                      color: designTokens.colors.neutral.white,
                      padding: '8px 16px',
                      borderRadius: designTokens.borderRadius.sm,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      cursor: 'pointer'
                    }}
                  >
                    Upload More
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: designTokens.typography.fontSizes.body,
                  color: designTokens.colors.neutral.gray,
                  margin: '0 0 8px 0'
                }}>
                  {Capacitor.isNativePlatform()
                    ? (multiple ? 'Tap to choose audio files' : 'Tap to choose an audio file')
                    : (multiple
                        ? 'Drag & drop audio files here, or click to browse'
                        : 'Drag & drop an audio file here, or click to browse')
                  }
                </p>
                <p style={{
                  fontSize: designTokens.typography.fontSizes.caption,
                  color: designTokens.colors.neutral.gray,
                  margin: '0 0 8px 0'
                }}>
                  Supports MP3, WAV, AAC, M4A, FLAC, OGG • Max 100MB per file
                </p>
                {Capacitor.isNativePlatform() && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: designTokens.typography.fontSizes.caption,
                    color: designTokens.colors.primary.blue,
                    margin: '0',
                    fontWeight: designTokens.typography.fontWeights.medium
                  }}>
                    <Cloud size={14} />
                    <span>Access files from Google Drive, Dropbox, iCloud & more</span>
                  </div>
                )}
                {!isSupabaseConfigured && (
                  <p style={{
                    fontSize: designTokens.typography.fontSizes.caption,
                    color: designTokens.colors.semantic.warning,
                    margin: '8px 0 0 0',
                    fontWeight: designTokens.typography.fontWeights.medium
                  }}>
                    🚧 Demo mode - files processed but not saved to cloud
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Results Summary */}
      {uploadResults.length > 0 && (
        <div style={{
          marginTop: designTokens.spacing.md,
          padding: designTokens.spacing.md,
          backgroundColor: `${designTokens.colors.semantic.success}10`,
          borderRadius: designTokens.borderRadius.sm,
          border: `1px solid ${designTokens.colors.semantic.success}20`
        }}>
          <h4 style={{
            fontSize: designTokens.typography.fontSizes.bodyLarge,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.neutral.black,
            margin: '0 0 8px 0'
          }}>
            Upload Summary
          </h4>
          {uploadResults.map((result, index) => (
            <div key={result.versionId} style={{
              padding: '8px 0',
              borderBottom: index < uploadResults.length - 1 ? `1px solid ${designTokens.colors.neutral.lightGray}` : 'none'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: designTokens.typography.fontSizes.body,
                  fontWeight: designTokens.typography.fontWeights.medium,
                  color: designTokens.colors.neutral.black
                }}>
                  Track {index + 1}
                </span>
                <span style={{
                  fontSize: designTokens.typography.fontSizes.caption,
                  color: designTokens.colors.semantic.success
                }}>
                  Uploaded
                </span>
              </div>
              <div style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: designTokens.colors.neutral.gray
              }}>
                Duration: {AudioProcessor.formatDuration(result.metadata.duration)} •
                Size: {AudioProcessor.formatFileSize(result.metadata.fileSize)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add spinning animation styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AudioUploader;