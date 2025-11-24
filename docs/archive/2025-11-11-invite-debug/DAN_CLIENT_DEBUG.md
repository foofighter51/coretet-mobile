# Dan's Band Creation Issue - Client-Side Debugging

**Issue:** Dan is logged in but gets 403 when creating bands

---

## Ask Dan to Run This in Browser Console

```javascript
// 1. Check if user is authenticated
const { data: { user }, error } = await supabase.auth.getUser();
console.log('Current User:', user);
console.log('User ID:', user?.id);
console.log('Error:', error);

// 2. Check session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Access Token:', session?.access_token?.substring(0, 20) + '...');
console.log('Token Expires:', new Date(session?.expires_at * 1000));

// 3. Check if token is expired
const now = Date.now() / 1000;
console.log('Token expired?', session?.expires_at < now);

// 4. Test a simple authenticated query
const { data, error: testError } = await supabase
  .from('profiles')
  .select('id, email')
  .eq('id', user?.id)
  .single();
console.log('Profile query result:', data);
console.log('Profile query error:', testError);

// 5. Try to create band with logging
console.log('Attempting to create band...');
const userId = user?.id;
console.log('Using user ID:', userId);

const { data: bandData, error: bandError } = await supabase
  .from('bands')
  .insert({
    name: 'Debug Test Band',
    created_by: userId,
    is_personal: false,
  })
  .select()
  .single();

console.log('Band creation result:', bandData);
console.log('Band creation error:', bandError);

// 6. Check auth headers being sent
console.log('Supabase client auth header:', supabase.auth.headers?.());
```

---

## Expected Output

### If Working Correctly:
```javascript
Current User: { id: "929a7b64-b93e-430e-8a6f-7d0cc2c8d182", email: "dan@vnkle.com", ... }
User ID: "929a7b64-b93e-430e-8a6f-7d0cc2c8d182"
Session: { access_token: "eyJ...", ... }
Token expired?: false
Profile query result: { id: "929a7b64-...", email: "dan@vnkle.com" }
Band creation result: { id: "...", name: "Debug Test Band", ... }
```

### If Token Expired:
```javascript
Token expired?: true  // ❌ THIS IS THE PROBLEM
```

### If Session Missing:
```javascript
Session: null  // ❌ THIS IS THE PROBLEM
```

### If Wrong User ID:
```javascript
User ID: null  // ❌ THIS IS THE PROBLEM
// or
User ID: "different-id-than-expected"  // ❌ THIS IS THE PROBLEM
```

---

## Common Issues & Fixes

### Issue 1: Token Expired
**Symptom:** `Token expired?: true`
**Fix:**
```javascript
// Refresh the session
await supabase.auth.refreshSession();
// Then try band creation again
```

### Issue 2: No Session
**Symptom:** `Session: null` but user appears logged in
**Fix:**
```javascript
// Sign out and sign back in
await supabase.auth.signOut();
// Then log in again through UI
```

### Issue 3: User ID Mismatch
**Symptom:** `user.id` doesn't match `929a7b64-b93e-430e-8a6f-7d0cc2c8d182`
**Fix:** Dan is logged in as a DIFFERENT user account
- Check which email is showing in the UI
- Sign out completely
- Clear browser cache/cookies
- Log in as dan@vnkle.com

### Issue 4: Auth Header Not Sent
**Symptom:** Supabase client not sending Authorization header
**Fix:**
```javascript
// Reinitialize Supabase client
window.location.reload();
```

---

## Alternative: Quick Test

Ask Dan to:

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Try creating a band**
4. **Find the failed request:** `POST /rest/v1/bands`
5. **Click on it → Headers**
6. **Look for:** `Authorization: Bearer eyJ...`

**If Authorization header is missing → Auth not being sent**
**If Authorization header is present → Check if token is valid**

---

## Nuclear Option: Fresh Login

If nothing else works:

```javascript
// In browser console
await supabase.auth.signOut();
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

Then have Dan log in again fresh.

---

## Report Back

After Dan runs the console commands, share:
1. User ID value
2. Whether token is expired
3. Band creation error details
4. Authorization header presence

This will pinpoint the exact issue.
