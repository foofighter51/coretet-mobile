# Dan's Debug - Simplified Version

Since `supabase` isn't globally accessible, use this instead:

---

## Option 1: Check Network Tab (Easiest)

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Try creating a band** (the action that fails)
4. **Find the request:** Look for `POST` to `/rest/v1/bands`
5. **Click on it**
6. **Go to Headers tab**
7. **Look for:** `Authorization: Bearer ...` under "Request Headers"

**Questions:**
- Is there an `Authorization` header?
- What's the value (first 30 characters)?
- What's the response status? (should show 403)

---

## Option 2: Check localStorage

Paste this in console:
```javascript
// Check if auth token exists
const authStorage = localStorage.getItem('sb-tvvztlizyciaafqkigwe-auth-token');
console.log('Auth token exists?', authStorage !== null);
console.log('Auth data:', authStorage ? JSON.parse(authStorage) : 'No token found');

// Show all Supabase keys
Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-')).forEach(key => {
  console.log(key, ':', localStorage.getItem(key)?.substring(0, 50) + '...');
});
```

---

## Option 3: Add Temporary Logging to App

I can add console.log statements to the band creation code to see what's being sent. Would you like me to do that?

---

## What We Need

From Dan, we need to know:

1. **Is the Authorization header present** in the Network tab request?
2. **What's Dan's user ID** showing in the app UI (probably in Profile tab)?
3. **Does localStorage have auth tokens?** (Option 2 above)

This will tell us if:
- ❌ Auth token not being sent at all
- ❌ Auth token is invalid/expired
- ❌ User ID mismatch

---

## Quick Fix to Try First

Ask Dan to try this:
1. Sign out completely
2. Close browser tab
3. Open new tab to https://coretet.app
4. Sign in fresh
5. Try creating band again

Sometimes stale sessions cause this.
