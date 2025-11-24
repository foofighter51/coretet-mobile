# CoreTet Backend & UX Priorities
**For Internal Development - Front-end Outsourced to RedSoftware**

**Last Updated:** 2025-11-18 (Updated: Phone-First Auth Model)
**Status:** Planning Phase

---

## Overview

**Division of Labor:**
- **RedSoftware**: Front-end implementation (React/Vue web app, Ionic mobile refinements)
- **You (Internal)**: Backend logic, database schema, UX flows, business rules, integration stubs

**External Integrations (Stub for Now):**
- Stripe (payments) - use mock data
- Twilio (SMS) - console.log messages for OTP + playlist sharing
- SendGrid (email) - console.log messages

**⚠️ CRITICAL ARCHITECTURE CHANGE:**
**Phone-First Identity System** - Phone numbers are the primary user identifier (email is optional).
See [USER_IDENTITY_AND_AUTH.md](USER_IDENTITY_AND_AUTH.md) for complete authentication architecture.

---

## Current State vs Target State

### ✅ What You Already Have

**Database Tables (Existing):**
- ✅ `profiles` - User accounts
- ✅ `bands` - Band workspaces (with `is_personal` flag)
- ✅ `band_members` - Membership and roles
- ✅ `band_invites` - Email-based invites
- ✅ `tracks` - Audio files with `band_id`
- ✅ `playlists` - Track collections
- ✅ `playlist_items` - Playlist-track relationships
- ✅ `comments` - Timestamped feedback
- ✅ `track_ratings` - User ratings (`'listened' | 'liked' | 'loved'`)

**Current Features:**
- ✅ Phone auth (Supabase)
- ✅ Band system with personal bands
- ✅ Track upload/playback
- ✅ 3-tier ratings (Listened/Liked/Loved)
- ✅ Deep link sharing (`coretet://`)
- ✅ RLS policies (recently fixed Nov 12)

### 🚧 What Needs to Be Built

**Missing Database Columns/Tables:**
- ⚠️ **`profiles.phone_number` - REQUIRED (unique, not null)** - Primary identifier
- ⚠️ **`profiles.email` - Make nullable** - Optional for receipts/notifications
- ❌ `profiles.tier` - User subscription tier
- ❌ `profiles.storage_used` - Track storage usage
- ❌ `profiles.storage_limit` - Storage quota
- ❌ `profiles.stripe_customer_id` - Payment integration
- ❌ `bands.storage_used` - Band storage usage
- ❌ `bands.storage_limit` - Band storage quota
- ❌ `bands.max_members` - Member limit enforcement
- ❌ `shared_playlists` - SMS-based access control
- ❌ `playlist_access_grants` - Individual SMS codes (with phone_number_hash)
- ❌ `playlist_followers` - NEW: Track which users follow which playlists
- ❌ `sms_credits` - Monthly SMS allowance
- ❌ `producer_waitlist` - Producer tier waitlist

**Missing Backend Logic:**
- ❌ Tier enforcement (Free vs Band)
- ❌ Storage limit checks
- ❌ Band creation limits
- ❌ SMS sharing flow (stubbed)
- ❌ Payment webhooks (stubbed)

---

## PHASE 1: Database Schema Updates (Week 1)

### Priority 1.0: Dual Authentication System (CRITICAL)

**Goal:** Email+Password+Phone for account owners, SMS codes for recipients

**Database Changes:**
```sql
-- CRITICAL: Update profiles table for phone-first auth
-- See USER_IDENTITY_AND_AUTH.md for complete migration

ALTER TABLE profiles
  -- Add phone_number column (unique, required)
  ADD COLUMN phone_number TEXT,

  -- Make email nullable (was required, now optional)
  ALTER COLUMN email DROP NOT NULL;

-- Migrate existing users (if any)
-- For users without phone, generate placeholder (contact them to update)
UPDATE profiles
SET phone_number = '+1' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0')
WHERE phone_number IS NULL;

-- Make phone_number required and unique
ALTER TABLE profiles
  ALTER COLUMN phone_number SET NOT NULL,
  ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);

-- Create playlist_followers table (for SMS share → account linking)
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

**Phone Number Format:**
- **Storage**: E.164 format (`+12345678901`)
- **Display**: Formatted (`+1 (234) 567-8901`)
- **Hashing**: SHA-256 for privacy in `playlist_access_grants`

---

### Priority 1.1: User Tier System

**Goal:** Enable Free vs Band tier logic

**Database Changes:**
```sql
-- Add tier and subscription columns to profiles
ALTER TABLE profiles
  ADD COLUMN tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'band', 'producer')),
  ADD COLUMN storage_used BIGINT DEFAULT 0,
  ADD COLUMN storage_limit BIGINT DEFAULT 1073741824, -- 1GB for free
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN subscription_status TEXT DEFAULT 'none',
  ADD COLUMN trial_ends_at TIMESTAMPTZ,
  ADD COLUMN last_active_at TIMESTAMPTZ;
```

**Business Rules:**
```typescript
// Tier Limits
const TIER_LIMITS = {
  free: {
    storage: 1_073_741_824,      // 1GB
    bandsCreatable: 0,            // Cannot create bands
    bandsJoinable: 999,           // Can join unlimited
    smsCreditsMonthly: 10,
    sharedPlaylistsMax: 2,
    recipientsPerPlaylist: 5,
    shareExpiryMaxDays: 7
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
```

**API Endpoints to Create:**
```typescript
// GET /api/user/tier
// Returns current user's tier and limits

// POST /api/user/upgrade-intent
// Called when Free user clicks "Create Band"
// Response: { checkoutUrl: string } (mock for now)
```

---

### Priority 1.2: Storage Enforcement

**Goal:** Track and limit storage usage

**Database Changes:**
```sql
-- Add storage tracking to bands
ALTER TABLE bands
  ADD COLUMN storage_used BIGINT DEFAULT 0,
  ADD COLUMN storage_limit BIGINT DEFAULT 26843545600, -- 25GB default
  ADD COLUMN max_members INT DEFAULT 10;

-- Trigger to update storage_used on track insert
CREATE OR REPLACE FUNCTION update_storage_on_track_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update band storage if track belongs to band
  IF NEW.band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = storage_used + NEW.file_size
    WHERE id = NEW.band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = storage_used + NEW.file_size
    WHERE id = NEW.created_by;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_insert_storage_update
  AFTER INSERT ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_track_insert();

-- Trigger to update storage_used on track delete
CREATE OR REPLACE FUNCTION update_storage_on_track_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update band storage if track belonged to band
  IF OLD.band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = storage_used - OLD.file_size
    WHERE id = OLD.band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = storage_used - OLD.file_size
    WHERE id = OLD.created_by;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_delete_storage_update
  AFTER DELETE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_track_delete();
```

**Pre-Upload Storage Check:**
```typescript
// Function to call BEFORE upload starts
async function canUploadTrack(userId: string, bandId: string | null, fileSize: number): Promise<{
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
```

**API Endpoints:**
```typescript
// POST /api/tracks/check-storage
// Body: { fileSize: number, bandId?: string }
// Response: { allowed: boolean, reason?: string, currentUsage?: number, limit?: number }

// GET /api/user/storage-status
// Response: { used: number, limit: number, percentage: number }

// GET /api/bands/:bandId/storage-status
// Response: { used: number, limit: number, percentage: number }
```

---

### Priority 1.3: Band Creation Enforcement

**Goal:** Only Band tier can create bands

**Database Function:**
```sql
-- Function to check if user can create a band
CREATE OR REPLACE FUNCTION can_create_band(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  bands_created INT;
BEGIN
  -- Get user tier
  SELECT tier INTO user_tier
  FROM profiles
  WHERE id = user_id;

  -- Free tier cannot create bands
  IF user_tier = 'free' THEN
    RETURN FALSE;
  END IF;

  -- Band tier can create max 1 band
  IF user_tier = 'band' THEN
    SELECT COUNT(*) INTO bands_created
    FROM bands
    WHERE created_by = user_id
    AND is_personal = FALSE; -- Don't count personal band

    RETURN bands_created < 1;
  END IF;

  -- Producer tier can create unlimited
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

**Client-Side Check:**
```typescript
// Called when user clicks "Create Band" button
async function handleCreateBandClick(userId: string) {
  const { data: user } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single();

  if (user.tier === 'free') {
    // Show upgrade modal
    showUpgradeModal({
      title: 'Upgrade to Create Bands',
      message: 'Create a band workspace to collaborate with your team.',
      cta: 'Start for $5',
      features: [
        '25GB storage',
        'Up to 10 band members',
        'Full collaboration tools',
        'Voice memo comments',
        'Version comparison'
      ]
    });
    return;
  }

  if (user.tier === 'band') {
    // Check if already has a band
    const { data: bands } = await supabase
      .from('bands')
      .select('id')
      .eq('created_by', userId)
      .eq('is_personal', false);

    if (bands && bands.length >= 1) {
      // Show Producer waitlist modal
      showProducerWaitlistModal({
        title: 'Need Multiple Bands?',
        message: 'The Producer tier supports unlimited bands.',
        cta: 'Join Waitlist',
        features: [
          'Unlimited bands',
          '100GB storage',
          'Multi-project dashboard',
          'Priority support'
        ]
      });
      return;
    }
  }

  // User can create band - proceed
  showCreateBandForm();
}
```

---

## PHASE 2: SMS Sharing System (Stubbed) (Week 2)

### Priority 2.1: Database Tables

**Goal:** Support SMS-based playlist access (without actual SMS sending)

```sql
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

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(shared_playlist_id, phone_number_hash)
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
  reason TEXT, -- Why they need Producer tier

  requested_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Priority 2.2: SMS Sharing Flow (Stubbed)

**Access Code Generation:**
```typescript
function generateAccessCode(): string {
  // Exclude confusing characters (0, O, I, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function hashPhoneNumber(phoneNumber: string): Promise<string> {
  const normalized = phoneNumber.replace(/\D/g, ''); // Digits only
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

**Share Playlist Function (Stubbed SMS):**
```typescript
async function sharePlaylist(
  playlistId: string,
  userId: string,
  phoneNumbers: string[],
  expiryDays: number = 7
) {
  // 1. Check user's SMS credits
  const { data: credits } = await supabase
    .from('sms_credits')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())
    .single();

  if (!credits || credits.credits_remaining < phoneNumbers.length) {
    throw new Error('Insufficient SMS credits');
  }

  // 2. Create shared_playlists record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const { data: sharedPlaylist } = await supabase
    .from('shared_playlists')
    .insert({
      playlist_id: playlistId,
      shared_by: userId,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (!sharedPlaylist) throw new Error('Failed to create share');

  // 3. Create access grants and send SMS (stubbed)
  for (const phoneNumber of phoneNumbers) {
    const phoneHash = await hashPhoneNumber(phoneNumber);
    const accessCode = generateAccessCode();

    // Create access grant
    await supabase
      .from('playlist_access_grants')
      .insert({
        shared_playlist_id: sharedPlaylist.id,
        phone_number_hash: phoneHash,
        access_code: accessCode,
        expires_at: expiresAt.toISOString()
      });

    // STUB: Send SMS (log instead of actual send)
    console.log('📱 SMS STUB - Would send to:', phoneNumber);
    console.log('🎵 CoreTet: Playlist shared with you');
    console.log(`Code: ${accessCode}`);
    console.log(`Link: https://coretet.app/listen/${sharedPlaylist.share_token}`);
    console.log(`Expires in ${expiryDays} days`);
    console.log('---');
  }

  // 4. Update SMS credits
  await supabase
    .from('sms_credits')
    .update({ credits_used: credits.credits_used + phoneNumbers.length })
    .eq('id', credits.id);

  return sharedPlaylist;
}
```

**Access Code Validation:**
```typescript
async function validateAccessCode(shareToken: string, accessCode: string) {
  // 1. Find shared playlist
  const { data: sharedPlaylist } = await supabase
    .from('shared_playlists')
    .select('*')
    .eq('share_token', shareToken)
    .eq('is_active', true)
    .single();

  if (!sharedPlaylist) {
    return { success: false, error: 'Invalid share link' };
  }

  // 2. Check expiry
  if (sharedPlaylist.expires_at && new Date(sharedPlaylist.expires_at) < new Date()) {
    return { success: false, error: 'Share expired' };
  }

  // 3. Find access grant with code
  const { data: grant } = await supabase
    .from('playlist_access_grants')
    .select('*')
    .eq('shared_playlist_id', sharedPlaylist.id)
    .eq('access_code', accessCode.toUpperCase())
    .single();

  if (!grant) {
    return { success: false, error: 'Invalid access code' };
  }

  // 4. Check if revoked
  if (grant.is_revoked) {
    return { success: false, error: 'Access revoked' };
  }

  // 5. Check grant expiry
  if (new Date(grant.expires_at) < new Date()) {
    return { success: false, error: 'Code expired' };
  }

  // 6. Update access tracking
  await supabase
    .from('playlist_access_grants')
    .update({
      is_used: true,
      first_accessed_at: grant.first_accessed_at || new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      access_count: grant.access_count + 1
    })
    .eq('id', grant.id);

  return {
    success: true,
    playlistId: sharedPlaylist.playlist_id
  };
}
```

---

## PHASE 3: Payment Integration Stubs (Week 3)

### Priority 3.1: Stripe Checkout Stub

**Goal:** Mock the upgrade flow without actual payment

```typescript
// STUB: Stripe checkout endpoint
async function createCheckoutSession(userId: string) {
  // In production, this would create a Stripe checkout session
  // For now, just return a mock URL

  const mockCheckoutUrl = `/mock-checkout?user=${userId}&price=band_tier`;

  console.log('💳 STRIPE STUB - Would create checkout session for:', userId);
  console.log('Product: CoreTet Band Tier');
  console.log('Price: $5 intro, then $10/mo');

  return {
    checkoutUrl: mockCheckoutUrl
  };
}

// STUB: Mock checkout success page
async function handleMockCheckoutSuccess(userId: string) {
  // Simulate successful payment
  console.log('✅ MOCK PAYMENT SUCCESS for:', userId);

  // Update user to Band tier
  await supabase
    .from('profiles')
    .update({
      tier: 'band',
      storage_limit: 26_843_545_600, // 25GB
      stripe_customer_id: `cus_mock_${Date.now()}`,
      stripe_subscription_id: `sub_mock_${Date.now()}`,
      subscription_status: 'active'
    })
    .eq('id', userId);

  // Initialize SMS credits for the month
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

  await supabase
    .from('sms_credits')
    .insert({
      user_id: userId,
      credits_total: 50, // Band tier gets 50/month
      credits_used: 0,
      period_start: today.toISOString(),
      period_end: nextMonth.toISOString()
    });

  console.log('🎉 User upgraded to Band tier');
  console.log('📱 50 SMS credits allocated');
}
```

### Priority 3.2: Webhook Handler Stub

```typescript
// STUB: Stripe webhook handler
async function handleStripeWebhook(event: any) {
  console.log('🔔 STRIPE WEBHOOK STUB - Event:', event.type);

  switch (event.type) {
    case 'checkout.session.completed':
      const { customer_email, subscription } = event.data.object;
      console.log('✅ Subscription created for:', customer_email);
      // In production: Update user tier, create SMS credits
      break;

    case 'customer.subscription.deleted':
      const { customer } = event.data.object;
      console.log('❌ Subscription cancelled for customer:', customer);
      // In production: Downgrade to free tier, keep data read-only
      break;

    case 'invoice.payment_failed':
      console.log('💳 Payment failed - retry logic needed');
      // In production: Send reminder email, retry payment
      break;

    default:
      console.log('ℹ️ Unhandled webhook event:', event.type);
  }
}
```

---

## UX FLOW SPECIFICATIONS

### Flow 1: Free User → Band Tier Upgrade

```
1. Free user has uploaded 10 tracks to personal workspace
2. Clicks "Create Band" button
   ↓
3. Modal appears:
   ┌────────────────────────────────┐
   │ Upgrade to Create Bands        │
   │                                │
   │ Band tier includes:            │
   │ ✓ 25GB storage                 │
   │ ✓ Up to 10 band members        │
   │ ✓ Voice memo comments          │
   │ ✓ Version comparison           │
   │ ✓ 50 SMS shares/month          │
   │                                │
   │ $5 first month                 │
   │ $10/month after                │
   │                                │
   │ [Start for $5]  [Maybe Later]  │
   └────────────────────────────────┘
   ↓
4. User clicks "Start for $5"
   ↓
5. MOCK: Redirect to /mock-checkout
   (In production: Stripe checkout)
   ↓
6. User "completes" mock payment
   ↓
7. Redirect back to app
   ↓
8. User tier updated to 'band'
   ↓
9. Success message:
   ┌────────────────────────────────┐
   │ 🎉 Welcome to Band Tier!       │
   │                                │
   │ You can now:                   │
   │ • Create 1 band workspace      │
   │ • Invite up to 10 members      │
   │ • Upload 25GB of tracks        │
   │                                │
   │ [Create Your Band]             │
   └────────────────────────────────┘
   ↓
10. User creates band
```

### Flow 2: Track Upload with Storage Check

```
1. User clicks "Upload Track"
   ↓
2. User selects file (e.g., 50MB track)
   ↓
3. BEFORE upload starts:
   Check storage: canUploadTrack(userId, bandId, 50MB)
   ↓
4a. IF allowed:
    → Proceed with upload
    → Update storage_used after success

4b. IF storage full:
    → Block upload
    → Show modal:
    ┌────────────────────────────────┐
    │ Storage Limit Reached          │
    │                                │
    │ You've used 980 MB of 1 GB     │
    │                                │
    │ Free up space:                 │
    │ • Delete old versions          │
    │ • Remove unused tracks         │
    │                                │
    │ Or upgrade:                    │
    │ • Band tier: 25 GB for $10/mo  │
    │                                │
    │ [Manage Storage] [Upgrade]     │
    └────────────────────────────────┘
```

### Flow 3: Share Playlist via SMS

```
1. User opens playlist
   ↓
2. Clicks "Share Playlist"
   ↓
3. Modal appears:
   ┌────────────────────────────────┐
   │ Share: "Summer EP Demos"       │
   │                                │
   │ Enter phone numbers:           │
   │ [+1 (555) 123-4567          ] │
   │ [+1 (555) 234-5678          ] │
   │ [+ Add Number]                 │
   │                                │
   │ Access expires:                │
   │ • 7 days (recommended)         │
   │ ○ 30 days                      │
   │ ○ 90 days                      │
   │                                │
   │ SMS Cost: 2 credits            │
   │ (You have 48 remaining)        │
   │                                │
   │ [Send Access Codes]            │
   └────────────────────────────────┘
   ↓
4. User clicks "Send Access Codes"
   ↓
5. STUB: Console logs SMS messages
   ↓
6. Success message:
   ┌────────────────────────────────┐
   │ ✅ Access codes sent!          │
   │                                │
   │ 2 people can now listen:       │
   │ • +1 (555) 123-4567           │
   │ • +1 (555) 234-5678           │
   │                                │
   │ Codes expire in 7 days         │
   │                                │
   │ [Manage Access] [Done]         │
   └────────────────────────────────┘
```

### Flow 4: Recipient Accesses Shared Playlist

```
1. Recipient receives SMS (stubbed in console)
   ↓
2. Opens link: coretet.app/listen/{share_token}
   ↓
3. Lands on access page:
   ┌────────────────────────────────┐
   │ 🎵 CoreTet                     │
   │                                │
   │ Private Playlist Access        │
   │                                │
   │ You've been invited to listen  │
   │ to a private playlist.         │
   │                                │
   │ Enter your access code:        │
   │ [A][7][K][9][M][2]            │
   │                                │
   │ [Access Playlist]              │
   │                                │
   │ Code expires in 7 days         │
   └────────────────────────────────┘
   ↓
4. Enters code, clicks "Access Playlist"
   ↓
5. Code validated → Access granted
   ↓
6. Can listen to tracks, mark as listened
   (No account required)
```

---

## API ENDPOINTS TO BUILD

### User & Tier Management

```typescript
// GET /api/user/tier
// Returns current user's tier and limits
type TierResponse = {
  tier: 'free' | 'band' | 'producer';
  limits: {
    storage: number;
    bandsCreatable: number;
    bandMembersMax: number;
    smsCreditsMonthly: number;
  };
  usage: {
    storage: number;
    bandsCreated: number;
    smsCreditsRemaining: number;
  };
};

// POST /api/user/upgrade-intent
// Body: { tier: 'band' | 'producer' }
// Response: { checkoutUrl: string } (mock)

// POST /api/user/mock-payment-success
// FOR TESTING ONLY - simulates successful payment
// Response: { success: true, newTier: 'band' }
```

### Storage Management

```typescript
// POST /api/tracks/check-storage
// Body: { fileSize: number, bandId?: string }
// Response: { allowed: boolean, reason?: string, currentUsage?: number, limit?: number }

// GET /api/user/storage-status
// Response: { used: number, limit: number, percentage: number }

// GET /api/bands/:bandId/storage-status
// Response: { used: number, limit: number, percentage: number }
```

### SMS Sharing (Stubbed)

```typescript
// POST /api/playlists/:playlistId/share
// Body: { phoneNumbers: string[], expiryDays: number }
// Response: { shareToken: string, codesGenerated: number }

// POST /api/playlists/validate-access
// Body: { shareToken: string, accessCode: string }
// Response: { success: boolean, playlistId?: string, error?: string }

// GET /api/playlists/:playlistId/access-grants
// Response: { grants: Array<{ phone_hash: string, code: string, isUsed: boolean, accessCount: number }> }

// POST /api/playlists/access-grants/:grantId/revoke
// Response: { success: boolean }
```

### Producer Waitlist

```typescript
// POST /api/waitlist/producer
// Body: { email: string, name?: string, reason?: string }
// Response: { success: boolean, position: number }

// GET /api/waitlist/producer/count
// Response: { count: number }
```

---

## TESTING CHECKLIST

### Manual Testing Scenarios

**Tier Enforcement:**
- [ ] Free user clicks "Create Band" → shown upgrade modal (not allowed)
- [ ] Free user completes mock payment → tier updated to 'band'
- [ ] Band user creates 1 band → succeeds
- [ ] Band user tries to create 2nd band → shown Producer waitlist modal
- [ ] Band user can join other bands as member (unlimited)

**Storage Limits:**
- [ ] Free user uploads to reach 950MB → succeeds
- [ ] Free user uploads 150MB file when at 950MB → blocked
- [ ] Free user shown "Storage Full" modal with upgrade CTA
- [ ] Band user has 25GB limit → can upload more
- [ ] Delete track → storage_used decrements correctly

**SMS Sharing (Stubbed):**
- [ ] User shares playlist with 2 phone numbers → console logs 2 SMS stubs
- [ ] SMS credits decrement by 2
- [ ] Recipient opens link → sees access code entry page
- [ ] Recipient enters valid code → gains access to playlist
- [ ] Recipient enters invalid code → sees error
- [ ] Recipient enters expired code → sees "Code expired" error
- [ ] Artist revokes access → recipient blocked

**Database Triggers:**
- [ ] Insert track → storage_used increases
- [ ] Delete track → storage_used decreases
- [ ] Multiple rapid inserts → storage_used accurate (no race conditions)

---

## INTEGRATION PLACEHOLDERS

### Stripe (Payments)

**Mock Implementation:**
```typescript
// File: lib/stripe-stub.ts
export const stripe = {
  createCheckoutSession: async (userId: string, tier: 'band' | 'producer') => {
    console.log(`💳 STRIPE STUB - Create checkout for ${userId} → ${tier} tier`);
    return {
      url: `/mock-checkout?user=${userId}&tier=${tier}`
    };
  },

  handleWebhook: async (event: any) => {
    console.log('🔔 STRIPE WEBHOOK STUB:', event.type);
    // Handle different event types
  }
};
```

### Twilio (SMS)

**Mock Implementation:**
```typescript
// File: lib/twilio-stub.ts
export const twilio = {
  sendSMS: async (to: string, message: string) => {
    console.log('📱 TWILIO STUB - Send SMS');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('---');

    return {
      sid: `SM_mock_${Date.now()}`,
      status: 'sent'
    };
  }
};
```

### SendGrid (Email)

**Mock Implementation:**
```typescript
// File: lib/sendgrid-stub.ts
export const sendgrid = {
  sendEmail: async (to: string, subject: string, body: string) => {
    console.log('📧 SENDGRID STUB - Send Email');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log('---');

    return {
      messageId: `msg_mock_${Date.now()}`,
      status: 'sent'
    };
  }
};
```

---

## HANDOFF TO REDSOFTWARE

### What You Provide to RedSoftware:

1. **This Document** - Backend logic and business rules
2. **API Endpoint Specifications** - Request/response formats
3. **UX Flow Diagrams** - Screen-by-screen user journeys
4. **Database Schema** - `/lib/database.types.ts`
5. **Mock Integration Functions** - Stripe/Twilio/SendGrid stubs
6. **Design System** - Reference existing design tokens
7. **Existing Components** - Ionic mobile app components they can reuse

### What RedSoftware Builds:

1. **Web App (React/Vue)**:
   - Desktop-optimized layout
   - Batch upload component
   - Table view with multi-select
   - Keyboard shortcuts
   - Side-by-side version comparison
   - Band management interface

2. **Mobile App Refinements (Ionic)**:
   - Playlist-first home screen
   - Simplified track player
   - Voice memo recording
   - Quick engagement buttons

3. **Shared Components**:
   - Upgrade modals
   - Storage limit warnings
   - SMS sharing flow UI
   - Access code entry page
   - Producer waitlist form

### RedSoftware Uses Your APIs:

```typescript
// Example: They call your backend endpoints
const tierInfo = await fetch('/api/user/tier').then(r => r.json());

if (tierInfo.tier === 'free') {
  // Show upgrade modal
}

// Example: Check storage before upload
const canUpload = await fetch('/api/tracks/check-storage', {
  method: 'POST',
  body: JSON.stringify({ fileSize: file.size, bandId })
}).then(r => r.json());

if (!canUpload.allowed) {
  // Show storage limit modal
}
```

---

## TIMELINE ESTIMATE

**Week 1:** Database schema updates, tier system, storage enforcement
**Week 2:** SMS sharing tables and logic (stubbed), band creation limits
**Week 3:** Payment stubs, API endpoint implementation, testing
**Week 4:** Documentation for RedSoftware handoff, integration support

**Concurrent with RedSoftware:** They build front-end while you build backend

---

## NEXT STEPS

1. ✅ Review this document - any questions or changes?
2. ⏭️ Start Phase 1: Database migrations (add tier/storage columns)
3. ⏭️ Implement storage check function and triggers
4. ⏭️ Build tier enforcement logic
5. ⏭️ Create API endpoints
6. ⏭️ Test manually with Postman or similar
7. ⏭️ Document API for RedSoftware
8. ⏭️ Hand off to RedSoftware with clear specs

---

**Questions or ready to start Phase 1?**
