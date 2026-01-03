# CoreTet Landing Page Guide

## Overview

Your new landing page (coretet.app) is now live with:
- ✅ Modern, clean design inspired by SessionKeeper.ai
- ✅ Hero section with beta signup form
- ✅ Feature showcase (6 key features)
- ✅ Use cases (Bands, Producers, Ensembles)
- ✅ User login modal
- ✅ Beta signup email collection (stored in Supabase)
- ✅ Responsive design
- ⏳ Screenshot section (placeholder - needs your screenshots)

---

## File Structure

**Landing Page:** [NewLandingPage.tsx](../src/components/screens/NewLandingPage.tsx)
**Migration:** [20251222000001_add_beta_signups.sql](../supabase/migrations/20251222000001_add_beta_signups.sql)
**Routing:** [App.tsx](../src/App.tsx) - Web visitors see NewLandingPage, native app sees PhoneAuthScreen

---

## Next Step: Add Screenshots

### 1. Take Screenshots from iOS Simulator

**Best screens to showcase:**
- Main dashboard with set lists
- Track detail with timestamped comments
- Swipe to Like/Love interaction
- Set list detail view
- Upload screen

**How to capture:**
```bash
# In Xcode, run the app in simulator
# Navigate to the screen you want
# Click: File → New Screen Shot (or Cmd+S)
# Screenshots save to ~/Desktop
```

### 2. Create Device Mockups

**Option A: Screely.com (Recommended - Free)**
1. Go to https://screely.com
2. Upload your screenshot
3. Choose "iPhone" device frame
4. Select background color/gradient
5. Download as PNG

**Option B: Mockuphone.com (Also Free)**
1. Go to https://mockuphone.com
2. Select "Apple Devices" → iPhone 15 Pro
3. Upload screenshot
4. Download mockup

**Option C: Shots.so (Premium Look)**
1. Go to https://shots.so
2. Create free account
3. Upload screenshots
4. Apply premium frames/backgrounds
5. Download

### 3. Add Screenshots to Landing Page

**Save screenshots to:**
```
/Users/exleymini/Apps/coretet-band/public/screenshots/
```

**Update NewLandingPage.tsx:**

Replace this placeholder section (around line 240):

```tsx
{/* TODO: Add your app screenshots here */}
<div style={{
  padding: '80px 40px',
  backgroundColor: '#e5e7eb',
  borderRadius: '12px',
  color: designTokens.colors.text.muted,
}}>
  <p style={{ margin: 0, fontSize: '16px' }}>
    📱 App Screenshots
    <br />
    <span style={{ fontSize: '14px' }}>
      Use Screely.com or Mockuphone.com to create beautiful device mockups
    </span>
  </p>
</div>
```

**With actual screenshots:**

```tsx
{/* App Screenshots */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '32px',
}}>
  <img
    src="/screenshots/dashboard-mockup.png"
    alt="CoreTet dashboard showing set lists"
    style={{
      width: '100%',
      height: 'auto',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    }}
  />
  <img
    src="/screenshots/comments-mockup.png"
    alt="Timestamped comments on a track"
    style={{
      width: '100%',
      height: 'auto',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    }}
  />
  <img
    src="/screenshots/setlist-mockup.png"
    alt="Set list with tracks"
    style={{
      width: '100%',
      height: 'auto',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    }}
  />
</div>
```

---

## Beta Signup Flow

### How It Works

1. User enters email on landing page
2. Email saved to `beta_signups` table in Supabase
3. Success message shown: "Thanks! We'll be in touch soon."
4. You can view signups in Supabase dashboard

### Viewing Beta Signups

**Method 1: Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Table Editor** → `beta_signups`
4. See all signups with timestamps

**Method 2: SQL Query**
```sql
SELECT email, created_at, status
FROM beta_signups
ORDER BY created_at DESC;
```

### Managing Beta Signups

**Invite someone who signed up:**
```sql
UPDATE beta_signups
SET status = 'invited',
    notes = 'Sent TestFlight invite on 2025-12-22'
WHERE email = 'user@example.com';
```

**Mark as registered:**
```sql
UPDATE beta_signups
SET status = 'registered'
WHERE email = 'user@example.com';
```

**Export all pending signups:**
```sql
SELECT email
FROM beta_signups
WHERE status = 'pending'
ORDER BY created_at ASC;
```

---

## User Login

### Web Login Flow

1. User clicks "Sign In" in nav bar
2. Modal appears with email/password form
3. After login, redirects to `/app` (main dashboard)
4. Web users can now:
   - View all features (same as mobile)
   - Upload tracks (easier than mobile!)
   - Leave comments
   - Manage set lists

### Future: Batch Upload

The landing page mentions "Web interface for batch uploads coming soon" - this is the next feature to build.

**Planned batch upload:**
- Drag & drop multiple files at once
- Progress bar for each file
- Tag multiple tracks at once
- Add to set list in bulk

---

## Customization

### Colors & Branding

All colors use your design tokens. To update brand color:

**File:** [designTokens.ts](../src/design/designTokens.ts)

```ts
primary: {
  blue: '#2563eb', // Change this to your brand color
  lightBlue: '#ebf8ff',
},
```

### Copy & Messaging

**Tagline** (Hero section):
```tsx
// Current: "Music collaboration made simple"
// Change in NewLandingPage.tsx around line 114
```

**Features:**
All 6 features are in the "Features Section" starting around line 230.
Update titles, descriptions, or icons as needed.

**Use Cases:**
The "Perfect for" section (Bands, Producers, Ensembles) is around line 480.

---

## SEO & Meta Tags

To optimize for search engines, add to [index.html](../index.html):

```html
<head>
  <!-- Existing meta tags... -->

  <!-- SEO Meta Tags -->
  <meta name="description" content="CoreTet is a private music collaboration platform for bands. Upload tracks, leave timestamped feedback, and organize set lists—all in one place.">
  <meta name="keywords" content="music collaboration, band app, timestamped feedback, set lists, music app">

  <!-- Open Graph (for social sharing) -->
  <meta property="og:title" content="CoreTet - Music Collaboration Made Simple">
  <meta property="og:description" content="Upload tracks, leave timestamped feedback, and organize set lists with your band.">
  <meta property="og:image" content="https://coretet.app/og-image.png">
  <meta property="og:url" content="https://coretet.app">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="CoreTet - Music Collaboration Made Simple">
  <meta name="twitter:description" content="Upload tracks, leave timestamped feedback, and organize set lists with your band.">
  <meta name="twitter:image" content="https://coretet.app/og-image.png">
</head>
```

**Create og-image.png:**
- Size: 1200x630px
- Use Canva, Figma, or similar
- Include logo, tagline, screenshot
- Save as `public/og-image.png`

---

## Deployment

### Before Deploying:

1. **Run migration:**
   ```bash
   # Apply the beta_signups table migration
   supabase db push
   ```

2. **Test locally:**
   ```bash
   npm run dev
   # Visit http://localhost:5173
   # Test beta signup form
   # Test login modal
   ```

3. **Add screenshots** (see above)

4. **Update domain:** Make sure `coretet.app` points to your hosting

### Hosting Options

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set up domain
vercel domains add coretet.app
```

**Option B: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set up domain in Netlify dashboard
```

**Option C: GitHub Pages**
- Build: `npm run build`
- Deploy `dist/` folder
- Configure custom domain in repo settings

---

## Analytics (Optional)

To track beta signups and page views, add:

**Google Analytics:**
```html
<!-- Add to index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible (privacy-friendly alternative):**
```html
<script defer data-domain="coretet.app" src="https://plausible.io/js/script.js"></script>
```

---

## Next Steps

### Immediate (to complete landing page):
1. ✅ Landing page built
2. ✅ Beta signup form working
3. ⏳ **Add screenshots** (use Screely/Mockuphone)
4. ⏳ **Deploy to coretet.app**
5. ⏳ Test on mobile devices

### Soon (enhance landing page):
6. Add video demo (screen recording of app)
7. Add testimonials from beta testers
8. Create OG image for social sharing
9. Set up analytics

### Later (web features):
10. Build batch upload interface
11. Add web-optimized track management
12. Create admin dashboard for beta signups

---

## Screenshot Mockup Examples

Here are specific screens to capture and mockup:

**Screenshot 1: Dashboard** (Hero)
- Show set lists tab
- Show 3-4 set lists
- Clean, organized view

**Screenshot 2: Track Comments** (Features)
- Open track detail modal
- Show 2-3 timestamped comments
- Highlight the timestamp feature

**Screenshot 3: Swipe Actions** (Features)
- Show track row mid-swipe
- Like/Love buttons visible
- Demonstrates interaction

**Screenshot 4: Set List Detail** (Use Cases)
- Open set list with 5-7 tracks
- Show track durations
- Show share button

**Screenshot 5: Upload Screen** (Optional)
- Show upload modal
- Multiple files selected
- Progress indicators

---

## Support & Troubleshooting

### Beta signup not working?

**Check migration applied:**
```bash
supabase db diff
# Should show beta_signups table
```

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'beta_signups';
```

### Login redirect not working?

Check that authenticated users route to `/app`:
```tsx
// In NewLandingPage.tsx, line ~47
navigate('/app');  // Make sure this matches your app route
```

### Screenshots not loading?

Make sure files are in `public/` directory (not `src/`):
```
public/
  screenshots/
    dashboard-mockup.png
    comments-mockup.png
    setlist-mockup.png
```

---

## Landing Page Checklist

- [x] Hero section with tagline
- [x] Beta signup form
- [x] Email collection to Supabase
- [x] Feature showcase (6 features)
- [x] Use cases section
- [x] Login modal
- [x] Responsive design
- [ ] Add app screenshots
- [ ] Deploy to coretet.app
- [ ] Test on mobile
- [ ] Add SEO meta tags
- [ ] Create OG image
- [ ] Set up analytics (optional)

---

**You're ready to launch! Just add screenshots and deploy to coretet.app** 🚀
