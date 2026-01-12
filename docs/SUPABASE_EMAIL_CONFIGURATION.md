# Supabase Email Verification Configuration

## Overview
This document explains how to configure Supabase email verification redirects for the CoreTet app.

## Problem
Email verification links need to redirect users to:
- **Mobile (iOS)**: Deep link to app (`coretet://`)
- **Web/Desktop**: Confirmation page (`https://coretet.app/auth/confirmed` or localhost during dev)

## Configuration Steps

### 1. Supabase Dashboard Configuration

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add the following URLs to **Redirect URLs**:

```
# Production
https://coretet.app/auth/confirmed

# Development (localhost)
http://localhost:5173/auth/confirmed
http://localhost:3000/auth/confirmed

# Mobile Deep Link
coretet://
coretet://auth/confirmed
```

### 2. Site URL Configuration

Set the **Site URL** to your production domain:
```
https://coretet.app
```

### 3. Email Template Configuration (Optional)

You can customize the email template in:
**Supabase Dashboard** → **Authentication** → **Email Templates** → **Confirm Signup**

Default template uses: `{{ .ConfirmationURL }}`

This URL will include the `redirect_to` parameter we set in the code.

## Code Implementation

### Current Implementation (PhoneAuthScreen.tsx)

```typescript
const redirectUrl = isNativeApp
  ? 'coretet://'
  : `${window.location.origin}/auth/confirmed`;

const { error: authError } = await supabase.auth.signUp({
  email: email.trim(),
  password: password,
  options: {
    emailRedirectTo: redirectUrl,
  }
});
```

### Email Flow

1. **User signs up** → Supabase sends email
2. **User clicks link** → Goes to:
   ```
   https://tvvztlizyciaafqkigwe.supabase.co/auth/v1/verify
     ?token=...
     &type=signup
     &redirect_to=https://coretet.app/auth/confirmed
   ```
3. **Supabase verifies** → Redirects to `redirect_to` URL
4. **User lands on** → `EmailConfirmedScreen` component

### EmailConfirmedScreen Behavior

**On Mobile (Native App):**
- Detects native platform via Capacitor
- Shows "Email confirmed! Redirecting..." message
- App should already be open via deep link

**On Web/Desktop:**
- Shows success message
- Attempts deep link (`coretet://`) to open app
- Provides manual "Open CoreTet App" button
- Shows instructions to download app if not installed

## Testing

### Test on Development

1. **Local testing:**
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

2. **Sign up with test email**

3. **Check email** - Should receive verification email

4. **Click link** - Should redirect to:
   ```
   http://localhost:5173/auth/confirmed
   ```

### Test on Production

1. **Deploy to production** (coretet.app)

2. **Sign up** with real email

3. **Click verification link** → Should go to:
   ```
   https://coretet.app/auth/confirmed
   ```

### Test Mobile Deep Link

1. **On iOS device** with app installed

2. **Sign up** in app

3. **Open email** on device

4. **Click verification link** → Should open app automatically

## Troubleshooting

### Issue: Redirect goes to Supabase URL instead of app

**Cause:** Redirect URL not whitelisted in Supabase

**Solution:** Add URL to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

### Issue: Deep link doesn't open app on mobile

**Cause:** iOS Universal Links not configured

**Solution:**
1. Check `ios/App/App/Info.plist` has URL scheme configured
2. Check `ios/App/App.entitlements` has associated domains
3. Rebuild iOS app: `npx cap sync ios`

### Issue: Email says "link expired"

**Cause:** Link was clicked multiple times or token expired (default: 24 hours)

**Solution:**
- Resend verification email
- Check Supabase Dashboard → Authentication → Settings → Email Auth → Confirmation Expiry Time

## Environment Variables

No additional environment variables needed. The app automatically detects:
- `window.location.origin` for web redirects
- `Capacitor.isNativePlatform()` for mobile detection

## Future Enhancements

1. **Custom Domain**: Once we have `coretet.app`, update Site URL and redirect URLs
2. **Email Customization**: Branded email templates with logo
3. **Magic Links**: Alternative to password-based signup
4. **TestFlight Integration**: Add TestFlight download link to EmailConfirmedScreen

## Related Files

- `src/components/screens/PhoneAuthScreen.tsx` - Signup logic
- `src/components/screens/EmailConfirmedScreen.tsx` - Post-verification page
- `src/App.tsx` - Route configuration for `/auth/confirmed`
- `ios/App/App/Info.plist` - iOS deep link configuration

## Notes

- Email verification is **required** in production
- Users cannot sign in until email is confirmed
- Confirmation link expires after 24 hours (default)
- Supabase handles token generation and validation automatically
