# CoreTet Design System Export Guide

## Overview
This guide outlines the exact export settings and file structure for the CoreTet music collaboration app design system.

## Export Configuration

### COMPONENTS TO EXPORT

#### 1. Individual Components (Isolated)
- **Format**: PNG @1x, @2x, @3x + SVG for icons
- **Background**: Transparent for components, white for screens
- **Padding**: 16px around component for context

**Component List:**
- TrackCard (default, playing, loading states)
- Button (primary, secondary, small variants)
- TabBar (all tab states)
- AudioPlayer (collapsed, expanded)
- EnsembleCard (default, empty states)
- CollaboratorCard (online, away, offline)
- EmptyState (all variants)
- ErrorBanner (error, warning, connection, upload)
- LoadingSpinner (small, medium, large)
- Input fields (default, focus, error states)

#### 2. Full Screen Exports
- **Format**: PNG @2x (750x1624px)
- **Background**: Actual background colors
- **Include**: Full mobile frame with status bar

**Screen List:**
- HomeScreen (with ensembles)
- TrackListingScreen (with tracks)
- TracksView (main tab)
- CollaboratorsView (main tab)
- OnboardingFlow (all steps)
- TrackUploadScreen
- NowPlayingScreen
- CommentThreadScreen
- ProfileScreen

#### 3. Icons
- **Format**: SVG only
- **Size**: 24x24px base size
- **Style**: Paths only, no fills (inherits color)
- **Optimization**: Minified SVG

**Icon List:**
- icon-play.svg
- icon-pause.svg
- icon-skip-forward.svg
- icon-skip-back.svg
- icon-heart.svg (love rating)
- icon-thumbs-up.svg (like rating)
- icon-comment.svg
- icon-upload.svg
- icon-search.svg
- icon-filter.svg
- icon-plus.svg
- icon-arrow-left.svg
- icon-arrow-right.svg
- icon-users.svg
- icon-music.svg

#### 4. Design Tokens
- **Format**: JSON files
- **Content**: Colors, typography, spacing values
- **Structure**: Semantic naming with hex values and measurements

---

## FILE STRUCTURE

```
exports/
├── components/
│   ├── track-card-default@1x.png
│   ├── track-card-default@2x.png
│   ├── track-card-default@3x.png
│   ├── track-card-playing@1x.png
│   ├── track-card-playing@2x.png
│   ├── track-card-playing@3x.png
│   ├── track-card-loading@1x.png
│   ├── track-card-loading@2x.png
│   ├── track-card-loading@3x.png
│   ├── button-primary-default@1x.png
│   ├── button-primary-default@2x.png
│   ├── button-primary-default@3x.png
│   ├── button-secondary-default@1x.png
│   ├── button-secondary-default@2x.png
│   ├── button-secondary-default@3x.png
│   ├── tab-bar-bands-active@1x.png
│   ├── tab-bar-tracks-active@1x.png
│   ├── tab-bar-collaborators-active@1x.png
│   ├── ensemble-card-default@1x.png
│   ├── ensemble-card-empty@1x.png
│   ├── collaborator-card-online@1x.png
│   ├── collaborator-card-away@1x.png
│   ├── collaborator-card-offline@1x.png
│   ├── audio-player-collapsed@1x.png
│   ├── audio-player-expanded@1x.png
│   ├── empty-state-tracks@1x.png
│   ├── empty-state-collaborators@1x.png
│   ├── error-banner-connection@1x.png
│   ├── error-banner-upload@1x.png
│   ├── error-banner-warning@1x.png
│   ├── loading-spinner-small@1x.png
│   ├── loading-spinner-medium@1x.png
│   ├── loading-spinner-large@1x.png
│   ├── input-field-default@1x.png
│   ├── input-field-focus@1x.png
│   └── input-field-error@1x.png
├── icons/
│   ├── icon-play.svg
│   ├── icon-pause.svg
│   ├── icon-skip-forward.svg
│   ├── icon-skip-back.svg
│   ├── icon-heart.svg
│   ├── icon-thumbs-up.svg
│   ├── icon-comment.svg
│   ├── icon-upload.svg
│   ├── icon-search.svg
│   ├── icon-filter.svg
│   ├── icon-plus.svg
│   ├── icon-arrow-left.svg
│   ├── icon-arrow-right.svg
│   ├── icon-users.svg
│   └── icon-music.svg
├── screens/
│   ├── screen-home.png
│   ├── screen-track-listing.png
│   ├── screen-tracks-view.png
│   ├── screen-collaborators-view.png
│   ├── screen-onboarding-step1.png
│   ├── screen-onboarding-step2.png
│   ├── screen-onboarding-step3.png
│   ├── screen-track-upload.png
│   ├── screen-now-playing.png
│   ├── screen-comment-thread.png
│   └── screen-profile.png
└── tokens/
    ├── colors.json
    ├── typography.json
    └── spacing.json
```

---

## NAMING CONVENTIONS

### Components
**Pattern**: `component-name-state@resolution.png`
- Use lowercase with hyphens
- Include state (default, active, hover, disabled, loading)
- Add resolution suffix (@1x, @2x, @3x)

**Examples:**
- `track-card-default@2x.png`
- `button-primary-active@1x.png`
- `tab-bar-tracks-active@3x.png`

### Icons  
**Pattern**: `icon-name.svg`
- Prefix with "icon-"
- Use descriptive, semantic names
- No resolution suffix (SVG scales)

**Examples:**
- `icon-play.svg`
- `icon-thumbs-up.svg`
- `icon-arrow-left.svg`

### Screens
**Pattern**: `screen-name.png`
- Prefix with "screen-"
- Use page/view name
- Always @2x resolution (750x1624px)

**Examples:**
- `screen-home.png`
- `screen-track-listing.png`
- `screen-now-playing.png`

### Design Tokens
**Pattern**: `category.json`
- Use category names
- Semantic structure inside JSON

**Examples:**
- `colors.json`
- `typography.json`
- `spacing.json`

---

## EXPORT SETTINGS

### PNG Components
- **Resolution**: @1x (375px base), @2x (750px), @3x (1125px)
- **Background**: Transparent
- **Padding**: 16px around component
- **Format**: PNG-24 with transparency
- **Compression**: Optimized for web

### PNG Screens  
- **Resolution**: @2x only (750x1624px)
- **Background**: Actual background colors (#ffffff, #fafbfc)
- **Include**: Full mobile frame with realistic content
- **Format**: PNG-24
- **Compression**: High quality

### SVG Icons
- **Size**: 24x24px artboard
- **Style**: Outline only, no fills
- **Optimization**: Remove unnecessary code, minify
- **Format**: SVG 1.1
- **Colors**: Inherit (no hardcoded colors)

### JSON Tokens
- **Format**: Valid JSON with proper structure
- **Values**: Use exact measurements and hex colors
- **Comments**: Include usage notes where helpful
- **Structure**: Nested semantic organization

---

## QUALITY CHECKLIST

### Before Export:
- [ ] All components use exact CoreTet color palette
- [ ] Typography matches SF Pro Display specifications  
- [ ] Spacing follows exact 8px grid system
- [ ] All interactive states are included
- [ ] Icons are properly optimized SVGs
- [ ] Screens show realistic, complete content
- [ ] File naming follows exact conventions
- [ ] Resolution scales are correct

### After Export:
- [ ] File sizes are optimized
- [ ] All files are in correct folders
- [ ] PNG transparency is preserved
- [ ] SVG icons scale properly
- [ ] JSON tokens are valid and complete
- [ ] Naming conventions are consistent
- [ ] All required components are included

---

## DESIGN SYSTEM SPECIFICATIONS

### Colors
- **Primary Blue**: #0088cc (exact Rdio blue)
- **Background**: #ffffff (pure white)
- **Off-white**: #fafbfc 
- **Card Background**: #f4f5f7
- **Text Primary**: #1e252b
- **Text Secondary**: #9da7b0

### Typography
- **Font**: SF Pro Display
- **Giant Header**: 40px/48px, weight 200
- **Body**: 16px/24px, weight 400
- **Caption**: 12px/16px, weight 400
- **Button**: 14px/20px, weight 600, UPPERCASE

### Spacing
- **Mobile Width**: 375px
- **Track Card**: 343px × 64px
- **Border Radius**: 8px (cards), 20px (buttons)
- **Section Spacing**: 24px
- **Element Gap**: 8px

### Shadows
- **Default**: 0px 2px 6px rgba(0,0,0,0.08)
- **Elevated**: 0px 4px 12px rgba(0,0,0,0.12)

This export configuration ensures a complete, consistent design system that can be implemented across any platform while maintaining the exact CoreTet brand specifications.