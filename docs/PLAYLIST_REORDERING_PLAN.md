# Playlist Track Reordering Feature

## Overview

Add drag-and-drop track reordering to playlists, similar to Spotify/Apple Music. Users can manually adjust track order and save the custom arrangement.

## Current State

**Already Have:**
- `position` field on `playlist_items` table
- Sort by position (labeled "Default")
- Sort by name, duration, rating
- `updatePosition()` API in `lib/supabase.ts`

**Need to Add:**
- Drag-and-drop UI for reordering
- Update all positions after reorder
- Visual feedback during drag
- Save order to database

## Design Approach

### Option A: Native HTML5 Drag-and-Drop
**Pros:** Built into browser, no dependencies
**Cons:** Complex API, mobile support issues, no smooth animations

### Option B: React DnD Library
**Pros:** Battle-tested, smooth animations
**Cons:** Large dependency, overkill for simple use case

### Option C: Simple Touch/Mouse Events (Recommended)
**Pros:** Lightweight, full control, works on web & mobile
**Cons:** More code to write

**Decision: Option C** - Custom implementation with touch/mouse events

## Implementation Plan

### 1. Add Reorder Mode Toggle

Add "Reorder" button in playlist detail view:
- Only visible when sorted by "Default" (position)
- Toggle between view/reorder mode
- In reorder mode:
  - Show drag handles on each track
  - Disable playback
  - Show "Save" and "Cancel" buttons

### 2. Drag Handle UI

Add drag handle icon (three horizontal lines) to left of each track:
```
≡  Track Name  •  2:34  •  ❤️
```

### 3. Drag Logic

**On Drag Start:**
- Store dragged track index
- Add visual feedback (opacity, highlight)

**On Drag Over:**
- Calculate drop position based on mouse/touch Y
- Show visual indicator (line between tracks)
- Update preview order (doesn't save yet)

**On Drop:**
- Update local track order
- Show "Save" button highlighted

**On Save:**
- Calculate new position values (1, 2, 3, ...)
- Batch update all affected tracks
- Refresh playlist

### 4. Position Recalculation

After reorder, recalculate positions:
```typescript
// Example: Move track from index 5 to index 2
// Before: [0,1,2,3,4,5,6,7,8]
// After:  [0,1,5,2,3,4,6,7,8]
// Positions: [1,2,3,4,5,6,7,8,9]
```

Batch update in single transaction for performance.

## UI Mockup

### Normal View (Default Sort)
```
┌─────────────────────────────────────┐
│  Playlist Title          [•••] Sort │
│                                     │
│  Track 1              ♡  👤  🗑     │
│  Track 2              ❤️  👤  🗑     │
│  Track 3              ♡  👤  🗑     │
│                                     │
│  [Reorder]                          │
└─────────────────────────────────────┘
```

### Reorder Mode
```
┌─────────────────────────────────────┐
│  Reorder Tracks                     │
│                                     │
│  ≡  Track 1                         │
│  ≡  Track 2  ← dragging             │
│  ━━━━━━━━━━ (drop indicator)        │
│  ≡  Track 3                         │
│                                     │
│  [Cancel]           [Save Order]    │
└─────────────────────────────────────┘
```

## Database Changes

**None needed!**
- `playlist_items` already has `position` field
- `updatePosition()` API already exists
- Just need bulk position update

## API Enhancement

Add bulk position update to `lib/supabase.ts`:

```typescript
playlistItems: {
  // ... existing methods ...

  async updatePositions(updates: { id: string; position: number }[]) {
    const promises = updates.map(({ id, position }) =>
      db.playlistItems.updatePosition(id, position)
    );
    return Promise.all(promises);
  }
}
```

## Mobile Considerations

### Touch Events
- Use `touchstart`, `touchmove`, `touchend`
- Fallback to mouse events for web
- Unified handler for both

### Haptic Feedback (iOS)
- Vibrate on drag start
- Vibrate on successful drop

### Scroll While Dragging
- Auto-scroll when dragging near top/bottom
- Smooth scrolling during drag

## Implementation Steps

### Step 1: Add Reorder Mode State
```typescript
const [isReordering, setIsReordering] = useState(false);
const [reorderedTracks, setReorderedTracks] = useState<any[]>([]);
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
```

### Step 2: Add Reorder Button
- Show when `playlistSortBy === 'position'`
- Toggle `isReordering` state

### Step 3: Add Drag Handlers
- `handleDragStart(index)`
- `handleDragOver(index)`
- `handleDrop()`
- `handleCancel()`
- `handleSave()`

### Step 4: Update UI
- Show drag handles in reorder mode
- Disable other interactions
- Show save/cancel buttons

### Step 5: Save Logic
- Calculate new positions (1, 2, 3, ...)
- Batch update via API
- Refresh playlist
- Exit reorder mode

## Edge Cases

1. **Empty playlist:** Disable reorder button
2. **Single track:** Show message "Nothing to reorder"
3. **Filtered view:** Warn "Clear filters to reorder"
4. **Different sort:** Show "Switch to Default sort to reorder"
5. **Network error:** Show error, keep changes in state, allow retry
6. **Concurrent edits:** Last write wins (acceptable for MVP)

## Testing Checklist

- [ ] Enable reorder mode
- [ ] Drag track up
- [ ] Drag track down
- [ ] Drag to top
- [ ] Drag to bottom
- [ ] Cancel (reverts order)
- [ ] Save (persists order)
- [ ] Refresh page (order persists)
- [ ] Works on mobile (touch)
- [ ] Works on web (mouse)
- [ ] Multiple rapid reorders
- [ ] Network error handling

## Estimated Effort

- **Core drag-and-drop logic:** 2-3 hours
- **UI polish (animations, feedback):** 1-2 hours
- **Save/cancel logic:** 1 hour
- **Testing:** 1 hour
- **Total:** ~5-7 hours

## Alternative: Simpler MVP

If drag-and-drop is too complex, simpler option:
- Add ↑/↓ arrow buttons next to each track
- Click to move up/down one position
- Auto-saves on each move
- **Effort:** ~2 hours

Which approach do you prefer?
