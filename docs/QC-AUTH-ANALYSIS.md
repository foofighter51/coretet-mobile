# CoreTet Authentication & Permissions QC Analysis
**Date:** 2025-09-29
**Status:** CRITICAL ISSUES FOUND

## Executive Summary

**Root Cause:** CoreTet uses **Clerk for authentication** but **Supabase for data storage**. Supabase RLS (Row Level Security) policies check `auth.uid()` which returns NULL because users aren't authenticated through Supabase Auth.

**Impact:**
- ❌ Profile creation fails (401 Unauthorized)
- ❌ Audio uploads will fail (RLS blocks INSERT)
- ❌ Band creation/joining will fail (RLS blocks INSERT)
- ❌ All database operations blocked by RLS

---

## Current Architecture Analysis

### Authentication Flow
```
User → Clerk Auth (Phone/SMS) → Clerk User ID
                                      ↓
                          Generate Deterministic UUID
                                      ↓
                          Try to sync to Supabase profiles
                                      ↓
                          ❌ BLOCKED BY RLS POLICIES ❌
```

### The Core Problem

**Supabase RLS Policy Example (profiles table):**
```sql
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**What happens:**
- Clerk user authenticated: ✅ `clerk_user.id = "user_2abc123"`
- Supabase auth session: ❌ `auth.uid() = NULL`
- RLS policy check: `NULL = '1204c7f6-1204-4204-a04c-e33d0aB00000'` → **FALSE** → **BLOCKED**

---

## Dependency Map: What Breaks Without Auth

### 1. **Profile Creation** (CURRENTLY BROKEN)
- **Status:** ❌ Failing
- **Location:** [clerkSupabaseSync.ts:82](src/utils/clerkSupabaseSync.ts#L82)
- **Error:** `401 Unauthorized - new row violates row-level security policy`
- **Impact:** Users can't be created in Supabase
- **Blocks:** Everything else

### 2. **Audio Uploads** (WILL FAIL)
- **Status:** ⚠️ Not tested (blocked by profile creation)
- **Location:** [audioUploadService.ts:111](src/utils/audioUploadService.ts#L111)
- **Depends on:**
  - Valid Supabase user UUID
  - Storage policies checking `auth.uid()`
  - Versions table RLS policy
- **Impact:** Users can't upload audio files

### 3. **Band Creation** (WILL FAIL)
- **Status:** ⚠️ Not tested (blocked by profile creation)
- **Location:** [BandContext.tsx:94](src/contexts/BandContext.tsx#L94)
- **Depends on:**
  - Valid profile in Supabase
  - Ensembles table RLS policy checking `auth.uid() = created_by`
- **Impact:** Can't create bands

### 4. **Band Joining** (WILL FAIL)
- **Status:** ⚠️ Not tested
- **Location:** [lib/supabase.ts:254](lib/supabase.ts#L254)
- **Depends on:**
  - Valid profile
  - Ensemble_members table RLS policy
- **Impact:** Can't join existing bands

### 5. **Fetching User Bands** (PARTIALLY WORKING)
- **Status:** ⚠️ Works but returns empty (no bands created yet)
- **Location:** [BandContext.tsx:202](src/contexts/BandContext.tsx#L202)
- **Note:** Uses direct query bypassing RLS, but needs bands to exist first

### 6. **Ratings/Comments** (WILL FAIL)
- **Status:** ⚠️ Not tested
- **Depends on:** RLS policies on ratings/comments tables
- **Impact:** Can't interact with audio versions

---

## Solution Options Analysis

### Option 1: **Disable RLS (Development Only)** ⚠️ INSECURE
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ensembles DISABLE ROW LEVEL SECURITY;
ALTER TABLE versions DISABLE ROW LEVEL SECURITY;
-- etc...
```

**Pros:**
- ✅ Quick fix (5 minutes)
- ✅ Everything works immediately
- ✅ Good for rapid prototyping

**Cons:**
- ❌ NO SECURITY - anyone can access/modify any data
- ❌ Must be re-enabled for production
- ❌ Easy to forget and ship insecure code
- ❌ Doesn't match production environment

**Verdict:** ⚠️ OK for local development ONLY, must document clearly

---

### Option 2: **Service Role Key for Writes** (Hybrid Approach)
Create server-side functions that use service role key to bypass RLS for specific operations.

**Implementation:**
```typescript
// Server-side function (Supabase Edge Function or API route)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY // Server-side only!
)

// Bypass RLS for trusted operations
await supabaseAdmin.from('profiles').insert({ ... })
```

**Pros:**
- ✅ Secure (service key never exposed to client)
- ✅ RLS stays enabled
- ✅ Fine-grained control over what bypasses RLS

**Cons:**
- ❌ Requires backend infrastructure (Supabase Edge Functions or separate API)
- ❌ More complex architecture
- ❌ Adds latency (extra network hop)

**Verdict:** ✅ Best for production, but requires infrastructure

---

### Option 3: **Clerk JWT → Supabase Auth** (Proper Integration)
Use Clerk's JWT token to authenticate with Supabase, so `auth.uid()` returns the correct user.

**Implementation:**
1. Configure Clerk to issue JWT with Supabase claims
2. Send Clerk JWT to Supabase on every request
3. Supabase validates JWT and sets `auth.uid()`

**Documentation:** https://clerk.com/docs/integrations/databases/supabase

**Pros:**
- ✅ Proper authentication flow
- ✅ RLS policies work as designed
- ✅ Production-ready security
- ✅ No server-side infrastructure needed

**Cons:**
- ❌ Complex setup (JWT templates, claim mapping)
- ❌ Requires Clerk Pro plan for custom JWT
- ❌ Need to modify all Supabase client calls

**Verdict:** ✅ Ideal production solution, requires Clerk Pro

---

### Option 4: **Custom RLS Policies Without auth.uid()** (Current Attempt)
Modify RLS policies to not depend on `auth.uid()`, use app-level logic instead.

**Example:**
```sql
-- Instead of checking auth.uid()
CREATE POLICY "versions_insert" ON versions
  FOR INSERT WITH CHECK (true); -- Allow all inserts

-- Then enforce permissions in application code
if (currentUser.id !== version.uploaded_by) {
  throw new Error('Unauthorized');
}
```

**Pros:**
- ✅ Works with current Clerk setup
- ✅ No infrastructure changes needed

**Cons:**
- ❌ Defeats purpose of RLS (security at database level)
- ❌ Easy to miss permission checks in code
- ❌ Not a standard pattern (harder to maintain)
- ❌ Database is wide open if app code has bugs

**Verdict:** ❌ Not recommended, too risky

---

## Recommended Solution Path

### **Phase 1: Immediate Fix (Today)** - Option 2 Simplified
Create a single server-side endpoint for user profile creation using service role key.

**Steps:**
1. Create Supabase Edge Function: `create-profile`
2. Use service role key to bypass RLS for profile INSERT only
3. Update [clerkSupabaseSync.ts](src/utils/clerkSupabaseSync.ts) to call this function
4. Keep RLS enabled for all other tables

**Timeline:** 1-2 hours
**Risk:** Low (minimal changes, RLS stays enabled)

### **Phase 2: Production Solution (Next Sprint)** - Option 3
Implement proper Clerk + Supabase JWT integration.

**Steps:**
1. Upgrade to Clerk Pro (if needed for custom JWT)
2. Configure Clerk JWT template with Supabase claims
3. Update Supabase client to use Clerk JWT
4. Test RLS policies work correctly with JWT
5. Update all database operations

**Timeline:** 1-2 days
**Risk:** Medium (requires careful testing)

---

## Testing Checklist

Once auth is fixed, test in this order:

### 1. **Profile Creation**
- [ ] New user signs up with Clerk
- [ ] Profile created in Supabase profiles table
- [ ] UUID mapping correct (Clerk ID → Supabase UUID)
- [ ] No console errors

### 2. **Profile Fetching**
- [ ] Existing user logs in
- [ ] Profile loaded from Supabase
- [ ] User name displays correctly
- [ ] Avatar loads (if set)

### 3. **Audio Upload**
- [ ] Select audio file
- [ ] Processing completes (compression, normalization)
- [ ] Upload to Supabase Storage succeeds
- [ ] Version record created in database
- [ ] File accessible via signed URL

### 4. **Band Creation**
- [ ] Create new band with name/description
- [ ] Band record created in ensembles table
- [ ] Creator added to ensemble_members
- [ ] Invite code generated
- [ ] Band appears in user's band list

### 5. **Band Joining**
- [ ] Enter valid invite code
- [ ] Authorization check passes (phone number match)
- [ ] User added to ensemble_members
- [ ] Band appears in user's band list
- [ ] Can view band's versions

### 6. **Version Management in Band**
- [ ] Upload version to band
- [ ] Version associated with band's song
- [ ] All band members can view version
- [ ] Rating/commenting works

### 7. **Permissions Enforcement**
- [ ] User A can't see User B's private versions
- [ ] User A can't join Band X without authorization
- [ ] User A can't delete User B's uploads
- [ ] Storage files properly scoped

---

## Code Files Requiring Updates

### High Priority (Core Auth)
1. [src/utils/clerkSupabaseSync.ts](src/utils/clerkSupabaseSync.ts) - Profile sync logic
2. [src/App.tsx](src/App.tsx) - Auth initialization
3. [lib/supabase.ts](lib/supabase.ts) - Client configuration

### Medium Priority (Features Dependent on Auth)
4. [src/utils/audioUploadService.ts](src/utils/audioUploadService.ts) - Upload logic
5. [src/contexts/BandContext.tsx](src/contexts/BandContext.tsx) - Band operations
6. [src/components/screens/MainDashboard.tsx](src/components/screens/MainDashboard.tsx) - UI state

### Low Priority (Deprecated/Unused)
7. [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - **DEPRECATED** - Still used by band screens
8. [src/utils/supabaseAuthService.ts](src/utils/supabaseAuthService.ts) - **DEPRECATED** - Old auth flow

---

## Next Actions

### Immediate (Block all other dev work)
1. ✅ Complete this QC analysis
2. ⏱️ Decide on solution approach (Option 2 recommended)
3. ⏱️ Implement profile creation fix
4. ⏱️ Test full auth flow end-to-end
5. ⏱️ Update EOD status document

### Short Term (After auth is working)
1. Update band screens to use Clerk (remove AuthContext dependency)
2. Test audio upload with authenticated users
3. Test band creation/joining flows
4. Document auth architecture decisions

### Long Term (Production Readiness)
1. Implement Clerk JWT → Supabase integration (Option 3)
2. Add comprehensive permission tests
3. Security audit of RLS policies
4. Performance testing with real users

---

## Decision Needed

**Question for Product Owner:**

Which solution should we implement?

**A) Quick Fix (1-2 hours)** - Service role function for profiles only
   - ✅ Unblocks development today
   - ⚠️ Still need proper solution later
   - 💰 Low cost

**B) Proper Solution (1-2 days)** - Full Clerk JWT integration
   - ✅ Production-ready security
   - ⏱️ Blocks other dev for 1-2 days
   - 💰 May require Clerk Pro ($25/mo)

**C) Hybrid (2-3 hours)** - Quick fix now + plan proper solution
   - ✅ Best of both worlds
   - ⏱️ Minimal immediate delay
   - 💰 Low upfront cost

**Recommendation:** Option C (Hybrid approach)

---

*Generated: 2025-09-29*
*Next Update: After implementing chosen solution*