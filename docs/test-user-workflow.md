# Test User Authentication Workflow

## Overview

CoreTet uses a predefined test authentication system during development that simulates SMS verification without actually sending messages. This allows for secure testing with known credentials.

## How It Works

### Test User Database
The system maintains 6 predefined test users, each with:
- A specific phone number
- A 6-digit verification code
- No SMS is actually sent - codes are provided for testing

### Current Test Users

| Phone Number | Verification Code | Test ID |
|--------------|------------------|---------|
| +13128411256 | 128411 | tester-1 |
| +15624724359 | 624724 | tester-2 |
| +17143301407 | 143301 | tester-3 |
| +16509961770 | 509961 | tester-4 |
| +15625870584 | 625870 | tester-5 |
| +13104186365 | 104186 | tester-6 |

## Authentication Flow

1. **Phone Number Entry**: User enters one of the authorized test phone numbers
2. **Code Request**: System responds with "Verification code sent successfully"
3. **Code Display**: In development, the correct code is shown in the browser console
4. **Code Verification**: User enters the 6-digit code matching their phone number
5. **Success**: User is authenticated and can proceed with band creation/joining

## Configuration Files

### Environment Variables (`.env.local`)
```
VITE_TEST_CODES=+13128411256:128411,+15624724359:624724,+17143301407:143301,+16509961770:509961,+15625870584:625870,+13104186365:104186
```

### Test Credentials Documentation
See `TESTER_CREDENTIALS.md` in the project root for the complete list.

## Adding New Test Users

To add new test users:

1. **Update `.env.local`**:
   ```
   VITE_TEST_CODES=existing_codes,+1XXXXXXXXXX:XXXXXX
   ```

2. **Update `TESTER_CREDENTIALS.md`**:
   Add the new phone number and code to the documentation

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## Test Mode Detection

The system automatically uses test mode when:
- `VITE_AUTH_MODE` is set to "test"
- Running in development (`import.meta.env.DEV`)
- No Supabase URL is configured
- Supabase URL is set to placeholder value

## Security Notes

- Test codes are only 6 digits for development convenience
- Production authentication will use proper SMS with random codes
- Phone numbers must match exactly (including country code format)
- Sessions expire after 10 minutes
- No actual SMS costs are incurred during testing

## Debugging

Authentication attempts are logged to the browser console with details:
- Phone number formatting steps
- Session creation/validation
- Code verification results
- Success/failure reasons

## Phone Number Formatting

The system normalizes phone numbers to `+1XXXXXXXXXX` format before comparison:
- `(555) 123-4567` → `+15551234567`
- `555-123-4567` → `+15551234567`
- `+1 555 123 4567` → `+15551234567`