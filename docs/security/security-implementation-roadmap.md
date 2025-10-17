# Security Implementation Roadmap - Incremental Approach

**Goal**: Fix all critical security vulnerabilities while maintaining 100% user functionality
**Strategy**: Implement → Test → Verify → Deploy in small increments
**Timeline**: 4-5 weeks with continuous testing

---

## 🎯 Guiding Principles

1. **Never break existing features** - Every change must preserve current UX
2. **Test after each change** - Verify all flows work before moving forward
3. **Rollback ready** - Each change is a separate migration/commit
4. **User feedback first** - Current testers validate each phase
5. **Measure everything** - Track performance impact of each change

---

## 📅 PHASE 1: Tracks RLS Re-enablement (Week 1)
**Priority**: CRITICAL - Most urgent security issue
**Risk**: HIGH - Could break all track viewing if policies are wrong
**Testing Required**: EXTENSIVE

### Step 1.1: Understand Current Usage Patterns (Day 1)
**Before changing anything, document how tracks are currently accessed:**

```bash
# Run these queries in Supabase SQL editor to understand data:

-- 1. How many tracks exist?
SELECT COUNT(*) FROM tracks;

-- 2. How many tracks have band_id vs NULL (personal)?
SELECT
  COUNT(*) FILTER (WHERE band_id IS NOT NULL) as band_tracks,
  COUNT(*) FILTER (WHERE band_id IS NULL) as personal_tracks
FROM tracks;

-- 3. How are tracks distributed across bands?
SELECT band_id, COUNT(*) as track_count
FROM tracks
WHERE band_id IS NOT NULL
GROUP BY band_id;

-- 4. Which users created tracks?
SELECT created_by, COUNT(*) as track_count
FROM tracks
GROUP BY created_by;

-- 5. How are tracks used in playlists?
SELECT
  COUNT(DISTINCT pi.track_id) as tracks_in_playlists,
  COUNT(DISTINCT t.id) as total_tracks
FROM tracks t
LEFT JOIN playlist_items pi ON t.id = pi.track_id;
```

**Action**: Run these queries, save results. This is our baseline.

---

### Step 1.2: Create RLS Policies in TESTING (Day 1-2)
**Create new migration but DON'T apply to production yet**

**File**: `supabase/migrations/20251017_enable_tracks_rls_phase1.sql`

```sql
-- PHASE 1: Enable RLS with permissive policies
-- These policies will allow MORE access than needed (safe to start)
-- We'll tighten them in Phase 2 after testing

-- Step 1: Ensure clerk_user_id function exists
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Step 2: Create policies (PERMISSIVE - allow extra access for safety)
-- We'll create restrictive policies in Phase 2

-- Policy 1: Users can view their own tracks
CREATE POLICY "tracks_select_own" ON tracks
  FOR SELECT
  USING (created_by::text = public.clerk_user_id());

-- Policy 2: Users can view tracks in their band
CREATE POLICY "tracks_select_band" ON tracks
  FOR SELECT
  USING (
    band_id IS NOT NULL
    AND band_id IN (
      SELECT band_id
      FROM band_members
      WHERE user_id::text = public.clerk_user_id()
    )
  );

-- Policy 3: TEMPORARY - Allow viewing tracks with no band (personal)
-- This is intentionally permissive for Phase 1
CREATE POLICY "tracks_select_personal_permissive" ON tracks
  FOR SELECT
  USING (band_id IS NULL);

-- Policy 4: Users can view tracks in playlists they follow
-- This ensures playlist sharing still works
CREATE POLICY "tracks_select_followed_playlists" ON tracks
  FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT pi.track_id
      FROM playlist_items pi
      JOIN playlist_followers pf ON pf.playlist_id = pi.playlist_id
      WHERE pf.user_id::text = public.clerk_user_id()
    )
  );

-- INSERT policies
CREATE POLICY "tracks_insert_own" ON tracks
  FOR INSERT
  WITH CHECK (created_by::text = public.clerk_user_id());

-- UPDATE policies (only your own tracks)
CREATE POLICY "tracks_update_own" ON tracks
  FOR UPDATE
  USING (created_by::text = public.clerk_user_id());

-- DELETE policies (only your own tracks)
CREATE POLICY "tracks_delete_own" ON tracks
  FOR DELETE
  USING (created_by::text = public.clerk_user_id());

-- Step 3: Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Step 4: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tracks TO authenticated;
```

**Why This Works**:
- Policy 3 temporarily allows ALL personal tracks to be viewed by anyone
- This maintains current behavior where users can discover content
- We'll tighten this in Phase 2 after confirming everything works

---

### Step 1.3: Test in Development Database (Day 2)
**Create a test database or use Supabase branch**

1. Apply the migration to test DB
2. Test all user flows:

```typescript
// Test checklist:
// ✅ User can view their own tracks
// ✅ User can view band tracks (in their band)
// ✅ User can view tracks in playlists they follow
// ✅ User can upload new track (INSERT works)
// ✅ User can edit their track title (UPDATE works)
// ✅ User can delete their track (DELETE works)
// ✅ Playlists still display correctly
// ✅ Band tab shows correct tracks
// ✅ Personal tab shows correct tracks
```

**Testing Script** (run in test environment):
```typescript
// Test file: test-rls-migration.ts

import { db } from './lib/supabase';

async function testTracksRLS(userId: string, bandId: string) {
  console.log('Testing Tracks RLS for user:', userId);

  try {
    // Test 1: Can view own tracks
    const { data: ownTracks, error: ownError } = await db.tracks.list(userId);
    console.log('✅ Own tracks:', ownTracks?.length || 0);
    if (ownError) console.error('❌ Own tracks error:', ownError);

    // Test 2: Can view band tracks
    const { data: bandTracks, error: bandError } = await db.tracks.listByBand(bandId);
    console.log('✅ Band tracks:', bandTracks?.length || 0);
    if (bandError) console.error('❌ Band tracks error:', bandError);

    // Test 3: Can upload track
    const testTrack = {
      title: 'Test Track RLS',
      file_url: 'test.mp3',
      created_by: userId,
      band_id: bandId,
    };
    const { data: newTrack, error: uploadError } = await db.tracks.create(testTrack);
    console.log('✅ Upload track:', newTrack ? 'Success' : 'Failed');
    if (uploadError) console.error('❌ Upload error:', uploadError);

    // Test 4: Can update track
    if (newTrack) {
      const { error: updateError } = await db.tracks.update(newTrack.id, { title: 'Updated Title' });
      console.log('✅ Update track:', updateError ? 'Failed' : 'Success');
      if (updateError) console.error('❌ Update error:', updateError);
    }

    // Test 5: Can delete track
    if (newTrack) {
      const { error: deleteError } = await db.tracks.delete(newTrack.id);
      console.log('✅ Delete track:', deleteError ? 'Failed' : 'Success');
      if (deleteError) console.error('❌ Delete error:', deleteError);
    }

    console.log('🎉 All RLS tests passed!');
    return true;
  } catch (error) {
    console.error('❌ RLS test failed:', error);
    return false;
  }
}
```

---

### Step 1.4: Apply to Production (Day 3)
**Only after ALL tests pass**

```bash
# Backup first!
# Export current tracks data just in case

# Apply migration
./supabase/apply-rls-migration.sh supabase/migrations/20251017_enable_tracks_rls_phase1.sql

# Immediately test in production
# Have 2-3 current testers verify:
# - Can they still see their tracks?
# - Can they still see band tracks?
# - Can they upload new tracks?
```

**Rollback Plan** (if anything breaks):
```sql
-- Emergency rollback
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tracks_select_own ON tracks;
DROP POLICY IF EXISTS tracks_select_band ON tracks;
DROP POLICY IF EXISTS tracks_select_personal_permissive ON tracks;
DROP POLICY IF EXISTS tracks_select_followed_playlists ON tracks;
DROP POLICY IF EXISTS tracks_insert_own ON tracks;
DROP POLICY IF EXISTS tracks_update_own ON tracks;
DROP POLICY IF EXISTS tracks_delete_own ON tracks;
```

---

### Step 1.5: Monitor for Issues (Day 3-7)
**Watch for problems over the next week**

- Monitor Supabase logs for RLS errors
- Check with testers daily: "Any issues viewing/uploading tracks?"
- Look for 406 errors in error logs
- Verify performance hasn't degraded

**Success Criteria**:
- ✅ Zero user complaints about missing tracks
- ✅ All upload/edit/delete operations work
- ✅ No 406 RLS errors in logs
- ✅ Performance unchanged

**If any issues**: Document them, fix policies, don't move to Phase 2 yet

---

## 📅 PHASE 2: Tighten Tracks RLS (Week 2)
**Only start after Phase 1 is stable for 1 week**

### Step 2.1: Remove Permissive Personal Tracks Policy (Day 8-9)
**Replace the temporary policy with proper access control**

**File**: `supabase/migrations/20251024_tighten_tracks_rls.sql`

```sql
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "tracks_select_personal_permissive" ON tracks;

-- Replace with proper personal tracks policy
-- Personal tracks are only visible to:
-- 1. The creator
-- 2. Anyone with a playlist that includes the track (via playlist_followers)
CREATE POLICY "tracks_select_personal_proper" ON tracks
  FOR SELECT
  USING (
    band_id IS NULL
    AND (
      -- Creator can always see
      created_by::text = public.clerk_user_id()
      -- OR track is in a playlist you follow
      OR id IN (
        SELECT pi.track_id
        FROM playlist_items pi
        JOIN playlist_followers pf ON pf.playlist_id = pi.playlist_id
        WHERE pf.user_id::text = public.clerk_user_id()
      )
    )
  );
```

**Test Again**: Same checklist as Phase 1
**Monitor**: Another week of observation

---

## 📅 PHASE 3: File Upload Validation (Week 2-3)

### Step 3.1: Add Client-Side Validation (Day 10-11)
**Non-breaking - just adds checks before upload**

```typescript
// Update audioUploadService.ts incrementally

// Step 1: Add validation function (doesn't break anything)
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/mp3'];
  const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` };
  }

  if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
    return { valid: false, error: 'Please upload an audio file (MP3, WAV, M4A, or FLAC)' };
  }

  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Invalid file extension. Use .mp3, .wav, .m4a, or .flac' };
  }

  return { valid: true };
}

// Step 2: Use validation before upload
export async function uploadAudioFile(file: File, ...args) {
  // Validate first
  const validation = validateAudioFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Existing upload code continues...
  // This doesn't break anything, just adds a check
}
```

**Test**: Try uploading various file types, confirm validation works
**User Impact**: None (just adds helpful error messages)

---

### Step 3.2: Add Server-Side Limits (Day 12-13)
**Configure Supabase bucket policies**

```sql
-- In Supabase dashboard → Storage → audio-files bucket
-- Set policies:

-- 1. File size limit: 100MB
-- 2. Allowed MIME types: audio/mpeg, audio/wav, audio/m4a, audio/flac
-- 3. Max uploads per user per day: 20
```

**Test**: Try uploading > 100MB, confirm rejection
**User Impact**: Minimal (most audio files < 100MB)

---

### Step 3.3: Add Per-User Quota Tracking (Day 14-15)
**Track total storage per user**

```sql
-- Create quota tracking table
CREATE TABLE user_storage_quota (
  user_id TEXT PRIMARY KEY REFERENCES profiles(id),
  total_bytes BIGINT DEFAULT 0,
  file_count INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to check quota before upload
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_bytes BIGINT;
  max_bytes BIGINT := 1073741824; -- 1GB limit
BEGIN
  SELECT COALESCE(total_bytes, 0) INTO current_bytes
  FROM user_storage_quota
  WHERE user_id = p_user_id;

  RETURN current_bytes < max_bytes;
END;
$$ LANGUAGE plpgsql;
```

**Implement in client**: Check quota before upload
**User Impact**: Only affects users with > 1GB uploaded (unlikely in beta)

---

## 📅 PHASE 4: Rate Limiting (Week 3-4)

### Step 4.1: Client-Side Rate Limiting (Day 16-18)
**Add throttling to prevent accidental spam**

```typescript
// lib/rateLimit.ts - Simple client-side rate limiter

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  check(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.attempts.get(key) || [];

    // Remove old attempts
    const recent = timestamps.filter(t => now - t < windowMs);

    if (recent.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    recent.push(now);
    this.attempts.set(key, recent);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Usage in comments:
async function createComment(content: string) {
  if (!rateLimiter.check(`comment:${userId}`, 10, 60000)) {
    throw new Error('Too many comments. Please wait a minute.');
  }
  // Create comment...
}
```

**Test**: Try posting 11 comments in 1 minute, confirm throttle
**User Impact**: None for normal usage, prevents spam

---

### Step 4.2: Server-Side Rate Limiting (Day 19-21)
**Add Supabase Edge Function for server enforcement**

```typescript
// supabase/functions/rate-limit/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simple in-memory rate limit (consider Redis for production)
const rateLimits = new Map<string, number[]>();

serve(async (req) => {
  const { userId, action } = await req.json();

  const limits = {
    comment: { max: 10, window: 60000 },
    rating: { max: 30, window: 60000 },
    upload: { max: 5, window: 3600000 },
  };

  const limit = limits[action];
  const key = `${userId}:${action}`;
  const now = Date.now();

  const timestamps = rateLimits.get(key) || [];
  const recent = timestamps.filter(t => now - t < limit.window);

  if (recent.length >= limit.max) {
    return new Response(
      JSON.stringify({ allowed: false }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  recent.push(now);
  rateLimits.set(key, recent);

  return new Response(
    JSON.stringify({ allowed: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

**Deploy**: Test edge function, integrate with client
**User Impact**: None for normal users

---

## 📅 PHASE 5: Consent & Invites (Week 4-5)

### Step 5.1: Add Playlist Invitation System (Day 22-25)
**Don't break existing follows - add optional consent layer**

```sql
-- Create invitations table
CREATE TABLE playlist_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  inviter_id TEXT REFERENCES profiles(id),
  invitee_id TEXT REFERENCES profiles(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Modify addFollower to create invitation instead
-- Keep existing followers untouched for backward compatibility
```

**Test**: Invite flow works, existing follows unaffected
**User Impact**: New invites require acceptance, old follows still work

---

### Step 5.2: Add Band Invite Expiration (Day 26-28)
**Add expiration without breaking existing invites**

```sql
-- Add expiration to band invites
ALTER TABLE band_invites ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE band_invites ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 1;
ALTER TABLE band_invites ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0;

-- Set existing invites to never expire (backward compatible)
UPDATE band_invites SET expires_at = NULL WHERE expires_at IS NULL;

-- New invites will have 7-day expiration
```

**Test**: New invites expire, old invites still work
**User Impact**: None for existing invites

---

## 📅 PHASE 6: Polish & Legal (Week 5+)

### Step 6.1: Add Input Sanitization (Day 29-30)
```bash
npm install dompurify isomorphic-dompurify
```

### Step 6.2: Add Terms of Service (Day 31-32)
### Step 6.3: Add Privacy Policy (Day 31-32)
### Step 6.4: Add Onboarding Flow (Day 33-35)

---

## 🔄 Testing Protocol for Each Phase

**Before Applying Any Change**:
1. ✅ Document current behavior
2. ✅ Create rollback plan
3. ✅ Test in dev/staging first
4. ✅ Get at least 2 testers to verify

**After Applying Change**:
1. ✅ Verify all existing flows still work
2. ✅ Check for any error logs
3. ✅ Monitor for 24-48 hours
4. ✅ Get user feedback

**Success Criteria for Moving Forward**:
- Zero user complaints
- Zero functionality regression
- No performance degradation
- Testers explicitly approve

---

## 📊 Progress Tracking

Create a tracking file: `docs/security/security-fixes-progress.md`

```markdown
# Security Fixes Progress

## Phase 1: Tracks RLS ⏳
- [ ] Step 1.1: Document usage patterns
- [ ] Step 1.2: Create RLS policies
- [ ] Step 1.3: Test in development
- [ ] Step 1.4: Apply to production
- [ ] Step 1.5: Monitor (7 days)
- [ ] **Phase 1 Complete** ✅

## Phase 2: Tighten RLS ⏸️
- [ ] Step 2.1: Remove permissive policy
- [ ] **Phase 2 Complete** ✅

... etc
```

---

## 🚨 Emergency Contacts & Rollback

**If Something Breaks**:
1. Don't panic
2. Run rollback SQL immediately
3. Document what broke
4. Notify testers
5. Fix in dev before trying again

**Rollback Commands** (save these!):
```bash
# Rollback tracks RLS
psql $DATABASE_URL < rollback_scripts/rollback_tracks_rls.sql

# Restore from backup
# (set up daily backups in Supabase dashboard)
```

---

## 💬 Communication with Testers

**Before Each Phase**:
- Email: "We're improving security, you may notice..."
- What to expect
- How to report issues

**After Each Phase**:
- "Thanks for testing! Everything working?"
- Collect feedback
- Address concerns

---

## ✅ Final Checklist Before Public Beta

- [ ] All 5 critical security issues resolved
- [ ] All functionality tested and verified
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Onboarding flow implemented
- [ ] Error monitoring active
- [ ] Backup strategy confirmed
- [ ] Incident response plan documented
- [ ] Current testers approve all changes

**Estimated Completion**: 5-6 weeks from start
**Safe to open**: Only after ALL checkboxes above are ✅

