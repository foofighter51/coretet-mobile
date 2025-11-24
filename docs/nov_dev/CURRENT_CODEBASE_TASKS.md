# Current Codebase - Priority Task List
**Updates Required Before Building New Platforms**

**Last Updated:** 2025-11-18
**Status:** Planning Phase

---

## Overview

Before building desktop web or mobile web platforms, we need to **complete and stabilize the current codebase** with all necessary backend changes, database migrations, and core features.

---

## PHASE 1: Database Schema Updates (Week 1)

### ✅ Already Complete
- [x] Remove fake compression messaging from AudioUploader
- [x] Build still works after changes

### 🔲 Priority 1.1: Add Phone Number to Profiles

**Goal:** Account owners need phone numbers for SMS sharing

**Database Migration:**
```sql
-- File: supabase/migrations/20251118_add_phone_to_profiles.sql

BEGIN;

-- Add phone_number column (nullable first for migration)
ALTER TABLE profiles
  ADD COLUMN phone_number TEXT;

-- Add unique index (will fail if duplicates exist, which is good)
CREATE UNIQUE INDEX idx_profiles_phone ON profiles(phone_number)
  WHERE phone_number IS NOT NULL;

-- For existing users: they'll be prompted to add phone on next login
-- (We'll build a modal for this in Phase 2)

COMMIT;
```

**Verification:**
```sql
-- Check column exists
\d profiles;

-- Check existing data
SELECT id, email, phone_number, name FROM profiles;
```

**Tasks:**
- [ ] Create migration file
- [ ] Test on local Supabase
- [ ] Apply to development database
- [ ] Verify existing users can still log in
- [ ] Document rollback procedure

---

### 🔲 Priority 1.2: Add Tier System to Profiles

**Goal:** Enable Free vs Band tier enforcement

**Database Migration:**
```sql
-- File: supabase/migrations/20251118_add_tier_system.sql

BEGIN;

-- Add tier and subscription columns
ALTER TABLE profiles
  ADD COLUMN tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'band', 'producer')),
  ADD COLUMN storage_used BIGINT DEFAULT 0,
  ADD COLUMN storage_limit BIGINT DEFAULT 1073741824, -- 1GB for free
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'active', 'past_due', 'cancelled', 'trialing')),
  ADD COLUMN trial_ends_at TIMESTAMPTZ,
  ADD COLUMN last_active_at TIMESTAMPTZ;

-- Update existing users to have free tier with 1GB limit
UPDATE profiles
SET
  tier = 'free',
  storage_used = 0,
  storage_limit = 1073741824,
  subscription_status = 'none'
WHERE tier IS NULL;

-- Create index on tier for filtering
CREATE INDEX idx_profiles_tier ON profiles(tier);

COMMIT;
```

**Tasks:**
- [ ] Create migration file
- [ ] Test tier constraints work
- [ ] Verify default values apply
- [ ] Test tier queries (SELECT * WHERE tier = 'free')

---

### 🔲 Priority 1.3: Add Storage Tracking to Bands

**Goal:** Track and enforce band storage limits

**Database Migration:**
```sql
-- File: supabase/migrations/20251118_add_band_storage.sql

BEGIN;

ALTER TABLE bands
  ADD COLUMN storage_used BIGINT DEFAULT 0,
  ADD COLUMN storage_limit BIGINT DEFAULT 26843545600, -- 25GB default
  ADD COLUMN max_members INT DEFAULT 10;

-- Update existing bands
UPDATE bands
SET
  storage_used = 0,
  storage_limit = 26843545600,
  max_members = 10
WHERE storage_used IS NULL;

COMMIT;
```

**Tasks:**
- [ ] Create migration file
- [ ] Test on local database
- [ ] Verify existing bands get defaults

---

### 🔲 Priority 1.4: Create Storage Enforcement Triggers

**Goal:** Automatically update storage_used when tracks added/deleted

**Database Migration:**
```sql
-- File: supabase/migrations/20251118_storage_triggers.sql

BEGIN;

-- Function to update storage on track insert
CREATE OR REPLACE FUNCTION update_storage_on_track_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update band storage if track belongs to band
  IF NEW.band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = storage_used + COALESCE(NEW.file_size, 0)
    WHERE id = NEW.band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = storage_used + COALESCE(NEW.file_size, 0)
    WHERE id = NEW.created_by;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_insert_storage_update
  AFTER INSERT ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_track_insert();

-- Function to update storage on track delete
CREATE OR REPLACE FUNCTION update_storage_on_track_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update band storage if track belonged to band
  IF OLD.band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.file_size, 0))
    WHERE id = OLD.band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.file_size, 0))
    WHERE id = OLD.created_by;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_delete_storage_update
  AFTER DELETE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_track_delete();

COMMIT;
```

**Tasks:**
- [ ] Create migration file
- [ ] Test insert trigger (upload track → storage increases)
- [ ] Test delete trigger (delete track → storage decreases)
- [ ] Test with multiple rapid inserts (race conditions?)
- [ ] Verify GREATEST(0, ...) prevents negative storage

---

### 🔲 Priority 1.5: Create SMS Sharing Tables

**Goal:** Support SMS-based playlist sharing

**Database Migration:**
```sql
-- File: supabase/migrations/20251118_sms_sharing_tables.sql

BEGIN;

-- Shared playlists with SMS codes
CREATE TABLE shared_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  shared_by TEXT REFERENCES profiles(id) ON DELETE CASCADE,

  share_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  total_access_grants INT DEFAULT 0,
  total_plays INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual SMS access codes
CREATE TABLE playlist_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_playlist_id UUID REFERENCES shared_playlists(id) ON DELETE CASCADE,

  phone_number_hash TEXT NOT NULL,
  access_code TEXT NOT NULL, -- 6-character code

  is_used BOOLEAN DEFAULT FALSE,
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count INT DEFAULT 0,

  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,

  claimed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(shared_playlist_id, phone_number_hash)
);

-- Playlist followers (for account linking)
CREATE TABLE playlist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,

  source TEXT DEFAULT 'manual', -- 'manual', 'sms_share', 'band_member'
  followed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(playlist_id, user_id)
);

-- SMS credits tracking
CREATE TABLE sms_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,

  credits_total INT NOT NULL,
  credits_used INT DEFAULT 0,
  credits_remaining INT GENERATED ALWAYS AS (credits_total - credits_used) STORED,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Producer tier waitlist
CREATE TABLE producer_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT,
  reason TEXT,

  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shared_playlists_token ON shared_playlists(share_token);
CREATE INDEX idx_playlist_access_grants_code ON playlist_access_grants(access_code);
CREATE INDEX idx_playlist_access_grants_phone ON playlist_access_grants(phone_number_hash);
CREATE INDEX idx_playlist_access_grants_claimed ON playlist_access_grants(claimed_by)
  WHERE claimed_by IS NOT NULL;
CREATE INDEX idx_playlist_followers_user ON playlist_followers(user_id);
CREATE INDEX idx_playlist_followers_playlist ON playlist_followers(playlist_id);
CREATE INDEX idx_sms_credits_user_period ON sms_credits(user_id, period_end);

COMMIT;
```

**Tasks:**
- [ ] Create migration file
- [ ] Test table creation
- [ ] Verify foreign key constraints
- [ ] Test unique constraints
- [ ] Verify generated column (credits_remaining) works

---

### 🔲 Priority 1.6: Initialize SMS Credits for Existing Users

**Goal:** Give existing users their monthly SMS credits

**Database Migration:**
```sql
-- File: supabase/migrations/20251118_init_sms_credits.sql

BEGIN;

-- Create SMS credits for all existing users
INSERT INTO sms_credits (user_id, credits_total, credits_used, period_start, period_end)
SELECT
  id,
  CASE
    WHEN tier = 'free' THEN 10
    WHEN tier = 'band' THEN 50
    WHEN tier = 'producer' THEN 200
    ELSE 10
  END AS credits_total,
  0 AS credits_used,
  CURRENT_DATE AS period_start,
  CURRENT_DATE + INTERVAL '1 month' AS period_end
FROM profiles
WHERE id NOT IN (SELECT user_id FROM sms_credits WHERE period_end > CURRENT_DATE);

COMMIT;
```

**Tasks:**
- [ ] Create migration file
- [ ] Test with sample users
- [ ] Verify credits_remaining calculates correctly

---

## PHASE 2: TypeScript Type Updates (Week 1)

### 🔲 Priority 2.1: Regenerate Database Types

**After all database migrations are complete:**

```bash
# Regenerate TypeScript types from updated schema
npm run db:types
```

**Tasks:**
- [ ] Run type generation
- [ ] Check git diff for changes
- [ ] Verify new columns appear in types
- [ ] Update any hardcoded types in codebase

---

### 🔲 Priority 2.2: Create Tier Constants

**Goal:** Centralized tier limits and business rules

**Create File:** `src/constants/tiers.ts`
```typescript
export const TIER_LIMITS = {
  free: {
    storage: 1_073_741_824,      // 1GB
    bandsCreatable: 0,            // Cannot create bands
    bandsJoinable: 999,           // Can join unlimited
    smsCreditsMonthly: 10,
    sharedPlaylistsMax: 2,
    recipientsPerPlaylist: 5,
    shareExpiryMaxDays: 7,
    bandMembersMax: 0
  },
  band: {
    storage: 26_843_545_600,     // 25GB
    bandsCreatable: 1,            // Can create 1 band
    bandsJoinable: 999,           // Can join unlimited
    bandMembersMax: 10,
    smsCreditsMonthly: 50,
    sharedPlaylistsMax: 10,
    recipientsPerPlaylist: 10,
    shareExpiryMaxDays: 90
  },
  producer: {
    storage: 107_374_182_400,    // 100GB
    bandsCreatable: 999,          // Unlimited
    bandsJoinable: 999,
    bandMembersMax: 20,
    smsCreditsMonthly: 200,
    sharedPlaylistsMax: 999,
    recipientsPerPlaylist: 999,
    shareExpiryMaxDays: 365
  }
} as const;

export type Tier = keyof typeof TIER_LIMITS;
```

**Tasks:**
- [ ] Create constants file
- [ ] Import in relevant components
- [ ] Replace hardcoded limits with constants

---

## PHASE 3: Phone Number Utilities (Week 1)

### 🔲 Priority 3.1: Phone Number Functions

**Create File:** `src/utils/phoneNumber.ts`
```typescript
/**
 * Normalize phone number to E.164 format
 * Examples: '(555) 123-4567' → '+15551234567'
 */
export function normalizePhoneNumber(input: string): string {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // If 10 digits, assume US/Canada (+1)
  if (digits.length === 10) {
    return '+1' + digits;
  }

  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits[0] === '1') {
    return '+' + digits;
  }

  // Otherwise assume country code already included
  return '+' + digits;
}

/**
 * Format phone number for display
 * Example: '+15551234567' → '+1 (555) 123-4567'
 */
export function formatPhoneNumber(e164: string): string {
  // For US/Canada numbers (+1...)
  if (e164.startsWith('+1') && e164.length === 12) {
    const areaCode = e164.slice(2, 5);
    const prefix = e164.slice(5, 8);
    const line = e164.slice(8);
    return `+1 (${areaCode}) ${prefix}-${line}`;
  }

  return e164;
}

/**
 * Hash phone number for privacy (SHA-256)
 */
export async function hashPhoneNumber(phoneNumber: string): Promise<string> {
  const normalized = normalizePhoneNumber(phoneNumber);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber);
  // E.164 format: + followed by 10-15 digits
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}
```

**Tasks:**
- [ ] Create utility file
- [ ] Write unit tests
- [ ] Test with various input formats
- [ ] Test international numbers

---

### 🔲 Priority 3.2: Access Code Generator

**Create File:** `src/utils/accessCode.ts`
```typescript
/**
 * Generate 6-character access code
 * Excludes confusing characters: 0, O, I, 1, l
 */
export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Validate access code format
 */
export function isValidAccessCode(code: string): boolean {
  return /^[A-Z2-9]{6}$/.test(code.toUpperCase());
}
```

**Tasks:**
- [ ] Create utility file
- [ ] Test code generation (ensure no confusing chars)
- [ ] Test validation function

---

## PHASE 4: Backend Services (Week 2)

### 🔲 Priority 4.1: Storage Check Service

**Create File:** `src/services/storageService.ts`
```typescript
import { supabase } from '../lib/supabase';
import { TIER_LIMITS } from '../constants/tiers';

export async function canUploadTrack(
  userId: string,
  bandId: string | null,
  fileSize: number
): Promise<{
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}> {
  if (bandId) {
    // Check band storage
    const { data: band } = await supabase
      .from('bands')
      .select('storage_used, storage_limit')
      .eq('id', bandId)
      .single();

    if (!band) return { allowed: false, reason: 'Band not found' };

    const newTotal = band.storage_used + fileSize;
    if (newTotal > band.storage_limit) {
      return {
        allowed: false,
        reason: 'Band storage limit exceeded',
        currentUsage: band.storage_used,
        limit: band.storage_limit
      };
    }
  } else {
    // Check user's personal storage
    const { data: user } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit, tier')
      .eq('id', userId)
      .single();

    if (!user) return { allowed: false, reason: 'User not found' };

    const newTotal = user.storage_used + fileSize;
    if (newTotal > user.storage_limit) {
      return {
        allowed: false,
        reason: 'Personal storage limit exceeded',
        currentUsage: user.storage_used,
        limit: user.storage_limit
      };
    }
  }

  return { allowed: true };
}

export async function getStorageStatus(userId: string, bandId?: string) {
  if (bandId) {
    const { data: band } = await supabase
      .from('bands')
      .select('storage_used, storage_limit')
      .eq('id', bandId)
      .single();

    return {
      used: band?.storage_used || 0,
      limit: band?.storage_limit || 0,
      percentage: band ? Math.round((band.storage_used / band.storage_limit) * 100) : 0
    };
  } else {
    const { data: user } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', userId)
      .single();

    return {
      used: user?.storage_used || 0,
      limit: user?.storage_limit || 0,
      percentage: user ? Math.round((user.storage_used / user.storage_limit) * 100) : 0
    };
  }
}
```

**Tasks:**
- [ ] Create service file
- [ ] Integrate into upload flow
- [ ] Test storage limit blocking
- [ ] Test storage calculation accuracy

---

### 🔲 Priority 4.2: Tier Enforcement Service

**Create File:** `src/services/tierService.ts`
```typescript
import { supabase } from '../lib/supabase';
import { TIER_LIMITS, Tier } from '../constants/tiers';

export async function canCreateBand(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentTier?: Tier;
}> {
  const { data: user } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single();

  if (!user) return { allowed: false, reason: 'User not found' };

  const tier = user.tier as Tier;

  // Free tier cannot create bands
  if (tier === 'free') {
    return {
      allowed: false,
      reason: 'UPGRADE_REQUIRED',
      currentTier: tier
    };
  }

  // Band tier can create max 1 band
  if (tier === 'band') {
    const { data: bands } = await supabase
      .from('bands')
      .select('id')
      .eq('created_by', userId)
      .eq('is_personal', false);

    if (bands && bands.length >= TIER_LIMITS.band.bandsCreatable) {
      return {
        allowed: false,
        reason: 'BAND_LIMIT_REACHED',
        currentTier: tier
      };
    }
  }

  // Producer tier: unlimited
  return { allowed: true, currentTier: tier };
}

export async function getUserTierInfo(userId: string) {
  const { data: user } = await supabase
    .from('profiles')
    .select('tier, storage_used, storage_limit')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const tier = user.tier as Tier;
  const limits = TIER_LIMITS[tier];

  return {
    tier,
    limits,
    usage: {
      storage: user.storage_used,
      storagePercentage: Math.round((user.storage_used / user.storage_limit) * 100)
    }
  };
}
```

**Tasks:**
- [ ] Create service file
- [ ] Integrate into band creation flow
- [ ] Test free user blocking
- [ ] Test band tier limit (1 band max)

---

## PHASE 5: UI Updates (Week 2)

### 🔲 Priority 5.1: Add Phone Number to Sign-Up

**Update:** `src/components/screens/PhoneAuthScreen.tsx` (or wherever sign-up is)

**Add to Sign-Up Form:**
```typescript
<input
  type="tel"
  placeholder="Phone Number"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(e.target.value)}
  required
/>
<small>Required for sharing playlists via SMS</small>
```

**Add Phone Verification Step:**
```typescript
// After email/password signup:
1. Send SMS OTP to phone number
2. Show OTP entry screen
3. Verify OTP
4. Save phone_number to profile
```

**Tasks:**
- [ ] Add phone input to sign-up form
- [ ] Add OTP verification screen
- [ ] Integrate with Twilio (or stub for now)
- [ ] Test complete sign-up flow

---

### 🔲 Priority 5.2: Prompt Existing Users for Phone

**Create Modal:** `src/components/molecules/AddPhoneModal.tsx`

**Show on login if user.phone_number is null:**
```typescript
if (!currentUser.phone_number) {
  showAddPhoneModal();
}
```

**Tasks:**
- [ ] Create modal component
- [ ] Show on first login after migration
- [ ] Allow users to skip (but remind later)
- [ ] Test flow with existing users

---

### 🔲 Priority 5.3: Storage Limit Warnings

**Create Component:** `src/components/molecules/StorageLimitWarning.tsx`

**Show when storage >80%:**
```typescript
if (storagePercentage >= 80 && storagePercentage < 100) {
  showWarning('You've used 85% of your storage');
}

if (storagePercentage >= 100) {
  showError('Storage limit reached. Delete tracks or upgrade.');
}
```

**Tasks:**
- [ ] Create warning component
- [ ] Integrate into upload flow
- [ ] Block uploads at 100%
- [ ] Show upgrade CTA

---

### 🔲 Priority 5.4: Upgrade Modal (Tier Enforcement)

**Create Component:** `src/components/molecules/UpgradeModal.tsx`

**Show when free user clicks "Create Band":**
```typescript
<Modal>
  <h2>Upgrade to Create Bands</h2>
  <ul>
    <li>25GB storage</li>
    <li>Up to 10 band members</li>
    <li>Voice memo comments</li>
    <li>Version comparison</li>
  </ul>
  <p>$5 first month, $10/month after</p>
  <Button onClick={handleUpgrade}>Start for $5</Button>
  <Button onClick={close}>Maybe Later</Button>
</Modal>
```

**Tasks:**
- [ ] Create modal component
- [ ] Integrate into band creation flow
- [ ] Connect to Stripe (or stub)
- [ ] Test blocking free users

---

## PHASE 6: Testing & Verification (Week 2)

### 🔲 Priority 6.1: Manual Testing Checklist

**Database:**
- [ ] All migrations run successfully
- [ ] Existing users can still log in
- [ ] Triggers fire on track insert/delete
- [ ] Storage calculations are accurate
- [ ] Tier enforcement works correctly

**Phone Numbers:**
- [ ] Can sign up with phone number
- [ ] Phone normalization works (E.164)
- [ ] Phone validation rejects invalid numbers
- [ ] Phone hashing is consistent

**Storage Limits:**
- [ ] Free user can upload up to 1GB
- [ ] Upload blocked at 100% storage
- [ ] Storage decreases when track deleted
- [ ] Band storage separate from personal

**Tier Enforcement:**
- [ ] Free user cannot create bands
- [ ] Band user can create 1 band
- [ ] Band user cannot create 2nd band
- [ ] Upgrade modal shows correctly

---

### 🔲 Priority 6.2: Build Verification

```bash
# Verify build still works
npm run build

# Check for TypeScript errors
npm run type-check

# Run any existing tests
npm test
```

**Tasks:**
- [ ] Build passes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] All features functional

---

## PHASE 7: Documentation (Week 2)

### 🔲 Priority 7.1: Update README

**Add to README.md:**
- Database migration instructions
- Environment variables needed
- How to add phone number to existing users
- Tier limits reference

**Tasks:**
- [ ] Document migration process
- [ ] Document new environment variables
- [ ] Update feature list

---

### 🔲 Priority 7.2: Create Migration Runbook

**Document in:** `docs/DATABASE_MIGRATIONS.md`

**Include:**
- Step-by-step migration instructions
- Rollback procedures
- Verification steps
- Common issues and fixes

**Tasks:**
- [ ] Create migration runbook
- [ ] Test migration on fresh database
- [ ] Document rollback procedure

---

## Summary: What Needs to Be Done

### **Week 1: Database & Backend**
1. ✅ Add `phone_number` to profiles
2. ✅ Add tier system columns
3. ✅ Add storage tracking columns
4. ✅ Create storage triggers
5. ✅ Create SMS sharing tables
6. ✅ Regenerate TypeScript types
7. ✅ Create phone utility functions
8. ✅ Create tier constants

### **Week 2: Services & UI**
1. ✅ Build storage check service
2. ✅ Build tier enforcement service
3. ✅ Update sign-up form (add phone)
4. ✅ Create phone verification flow
5. ✅ Create "Add Phone" modal for existing users
6. ✅ Create storage limit warnings
7. ✅ Create upgrade modal
8. ✅ Test everything

### **Week 3: Polish & Deploy**
1. ✅ Fix any bugs found in testing
2. ✅ Update documentation
3. ✅ Create migration runbook
4. ✅ Deploy to production
5. ✅ Monitor for issues

---

## Priority Order (Start Here)

1. **Database migrations** (can't proceed without these)
2. **Phone utilities** (needed for sign-up)
3. **Storage/tier services** (needed for enforcement)
4. **UI updates** (make features usable)
5. **Testing** (ensure everything works)
6. **Documentation** (for future reference)

---

**Ready to start with Priority 1.1 (Add Phone Number to Profiles)?**
