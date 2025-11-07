# CoreTet Database Schema Reference

**Last Updated:** 2025-11-06
**Source of Truth:** Supabase Database (use `npm run db:types` to sync)

> ⚠️ **IMPORTANT**: This is a living document. Always verify against generated types in `/lib/database.types.ts`

---

## Quick Reference

### Core Tables
- [profiles](#profiles) - User accounts
- [bands](#bands) - Music groups/workspaces
- [band_members](#band_members) - Band membership
- [band_invites](#band_invites) - Invitation system
- [tracks](#tracks) - Audio files
- [playlists](#playlists) - Track collections
- [playlist_items](#playlist_items) - Playlist-track relationships
- [comments](#comments) - Feedback on tracks
- [track_ratings](#track_ratings) - Track ratings (listened/liked/loved)

---

## Table Definitions

### profiles
**User account information**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | TEXT | NO | - | Primary key, references auth.users |
| `name` | TEXT | NO | - | Display name |
| `email` | TEXT | YES | - | Email address |
| `phone` | TEXT | YES | - | Phone number |
| `phone_number` | TEXT | YES | - | Alternative phone field |
| `avatar_url` | TEXT | YES | - | Profile image URL |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Account creation |
| `updated_at` | TIMESTAMPTZ | YES | NOW() | Last profile update |

**Indexes:**
- Primary key on `id`
- Unique on `email` (if used)

---

### bands
**Music groups or personal workspaces**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `name` | TEXT | NO | - | Band name |
| `created_by` | TEXT | NO | - | FK → profiles(id) |
| `is_personal` | BOOLEAN | YES | false | Personal workspace flag |
| `settings` | JSONB | YES | {} | Band configuration |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | YES | NOW() | Last update |

**Indexes:**
- Primary key on `id`

**RLS Policies:**
- Users can view bands they're members of
- Authenticated users can create bands
- Only owners can update/delete

---

### band_members
**Band membership and roles**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `band_id` | UUID | NO | - | FK → bands(id) CASCADE |
| `user_id` | TEXT | NO | - | FK → profiles(id) CASCADE |
| `role` | TEXT | NO | - | 'owner', 'admin', or 'member' |
| `joined_at` | TIMESTAMPTZ | YES | NOW() | Membership start |

**Constraints:**
- UNIQUE(band_id, user_id) - One role per user per band
- CHECK: role IN ('owner', 'admin', 'member')

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `band_id`

---

### band_invites
**Email-based band invitations**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `band_id` | UUID | NO | - | FK → bands(id) CASCADE |
| `invited_email` | TEXT | NO | - | Email address to invite |
| `invited_by` | TEXT | NO | - | FK → profiles(id) CASCADE |
| `role` | TEXT | NO | 'member' | Role to assign on accept |
| `status` | TEXT | NO | 'pending' | 'pending', 'accepted', 'declined', 'expired' |
| `invite_token` | TEXT | NO | gen_random_uuid() | Unique invite token |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Invite creation |
| `expires_at` | TIMESTAMPTZ | YES | NOW() + 7 days | Expiration time |
| `accepted_at` | TIMESTAMPTZ | YES | - | Acceptance timestamp |
| `accepted_by` | TEXT | YES | - | FK → profiles(id) - User who accepted |

**⚠️ CRITICAL COLUMN NAMES:**
- Use `invited_email` NOT `email`
- Use `invite_token` NOT `token`
- `accepted_by` DOES exist - use it when marking accepted

**Constraints:**
- UNIQUE(token)
- CHECK: role IN ('admin', 'member')
- CHECK: status IN ('pending', 'accepted', 'declined', 'expired')

**Indexes:**
- Primary key on `id`
- Unique index on `token`
- Index on `email`

---

### tracks
**Audio file uploads**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `title` | TEXT | NO | - | Track title |
| `file_url` | TEXT | NO | - | Storage URL |
| `file_size` | BIGINT | YES | - | Bytes |
| `duration_seconds` | INTEGER | YES | - | Track length |
| `created_by` | TEXT | NO | - | FK → profiles(id) |
| `folder_path` | TEXT | YES | - | Storage folder |
| `band_id` | UUID | YES | - | FK → bands(id) CASCADE |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Upload time |
| `updated_at` | TIMESTAMPTZ | YES | NOW() | Last update |

**Indexes:**
- Primary key on `id`
- Index on `created_by`
- Index on `band_id`

---

### playlists
**Track collections**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `title` | TEXT | NO | - | Playlist name |
| `description` | TEXT | YES | - | Optional description |
| `created_by` | TEXT | NO | - | FK → profiles(id) |
| `is_public` | BOOLEAN | YES | true | Public/private flag |
| `band_id` | UUID | YES | - | FK → bands(id) CASCADE |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | YES | NOW() | Last update |

**Indexes:**
- Primary key on `id`
- Index on `created_by`
- Index on `band_id`

---

### playlist_items
**Tracks within playlists (with ordering)**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `playlist_id` | UUID | NO | - | FK → playlists(id) CASCADE |
| `track_id` | UUID | NO | - | FK → tracks(id) CASCADE |
| `added_by` | TEXT | NO | - | FK → profiles(id) |
| `position` | INTEGER | NO | - | Track order (0-indexed) |
| `added_at` | TIMESTAMPTZ | YES | NOW() | Addition time |

**Constraints:**
- UNIQUE(playlist_id, track_id) - No duplicates
- UNIQUE(playlist_id, position) - Unique ordering

**Indexes:**
- Primary key on `id`
- Index on `playlist_id`

---

### comments
**Timestamped feedback on tracks**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `track_id` | UUID | NO | - | FK → tracks(id) CASCADE |
| `user_id` | TEXT | NO | - | FK → profiles(id) |
| `content` | TEXT | NO | - | Comment text |
| `timestamp_seconds` | INTEGER | YES | - | Position in track |
| `band_id` | UUID | YES | - | FK → bands(id) CASCADE |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Comment time |
| `updated_at` | TIMESTAMPTZ | YES | NOW() | Last edit |

**Indexes:**
- Primary key on `id`
- Index on `track_id`
- Index on `band_id`

---

### track_ratings
**User ratings for tracks**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `track_id` | UUID | NO | - | FK → tracks(id) CASCADE |
| `user_id` | TEXT | NO | - | FK → profiles(id) |
| `rating` | TEXT | NO | - | 'listened', 'liked', or 'loved' |
| `band_id` | UUID | YES | - | FK → bands(id) CASCADE |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Rating time |
| `updated_at` | TIMESTAMPTZ | YES | NOW() | Last update |

**Constraints:**
- UNIQUE(track_id, user_id, band_id) - One rating per context
- CHECK: rating IN ('listened', 'liked', 'loved')

---

## Workflow: Schema Changes

### 1. Making Schema Changes

```bash
# 1. Make changes in Supabase Dashboard → SQL Editor
# 2. Save migration SQL file in /migrations/

# Example: migrations/add_new_column.sql
ALTER TABLE band_members ADD COLUMN last_active_at TIMESTAMPTZ;
```

### 2. Update TypeScript Types

```bash
# Regenerate types from updated schema
npm run db:types

# This will update lib/database.types.ts
```

### 3. Update Code

```typescript
// Now use the generated types
import { Database } from '../lib/database.types';

type BandMember = Database['public']['Tables']['band_members']['Row'];
type BandMemberInsert = Database['public']['Tables']['band_members']['Insert'];
```

### 4. Update Documentation

```bash
# Update this file (DATABASE_SCHEMA.md) with new columns
# Update any relevant code comments
```

### 5. Commit Changes

```bash
git add lib/database.types.ts
git add docs/DATABASE_SCHEMA.md
git add migrations/add_new_column.sql
git commit -m "feat: add last_active_at to band_members"
```

---

## Common Pitfalls

### ❌ Using Wrong Column Names

```typescript
// WRONG - These columns don't exist!
await supabase.from('band_invites').insert({
  invited_email: email,  // ❌ Should be: email
  invite_token: token,   // ❌ Should be: token
  accepted_by: userId,   // ❌ Doesn't exist at all!
})
```

```typescript
// CORRECT
await supabase.from('band_invites').insert({
  email: email,          // ✅ Correct column name
  token: token,          // ✅ Correct column name
  // accepted_by not used // ✅ Column doesn't exist
})
```

### ✅ Use Generated Types

```typescript
import { Database } from '../lib/database.types';

type BandInviteInsert = Database['public']['Tables']['band_invites']['Insert'];

// TypeScript will catch column name errors!
const invite: BandInviteInsert = {
  band_id: bandId,
  email: email,        // ✅ Autocomplete works
  invited_by: userId,
  token: token,
  status: 'pending',
  expires_at: expiryDate,
};
```

---

## Maintenance Checklist

- [ ] Run `npm run db:types` after any schema changes
- [ ] Update this document when adding/removing tables
- [ ] Test database operations after type regeneration
- [ ] Commit both `.types.ts` and documentation changes together
- [ ] Use generated types in all database operations
- [ ] Never hardcode column names without checking schema

---

**Questions?** Check the generated types in `/lib/database.types.ts` for the source of truth.
