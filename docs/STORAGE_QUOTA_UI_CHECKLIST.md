# Storage Quota UI Implementation Checklist

## Issue Found
The Settings screen doesn't display storage quota information (storage_used / storage_limit).

**Screenshots show:**
- Name: Eric
- Email: ericexley@gmail.com
- ❌ **Missing**: Storage usage (e.g., "125 MB of 1 GB used")

---

## ✅ What's Already Done

### 1. Database Schema ✅
- ✅ `storage_used` column exists in `profiles` table
- ✅ `storage_limit` column exists in `profiles` table
- ✅ Migration: `20251118160100_add_tier_system.sql` applied

**Verify in Supabase:**
```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('storage_used', 'storage_limit');

-- Expected result:
-- storage_used  | bigint | 0
-- storage_limit | bigint | 1073741824
```

### 2. Backend Code ✅
- ✅ `audioUploadService.ts` - All 5 bug fixes applied
- ✅ `lib/supabase.ts` - Helper methods added
- ✅ Quota check before upload
- ✅ Quota increment after upload
- ✅ Quota decrement after delete

---

## ❌ What's Missing - UI Display

### The Settings Modal needs to show storage quota

**Current UI:** (from screenshot)
```
Name: Eric
Email: ericexley@gmail.com
Phone: [if exists]
[Dark Mode Toggle]
[Replay Intro]
[Sign Out]
```

**Should show:**
```
Name: Eric
Email: ericexley@gmail.com
Phone: [if exists]

Storage: 125 MB of 1 GB used
[Progress bar: ▓▓▓▓▓▓▓░░░░░░░░░░░░] 12%

[Dark Mode Toggle]
[Replay Intro]
[Sign Out]
```

---

## 🔧 Fix Required

### File to Edit
`src/components/molecules/SettingsModal.tsx`

### What to Add

**Step 1: Import storage helper**
Add this to the imports (after line 5):
```typescript
import { db } from '../../../lib/supabase';
import AudioProcessor from '../../utils/audioProcessor';
```

**Step 2: Add state for storage quota**
Add after line 29:
```typescript
const [storageQuota, setStorageQuota] = React.useState<{
  used: number;
  limit: number;
  percentUsed: number;
  usedFormatted: string;
  limitFormatted: string;
} | null>(null);

// Fetch storage quota on mount
React.useEffect(() => {
  const fetchQuota = async () => {
    if (!currentUser.id) return;

    try {
      const quota = await db.storage.getStorageQuota(currentUser.id);
      setStorageQuota({
        used: quota.used,
        limit: quota.limit,
        percentUsed: quota.percentUsed,
        usedFormatted: AudioProcessor.formatFileSize(quota.used),
        limitFormatted: AudioProcessor.formatFileSize(quota.limit),
      });
    } catch (error) {
      console.error('Failed to fetch storage quota:', error);
    }
  };

  if (isOpen) {
    fetchQuota();
  }
}, [isOpen, currentUser.id]);
```

**Step 3: Add storage display section**
Add this AFTER the phone number section (after line 112) and BEFORE the Dark Mode toggle:

```typescript
{/* Storage Quota Display */}
{storageQuota && (
  <div
    style={{
      marginTop: designTokens.spacing.lg,
      paddingTop: designTokens.spacing.lg,
      borderTop: `1px solid ${designTokens.colors.borders.subtle}`,
    }}
  >
    <div style={{ marginBottom: designTokens.spacing.sm }}>
      <p
        style={{
          fontSize: designTokens.typography.fontSizes.bodySmall,
          color: designTokens.colors.neutral.darkGray,
          marginBottom: designTokens.spacing.xs,
        }}
      >
        Storage
      </p>
      <p
        style={{
          fontSize: designTokens.typography.fontSizes.body,
          fontWeight: designTokens.typography.fontWeights.medium,
          color: designTokens.colors.neutral.charcoal,
        }}
      >
        {storageQuota.usedFormatted} of {storageQuota.limitFormatted} used
      </p>
    </div>

    {/* Progress Bar */}
    <div
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: designTokens.colors.surface.secondary,
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: `${Math.min(storageQuota.percentUsed, 100)}%`,
          height: '100%',
          backgroundColor:
            storageQuota.percentUsed > 90
              ? designTokens.colors.semantic.error
              : storageQuota.percentUsed > 75
              ? designTokens.colors.accent.yellow
              : designTokens.colors.primary.blue,
          transition: 'width 0.3s ease',
        }}
      />
    </div>

    {/* Percentage Display */}
    <p
      style={{
        fontSize: designTokens.typography.fontSizes.bodySmall,
        color: designTokens.colors.neutral.darkGray,
        marginTop: designTokens.spacing.xs,
        textAlign: 'right',
      }}
    >
      {storageQuota.percentUsed.toFixed(1)}% used
    </p>
  </div>
)}
```

---

## 🛠️ Implementation Steps

### Option A: Manual Edit (Recommended if you want to see the changes)

1. **Open the file:**
   ```bash
   # In VS Code or your editor
   open src/components/molecules/SettingsModal.tsx
   ```

2. **Add the imports** (top of file)

3. **Add the state and useEffect** (after line 29)

4. **Add the storage display section** (after line 112, before Dark Mode toggle)

5. **Save the file**

6. **Test in browser:**
   - Refresh the app
   - Open Settings
   - Should now show storage quota

### Option B: Let me create the updated file

I can write the complete updated file for you if you prefer.

---

## 🧪 Testing After Fix

### Manual Test
```bash
# 1. Start dev server
npm run dev

# 2. Open browser: http://localhost:3001

# 3. Login

# 4. Click Settings icon (gear icon)

# Expected Result:
# ✅ See "Storage: X MB of Y GB used"
# ✅ See progress bar
# ✅ See percentage (e.g., "12.5% used")
```

### SQL Verification
Run this in Supabase SQL Editor to see your actual quota:
```sql
SELECT
  id,
  email,
  storage_used,
  storage_limit,
  (storage_used::float / storage_limit::float * 100) as percent_used,
  pg_size_pretty(storage_used::bigint) as used_formatted,
  pg_size_pretty(storage_limit::bigint) as limit_formatted
FROM profiles
WHERE email = 'ericexley@gmail.com';
```

---

## 🔍 Additional Issues to Check

### 1. Database Migration Status

**Check if migrations are applied:**
```bash
# In terminal
cd /Users/exleymini/Apps/coretet-band

# Check migration status (if using Supabase CLI)
supabase db pull

# OR check in Supabase Dashboard:
# https://supabase.com/dashboard/project/YOUR_PROJECT/database/migrations
```

**If migration NOT applied, run it:**
```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manual - Copy SQL from migration file and run in SQL Editor
# File: supabase/migrations/20251118160100_add_tier_system.sql
```

### 2. Check if your profile has quota data

```sql
-- Run in Supabase SQL Editor
SELECT
  id,
  email,
  storage_used,
  storage_limit,
  tier
FROM profiles
WHERE email = 'ericexley@gmail.com';

-- If storage_used or storage_limit is NULL, run this:
UPDATE profiles
SET
  storage_used = COALESCE(storage_used, 0),
  storage_limit = COALESCE(storage_limit, 1073741824), -- 1GB
  tier = COALESCE(tier, 'free')
WHERE email = 'ericexley@gmail.com';
```

### 3. Recalculate your current storage usage

```sql
-- Calculate actual storage from tracks
UPDATE profiles p
SET storage_used = (
  SELECT COALESCE(SUM(t.file_size), 0)
  FROM tracks t
  WHERE t.created_by = p.id
)
WHERE p.email = 'ericexley@gmail.com';

-- Verify it worked
SELECT
  email,
  storage_used,
  (SELECT COUNT(*) FROM tracks WHERE created_by = profiles.id) as track_count,
  (SELECT COALESCE(SUM(file_size), 0) FROM tracks WHERE created_by = profiles.id) as calc_storage
FROM profiles
WHERE email = 'ericexley@gmail.com';
```

---

## 🚀 Quick Implementation Command

If you want me to apply the fix automatically:

**Tell me:**
1. "Apply the storage UI fix" - I'll update SettingsModal.tsx
2. "Show me the code first" - I'll show you the exact changes
3. "I'll do it manually" - Use the code snippets above

---

## 📊 Expected Result After Fix

### Settings Screen Should Show:

```
┌─────────────────────────────┐
│         Settings            │
├─────────────────────────────┤
│ Name                        │
│ Eric                        │
│                             │
│ Email                       │
│ ericexley@gmail.com         │
│                             │
│ Storage                     │ ← NEW
│ 125 MB of 1 GB used         │ ← NEW
│ ▓▓▓▓▓░░░░░░░░░░░░░░ 12.5%   │ ← NEW
│                             │
│ [🌙 Switch to Dark Mode]    │
│ [? Replay Intro]            │
│ [🧪 Test Onboarding]        │
│ [Sign Out]                  │
└─────────────────────────────┘
```

---

## 📝 Summary

**What's working:**
- ✅ Database has storage columns
- ✅ Backend code tracks quota correctly
- ✅ Upload/delete operations update quota

**What needs fixing:**
- ❌ UI doesn't display storage quota

**Fix:**
- Edit `SettingsModal.tsx` to add storage display
- Takes ~5 minutes
- ~50 lines of code to add

**Want me to apply the fix now?** Just say the word!
