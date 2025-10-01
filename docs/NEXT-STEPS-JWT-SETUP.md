# Next Steps: Complete Clerk JWT + Supabase Integration

## Status: Code Updated ✅ | Configuration Needed ⏳

I've updated all the application code to support Clerk JWT → Supabase authentication. Now you need to configure both services.

---

## Step 1: Configure Clerk JWT Template (15 minutes)

### 1.1 Access Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Sign in and select your **CoreTet** application
3. In the left sidebar, find **JWT Templates**

### 1.2 Create Supabase JWT Template
1. Click **"New Template"** button
2. Select **"Supabase"** from the template options (Clerk has a pre-built template!)
3. **Template Name**: Enter `supabase` (exactly this - the code expects it)
4. The template should auto-populate with these claims:

```json
{
  "aud": "authenticated",
  "exp": {{(time.now + (60 * 60 * 24 * 7)).unix}},
  "iat": {{time.now.unix}},
  "iss": "{{env.CLERK_JWT_ISSUER}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "phone": "{{user.primary_phone_number}}",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "name": "{{user.first_name}} {{user.last_name}}"
  }
}
```

5. Click **"Create"** or **"Save"**

### 1.3 Get Important Values
From the JWT template page, **copy these values**:

- **Template Name**: `supabase` (you just created this)
- **Issuer URL**: Will look like `https://your-app.clerk.accounts.dev` or `https://clerk.your-domain.com`
- **JWKS URL**: Will be `https://YOUR_ISSUER_URL/.well-known/jwks.json`

**Example JWKS URL:**
```
https://clean-tuna-12.clerk.accounts.dev/.well-known/jwks.json
```

Keep this page open - you'll need the JWKS URL for Supabase.

---

## Step 2: Configure Supabase to Accept Clerk JWTs (10 minutes)

### 2.1 Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your **CoreTet** project
3. Navigate to **Authentication** → **Providers**

### 2.2 Configure JWT Verification

**Option A: If you see "JWT Verification" section** (newer Supabase UI):
1. Scroll to **JWT Verification** section
2. Enable JWT verification
3. Paste your Clerk JWKS URL (from Step 1.3)
4. Save settings

**Option B: If no JWT Verification UI** (older Supabase or custom config needed):
You'll need to run SQL to configure JWT verification:

```sql
-- Run this in Supabase SQL Editor
-- Replace YOUR_JWKS_URL with your actual Clerk JWKS URL

-- This tells Supabase to accept JWTs from Clerk
ALTER DATABASE postgres SET request.jwt.claims TO '{"iss": "https://your-app.clerk.accounts.dev"}';

-- May also need to update auth.jwt_secret config
-- Contact Supabase support if this doesn't work - they can help configure custom JWT issuers
```

### 2.3 Verify Supabase RLS Policies

Your current RLS policies should work as-is, but let's verify they're correct.

**Go to Database → Policies** and check that profiles table has:

**SELECT policy:**
```sql
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

**INSERT policy:**
```sql
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**UPDATE policy:**
```sql
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

If these don't exist, run the SQL from [SUPABASE_SETUP.md](../SUPABASE_SETUP.md).

---

## Step 3: Test the Integration (5 minutes)

### 3.1 Reload the Application
1. The dev server is running at http://localhost:3002
2. **Refresh the page** (hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Open **DevTools Console** (F12 or Cmd+Option+I)

### 3.2 Expected Console Output

If everything is configured correctly, you should see:

```
🔑 Got Clerk JWT token, setting up Supabase auth...
✅ Supabase session set with Clerk JWT
✅ Supabase auth.uid(): [some-uuid-here]
🔄 Syncing Clerk user to Supabase: user_2abc...
✅ Supabase auth.uid(): [same-uuid]
➕ Creating new Supabase profile for: Eric Exley
✅ Successfully synced user profile to Supabase
✅ User profile synced to Supabase: {id: "...", name: "Eric Exley", ...}
✅ Fetched user bands: []
```

### 3.3 What Each Step Means

| Log Message | What It Means | If It Fails |
|------------|---------------|-------------|
| 🔑 Got Clerk JWT token | Clerk issued JWT with Supabase claims | Check JWT template name is exactly `supabase` |
| ✅ Supabase session set | Supabase accepted the JWT | Check JWKS URL in Supabase settings |
| ✅ Supabase auth.uid() | Supabase can identify the user | JWT must have `sub` claim with user ID |
| ➕ Creating profile | Attempting to insert to profiles table | RLS policy should allow since auth.uid() = id |
| ✅ Successfully synced | Profile created! | Auth is working! 🎉 |

---

## Troubleshooting

### Error: "Failed to get Clerk JWT token"

**Cause:** JWT template not found

**Solution:**
1. Check template name is exactly `supabase` (case-sensitive)
2. Verify template is published/enabled in Clerk dashboard
3. Try signing out and back in to refresh Clerk session

### Error: "Failed to set Supabase session with Clerk token"

**Cause:** Supabase rejects the JWT

**Solutions:**
1. Verify JWKS URL is correct and publicly accessible
2. Check that Supabase can reach the JWKS endpoint (test in browser)
3. Ensure JWT issuer matches between Clerk and Supabase config

**To test JWKS URL:**
Open in browser: `https://your-app.clerk.accounts.dev/.well-known/jwks.json`
Should return JSON with public keys.

### Error: "No authenticated Supabase user found"

**Cause:** JWT was set but Supabase didn't authenticate

**Solutions:**
1. Check JWT has correct claims (`sub`, `aud`, `iss`)
2. Verify JWT expiration hasn't passed
3. Try decoding JWT at https://jwt.io to inspect claims

**To get JWT for debugging:**
```javascript
// In browser console:
const token = await clerk.session.getToken({ template: 'supabase' });
console.log('JWT:', token);
// Copy to https://jwt.io to decode
```

### Error: "new row violates row-level security policy" (STILL!)

**Cause:** RLS policy still blocking, JWT not working

**Solutions:**
1. Verify `auth.uid()` is returning a value:
   ```sql
   -- Run in Supabase SQL Editor while app is running:
   SELECT auth.uid();
   ```
   Should return UUID, not NULL

2. Check that UUID from JWT matches profile ID:
   ```javascript
   // In console:
   const { data } = await supabase.auth.getUser();
   console.log('Supabase user ID:', data.user.id);
   ```

3. If `auth.uid()` is still NULL, JWT isn't being verified. Contact Supabase support for JWT issuer configuration.

---

## Verification Checklist

Once configuration is complete, verify these work:

### ✅ Authentication Flow
- [ ] User can sign in with Clerk (phone/SMS)
- [ ] JWT token is obtained from Clerk
- [ ] Supabase session is set with JWT
- [ ] Console shows `auth.uid()` with valid UUID
- [ ] No 401 Unauthorized errors

### ✅ Profile Management
- [ ] Profile is created in Supabase profiles table
- [ ] User name displays correctly
- [ ] Profile updates work (change name in Clerk, see it sync)

### ✅ Band Features (Once Profile Works)
- [ ] Can create new band
- [ ] Can view bands list
- [ ] Can join band with invite code

### ✅ Audio Upload (Once Profile Works)
- [ ] Can select audio file
- [ ] Upload completes successfully
- [ ] File appears in versions table
- [ ] Can play back uploaded audio

---

## What Changed in the Code

For your reference, here's what was updated:

### 1. [lib/supabase.ts](../lib/supabase.ts)
- Added `setSupabaseAuthWithClerkToken()` function
- Modified client config to let Clerk handle auth
- Added `clearSupabaseAuth()` for logout

### 2. [src/App.tsx](../src/App.tsx)
- Added `useClerk` hook import
- Added JWT token fetch on user sign-in
- Calls `setSupabaseAuthWithClerkToken()` to authenticate Supabase
- Now syncs profile after Supabase auth is set

### 3. [src/utils/clerkSupabaseSync.ts](../src/utils/clerkSupabaseSync.ts)
- Updated `syncUserProfile()` to use `auth.uid()` from JWT
- Removed custom UUID generation (no longer needed)
- Now relies on Supabase auth session for user ID

---

## After Configuration Is Complete

Once you confirm it's working (profile created successfully), we'll:

1. ✅ Test audio upload functionality
2. ✅ Test band creation/joining
3. ✅ Update band screens to use Clerk instead of old AuthContext
4. ✅ Document the final architecture
5. ✅ Update EOD status

---

## Need Help?

If you run into issues during configuration:

1. **Take a screenshot** of the error in console
2. **Copy the exact error message**
3. **Note which step failed** (Clerk JWT creation, Supabase config, or testing)
4. Let me know and I'll help troubleshoot

---

## Quick Reference: Configuration Values

Fill these in as you configure:

```bash
# For your .env.local (add this):
VITE_CLERK_JWT_TEMPLATE_NAME=supabase

# From Clerk Dashboard:
Clerk Issuer URL: _______________________________
Clerk JWKS URL: _________________________________

# From Supabase Dashboard:
Supabase Project URL: ___________________________
```

---

**Ready to start?** Begin with Step 1 (Configure Clerk JWT Template)!

Let me know when you complete each step and I'll help verify it's working correctly.