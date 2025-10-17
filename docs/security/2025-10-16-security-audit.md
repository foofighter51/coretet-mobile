# Security & UX Audit Report - CoreTet Band Collaboration App
**Date**: 2025-10-16
**Status**: PRE-PUBLIC BETA READINESS REVIEW
**Auditor**: Claude Code AI Assistant
**Scope**: Full application security and UX review before opening to public testers

---

## ⚠️ EXECUTIVE SUMMARY

**RECOMMENDATION: DO NOT OPEN TO PUBLIC TESTERS UNTIL CRITICAL ISSUES ARE RESOLVED**

### Critical Findings:
- **5 CRITICAL** security vulnerabilities identified
- **3 HIGH** priority security issues found
- **4 CRITICAL** UX blockers identified
- **Estimated Fix Time**: 4-5 weeks for all critical issues

### Most Urgent Issue:
**Tracks table RLS is DISABLED** - All authenticated users can access/modify ALL tracks from ALL users and bands. This is a catastrophic privacy and security vulnerability.

---

## 🔴 CRITICAL SECURITY ISSUES (MUST FIX BEFORE PUBLIC BETA)

### 1. Tracks Table RLS Completely Disabled
**Risk Level**: CRITICAL (10/10)
**Location**: `supabase/migrations/20251003_disable_tracks_rls.sql`

**Issue**:
```sql
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
-- Comment says: "We trust Clerk authentication on the client side"
```

**Impact**:
- Any authenticated user can query ALL tracks from ALL users
- Users can modify/delete other users' tracks
- Band-private content is exposed to non-members
- Personal tracks are visible to everyone
- No data isolation whatsoever

**Exploitation**:
```typescript
// Any user can do this:
const { data } = await supabase.from('tracks').select('*');
// Returns EVERYONE's tracks, including private ones
```

**Fix Required**:
```sql
-- Re-enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own tracks
CREATE POLICY "Users can view own tracks"
  ON tracks FOR SELECT
  USING (created_by::text = public.clerk_user_id());

-- Policy 2: Users can view band tracks if they're members
CREATE POLICY "Users can view band tracks"
  ON tracks FOR SELECT
  USING (
    band_id IN (
      SELECT band_id
      FROM band_members
      WHERE user_id::text = public.clerk_user_id()
    )
  );

-- Policy 3: Users can view tracks in playlists they follow
CREATE POLICY "Users can view followed playlist tracks"
  ON tracks FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT pi.track_id
      FROM playlist_items pi
      JOIN playlist_followers pf ON pf.playlist_id = pi.playlist_id
      WHERE pf.user_id::text = public.clerk_user_id()
    )
  );

-- Insert/Update/Delete policies
CREATE POLICY "Users can insert own tracks"
  ON tracks FOR INSERT
  WITH CHECK (created_by::text = public.clerk_user_id());

CREATE POLICY "Users can update own tracks"
  ON tracks FOR UPDATE
  USING (created_by::text = public.clerk_user_id());

CREATE POLICY "Users can delete own tracks"
  ON tracks FOR DELETE
  USING (created_by::text = public.clerk_user_id());
```

**Estimated Fix Time**: 4-6 hours (including testing)

---

### 2. No File Upload Validation or Size Limits
**Risk Level**: CRITICAL (9/10)
**Location**: `src/utils/audioUploadService.ts`

**Issue**:
- No file type validation (users could upload executables, malware, etc.)
- No file size limits (users could upload multi-GB files)
- No virus scanning
- No content-type verification

**Impact**:
- Storage abuse ($$$ costs)
- Potential malware distribution
- App slowdown from huge files
- Potential DoS attacks

**Current Code**:
```typescript
// audioUploadService.ts - Missing validations
export const uploadAudioFile = async (file: File) => {
  // No checks on file.type, file.size, file.name
  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(filePath, file);
}
```

**Fix Required**:
```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/flac'];
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac'];

export const uploadAudioFile = async (file: File) => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only audio files are allowed.');
  }

  // Validate file extension
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file extension.');
  }

  // Sanitize filename (prevent path traversal)
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Rest of upload logic...
}
```

**Additional Requirements**:
- Set Supabase storage bucket size limits
- Implement per-user upload quota (e.g., 1GB total)
- Add virus scanning (ClamAV or service like VirusTotal)

**Estimated Fix Time**: 6-8 hours

---

### 3. Playlist Followers Can Be Added Without Consent
**Risk Level**: CRITICAL (8/10)
**Location**: `lib/supabase.ts` - `playlists.addFollower()`

**Issue**:
- Any user can add ANY other user as a follower to ANY playlist
- No invitation/acceptance flow
- Users get surprise content in their "Following" tab
- Potential for spam/harassment

**Current Code**:
```typescript
async addFollower(playlistId: string, userId: string) {
  // No check if user consented
  // No check if user is being spammed
  const { error } = await supabase
    .from('playlist_followers')
    .insert({ playlist_id: playlistId, user_id: userId });
}
```

**Impact**:
- User A can force user B to "follow" inappropriate playlists
- No way for users to opt out
- Privacy violation (tracks what users are following)

**Fix Required**:
1. Create `playlist_invites` table with pending/accepted/declined status
2. Implement invitation flow:
   - User A invites User B → creates pending invite
   - User B gets notification
   - User B accepts/declines
   - Only on accept → add to followers
3. Add setting: "Allow anyone to invite me" (default: false)

**Estimated Fix Time**: 8-12 hours

---

### 4. No Rate Limiting on Comments/Ratings
**Risk Level**: CRITICAL (7/10)
**Location**: `lib/supabase.ts` - `comments.create()`, `ratings.upsert()`

**Issue**:
- Users can spam comments infinitely
- Users can flood with ratings
- No throttling on any user actions
- Potential for abuse and harassment

**Impact**:
- Comment spam floods band discussions
- Malicious users can disrupt collaboration
- Database bloat
- Notification spam (if implemented)

**Fix Required**:
```typescript
// Implement rate limiting using Supabase Edge Functions or client-side tracking

// Option 1: Client-side (temporary)
const rateLimitCache = new Map<string, number[]>();

function checkRateLimit(userId: string, action: string, limit: number, windowMs: number): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = rateLimitCache.get(key) || [];

  // Remove old timestamps outside window
  const recentTimestamps = timestamps.filter(t => now - t < windowMs);

  if (recentTimestamps.length >= limit) {
    return false; // Rate limit exceeded
  }

  recentTimestamps.push(now);
  rateLimitCache.set(key, recentTimestamps);
  return true;
}

// Usage:
async function createComment(content: string) {
  if (!checkRateLimit(userId, 'comment', 10, 60000)) { // 10 comments per minute
    throw new Error('Too many comments. Please slow down.');
  }
  // Create comment...
}

// Option 2: Supabase Edge Function (better)
// Create edge function that tracks requests in Redis/KV store
```

**Recommended Limits**:
- Comments: 10 per minute, 100 per hour
- Ratings: 30 per minute (swipe through tracks)
- Uploads: 5 per hour, 20 per day
- Playlist creation: 10 per day

**Estimated Fix Time**: 12-16 hours (with Edge Functions)

---

### 5. Band Invites Not Validated
**Risk Level**: CRITICAL (7/10)
**Location**: `src/components/molecules/CreateInvite.tsx`, `src/components/screens/AcceptInvite.tsx`

**Issue**:
- Band invite system appears incomplete
- No expiration on invites
- Potential for invite link sharing abuse
- No revocation mechanism

**Impact**:
- Expired invites can be used indefinitely
- Removed members can re-join with old links
- No audit trail of who joined via which invite

**Fix Required**:
1. Add expiration to invites (7 days default)
2. Add `used_at` timestamp and `used_by` field
3. Add invite revocation by band owner
4. Add max uses per invite (default: 1 or unlimited for permanent links)
5. Add audit log

**Estimated Fix Time**: 6-8 hours

---

## 🟡 HIGH PRIORITY SECURITY ISSUES

### 6. No Input Sanitization on User Content
**Risk Level**: HIGH (6/10)
**Location**: Multiple (playlist titles, comments, track names)

**Issue**:
- User input is rendered without sanitization
- Potential XSS if React escaping is bypassed
- SQL injection unlikely (Supabase prevents) but input should still be validated

**Fix**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize all user inputs before storage
function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }); // Strip all HTML
}

// Add max length limits
const MAX_LENGTHS = {
  playlistTitle: 100,
  comment: 1000,
  trackTitle: 200,
  bandName: 50,
};
```

---

### 7. Supabase Anon Key Exposed in Client Code
**Risk Level**: HIGH (6/10)
**Location**: Environment variables / build output

**Issue**:
- Supabase anon key is necessarily exposed in client
- RLS policies are the ONLY protection
- If RLS is misconfigured → full database access

**Mitigation**:
- This is by design for Supabase, BUT:
- RLS MUST be correctly configured (see issue #1)
- Enable Supabase auth rate limiting
- Monitor for abnormal API usage
- Consider IP-based restrictions

---

### 8. No User Blocking or Reporting Mechanism
**Risk Level**: HIGH (5/10)

**Issue**:
- No way to report abusive users
- No way to block users
- No moderation tools

**Fix Required**:
- Add "Report User" functionality
- Add "Block User" feature (hides their content)
- Add admin moderation dashboard
- Create terms of service and community guidelines

---

## 🔵 MEDIUM PRIORITY SECURITY ISSUES

### 9. Error Messages Expose Internal Info
**Risk Level**: MEDIUM (4/10)

**Issue**:
```typescript
console.error('Error fetching tracks:', error);
// Exposes database structure, table names, etc.
```

**Fix**: Use generic error messages for users, log details server-side only.

---

### 10. No HTTPS Enforcement Check
**Risk Level**: MEDIUM (3/10)

**Issue**: App should verify it's running over HTTPS

**Fix**: Add connection security check on startup

---

## 🔴 CRITICAL UX ISSUES

### UX-1: No Onboarding Flow
**Impact**: Users don't understand app purpose or how to get started

**Fix**:
- Add welcome screen explaining band collaboration concept
- Add guided tour for first-time users
- Show sample band/playlist as example

---

### UX-2: No Loading States on Critical Operations
**Impact**: Users don't know if upload/operation is working

**Fix**:
- Add progress bars for uploads
- Add spinners for all async operations
- Add timeout warnings for slow operations

---

### UX-3: Destructive Actions Have No Confirmation
**Impact**: Accidental deletions

**Fix**: Add confirmation dialogs for:
- Delete playlist
- Remove track from playlist
- Leave band
- Delete band

---

### UX-4: No Empty States for New Users
**Impact**: Confusing blank screens

**Fix**: Add helpful empty states:
- "Create your first band"
- "Upload your first track"
- "Create a playlist"

---

## 📋 PRE-PUBLIC BETA CHECKLIST

### Must Complete Before Opening:
- [ ] **Re-enable RLS on tracks table with proper policies** (Issue #1)
- [ ] **Add file upload validation and limits** (Issue #2)
- [ ] **Fix playlist follower consent issue** (Issue #3)
- [ ] **Implement rate limiting** (Issue #4)
- [ ] **Secure band invite system** (Issue #5)
- [ ] **Add input sanitization** (Issue #6)
- [ ] **Add user blocking/reporting** (Issue #8)
- [ ] **Create Terms of Service**
- [ ] **Create Privacy Policy**
- [ ] **Add onboarding flow** (UX-1)

### Should Complete Before Opening:
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Set up security incident response plan
- [ ] Create admin moderation dashboard
- [ ] Add user activity logging
- [ ] Implement backup strategy

### Can Do After Opening (Monitor Closely):
- [ ] Fine-tune rate limits based on usage
- [ ] Add more sophisticated abuse detection
- [ ] Implement content moderation tools
- [ ] Add analytics and monitoring

---

## 🎯 RECOMMENDED APPROACH

### Phase 1: Critical Security (Week 1-2)
1. Re-enable tracks RLS ⚠️ HIGHEST PRIORITY
2. Add file upload validation
3. Implement basic rate limiting

### Phase 2: User Safety (Week 3)
4. Fix playlist follower consent
5. Secure band invites
6. Add reporting/blocking

### Phase 3: Polish & Legal (Week 4)
7. Input sanitization
8. Terms of Service / Privacy Policy
9. Onboarding flow

### Phase 4: Monitoring (Week 5+)
10. Error monitoring setup
11. Security audit tooling
12. Incident response plan

---

## 🔐 SECURITY MONITORING RECOMMENDATIONS

Once opened to public:

1. **Monitor Database Activity**:
   - Track unusual query patterns
   - Alert on bulk data exports
   - Monitor failed auth attempts

2. **User Behavior Monitoring**:
   - Track upload frequency
   - Monitor comment spam patterns
   - Alert on rapid account creation

3. **Resource Monitoring**:
   - Storage usage trends
   - Bandwidth consumption
   - Database query performance

4. **Incident Response Plan**:
   - Document: Who to contact
   - Document: How to disable accounts
   - Document: How to roll back changes
   - Document: Data breach response

---

## 📄 SUGGESTED TERMS & GUIDELINES

### Minimum Required:
1. **Terms of Service**:
   - Content ownership
   - Acceptable use policy
   - Account termination clause
   - Limitation of liability

2. **Privacy Policy**:
   - What data is collected
   - How data is used
   - Third-party services (Supabase, Clerk)
   - User data rights (GDPR/CCPA)

3. **Community Guidelines**:
   - No harassment
   - No spam
   - No malicious content
   - Respect intellectual property

4. **Copyright Policy** (DMCA):
   - How to report copyright infringement
   - Takedown process

---

## 💰 COST IMPLICATIONS

### Immediate Costs to Address:
- **Storage**: Need quotas to prevent abuse ($$)
- **Bandwidth**: Unvalidated uploads could drain budget ($$$)
- **Database**: No rate limiting could cause usage spikes ($$)

### Estimated Monthly Costs (Without Fixes):
- **Worst Case**: $500-$1000/month if 100 users abuse upload
- **With Fixes**: $50-$100/month for 100 active users

---

## ✅ CONCLUSION

**Current State**: App is NOT ready for public beta. Critical security vulnerabilities could lead to:
- Data breaches
- Privacy violations
- Financial loss from abuse
- Reputation damage
- Legal liability

**Estimated Time to Public Beta Ready**: 4-5 weeks of focused development

**Recommended Path**:
1. Fix critical security issues (#1-#5)
2. Add basic monitoring
3. Soft launch with invite-only (50-100 users)
4. Monitor for 2-3 weeks
5. Address any issues found
6. Open to public with rate limits and monitoring

---

**Report Generated**: 2025-10-16
**Next Audit Recommended**: After critical fixes, before public launch
**Point of Contact**: Development team

