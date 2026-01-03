# Database Backup Instructions

**IMPORTANT**: Run backup BEFORE applying MVP migrations!

---

## ✅ Recommended: Supabase Dashboard (Easiest)

### Step 1: Go to Supabase Dashboard

Open: https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe/settings/database

### Step 2: Create Manual Backup

1. Click on **"Database"** in Settings
2. Scroll to **"Backups"** section
3. Click **"Create backup"** or **"Download backup"**
4. Wait for backup to complete (usually < 1 minute)
5. Note the backup timestamp

### Step 3: Verify Backup

Check that the backup appears in the list with today's date.

**✅ You can now proceed with migrations safely!**

---

## Alternative: Using Database URL (If you have credentials)

If you have the full database connection URL:

```bash
# Set your database password
export SUPABASE_DB_PASSWORD="your-password-here"

# Create backup
pg_dump "postgresql://postgres.tvvztlizyciaafqkigwe:${SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  > database-backups/coretet_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## What Gets Backed Up

The backup includes:
- All tables and data
- All functions and triggers
- All RLS policies
- All indexes and constraints
- All current data (tracks, playlists, users, bands)

---

## When to Use the Backup

**Only if migrations fail or cause issues**:

1. Go to Supabase Dashboard
2. Settings → Database → Backups
3. Find your backup (by timestamp)
4. Click "Restore"
5. Confirm restoration

**Note**: Restoring will overwrite current database with backup state.

---

## After Successful Migration

Once migrations are verified working:
- Keep backup for 7-14 days
- Then it's safe to delete (Supabase auto-manages backups)

---

## Quick Checklist

Before migrations:
- [ ] Create backup (via Dashboard or pg_dump)
- [ ] Note backup timestamp
- [ ] Verify backup exists in dashboard

After migrations:
- [ ] Verify all data intact
- [ ] Run VERIFY_MVP_MIGRATIONS.sql
- [ ] Test core functionality
- [ ] Can delete backup after 1-2 weeks if all good

---

**Current Status**: ⏳ Waiting for backup

**Recommended Action**: Use Supabase Dashboard method (easiest)
