## CoreTet Admin Notifications System

**Created**: 2025-10-22
**Purpose**: Automated email notifications for new user signups and usage threshold monitoring

---

## 🎯 Features

### 1. **New User Signup Notifications**
- Automatically sends email when user confirms their email
- Includes: email, name, signup timestamp, user ID
- Link to Supabase dashboard

### 2. **Usage Threshold Monitoring**
- **Storage**: Warns at 80% of 8GB limit
- **Users**: Notifies at milestones (100, 200, 300, etc.)
- **Tracks**: Notifies at milestones (500, 1000, 1500, etc.)
- **Tracks per user**: Warns if average exceeds 50 tracks/user

---

## 📋 Prerequisites

1. **Resend API Key** (you already have this)
2. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```
3. **Supabase project linked**
   ```bash
   cd /Users/exleymini/Apps/coretet-band
   supabase link --project-ref tvvztlizyciaafqkigwe
   ```

---

## 🔧 Setup Instructions

### Step 1: Configure Environment Variables

Set the required secrets in Supabase:

```bash
# Your Resend API key
supabase secrets set RESEND_API_KEY=re_your_resend_api_key_here

# Admin email to receive notifications
supabase secrets set ADMIN_EMAIL=ericexley@gmail.com

# Supabase URL (should already be set, but verify)
supabase secrets set SUPABASE_URL=https://tvvztlizyciaafqkigwe.supabase.co

# Service role key (should already be set from previous Edge Functions)
# Get from: Supabase Dashboard → Settings → API → service_role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To verify secrets are set:**
```bash
supabase secrets list
```

---

### Step 2: Deploy Edge Functions

Deploy the notification functions:

```bash
cd /Users/exleymini/Apps/coretet-band

# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy notify-admin
supabase functions deploy check-usage-thresholds
```

**Verify deployment:**
```bash
# Check if functions are running
supabase functions list

# View logs
supabase functions logs notify-admin --tail
```

---

### Step 3: Apply Database Migration

Apply the migration to enable automatic signup notifications:

```bash
# Apply via Supabase CLI
supabase db push

# Or manually in Supabase Dashboard → SQL Editor
# Copy contents of: supabase/migrations/20251022_add_user_signup_notifications.sql
# Run the SQL
```

**Note**: The migration creates a trigger on the `profiles` table that fires when a new user signs up.

---

## 🧪 Testing

### Test 1: New User Signup Notification

1. **Sign up a new test user** in the app
2. **Confirm their email** via the confirmation link
3. **Check your inbox** (ericexley@gmail.com) for signup notification

**Or test manually:**
```bash
curl -X POST 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/notify-admin' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "user_signup",
    "data": {
      "id": "test-user-id",
      "email": "test@example.com",
      "name": "Test User",
      "created_at": "2025-10-22T12:00:00Z"
    }
  }'
```

---

### Test 2: Usage Threshold Monitoring

Run the threshold check function manually:

```bash
curl -X POST 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/check-usage-thresholds' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

This will:
- Check current storage, user count, track count
- Send notifications if any thresholds are exceeded
- Return JSON with metrics and threshold status

**Expected response:**
```json
{
  "success": true,
  "metrics": {
    "userCount": 25,
    "trackCount": 150,
    "storageGB": 2.5,
    "tracksPerUser": 6.0
  },
  "thresholds": [
    {
      "type": "Storage",
      "current": 2.5,
      "threshold": 8,
      "percentage": 31.3,
      "shouldNotify": false
    },
    ...
  ],
  "notifications_sent": 0
}
```

---

## 🔄 Automated Monitoring (Optional)

To run usage checks automatically, set up a cron job in Supabase:

### Option 1: Supabase Cron (Recommended)

1. Go to **Supabase Dashboard → Database → Cron Jobs**
2. Create new job:
   - **Name**: `check_usage_thresholds_daily`
   - **Schedule**: `0 9 * * *` (9 AM daily)
   - **Command**:
     ```sql
     SELECT net.http_post(
       url := 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/check-usage-thresholds',
       headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
     );
     ```

### Option 2: External Cron Service

Use a service like **cron-job.org** or **EasyCron**:
- **URL**: `https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/check-usage-thresholds`
- **Method**: POST
- **Headers**: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
- **Schedule**: Daily at 9 AM

---

## 📊 Customizing Thresholds

Edit thresholds in `supabase/functions/check-usage-thresholds/index.ts`:

```typescript
const THRESHOLDS = {
  storage_gb: 8,           // Change this
  user_count: 100,         // Change this
  track_count: 500,        // Change this
  tracks_per_user: 50,     // Change this
};
```

After changing, redeploy:
```bash
supabase functions deploy check-usage-thresholds
```

---

## 🔍 Monitoring & Logs

### View Edge Function Logs
```bash
# Real-time logs
supabase functions logs notify-admin --tail
supabase functions logs check-usage-thresholds --tail

# Historical logs
supabase functions logs notify-admin --limit 100
```

### Check Email Delivery in Resend

1. Go to https://resend.com/emails
2. View sent emails, delivery status, opens, etc.

---

## 🐛 Troubleshooting

### Problem: No signup notifications received

**Check:**
1. Verify RESEND_API_KEY is set: `supabase secrets list`
2. Check Edge Function logs: `supabase functions logs notify-admin`
3. Verify trigger exists: Run in SQL Editor:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_profile_created_notify';
   ```
4. Test Edge Function manually (see Testing section)

---

### Problem: "Email service not configured"

**Solution:**
```bash
# Set your Resend API key
supabase secrets set RESEND_API_KEY=re_your_key_here
```

---

### Problem: Threshold checks not working

**Check:**
1. Verify function deployed: `supabase functions list`
2. Check logs: `supabase functions logs check-usage-thresholds`
3. Test manually with curl (see Testing section)
4. Verify SERVICE_ROLE_KEY is set: `supabase secrets list`

---

## 📧 Email Examples

### New User Signup Email

**Subject**: 🎉 New User Signup: user@example.com

**Body**:
> **New User Signed Up!**
>
> A new user has joined CoreTet:
> - **Email**: user@example.com
> - **Name**: John Doe
> - **User ID**: abc123...
> - **Signed up**: Oct 22, 2025 at 2:30 PM
>
> [View in Supabase Dashboard →]

---

### Usage Threshold Email

**Subject**: ⚠️ Usage Alert: Storage at 85%

**Body**:
> **⚠️ Usage Threshold Alert**
>
> A usage threshold has been reached:
> - **Type**: Storage
> - **Current**: 6.8 GB
> - **Threshold**: 8 GB
> - **Percentage**: 85%
>
> [View Supabase Dashboard →]
>
> Consider upgrading your Supabase plan or cleaning up old files.

---

## 🔐 Security Notes

- ⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- ⚠️ **NEVER** commit `RESEND_API_KEY` to git
- ✅ All secrets are stored securely in Supabase
- ✅ Edge Functions run server-side with proper authentication
- ✅ Database triggers execute with SECURITY DEFINER

---

## 📝 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CoreTet Notification System              │
└─────────────────────────────────────────────────────────────┘

User Signs Up → Email Confirmed → Profile Created
                                        │
                                        ↓
                              Database Trigger Fires
                                        │
                                        ↓
                              notify-admin Edge Function
                                        │
                                        ↓
                                   Resend API
                                        │
                                        ↓
                              Email → Admin Inbox


Cron Job (Daily 9 AM) → check-usage-thresholds Edge Function
                                        │
                                        ↓
                              Query Supabase DB (users, tracks, storage)
                                        │
                                        ↓
                              Check Against Thresholds
                                        │
                                        ↓
                              If Exceeded → notify-admin Edge Function
                                        │
                                        ↓
                                   Resend API
                                        │
                                        ↓
                              Email → Admin Inbox
```

---

## 🚀 Next Steps

After setup is complete:

1. ✅ Test signup notification with a real user
2. ✅ Test threshold monitoring manually
3. ✅ Set up automated cron job for daily checks
4. ✅ Monitor email delivery in Resend dashboard
5. 📊 Adjust thresholds based on your needs

---

**Questions?** Check function logs or test manually to debug issues.
