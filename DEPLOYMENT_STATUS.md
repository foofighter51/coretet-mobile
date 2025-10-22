# Notification System Deployment Status

**Date**: 2025-10-22
**Status**: ✅ PARTIALLY DEPLOYED - Manual step required

---

## ✅ Completed

1. **Secrets Configured**
   - ✅ RESEND_API_KEY: `re_5kdVjgPA...` (set)
   - ✅ ADMIN_EMAIL: `coretetapp@gmail.com` (set)

2. **Edge Functions Deployed**
   - ✅ `notify-admin` - Live at: https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/notify-admin
   - ✅ `check-usage-thresholds` - Live at: https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/check-usage-thresholds

3. **Code Committed & Pushed**
   - ✅ All notification code in GitHub
   - ✅ Migrations ready to apply

---

## ⚠️ TODO: Apply Database Migration

The database trigger needs to be applied manually due to a migration history mismatch.

### Option 1: Apply via Supabase Dashboard (RECOMMENDED - 2 minutes)

1. Go to: https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe/sql/new
2. Copy the contents of: `supabase/migrations/MANUAL_APPLY_notifications.sql`
3. Paste into SQL Editor
4. Click "Run" button
5. Verify: You should see "Success. No rows returned"

### Option 2: Fix Migration History & Push (5 minutes)

```bash
# Pull remote migrations to sync
supabase db pull

# Then push all migrations
supabase db push
```

---

## 🧪 Testing the System

### Test 1: Manual notification test

```bash
curl -X POST 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/notify-admin' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "user_signup",
    "data": {
      "id": "test-123",
      "email": "test@example.com",
      "name": "Test User",
      "created_at": "2025-10-22T20:00:00Z"
    }
  }'
```

**Expected**: Email sent to `coretetapp@gmail.com` with subject "🎉 New User Signup: test@example.com"

---

### Test 2: Usage threshold check

```bash
curl -X POST 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/check-usage-thresholds' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

**Expected**: JSON response with current metrics:
```json
{
  "success": true,
  "metrics": {
    "userCount": X,
    "trackCount": Y,
    "storageGB": Z.ZZ,
    "tracksPerUser": A.AA
  },
  "thresholds": [...],
  "notifications_sent": 0
}
```

---

### Test 3: Real user signup (after migration applied)

1. Sign up a new user in the app
2. Confirm their email
3. Check `coretetapp@gmail.com` inbox
4. Should receive signup notification within 30 seconds

---

## 📊 What You'll Receive

### New User Signup Email
**From**: CoreTet Notifications <notifications@coretet.app>
**To**: coretetapp@gmail.com
**Subject**: 🎉 New User Signup: user@example.com

```
New User Signed Up!

A new user has joined CoreTet:
• Email: user@example.com
• Name: John Doe
• User ID: abc-123-def
• Signed up: Oct 22, 2025 at 2:30 PM

[View in Supabase Dashboard →]
```

---

### Usage Threshold Alert Email
**From**: CoreTet Notifications <notifications@coretet.app>
**To**: coretetapp@gmail.com
**Subject**: ⚠️ Usage Alert: Storage at 85%

```
⚠️ Usage Threshold Alert

A usage threshold has been reached:
• Type: Storage
• Current: 6.8 GB
• Threshold: 8 GB
• Percentage: 85%

[View Supabase Dashboard →]

Consider upgrading your Supabase plan or cleaning up old files.
```

---

## 🔑 Finding Your Service Role Key

To test the functions, you need the Supabase service role key:

1. Go to: https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe/settings/api
2. Scroll to "Project API keys"
3. Copy the **service_role** key (starts with `eyJ...`)
4. ⚠️ **NEVER commit this key to git or expose it in client code!**

---

## 📅 Optional: Set Up Daily Monitoring

To get daily usage reports, set up a cron job:

### Using Supabase Cron Extension

1. Go to: https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe/database/extensions
2. Enable "pg_cron" extension
3. Run this SQL to create daily job:

```sql
SELECT cron.schedule(
  'check-usage-daily',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT net.http_post(
    url := 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/check-usage-thresholds',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

---

## 📝 Current Configuration

**Thresholds** (can be adjusted in `check-usage-thresholds/index.ts`):
- Storage: Warn at 8 GB
- Users: Notify every 100 users (100, 200, 300...)
- Tracks: Notify every 500 tracks (500, 1000, 1500...)
- Tracks/user: Warn if average exceeds 50

**Email Provider**: Resend (via API)
**Admin Email**: coretetapp@gmail.com
**Sender Email**: notifications@coretet.app (verified domain)

---

## 🐛 Troubleshooting

**No emails received?**
1. Check Resend dashboard: https://resend.com/emails
2. Check Edge Function logs: `supabase functions logs notify-admin`
3. Verify secrets: `supabase secrets list`

**Migration fails?**
- Apply manually via SQL Editor (see Option 1 above)
- Check for syntax errors in the migration file

**Function returns error?**
- Check function logs for detailed error messages
- Verify service role key is correct
- Ensure Resend API key is valid

---

## ✅ Next Steps

1. **Apply the database migration** (see "TODO" section above)
2. **Test with a real signup** to verify end-to-end flow
3. **Check Resend dashboard** to confirm emails are sending
4. **Set up daily cron** (optional but recommended)

---

**Questions?** Check `supabase/NOTIFICATIONS_SETUP.md` for full documentation.
