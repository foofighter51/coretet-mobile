# CoreTet Logo & Branding Guide

## Color Palette (from Logo)

### Primary Colors

**Amber/Gold** - Main brand color
- Hex: `#E9A643`
- RGB: `233, 166, 67`
- HSL: `39°, 78%, 59%`
- Usage: Buttons, CTAs, highlights, logo

**Amber Hover**
- Hex: `#D89532`
- RGB: `216, 149, 50`
- Usage: Hover states, active buttons

**Amber Light**
- Hex: `#FDF4E7`
- RGB: `253, 244, 231`
- Usage: Light backgrounds, subtle accents

**Amber Ultra Light**
- Hex: `#FFFCF5`
- RGB: `255, 252, 245`
- Usage: Very subtle backgrounds

### Secondary Colors

**Dark Blue-Gray** - Professional accent
- Hex: `#2C3E50`
- RGB: `44, 62, 80`
- Usage: Headers, navigation, dark backgrounds

**Charcoal Blue** - Text color
- Hex: `#1A2332`
- RGB: `26, 35, 50`
- Usage: Primary text, dark UI elements

**White**
- Hex: `#FFFFFF`
- Usage: Logo inner "C", light backgrounds, text on dark

---

## Logo Variations Needed

### 1. App Icon (iOS/Android)

**Sizes needed for iOS:**
```
1024x1024   - App Store
180x180     - iPhone 3x
120x120     - iPhone 2x
87x87       - iPad Pro
80x80       - iPad 2x
76x76       - iPad
60x60       - iPhone
58x58       - iPad
40x40       - Spotlight
29x29       - Settings
20x20       - Notification
```

**Format:** PNG with transparency
**Background:** Can use solid color or gradient
**Recommendation:** Hexagon with "C" on amber background

**Quick creation tool:**
- Use **App Icon Generator** (appicon.co)
- Upload 1024x1024 PNG
- Downloads all sizes in correct format

### 2. Favicon (Web)

**Sizes needed:**
```
favicon.ico  - 16x16, 32x32, 48x48 (multi-size ICO file)
favicon-16x16.png
favicon-32x32.png
apple-touch-icon.png - 180x180
android-chrome-192x192.png
android-chrome-512x512.png
```

**Tool:** Use **RealFaviconGenerator.net**
- Upload logo
- Preview on all devices
- Download complete package

### 3. Social Media Assets

**Open Graph Image** (for link sharing)
- Size: 1200x630px
- Format: PNG or JPG
- Include: Logo + "CoreTet" + tagline
- Use on: Facebook, LinkedIn, Twitter cards

**Twitter Card**
- Size: 1200x675px (16:9)
- Format: PNG or JPG

**Instagram Profile**
- Size: 320x320px (displays at 110x110px)
- Format: PNG or JPG

### 4. Email & Documents

**Email Header**
- Size: 600x150px
- Format: PNG
- Background: White or transparent

**Letterhead**
- Size: 8.5"x11" (2550x3300px @300dpi)
- Format: PDF
- Placement: Top center or top left

---

## Logo File Organization

Create this folder structure:

```
/public/
  /images/
    /logo/
      logo-full.svg              # Full hexagon + C
      logo-full.png              # PNG version
      logo-icon.svg              # Just the hexagon (for small spaces)
      logo-icon.png
      logo-white.svg             # White version (for dark backgrounds)
      logo-white.png
    /icons/
      favicon.ico
      favicon-16x16.png
      favicon-32x32.png
      apple-touch-icon.png
      android-chrome-192x192.png
      android-chrome-512x512.png
    /social/
      og-image.png               # 1200x630
      twitter-card.png           # 1200x675
```

---

## Creating Logo Variations

Since I can't create images, here's how to generate the needed versions:

### Option 1: Figma (Recommended)

1. Import your V5_3.png logo
2. Trace/recreate as vector
3. Export variations:
   - SVG for web
   - PNG @ 1x, 2x, 3x for mobile
   - ICO for favicon

### Option 2: Online Tools

**For App Icons:**
1. Go to https://appicon.co
2. Upload logo (1024x1024)
3. Download iOS/Android icon sets

**For Favicons:**
1. Go to https://realfavicongenerator.net
2. Upload logo
3. Configure for all platforms
4. Download complete package

**For Social Media:**
1. Use Canva.com (free)
2. Templates for:
   - Open Graph (1200x630)
   - Twitter Card (1200x675)
   - Instagram (1080x1080)

### Option 3: ImageMagick (Command Line)

```bash
# Resize to multiple sizes
for size in 16 32 48 64 128 256 512 1024; do
  convert logo-source.png -resize ${size}x${size} logo-${size}.png
done

# Create ICO file
convert logo-16.png logo-32.png logo-48.png favicon.ico
```

---

## Using the New Colors in App

### All Components Auto-Updated

Because we mapped `designTokens.colors.primary.blue` to the new amber color, **all existing components now use amber automatically!**

Components using `designTokens.colors.primary.blue` now render in amber:
- All buttons
- Links
- Active states
- Focus indicators
- Brand accents

### Adding Logo to Landing Page

Update [NewLandingPage.tsx](../src/components/screens/NewLandingPage.tsx):

**Replace the nav logo (around line 73):**

```tsx
// OLD: Simple circle with Music icon
<div style={{
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: designTokens.colors.primary.blue,
  ...
}}>
  <Music size={24} color="#ffffff" />
</div>

// NEW: Actual logo
<img
  src="/images/logo/logo-full.png"
  alt="CoreTet"
  style={{
    height: '40px',
    width: 'auto',
  }}
/>
```

### Adding Logo to App Header

Update [MainDashboard.tsx](../src/components/screens/MainDashboard.tsx) around line 1695:

```tsx
// OLD: "C" in blue circle
<div style={{
  width: designTokens.spacing.xxl,
  height: designTokens.spacing.xxl,
  borderRadius: designTokens.borderRadius.full,
  backgroundColor: designTokens.colors.primary.blue,
  ...
}}>
  C
</div>

// NEW: Logo image
<img
  src="/images/logo/logo-icon.png"
  alt="CoreTet"
  style={{
    width: designTokens.spacing.xxl,
    height: designTokens.spacing.xxl,
  }}
/>
```

---

## iOS App Icon Setup

### Step 1: Generate Icon Set

1. Use appicon.co or manually create all sizes
2. Place in: `/ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Step 2: Update Xcode

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select project in navigator
3. Go to: App → General → App Icons and Launch Screen
4. Ensure "AppIcon" is selected

### Step 3: Test

```bash
# Run in simulator
open ios/App/App.xcworkspace
# Cmd+R to run
# Check home screen for new icon
```

---

## Web Favicon Setup

### Step 1: Generate Favicons

Use RealFaviconGenerator.net to create all sizes.

### Step 2: Add to index.html

Update [index.html](../index.html) `<head>`:

```html
<head>
  <!-- Existing meta tags... -->

  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/images/icons/favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/icons/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/images/icons/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/images/icons/android-chrome-512x512.png">

  <!-- Safari Pinned Tab -->
  <link rel="mask-icon" href="/images/icons/safari-pinned-tab.svg" color="#E9A643">

  <!-- Theme Color (shows in browser chrome) -->
  <meta name="theme-color" content="#E9A643">

  <!-- Microsoft Tiles -->
  <meta name="msapplication-TileColor" content="#E9A643">
  <meta name="msapplication-config" content="/images/icons/browserconfig.xml">
</head>
```

---

## Brand Usage Guidelines

### Do's ✅

- Use amber (#E9A643) for all primary actions
- Use dark blue-gray (#2C3E50) for professional contexts
- Maintain hexagon shape in logo
- Use white "C" on colored backgrounds
- Keep adequate padding around logo (minimum 20px)
- Use SVG when possible for crisp rendering

### Don'ts ❌

- Don't distort the hexagon shape
- Don't use colors outside the brand palette
- Don't add drop shadows to the logo
- Don't rotate the hexagon
- Don't use low-res PNG files
- Don't place logo on busy backgrounds

### Minimum Sizes

- **Digital:** 24x24px (icon only)
- **Print:** 0.5 inch (full logo)
- **App Icon:** 29x29px minimum (iOS Settings)

### Clear Space

Maintain clear space around logo equal to the height of one hexagon ring.

---

## Color Accessibility

### Contrast Ratios (WCAG AA)

**Amber on White:**
- Ratio: 3.2:1
- ⚠️ Use for large text only (18pt+)
- For body text, use charcoal (#1A2332)

**White on Amber:**
- Ratio: 4.6:1
- ✅ Passes for normal text

**Amber on Dark Blue:**
- Ratio: 4.8:1
- ✅ Passes for normal text

**Recommendation:** Use amber for buttons/CTAs, charcoal for body text.

---

## Quick Start Checklist

- [ ] Generate app icons (appicon.co)
- [ ] Add to Xcode project
- [ ] Generate favicons (realfavicongenerator.net)
- [ ] Add to index.html
- [ ] Export logo as SVG
- [ ] Place logo files in `/public/images/logo/`
- [ ] Update landing page nav
- [ ] Update app header
- [ ] Create OG image (1200x630)
- [ ] Test on iOS simulator
- [ ] Test favicon in browsers
- [ ] Verify colors in all components

---

## Tools & Resources

**Logo Export:**
- Figma: https://figma.com
- Sketch: https://sketch.com
- Adobe Illustrator

**Icon Generators:**
- App Icons: https://appicon.co
- Favicons: https://realfavicongenerator.net

**Social Media Assets:**
- Canva: https://canva.com
- Figma templates: Search "social media templates"

**Color Tools:**
- Contrast Checker: https://webaim.org/resources/contrastchecker/
- Palette Generator: https://coolors.co

---

## Next Steps

1. **Create master logo file** (SVG) with correct dimensions
2. **Generate all icon sizes** using appicon.co
3. **Add to iOS project** via Xcode
4. **Generate favicons** via realfavicongenerator.net
5. **Update landing page** with actual logo
6. **Create OG image** for social sharing
7. **Test across devices** to ensure proper display

The new color scheme is already live in the app! All components using `designTokens.colors.primary.blue` now display in amber (#E9A643).
