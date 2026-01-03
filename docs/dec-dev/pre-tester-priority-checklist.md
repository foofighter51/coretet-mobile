# Pre-Tester Release Checklist
## CoreTet Band - Ship-Blocking Issues Only

**Philosophy:** Fix what testers will notice. Defer what they won't. Refactor after you have real feedback.

---

## 🔴 PHASE A: Fix Before Testers (Do This Now)

These are user-facing issues that will affect tester experience.

---

### A1. Fix AuthContext Form State (1-2 hours)
**Problem:** Form inputs (email, password, code) stored in Context cause app-wide re-renders on every keystroke. Users may notice input lag.

```
In AuthContext.tsx, the form input state (email, password, verificationCode, userName) is causing re-renders across the entire app on every keystroke.

Refactor to:
1. Keep ONLY these in AuthContext: currentUser, authLoading, currentError
2. Move email, password, verificationCode, userName to local state in PhoneAuthScreen and OnboardingScreen components
3. Pass values to auth functions as parameters instead of reading from context

Make this change now, keeping all existing functionality working.
```

---

### A2. Add Error Boundaries (1 hour)
**Problem:** Unhandled errors cause white screen crashes. Testers will see this.

```
Add React Error Boundaries to prevent white-screen crashes:

1. Create src/components/ErrorBoundary.tsx with:
   - Catches render errors
   - Shows user-friendly "Something went wrong" message
   - Has "Try Again" button that resets state
   - Logs error details to console (for now)

2. Wrap these routes/components with ErrorBoundary:
   - MainDashboard
   - FeedbackDashboard
   - AcceptInvite
   - Any screen that fetches data

3. Add a top-level ErrorBoundary in App.tsx as final fallback

Keep it simple - we just need crash protection, not elaborate error UI.
```

---

### A3. Audit Critical User Flows for Crashes (1-2 hours)
**Problem:** Need to ensure core flows don't crash.

```
Test and fix error handling for these critical user flows:

1. **Authentication Flow**
   - What happens if network fails during phone verification?
   - What happens if verification code is wrong 3 times?
   - What happens if session expires mid-use?
   - Add try/catch and user-friendly error messages for each

2. **Playlist Creation Flow**
   - What happens if playlist creation API fails?
   - What happens if you try to add a track that was deleted?
   - Add loading states and error recovery

3. **Audio Playback Flow**
   - What happens if audio file URL is expired/invalid?
   - What happens if network drops mid-playback?
   - Add error state with retry option

For each issue found, implement graceful error handling with user-visible feedback (not just console.log).
```

---

### A4. Prevent Double-Tap Crashes (30 min)
**Problem:** Rapid button taps can cause race conditions and duplicate submissions.

```
Add double-tap prevention to all critical action buttons:

1. Find all buttons that trigger API calls or navigation
2. Add loading/disabled state while action is in progress
3. Key areas to check:
   - Create playlist button
   - Upload track button
   - Send invite button
   - Sign in/Sign up buttons
   - Any delete confirmations

Use a simple pattern:
- Set loading=true before async action
- Set loading=false in finally block
- Disable button while loading=true
```

---

### A5. Verify Offline Behavior Doesn't Crash (30 min)
**Problem:** Network loss shouldn't crash the app.

```
Test what happens when network is unavailable:

1. Check each API call in MainDashboard, AuthContext, SetListContext, BandContext
2. Ensure all fetch/supabase calls have try/catch
3. For missing error handling, add:
   - User-visible error message (toast or inline)
   - Retry option where appropriate
   - Graceful degradation (show cached data if available)

We don't need full offline support - just ensure no crashes and clear feedback.
```

---

### A6. Downgrade Tailwind to Stable (30 min)
**Problem:** Running Tailwind v4 alpha in production is risky.

```
Downgrade Tailwind CSS from v4.0.0-alpha.5 to latest stable v3.x:

1. Update package.json: "tailwindcss": "^3.4.0"
2. Run npm install
3. Check for any v4-specific syntax that needs adjustment
4. Verify app still renders correctly
5. Fix any broken styles

If this causes significant breakage, document issues and we can defer, but try first.
```

---

## 🟡 PHASE B: Quick Wins If Time Permits

These improve experience but aren't blockers.

---

### B1. Add Loading Skeletons to Main Views (30 min)

```
Add simple loading states to prevent content flash:

1. MainDashboard - Show skeleton while playlists load
2. FeedbackDashboard - Show skeleton while feedback loads
3. Track lists - Show placeholder rows while tracks load

Use simple gray placeholder boxes, nothing fancy. Just prevent jarring content pop-in.
```

---

### B2. Console.log Cleanup (15 min)

```
Find and clean up console statements before tester release:

1. List all console.log, console.error, console.warn in the codebase
2. Remove debug logs (e.g., "fetching data...", variable dumps)
3. Keep meaningful error logs but ensure they don't expose sensitive data
4. Replace console.error with proper error handling where needed
```

---

### B3. Check Empty States Exist (30 min)

```
Verify every list/data view has an empty state:

1. Playlist list when user has no playlists - should show "Create your first playlist"
2. Track list when playlist is empty - should show "Add tracks to get started"
3. Band list when user has no bands - should show appropriate CTA
4. Feedback list when no feedback exists

For any missing empty states, add simple helpful message with action button.
```

---

## ⏸️ PHASE C: Defer Until After Tester Feedback

**Do not do these now.** Wait for real user feedback.

---

### Deferred: MainDashboard Refactor
**Why defer:** 2,000-line refactor risks introducing bugs. If it works, ship it. Refactor after you know which features matter.

```
SAVE FOR LATER - Do not run this prompt yet.

After tester feedback, split MainDashboard.tsx into:
- PlaylistListView.tsx
- PlaylistDetailView.tsx  
- hooks/useAudioPlayer.ts
- hooks/useTrackRatings.ts
- hooks/usePlaylistManager.ts
- AudioPlayerContext.tsx
```

---

### Deferred: useCallback Optimization
**Why defer:** Only fix if testers report lag. React is often faster than expected.

```
SAVE FOR LATER - Only if testers report performance issues.

Add useCallback to event handlers in MainDashboard that are passed to child components or used in lists.
```

---

### Deferred: Inline Styles → CSS System
**Why defer:** Cosmetic. Testers won't notice. Do after launch stabilizes.

```
SAVE FOR LATER - Post-beta cleanup.

Migrate inline styles to CSS Modules or Tailwind classes.
```

---

### Deferred: Bundle Size Optimization
**Why defer:** Only matters if load time is noticeably bad.

```
SAVE FOR LATER - Only if testers complain about load times.

Implement code splitting with React.lazy for heavy routes.
```

---

## 📋 Pre-Tester Final Checklist

Run through manually before sending to testers:

### Device Testing
- [ ] Test on real iOS device (not just simulator)
- [ ] Test on real Android device
- [ ] Test on slow network (throttle in dev tools)
- [ ] Test with airplane mode toggle

### Critical Flows
- [ ] Fresh signup → create first playlist → add track → play track
- [ ] Login with existing account
- [ ] Accept band invite flow
- [ ] Share playlist flow
- [ ] Audio plays without errors
- [ ] All navigation back buttons work

### Error Scenarios
- [ ] Wrong password shows clear error
- [ ] Network failure shows error (not crash)
- [ ] Invalid invite link handled gracefully
- [ ] Expired session redirects to login

### Basic Polish
- [ ] No console errors in browser dev tools during normal use
- [ ] No stuck loading spinners
- [ ] All buttons respond to taps
- [ ] Keyboard dismisses appropriately

---

## 🐛 Known Issues to Document for Testers

Create a "Known Issues" doc to set expectations:

```
List any issues you're aware of but deferring:

1. [Example] Large playlists (100+ tracks) may show slight scroll lag
2. [Example] Dark mode has some inconsistent colors on settings screen
3. [Add your known issues here]

Share this with testers so they focus on NEW bugs, not known debt.
```

---

## Post-Tester Feedback Prompts

Save these for after you get feedback:

### After Feedback: Prioritized Bug Fixes
```
Here is the feedback from testers: [paste feedback]

Categorize into:
1. Crashes/blockers - fix immediately
2. Broken features - fix before next build
3. UX friction - fix if time permits
4. Feature requests - log for later
5. Won't fix - explain why

Then fix category 1 and 2 issues.
```

### After Feedback: Performance Investigation
```
Testers reported slowness in [specific area].

Profile this component/flow and identify:
1. What's causing the slowdown?
2. Is it render-related (add memoization) or data-related (optimize queries)?
3. Implement the minimal fix needed.
```

---

## Time Estimate Summary

| Phase | Tasks | Time |
|-------|-------|------|
| A (Required) | Auth fix, Error boundaries, Flow audit, Double-tap, Offline, Tailwind | ~5-6 hours |
| B (If time) | Loading states, Console cleanup, Empty states | ~1-1.5 hours |
| C (Defer) | MainDashboard refactor, useCallback, Styles, Bundle | Post-beta |

**Target:** Complete Phase A, ship to testers, iterate based on real feedback.
