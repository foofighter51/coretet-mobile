# Browser Console Diagnostic for Dan

Dan, please open the browser console (F12) and run these commands one at a time. Copy/paste the output for each:

## 1. Check Auth Session
```javascript
const { data: session } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.session?.user?.id);
console.log('Access Token:', session?.session?.access_token ? 'EXISTS' : 'MISSING');
```

## 2. Check Auth User
```javascript
const { data: user } = await supabase.auth.getUser();
console.log('User:', user);
```

## 3. Test Direct Insert (This will fail but shows exact error)
```javascript
const { data, error } = await supabase
  .from('bands')
  .insert({
    name: 'Test Direct Insert',
    created_by: '929a7b64-b93e-430e-8a6f-7d0cc2c8d182',
    is_personal: false
  })
  .select()
  .single();

console.log('Insert result:', { data, error });
```

## 4. Check Headers Being Sent
```javascript
// This shows what auth headers are being sent
const response = await fetch('https://tvvztlizyciaafqkigwe.supabase.co/rest/v1/bands?select=*', {
  method: 'GET',
  headers: supabase.rest.headers
});
console.log('Headers:', Object.fromEntries(response.headers.entries()));
console.log('Auth header:', supabase.rest.headers.Authorization || 'MISSING');
```

## 5. Check if Session is Stale
```javascript
const { data: refreshed } = await supabase.auth.refreshSession();
console.log('Session refreshed:', refreshed);
```

## 6. After running all above, try creating band again
Then try creating a band through the UI and see if error changes.
