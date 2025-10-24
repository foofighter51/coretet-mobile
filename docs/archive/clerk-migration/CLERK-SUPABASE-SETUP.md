# Clerk + Supabase JWT Integration Setup

## Overview
This guide configures Clerk to issue JWTs that Supabase can verify, allowing Supabase RLS policies to work with Clerk authentication.

## Step 1: Configure Clerk JWT Template

### 1.1 Access Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Select your CoreTet application
3. Navigate to **JWT Templates** in the left sidebar

### 1.2 Create Supabase JWT Template

Click **"New Template"** and select **"Supabase"** from the templates.

This will create a template with these claims:

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
    "name": "{{user.first_name}} {{user.last_name}}",
    "clerk_user_id": "{{user.id}}"
  }
}
```

### 1.3 Important: Note the Template Name
The default name is usually `supabase`. **Save this name** - you'll need it in the code.

### 1.4 Get the JWT Issuer URL
In the JWT template page, you'll see:
- **Issuer**: Something like `https://clerk.your-domain.com` or `https://your-app.clerk.accounts.dev`

Copy this URL - you'll need it for Supabase configuration.

---

## Step 2: Configure Supabase to Accept Clerk JWTs

### 2.1 Get Clerk JWKS URL
Your JWKS URL format is:
```
https://YOUR_CLERK_FRONTEND_API/.well-known/jwks.json
```

Example:
```
https://clean-tuna-12.clerk.accounts.dev/.well-known/jwks.json
```

### 2.2 Add to Supabase Auth Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your CoreTet project
3. Navigate to **Authentication** → **Providers** → **External OAuth Providers**
4. Scroll to **"JWT Verification"**
5. Enable JWT verification
6. Add your Clerk JWKS URL

**Note:** As of 2024, Supabase may require custom JWT configuration through SQL or project settings. Check latest Supabase docs if UI option not available.

---

## Step 3: Update Environment Variables

Add to your `.env.local`:

```bash
# Existing Clerk variables
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# NEW: Clerk JWT Configuration
VITE_CLERK_JWT_TEMPLATE_NAME=supabase
CLERK_JWT_ISSUER=https://your-app.clerk.accounts.dev

# Existing Supabase variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Step 4: Verify JWT Claims

Test that Clerk is issuing correct JWTs:

```typescript
// In browser console after logging in with Clerk:
import { useAuth } from '@clerk/clerk-react';

const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });
console.log('JWT Token:', token);

// Decode it at https://jwt.io to verify claims
```

Expected decoded JWT should have:
```json
{
  "sub": "user_2abc123def",  // Clerk user ID
  "aud": "authenticated",
  "iss": "https://your-app.clerk.accounts.dev",
  "email": "user@example.com",
  "exp": 1234567890
}
```

---

## Step 5: Update Supabase Client Code

The app code needs to be updated to pass Clerk JWT to Supabase on every request.

See implementation in:
- [lib/supabase.ts](../lib/supabase.ts) - Updated client configuration
- [src/App.tsx](../src/App.tsx) - JWT token refresh logic

---

## Troubleshooting

### Error: "JWT expired"
- **Cause:** Token expired after 7 days
- **Solution:** Implement token refresh logic (auto-refresh before expiry)

### Error: "Invalid JWT issuer"
- **Cause:** Clerk issuer doesn't match Supabase configuration
- **Solution:** Double-check JWKS URL in Supabase settings

### Error: "JWT verification failed"
- **Cause:** Supabase can't reach Clerk JWKS endpoint
- **Solution:** Verify JWKS URL is publicly accessible

### Error: "auth.uid() still returns NULL"
- **Cause:** JWT not being sent with Supabase requests
- **Solution:** Check that `setSession()` is called with JWT token

---

## Architecture Diagram

```
┌─────────────────┐
│   User Device   │
└────────┬────────┘
         │
         │ 1. Sign in with phone/SMS
         ▼
┌─────────────────┐
│   Clerk Auth    │────────┐
└────────┬────────┘        │
         │                 │ 2. Issues JWT with
         │                 │    Supabase claims
         │                 │
         │ 3. Get JWT      │
         │    token        │
         ▼                 ▼
┌─────────────────┐   ┌──────────────────┐
│   Supabase      │◄──│ JWT Token        │
│   Client        │   │ (with claims)    │
└────────┬────────┘   └──────────────────┘
         │
         │ 4. Every request includes JWT
         ▼
┌─────────────────┐
│   Supabase      │
│   Database      │
│                 │
│   RLS Policies  │──► auth.uid() = user.id ✅
│   now work!     │    (JWT sub claim)
└─────────────────┘
```

---

## Next Steps

1. ✅ Configure Clerk JWT template
2. ✅ Add JWT issuer to Supabase
3. ✅ Update environment variables
4. ⏱️ Update application code (see implementation files)
5. ⏱️ Test end-to-end auth flow
6. ⏱️ Verify RLS policies work correctly

---

**Status:** Ready for implementation
**Estimated Time:** 1-2 hours for initial setup, 2-4 hours for testing and refinement
**Documentation:** https://clerk.com/docs/integrations/databases/supabase