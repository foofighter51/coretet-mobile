# CoreTet Quick Start for Claude Code

## TL;DR

**What we're building:**
- Private music collaboration app
- 2 tiers: Free (solo) + Band ($5/$10/mo)
- Web = admin power tools, Mobile = collaborator convenience
- Producer tier = waitlist only (not building yet)

---

## Key Decisions

### Tier Structure
```
FREE ($0)
- Personal workspace only
- 1GB storage
- Share playlists (read-only, 5 people max)
- No band creation

BAND ($5 first month, $10/mo after)
- Personal + 1 band workspace
- 25GB storage
- Up to 10 band members
- Full collaboration tools:
  * Timestamped comments
  * Voice memos (30 sec)
  * Version comparison
  * Task assignments
- Web power features (batch upload, multi-select, keyboard shortcuts)

PRODUCER (~$25/mo - COMING SOON)
- Unlimited bands
- 100GB storage
- Dashboard for multi-project management
- Cross-project search
- Waitlist only - not building yet
```

### Platform Strategy

**WEB INTERFACE = ADMIN/CREATOR FOCUS**
- Desktop-optimized UI (not mobile web view)
- Batch upload (drag folder)
- Multi-select with shift/cmd+click
- Table views
- Keyboard shortcuts
- Advanced filtering/search
- Bulk tagging/operations

**MOBILE APP = COLLABORATOR/CONSUMPTION FOCUS**
- Simple feed of recent uploads
- One-tap playback
- Voice memo comments (primary feedback method)
- Quick ratings
- Upload from phone (voice ideas)
- Notifications
- Offline caching

---

## Database Schema (Key Tables)

```sql
users
  - id, email, name
  - tier ('free' | 'band' | 'producer')
  - storage_used, storage_limit
  - stripe_customer_id, stripe_subscription_id

bands
  - id, name, creator_id
  - storage_used, storage_limit (25GB default)
  - max_members (10 default)

band_members
  - band_id, user_id, role

tracks
  - id, owner_id, band_id (NULL if personal)
  - title, file_path, file_size, duration
  - version_parent_id (for linking versions)

comments
  - id, track_id, user_id, parent_comment_id
  - content (text)
  - timestamp_seconds (position in track)
  - voice_memo_path (for audio comments)

ratings
  - track_id, user_id
  - overall_stars, production_stars, songwriting_stars, performance_stars

listen_status
  - track_id, user_id, listened_at

shared_playlists
  - playlist_id, share_token
  - recipient_count, max_recipients (5 for free tier)

producer_waitlist
  - email, user_id, requested_at
```

---

## Storage Limits Enforcement

```javascript
// Before upload
const canUpload = await supabase.rpc('check_storage_limit', {
  user_id: userId,
  band_id: bandId,
  file_size: file.size
});

if (!canUpload) {
  if (!bandId) {
    throw new Error('STORAGE_LIMIT_REACHED_FREE');
  } else {
    throw new Error('STORAGE_LIMIT_REACHED_BAND');
  }
}

// Tier limits
FREE: 1GB (1073741824 bytes)
BAND: 25GB (26843545600 bytes)
PRODUCER: 100GB (107374182400 bytes)
```

---

## Tier Enforcement

```javascript
// Creating a band
async function createBand(userId, bandName) {
  const { data: user } = await supabase
    .from('users')
    .select('tier')
    .eq('id', userId)
    .single();
    
  // Free users can't create bands
  if (user.tier === 'free') {
    throw new Error('UPGRADE_REQUIRED_TO_CREATE_BAND');
  }
  
  // Band tier: check if already has 1 band
  if (user.tier === 'band') {
    const { data: existingBands } = await supabase
      .from('bands')
      .select('id')
      .eq('creator_id', userId);
      
    if (existingBands.length >= 1) {
      throw new Error('BAND_LIMIT_REACHED');
    }
  }
  
  // Producer tier: unlimited (future)
  
  // Create band...
}
```

---

## Stripe Integration

```javascript
// Product in Stripe:
// "CoreTet Band Tier"
// Price 1: $5 one-time (intro_offer)
// Price 2: $10/month recurring

// Checkout flow
import { loadStripe } from '@stripe/stripe-js';

async function startBandSubscription(userId) {
  const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
  
  // Create checkout session (via Supabase Edge Function)
  const { data: session } = await supabase.functions.invoke('create-checkout', {
    body: {
      userId,
      priceId: 'price_band_intro', // $5
      recurringPriceId: 'price_band_recurring', // $10/mo
      successUrl: `${window.location.origin}/band/create/success`,
      cancelUrl: `${window.location.origin}/pricing`
    }
  });
  
  // Redirect to Stripe
  await stripe.redirectToCheckout({ sessionId: session.id });
}

// Webhook handler (update user tier after payment)
// Listen for: checkout.session.completed, customer.subscription.deleted
```

---

## Feature Allocation

| Feature | Free | Band | Web Only | Mobile Only |
|---------|------|------|----------|-------------|
| Upload tracks | ✓ | ✓ | Batch upload | Single/record |
| Personal workspace | ✓ | ✓ | | |
| Band workspace | ✗ | ✓ | | |
| Share playlists | ✓ (5 max) | ✓ | | |
| Text comments | ✗ | ✓ | | |
| Timestamped comments | ✗ | ✓ | ✓ (keyboard) | ✓ (tap waveform) |
| Voice memos | ✗ | ✓ | | ✓ |
| Version comparison | ✗ | ✓ | ✓ (side-by-side) | ✓ (swipe) |
| Star ratings | ✓ (own tracks) | ✓ (all tracks) | | |
| Task assignments | ✗ | ✓ | | |
| Listen status | ✗ | ✓ | | |
| Download originals | ✗ | ✓ | ✓ | |
| Multi-select | | | ✓ | |
| Bulk operations | | | ✓ | |
| Keyboard shortcuts | | | ✓ | |

---

## Development Phases

### Phase 1: Backend (Weeks 1-2)
- [ ] Set up new database schema
- [ ] Implement RLS policies
- [ ] Storage limit enforcement
- [ ] Tier checking logic
- [ ] Basic CRUD for all tables

### Phase 2: Stripe (Week 3)
- [ ] Set up Stripe products
- [ ] Checkout flow
- [ ] Webhook handling
- [ ] Subscription management

### Phase 3: Web Interface (Weeks 4-6)
- [ ] Desktop-optimized layout (sidebar + main content)
- [ ] Batch upload component
- [ ] Table view with multi-select
- [ ] Keyboard shortcuts
- [ ] Bulk tagging/operations
- [ ] Version comparison view

### Phase 4: Mobile Simplification (Weeks 7-8)
- [ ] Simplified home feed
- [ ] One-tap playback
- [ ] Voice memo recording
- [ ] Quick comment/rating
- [ ] Upload from phone
- [ ] Push notifications

### Phase 5: Collaboration Features (Weeks 9-10)
- [ ] Timestamped comments
- [ ] Voice memo playback
- [ ] Listen status tracking
- [ ] Task assignments
- [ ] Comment threading

### Phase 6: Launch Prep (Weeks 11-12)
- [ ] Email templates (welcome, payment, renewal)
- [ ] Analytics tracking
- [ ] Producer waitlist page
- [ ] Bug fixes
- [ ] Beta testing

---

## Web UI Components (Priority Build List)

1. **Batch Upload**
   - Drag-drop entire folders
   - Preview before upload
   - Bulk tag during upload
   - Progress bar for queue

2. **Table View**
   - Sortable columns
   - Multi-select (shift/cmd+click)
   - Bulk actions bar
   - Right-click context menu

3. **Keyboard Shortcuts**
   - `/` = Focus search
   - `Space` = Play/pause
   - `J/K` = Next/prev track
   - `Cmd+A` = Select all
   - `Cmd+U` = Upload modal
   - `?` = Show shortcuts help

4. **Version Comparison**
   - Side-by-side waveforms
   - Synchronized playback
   - A/B toggle
   - Comments per version

5. **Band Management Panel**
   - Member list with permissions
   - Invite/remove members
   - Storage usage chart
   - Activity log

---

## Mobile UI Components (Priority Build List)

1. **Voice Memo Recorder**
   - One-tap record from track player
   - 30-second limit
   - Waveform visualization
   - Attach to timestamp automatically

2. **Quick Actions**
   - Record idea → upload (3 taps)
   - Comment on track (tap waveform)
   - Rate track (quick stars)

3. **Feed View**
   - Recent uploads at top
   - "Needs feedback" section
   - Large touch targets
   - Swipe gestures

4. **Player**
   - Full-screen when playing
   - Large controls (thumb-friendly)
   - Quick comment/rate buttons
   - Background audio support

---

## Critical "Don't Forgets"

1. **Storage Enforcement**
   - Check BEFORE upload starts
   - Update storage_used AFTER successful upload
   - Handle failed uploads (don't count storage)

2. **Tier Limits**
   - Free users CAN join unlimited bands (just can't create)
   - Band tier CAN only create 1 band (but unlimited as member)
   - Enforce on band creation, not band joining

3. **Shared Playlists**
   - Generate unique share_token
   - No account required to view
   - Count unique viewers
   - Enforce 5-recipient limit for free tier

4. **Voice Memos**
   - 30-second hard limit
   - WebM format (works everywhere)
   - Auto-stop if 30 seconds reached
   - Store in separate bucket from tracks

5. **RLS Security**
   - Users see own personal tracks
   - Band members see band tracks
   - No one sees other people's personal tracks
   - Shared playlist = public access via token

---

## Cost Monitoring

Watch these metrics to stay profitable:

**Storage Costs:**
- Free user (1GB): $0.023/month = $0.30 total cost
- Band user (25GB): $0.58/month = $1.25 total cost

**Break-even:**
- Free tier loses $0.72/user/month
- Band tier profits $8.75/user/month at $10
- Need ~8-9 free users per Band subscriber to break even

**Conversion Goals:**
- Target: 20% Free → Band conversion
- Minimum: 10% to stay profitable
- Danger zone: <5% conversion

---

## Launch Checklist

### Pre-Launch
- [ ] Stripe test payments work
- [ ] Storage limits enforce correctly
- [ ] Band creation requires payment
- [ ] Voice memos record/play on iOS + Android
- [ ] Notifications work
- [ ] Terms of Service + Privacy Policy live
- [ ] Email templates ready

### Launch Day
- [ ] Switch Stripe to live mode
- [ ] Submit iOS app to App Store
- [ ] Submit Android app to Google Play
- [ ] Website live
- [ ] Pricing page accurate
- [ ] Producer waitlist form works
- [ ] Analytics tracking events

### Post-Launch (First Week)
- [ ] Monitor sign-ups
- [ ] Track conversion rate
- [ ] Watch for bugs/errors
- [ ] Respond to user feedback
- [ ] Check storage costs vs revenue

---

## Quick Reference: User Flows

### New User → Band Subscriber
1. Sign up (email + password)
2. Verify email
3. Land on personal workspace (Free tier)
4. Upload a few tracks, organize them
5. Click "Create Band" → Blocked, show pricing
6. Click "Start for $5" → Stripe checkout
7. Pay $5 → Redirected back → Band creation form
8. Name band, invite members → Band created
9. Upload track to band → Bandmates notified
10. Bandmates comment with voice memos
11. Iterate, collaborate, complete song
12. Month 2: Charge $10 → Continue subscription

### Free User (Stays Free)
1. Sign up
2. Use personal workspace
3. Share playlist links with friends
4. Friends listen, leave basic ratings
5. User happy with free tier, never upgrades
6. (This is OK! Some users stay free forever)

### Band Member (Not Creator)
1. Receive invite email
2. Sign up (still on Free tier)
3. Join band (can access band workspace)
4. Listen to tracks, leave comments
5. Upload voice memo ideas
6. (Never pays because didn't create band)

---

## Common Patterns

### Check User Tier
```javascript
const { data: user } = await supabase
  .from('users')
  .select('tier, storage_used, storage_limit')
  .eq('id', userId)
  .single();

if (user.tier === 'free') {
  // Show upgrade prompt
}
```

### Upload with Storage Check
```javascript
async function uploadTrack(file, workspaceId, userId) {
  // 1. Check storage
  const canUpload = await checkStorageLimit(userId, workspaceId, file.size);
  if (!canUpload) {
    throw new Error('Storage limit reached');
  }
  
  // 2. Upload file
  const filePath = `${workspaceId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('tracks')
    .upload(filePath, file);
    
  if (error) throw error;
  
  // 3. Create record (triggers storage update)
  await supabase.from('tracks').insert({
    owner_id: userId,
    band_id: workspaceId !== userId ? workspaceId : null,
    file_path: filePath,
    file_size: file.size
  });
}
```

### Add Timestamped Comment
```javascript
async function addComment(trackId, userId, timestamp, content, voiceMemoFile) {
  let voiceMemoPath = null;
  
  // Upload voice memo if provided
  if (voiceMemoFile) {
    voiceMemoPath = `voice-memos/${trackId}/${Date.now()}.webm`;
    await supabase.storage
      .from('comments')
      .upload(voiceMemoPath, voiceMemoFile);
  }
  
  // Create comment
  await supabase.from('comments').insert({
    track_id: trackId,
    user_id: userId,
    content: content,
    timestamp_seconds: timestamp,
    voice_memo_path: voiceMemoPath
  });
}
```

---

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx (server-side only)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
VITE_APP_URL=http://localhost:5173 (dev) or https://coretet.app (prod)
```

---

## Testing Checklist

### Manual Tests
- [ ] Sign up + email verification
- [ ] Upload to personal space
- [ ] Hit 1GB limit (create large dummy file)
- [ ] Share playlist, open without login
- [ ] Click "Create Band" as free user → blocked
- [ ] Upgrade to Band tier (use Stripe test card)
- [ ] Create band after payment
- [ ] Invite band member
- [ ] Upload to band space
- [ ] Add timestamped comment
- [ ] Record voice memo (iOS + Android)
- [ ] Rate track
- [ ] Mark as listened
- [ ] Create task assignment
- [ ] Download original
- [ ] Compare versions
- [ ] Cancel subscription → downgrade to free

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

---

That's it! This should give you everything you need to brief Claude Code and start building. The full development brief has all the detailed code examples, but this quick start covers the essentials.

Key takeaway: **Web = power tools for creators, Mobile = convenience for collaborators.**

Good luck with the build! 🎸
