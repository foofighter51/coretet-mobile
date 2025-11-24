# CoreTet Playlist Sharing System - SMS-Based Access Control

**Problem with Open Links:**
- Links can be shared without permission
- No control over who accesses content
- Risk of data scraping/abuse
- Unreleased music could leak publicly
- Goes against "private collaboration" philosophy

**Solution: SMS Verification with Phone Numbers**
- Artist controls exactly who gets access
- Mobile-first (fits listening use case)
- Temporary access codes via SMS
- Can revoke access anytime
- No account required, but still secure

---

## How It Works

### Artist Workflow (Sharing a Playlist)

```
1. Artist selects playlist to share
   ↓
2. Clicks "Share Playlist"
   ↓
3. Enters phone numbers of approved listeners:
   • +1 (555) 123-4567 (Friend Alex)
   • +1 (555) 234-5678 (Producer Sarah)
   • +1 (555) 345-6789 (Manager Mike)
   ↓
4. Optional: Set expiry (7 days, 30 days, or custom)
   ↓
5. Clicks "Send Access Codes"
   ↓
6. Each recipient receives SMS:
   
   "🎵 CoreTet: [Artist Name] shared a playlist with you.
   
   Playlist: 'Summer EP Demos'
   5 tracks
   
   Access code: A7K9M2
   Link: https://coretet.app/listen/xyz
   
   Code expires in 7 days"
```

### Listener Workflow (Accessing Playlist)

```
1. Receives SMS with link and access code
   ↓
2. Opens link on mobile device
   ↓
3. Lands on access page:
   
   ┌────────────────────────────────┐
   │  🎵 CoreTet                    │
   │                                │
   │  Playlist Access               │
   │                                │
   │  You've been invited to listen │
   │  to a private playlist.        │
   │                                │
   │  Enter your access code:       │
   │  [______]                      │
   │                                │
   │  [Access Playlist]             │
   └────────────────────────────────┘
   
   ↓
4. Enters code from SMS (e.g., "A7K9M2")
   ↓
5. Code validated → Gains access to playlist
   ↓
6. Can listen to all tracks
   ↓
7. Can leave basic engagement (🎧 listened only, stored in browser)
   ↓
8. Access expires after set time or when revoked
```

---

## Database Schema

```sql
-- Shared playlists (one per sharing session)
CREATE TABLE shared_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  
  -- Who shared it
  shared_by UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Access control
  share_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMP, -- NULL = never expires
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  total_access_grants INT DEFAULT 0, -- how many people were granted access
  total_plays INT DEFAULT 0, -- aggregate play count
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual access grants (one per recipient)
CREATE TABLE playlist_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_playlist_id UUID REFERENCES shared_playlists(id) ON DELETE CASCADE,
  
  -- Recipient info
  phone_number_hash TEXT NOT NULL, -- Hashed for privacy
  access_code TEXT NOT NULL, -- 6-character code (e.g., "A7K9M2")
  
  -- Access tracking
  is_used BOOLEAN DEFAULT FALSE, -- Has code been used yet?
  first_accessed_at TIMESTAMP, -- When they first accessed
  last_accessed_at TIMESTAMP, -- Most recent access
  access_count INT DEFAULT 0, -- How many times they've accessed
  
  -- Expiry
  expires_at TIMESTAMP NOT NULL, -- Code-specific expiry
  is_revoked BOOLEAN DEFAULT FALSE, -- Can be manually revoked
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shared_playlist_id, phone_number_hash)
);

-- Indexes for performance
CREATE INDEX idx_shared_playlists_token ON shared_playlists(share_token);
CREATE INDEX idx_playlist_access_grants_code ON playlist_access_grants(access_code);
CREATE INDEX idx_playlist_access_grants_phone ON playlist_access_grants(phone_number_hash);
```

---

## SMS Service Integration

### Service Options

**Option 1: Twilio (Recommended)**
- Cost: ~$0.0079 per SMS (US)
- Reliable delivery
- Good API
- Free trial credit

**Option 2: AWS SNS**
- Cost: ~$0.00645 per SMS (US)
- Cheaper at scale
- Requires AWS setup
- Good if already using AWS

**Option 3: Vonage (formerly Nexmo)**
- Cost: ~$0.0073 per SMS (US)
- Alternative to Twilio
- Similar features

### Cost Analysis

```
Free Tier User:
- Shares 1 playlist with 3 friends
- Cost: 3 × $0.0079 = $0.024 (~2.4 cents)
- Artist pays this? Or platform absorbs?

Band Tier User:
- Shares 5 playlists × 5 recipients each = 25 SMS
- Cost: 25 × $0.0079 = $0.20 per sharing session
- Could include in subscription or charge small fee

Producer Tier:
- Shares 20 playlists × 10 recipients = 200 SMS
- Cost: 200 × $0.0079 = $1.58
- Could include SMS credits in tier or pay-per-use

Recommendation:
- Free tier: 10 SMS credits per month (included)
- Band tier: 50 SMS credits per month (included)
- Producer tier: 200 SMS credits per month (included)
- Additional: $5 per 100 SMS if needed
```

### SMS Template

```
// SMS message (keep under 160 characters for single SMS)
🎵 CoreTet: {artist_name} shared "{playlist_name}" with you.

{track_count} tracks

Code: {access_code}
Link: {short_url}

Expires: {expiry_date}

// If over 160 chars, split into 2 messages or shorten
```

---

## Implementation Details

### Creating a Share

```javascript
async function sharePlaylist(playlistId, phoneNumbers, expiryDays = 7) {
  // 1. Create shared_playlists record
  const { data: sharedPlaylist } = await supabase
    .from('shared_playlists')
    .insert({
      playlist_id: playlistId,
      shared_by: currentUser.id,
      expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
    })
    .select()
    .single();
  
  // 2. For each phone number, create access grant
  for (const phoneNumber of phoneNumbers) {
    // Hash phone number for privacy
    const phoneHash = await hashPhoneNumber(phoneNumber);
    
    // Generate 6-character code (uppercase letters + numbers)
    const accessCode = generateAccessCode(); // e.g., "A7K9M2"
    
    // Create access grant
    await supabase
      .from('playlist_access_grants')
      .insert({
        shared_playlist_id: sharedPlaylist.id,
        phone_number_hash: phoneHash,
        access_code: accessCode,
        expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
      });
    
    // 3. Send SMS
    await sendSMS(phoneNumber, {
      artistName: currentUser.name,
      playlistName: playlist.name,
      trackCount: playlist.tracks.length,
      accessCode: accessCode,
      link: `https://coretet.app/listen/${sharedPlaylist.share_token}`,
      expiryDate: formatDate(expiryDays)
    });
  }
  
  // 4. Update grant count
  await supabase
    .from('shared_playlists')
    .update({ total_access_grants: phoneNumbers.length })
    .eq('id', sharedPlaylist.id);
  
  return sharedPlaylist;
}

function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function hashPhoneNumber(phoneNumber) {
  // Normalize phone number first (remove formatting)
  const normalized = phoneNumber.replace(/\D/g, ''); // Keep digits only
  
  // Hash for privacy (can't reverse to get phone number)
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Validating Access

```javascript
async function validateAccessCode(shareToken, accessCode) {
  // 1. Find shared playlist
  const { data: sharedPlaylist } = await supabase
    .from('shared_playlists')
    .select('*')
    .eq('share_token', shareToken)
    .eq('is_active', true)
    .single();
  
  if (!sharedPlaylist) {
    throw new Error('INVALID_SHARE_LINK');
  }
  
  // 2. Check if playlist has expired
  if (sharedPlaylist.expires_at && new Date(sharedPlaylist.expires_at) < new Date()) {
    throw new Error('SHARE_EXPIRED');
  }
  
  // 3. Find access grant with this code
  const { data: grant } = await supabase
    .from('playlist_access_grants')
    .select('*')
    .eq('shared_playlist_id', sharedPlaylist.id)
    .eq('access_code', accessCode.toUpperCase())
    .single();
  
  if (!grant) {
    throw new Error('INVALID_ACCESS_CODE');
  }
  
  // 4. Check if grant is revoked
  if (grant.is_revoked) {
    throw new Error('ACCESS_REVOKED');
  }
  
  // 5. Check if grant has expired
  if (new Date(grant.expires_at) < new Date()) {
    throw new Error('CODE_EXPIRED');
  }
  
  // 6. Update access tracking
  await supabase
    .from('playlist_access_grants')
    .update({
      is_used: true,
      first_accessed_at: grant.first_accessed_at || new Date(),
      last_accessed_at: new Date(),
      access_count: grant.access_count + 1
    })
    .eq('id', grant.id);
  
  // 7. Return success with playlist data
  return {
    success: true,
    playlistId: sharedPlaylist.playlist_id,
    grantId: grant.id // For session tracking
  };
}
```

---

## User Interface

### Mobile App - Share Playlist Flow

```
Artist's Band Workspace:

┌────────────────────────────────┐
│ ← Summer EP Demos              │
├────────────────────────────────┤
│                                │
│ 5 tracks • Created by You      │
│                                │
│ [▶ Play All]   [Share]         │ ← Share button
│                                │
│ Track list...                  │
└────────────────────────────────┘

Taps [Share] →

┌────────────────────────────────┐
│ ← Share Playlist               │
├────────────────────────────────┤
│                                │
│ Summer EP Demos                │
│ 5 tracks                       │
│                                │
│ Who can listen?                │
│                                │
│ ┌────────────────────────────┐ │
│ │ +1 (555) 123-4567         │ │
│ │ Alex (Friend) ✕           │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ +1 (555) 234-5678         │ │
│ │ Sarah (Producer) ✕        │ │
│ └────────────────────────────┘ │
│                                │
│ [+ Add Phone Number]           │
│                                │
│ Access expires:                │
│ • 7 days (recommended)         │
│ ○ 30 days                      │
│ ○ 90 days                      │
│ ○ Never                        │
│                                │
│ SMS Cost: 2 credits            │
│ (You have 48 remaining)        │
│                                │
│ [Send Access Codes]            │
└────────────────────────────────┘

After sending:

┌────────────────────────────────┐
│ Access codes sent! ✓           │
│                                │
│ 2 people can now listen:       │
│ • Alex: Code sent              │
│ • Sarah: Code sent             │
│                                │
│ You can manage access in       │
│ Playlist Settings.             │
│                                │
│ [Done]                         │
└────────────────────────────────┘
```

### Recipient - Access Playlist Flow

```
Receives SMS:
"🎵 CoreTet: John shared 'Summer EP Demos' with you.
5 tracks
Code: A7K9M2
Link: coretet.app/listen/xyz
Expires in 7 days"

Taps link →

┌────────────────────────────────┐
│ 🎵 CoreTet                     │
├────────────────────────────────┤
│                                │
│ Private Playlist Access        │
│                                │
│ John shared a playlist         │
│ with you                       │
│                                │
│ "Summer EP Demos"              │
│ 5 tracks                       │
│                                │
│ Enter your access code:        │
│                                │
│ ┌────────────────────────────┐ │
│ │ [A][7][K][9][M][2]        │ │ ← Large input boxes
│ └────────────────────────────┘ │
│                                │
│ [Listen Now]                   │
│                                │
│ Code expires in 7 days         │
└────────────────────────────────┘

After entering valid code:

┌────────────────────────────────┐
│ ← Summer EP Demos              │
├────────────────────────────────┤
│                                │
│ Shared by John                 │
│ 5 tracks                       │
│                                │
│ 🔒 Private - Expires in 6 days │
│                                │
│ 1. Sunset Drive        3:42    │
│    [▶]                         │
│                                │
│ 2. Night Drive         4:15    │
│    [▶]                         │
│                                │
│ 3. Highway Blues       2:58    │
│    [▶]                         │
│                                │
│ 4. Morning Light       3:20    │
│    [▶]                         │
│                                │
│ 5. City Lights         4:02    │
│    [▶]                         │
│                                │
│ 🎧 You've listened to 2/5      │
└────────────────────────────────┘

Playing track:

┌────────────────────────────────┐
│ ← Sunset Drive                 │
├────────────────────────────────┤
│                                │
│   [Waveform visualization]     │
│                                │
│ ━━━━●━━━━━━━━━━━━━━━━━━      │
│ 1:23             3:42          │
│                                │
│ [  ⏮  ⏯  ⏭  ]                │
│                                │
│ 🎧 Mark as Listened            │ ← Only engagement option
│                                │
│ From: Summer EP Demos          │
│ Track 1 of 5                   │
└────────────────────────────────┘
```

### Artist - Manage Shared Playlists

```
In Playlist Settings:

┌────────────────────────────────┐
│ ← Summer EP Demos              │
├────────────────────────────────┤
│                                │
│ Settings                       │
│                                │
│ Shared Access                  │
│                                │
│ Active shares:                 │
│                                │
│ ┌────────────────────────────┐ │
│ │ Shared 2 days ago          │ │
│ │ 2 people have access       │ │
│ │ Expires in 5 days          │ │
│ │                            │ │
│ │ • Alex: Accessed 2x        │ │
│ │   Last: Today at 2:14 PM   │ │
│ │   [Revoke Access]          │ │
│ │                            │ │
│ │ • Sarah: Not accessed yet  │ │
│ │   [Resend Code]            │ │
│ │   [Revoke Access]          │ │
│ │                            │ │
│ │ [End All Access]           │ │
│ └────────────────────────────┘ │
│                                │
│ [+ Share with More People]     │
└────────────────────────────────┘
```

---

## Security Considerations

### Phone Number Privacy

**Hashing:**
- Store SHA-256 hash of phone number, not actual number
- Can verify code without storing raw phone number
- Even if database is breached, phone numbers are protected

**Limitations:**
- Phone numbers have limited entropy (only ~10 digits)
- Could be brute-forced with rainbow table
- Better than plaintext, not perfect

**Alternative (More Secure):**
- Don't store phone numbers at all
- Only store access codes
- Trade-off: Can't resend code if lost
- Artist would need to create new share

### Access Code Security

**Code Generation:**
- 6 characters = 36^6 = ~2 billion combinations
- Exclude confusing characters (0/O, 1/I/l)
- Rate limit attempts (5 tries per minute)
- Lock code after 10 failed attempts

**Code Expiry:**
- Force expiry (max 90 days)
- Can be revoked by artist anytime
- One-time use? Or reusable?
  - Recommendation: Reusable within expiry period
  - Listener can return to playlist multiple times

### Preventing Abuse

**Rate Limiting:**
- Limit SMS sends per user:
  - Free: 10 SMS per month
  - Band: 50 SMS per month
  - Producer: 200 SMS per month
- Limit code attempts: 5 per minute per IP
- Limit playlist access: 100 plays per day per grant

**Monitoring:**
- Track unusual patterns (same code used from 100 IPs)
- Alert if code is shared publicly (high access count)
- Allow artist to revoke access instantly

---

## Free vs Paid Tier Differences

### Free Tier
- 10 SMS credits per month
- Share up to 2 playlists simultaneously
- Max 5 recipients per playlist
- Max 7-day expiry
- Can't password-protect shares

### Band Tier
- 50 SMS credits per month
- Share up to 10 playlists simultaneously
- Max 10 recipients per playlist
- Max 90-day expiry or never
- Optional password protection (extra security layer)

### Producer Tier
- 200 SMS credits per month
- Unlimited active shares
- Unlimited recipients per playlist
- Custom expiry dates
- Advanced access management (revoke individual recipients)

---

## SMS Credit System

```sql
-- Track SMS usage
CREATE TABLE sms_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Credit tracking
  credits_total INT NOT NULL, -- Monthly allocation
  credits_used INT DEFAULT 0,
  credits_remaining INT GENERATED ALWAYS AS (credits_total - credits_used) STORED,
  
  -- Reset tracking
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Function to reset credits monthly
CREATE OR REPLACE FUNCTION reset_monthly_sms_credits()
RETURNS void AS $$
BEGIN
  -- For each user with expired period, create new period
  INSERT INTO sms_credits (user_id, credits_total, period_start, period_end)
  SELECT 
    u.id,
    CASE 
      WHEN u.tier = 'free' THEN 10
      WHEN u.tier = 'band' THEN 50
      WHEN u.tier = 'producer' THEN 200
    END,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month'
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1 FROM sms_credits 
    WHERE user_id = u.id 
    AND period_end > CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Run monthly via cron job or Supabase scheduled function
```

### Purchasing Additional Credits

```
If user runs out of credits mid-month:

┌────────────────────────────────┐
│ SMS Credits                    │
├────────────────────────────────┤
│                                │
│ You've used all 50 credits     │
│ this month.                    │
│                                │
│ Next reset: Jan 1, 2026        │
│                                │
│ Need more?                     │
│                                │
│ ○ 25 credits - $2              │
│ ○ 50 credits - $3              │
│ ○ 100 credits - $5             │
│                                │
│ [Purchase Credits]             │
└────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Backend Setup
- [ ] Create database tables (shared_playlists, playlist_access_grants, sms_credits)
- [ ] Implement phone number hashing function
- [ ] Implement access code generation
- [ ] Set up SMS service account (Twilio recommended)
- [ ] Create SMS sending function
- [ ] Implement access code validation logic
- [ ] Set up monthly credit reset (cron job)

### Phase 2: API Endpoints
- [ ] POST /share-playlist (create share + send SMS)
- [ ] POST /validate-access (verify code, grant access)
- [ ] GET /shared-playlist/:token (get playlist data if valid)
- [ ] POST /revoke-access (revoke specific grant or all)
- [ ] POST /resend-code (resend SMS to recipient)
- [ ] GET /my-shares (list artist's active shares)

### Phase 3: UI Implementation
- [ ] Share playlist modal (phone number input)
- [ ] Access code entry screen (recipient view)
- [ ] Playlist player (recipient view, limited engagement)
- [ ] Manage shares screen (artist view)
- [ ] SMS credits display and purchase flow

### Phase 4: Testing
- [ ] Test SMS delivery (real phone numbers)
- [ ] Test invalid code handling
- [ ] Test expired code handling
- [ ] Test revoke access functionality
- [ ] Test credit limit enforcement
- [ ] Test concurrent access (multiple recipients)

---

## Claude Code Pre-Implementation Checks

**Before implementing SMS sharing:**

- [ ] Do we have budget for SMS costs? (estimate monthly usage)
- [ ] Which SMS provider should we use? (Twilio vs AWS SNS vs Vonage)
- [ ] How do we store API keys securely? (environment variables)
- [ ] Can we test SMS in development without sending real messages?
- [ ] What's the current playlist schema? (does it support sharing?)
- [ ] How do we handle phone number formatting? (international support?)
- [ ] Should codes be case-sensitive? (recommendation: No, uppercase only)
- [ ] What happens if SMS fails to send? (retry logic? notify artist?)
- [ ] How do we prevent spam? (rate limiting per user)
- [ ] Can recipients re-access after closing browser? (session management)

---

## Cost Analysis (Revised)

### Per-User Monthly SMS Costs

```
Free Tier:
- 10 SMS per month = 10 × $0.0079 = $0.079
- Platform absorbs this cost
- Goal: Convert to paid with credit limits

Band Tier ($10/month):
- 50 SMS included = 50 × $0.0079 = $0.40 cost
- Still 96% profit margin ($10 - $0.40 - $1.25 other costs = $8.35)

Producer Tier ($25/month):
- 200 SMS included = 200 × $0.0079 = $1.58 cost
- Still 90% profit margin ($25 - $1.58 - $2.97 other costs = $20.45)

Additional Credits:
- 25 SMS = $0.20 cost, sell for $2 (90% margin)
- 50 SMS = $0.40 cost, sell for $3 (87% margin)
- 100 SMS = $0.79 cost, sell for $5 (84% margin)
```

### Break-Even Analysis

```
With SMS costs added:

Free tier: $0.72 base + $0.08 SMS = $0.80 total cost
Band tier: $1.25 base + $0.40 SMS = $1.65 total cost ($8.35 profit at $10)
Producer tier: $2.97 base + $1.58 SMS = $4.55 total cost ($20.45 profit at $25)

Still very profitable!
```

---

## Migration from Old Shared Playlist System

**If you already have open sharing links:**

```sql
-- Migrate existing shares to new system
-- Note: Can't migrate to SMS-based without phone numbers
-- Options:

-- Option 1: Deprecate old shares (force re-share)
UPDATE shared_playlists SET is_active = FALSE WHERE created_at < '2025-01-01';

-- Option 2: Keep old shares active, new shares use SMS
-- Add 'share_type' column: 'legacy' vs 'sms'
ALTER TABLE shared_playlists ADD COLUMN share_type TEXT DEFAULT 'sms';
UPDATE shared_playlists SET share_type = 'legacy' WHERE created_at < '2025-01-01';

-- Then in validation logic, handle both types
```

---

## Summary

### Why SMS-Based Access is Better

1. **Artist Control:** Knows exactly who can listen
2. **Privacy:** Demos don't leak to public
3. **Mobile-First:** SMS is native to mobile devices
4. **Temporary:** Access expires automatically
5. **Revocable:** Artist can revoke anytime
6. **No Account:** Recipient doesn't need CoreTet account
7. **Trackable:** Artist sees who accessed and when

### Trade-offs

**Pros:**
- ✅ Much more secure than open links
- ✅ Artist maintains control
- ✅ Prevents viral sharing
- ✅ Mobile-native experience

**Cons:**
- ❌ Costs money (SMS fees)
- ❌ Requires phone numbers (privacy concern)
- ❌ Extra step for recipients (enter code)
- ❌ Won't work for email-only contacts

### Recommendation

This SMS-based system aligns perfectly with CoreTet's "private collaboration" philosophy. The small SMS cost is worth the control and security it provides. The credit system encourages paid tier upgrades while keeping free tier viable for testing.

---

Ready to implement this? The SMS-based sharing is much better than open links for your use case!
