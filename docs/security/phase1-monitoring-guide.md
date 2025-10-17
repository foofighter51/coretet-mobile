# Phase 1 Monitoring Guide - 7 Day Watch Period
**Start Date**: 2025-10-16
**End Date**: 2025-10-23
**What We're Monitoring**: Tracks RLS performance and issues

---

## 📊 Daily Monitoring Tasks

### Day 1-2: CRITICAL Monitoring (Check 2-3x per day)

**In Supabase Dashboard → Logs:**
```
Search for:
- "permission denied"
- "406"
- "RLS"
- "tracks"
```

**In Supabase Dashboard → Database → Tracks Table:**
- Verify count is still 235
- Check for any orphaned records

**Check with Testers:**
- "Have you noticed any issues with tracks or playlists?"
- "Is everything working normally?"

---

### Day 3-7: NORMAL Monitoring (Check 1x per day)

**Quick Health Check:**
```sql
-- Run in Supabase SQL Editor
-- Should match baseline: 235, 223, 12, 184

SELECT
  (SELECT COUNT(*) FROM tracks) as total_tracks,
  (SELECT COUNT(*) FROM tracks WHERE band_id IS NOT NULL) as band_tracks,
  (SELECT COUNT(*) FROM tracks WHERE band_id IS NULL) as personal_tracks,
  (SELECT COUNT(DISTINCT track_id) FROM playlist_items) as tracks_in_playlists;
```

**Expected Results:**
| Metric | Expected | Alert If |
|--------|----------|----------|
| total_tracks | 235+ | < 235 |
| band_tracks | 223+ | < 223 |
| personal_tracks | 12+ | < 12 |
| tracks_in_playlists | 184+ | < 184 |

---

## 🚨 Issues to Watch For

### CRITICAL (Fix Immediately):
- [ ] Track count drops below baseline
- [ ] Users report missing tracks
- [ ] Upload failures
- [ ] 406 errors in logs
- [ ] "Permission denied" errors

**Action**: Run rollback script immediately, investigate

---

### HIGH (Fix Within 24 Hours):
- [ ] Slower query performance
- [ ] Increased database load
- [ ] Any RLS-related errors in logs

**Action**: Investigate, optimize policies if needed

---

### MEDIUM (Monitor & Fix This Week):
- [ ] User confusion about missing tracks (may be intentional isolation)
- [ ] Performance degradation

**Action**: Document, plan fix for Phase 2

---

## 📈 Performance Monitoring

### Baseline Performance (Before RLS):
```sql
-- Run to establish baseline query time
EXPLAIN ANALYZE
SELECT * FROM tracks
WHERE band_id = '5184117c-ec73-4626-b1d6-36e9db334004'
LIMIT 50;
```

**Save the execution time** and compare after 1 week.

### After RLS (Day 7):
Run same query. Execution time should be similar (within 50ms).

---

## ✅ Success Criteria for Moving to Phase 2

After 7 days, we proceed to Phase 2 ONLY if:

- [ ] Zero critical issues reported
- [ ] All track counts match or exceed baseline
- [ ] No user complaints about missing content
- [ ] Performance is acceptable (< 50ms slower)
- [ ] All testers confirm app works normally
- [ ] No RLS errors in logs

**If ANY checkbox is unchecked**: Investigate and fix before Phase 2

---

## 📝 Daily Log Template

Keep notes each day:

```
=== Day 1 (2025-10-16) ===
- Checked logs: ✅ No errors
- Track counts: ✅ 235/223/12/184
- Tester feedback: [Notes]
- Issues found: [None/List]
- Action taken: [None/Describe]

=== Day 2 (2025-10-17) ===
...
```

---

## 🎯 What Happens After 7 Days

### If Everything is Good ✅
1. Document success
2. Plan Phase 2 (tighten personal tracks policy)
3. Schedule Phase 2 deployment

### If Issues Found 🔴
1. Document all issues
2. Roll back if critical
3. Fix policies in development
4. Restart Phase 1 with corrected policies

---

## 🔧 Useful Supabase Queries

### Check RLS Policy Usage
```sql
-- See which policies are being used
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'tracks'
ORDER BY policyname;
```

### Find Tracks That Might Have Access Issues
```sql
-- Tracks with no band and no creator (shouldn't exist, but check)
SELECT id, title, created_by, band_id
FROM tracks
WHERE created_by IS NULL OR (band_id IS NULL AND created_by IS NULL);
```

### Check for Failed Queries (if you have query stats enabled)
```sql
-- Look for failed track queries (if logging is enabled)
-- This depends on your Supabase plan and logging setup
```

---

## 📞 Escalation

**If Critical Issue Found:**
1. Run rollback script: `supabase/rollback_scripts/rollback_tracks_rls.sql`
2. Notify testers: "We temporarily reverted a security update"
3. Document what broke
4. Fix in development
5. Re-test before re-applying

**Rollback is Safe**: It just returns to the previous (insecure but functional) state.

---

## ✅ Day 7 Checklist

After 7 days of successful monitoring:

- [ ] Run final verification queries
- [ ] Get tester confirmation (all working)
- [ ] Check performance metrics
- [ ] Review any issues found and resolved
- [ ] Document lessons learned
- [ ] **Ready for Phase 2** ✅

---

**Monitoring Start**: 2025-10-16
**Expected Completion**: 2025-10-23
**Next Phase**: Tighten personal tracks policy
