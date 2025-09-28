# Rate Limiting Implementation

## Overview

CoreTet implements client-side rate limiting to prevent abuse of the authentication system. This protects against brute force attacks and excessive API usage.

## Rate Limiting Rules

### Phone Number Limits
- **5 attempts** per phone number within a 15-minute window
- **3 attempts** maximum within any 1-minute burst window
- Limits reset automatically after successful authentication

### Session Limits
- **10 total attempts** per browser session within 15 minutes
- Applies across all phone numbers in the same browser

### Reset Conditions
- **Successful Authentication**: Phone-specific limits are cleared
- **Time Expiry**: All limits automatically reset after 15 minutes
- **Burst Window**: 1-minute burst limits reset after the burst window expires

## Implementation Details

### Core Components

#### RateLimiter Class (`src/utils/rateLimiter.ts`)
- Singleton pattern for consistent state across components
- Tracks attempts per phone number and per session
- Persistent storage in localStorage with cleanup
- Cryptographically secure tracking with normalized phone numbers

#### Error Integration (`src/utils/errorMessages.ts`)
- Structured error messages for rate limiting scenarios
- User-friendly explanations with specific wait times
- Different messages for burst, phone, and session limits

#### Authentication Integration (`src/utils/testAuthService.ts`)
- Rate limiting checks before processing authentication requests
- Automatic success recording to reset phone-specific limits
- Structured error responses with rate limiting information

## Error Messages

### Rate Limit Types

1. **Burst Limit**: "Please Slow Down" - when making requests too quickly
2. **Phone Rate Limit**: "Phone Number Rate Limited" - too many attempts for specific phone
3. **Session Rate Limit**: "Session Rate Limited" - too many attempts from browser

All messages include:
- Clear explanation of the issue
- Specific wait time before next attempt
- Action guidance for the user

## Storage & Persistence

### localStorage Storage
- Key: `coretet-rate-limits`
- Automatic cleanup of expired records
- 24-hour maximum retention
- Graceful degradation if storage unavailable

### Data Structure
```typescript
{
  phoneAttempts: Map<string, AttemptRecord>,
  sessionAttempts: AttemptRecord | null,
  timestamp: number
}
```

## Security Features

### Protection Against
- **Brute Force Attacks**: Exponential backoff with burst protection
- **Phone Number Enumeration**: Consistent limits across all numbers
- **Session Abuse**: Browser-level limits prevent circumvention
- **Rapid Fire Attempts**: 1-minute burst windows

### Privacy Considerations
- Phone numbers are normalized and hashed for storage
- No sensitive information persisted beyond rate limiting
- Automatic cleanup prevents long-term data retention

## Configuration

### Adjustable Limits
```typescript
const MAX_PHONE_ATTEMPTS = 5;        // per phone number
const MAX_SESSION_ATTEMPTS = 10;     // per browser session
const RESET_WINDOW = 15 * 60 * 1000; // 15 minutes
const BURST_WINDOW = 60 * 1000;      // 1 minute
const MAX_BURST_ATTEMPTS = 3;        // within burst window
```

### Environment Variables
Rate limiting is active in all environments where `TestAuthService.isTestMode()` returns true.

## Monitoring & Debugging

### Console Logging
- Rate limit violations logged with details
- Successful authentications logged with reset confirmation
- Cleanup operations logged with statistics

### Browser DevTools
- localStorage can be inspected at key `coretet-rate-limits`
- Rate limiter state visible in console logs
- Manual clearing available via `RateLimiter.getInstance().clearAll()`

## Future Considerations

### Server-Side Enhancement
When moving to production SMS:
- Implement server-side rate limiting for stronger security
- Consider IP-based limits in addition to phone numbers
- Add CAPTCHA integration for repeated violations

### Advanced Features
- Progressive delays (increase wait time with repeated violations)
- Whitelist for authorized testing numbers
- Admin dashboard for rate limit monitoring
- Webhook notifications for excessive abuse patterns

## Testing Rate Limits

### Manual Testing
1. Attempt authentication 6 times with same phone number
2. Verify rate limiting error appears on 6th attempt
3. Wait for reset window or test with different phone number
4. Verify burst protection with rapid consecutive attempts

### Development Override
For development testing, use browser console:
```javascript
// Clear all rate limits
window.localStorage.removeItem('coretet-rate-limits');

// Or via RateLimiter API
RateLimiter.getInstance().clearAll();
```