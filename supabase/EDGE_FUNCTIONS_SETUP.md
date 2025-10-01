# Supabase Edge Functions Setup Guide

## Overview

Edge Functions provide server-side logic to validate Clerk authentication and perform secure database operations with the service role key.

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Environment variables configured** (see below)

---

## Environment Variables

Edge Functions need these environment variables:

### 1. Clerk Secret Key
```bash
supabase secrets set CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

### 2. Supabase Service Role Key
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Where to find:**
- Clerk Secret: Clerk Dashboard → API Keys → Secret Key
- Supabase Service Role: Supabase Dashboard → Settings → API → service_role key ⚠️ NEVER expose this to client!

---

## Deploying Edge Functions

### Deploy All Functions
```bash
cd /Users/exleymini/Apps/coretet-band
supabase functions deploy
```

### Deploy Individual Functions
```bash
# Profile creation
supabase functions deploy create-profile

# Band creation
supabase functions deploy create-band
```

### View Function Logs
```bash
supabase functions logs create-profile --tail
```

---

## Testing Edge Functions

### Test create-profile Function

```bash
curl -i --location 'https://your-project-ref.supabase.co/functions/v1/create-profile' \
  --header 'Authorization: Bearer YOUR_CLERK_SESSION_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Eric Exley",
    "phone_number": "+15551234567"
  }'
```

### Test create-band Function

```bash
curl -i --location 'https://your-project-ref.supabase.co/functions/v1/create-band' \
  --header 'Authorization: Bearer YOUR_CLERK_SESSION_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "My Test Band",
    "description": "A test band",
    "authorizedPhones": ["+15551234567", "+15559876543"]
  }'
```

---

## Client Integration

Update your client code to call Edge Functions instead of direct Supabase operations:

### Example: Create Profile

```typescript
// src/utils/clerkSupabaseSync.ts
import { supabase } from '../../lib/supabase';
import type { User } from '@clerk/clerk-react';

export class ClerkSupabaseSync {
  static async syncUserProfile(clerkUser: User, sessionToken: string): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    try {
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      const phoneNumber = clerkUser.primaryPhoneNumber?.phoneNumber || '';

      // Call Edge Function instead of direct DB operation
      const { data, error } = await supabase.functions.invoke('create-profile', {
        body: {
          name: name || 'User',
          phone_number: phoneNumber,
        },
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (error) {
        console.error('❌ Failed to create profile:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      console.log('✅ Profile created successfully');
      return {
        success: true,
        profile: data.profile,
      };
    } catch (error) {
      console.error('❌ Error calling Edge Function:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
```

### Example: Create Band

```typescript
// src/contexts/BandContext.tsx
const createBand = async (bandData: {
  name: string;
  description?: string;
  authorizedPhones: string[];
}) => {
  try {
    // Get Clerk session token
    const { getToken } = useAuth();
    const sessionToken = await getToken();

    if (!sessionToken) {
      throw new Error('No session token');
    }

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('create-band', {
      body: bandData,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (error) {
      console.error('❌ Failed to create band:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Band created successfully');
    return { success: true, band: data.band };
  } catch (error) {
    console.error('❌ Error creating band:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
```

---

## Security Checklist

Before deploying to production:

- [ ] Clerk Secret Key configured as environment variable (never in code)
- [ ] Supabase Service Role Key configured as environment variable
- [ ] CORS headers properly configured for your domain
- [ ] RLS policies enabled on all tables
- [ ] Edge Functions validate Clerk tokens on every request
- [ ] Client never receives service role key
- [ ] Rate limiting configured (Supabase Dashboard → Edge Functions → Settings)

---

## Troubleshooting

### Error: "Missing CLERK_SECRET_KEY"
**Solution:** Set the secret with `supabase secrets set CLERK_SECRET_KEY=...`

### Error: "Invalid session"
**Solution:** Check that client is sending correct Clerk session token in Authorization header

### Error: "Failed to create profile"
**Solution:** Check function logs with `supabase functions logs create-profile`

### Error: "CORS error"
**Solution:** Verify CORS headers include your domain in production

---

## Next Steps

After deploying Edge Functions:

1. ✅ Update client code to call Edge Functions
2. ✅ Test profile creation flow end-to-end
3. ✅ Test band creation flow
4. ✅ Re-enable RLS policies
5. ✅ Add more Edge Functions as needed (upload-audio, join-band, etc.)

---

**Important:** Edge Functions run on Deno runtime, not Node.js. Use Deno-compatible imports (e.g., `https://esm.sh/` for npm packages).