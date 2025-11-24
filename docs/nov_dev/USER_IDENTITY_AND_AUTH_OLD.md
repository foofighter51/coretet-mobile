# CoreTet User Identity & Authentication Model
**Phone-First Identity System**

**Last Updated:** 2025-11-18
**Status:** Architecture Design

---

## Overview

CoreTet uses a **phone-first identity system** where phone numbers are the primary user identifier. This allows seamless integration between:
- Account owners (authenticated users with full features)
- SMS share recipients (temporary access without account)
- Account linking (SMS recipients can claim shared content by creating an account)

---

## User Identity Model

### Core Principle: Phone Number = User Identity

**Why Phone-First?**
1. **Unified sharing experience** - SMS codes and account access use same identifier
2. **Instant account linking** - SMS recipient creates account → automatically claims all shared content
3. **Mobile-native** - Matches how musicians actually collaborate
4. **No email requirement** - Musicians may not use email regularly
5. **Prevents duplicate accounts** - Can't create multiple accounts with same phone

---

## User Types

### 1. Account Owners (Authenticated Users)

**Authentication:** Phone number + SMS OTP (Supabase Auth)

**Profile Structure:**
```typescript
type UserProfile = {
  id: string;                    // Supabase auth.users.id (UUID)
  phone_number: string;          // PRIMARY IDENTIFIER (E.164 format: +1234567890)
  name: string;                  // Display name
  email?: string;                // Optional (for receipts, notifications)
  avatar_url?: string;           // Profile photo

  // Subscription & Storage
  tier: 'free' | 'band' | 'producer';
  storage_used: number;          // Bytes
  storage_limit: number;         // Bytes
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status: 'none' | 'active' | 'past_due' | 'cancelled';
  trial_ends_at?: Date;

  // Metadata
  created_at: Date;
  updated_at: Date;
  onboarding_completed: boolean;
  last_active_at?: Date;
};
```

**Database Schema:**
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity (phone is primary, email is optional)
  phone_number TEXT UNIQUE NOT NULL,  -- E.164 format: +1234567890
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,

  -- Subscription
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'band', 'producer')),
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 1073741824, -- 1GB for free
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'none',
  trial_ends_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ
);

-- Indexes
CREATE UNIQUE INDEX idx_profiles_phone ON profiles(phone_number);
CREATE INDEX idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
```

---

### 2. SMS Share Recipients (Unauthenticated)

**Access Method:** SMS access code (temporary, expires after 7-90 days)

**Session Storage (Browser LocalStorage):**
```typescript
type GuestSession = {
  grantId: string;               // playlist_access_grants.id
  shareToken: string;            // shared_playlists.share_token
  playlistId: string;
  expiresAt: Date;
  accessedAt: Date;

  // Listen tracking (client-side only)
  listenedTrackIds: string[];
  lastPlayedTrackId?: string;
};
```

**No database record created** - access tracking in `playlist_access_grants` table only

---

### 3. Account Linking (SMS Recipient → Account Owner)

**Scenario:** SMS recipient wants to save playlist to their account

**Flow:**
```
1. Recipient receives SMS with access code
   ↓
2. Opens link, enters code, listens to playlist
   ↓
3. Sees banner: "Save this playlist to your CoreTet account"
   ↓
4. Clicks "Create Account" or "Sign In"
   ↓
5a. IF creating new account:
    - Enter phone number (same as SMS recipient)
    - Verify with OTP
    - Set name
    - Account created
    ↓
5b. IF signing into existing account:
    - Enter phone number
    - Verify with OTP
    - Account identified
    ↓
6. Backend checks: Does this phone number match any playlist_access_grants?
   ↓
7. IF matches found:
   - All shared playlists with this phone_number_hash → linked to user account
   - User can now see playlists in "Following" tab
   ↓
8. User has full access to all previously shared content
```

**Database Linking:**
```sql
-- Find all access grants for this phone number
SELECT pag.*, sp.playlist_id
FROM playlist_access_grants pag
JOIN shared_playlists sp ON sp.id = pag.shared_playlist_id
WHERE pag.phone_number_hash = hash_phone_number('+1234567890')
AND pag.is_revoked = FALSE
AND pag.expires_at > NOW();

-- Create playlist_followers records to link to user account
INSERT INTO playlist_followers (playlist_id, user_id, source)
SELECT DISTINCT sp.playlist_id, 'user-uuid', 'sms_share'
FROM playlist_access_grants pag
JOIN shared_playlists sp ON sp.id = pag.shared_playlist_id
WHERE pag.phone_number_hash = hash_phone_number('+1234567890')
AND pag.is_revoked = FALSE
AND pag.expires_at > NOW();
```

---

## Authentication Flows

### Flow 1: New User Sign Up (Account Owner)

```
1. User clicks "Sign Up"
   ↓
2. Enter phone number: [+1 (555) 123-4567]
   ↓
3. Click "Send Code"
   ↓
4. Backend: Supabase Auth sends SMS OTP
   ↓
5. User receives 6-digit code: "Your CoreTet code: 123456"
   ↓
6. User enters code: [1] [2] [3] [4] [5] [6]
   ↓
7. Backend: Verify OTP
   ↓
8. IF verified:
   - Create auth.users record (Supabase)
   - Create profiles record
   - Check for existing SMS shares with this phone
   - Link any found playlists to account
   ↓
9. Onboarding: Enter name
   ↓
10. User lands in dashboard (Free tier)
```

**Supabase Auth Code:**
```typescript
async function signUpWithPhone(phoneNumber: string) {
  // Normalize to E.164 format
  const normalized = normalizePhoneNumber(phoneNumber); // e.g., "+12345678901"

  // Send OTP
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: normalized,
    options: {
      channel: 'sms'
    }
  });

  if (error) throw error;

  return { success: true, message: 'Code sent to ' + normalized };
}

async function verifyOTP(phoneNumber: string, token: string) {
  const normalized = normalizePhoneNumber(phoneNumber);

  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token: token,
    type: 'sms'
  });

  if (error) throw error;

  // After successful verification, create profile
  await createProfile(data.user!.id, normalized);

  // Check for SMS shares to link
  await linkSMSShares(data.user!.id, normalized);

  return { success: true, user: data.user };
}

async function createProfile(userId: string, phoneNumber: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      phone_number: phoneNumber,
      name: 'User', // Temporary, updated in onboarding
      tier: 'free',
      storage_limit: 1_073_741_824, // 1GB
      onboarding_completed: false
    });

  if (error) throw error;
}

async function linkSMSShares(userId: string, phoneNumber: string) {
  // Hash phone number to match against access grants
  const phoneHash = await hashPhoneNumber(phoneNumber);

  // Find all active access grants for this phone
  const { data: grants } = await supabase
    .from('playlist_access_grants')
    .select('shared_playlist_id, shared_playlists(playlist_id)')
    .eq('phone_number_hash', phoneHash)
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString());

  if (!grants || grants.length === 0) return;

  // Create playlist_followers records (user now "follows" these playlists)
  const followRecords = grants.map(grant => ({
    playlist_id: grant.shared_playlists.playlist_id,
    user_id: userId,
    source: 'sms_share',
    followed_at: new Date().toISOString()
  }));

  await supabase
    .from('playlist_followers')
    .insert(followRecords)
    .onConflict('playlist_id,user_id')
    .ignore(); // Don't error if already following

  console.log(`🔗 Linked ${grants.length} SMS shares to account`);
}
```

---

### Flow 2: Existing User Sign In

```
1. User clicks "Sign In"
   ↓
2. Enter phone number: [+1 (555) 123-4567]
   ↓
3. Click "Send Code"
   ↓
4. Backend: Supabase Auth sends SMS OTP
   ↓
5. User enters code
   ↓
6. Backend: Verify OTP
   ↓
7. IF verified:
   - Load user profile
   - Check for any new SMS shares since last login
   - Link new shares to account
   ↓
8. User lands in dashboard
```

---

### Flow 3: SMS Share Without Account

```
1. Recipient receives SMS:
   "🎵 CoreTet: Alex shared 'Summer Demos' with you.
   Code: A7K9M2
   Link: coretet.app/listen/xyz123"
   ↓
2. Taps link → opens in browser
   ↓
3. Lands on access page:
   ┌────────────────────────────────┐
   │ Enter access code:             │
   │ [A][7][K][9][M][2]            │
   │ [Access Playlist]              │
   └────────────────────────────────┘
   ↓
4. Enters code, clicks "Access Playlist"
   ↓
5. Backend validates:
   - Check shared_playlists.share_token exists
   - Check code matches playlist_access_grants.access_code
   - Check not expired, not revoked
   ↓
6. IF valid:
   - Store session in localStorage (no account needed)
   - Load playlist tracks
   - User can listen
   ↓
7. User sees banner at top:
   ┌────────────────────────────────┐
   │ 📱 Save this playlist          │
   │ Create a free account to keep  │
   │ access after link expires      │
   │ [Create Account] [Dismiss]     │
   └────────────────────────────────┘
```

---

### Flow 4: SMS Recipient Creates Account

```
1. SMS recipient (unauthenticated) viewing playlist
   ↓
2. Clicks "Create Account" banner
   ↓
3. Redirected to sign-up flow
   ↓
4. Backend pre-fills phone number IF detected from SMS
   (Can detect via URL param: ?phone=+1234567890)
   ↓
5. User completes sign-up (OTP verification)
   ↓
6. Backend automatically links:
   - Current playlist they're viewing
   - ANY other playlists shared to this phone number
   ↓
7. User redirected back to playlist
   ↓
8. User now sees:
   ┌────────────────────────────────┐
   │ ✅ Playlist saved to account   │
   │ You can access this anytime    │
   │ in your "Following" tab        │
   └────────────────────────────────┘
```

---

## Database Schema Changes

### New Table: playlist_followers

**Purpose:** Track which users follow which playlists (including from SMS shares)

```sql
CREATE TABLE playlist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,

  source TEXT DEFAULT 'manual', -- 'manual', 'sms_share', 'band_member'
  followed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(playlist_id, user_id)
);

-- Indexes
CREATE INDEX idx_playlist_followers_user ON playlist_followers(user_id);
CREATE INDEX idx_playlist_followers_playlist ON playlist_followers(playlist_id);
```

**Usage:**
- User clicks "Follow" on public playlist → manual
- User signs up after SMS share → sms_share
- User joins band → band_member (auto-follow band playlists)

---

### Updated Table: playlist_access_grants

**Add column to track if user claimed this share:**

```sql
ALTER TABLE playlist_access_grants
  ADD COLUMN claimed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN claimed_at TIMESTAMPTZ;

-- Index
CREATE INDEX idx_playlist_access_grants_claimed ON playlist_access_grants(claimed_by) WHERE claimed_by IS NOT NULL;
```

**Usage:**
When user signs up with phone number, link existing grants:

```sql
UPDATE playlist_access_grants
SET
  claimed_by = 'user-uuid',
  claimed_at = NOW()
WHERE phone_number_hash = hash_phone_number('+1234567890')
AND is_revoked = FALSE
AND expires_at > NOW()
AND claimed_by IS NULL;
```

---

## Phone Number Management

### Normalization

**Always store in E.164 format:**
```typescript
function normalizePhoneNumber(input: string): string {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // If starts with country code, use as-is
  // If 10 digits, assume US/Canada (+1)
  if (digits.length === 10) {
    return '+1' + digits;
  } else if (digits.length === 11 && digits[0] === '1') {
    return '+' + digits;
  } else if (digits.startsWith('1') === false) {
    // Assume country code already included
    return '+' + digits;
  }

  return '+' + digits;
}

// Examples:
normalizePhoneNumber('(555) 123-4567')      → '+15551234567'
normalizePhoneNumber('555-123-4567')        → '+15551234567'
normalizePhoneNumber('+1 555 123 4567')     → '+15551234567'
normalizePhoneNumber('15551234567')         → '+15551234567'
```

### Display Formatting

```typescript
function formatPhoneNumber(e164: string): string {
  // For US/Canada numbers (+1...)
  if (e164.startsWith('+1') && e164.length === 12) {
    const areaCode = e164.slice(2, 5);
    const prefix = e164.slice(5, 8);
    const line = e164.slice(8);
    return `+1 (${areaCode}) ${prefix}-${line}`;
  }

  // For other countries, return as-is
  return e164;
}

// Example:
formatPhoneNumber('+15551234567')  → '+1 (555) 123-4567'
```

### Hashing for Privacy

```typescript
async function hashPhoneNumber(phoneNumber: string): Promise<string> {
  const normalized = normalizePhoneNumber(phoneNumber);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Usage in playlist_access_grants
const phoneHash = await hashPhoneNumber('+15551234567');
// phoneHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
```

---

## Email as Optional Secondary Identifier

**When to collect email:**
1. User upgrades to paid tier (for payment receipts)
2. User wants email notifications
3. User forgets phone / needs account recovery

**Email is NOT required for:**
- Sign up
- Sign in
- Basic app usage
- SMS sharing

**Email collection UX:**
```
After user creates account (phone-only):

┌────────────────────────────────┐
│ 📧 Add email for receipts?     │
│                                │
│ Optional: Add an email address │
│ to receive payment receipts    │
│ and notifications.             │
│                                │
│ [Enter email]                  │
│ [Skip for now]                 │
└────────────────────────────────┘
```

---

## RLS Policies for Phone-Based Auth

### Profiles Table

```sql
-- Users can view their own profile
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public can insert during sign-up (via Supabase Auth)
CREATE POLICY "Anyone can create profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Playlist Followers

```sql
-- Users can view their own follows
CREATE POLICY "Users view own follows" ON playlist_followers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can follow playlists
CREATE POLICY "Users can follow playlists" ON playlist_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow" ON playlist_followers
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Migration Path

### Phase 1: Update Current Schema (Week 1)

1. ✅ Add `phone_number` column to `profiles` (UNIQUE, NOT NULL)
2. ✅ Make `email` column nullable
3. ✅ Create `playlist_followers` table
4. ✅ Add `claimed_by` and `claimed_at` to `playlist_access_grants`
5. ✅ Migrate existing users (if any email-only users exist)

```sql
-- Migration script
BEGIN;

-- 1. Add phone_number column (nullable first)
ALTER TABLE profiles
  ADD COLUMN phone_number TEXT;

-- 2. Make email nullable
ALTER TABLE profiles
  ALTER COLUMN email DROP NOT NULL;

-- 3. For existing users without phone, generate placeholder
-- (You'll need to contact them to update)
UPDATE profiles
SET phone_number = '+1' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0')
WHERE phone_number IS NULL;

-- 4. Make phone_number required and unique
ALTER TABLE profiles
  ALTER COLUMN phone_number SET NOT NULL,
  ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);

-- 5. Create playlist_followers table
CREATE TABLE playlist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'manual',
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, user_id)
);

-- 6. Update playlist_access_grants
ALTER TABLE playlist_access_grants
  ADD COLUMN claimed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN claimed_at TIMESTAMPTZ;

COMMIT;
```

### Phase 2: Update Auth Flow (Week 1)

1. ✅ Update sign-up to use phone OTP instead of email
2. ✅ Update sign-in to use phone OTP
3. ✅ Add phone normalization function
4. ✅ Add phone hashing function
5. ✅ Implement SMS share → account linking logic

### Phase 3: Update UI (Week 2)

1. ✅ Update sign-up form (phone input instead of email)
2. ✅ Add OTP verification screen
3. ✅ Add "Create Account" banner for SMS recipients
4. ✅ Update profile settings (show phone, optional email)
5. ✅ Add "Following" tab to show linked playlists

---

## Testing Scenarios

### Test 1: New User Sign-Up
- [ ] User enters phone number
- [ ] Receives SMS with OTP
- [ ] Enters correct OTP → account created
- [ ] Profile has phone_number set
- [ ] Can access app features

### Test 2: SMS Share → Account Linking
- [ ] Artist shares playlist to phone +15551234567
- [ ] Recipient opens link, enters code
- [ ] Recipient sees "Create Account" banner
- [ ] Recipient signs up with same phone number
- [ ] Playlist automatically appears in "Following" tab

### Test 3: Multiple SMS Shares Linked
- [ ] Artist shares 3 different playlists to same phone
- [ ] Recipient accesses all 3 via SMS codes
- [ ] Recipient creates account
- [ ] All 3 playlists appear in "Following" tab

### Test 4: Email as Optional
- [ ] User signs up with phone only
- [ ] Can use all free tier features
- [ ] Upgrades to Band tier
- [ ] Prompted to add email for receipts
- [ ] Can still skip and use phone-only

---

## Summary

**Key Changes from Previous Design:**

1. ✅ **Phone number is primary identifier** (was email)
2. ✅ **Email is optional** (was required)
3. ✅ **SMS recipients can claim content** (new feature)
4. ✅ **Unified identity across SMS + account** (was separate)
5. ✅ **Phone normalization + hashing** (privacy + security)

**Benefits:**

✅ Mobile-native experience
✅ Lower friction sign-up
✅ Automatic playlist linking
✅ Matches how musicians collaborate
✅ Single source of truth (phone number)

---

**Ready to implement Phase 1 database migration?**
