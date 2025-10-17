# Phase 1 RLS Testing Checklist
**Date**: 2025-10-16
**What Changed**: Re-enabled Row-Level Security on tracks with permissive policies
**Expected Impact**: NONE - Everything should work exactly as before

---

## 🎯 Testing Instructions

We've enhanced security without changing functionality. Please test the following workflows to confirm everything still works:

### ✅ CRITICAL: Test These First

#### 1. View Band Tracks
- [ ] Open Band tab
- [ ] Can you see all your band's tracks? (Should see same as before)
- [ ] Try playing a track - does it play?
- [ ] Try viewing a playlist - do you see all tracks?

#### 2. View Personal Tracks
- [ ] Open Personal tab
- [ ] Can you see your personal tracks? (If you have any)
- [ ] Can you view personal playlists?

#### 3. Upload New Track
- [ ] Try uploading a new audio file
- [ ] Does it appear in your tracks list?
- [ ] Can you add it to a playlist?

#### 4. Edit Track
- [ ] Try editing a track title or metadata
- [ ] Does the change save?
- [ ] Does it appear updated?

#### 5. Delete Track
- [ ] Try deleting a test track (create one first if needed)
- [ ] Does it disappear from your list?
- [ ] Does it remove from playlists?

#### 6. Playlist Sharing
- [ ] Open a playlist shared with you
- [ ] Can you see all the tracks in it?
- [ ] Can you play tracks from followed playlists?

#### 7. Comments & Ratings
- [ ] Try adding a comment to a track
- [ ] Try rating a track (listened/liked/loved)
- [ ] Do they save correctly?

---

## 🚨 What to Report

### 🔴 URGENT - Report Immediately:
- Missing tracks (you used to see them, now you don't)
- Can't upload tracks
- Can't edit/delete your own tracks
- Playlists appear empty
- App crashes or freezes
- "Permission denied" or "406 error" messages

### 🟡 MEDIUM - Report When Convenient:
- Slower performance
- Anything that feels "off"
- Unexpected behavior

### 🟢 LOW - Nice to Know:
- Everything works perfectly! (Please confirm this too)

---

## 📝 Reporting Template

If you find an issue, please report:

```
ISSUE: [Brief description]
SEVERITY: [URGENT / MEDIUM / LOW]

WHAT I WAS DOING:
[Step by step what you did]

WHAT HAPPENED:
[What went wrong]

WHAT I EXPECTED:
[What should have happened]

SCREENSHOTS:
[If applicable]
```

---

## ⏱️ Testing Timeline

Please complete this testing within **24-48 hours** so we can:
- Fix any issues quickly
- Move forward with additional security improvements
- Keep the app safe for all users

---

## ✅ Tester Sign-off

After testing, please confirm:

- [ ] I tested all critical workflows above
- [ ] Everything works as expected
- [ ] I reported any issues found
- [ ] App feels as responsive as before

**Tester Name**: _________________
**Date Tested**: _________________
**Device**: _________________
**Any Issues?**: YES / NO

If YES, describe: _________________

---

## 🙏 Thank You!

Your testing helps ensure we can:
- Add security without breaking features
- Protect everyone's content
- Expand to more testers safely

Questions? Contact: [Your contact info]
