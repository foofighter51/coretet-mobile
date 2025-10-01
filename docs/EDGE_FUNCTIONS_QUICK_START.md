# Edge Functions - Quick Start

## 🎯 What We've Built

**Production-ready authentication** using Supabase Edge Functions + Clerk validation.

✅ Secure server-side authentication
✅ Clerk token validation
✅ RLS-protected database
✅ Service role key never exposed

---

## 📋 Quick Installation (15 minutes)

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

### 2. Link Project
```bash
cd /Users/exleymini/Apps/coretet-band
supabase link --project-ref tvvztlizyciaafqkigwe
```

### 3. Set Secrets
```bash
supabase secrets set CLERK_SECRET_KEY=sk_test_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 4. Deploy
```bash
supabase functions deploy
```

### 5. Update Client
See [EDGE_FUNCTIONS_IMPLEMENTATION.md](./EDGE_FUNCTIONS_IMPLEMENTATION.md) for code updates.

---

## 🔑 Where to Find Keys

**Clerk Secret Key:**
- Dashboard → API Keys → Secret key (sk_test_...)

**Supabase Service Role:**
- Dashboard → Settings → API → service_role key

---

## ✅ Test Deployment

```bash
# Get token from browser console:
# const token = await clerk.session.getToken(); console.log(token);

curl -i 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/create-profile' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","phone_number":"+15551234567"}'
```

**Expected:** `{"success":true,"profile":{...}}`

---

## 📚 Full Documentation

- [Complete Implementation Guide](./EDGE_FUNCTIONS_IMPLEMENTATION.md)
- [Edge Functions Setup](../supabase/EDGE_FUNCTIONS_SETUP.md)
- [Auth Solution Overview](./AUTH-SOLUTION-REVISED.md)

---

**Ready?** Start with Step 1 above. Let me know when you need help!