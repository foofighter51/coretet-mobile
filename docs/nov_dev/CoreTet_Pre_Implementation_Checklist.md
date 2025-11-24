# CoreTet: Pre-Implementation Checklist for Claude Code

**Purpose:** Reference this before running any SQL scripts or updating code to ensure changes align with existing codebase and don't break functionality.

---

## Critical Questions Before ANY Code Changes

### 1. Understanding Current State
- [ ] What does the existing codebase structure look like?
- [ ] Which files/components are affected by this change?
- [ ] Are there dependencies on other features that might break?
- [ ] What database tables already exist?
- [ ] What are the current column names and types?

### 2. Database Schema Changes
**Before running ANY SQL script:**
- [ ] Have you backed up the database?
- [ ] Are you running on development database (not production)?
- [ ] Do foreign keys match existing table names exactly?
- [ ] Will this break existing queries in the codebase?
- [ ] Are you using the correct data types (UUID vs INT, etc.)?
- [ ] Do new columns have sensible defaults for existing rows?
- [ ] Are indexes needed for performance?

### 3. RLS (Row Level Security) Policies
**Before adding/modifying RLS policies:**
- [ ] Do existing policies conflict with new ones?
- [ ] Have you tested with different user roles?
- [ ] Can Band A member accidentally see Band B data?
- [ ] Do policies handle NULL values correctly (personal vs band)?
- [ ] Are policies using auth.uid() correctly?

### 4. API/Backend Changes
**Before modifying API endpoints:**
- [ ] What is the current request/response format?
- [ ] Are there mobile or web clients depending on this endpoint?
- [ ] Will this change break existing API calls?
- [ ] Do we need a migration path for old clients?
- [ ] Is error handling consistent with existing patterns?

### 5. UI/Component Changes
**Before modifying UI components:**
- [ ] Is this component shared between web and mobile?
- [ ] What are the current props/parameters?
- [ ] Are there existing CSS/styles that will break?
- [ ] Does this affect responsive layouts?
- [ ] Will this change confuse users with muscle memory?

---

## Feature-Specific Checks

### Track Engagement System (Listened/Liked/Loved)

**Before implementing:**
- [ ] Do any existing components reference "star_ratings" or "ratings" table?
- [ ] Where is playback progress currently tracked?
- [ ] How do we detect when user has listened >50%?
- [ ] Are there any rating displays that need updating?
- [ ] Search for: "rating", "star", "rate" in codebase

**After implementing:**
- [ ] Test: User listens to 30% → listened stays false
- [ ] Test: User listens to 60% → listened becomes true
- [ ] Test: User clicks "liked" → reaction saves correctly
- [ ] Test: User changes "liked" to "loved" → updates properly
- [ ] Test: Engagement counts display correctly (🎧 3/5 listened)

---

### Band Data Isolation (Producer Tier)

**Before implementing:**
- [ ] How is current_band_id being passed to queries?
- [ ] Are there any queries that don't filter by band_id?
- [ ] What happens when band_id is NULL (personal workspace)?
- [ ] Search for: "SELECT * FROM tracks WHERE" (check all queries)

**Critical tests to run:**
```sql
-- Test 1: Band A member tries to access Band B
SET ROLE band_member_a;
SELECT * FROM tracks WHERE band_id = 'band_b_id';
-- Expected: Empty result (or error)

-- Test 2: Producer switches context
SET LOCAL app.current_band_id = 'band_a_id';
SELECT * FROM tracks WHERE band_id = 'band_a_id';
-- Expected: Band A tracks only

-- Test 3: Producer without context
SET LOCAL app.current_band_id = NULL;
SELECT * FROM tracks WHERE band_id IS NOT NULL;
-- Expected: Empty (or error - no cross-band queries)
```

**After implementing:**
- [ ] Verified: Band A member cannot see Band B tracks
- [ ] Verified: Producer sees only current band context
- [ ] Verified: Personal workspace (band_id = NULL) works
- [ ] Verified: No queries leak data across bands

---

### Shared Playlists (No Recipient Tracking)

**Before implementing:**
- [ ] Is there an existing "shared_playlists" table?
- [ ] How are shareable links currently generated?
- [ ] Are we accidentally tracking recipient data anywhere?
- [ ] Check for: "recipient", "viewer", "accessed_by" in schema

**After implementing:**
- [ ] Test: Generate shareable link → Get unique token
- [ ] Test: Access link without login → Can listen
- [ ] Test: Check database → No recipient data stored
- [ ] Test: Disable link → Access blocked
- [ ] Test: Expired link → Access blocked

---

### Playlist-First Mobile UI

**Before implementing:**
- [ ] What is the current mobile home screen layout?
- [ ] Where are playlists currently displayed?
- [ ] How is navigation structured? (tabs, stack, etc.)
- [ ] Are there hardcoded routes that need updating?

**After implementing:**
- [ ] Test: Open app → Playlists appear first (top of screen)
- [ ] Test: "Browse All Tracks" appears below playlists
- [ ] Test: Tap playlist → Opens playlist detail view
- [ ] Test: Navigation back button works correctly
- [ ] Test: Playlist engagement stats display (🎧 2/5 listened)

---

### Version Comparison (Web vs Mobile)

**Before implementing:**
- [ ] How are track versions currently stored?
- [ ] Is version_parent_id already in tracks table?
- [ ] How do we link versions together?
- [ ] What's the current playback implementation?

**Web implementation checks:**
- [ ] Two waveform components can render side-by-side
- [ ] Synchronized playback works (same timestamp on both)
- [ ] A/B toggle switches audio source correctly
- [ ] Comments show on correct version's waveform

**Mobile implementation checks:**
- [ ] Dropdown shows all versions of track
- [ ] Selecting version updates audio source
- [ ] Version notes display below dropdown
- [ ] No attempt to show side-by-side (screen too small)

---

### Storage Limit Enforcement

**Before implementing:**
- [ ] How are files currently uploaded?
- [ ] Where is storage_used tracked?
- [ ] Is there an existing check_storage_limit function?
- [ ] What happens to storage_used when file is deleted?

**Critical checks:**
```javascript
// Before upload
const currentStorage = await getCurrentStorageUsed(userId, bandId);
const newTotal = currentStorage + fileSize;
const limit = await getStorageLimit(userId, bandId);

if (newTotal > limit) {
  // Block upload
  throw new Error('STORAGE_LIMIT_REACHED');
}

// After successful upload
await updateStorageUsed(userId, bandId, fileSize); // Add to current

// After file deletion
await updateStorageUsed(userId, bandId, -fileSize); // Subtract from current
```

**After implementing:**
- [ ] Test: Free user at 900MB uploads 200MB → Blocked
- [ ] Test: Free user at 900MB uploads 50MB → Success
- [ ] Test: Delete 100MB file → storage_used decreases
- [ ] Test: Failed upload → storage_used doesn't change

---

### Tier Enforcement (Band Creation)

**Before implementing:**
- [ ] Where is band creation currently happening?
- [ ] Is there an existing tier check?
- [ ] How is Stripe subscription status synced?
- [ ] What happens when subscription is cancelled?

**Before creating band:**
```javascript
const user = await getUserTier(userId);

if (user.tier === 'free') {
  throw new Error('UPGRADE_REQUIRED_TO_CREATE_BAND');
}

if (user.tier === 'band') {
  const existingBands = await getBandsCreatedByUser(userId);
  if (existingBands.length >= 1) {
    throw new Error('BAND_LIMIT_REACHED');
  }
}

// Producer tier: unlimited, proceed
```

**After implementing:**
- [ ] Test: Free user clicks "Create Band" → Shown pricing modal
- [ ] Test: Band user with 0 bands → Can create 1 band
- [ ] Test: Band user with 1 band → Blocked, shown upgrade prompt
- [ ] Test: Producer user → Can create unlimited bands

---

### Stripe Integration

**Before implementing:**
- [ ] Is Stripe SDK already installed?
- [ ] What are the current environment variables?
- [ ] Is there an existing webhook handler?
- [ ] How is subscription status currently stored?

**Required checks:**
```javascript
// Before checkout
- [ ] Is STRIPE_PUBLIC_KEY set correctly?
- [ ] Are product and price IDs configured in Stripe dashboard?
- [ ] Is webhook endpoint URL registered in Stripe?

// Webhook handler
- [ ] Does it verify webhook signature?
- [ ] Does it handle checkout.session.completed?
- [ ] Does it handle customer.subscription.deleted?
- [ ] Does it update user.tier correctly?
- [ ] Does it handle errors gracefully?
```

**Testing with Stripe test cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

**After implementing:**
- [ ] Test: Click "Start for $5" → Redirects to Stripe
- [ ] Test: Complete payment → Redirected back to app
- [ ] Test: User tier updated to 'band' in database
- [ ] Test: Can now create band
- [ ] Test: Month 2 → Charged $10 (recurring price)

---

## SQL Script Safety Checklist

**NEVER run SQL scripts without:**

1. **Backup First**
```bash
# Export current schema and data
pg_dump -U postgres -d coretet > backup_$(date +%Y%m%d).sql
```

2. **Test on Development Database**
```sql
-- Verify you're NOT on production
SELECT current_database();
-- Should return: coretet_dev (or similar)
```

3. **Wrap in Transaction**
```sql
BEGIN;
  -- Your changes here
  CREATE TABLE ...
  ALTER TABLE ...
  
  -- Verify changes
  SELECT * FROM ...
  
-- If everything looks good:
COMMIT;

-- If something is wrong:
ROLLBACK;
```

4. **Check for Dependencies**
```sql
-- Before dropping a table
SELECT 
  confrelid::regclass AS referencing_table,
  conname AS constraint_name
FROM pg_constraint
WHERE confrelid = 'your_table_name'::regclass;
```

5. **Test RLS Policies**
```sql
-- After creating RLS policy, test it:
SET ROLE test_user_id;
SELECT * FROM tracks; -- Should only see allowed rows
RESET ROLE;
```

---

## Code Update Safety Checklist

**Before modifying any file:**

1. **Understand Current Behavior**
```bash
# Search for all usages of function/component
grep -r "functionName" .

# Check git history for context
git log -p -- path/to/file.ts
```

2. **Check Dependencies**
```bash
# What imports this component?
grep -r "import.*ComponentName" .

# What does this component import?
head -n 50 path/to/component.tsx | grep "import"
```

3. **Verify Types/Interfaces**
```typescript
// Before changing function signature:
// 1. Find all call sites
// 2. Check if types will still match
// 3. Update call sites if needed

// Example:
// OLD: function uploadTrack(file: File)
// NEW: function uploadTrack(file: File, bandId: string)
// Must update all callers to include bandId
```

4. **Consider Backwards Compatibility**
```typescript
// If API response changes, can old clients still work?

// BAD (breaks old clients):
{ tracks: [...] } → { items: [...] }

// GOOD (backwards compatible):
{ tracks: [...] } → { tracks: [...], items: [...] }
// Then deprecate 'tracks' later
```

5. **Update Tests**
```bash
# Run existing tests before changes
npm test

# After changes, update tests to match
# Add new tests for new features
```

---

## Common Pitfalls to Avoid

### 1. UUID vs String Confusion
```sql
-- BAD: Mixing types
CREATE TABLE tracks (
  id TEXT PRIMARY KEY,  -- Inconsistent!
  user_id UUID REFERENCES users(id)
);

-- GOOD: Consistent types
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id)
);
```

### 2. Missing ON DELETE CASCADE
```sql
-- BAD: Orphaned comments when track deleted
CREATE TABLE comments (
  track_id UUID REFERENCES tracks(id)
);

-- GOOD: Auto-cleanup
CREATE TABLE comments (
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE
);
```

### 3. Forgetting to Update Indexes
```sql
-- If you add WHERE clauses in queries, add indexes
CREATE INDEX idx_tracks_band_id ON tracks(band_id);
CREATE INDEX idx_tracks_owner_id ON tracks(owner_id);
```

### 4. Hardcoded Values
```typescript
// BAD: Hardcoded tier check
if (user.tier === 'premium') { ... }

// GOOD: Use constants
const TIERS = {
  FREE: 'free',
  BAND: 'band',
  PRODUCER: 'producer'
} as const;

if (user.tier === TIERS.BAND) { ... }
```

### 5. Not Handling Null/Undefined
```typescript
// BAD: Assumes band_id always exists
const bandId = track.band_id;
tracks.find(t => t.band_id === bandId);

// GOOD: Handle null (personal tracks)
const bandId = track.band_id;
if (bandId === null) {
  // Personal track
} else {
  // Band track
}
```

---

## Emergency Rollback Procedures

### If SQL Script Breaks Production:

1. **Immediate Rollback**
```sql
-- If still in transaction
ROLLBACK;

-- If already committed
psql coretet < backup_20241118.sql
```

2. **Restore from Supabase Backup**
```
Supabase Dashboard → Database → Backups → Restore
```

3. **Communicate**
- Notify users of downtime
- Revert deployed code if needed
- Document what went wrong

### If Code Breaks Production:

1. **Revert Git Commit**
```bash
git revert HEAD
git push origin main
```

2. **Redeploy Previous Version**
```bash
# Web app
vercel rollback

# Mobile app (can't instant rollback)
- Submit hotfix build to app stores
- Expedited review process
```

3. **Monitor Error Logs**
```
Check Sentry/error tracking for scope of issue
```

---

## Summary: The Golden Rule

**🚨 Before running ANY script or updating ANY code:**

1. Understand what currently exists
2. Backup important data
3. Test on development environment first
4. Wrap changes in transactions (if SQL)
5. Verify with manual tests
6. Monitor for errors after deployment

**When in doubt:**
- Ask for clarification
- Test more thoroughly
- Make smaller, incremental changes
- Document what you're doing

**Never assume:**
- Table names or column names
- Data types or foreign key relationships
- Existing query patterns
- User behavior or expectations

**Always verify:**
- Current state before changing
- Test results after changing
- No unintended side effects
- Can rollback if needed

---

This checklist should be referenced before every implementation task. It's better to spend 15 minutes checking than hours fixing broken production systems.

Good luck! 🚀
