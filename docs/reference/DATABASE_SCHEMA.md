# CoreTet Database Schema Documentation

## Overview

PostgreSQL database hosted on Supabase with Row Level Security (RLS) enabled. All tables use UUID primary keys and include created_at/updated_at timestamps.

## Core Tables

### users
Extends Supabase auth.users with profile information.

```sql
users
  - id: UUID (PK, references auth.users)
  - name: TEXT NOT NULL
  - phone: TEXT UNIQUE
  - email: TEXT UNIQUE  
  - avatar_url: TEXT
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE
```

### songs
Container for grouping related versions. Optional - versions can exist without songs.

```sql
songs
  - id: UUID (PK)
  - title: TEXT NOT NULL
  - original_artist: TEXT
  - created_by: UUID (FK -> users)
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE
  - metadata: JSONB
```

### versions
Individual audio files. The core entity of the system.

```sql
versions
  - id: UUID (PK)
  - song_id: UUID (FK -> songs, NULLABLE)
  - title: TEXT NOT NULL
  - file_url: TEXT NOT NULL (Backblaze URL)
  - file_size: BIGINT
  - duration_seconds: INTEGER
  - version_type: ENUM ('voice_memo', 'rough_demo', 'rehearsal', 'working_mix', 'final', 'live', 'remix', 'other')
  - version_number: INTEGER
  - recording_date: DATE
  - recording_location: TEXT
  - uploaded_by: UUID (FK -> users)
  - uploaded_by_name: TEXT (denormalized for performance)
  - artwork_url: TEXT
  - backblaze_file_id: TEXT
  - metadata: JSONB
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE
```

### playlists
Collections of versions for sharing and organization.

```sql
playlists
  - id: UUID (PK)
  - name: TEXT NOT NULL
  - description: TEXT
  - created_by: UUID (FK -> users)
  - is_public: BOOLEAN DEFAULT FALSE
  - share_token: TEXT UNIQUE
  - artwork_url: TEXT
  - metadata: JSONB
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE
```

### playlist_tracks
Junction table for playlist-version relationship with position tracking.

```sql
playlist_tracks
  - id: UUID (PK)
  - playlist_id: UUID (FK -> playlists)
  - version_id: UUID (FK -> versions)
  - position: INTEGER NOT NULL
  - added_by: UUID (FK -> users)
  - added_at: TIMESTAMP WITH TIME ZONE
  - UNIQUE(playlist_id, position)
```

## Collaboration Tables

### ratings
Three-tier rating system for tracks within playlist context.

```sql
ratings
  - id: UUID (PK)
  - user_id: UUID (FK -> users)
  - version_id: UUID (FK -> versions)
  - playlist_id: UUID (FK -> playlists)
  - rating: INTEGER CHECK (rating IN (1, 2, 3))
    -- 1 = listened (headphones)
    -- 2 = liked (thumbs up)
    -- 3 = loved (heart)
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE
  - UNIQUE(user_id, version_id, playlist_id)
```

### comments
Timestamped comments on tracks within playlists.

```sql
comments
  - id: UUID (PK)
  - version_id: UUID (FK -> versions)
  - playlist_id: UUID (FK -> playlists)
  - user_id: UUID (FK -> users)
  - timestamp_ms: INTEGER NOT NULL (position in track)
  - comment_text: TEXT NOT NULL
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE
```

## Sharing & Access Tables

### playlist_shares
Tracks all playlist shares with permissions and access methods.

```sql
playlist_shares
  - id: UUID (PK)
  - playlist_id: UUID (FK -> playlists)
  - created_by: UUID (FK -> users)
  - share_token: TEXT UNIQUE NOT NULL
  - permissions: TEXT CHECK IN ('listen', 'rate', 'comment')
  - share_type: TEXT CHECK IN ('link', 'phone', 'email')
  - recipient_phone: TEXT
  - recipient_email: TEXT
  - access_code: TEXT (6-digit for phone auth)
  - code_expires_at: TIMESTAMP WITH TIME ZONE
  - access_count: INTEGER DEFAULT 0
  - last_accessed_at: TIMESTAMP WITH TIME ZONE
  - is_active: BOOLEAN DEFAULT TRUE
  - created_at: TIMESTAMP WITH TIME ZONE
  - expires_at: TIMESTAMP WITH TIME ZONE (optional)
```

### share_access_logs
Audit trail for shared playlist access.

```sql
share_access_logs
  - id: UUID (PK)
  - share_id: UUID (FK -> playlist_shares)
  - accessed_by_phone: TEXT
  - accessed_by_email: TEXT
  - ip_address: INET
  - user_agent: TEXT
  - accessed_at: TIMESTAMP WITH TIME ZONE
```

## Authentication Tables

### auth_codes
Temporary codes for phone/email verification.

```sql
auth_codes
  - id: UUID (PK)
  - phone: TEXT
  - code: TEXT (6-digit)
  - purpose: TEXT ('login', 'playlist-access')
  - metadata: JSONB
  - attempts: INTEGER DEFAULT 0
  - expires_at: TIMESTAMP WITH TIME ZONE
  - created_at: TIMESTAMP WITH TIME ZONE
```

### sessions
Long-lived session tokens for mobile apps.

```sql
sessions
  - id: UUID (PK)
  - token: TEXT UNIQUE
  - user_id: UUID (FK -> users)
  - expires_at: TIMESTAMP WITH TIME ZONE
  - created_at: TIMESTAMP WITH TIME ZONE
```

## Utility Tables

### duplicate_candidates
Tracks potential duplicate files for user review.

```sql
duplicate_candidates
  - id: UUID (PK)
  - version_id_1: UUID (FK -> versions)
  - version_id_2: UUID (FK -> versions)
  - match_confidence: DECIMAL(3,2) (0.00 to 1.00)
  - match_criteria: JSONB
  - reviewed: BOOLEAN DEFAULT FALSE
  - reviewed_by: UUID (FK -> users)
  - reviewed_at: TIMESTAMP WITH TIME ZONE
  - action_taken: TEXT
  - created_at: TIMESTAMP WITH TIME ZONE
  - UNIQUE(version_id_1, version_id_2)
```

### playback_history
Tracks listening history for recommendations and analytics.

```sql
playback_history
  - id: UUID (PK)
  - user_id: UUID (FK -> users)
  - version_id: UUID (FK -> versions)
  - playlist_id: UUID (FK -> playlists, NULLABLE)
  - played_at: TIMESTAMP WITH TIME ZONE
  - play_duration_seconds: INTEGER
  - completed: BOOLEAN DEFAULT FALSE
```

## Indexes

Critical indexes for performance:

```sql
-- Version lookups
CREATE INDEX idx_versions_song_id ON versions(song_id);
CREATE INDEX idx_versions_uploaded_by ON versions(uploaded_by);

-- Playlist operations
CREATE INDEX idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_version ON playlist_tracks(version_id);

-- Ratings and comments
CREATE INDEX idx_ratings_version ON ratings(version_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_playlist ON ratings(playlist_id);
CREATE INDEX idx_comments_version ON comments(version_id);
CREATE INDEX idx_comments_playlist ON comments(playlist_id);
CREATE INDEX idx_comments_timestamp ON comments(timestamp_ms);

-- Sharing
CREATE INDEX idx_playlist_shares_token ON playlist_shares(share_token);
CREATE INDEX idx_playlist_shares_playlist ON playlist_shares(playlist_id);

-- Authentication
CREATE INDEX idx_auth_codes_phone ON auth_codes(phone);
CREATE INDEX idx_sessions_token ON sessions(token);
```

## Row Level Security (RLS) Policies

### Key Principles
- Users can only see their own data by default
- Playlist sharing grants specific access
- Ensemble membership extends access
- Public playlists visible to all authenticated users

### Example Policies

```sql
-- Users can view versions they have access to
CREATE POLICY "View accessible versions" ON versions
FOR SELECT USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM playlist_tracks pt
    JOIN playlists p ON p.id = pt.playlist_id
    WHERE pt.version_id = versions.id
    AND (p.created_by = auth.uid() OR p.is_public = TRUE)
  )
);

-- Users can only rate on accessible playlists
CREATE POLICY "Rate on accessible playlists" ON ratings
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM playlist_shares ps
    WHERE ps.playlist_id = ratings.playlist_id
    AND ps.permissions IN ('rate', 'comment')
  )
);
```

## Database Functions

### get_aggregate_ratings
Returns rating counts for a track in a playlist.

```sql
FUNCTION get_aggregate_ratings(p_version_id UUID, p_playlist_id UUID)
RETURNS TABLE (
  listened_count INTEGER,
  liked_count INTEGER,
  loved_count INTEGER,
  total_count INTEGER
)
```

### find_duplicate_files
Identifies potential duplicates based on file size and duration.

```sql
FUNCTION find_duplicate_files(p_user_id UUID)
RETURNS TABLE (
  version_id_1 UUID,
  version_id_2 UUID,
  title_1 TEXT,
  title_2 TEXT,
  file_size BIGINT,
  duration_seconds INTEGER
)
```

### duplicate_playlist
Creates a copy of a playlist with all tracks.

```sql
FUNCTION duplicate_playlist(p_playlist_id UUID, p_new_name TEXT)
RETURNS UUID
```

## Triggers

All tables with updated_at columns have triggers to auto-update on modification:

```sql
CREATE TRIGGER update_[table]_updated_at 
BEFORE UPDATE ON [table]
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

## Migration Strategy

1. Run schema creation in order (tables, then indexes, then RLS policies)
2. Create functions and triggers last
3. Seed with test data in development
4. Enable RLS before production deployment

## Performance Considerations

- Denormalized `uploaded_by_name` in versions table avoids joins
- JSONB metadata fields for flexibility without schema changes
- Composite indexes on common query patterns
- Aggressive indexing on foreign keys
- Consider partitioning playback_history by month in future

## Backup Strategy

- Supabase handles automatic daily backups
- Point-in-time recovery available
- Consider additional backup of audio file references
- Regular export of share_access_logs for compliance