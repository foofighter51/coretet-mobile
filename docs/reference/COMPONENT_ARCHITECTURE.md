# CoreTet Component Architecture

## Component Hierarchy

```
App
├── Layout
│   ├── Navigation
│   ├── MiniPlayer (persistent)
│   └── Footer
├── Pages
│   ├── Dashboard
│   │   ├── RecentPlaylists
│   │   ├── RecentVersions
│   │   └── QuickUpload
│   ├── Library
│   │   ├── SongsView
│   │   ├── VersionsView
│   │   ├── PlaylistsView
│   │   └── DuplicateManager
│   ├── Upload
│   │   ├── FileDropzone
│   │   ├── MetadataForm
│   │   └── VersionGrouping
│   ├── Player (full screen)
│   │   ├── AlbumArt
│   │   ├── Controls
│   │   ├── RatingButtons
│   │   └── Queue
│   └── Share
│       ├── ShareModal
│       ├── PermissionSelector
│       └── RecipientInput
└── Modals
    ├── Comments
    ├── Ratings
    └── PlaylistEdit
```

## Core Components

### 1. MiniPlayer
Persistent bottom player bar across all pages.

```jsx
<MiniPlayer>
  <TrackInfo />
  <PlayPauseButton />
  <ProgressBar />
  <ExpandButton />
</MiniPlayer>
```

**Props:**
- `track`: Current playing track
- `isPlaying`: Boolean
- `onExpand`: Function to open full player

**State:**
- Managed globally via React Context or Zustand

### 2. MobilePlayer
Full-screen player for mobile experience.

```jsx
<MobilePlayer>
  <Header />
  <AlbumArt />
  <TrackInfo />
  <ProgressBar />
  <Controls>
    <SkipBack10 />
    <PlayPause />
    <SkipForward10 />
  </Controls>
  <RatingButtons />
  <ActionButtons>
    <CommentsButton />
    <RatingsButton />
    <ShareButton />
  </ActionButtons>
</MobilePlayer>
```

**Features:**
- Swipe gestures for track navigation
- Large touch targets (min 44px)
- Modal overlays for comments/ratings

### 3. FileUploader
Handles single and bulk file uploads.

```jsx
<FileUploader>
  <Dropzone 
    accept="audio/*"
    multiple={true}
    onDrop={handleFiles}
  />
  <UploadQueue>
    <UploadItem 
      progress={percentage}
      status={status}
      onCancel={cancelUpload}
    />
  </UploadQueue>
  <MetadataEditor />
</FileUploader>
```

**Integration:**
- Direct upload to Backblaze B2
- Progress tracking per file
- Metadata extraction from audio files

### 4. PlaylistManager
Create and edit playlists with drag-and-drop.

```jsx
<PlaylistManager>
  <PlaylistHeader>
    <EditableTitle />
    <ShareButton />
  </PlaylistHeader>
  <TrackList>
    <DraggableTrack
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    />
  </TrackList>
  <AddTracksButton />
</PlaylistManager>
```

**Features:**
- Drag-and-drop reordering
- Batch operations
- Real-time sync with database

### 5. ShareFlow
Handles all sharing scenarios.

```jsx
<ShareFlow>
  <ShareMethodSelector>
    <LinkShare />
    <PhoneShare />
    <EmailShare />
  </ShareMethodSelector>
  <PermissionLevel>
    <ListenOnly />
    <RateAndListen />
    <FullCollaboration />
  </PermissionLevel>
  <RecipientList />
  <ActiveShares />
</ShareFlow>
```

### 6. RatingDisplay
Shows three-tier ratings with proper hierarchy.

```jsx
<RatingDisplay>
  <UserRating 
    value={userRating}
    onChange={handleRatingChange}
  />
  <AggregateRatings
    hidden={!showAggregates}
    data={aggregateData}
  />
</RatingDisplay>
```

### 7. CommentsThread
Simple linear comment display.

```jsx
<CommentsThread>
  <CommentList>
    <Comment
      author={name}
      timestamp={ms}
      text={text}
      onJumpTo={seekToTimestamp}
    />
  </CommentList>
  <AddComment
    currentTime={playheadPosition}
    onSubmit={handleSubmit}
  />
</CommentsThread>
```

## State Management

### Global State (Context/Zustand)
```javascript
{
  // Playback
  currentTrack: Version | null,
  playlist: Playlist | null,
  queue: Version[],
  isPlaying: boolean,
  currentTime: number,
  duration: number,
  
  // User
  user: User | null,
  session: Session | null,
  
  // UI
  miniPlayerExpanded: boolean,
  activeModal: string | null,
}
```

### Local Component State
- Form inputs
- Loading states
- Temporary UI states
- Validation errors

## Data Flow

### Fetching Strategy
```javascript
// SWR for data fetching with caching
const { data: playlists } = useSWR('/api/playlists', fetcher);

// Optimistic updates
const addTrack = async (track) => {
  // Update UI immediately
  mutate('/api/playlists', optimisticData, false);
  // Send to server
  await api.addTrack(track);
  // Revalidate
  mutate('/api/playlists');
};
```

### Real-time Updates
```javascript
// Supabase real-time subscriptions
useEffect(() => {
  const subscription = supabase
    .from('ratings')
    .on('INSERT', handleNewRating)
    .on('UPDATE', handleRatingUpdate)
    .subscribe();
    
  return () => subscription.unsubscribe();
}, []);
```

## Component Patterns

### Compound Components
```jsx
<Player>
  <Player.Art />
  <Player.Title />
  <Player.Controls />
  <Player.Rating />
</Player>
```

### Render Props
```jsx
<DragDropContext
  render={({ isDragging, draggedItem }) => (
    <TrackList isDragging={isDragging} />
  )}
/>
```

### Custom Hooks
```javascript
// Playback control
useAudioPlayer() => {
  play, pause, seek, skip, 
  currentTime, duration, isPlaying
}

// Authentication
useAuth() => {
  user, login, logout, isAuthenticated
}

// Sharing
useShare(playlistId) => {
  shareLink, generateLink, revokeShare
}
```

## Mobile Responsiveness

### Breakpoints
```javascript
const breakpoints = {
  mobile: '640px',   // < 640px
  tablet: '768px',   // 640px - 768px  
  desktop: '1024px', // > 768px
};
```

### Responsive Components
```jsx
// Different layouts for different screens
const PlaylistView = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  if (isMobile) {
    return <MobilePlaylistView />;
  }
  
  return <DesktopPlaylistView />;
};
```

## Performance Optimizations

### Code Splitting
```javascript
// Lazy load heavy components
const Player = lazy(() => import('./Player'));
const ShareModal = lazy(() => import('./ShareModal'));
```

### Memoization
```javascript
// Prevent unnecessary re-renders
const TrackList = memo(({ tracks }) => {
  return tracks.map(track => (
    <Track key={track.id} {...track} />
  ));
});
```

### Virtual Lists
```javascript
// For long track lists
<VirtualList
  height={600}
  itemCount={tracks.length}
  itemSize={60}
  renderItem={({ index, style }) => (
    <Track style={style} {...tracks[index]} />
  )}
/>
```

## Testing Strategy

### Unit Tests
```javascript
describe('RatingButton', () => {
  it('toggles rating on click', () => {
    const { getByRole } = render(<RatingButton />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveClass('active');
  });
});
```

### Integration Tests
```javascript
describe('ShareFlow', () => {
  it('generates share link with permissions', async () => {
    const { getByText } = render(<ShareFlow />);
    fireEvent.click(getByText('Generate Link'));
    await waitFor(() => {
      expect(getByText(/coretet.app\/shared/)).toBeInTheDocument();
    });
  });
});
```

## Styling Architecture

### Tailwind Components
```jsx
// Base button component
const Button = ({ variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  };
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button 
      className={`rounded-lg ${variants[variant]} ${sizes[size]}`}
      {...props}
    />
  );
};
```

### Dark Mode Support
```javascript
// Automatic dark mode based on system
const isDark = useMediaQuery('(prefers-color-scheme: dark)');

// Manual toggle
<div className="dark:bg-gray-900 bg-white">
  <h1 className="dark:text-white text-gray-900">
    CoreTet
  </h1>
</div>
```

## Error Handling

### Error Boundaries
```jsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <Player />
</ErrorBoundary>
```

### Toast Notifications
```javascript
const handleError = (error) => {
  toast.error(error.message, {
    position: 'bottom-center',
    duration: 4000,
  });
};
```

## Accessibility

### ARIA Labels
```jsx
<button
  aria-label="Play track"
  aria-pressed={isPlaying}
  onClick={togglePlay}
>
  {isPlaying ? <Pause /> : <Play />}
</button>
```

### Keyboard Navigation
```javascript
// Keyboard shortcuts
useKeyboard({
  'Space': togglePlay,
  'ArrowLeft': () => skip(-10),
  'ArrowRight': () => skip(10),
  'l': toggleLike,
});
```