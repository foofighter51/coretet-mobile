# Dan's Login Issue - Diagnosis & Fix

**User:** dan@vnkle.com
**User ID:** 929a7b64-b93e-430e-8a6f-7d0cc2c8d182
**Issue:** Cannot log in, gets 400 Bad Request

---

## Browser Console Errors

```
POST https://tvvztlizyciaafqkigwe.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

Then when trying to create band:
```
POST https://tvvztlizyciaafqkigwe.supabase.co/rest/v1/bands?select=* 403 (Forbidden)
new row violates row-level security policy for table "bands"
```

---

## What We Know ✅

From running `CHECK_DAN_SPECIFIC.sql`:

1. ✅ **Dan's profile exists** in `profiles` table
2. ✅ **Dan has a personal band** (created Nov 4, 2025)
3. ✅ **Dan is owner** of his personal band
4. ✅ **RLS policy is correct**: `auth.uid() IS NOT NULL`
5. ✅ **Policy simulation passes**: Dan should be able to create bands

**Conclusion:** The database and RLS policies are fine. The issue is with **authentication**.

---

## The Real Problem: Login Failure

Dan **cannot authenticate** - the 400 error happens during login, BEFORE he tries to create a band.

**Why the 403 on band creation happens:**
- Dan isn't actually logged in (login failed with 400)
- Without auth session, `auth.uid()` returns NULL
- NULL fails the RLS policy check `auth.uid() IS NOT NULL`
- Result: 403 Forbidden

---

## Likely Causes (in order of probability)

### 1. Wrong Password ⭐ **Most Likely**
- Dan is entering incorrect password
- Supabase returns 400 for invalid credentials
- **Fix:** Dan needs to reset password or use correct one

### 2. Email Not Confirmed
- Account exists but email not verified
- Some Supabase configs require confirmed email
- **Check:** Run `CHECK_DAN_AUTH_STATUS.sql` section 1
- **Fix:** Confirm email or disable email confirmation requirement

### 3. Account in Bad State
- Account banned, deleted, or suspended
- **Check:** Run `CHECK_DAN_AUTH_STATUS.sql` section 2
- **Fix:** Reactivate account in Supabase Auth dashboard

### 4. Duplicate Accounts
- Multiple auth records with same email
- **Check:** Run `CHECK_DAN_AUTH_STATUS.sql` section 5
- **Fix:** Delete duplicate, keep one

### 5. No Password Set
- Account created without password (OAuth only?)
- **Check:** Run `CHECK_DAN_AUTH_STATUS.sql` section 3
- **Fix:** Set password via recovery link

---

## Diagnostic Steps

### Step 1: Run Auth Status Check

In Supabase SQL Editor, run:
```sql
-- Copy/paste contents of: migrations/CHECK_DAN_AUTH_STATUS.sql
```

This will show:
- Is email confirmed?
- Is account banned?
- Is password set?
- Are there duplicates?
- Is profile linked correctly?

### Step 2: Check Supabase Auth Dashboard

Go to: Authentication → Users → Search "dan@vnkle.com"

Look for:
- ✅ Green checkmark next to email (confirmed)
- ❌ Red indicators (banned, deleted)
- Last Sign In date (should be recent if working)

### Step 3: Verify Password

**Option A:** Ask Dan to try password reset
- Send password reset email
- Have Dan set new password
- Try logging in again

**Option B:** Create temporary password (if admin)
- In Supabase Auth dashboard
- Click on dan@vnkle.com user
- Set temporary password
- Share with Dan securely

---

## Quick Fixes

### Fix 1: Resend Confirmation Email (if email not confirmed)

```sql
-- In Supabase SQL Editor
UPDATE auth.users
SET confirmation_sent_at = NOW()
WHERE email = 'dan@vnkle.com';
```

Then manually send confirmation email via Supabase dashboard.

### Fix 2: Mark Email as Confirmed (if safe to do so)

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'dan@vnkle.com'
AND email_confirmed_at IS NULL;
```

### Fix 3: Remove Ban (if account is banned)

```sql
UPDATE auth.users
SET banned_until = NULL
WHERE email = 'dan@vnkle.com';
```

### Fix 4: Password Reset

In Supabase Dashboard:
1. Go to Authentication → Users
2. Find dan@vnkle.com
3. Click "..." menu → "Send password reset email"
4. Dan clicks link in email and sets new password

---

## Testing After Fix

1. **Dan logs in** with new/correct password
2. **Browser console** should show successful auth:
   ```
   POST .../auth/v1/token?grant_type=password 200 (OK)
   ```
3. **Try creating band** - should now work
4. **Verify in Supabase:**
   ```sql
   SELECT * FROM bands WHERE created_by = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182' ORDER BY created_at DESC LIMIT 5;
   ```

---

## Prevention

### For New Users

Ensure signup flow:
1. Creates auth user
2. Sends confirmation email (or auto-confirms)
3. Creates profile in `profiles` table
4. Creates personal band
5. Sets up band_members entry

### For Legacy Users

Run periodic check:
```sql
-- migrations/CHECK_ALL_USERS_MISSING_PERSONAL_BANDS.sql
```

Fix any users without personal bands.

---

## Summary

**The issue is NOT with:**
- ❌ RLS policies (they're correct)
- ❌ Personal bands (Dan has one)
- ❌ Profile (exists and linked)
- ❌ Database schema

**The issue IS with:**
- ✅ **Authentication** - Dan cannot log in (400 error)

**Next Step:**
Run `CHECK_DAN_AUTH_STATUS.sql` to find the specific auth problem, then apply appropriate fix.

**Most likely:** Dan needs to reset his password.
