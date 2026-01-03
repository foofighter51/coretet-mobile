# Complete Signup Flow Guide

## Overview

CoreTet now has a polished, end-to-end new user signup experience with:
- ✅ Email/password authentication
- ✅ Beautiful email confirmation screen
- ✅ Resend confirmation email functionality
- ✅ Branded confirmation landing page
- ✅ Seamless onboarding flow
- ✅ Deep linking for iOS app

---

## User Journey

### 1. **Sign Up Screen** ([PhoneAuthScreen.tsx](../src/components/screens/PhoneAuthScreen.tsx))

**What user sees:**
- CoreTet logo and tagline
- Email input field
- Password input (min 6 characters)
- Confirm password field
- "Create Account" button
- Toggle to "Already have an account? Sign in"

**What happens:**
- User enters email, password, confirms password
- App validates inputs (email format, password length, passwords match)
- Calls `supabase.auth.signUp()` with:
  - **Native app:** `emailRedirectTo: 'coretet://'`
  - **Web/localhost:** `emailRedirectTo: 'https://yoursite.com/auth/confirmed'`

---

### 2. **Email Confirmation Screen** ([EmailConfirmationScreen.tsx](../src/components/screens/EmailConfirmationScreen.tsx))

**What user sees:**
- 📧 Large email icon
- "Check your email" heading
- Their email address displayed prominently
- Clear numbered instructions:
  1. Open the email from CoreTet
  2. Click "Confirm your email"
  3. You'll be redirected back to the app
- Tip about checking spam folder
- "Resend confirmation email" button (60s countdown)
- "Back to sign in" link

**What happens:**
- User receives email from Supabase (needs customization - see below)
- Can resend email if needed (with rate limiting)
- Form is cleared but user stays on this screen until they confirm

---

### 3. **Email Confirmation Link**

**What user receives:**
- Email from Supabase with confirmation link
- Link format: `https://yourproject.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=coretet://`
- **Native app:** Opens app via `coretet://` deep link
- **Web/localhost:** Redirects to `/auth/confirmed` page

---

### 4. **Confirmation Success Page** ([EmailConfirmedScreen.tsx](../src/components/screens/EmailConfirmedScreen.tsx))

**Native app:**
- Shows checkmark animation
- "Email confirmed! Redirecting..."
- Auto-redirects to app home

**Web (fallback):**
- ✅ Large checkmark icon
- "Email confirmed!" heading
- "Your account is ready" message
- Instructions card:
  - 📱 Next steps
  - Open CoreTet app
  - Sign in with email/password
- "Open CoreTet App" button (tries deep link)
- "Download from TestFlight" info (for future)

---

### 5. **Onboarding Flow** ([OnboardingScreen.tsx](../src/components/screens/OnboardingScreen.tsx))

**What user sees (first time signing in):**
- **Step 1: Name Entry**
  - "Welcome to CoreTet"
  - "What should we call you?"
  - Name input field
  - "Continue" button

- **Step 2-4: Intro Screens** (can be skipped)
  - Screen 1: 🎵 "Share music with your band"
  - Screen 2: 💬 "Get feedback at exact moments"
  - Screen 3: 🔒 "Invite-only and private"
  - Progress dots (1/3, 2/3, 3/3)
  - "Next" / "Get Started" button
  - "Skip" button

**What happens:**
- Name is saved to `profiles` table
- Personal band is created automatically
- `onboarding_v1_completed` flag set in localStorage
- Page reloads → user sees MainDashboard

---

### 6. **Main App** ([MainDashboard.tsx](../src/components/screens/MainDashboard.tsx))

User is now fully signed up and can:
- Upload tracks
- Create set lists
- Invite band members
- Leave timestamped feedback
- Use all app features

---

## Customizing Supabase Email Templates

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `tvvztlizyciaafqkigwe` (coretet-band)
3. Navigate to: **Authentication** → **Email Templates**

### Step 2: Customize "Confirm signup" Template

**Current default template:**
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

**Recommended branded template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your CoreTet account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <!-- Logo -->
              <div style="width: 60px; height: 60px; margin: 0 auto 16px; background-color: #2563eb; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 32px; font-weight: 700;">C</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Welcome to CoreTet!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                Thanks for signing up! You're one click away from collaborating with your band.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                Click the button below to confirm your email address and get started:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Confirm your email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #6b7280;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 13px; color: #2563eb; word-break: break-all;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                This link will expire in 24 hours.
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                If you didn't sign up for CoreTet, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Step 3: Customize Email Settings

**In Supabase Dashboard → Authentication → Email Templates:**

1. **Subject Line:** "Confirm your CoreTet account"
2. **From Email:**
   - Default: `noreply@mail.app.supabase.io`
   - Custom (requires SMTP setup): `hello@coretet.com`
3. **From Name:** "CoreTet Team"

### Step 4: Test Email Flow

**Local Testing:**
```bash
# 1. Start dev server
npm run dev

# 2. Sign up with a test email
# 3. Check email (use a real email or Supabase Inbucket for testing)
# 4. Verify confirmation link works
```

**Production Testing:**
1. Use Settings → "🧪 Test Full Onboarding (DEV)" to reset
2. Go through complete signup flow
3. Check actual email delivery
4. Verify deep linking works on iOS
5. Test web fallback on desktop

---

## Email Template Variables

Supabase provides these variables for email templates:

- `{{ .ConfirmationURL }}` - Full confirmation link
- `{{ .Token }}` - Just the token (if you want to build custom URL)
- `{{ .SiteURL }}` - Your site URL (from Supabase config)
- `{{ .TokenHash }}` - Hashed token

---

## Advanced: Custom SMTP Setup

For production, you may want to use a custom email service:

### Option 1: SendGrid
1. Create SendGrid account
2. Get API key
3. In Supabase: **Project Settings** → **Auth** → **SMTP Settings**
4. Configure:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: Your SendGrid API key

### Option 2: AWS SES
1. Set up AWS SES
2. Verify your sending domain
3. Configure in Supabase SMTP settings

### Option 3: Postmark, Mailgun, etc.
Similar process - get SMTP credentials and configure in Supabase.

---

## Testing Signup Flow Without Creating Accounts

### Method 1: Dev Button (Current Implementation)

**In app:**
1. Open Settings (gear icon)
2. Tap "🧪 Test Full Onboarding (DEV)"
3. Confirm prompt
4. App resets your name and onboarding flag
5. Reload shows full onboarding flow

**Code:** [SettingsModal.tsx](../src/components/molecules/SettingsModal.tsx)

### Method 2: Supabase Inbucket (Email Testing)

**For local development:**
1. Supabase CLI provides local email viewer
2. Access at: `http://localhost:54324/monitor`
3. See all emails sent by local Supabase instance
4. No need for real email addresses

**Setup:**
```bash
# If using local Supabase
supabase start
# Access Inbucket at http://localhost:54324/monitor
```

### Method 3: Temporary Email Services

**For production testing:**
- Use temp-mail.org, guerrillamail.com, etc.
- Create disposable email addresses
- Test full flow without cluttering your inbox

---

## Troubleshooting

### Issue: Email confirmation link doesn't open app

**Solution:**
- Check deep link setup in Xcode (URL Schemes)
- Verify `coretet://` is registered
- Test deep link manually: `xcrun simctl openurl booted coretet://`

### Issue: User doesn't receive email

**Check:**
1. Email is correct (no typos)
2. Check spam/junk folder
3. Supabase email rate limits (max 3-4 per hour during dev)
4. Email template is published in Supabase dashboard

### Issue: "Email already registered" error

**Solution:**
- User already exists in Supabase
- They should use "Sign in" instead
- Or delete user from Supabase dashboard → Authentication → Users

### Issue: Confirmation link expired

**Solution:**
- Links expire after 24 hours
- Use "Resend confirmation email" button
- Or sign up again with same email (Supabase will send new link)

---

## Security Considerations

1. **Email Rate Limiting:**
   - Supabase limits signup emails to prevent spam
   - Default: ~3-4 emails per hour per IP
   - Production: Configure in Supabase settings

2. **Password Requirements:**
   - Minimum 6 characters (Supabase default)
   - Can be increased in: Supabase → Auth → Policies
   - Recommended for production: 8+ characters

3. **Email Verification Required:**
   - Users MUST confirm email before signing in
   - Prevents fake accounts
   - Configured in: Supabase → Auth → Settings → "Enable email confirmations"

4. **Deep Link Security:**
   - `coretet://` only opens your app (registered in iOS)
   - Token is short-lived (24 hours)
   - One-time use (cannot reuse confirmation link)

---

## Future Enhancements

### Planned:
- [ ] Password reset flow (similar UI to signup)
- [ ] Social auth (Sign in with Apple, Google)
- [ ] Magic link signin (passwordless)
- [ ] Two-factor authentication
- [ ] Email change verification
- [ ] Account deletion flow

### Email Improvements:
- [ ] Transactional emails (new comment, band invite, etc.)
- [ ] Email preferences (digest frequency, notifications)
- [ ] Branded email header/footer with logo
- [ ] Localization (multi-language support)

---

## Files Modified/Created

### New Files:
- [EmailConfirmationScreen.tsx](../src/components/screens/EmailConfirmationScreen.tsx) - Waiting for email screen with resend
- [EmailConfirmedScreen.tsx](../src/components/screens/EmailConfirmedScreen.tsx) - Success page after confirmation

### Modified Files:
- [PhoneAuthScreen.tsx](../src/components/screens/PhoneAuthScreen.tsx) - Added confirmation screen flow
- [App.tsx](../src/App.tsx) - Added `/auth/confirmed` route
- [OnboardingScreen.tsx](../src/components/screens/OnboardingScreen.tsx) - Improved intro screens
- [IntroModal.tsx](../src/components/molecules/IntroModal.tsx) - Updated messaging
- [SettingsModal.tsx](../src/components/molecules/SettingsModal.tsx) - Added dev testing button

---

## Summary

The complete signup flow is now:

1. ✅ **Sign up** → User enters email/password
2. ✅ **Email sent** → Beautiful waiting screen with resend option
3. ✅ **User clicks link** → Email confirmation link (in branded email)
4. ✅ **Confirmation page** → iOS: Opens app | Web: Success page with instructions
5. ✅ **Onboarding** → Name entry + 3 intro screens
6. ✅ **Main app** → User is fully onboarded

**Next step:** Customize email template in Supabase dashboard (see above) to match CoreTet branding.
