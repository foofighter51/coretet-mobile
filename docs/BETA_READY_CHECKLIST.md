# CoreTet Beta Launch Readiness Checklist

**Goal:** Get the app into beta testers' hands within 2-3 weeks
**Target Date:** January 6-13, 2025
**Current Date:** December 17, 2024

---

## Critical Path (Must Fix Before Beta)

### 🚨 Priority 1: Core Functionality Blockers (Week 1)

#### ✅ Task 1.1: Wire Up Version Playback Switching
**Status:** 🔴 BLOCKING - Hero System 95% complete but non-functional
**Estimate:** 1-2 hours
**Severity:** HIGH - Major feature doesn't work end-to-end

**Current State:**
- VersionSelector displays all versions correctly
- Hero badge shows properly
- Clicking a version logs to console but doesn't switch audio

**What Needs to Happen:**
- Wire `onVersionSelect` callback in TrackDetailModal to audio player
- Update `currentTrack` state when version is selected
- Switch audio file URL to selected version's file
- Test audio playback switches correctly

**Files to Modify:**
- `src/components/molecules/TrackDetailModal.tsx` (line ~192)
- Potentially `src/contexts/AudioPlayerContext.tsx` (if exists)
- Potentially `src/components/molecules/AudioPlayer.tsx`

**Success Criteria:**
- User clicks version in VersionSelector → audio switches to that version
- Playback continues from beginning of new version
- UI updates to show currently playing version

---

#### ✅ Task 1.2: Build Stripe Billing System
**Status:** 🔴 BLOCKING - Cannot charge money without this
**Estimate:** 8-12 hours (spread over 3-4 days)
**Severity:** CRITICAL - No revenue without billing

**Current State:**
- Database has `tiers` table and tier references
- No Stripe integration
- No payment collection flow
- No tier enforcement

**What Needs to Happen:**

**Phase A: Stripe Setup (2-3 hours)**
1. Create Stripe account (test mode)
2. Create products in Stripe:
   - Free: $0/month, 1GB storage
   - Standard: $7.50/month, 25GB storage
3. Install Stripe libraries: `npm install @stripe/stripe-js @stripe/react-stripe-js`
4. Set up Stripe webhook endpoint in Supabase Edge Functions

**Phase B: Frontend Integration (4-6 hours)**
1. Create `SubscriptionModal.tsx` component
   - Display tier comparison (Free vs Standard)
   - "Upgrade to Standard" button
   - Stripe Checkout integration
2. Add upgrade prompts when storage limit reached
3. Add subscription management in Settings modal
   - Current plan display
   - "Manage Subscription" → Stripe Customer Portal

**Phase C: Backend Integration (2-3 hours)**
1. Create Supabase Edge Function for Stripe webhooks
   - `supabase/functions/stripe-webhook/index.ts`
   - Handle `checkout.session.completed`
   - Handle `customer.subscription.updated`
   - Handle `customer.subscription.deleted`
2. Update `profiles` table with `stripe_customer_id`, `subscription_status`
3. Create `subscriptions` table (if doesn't exist)

**Phase D: Tier Enforcement (1-2 hours)**
1. Add storage limit checks on upload
2. Block uploads when limit exceeded (with upgrade prompt)
3. Test free trial → paid conversion flow

**Files to Create/Modify:**
- `src/components/molecules/SubscriptionModal.tsx` (NEW)
- `src/components/molecules/SettingsModal.tsx` (modify)
- `supabase/functions/stripe-webhook/index.ts` (NEW)
- `lib/supabase.ts` (add subscription helpers)

**Success Criteria:**
- User can upgrade from Free to Standard
- Stripe payment succeeds in test mode
- User's tier updates in database
- Storage limits enforced correctly
- User can manage subscription via Stripe portal

**Resources:**
- [Supabase + Stripe Guide](https://supabase.com/docs/guides/auth/auth-stripe)
- [Stripe Checkout React](https://stripe.com/docs/checkout/quickstart?client=react)

---

#### ✅ Task 1.3: Remove DEV Labels and Test Buttons
**Status:** 🟡 POLISH - Needed for professional appearance
**Estimate:** 30 minutes
**Severity:** MEDIUM - Looks unprofessional to beta testers

**What to Remove:**
1. "🧪 Versions (DEV)" label in TrackDetailModal → Just "Versions"
2. Test buttons in Profile tab (VersionSelectorTest, etc.)
3. "🔗 Group as Versions (DEV)" button → Just "Group Versions"
4. Any console.log statements left in production code

**Files to Modify:**
- `src/components/molecules/TrackDetailModal.tsx`
- `src/components/screens/MainDashboard.tsx`
- `src/components/molecules/VersionSelector.tsx`
- `src/components/molecules/GroupTracksModal.tsx`

**Success Criteria:**
- No "DEV" labels visible anywhere in UI
- No test buttons in production views
- Console logs cleaned up (only errors/warnings remain)

---

#### ✅ Task 1.4: Fix GroupTracksModal Preview Bug
**Status:** 🟡 POLISH - Cosmetic but noticed immediately by users
**Estimate:** 15 minutes
**Severity:** LOW - Doesn't break functionality

**Current Bug:**
- Preview shows first selected track name instead of hero track name

**Fix:**
- Update preview display to use `heroTrackId` instead of `selectedTrackIds[0]`

**File to Modify:**
- `src/components/molecules/GroupTracksModal.tsx` (lines ~33-45)

**Success Criteria:**
- Preview section shows correct hero track name
- Changing hero updates preview immediately

---

### 🟡 Priority 2: User Experience Improvements (Week 1-2)

#### ✅ Task 2.1: Implement Listened Indicator
**Status:** 🟢 READY - Database schema exists, just needs UI
**Estimate:** 2-3 hours
**Severity:** MEDIUM - MVP feature from implementation brief

**Current State:**
- `track_listens` table exists
- Playback tracking infrastructure exists (80% threshold)
- No UI to display who has listened

**What Needs to Happen:**
1. Add "Listened by" section to TrackDetailModal
   - Query `track_listens` for current track
   - Display list of band members who've listened
   - Show timestamp or just checkmark
2. Add visual indicator on TrackCard/TrackRow
   - Green checkmark icon if current user has listened
   - Optionally show "3/5 members listened"
3. Wire up 80% playback tracking in AudioPlayer
   - Fire "listened" event when playhead crosses 80%
   - Insert into `track_listens` table
4. Test with multiple users

**Files to Modify:**
- `src/components/molecules/TrackDetailModal.tsx` (add listened section)
- `src/components/molecules/TrackCard.tsx` (add checkmark icon)
- `src/components/molecules/AudioPlayer.tsx` (add 80% tracking)
- `lib/supabase.ts` (add `trackListens` helpers)

**Success Criteria:**
- User plays track to 80% → marked as "listened"
- TrackDetailModal shows "Listened by: Eric, Sarah, Mike"
- TrackCard shows green checkmark for listened tracks
- Works across multiple band members

---

#### ✅ Task 2.2: Build Keywords UI
**Status:** 🟢 READY - Database schema exists, just needs UI
**Estimate:** 3-4 hours
**Severity:** MEDIUM - MVP feature from implementation brief

**Current State:**
- `keywords` and `track_keywords` tables exist
- No UI to create or assign keywords
- No filtering by keywords

**What Needs to Happen:**

**Phase A: Keyword Management (1-2 hours)**
1. Create `KeywordManagerModal.tsx`
   - List existing keywords for current band
   - "Add Keyword" input field
   - Delete keyword button (with confirmation)
2. Add "Manage Keywords" button in Settings modal (admin only)

**Phase B: Keyword Assignment (1-2 hours)**
1. Add keyword selector to track upload flow
   - Multi-select dropdown or tag input
2. Add keyword editor to TrackDetailModal
   - Display current keywords as pills/badges
   - "Add keyword" button (admin only)
   - Click keyword pill to remove (admin only)

**Phase C: Keyword Filtering (1 hour)**
1. Add keyword filter dropdown in MainDashboard
   - Show all keywords for current band
   - Click keyword to filter track list
   - "Clear filters" button
2. Update track query to filter by keyword_id

**Files to Create/Modify:**
- `src/components/molecules/KeywordManagerModal.tsx` (NEW)
- `src/components/molecules/TrackDetailModal.tsx` (modify)
- `src/components/screens/MainDashboard.tsx` (modify)
- `src/components/molecules/AudioUploader.tsx` (modify)
- `lib/supabase.ts` (add keyword helpers)

**Success Criteria:**
- Admin can create keywords ("Upbeat", "Ballad", "Needs vocals")
- Admin can assign keywords to tracks
- Users can filter track list by keyword
- Keywords display as colored pills on track cards

---

#### ✅ Task 2.3: Improve Empty States
**Status:** 🟢 POLISH - Already have some, make them better
**Estimate:** 1 hour
**Severity:** LOW - UX polish for first-time users

**Current State:**
- Empty states exist for tracks, set lists, bands
- Could be more helpful/encouraging

**What to Improve:**
1. **Empty Tracks State:**
   - Current: "No tracks yet"
   - Better: "Upload your first demo! Tap the + button to get started."
2. **Empty Set Lists State:**
   - Current: "No set lists yet"
   - Better: "Create a set list to organize tracks for rehearsal or a show."
3. **Empty Band State:**
   - Current: "No band yet"
   - Better: "Create a band to collaborate with your bandmates."
4. Add helpful illustrations or icons (optional)

**Files to Modify:**
- `src/components/molecules/EmptyState.tsx`
- Any screens that use EmptyState component

**Success Criteria:**
- Empty states are encouraging, not discouraging
- Clear call-to-action in each empty state
- First-time users know what to do next

---

### ✅ Priority 3: Testing & QA (Week 2)

#### ✅ Task 3.1: Comprehensive Manual Testing
**Status:** 🔴 REQUIRED - Cannot launch without testing
**Estimate:** 4-6 hours (spread over several days)
**Severity:** CRITICAL - Catch bugs before beta testers do

**Test Scenarios:**

**User Onboarding Flow:**
- [ ] New user signs up with email/password
- [ ] Email verification works
- [ ] Intro screens display correctly (3 screens)
- [ ] User can skip intro screens
- [ ] User can create a band
- [ ] User can join a band via invite

**Track Management:**
- [ ] Upload track (MP3, M4A, WAV)
- [ ] Upload fails gracefully with large file (>50MB)
- [ ] Track plays in audio player
- [ ] Track metadata displays (title, duration, uploaded by)
- [ ] Delete track works
- [ ] Track comments work
- [ ] Track ratings (Like/Love) work

**Version System:**
- [ ] Upload new version of track
- [ ] Group existing tracks as versions
- [ ] Set hero version
- [ ] Change hero version
- [ ] Switch playback between versions
- [ ] Ungroup tracks
- [ ] Version comments/ratings stay attached

**Set Lists:**
- [ ] Create set list
- [ ] Add tracks to set list
- [ ] Reorder tracks in set list
- [ ] Remove tracks from set list
- [ ] Delete set list
- [ ] Set list shows correct track count

**Band Management:**
- [ ] Invite member via SMS
- [ ] Member accepts invite
- [ ] Member can view tracks/set lists
- [ ] Member CANNOT upload tracks (permission check)
- [ ] Admin can change member role
- [ ] Admin can remove member

**Billing (Test Mode):**
- [ ] User can view subscription plans
- [ ] User can upgrade to Standard tier
- [ ] Stripe checkout works in test mode
- [ ] User tier updates in database
- [ ] Storage limit enforced
- [ ] User can manage subscription

**Edge Cases:**
- [ ] No internet → graceful error messages
- [ ] Upload with 1% battery → doesn't crash
- [ ] 500+ tracks in library → performance OK
- [ ] Track title with emoji → displays correctly
- [ ] Band name with special characters → no issues

**Files to Create:**
- `docs/testing/MANUAL_TEST_RESULTS.md` (log findings)

---

#### ✅ Task 3.2: Fix Discovered Bugs
**Status:** 🔴 BLOCKING - Depends on Task 3.1 findings
**Estimate:** 4-8 hours (unknown until testing)
**Severity:** VARIES

**Process:**
1. Log all bugs found during Task 3.1
2. Prioritize by severity (Critical → High → Medium → Low)
3. Fix Critical and High bugs before beta launch
4. Defer Medium/Low bugs to post-beta

**Success Criteria:**
- Zero critical bugs (app-breaking, data loss, security issues)
- Zero high bugs (major features broken, poor UX)
- Document all medium/low bugs for future fixes

---

#### ✅ Task 3.3: Performance Testing
**Status:** 🟡 IMPORTANT - Slow app kills retention
**Estimate:** 2 hours
**Severity:** MEDIUM

**What to Test:**
1. **Load Time:**
   - App loads in <3 seconds on 4G connection
   - Track list renders in <1 second with 100+ tracks
2. **Audio Playback:**
   - Track starts playing in <2 seconds (streaming)
   - No stuttering or buffering with normal connection
3. **Memory Usage:**
   - App doesn't crash after 30 minutes of use
   - Memory stays below 200MB
4. **Battery Drain:**
   - 1 hour of playback drains <10% battery

**Tools:**
- Xcode Instruments (Time Profiler, Allocations)
- Chrome DevTools (Network, Performance)
- Manual testing with real device

**Success Criteria:**
- App feels fast and responsive
- No crashes or freezes
- Battery usage is acceptable

---

### ✅ Priority 4: Beta Launch Prep (Week 2-3)

#### ✅ Task 4.1: Set Up TestFlight Beta
**Status:** 🟢 REQUIRED - Distribution mechanism
**Estimate:** 2-3 hours
**Severity:** CRITICAL - Can't beta test without this

**Steps:**
1. **Enroll in Apple Developer Program** ($99/year)
   - If not already enrolled
2. **Configure App Store Connect:**
   - Create app record
   - Upload build via Xcode
   - Set up TestFlight internal testing group
3. **Create External Testing Group:**
   - "Beta Testers" group
   - Set up for 20-50 testers initially
4. **Write Beta Test Instructions:**
   - What to test
   - How to provide feedback
   - Known issues to ignore

**Files to Create:**
- `docs/beta/BETA_TESTER_INSTRUCTIONS.md`
- `docs/beta/BETA_FEEDBACK_TEMPLATE.md`

**Success Criteria:**
- TestFlight build uploaded successfully
- Internal team can install and test
- External tester invite links work

---

#### ✅ Task 4.2: Create Beta Feedback System
**Status:** 🟢 IMPORTANT - Need to collect feedback
**Estimate:** 1-2 hours
**Severity:** MEDIUM

**Options:**

**Option A: In-App Feedback (Recommended)**
- Add "Send Feedback" button in Settings
- Opens email with pre-filled template
- Includes device info, app version, user ID

**Option B: External Form**
- Google Form or Typeform
- Link in app + in TestFlight notes

**Option C: Discord/Slack Community**
- Create private Discord server for beta testers
- Easier for async discussion and bug reporting

**Recommendation:** Option A + Option C (in-app + Discord)

**Files to Create/Modify:**
- `src/components/molecules/SettingsModal.tsx` (add feedback button)
- Discord server setup (external)

**Success Criteria:**
- Testers can easily submit feedback
- You receive notifications when feedback arrives
- Feedback includes enough context to debug issues

---

#### ✅ Task 4.3: Recruit Beta Testers
**Status:** 🟢 REQUIRED - Need users to test
**Estimate:** 4-6 hours (outreach + onboarding)
**Severity:** CRITICAL - No test, no launch

**Target:** 20-50 beta testers (musicians, band members)

**Where to Recruit:**

**Personal Network (Target: 10-15 testers)**
- Friends who are in bands
- Local music scene contacts
- Previous bandmates

**Online Communities (Target: 10-20 testers)**
- Reddit: /r/WeAreTheMusicMakers, /r/Bandmembers, /r/independentmusic
- Facebook Groups: Local musician groups, indie musician communities
- Discord: Music production servers, songwriter communities
- Gearspace forums, VI-Control forums

**Outreach Template:**
```
Subject: Help test CoreTet - A new app for band collaboration

Hey [Name],

I've built an app for bands to share demos, get feedback, and organize set lists.
It's basically Dropbox + Slack, but designed specifically for musicians.

I'm looking for 20-30 beta testers to try it out and give honest feedback before
I launch publicly. Would you (and your band) be interested?

What you'd do:
- Use the app for 2-4 weeks
- Upload a few tracks, invite your bandmates
- Share what works, what's confusing, and what's broken

What you'd get:
- Free Standard tier for 6 months ($45 value)
- Early access to all new features
- Direct input on what gets built next

Interested? Reply and I'll send you a TestFlight invite.

Thanks,
Eric
```

**Success Criteria:**
- 20+ committed beta testers
- Mix of solo artists and bands (2-5 members)
- At least 3 active bands (uploading tracks regularly)

---

#### ✅ Task 4.4: Write Beta Launch Email/Announcement
**Status:** 🟢 IMPORTANT - Set expectations
**Estimate:** 1 hour
**Severity:** MEDIUM

**Email Template for Beta Testers:**
```
Subject: Welcome to CoreTet Beta! 🎸

Hey [Name],

Thanks for joining the CoreTet beta! You're one of 30 musicians helping shape
this app before it launches to the world.

** What is CoreTet? **
CoreTet is a band collaboration app that helps you:
- Share demos with your bandmates
- Get timestamped feedback on specific moments
- Organize set lists with version control
- See who's actually listened to each track

** What we need from you: **
1. Use it for real - Upload your actual demos, invite your bandmates
2. Be brutally honest - If something sucks, tell me. I can't fix it if I don't know.
3. Report bugs - Screenshot + describe what happened
4. Suggest improvements - What's missing? What would make this perfect?

** How to give feedback: **
- In-app: Settings → Send Feedback
- Discord: [invite link]
- Email: eric@coretet.com

** Known Issues: **
- [List 2-3 known bugs you're working on]

** Beta Timeline: **
- Now - Jan 15: Beta testing period
- Jan 20: Public launch on App Store

Let's make something great. Thanks for being part of this!

Eric
```

**Success Criteria:**
- Clear expectations set
- Testers know how to provide feedback
- Testers understand timeline

---

### ✅ Priority 5: Documentation & Polish (Week 3)

#### ✅ Task 5.1: Update Privacy Policy & Terms
**Status:** 🟡 LEGAL - Required for App Store
**Estimate:** 2-3 hours
**Severity:** HIGH

**Current State:**
- May have placeholder privacy policy
- Needs to be accurate for launch

**What to Include:**
1. **Privacy Policy:**
   - What data you collect (email, name, audio files)
   - How you use it (app functionality only)
   - Third parties (Supabase, Stripe, Twilio)
   - User rights (delete account, export data)
   - GDPR/CCPA compliance

2. **Terms of Service:**
   - User responsibilities (don't upload copyrighted music)
   - Service availability (best-effort, no guarantees)
   - Billing terms (subscriptions, refunds)
   - Termination policy

**Tools:**
- Use generator: [Termly](https://termly.io/products/privacy-policy-generator/)
- Have lawyer review (optional but recommended)

**Files to Create/Modify:**
- `public/privacy-policy.html`
- `public/terms-of-service.html`
- Link in app Settings + website

**Success Criteria:**
- Privacy policy covers all data practices
- Terms protect you legally
- Links accessible from app

---

#### ✅ Task 5.2: Prepare App Store Assets
**Status:** 🟡 REQUIRED - Needed for TestFlight + App Store
**Estimate:** 3-4 hours
**Severity:** HIGH

**What You Need:**

**App Icon:**
- 1024x1024 PNG (no alpha channel)
- Simple, recognizable at small sizes
- Represents "band collaboration" concept

**Screenshots (per device size):**
- 6.9" Display (iPhone 16 Pro Max) - Required
- 6.7" Display (iPhone 15 Pro Max) - Recommended
- 5.5" Display (iPhone 8 Plus) - Optional

**Screenshot Content (5-8 images):**
1. Onboarding/welcome screen
2. Track list view
3. Playing a track with comments
4. Version selector (Hero System)
5. Set list view
6. Creating/managing a band

**App Preview Video (Optional but Recommended):**
- 15-30 seconds
- Show core workflow: Upload → Comment → Organize

**App Description:**
- Title (30 characters): "CoreTet - Band Collaboration"
- Subtitle (30 characters): "Demos, feedback, set lists"
- Description (4000 characters):
  - What it does
  - Who it's for
  - Key features
  - Call to action

**Tools:**
- Screenshot mockups: Use Figma or [Mockuuups](https://mockuuups.studio/)
- Video: Screen.Studio or Descript
- Icon: Hire on Fiverr ($20-50) or use Canva

**Success Criteria:**
- All required assets created
- Screenshots show app in best light
- App icon is professional quality

---

#### ✅ Task 5.3: Set Up Analytics & Crash Reporting
**Status:** 🟢 IMPORTANT - Need visibility into usage
**Estimate:** 2 hours
**Severity:** MEDIUM

**What to Track:**

**Analytics (PostHog, Mixpanel, or Amplitude):**
- User signups
- Track uploads
- Comments posted
- Set lists created
- Version groups created
- Subscription conversions

**Crash Reporting (Sentry):**
- JavaScript errors
- Network failures
- Database query failures

**Implementation:**
1. Install analytics library
2. Track key events
3. Set up dashboards
4. Test events fire correctly

**Success Criteria:**
- Can see user activity in real-time
- Crashes reported automatically
- Funnel metrics visible (signup → upload → invite)

---

## Summary Timeline

### Week 1 (Dec 18-24): Core Functionality
- ✅ Task 1.1: Wire up version playback (1-2 hours)
- ✅ Task 1.2: Build Stripe billing (8-12 hours)
- ✅ Task 1.3: Remove DEV labels (30 min)
- ✅ Task 1.4: Fix preview bug (15 min)

**Total Time:** 10-15 hours
**Goal:** App is functionally complete

---

### Week 2 (Dec 25-31): UX & Testing
- ✅ Task 2.1: Listened indicator (2-3 hours)
- ✅ Task 2.2: Keywords UI (3-4 hours)
- ✅ Task 3.1: Manual testing (4-6 hours)
- ✅ Task 3.2: Fix bugs (4-8 hours)
- ✅ Task 4.1: Set up TestFlight (2-3 hours)

**Total Time:** 15-24 hours
**Goal:** App is tested and beta-ready

---

### Week 3 (Jan 1-7): Beta Launch
- ✅ Task 4.2: Feedback system (1-2 hours)
- ✅ Task 4.3: Recruit testers (4-6 hours)
- ✅ Task 4.4: Beta announcement (1 hour)
- ✅ Task 5.1: Privacy policy (2-3 hours)
- ✅ Task 5.2: App Store assets (3-4 hours)
- ✅ Task 5.3: Analytics setup (2 hours)

**Total Time:** 13-18 hours
**Goal:** Beta testers have app, feedback flowing

---

## Total Effort Estimate

**Minimum:** 38 hours (optimistic, no bugs)
**Maximum:** 57 hours (realistic, with bug fixes)
**Average:** ~47 hours over 3 weeks (~16 hours/week, ~2-3 hours/day)

---

## Decision Points

### Can We Skip Anything?

**Absolutely Required (Cannot Skip):**
- ✅ Task 1.1: Version playback (core feature broken)
- ✅ Task 1.2: Billing system (no revenue otherwise)
- ✅ Task 3.1-3.2: Testing + bug fixes (avoid embarrassment)
- ✅ Task 4.1: TestFlight setup (distribution mechanism)
- ✅ Task 4.3: Recruit testers (need users)
- ✅ Task 5.1: Privacy policy (legal requirement)

**Nice to Have (Can Defer to Post-Beta):**
- ⚠️ Task 2.1: Listened indicator (MVP feature, but not blocking)
- ⚠️ Task 2.2: Keywords UI (MVP feature, but not blocking)
- ⚠️ Task 2.3: Improve empty states (polish)
- ⚠️ Task 5.2: App Store assets (can use basic screenshots initially)
- ⚠️ Task 5.3: Analytics (helpful but not required for beta)

**Minimum Viable Beta (If Time-Constrained):**
1. Wire up version playback (1-2 hours)
2. Build billing system (8-12 hours)
3. Test everything manually (4-6 hours)
4. Fix critical bugs (4-8 hours)
5. Set up TestFlight (2-3 hours)
6. Recruit 20 testers (4-6 hours)

**Total:** 23-37 hours (doable in 2 weeks at ~12-18 hours/week)

---

## Next Steps

**Eric, let me know:**
1. Does this timeline feel realistic for you? (3 weeks, ~16 hours/week)
2. Which tasks feel most daunting or unclear?
3. Should we start with Task 1.1 (version playback) right now?
4. Do you want to defer any "Nice to Have" tasks to post-beta?

Once you confirm, we can start tackling these one by one. I recommend starting with version playback (quick win, high impact), then diving into billing (biggest time investment).

Ready to get started? 🚀
