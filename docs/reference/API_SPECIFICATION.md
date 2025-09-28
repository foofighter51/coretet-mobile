# CoreTet API Specification

## Base Configuration

```javascript
BASE_URL: https://api.coretet.app
AUTH: Bearer token in Authorization header
CONTENT_TYPE: application/json
```

## Authentication Endpoints

### POST /api/auth/phone/send
Send verification code via SMS.

**Request:**
```json
{
  "phone": "+15551234567",
  "purpose": "login" | "playlist-access"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code sent successfully"
}
```

### POST /api/auth/phone/verify
Verify SMS code and create session.

**Request:**
```json
{
  "phone": "+15551234567",
  "code": "123456",
  "purpose": "login" | "playlist-access"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "User Name",
    "phone": "+15551234567"
  },
  "sessionToken": "token",
  "expiresAt": "2024-02-01T00:00:00Z"
}
```

### POST /api/auth/logout
End current session.

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true
}
```

## Version Management Endpoints

### GET /api/versions
Get user's versions with optional filtering.

**Query Parameters:**
- `song_id` (optional): Filter by song
- `version_type` (optional): Filter by type
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "versions": [
    {
      "id": "uuid",
      "title": "Song Title v1",
      "version_type": "demo",
      "file_url": "https://...",
      "duration_seconds": 180,
      "uploaded_by_name": "John Doe",
      "created_at": "2024-01-01T00:00:00Z",
      "song": {
        "id": "uuid",
        "title": "Song Title"
      }
    }
  ],
  "total": 100,
  "hasMore": true
}
```

### POST /api/versions
Upload new version.

**Request:**
```json
{
  "title": "My Song v2",
  "song_id": "uuid" | null,
  "version_type": "demo",
  "file_url": "backblaze_url",
  "file_size": 5242880,
  "duration_seconds": 180,
  "recording_date": "2024-01-01",
  "recording_location": "Home Studio"
}
```

**Response:**
```json
{
  "version": {
    "id": "uuid",
    "title": "My Song v2",
    // ... full version object
  }
}
```

### PUT /api/versions/:id
Update version metadata.

**Request:**
```json
{
  "title": "Updated Title",
  "version_type": "final",
  "song_id": "uuid"
}
```

### DELETE /api/versions/:id
Delete a version (soft delete).

## Playlist Endpoints

### GET /api/playlists
Get user's playlists.

**Response:**
```json
{
  "playlists": [
    {
      "id": "uuid",
      "name": "January Rehearsal",
      "track_count": 12,
      "created_at": "2024-01-01T00:00:00Z",
      "share_token": "abc123",
      "is_public": false
    }
  ]
}
```

### POST /api/playlists
Create new playlist.

**Request:**
```json
{
  "name": "New Playlist",
  "description": "Description here",
  "is_public": false
}
```

### GET /api/playlists/:id
Get playlist with tracks.

**Response:**
```json
{
  "playlist": {
    "id": "uuid",
    "name": "January Rehearsal",
    "description": "Band rehearsal recordings",
    "tracks": [
      {
        "position": 1,
        "version": {
          "id": "uuid",
          "title": "Song Title",
          "duration_seconds": 180,
          // ... version details
        }
      }
    ]
  }
}
```

### POST /api/playlists/:id/tracks
Add track to playlist.

**Request:**
```json
{
  "version_id": "uuid",
  "position": 5 // optional, adds to end if not specified
}
```

### PUT /api/playlists/:id/tracks/reorder
Reorder tracks in playlist.

**Request:**
```json
{
  "track_orders": [
    { "version_id": "uuid1", "position": 1 },
    { "version_id": "uuid2", "position": 2 },
    { "version_id": "uuid3", "position": 3 }
  ]
}
```

### DELETE /api/playlists/:id/tracks/:version_id
Remove track from playlist.

## Rating Endpoints

### GET /api/playlists/:id/ratings
Get all ratings for a playlist.

**Response:**
```json
{
  "ratings": {
    "version_id_1": {
      "user_rating": 3,
      "aggregate": {
        "listened": 5,
        "liked": 3,
        "loved": 2
      }
    }
  }
}
```

### POST /api/ratings
Create or update rating.

**Request:**
```json
{
  "version_id": "uuid",
  "playlist_id": "uuid",
  "rating": 3 // 1=listened, 2=liked, 3=loved
}
```

### DELETE /api/ratings/:id
Remove rating.

## Comment Endpoints

### GET /api/versions/:id/comments
Get comments for a version in a playlist.

**Query Parameters:**
- `playlist_id`: Required playlist context

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "John Doe"
      },
      "timestamp_ms": 45000,
      "comment_text": "Love this part!",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/comments
Add new comment.

**Request:**
```json
{
  "version_id": "uuid",
  "playlist_id": "uuid",
  "timestamp_ms": 45000,
  "comment_text": "Great transition here"
}
```

## Sharing Endpoints

### POST /api/playlists/:id/share
Create share link.

**Request:**
```json
{
  "permissions": "listen" | "rate" | "comment",
  "share_type": "link" | "phone" | "email",
  "recipients": ["phone_or_email"], // optional for phone/email
  "expires_at": "2024-02-01T00:00:00Z" // optional
}
```

**Response:**
```json
{
  "share": {
    "id": "uuid",
    "share_token": "abc123def456",
    "share_url": "https://coretet.app/shared/abc123def456",
    "permissions": "rate",
    "expires_at": null
  }
}
```

### GET /api/playlists/:id/shares
Get active shares for a playlist.

**Response:**
```json
{
  "shares": [
    {
      "id": "uuid",
      "share_token": "abc123",
      "permissions": "rate",
      "share_type": "link",
      "access_count": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "last_accessed_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### DELETE /api/shares/:id
Revoke a share.

## File Upload

### POST /api/upload/prepare
Get signed URL for Backblaze upload.

**Request:**
```json
{
  "filename": "song.mp3",
  "file_size": 5242880,
  "content_type": "audio/mpeg"
}
```

**Response:**
```json
{
  "upload_url": "https://backblaze...",
  "file_id": "backblaze_file_id",
  "expires_at": "2024-01-01T01:00:00Z"
}
```

### POST /api/upload/complete
Confirm upload completion.

**Request:**
```json
{
  "file_id": "backblaze_file_id",
  "file_url": "https://backblaze..."
}
```

## Duplicate Detection

### GET /api/duplicates
Get potential duplicate files.

**Response:**
```json
{
  "duplicates": [
    {
      "group": [
        {
          "id": "uuid1",
          "title": "Song v1",
          "file_size": 5242880,
          "duration_seconds": 180
        },
        {
          "id": "uuid2",
          "title": "Song v1 copy",
          "file_size": 5242880,
          "duration_seconds": 180
        }
      ],
      "match_confidence": 0.95
    }
  ]
}
```

### POST /api/duplicates/resolve
Resolve duplicate group.

**Request:**
```json
{
  "action": "keep_all" | "keep_one" | "merge",
  "version_ids": ["uuid1", "uuid2"],
  "keep_version_id": "uuid1" // if keep_one
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // optional additional context
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Missing or invalid auth token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **Authentication**: 5 requests per minute per phone
- **API calls**: 100 requests per minute per user
- **Upload**: 10 concurrent uploads per user
- **Sharing**: 20 shares per hour per playlist

## Webhooks (Future)

### Playlist Activity
```json
{
  "event": "track.rated",
  "playlist_id": "uuid",
  "version_id": "uuid",
  "user_id": "uuid",
  "rating": 3,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## WebSocket Events (Future)

### Real-time Collaboration
```javascript
// Subscribe to playlist updates
ws.send({
  action: 'subscribe',
  playlist_id: 'uuid'
});

// Receive updates
ws.on('message', {
  type: 'rating.added',
  data: {
    version_id: 'uuid',
    user_id: 'uuid',
    rating: 3
  }
});
```

## SDK Usage Examples

### JavaScript/TypeScript
```javascript
import { CoreTetClient } from '@coretet/sdk';

const client = new CoreTetClient({
  apiKey: process.env.CORETET_API_KEY
});

// Upload version
const version = await client.versions.create({
  title: 'My Song',
  file: audioFile
});

// Create playlist
const playlist = await client.playlists.create({
  name: 'January Rehearsal'
});

// Add track
await client.playlists.addTrack(playlist.id, {
  version_id: version.id
});

// Share playlist
const share = await client.playlists.share(playlist.id, {
  permissions: 'rate',
  share_type: 'link'
});
```

## Testing

### Test Endpoints
- `POST /api/test/reset` - Reset test account data
- `GET /api/test/health` - Health check

### Test Credentials
```
Phone: +15555550100
Code: 123456 (always valid in test mode)
```