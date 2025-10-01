# Step 2: Configure Supabase to Accept Clerk JWTs

## **Simple Answer: You DON'T need to run SQL!**

Here's the truth: **Supabase automatically validates JWTs** when you call `supabase.auth.setSession()` (which our code already does).

The validation works like this:

1. Our code gets a JWT from Clerk
2. Our code calls `supabase.auth.setSession({ access_token: clerkToken })`
3. Supabase receives the JWT and validates it:
   - Checks the signature using Clerk's public keys
   - Verifies the claims (`aud`, `role`, etc.)
   - If valid, sets `auth.uid()` to the `sub` claim from the JWT

**No manual configuration needed!**

---

## What You Actually Need to Check

### ✅ Verify Your Supabase RLS Policies

The only configuration you need to verify is that your **RLS policies exist**.

Go to **Supabase Dashboard** → **Database** → **Policies** → **profiles table**

You should see these policies:

#### **1. SELECT policy**
```sql
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

#### **2. INSERT policy**
```sql
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### **3. UPDATE policy**
```sql
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### If These Policies Don't Exist

Run this SQL in **Supabase SQL Editor**:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## How JWT Validation Actually Works

When you use Clerk + Supabase:

```
┌─────────────────────────────────────────────────┐
│  1. User logs in with Clerk                     │
│     → Clerk issues JWT with claims              │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  2. App gets JWT: getToken({ template: 'supabase' })│
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  3. App sets Supabase session:                  │
│     supabase.auth.setSession({ access_token })  │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  4. Supabase validates JWT:                     │
│     - Fetches Clerk's public keys from JWKS     │
│     - Verifies JWT signature                    │
│     - Checks claims (aud, role, exp)            │
│     - If valid, sets auth.uid() = JWT.sub       │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  5. RLS policies now work:                      │
│     auth.uid() = "user-uuid-from-jwt"           │
│     Profile INSERT/SELECT/UPDATE allowed ✅      │
└─────────────────────────────────────────────────┘
```

---

## Common Confusion: JWT Secret vs JWKS

**You might see "JWT Secret" in Supabase settings** - that's for Supabase's **own** JWTs, not for external JWTs from Clerk.

- **Supabase JWT Secret** = Used when Supabase issues its own JWTs (e.g., email/password auth)
- **Clerk JWKS** = Public keys for validating JWTs from Clerk

Supabase automatically fetches Clerk's public keys when validating the JWT - no manual configuration needed!

---

## Testing the Setup

After updating Clerk claims (Step 1), just **refresh your app** and check the console:

**Expected console output:**
```
🔑 Got Clerk JWT token, setting up Supabase auth...
✅ Supabase session set with Clerk JWT
✅ Supabase auth.uid(): [uuid-here]
```

If you see this, **JWT validation is working!** Supabase accepted the Clerk JWT.

---

## If It Still Doesn't Work

### Debug Step 1: Check JWT Claims

In browser console:
```javascript
// Get the JWT
const token = await clerk.session.getToken({ template: 'supabase' });
console.log(token);

// Decode it at https://jwt.io
// Verify it has these claims:
// - aud: "authenticated"
// - role: "authenticated"
// - sub: "user_xxx" (Clerk user ID)
```

### Debug Step 2: Check Supabase Auth

In browser console after app loads:
```javascript
// Check if Supabase sees the user
const { data } = await supabase.auth.getUser();
console.log('Supabase user:', data.user);
// Should show user object with id matching JWT sub claim
```

### Debug Step 3: Verify JWKS Accessibility

Open in browser:
```
https://choice-starling-76.clerk.accounts.dev/.well-known/jwks.json
```

Should return JSON like:
```json
{
  "keys": [
    {
      "use": "sig",
      "kty": "RSA",
      "kid": "...",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

If this works, Supabase can fetch the keys to validate JWTs.

---

## Summary: What You Need to Do

1. ✅ **Verify RLS policies exist** (see SQL above)
2. ✅ **That's it!** No other Supabase configuration needed
3. ✅ The JWT validation happens automatically when you call `supabase.auth.setSession()`

**Next step:** Test the integration (Step 3 in main guide)