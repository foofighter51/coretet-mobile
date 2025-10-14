# Band Invite Flow - UX Redesign

## Current Problems

### Issue 1: Links Open in Browser, Not App
- User clicks `https://coretet.app/invite/TOKEN`
- Opens in Safari/Chrome instead of CoreTet app
- Universal Links not configured

### Issue 2: No Clear Path for New Users
- If not logged in: Shows "You must be logged in" error
- No sign-up option on invite page
- No app download prompt
- User has to figure out next steps themselves

### Issue 3: Existing Users Without App
- Logged-in web users can't use app features
- No prompt to download mobile app
- Disconnect between web and mobile experience

### Issue 4: Confusing User Journey
```
Invite Link → Web Browser → Error/Dead End
           ↓
       User confused, doesn't join band
```

## Proposed Solution: Smart Invite Landing Page

### New Flow - Option A: "Download First" (Recommended)

```
1. User clicks invite link
   ↓
2. Lands on smart invite page
   ↓
3. Page detects: New user or no app installed
   ↓
4. Shows:
   - Band info (name, inviter)
   - "Download CoreTet to join [Band Name]"
   - App Store / TestFlight button
   - Preview of what they'll get (screenshots)
   ↓
5. User downloads app
   ↓
6. Opens app → Auto-detects pending invite via deep link
   ↓
7. Sign up flow → Auto-accepts invite → Sees band content
```

### New Flow - Option B: "Sign Up First, Then Download"

```
1. User clicks invite link
   ↓
2. Lands on invite page
   ↓
3. If not logged in:
   - Shows band preview
   - "Sign up to join [Band Name]"
   - Email/password or phone signup form
   - "Already have account? Log in"
   ↓
4. User signs up/logs in
   ↓
5. Shows success + download prompt:
   - "You're in! Download the app to access [Band Name]"
   - App Store / TestFlight button
   - "Or continue on web" (limited features)
   ↓
6. User downloads app → Already logged in → Sees band
```

## Recommended Approach: Hybrid

### Smart Detection Logic:

```typescript
On AcceptInvite page:

1. Check user agent:
   - iOS/Android → Show "Download App" CTA first
   - Desktop → Show "Sign up to join" with web option

2. Check authentication:
   - Not logged in → Show signup/login
   - Logged in → Auto-accept invite, show success

3. Check if app installed (via Universal Links):
   - App installed → Deep link directly to app
   - No app → Show download prompt
```

## Implementation Plan

### Phase 1: Improve AcceptInvite Page (Quick Fix)

**Changes to AcceptInvite.tsx:**

```typescript
// Instead of error for not logged in:
if (!user) {
  return (
    <InviteSignupFlow
      inviteToken={token}
      bandName={invite?.bands?.name}
      inviterName={invite?.profiles?.name}
    />
  );
}
```

**New Component: InviteSignupFlow**
- Shows band preview (non-authenticated)
- Email/password signup form
- Phone signup option
- "Already have account? Log in" link
- Auto-accepts invite after signup

### Phase 2: Add App Download Prompt

**After successful signup/login:**
```typescript
if (isMobile && !isInApp) {
  return (
    <DownloadAppPrompt
      message="Download CoreTet to access your band"
      ctaText="Get the App"
      continueWebText="Continue on web (limited features)"
    />
  );
}
```

### Phase 3: Universal Links (iOS)

**Configure Apple App Site Association:**
```json
// .well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAM_ID.com.coretet.app",
      "paths": ["/invite/*", "/playlist/*"]
    }]
  }
}
```

**Configure in Xcode:**
- Add Associated Domains capability
- Add `applinks:coretet.app`

**Handle in App.tsx:**
```typescript
App.addListener('appUrlOpen', (event) => {
  const url = event.url;
  if (url.includes('/invite/')) {
    // Extract token, navigate to invite acceptance
  }
});
```

### Phase 4: Deep Link Integration

**Update invite link generation:**
```typescript
// In CreateInvite.tsx
const inviteLink = isNative
  ? `coretet://invite/${token}`  // Deep link for app-to-app
  : `https://coretet.app/invite/${token}`;  // Universal link for sharing
```

## User Journeys - After Implementation

### Journey 1: New User on iOS
1. Clicks invite link → Opens in Safari
2. Sees: "Join [Band] on CoreTet" + band preview
3. Taps "Download App" → App Store/TestFlight
4. Downloads app → Opens
5. Prompted to sign up with email/phone
6. After signup → Automatically joins band
7. Sees band content immediately

### Journey 2: Existing User on iOS (App Installed)
1. Clicks invite link → Universal Link triggers
2. Opens directly in CoreTet app (not Safari!)
3. Shows accept invite dialog
4. Taps "Accept" → Joins band
5. Sees band content

### Journey 3: Existing User on Desktop
1. Clicks invite link → Opens in browser
2. Already logged in → Auto-accepts
3. Shows: "Invite accepted! Download mobile app for full experience"
4. Can view band content on web (limited features)

### Journey 4: New User on Desktop
1. Clicks invite link → Opens in browser
2. Shows signup form + band preview
3. Signs up with email/password
4. Auto-accepts invite
5. Shows: "Download mobile app to collaborate"
6. Can browse on web

## Required Changes

### 1. AcceptInvite.tsx
- [ ] Remove "must be logged in" error
- [ ] Add signup/login UI for unauthenticated users
- [ ] Add platform detection (iOS/Android/Desktop)
- [ ] Add app download prompt after login
- [ ] Show band preview before authentication

### 2. LandingPage.tsx
- [ ] Add invite-aware routing (preserve token)
- [ ] Handle post-signup redirect to invite acceptance

### 3. CreateInvite.tsx
- [ ] Generate universal links (https://) instead of deep links (coretet://)
- [ ] Add copy with instructions: "Share this link with your bandmates"

### 4. App.tsx (iOS/Android)
- [ ] Add Universal Link listener
- [ ] Handle `/invite/:token` paths
- [ ] Navigate to invite acceptance in-app

### 5. Backend (Netlify)
- [ ] Add `.well-known/apple-app-site-association`
- [ ] Configure for Universal Links

### 6. Xcode Project
- [ ] Add Associated Domains capability
- [ ] Configure `applinks:coretet.app`

## Success Metrics

After implementation, measure:
- **Invite → Download Rate**: % of invited users who download app
- **Invite → Signup Rate**: % of invited users who complete signup
- **Invite → Band Join Rate**: % who successfully join the band
- **Time to Complete**: Average time from click to band access
- **Drop-off Points**: Where users abandon the flow

## Priority: HIGH

**Why:** Invite system is core to band collaboration. If users can't easily join, the entire product fails.

**Effort:**
- Phase 1 (Signup flow): 2-3 hours
- Phase 2 (Download prompt): 1 hour
- Phase 3 (Universal Links): 2-3 hours
- Phase 4 (Deep links): 1-2 hours

**Total:** ~8 hours for complete solution

---

**Created:** 2025-10-14
**Status:** Planning
