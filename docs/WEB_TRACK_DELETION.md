# Web Track Deletion - Implementation Plan

## Current State

**Mobile-First UI:**
- Uses `SwipeableTrackRow` component with swipe gestures
- Only removes tracks from playlists (doesn't delete files)
- No visible delete buttons on desktop
- Storage quota showing 95.9% usage but no way to free space

**Backend Status:**
- ✅ `AudioUploadService.deleteAudio()` exists (Fix #3)
- ✅ Deletes file from Supabase storage
- ✅ Removes track from database
- ✅ Decrements storage quota

---

## Required Changes

### 1. Add Desktop-Friendly Delete UI

**Option A: Hover Actions (Recommended for Web)**
Add delete button that appears on hover for each track row

**Option B: Checkbox Selection + Bulk Delete**
Add checkboxes for multi-select and a bulk delete button (already exists for playlist removal)

**Option C: Context Menu (Right-Click)**
Add right-click menu with delete option

---

## Implementation: Hover Delete Button

### Phase 1: Create DesktopTrackRow Component

**File:** `src/components/molecules/DesktopTrackRow.tsx`

```tsx
import React, { useState } from 'react';
import { Play, Pause, Trash2, MessageSquare, Star } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

interface DesktopTrackRowProps {
  track: {
    id: string;
    title: string;
    duration_seconds: number;
    folder_path?: string;
  };
  isPlaying: boolean;
  currentRating?: 'listened' | 'liked' | 'loved' | null;
  aggregatedRatings?: {
    listened: number;
    liked: number;
    loved: number;
  };
  hasComments?: boolean;
  hasUnreadComments?: boolean;
  onPlayPause: () => void;
  onRate: (rating: 'listened' | 'liked' | 'loved' | null) => void;
  onDelete: () => void;
  onClick: () => void;
}

export const DesktopTrackRow: React.FC<DesktopTrackRowProps> = ({
  track,
  isPlaying,
  currentRating,
  aggregatedRatings,
  hasComments,
  hasUnreadComments,
  onPlayPause,
  onRate,
  onDelete,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const designTokens = useDesignTokens();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: isHovered
          ? designTokens.colors.surface.hover
          : designTokens.colors.surface.primary,
        borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Play/Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: designTokens.colors.primary.blue,
          color: designTokens.colors.neutral.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginRight: '16px',
        }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Track Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: designTokens.typography.fontSizes.body,
            fontWeight: designTokens.typography.fontWeights.medium,
            color: designTokens.colors.text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {track.title}
        </div>
        <div
          style={{
            fontSize: designTokens.typography.fontSizes.bodySmall,
            color: designTokens.colors.text.secondary,
          }}
        >
          {formatDuration(track.duration_seconds)}
        </div>
      </div>

      {/* Rating Badges */}
      {aggregatedRatings && (
        <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
          {aggregatedRatings.loved > 0 && (
            <span
              style={{
                padding: '4px 8px',
                backgroundColor: designTokens.colors.ratings.loved.bgLight,
                borderRadius: '12px',
                fontSize: '12px',
              }}
            >
              ❤️ {aggregatedRatings.loved}
            </span>
          )}
          {aggregatedRatings.liked > 0 && (
            <span
              style={{
                padding: '4px 8px',
                backgroundColor: designTokens.colors.ratings.liked.bgLight,
                borderRadius: '12px',
                fontSize: '12px',
              }}
            >
              👍 {aggregatedRatings.liked}
            </span>
          )}
        </div>
      )}

      {/* Comments Indicator */}
      {hasComments && (
        <div style={{ marginRight: '16px' }}>
          <MessageSquare
            size={20}
            color={
              hasUnreadComments
                ? designTokens.colors.primary.blue
                : designTokens.colors.neutral.gray
            }
          />
        </div>
      )}

      {/* Delete Button (appears on hover) */}
      {isHovered && !showDeleteConfirm && (
        <button
          onClick={handleDeleteClick}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: designTokens.colors.system.error,
            color: designTokens.colors.neutral.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0.9,
          }}
          title="Delete track permanently"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{
              fontSize: designTokens.typography.fontSizes.bodySmall,
              color: designTokens.colors.text.secondary,
              marginRight: '8px',
            }}
          >
            Delete permanently?
          </span>
          <button
            onClick={handleConfirmDelete}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: designTokens.colors.system.error,
              color: designTokens.colors.neutral.white,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
          <button
            onClick={handleCancelDelete}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: `1px solid ${designTokens.colors.borders.default}`,
              backgroundColor: designTokens.colors.surface.primary,
              color: designTokens.colors.text.primary,
              fontSize: designTokens.typography.fontSizes.bodySmall,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
```

---

### Phase 2: Add Delete Handler to MainDashboard

**File:** `src/components/screens/MainDashboard.tsx`

Add this handler after `handleDeleteSelectedTracks`:

```typescript
const handlePermanentlyDeleteTrack = async (trackId: string) => {
  if (!currentBand?.id) return;

  try {
    setError('Deleting track...');

    // Call AudioUploadService to delete file from storage and database
    await AudioUploadService.deleteAudio(trackId);

    // Stop playback if current track was deleted
    if (currentTrack?.id === trackId && isPlaying) {
      handlePlayPause();
    }

    // Reload playlist tracks
    if (currentSetList) {
      await loadPlaylistTracks(currentSetList.id);
    }

    setError('Track deleted successfully');
    setTimeout(() => setError(null), 3000);
  } catch (err) {
    console.error('Error deleting track:', err);
    setError(err instanceof Error ? err.message : 'Failed to delete track');
  }
};
```

---

### Phase 3: Use DesktopTrackRow Based on Platform

**File:** `src/components/screens/MainDashboard.tsx`

Replace the track rendering logic:

```tsx
// At the top, add import
import { Capacitor } from '@capacitor/core';
import { DesktopTrackRow } from '../molecules/DesktopTrackRow';

// In the track rendering section (around line 1522):
{Capacitor.isNativePlatform() ? (
  <SwipeableTrackRow
    track={{ ... }}
    isPlaying={currentTrack?.id === item.tracks.id && isPlaying}
    // ... other props
    onLongPress={() => handleOpenTrackDetail(item.tracks)}
  />
) : (
  <DesktopTrackRow
    track={{ ... }}
    isPlaying={currentTrack?.id === item.tracks.id && isPlaying}
    // ... other props
    onDelete={() => handlePermanentlyDeleteTrack(item.tracks.id)}
    onClick={() => handleOpenTrackDetail(item.tracks)}
  />
)}
```

---

## User Flow

### Desktop (Web Browser)
1. User hovers over a track row
2. Red trash icon appears on the right side
3. User clicks trash icon
4. Confirmation appears: "Delete permanently? [Delete] [Cancel]"
5. User clicks "Delete"
6. Track is deleted from storage, database, and quota is updated
7. Track disappears from list
8. Success message: "Track deleted successfully"

### Mobile (Native App)
1. User swipes left on track
2. Delete button appears (existing behavior)
3. Currently only removes from playlist
4. *TODO:* Add "Delete Permanently" option to mobile

---

## Testing Checklist

### Desktop Web
- [ ] Hover over track shows delete button
- [ ] Click delete shows confirmation
- [ ] Cancel returns to normal state
- [ ] Confirm delete removes track from UI
- [ ] Storage quota decreases after delete
- [ ] Deleted track no longer appears in Settings storage count
- [ ] Can delete multiple tracks sequentially
- [ ] Cannot delete if user doesn't own the track (check permissions)

### Mobile
- [ ] Swipe still works for playlist removal
- [ ] No delete button visible on mobile (uses swipe instead)

### Edge Cases
- [ ] Deleting currently playing track stops playback
- [ ] Deleting last track in playlist shows empty state
- [ ] Network error shows appropriate error message
- [ ] Storage quota updates immediately after delete

---

## Security Considerations

**RLS Policy Check:**
Ensure Supabase RLS policies only allow track deletion by:
1. Track owner (created_by)
2. Band admin

**SQL Policy:**
```sql
CREATE POLICY "Users can delete their own tracks"
  ON tracks FOR DELETE
  USING (auth.uid()::TEXT = created_by);

CREATE POLICY "Band admins can delete any band track"
  ON tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = tracks.band_id
      AND user_id = auth.uid()::TEXT
      AND is_admin = TRUE
    )
  );
```

---

## Alternative: Bulk Delete with Checkboxes

If you prefer multi-select deletion:

1. Add checkbox to DesktopTrackRow
2. Add "Delete Selected Tracks" button to header
3. Use existing `selectedTrackIds` state
4. Call `handlePermanentlyDeleteTrack` for each selected track

---

## Next Steps

1. Create `DesktopTrackRow.tsx` component
2. Add `handlePermanentlyDeleteTrack` to MainDashboard
3. Replace track row rendering with platform check
4. Test deletion on web
5. Verify storage quota updates correctly
6. Add loading states for deletion
7. Add keyboard shortcuts (Delete key to delete selected track)

---

## Benefits

- ✅ Users can free up storage space
- ✅ Desktop-friendly hover UI
- ✅ Confirmation prevents accidental deletion
- ✅ Storage quota updates in real-time
- ✅ Consistent with desktop UX patterns
- ✅ No breaking changes to mobile app
