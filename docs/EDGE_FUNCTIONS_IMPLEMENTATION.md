# Edge Functions Implementation Guide

## What We've Built

I've created a **production-ready authentication architecture** using Supabase Edge Functions:

✅ **Edge Function: create-profile** - Validates Clerk auth and creates/updates user profiles
✅ **Edge Function: create-band** - Validates Clerk auth and creates bands with authorization
✅ **Shared utilities** - Clerk validation logic reusable across all Edge Functions

---

## Architecture Summary

```
Client (Clerk Auth) → Edge Function (validates token) → Supabase DB (service role)
```

**Security Benefits:**
- ✅ Clerk tokens validated server-side
- ✅ Service role key never exposed to client
- ✅ RLS policies enforced (Edge Functions bypass using service role)
- ✅ Database-level security maintained

---

## Installation & Deployment Steps

### Step 1: Install Supabase CLI (2 minutes)

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Other platforms:**
```bash
npm install -g supabase
```

**Verify installation:**
```bash
supabase --version
```

### Step 2: Link to Your Supabase Project (1 minute)

```bash
cd /Users/exleymini/Apps/coretet-band
supabase link --project-ref tvvztlizyciaafqkigwe
```

You'll be prompted for your Supabase password (the one you used when creating the project).

### Step 3: Set Environment Variables (2 minutes)

```bash
# Set Clerk Secret Key
supabase secrets set CLERK_SECRET_KEY=sk_test_your_actual_clerk_secret_key

# Set Supabase Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

**Where to find these keys:**

**Clerk Secret Key:**
1. Go to https://dashboard.clerk.com
2. Select your app
3. Settings → API Keys
4. Copy "Secret key" (starts with `sk_test_` or `sk_live_`)

**Supabase Service Role Key:**
1. Go to https://supabase.com/dashboard
2. Select your CoreTet project
3. Settings → API
4. Under "Project API keys" find "service_role" key
5. Copy it (it's a long JWT token)

⚠️ **IMPORTANT:** Never commit these keys to git!

### Step 4: Deploy Edge Functions (2 minutes)

```bash
# Deploy all Edge Functions
supabase functions deploy

# Or deploy individually:
supabase functions deploy create-profile
supabase functions deploy create-band
```

**Expected output:**
```
Deploying function create-profile...
Function create-profile deployed successfully!

Deploying function create-band...
Function create-band deployed successfully!
```

### Step 5: Test Edge Functions (3 minutes)

Get your Clerk session token from browser console:

```javascript
// In browser console after logging in:
const token = await clerk.session.getToken();
console.log(token);
// Copy this token
```

Test create-profile:
```bash
curl -i --location 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/create-profile' \
  --header 'Authorization: Bearer YOUR_CLERK_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Eric Exley",
    "phone_number": "+15551234567"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "profile": {
    "id": "1204c7f6-1204-4204-a04c-e33d0aB00000",
    "name": "Eric Exley",
    "phone_number": "+15551234567"
  },
  "supabaseUserId": "1204c7f6-1204-4204-a04c-e33d0aB00000"
}
```

---

## Update Client Code

Now we need to update the client to call Edge Functions instead of direct DB operations.

### Update 1: clerkSupabaseSync.ts

```typescript
// src/utils/clerkSupabaseSync.ts
import { supabase } from '../../lib/supabase';
import type { User } from '@clerk/clerk-react';

export class ClerkSupabaseSync {
  /**
   * Sync Clerk user to Supabase via Edge Function
   */
  static async syncUserProfile(
    clerkUser: User,
    sessionToken: string
  ): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
    supabaseUserId?: string;
  }> {
    try {
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      const phoneNumber = clerkUser.primaryPhoneNumber?.phoneNumber || '';
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';

      console.log('🔄 Syncing Clerk user via Edge Function:', clerkUser.id);

      // Call Edge Function (server-side validates Clerk token)
      const { data, error } = await supabase.functions.invoke('create-profile', {
        body: {
          name: name || 'User',
          phone_number: phoneNumber || email || 'no-phone',
        },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.success) {
        console.error('❌ Edge Function returned error:', data.error);
        return {
          success: false,
          error: data.error,
        };
      }

      console.log('✅ Profile synced successfully via Edge Function');
      return {
        success: true,
        profile: data.profile,
        supabaseUserId: data.supabaseUserId,
      };
    } catch (error) {
      console.error('❌ Error calling Edge Function:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Keep generateUUIDFromClerkId for client-side reference
  static generateUUIDFromClerkId(clerkId: string): string {
    let hash = 0;
    for (let i = 0; i < clerkId.length; i++) {
      const char = clerkId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    const uuid = `${hex.substring(0, 8)}-${hex.substring(0, 4)}-4${hex.substring(1, 4)}-a${hex.substring(2, 5)}-${clerkId.replace(/[^a-f0-9]/gi, '').substring(0, 12).padEnd(12, '0')}`;

    return uuid;
  }
}
```

### Update 2: App.tsx

```typescript
// Simplified auth flow using Edge Function
React.useEffect(() => {
  if (user && isLoaded) {
    const setupSupabaseAuth = async () => {
      try {
        // Get Clerk session token
        const sessionToken = await getToken();

        if (!sessionToken) {
          console.error('❌ Failed to get Clerk session token');
          return;
        }

        console.log('🔑 Got Clerk session token, calling Edge Function...');

        // Call Edge Function to sync user profile
        const { ClerkSupabaseSync } = await import('./utils/clerkSupabaseSync');
        const syncResult = await ClerkSupabaseSync.syncUserProfile(user, sessionToken);

        if (syncResult.success) {
          console.log('✅ User profile synced to Supabase:', syncResult.profile);
        } else {
          console.error('❌ Failed to sync user profile:', syncResult.error);
        }
      } catch (error) {
        console.error('❌ Error setting up auth:', error);
      }
    };

    setupSupabaseAuth();
  }
}, [user, isLoaded, getToken]);
```

---

## Enable RLS Policies

Once Edge Functions are deployed and tested, **re-enable RLS**:

```sql
-- Run in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Verify policies exist
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

---

## Testing Checklist

After deployment:

- [ ] Edge Functions deployed successfully
- [ ] Environment variables set (Clerk Secret + Service Role Key)
- [ ] Client code updated to use Edge Functions
- [ ] Test profile creation (should succeed)
- [ ] Test band creation (should succeed)
- [ ] RLS enabled (verify no unauthorized access)
- [ ] Check function logs for errors

---

## Monitoring & Debugging

**View Edge Function logs:**
```bash
supabase functions logs create-profile --tail
supabase functions logs create-band --tail
```

**Common issues:**

1. **"Missing CLERK_SECRET_KEY"** → Set environment variable
2. **"Invalid token"** → Check client is sending correct Bearer token
3. **"Profile not found"** → User must create profile before creating band
4. **"403 Forbidden"** → Check RLS policies and service role key

---

## What's Next

After Edge Functions are working:

1. ✅ Create more Edge Functions:
   - `join-band` - Join band with invite code
   - `upload-audio` - Handle audio file uploads
   - `create-playlist` - Create playlists
   - `add-rating` - Add ratings to tracks

2. ✅ Add rate limiting (Supabase Dashboard)
3. ✅ Set up monitoring/alerts
4. ✅ Add comprehensive error handling

---

## Ready to Deploy?

Follow these steps in order:

1. Install Supabase CLI
2. Link to your project
3. Set environment variables
4. Deploy Edge Functions
5. Test with curl
6. Update client code
7. Test end-to-end
8. Enable RLS

**Estimated time:** 30-45 minutes total

Let me know when you're ready to start and I'll guide you through each step!