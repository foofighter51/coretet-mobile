# CoreTet User Identity & Authentication Model
**Dual Authentication: Email+Password+Phone for Admins, SMS-Only for Recipients**

**Last Updated:** 2025-11-18 (Revised: Email+Password+Phone for account owners)
**Status:** Architecture Design

---

## Overview

CoreTet uses a **dual authentication system** optimized for different user types:
- **Account Owners (Admin Users)**: Email + Password + Phone Number (web-first, power users)
- **SMS Share Recipients**: Phone-only access via SMS codes (mobile-first, listen-only)
- **Account Linking**: SMS recipients can upgrade to full account (claims previous shares)

---

## User Identity Model

### Core Principle: Email for Accounts, Phone for Sharing

**Why Dual Authentication?**
1. **Account Owners need email** - Web app usage, payment receipts, password reset
2. **Account Owners need password** - Traditional secure authentication
3. **Phone for sharing** - SMS codes for low-friction playlist access
4. **Instant account linking** - SMS recipient creates account with same phone → claims all shares
5. **Professional workflows** - Email for organization, phone for collaboration
6. **Prevents duplicate accounts** - Both email AND phone must be unique

---

## User Types

### 1. Account Owners (Admin Users)

**Authentication:** Email + Password + Phone Number (Supabase Auth)

**Use Case:**
- Web app power users (batch uploads, organization, management)
- Band creators and administrators
- Need email for payment receipts, password reset, notifications
- Need phone for sharing playlists via SMS codes
- Primary usage: Desktop web app

**Profile Structure:**
```typescript
type UserProfile = {
  id: string;                    // Supabase auth.users.id (UUID)
  email: string;                 // PRIMARY AUTH (required, unique)
  phone_number: string;          // SHARING IDENTIFIER (required, unique, E.164)
  name: string;                  // Display name
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

  -- Identity (BOTH email and phone required)
  email TEXT UNIQUE NOT NULL,           -- For authentication, receipts, notifications
  phone_number TEXT UNIQUE NOT NULL,    -- For SMS sharing (E.164 format: +1234567890)
  name TEXT NOT NULL,
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
CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX idx_profiles_phone ON profiles(phone_number);
```

---

### 2. SMS Share Recipients (Unauthenticated)

**Access Method:** SMS access code (temporary, expires after 7-90 days)

**Use Case:**
- Collaborators invited via SMS to listen to playlists
- No account required for basic listening
- Mobile-first, lightweight access
- Can upgrade to full account later

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

**No database profile created** - access tracking in `playlist_access_grants` table only

---

### 3. Account Linking (SMS Recipient → Account Owner)

**Scenario:** SMS recipient wants to upgrade to full account and save playlists

**Flow:**
```
1. Recipient receives SMS with access code
   "🎵 CoreTet: Alex shared 'Summer Demos' with you.
   Code: A7K9M2
   Link: coretet.app/listen/xyz123"
   ↓
2. Opens link, enters code, listens to playlist (no account needed)
   ↓
3. Sees banner: "Create a free account to save this playlist"
   ↓
4. Clicks "Create Account" or "Sign In"
   ↓
5a. IF creating new account:
    ┌────────────────────────────────┐
    │ Create Your Account            │
    │                                │
    │ Email:                         │
    │ [email@example.com]            │
    │                                │
    │ Password:                      │
    │ [••••••••]                     │
    │                                │
    │ Phone Number:                  │
    │ [+1 (555) 123-4567]            │ ← MUST match SMS recipient phone
    │                                │
    │ We'll send a verification code │
    │                                │
    │ [Create Account]               │
    └────────────────────────────────┘
    ↓
    User enters phone → Receives OTP → Verifies → Account created
    ↓
5b. IF signing into existing account:
    ┌────────────────────────────────┐
    │ Sign In                        │
    │                                │
    │ Email:                         │
    │ [email@example.com]            │
    │                                │
    │ Password:                      │
    │ [••••••••]                     │
    │                                │
    │ [Sign In]                      │
    └────────────────────────────────┘
    ↓
    User signs in → Backend checks user's phone number
    ↓
6. Backend checks: Does this phone number match any playlist_access_grants?
   ↓
7. IF matches found:
   - All shared playlists with this phone_number_hash → linked to user account
   - Create playlist_followers records for each match
   - User can now see playlists in "Shared with Me" tab
   ↓
8. User has full account access + all previously shared content
```

**Backend Linking Logic:**
```typescript
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
    .ignore();

  // Mark grants as claimed
  const grantIds = grants.map(g => g.id);
  await supabase
    .from('playlist_access_grants')
    .update({
      claimed_by: userId,
      claimed_at: new Date().toISOString()
    })
    .in('id', grantIds);

  console.log(`🔗 Linked ${grants.length} SMS shares to account`);
}
```

---

## Authentication Flows

### Flow 1: New Account Owner Sign Up

```
1. User visits CoreTet web app
   ↓
2. Clicks "Create Account"
   ↓
3. Sign-up form:
   ┌────────────────────────────────┐
   │ Create Your CoreTet Account    │
   │                                │
   │ Email Address:                 │
   │ [email@example.com]            │
   │                                │
   │ Password:                      │
   │ [••••••••••]                   │
   │                                │
   │ Display Name:                  │
   │ [Alex Morgan]                  │
   │                                │
   │ Phone Number:                  │
   │ [+1 (555) 123-4567]            │
   │ Required for sharing playlists │
   │                                │
   │ [Create Account]               │
   └────────────────────────────────┘
   ↓
4. User submits form
   ↓
5. Backend creates Supabase Auth user (email + password)
   ↓
6. Send OTP to phone number for verification
   ↓
7. User receives SMS: "Your CoreTet verification code: 123456"
   ↓
8. User enters OTP: [1] [2] [3] [4] [5] [6]
   ↓
9. Phone verified → Create profile record
   ↓
10. Check for existing SMS shares with this phone → Auto-link
   ↓
11. User lands in dashboard (Free tier)
```

**Supabase Auth Code:**
```typescript
async function signUpWithEmailAndPhone(
  email: string,
  password: string,
  name: string,
  phoneNumber: string
) {
  // 1. Create Supabase Auth user (email + password)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone_number: normalizePhoneNumber(phoneNumber)
      }
    }
  });

  if (authError) throw authError;

  // 2. Send phone verification OTP
  // Note: Use Twilio or similar service (Supabase Auth phone requires phone-only auth)
  const otp = await sendPhoneVerificationOTP(phoneNumber);

  // Return for OTP entry screen
  return {
    userId: authData.user!.id,
    email,
    phoneNumber,
    otpSent: true,
    message: `Verification code sent to ${formatPhoneNumber(phoneNumber)}`
  };
}

async function verifyPhoneAndCreateProfile(
  userId: string,
  email: string,
  name: string,
  phoneNumber: string,
  otp: string
) {
  // 1. Verify OTP
  const verified = await verifyPhoneOTP(phoneNumber, otp);
  if (!verified) throw new Error('Invalid verification code');

  // 2. Normalize phone number
  const normalized = normalizePhoneNumber(phoneNumber);

  // 3. Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      phone_number: normalized,
      name,
      tier: 'free',
      storage_limit: 1_073_741_824, // 1GB
      onboarding_completed: false
    });

  if (profileError) throw profileError;

  // 4. Link any existing SMS shares
  await linkSMSShares(userId, normalized);

  return { success: true, user: { id: userId, email, name, phoneNumber: normalized } };
}
```

---

### Flow 2: Account Owner Sign In

```
1. User visits CoreTet web app
   ↓
2. Clicks "Sign In"
   ↓
3. Sign-in form:
   ┌────────────────────────────────┐
   │ Sign In to CoreTet             │
   │                                │
   │ Email Address:                 │
   │ [email@example.com]            │
   │                                │
   │ Password:                      │
   │ [••••••••••]                   │
   │                                │
   │ [Sign In]                      │
   │                                │
   │ [Forgot Password?]             │
   └────────────────────────────────┘
   ↓
4. User submits credentials
   ↓
5. Supabase Auth validates email + password
   ↓
6. Load user profile (includes phone_number)
   ↓
7. Check for any new SMS shares since last login
   ↓
8. Auto-link new shares to account
   ↓
9. User lands in dashboard
```

**Supabase Auth Code:**
```typescript
async function signInWithEmail(email: string, password: string) {
  // 1. Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // 2. Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  // 3. Check for new SMS shares
  await linkSMSShares(data.user.id, profile.phone_number);

  // 4. Update last_active_at
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', data.user.id);

  return { success: true, user: data.user, profile };
}
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
   │ Private Playlist Access        │
   │                                │
   │ Alex shared a playlist with you│
   │ "Summer Demos" • 5 tracks      │
   │                                │
   │ Enter access code:             │
   │ [A][7][K][9][M][2]            │
   │                                │
   │ [Access Playlist]              │
   │                                │
   │ Code expires in 7 days         │
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
   │ 💾 Save this playlist          │
   │ Create a free account to keep  │
   │ access after link expires      │
   │ [Create Account] [Dismiss]     │
   └────────────────────────────────┘
```

---

## Database Schema Changes

### Updated Table: profiles

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity (email for auth, phone for sharing - BOTH required)
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,  -- E.164 format: +1234567890
  name TEXT NOT NULL,
  avatar_url TEXT,

  -- Subscription
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'band', 'producer')),
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 1073741824, -- 1GB
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
CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX idx_profiles_phone ON profiles(phone_number);
```

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

CREATE INDEX idx_playlist_followers_user ON playlist_followers(user_id);
CREATE INDEX idx_playlist_followers_playlist ON playlist_followers(playlist_id);
```

### Updated Table: playlist_access_grants

**Add column to track if user claimed this share:**

```sql
ALTER TABLE playlist_access_grants
  ADD COLUMN claimed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN claimed_at TIMESTAMPTZ;

CREATE INDEX idx_playlist_access_grants_claimed ON playlist_access_grants(claimed_by) WHERE claimed_by IS NOT NULL;
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
  } else if (!digits.startsWith('1')) {
    return '+' + digits;
  }

  return '+' + digits;
}

// Examples:
normalizePhoneNumber('(555) 123-4567')      → '+15551234567'
normalizePhoneNumber('555-123-4567')        → '+15551234567'
normalizePhoneNumber('+1 555 123 4567')     → '+15551234567'
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
```

---

## Migration Path

### Phase 1: Update profiles table

```sql
BEGIN;

-- Add phone_number column (nullable first)
ALTER TABLE profiles
  ADD COLUMN phone_number TEXT;

-- For existing users: prompt them to add phone number
-- (Cannot auto-generate phone numbers for real users)

-- Once all users have phone numbers, make it required
ALTER TABLE profiles
  ALTER COLUMN phone_number SET NOT NULL,
  ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);

-- Ensure email is required (should already be)
ALTER TABLE profiles
  ALTER COLUMN email SET NOT NULL;

COMMIT;
```

### Phase 2: Create supporting tables

```sql
-- Create playlist_followers table
CREATE TABLE playlist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'manual',
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, user_id)
);

-- Update playlist_access_grants
ALTER TABLE playlist_access_grants
  ADD COLUMN claimed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN claimed_at TIMESTAMPTZ;
```

---

## Summary

**✅ Account Owners (Admin Users):**
- Email + Password (Supabase Auth)
- Phone Number (required, unique, for sharing)
- Web-first power users
- Full feature access

**✅ SMS Recipients:**
- Access via SMS codes only
- No account required
- Mobile-first listening
- Can upgrade to account later

**✅ Account Linking:**
- SMS recipient creates account with same phone number
- All previous SMS shares automatically linked
- Appear in "Shared with Me" tab
- Seamless upgrade path

**✅ Authentication:**
- Email + Password for account owners
- SMS OTP for phone verification during signup
- SMS access codes for playlist sharing
- Dual identity: email for auth, phone for sharing

---

**This revised model matches your requirements:**
- Admin users: Email + Password + Phone ✅
- SMS recipients: Phone-only access ✅
- Account linking: Automatic on signup ✅
- Web app focused for admins ✅
- Mobile/SMS focused for collaborators ✅
