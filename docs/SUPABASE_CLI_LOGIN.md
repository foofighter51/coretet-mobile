# Supabase CLI Login Issue - Fixed

## The Problem
You need to authenticate the Supabase CLI before you can link to your project.

## Solution: Login to Supabase CLI

### Step 1: Login
```bash
supabase login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Generate an access token
4. Save it locally

**Follow the prompts in your browser to authorize the CLI.**

### Step 2: Now Link Your Project
After logging in successfully, run:
```bash
supabase link --project-ref tvvztlizyciaafqkigwe
```

You may be prompted for your database password (the one you set when creating the Supabase project).

---

## Alternative: Using Access Token Directly

If `supabase login` doesn't work (firewall/browser issues), you can use an access token:

### Get Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a name (e.g., "CLI Access")
4. Copy the token

### Set Token as Environment Variable
```bash
export SUPABASE_ACCESS_TOKEN=your_token_here
```

### Now Link Project
```bash
supabase link --project-ref tvvztlizyciaafqkigwe
```

---

## After Successful Login/Link

You should see:
```
Finished supabase link.
```

Then you can proceed with setting secrets and deploying functions!

---

## Troubleshooting

### Error: "Invalid project ref"
- **Solution:** Double-check the project ref is `tvvztlizyciaafqkigwe`

### Error: "Database password incorrect"
- **Solution:** Use the password you set when creating the Supabase project
- You can reset it in Supabase Dashboard → Settings → Database

### Error: "Browser didn't open"
- **Solution:** Use the access token method instead (see above)

---

## Next Steps After Login

Once `supabase link` succeeds:

1. ✅ Set Clerk secret:
   ```bash
   supabase secrets set CLERK_SECRET_KEY=sk_test_DL6phcQocW3nR8XjGXk3PGTatCUjdP1OoewB3DyUUS
   ```

2. ✅ Get Supabase service role key from Dashboard → Settings → API

3. ✅ Set service role secret:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. ✅ Deploy functions:
   ```bash
   supabase functions deploy
   ```