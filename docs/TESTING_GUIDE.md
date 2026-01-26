# Storage Quota Testing Guide

## Overview

This guide explains how to use the automated testing system for the storage quota bug fixes. The test suite validates all 5 critical fixes applied to `audioUploadService.ts` and `lib/supabase.ts`.

---

## Quick Start

### 1. Install Test Dependencies

```bash
npm install --save-dev vitest @vitest/ui happy-dom @testing-library/react
```

### 2. Run Unit Tests (Safe - Mocked Data)

```bash
npm run test:storage-quota
```

This runs all unit tests with mocked data. **Safe to run anytime** - no database modifications.

### 3. Run Integration Tests (Real Database)

```bash
# Set your test user ID (use a TEST environment!)
export SUPABASE_TEST_USER_ID='user_xxx'

# Run integration tests
npm run test:storage-quota:integration
```

**⚠️ WARNING**: Integration tests modify real database data. Only use with TEST/STAGING environments!

---

## Test Commands

| Command | Description | Safe? |
|---------|-------------|-------|
| `npm run test:storage-quota` | Run unit tests only | ✅ Yes (mocked) |
| `npm run test:storage-quota:integration` | Run integration tests | ⚠️ No (real DB) |
| `npm run test:storage-quota:all` | Run both unit & integration | ⚠️ No (real DB) |
| `npm run test:storage-quota:watch` | Run tests in watch mode | ✅ Yes (mocked) |
| `npm run test:storage-quota:coverage` | Generate coverage report | ✅ Yes (mocked) |

---

## What Gets Tested

### Fix #1: Storage Quota Check Before Upload

**Validates:**
- Upload is rejected when quota would be exceeded
- Detailed error message with usage stats
- Upload proceeds when quota is sufficient
- Progress callback shows quota check stages

**Test Cases:**
1. Upload with insufficient quota → rejection
2. Upload with sufficient quota → success
3. Error message includes current usage, file size, and total

### Fix #2: Storage Quota Increment After Upload

**Validates:**
- `storage_used` is incremented after successful upload
- Atomic SQL with `COALESCE(storage_used, 0) + file_size`
- Non-blocking behavior (logs error but doesn't fail upload)

**Test Cases:**
1. Successful upload → quota incremented
2. Failed quota update → upload still succeeds (logged)
3. Multiple uploads → cumulative quota increase

### Fix #3: Delete Method - File Path Extraction & Quota Decrement

**Validates:**
- Correct file path extraction from signed URLs
- File deleted from Supabase Storage
- `storage_used` decremented by file size
- Atomic SQL with `GREATEST(COALESCE(storage_used, 0) - file_size, 0)`

**Test Cases:**
1. Signed URL format → correct path extraction
2. Public URL format → fallback path extraction
3. Storage deletion failure → DB deletion still proceeds
4. Quota decrement uses atomic SQL (never negative)

### Fix #4: Batch Upload Error Handling

**Validates:**
- Return type includes `successful` and `failed` arrays
- Failed uploads include filename, error, and size
- Progress callback shows errors to user
- Partial success handling (some files succeed, others fail)

**Test Cases:**
1. All uploads succeed → `failed` array empty
2. Mixed results → both arrays populated
3. All uploads fail → `successful` array empty
4. Progress shows summary: "3/5 uploaded, 2 failed"

### Fix #5: Edge Cases & Data Integrity

**Validates:**
- NULL `storage_used` handled gracefully
- Never allows negative `storage_used`
- Cleanup on transaction failures
- Atomic operations prevent race conditions

**Test Cases:**
1. NULL quota → treated as 0
2. Decrement larger than current → results in 0, not negative
3. Upload succeeds but DB save fails → cleanup uploaded file
4. Concurrent operations → atomic SQL prevents corruption

---

## Test Output Examples

### Unit Test Output (Passing)

```
✓ src/utils/__tests__/audioUploadService.test.ts (25 tests)
  ✓ Fix #1: Storage Quota Check Before Upload (3)
    ✓ should reject upload when quota would be exceeded
    ✓ should allow upload when quota is sufficient
    ✓ should show detailed error message with usage stats
  ✓ Fix #2: Storage Quota Increment After Upload (2)
    ✓ should increment storage quota after successful upload
    ✓ should not fail upload if quota update fails (non-blocking)
  ✓ Fix #3: Delete Method - File Path Extraction & Quota Decrement (4)
    ✓ should extract file path from signed URL correctly
    ✓ should decrement storage quota after deletion
    ✓ should handle public URL format as fallback
    ✓ should continue with DB deletion even if storage deletion fails
  ✓ Fix #4: Batch Upload Error Handling (2)
    ✓ should return both successful and failed uploads
    ✓ should show progress for each file including failures
  ✓ Fix #5: Edge Cases & Data Integrity (3)
    ✓ should handle null storage_used gracefully (COALESCE)
    ✓ should never allow negative storage_used (GREATEST)
    ✓ should clean up uploaded file if database save fails

Test Files  1 passed (1)
     Tests  25 passed (25)
  Start at  14:30:15
  Duration  2.34s

📊 Test report: test-results/unit-tests.html
```

### Integration Test Output (Passing)

```
✓ tests/integration/storage-quota-integration.test.ts (6 tests)
  ✓ should upload file and increment quota correctly
    📊 Quota increment:
      before: 125.5 MB
      after: 126.5 MB
      expected: 1 MB
      actual: 1 MB
  ✓ should reject upload when quota would be exceeded
  ✓ should delete file and decrement quota correctly
    📊 Quota decrement:
      afterUpload: 128.5 MB
      afterDelete: 126.5 MB
      expected: 2 MB
      actual: 2 MB
  ✓ should handle batch upload with mixed results
    📊 Batch upload quota:
      before: 126.5 MB
      after: 128 MB
      successful: 3
      failed: 0
  ✓ should correctly extract file path from various URL formats
  ✓ should maintain accurate quota across multiple operations

🧹 Cleaning up 4 test tracks...
  ✅ Deleted track track_xxx1
  ✅ Deleted track track_xxx2
  ✅ Deleted track track_xxx3
  ✅ Deleted track track_xxx4

📊 Final storage:
  original: 125.5 MB
  final: 125.5 MB
  diff: 0 B

✅ Integration tests passed!
```

---

## Test Architecture

### Unit Tests (Mocked)

**Location:** `src/utils/__tests__/audioUploadService.test.ts`

**Uses:**
- Vitest for test framework
- Mocked Supabase client
- Mocked database operations
- Mocked storage operations

**Benefits:**
- Fast (runs in < 3 seconds)
- Safe (no database access)
- Repeatable (consistent results)
- Good for TDD and rapid iteration

**Limitations:**
- Doesn't test actual database interactions
- Doesn't verify file storage operations
- Can't catch integration issues

### Integration Tests (Real Database)

**Location:** `tests/integration/storage-quota-integration.test.ts`

**Uses:**
- Real Supabase client
- Real database operations
- Real storage operations
- Test user account

**Benefits:**
- Tests actual system behavior
- Validates database constraints
- Verifies storage operations
- Catches edge cases in production-like environment

**Limitations:**
- Slower (requires network + DB)
- Requires test environment setup
- Can fail due to network issues
- Requires cleanup after tests

---

## Setting Up Integration Tests

### 1. Create Test User

```sql
-- In Supabase SQL Editor (TEST environment)
INSERT INTO profiles (id, email, name, storage_limit)
VALUES (
  'test_user_123',
  'test@example.com',
  'Test User',
  1073741824  -- 1GB limit
);
```

### 2. Set Environment Variable

```bash
# In your terminal or .env.test file
export SUPABASE_TEST_USER_ID='test_user_123'
```

### 3. Verify Test Environment

```bash
# Check that you're NOT in production
echo $SUPABASE_URL
# Should be: https://xxx.supabase.co (test project)
# NOT: https://your-production-project.supabase.co
```

### 4. Run Integration Tests

```bash
npm run test:storage-quota:integration
```

---

## Interpreting Test Results

### ✅ All Tests Pass

```
Test Files  1 passed (1)
     Tests  25 passed (25)
```

**Action:** None - all fixes are working correctly!

### ❌ Some Tests Fail

```
Test Files  1 failed (1)
     Tests  23 passed | 2 failed (25)

❌ Fix #1: Storage Quota Check Before Upload
  ❌ should reject upload when quota would be exceeded
    AssertionError: expected function to throw error
```

**Action:**
1. Read the error message for specifics
2. Check which fix failed
3. Review the implementation in `audioUploadService.ts`
4. Fix the bug and re-run tests

### ⚠️ Integration Tests Fail (Network Issues)

```
Error: connect ECONNREFUSED 127.0.0.1:54321
```

**Action:**
1. Verify Supabase URL is correct
2. Check network connection
3. Verify test user exists in database
4. Try running unit tests first to isolate issue

---

## Test Coverage

Generate a coverage report to see which code is tested:

```bash
npm run test:storage-quota:coverage
```

Output:
```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
audioUploadService.ts  |   95.5  |   88.2   |  100.0  |  95.5   |
lib/supabase.ts        |   100.0 |   100.0  |  100.0  |  100.0  |
-----------------------|---------|----------|---------|---------|

📊 Coverage report: test-results/coverage/index.html
```

**Target:** 90%+ coverage for all metrics

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Storage Quota Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:storage-quota
      - run: npm run test:storage-quota:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Debugging Failed Tests

### Enable Verbose Logging

```bash
# Run tests with verbose output
npx vitest run --reporter=verbose src/utils/__tests__/audioUploadService.test.ts
```

### Run Single Test

```bash
# Run only one test by name
npx vitest run --grep "should reject upload when quota would be exceeded"
```

### Inspect Mocked Calls

Add debug logging in test:

```typescript
it('should reject upload', async () => {
  // ... test setup ...

  await expect(upload()).rejects.toThrow();

  // Debug: See what was called
  console.log('Mocked calls:', vi.mocked(db.profiles.getById).mock.calls);
});
```

---

## Best Practices

### 1. Run Unit Tests First

Always run unit tests before integration tests:
```bash
npm run test:storage-quota         # Fast, safe
npm run test:storage-quota:integration  # Slower, requires DB
```

### 2. Use Watch Mode During Development

```bash
npm run test:storage-quota:watch
```

Tests automatically re-run when you save files.

### 3. Keep Integration Tests Isolated

Integration tests should:
- Create their own test data
- Clean up after themselves
- Not depend on existing data
- Use a dedicated test user

### 4. Monitor Test Performance

If tests become slow:
- Check network latency
- Reduce file sizes in tests
- Use smaller test datasets
- Mock heavy operations in unit tests

### 5. Update Tests When Code Changes

When modifying `audioUploadService.ts`:
1. Update corresponding tests
2. Run tests to verify changes
3. Update test expectations if behavior changed intentionally

---

## Troubleshooting

### Issue: "Vitest not found"

**Solution:**
```bash
npm install --save-dev vitest @vitest/ui happy-dom
```

### Issue: "Test user not found"

**Solution:**
```bash
# Verify test user exists
export SUPABASE_TEST_USER_ID='correct_user_id'

# Or create test user in database
```

### Issue: "Tests timeout"

**Solution:**
```bash
# Increase timeout (vitest.config.ts)
test: {
  testTimeout: 30000, // 30 seconds
}
```

### Issue: "Cleanup failed"

**Solution:**
- Check test user has delete permissions
- Verify storage bucket policies
- Manually delete test tracks if needed:
```sql
DELETE FROM tracks WHERE created_by = 'test_user_id' AND title LIKE 'Test%';
```

---

## Next Steps

1. **Run Unit Tests:** `npm run test:storage-quota`
2. **Review Results:** Check `test-results/unit-tests.html`
3. **Set Up Integration Tests:** Create test user, set env var
4. **Run Integration Tests:** `npm run test:storage-quota:integration`
5. **Add to CI/CD:** Automate tests on every commit

---

## Support

For issues or questions:
- Check test output for specific error messages
- Review implementation in `audioUploadService.ts` (lines 76-318)
- Consult `CRITICAL_BUG_FIXES.md` for implementation details
- Test logs are saved to `test-results/` directory
