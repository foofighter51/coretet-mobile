# CoreTet Design System - Storybook Documentation

Complete Storybook documentation for the CoreTet Design System, featuring music collaboration components inspired by classic Rdio design.

## 📖 Overview

This Storybook contains comprehensive documentation and interactive examples for all components in the CoreTet Design System, organized using atomic design principles.

## 🏗️ Component Architecture

### Atoms (Basic Building Blocks)
- **Button**: Primary interactive elements with multiple variants and states
- **Input**: Form input fields with validation, icons, and various types  
- **Text**: Typography component with semantic variants and styling options

### Molecules (Combined Components)
- **TrackCard**: Interactive music track cards with swipe-to-rate functionality
- **TabBar**: Bottom navigation with badges and accessibility features

### Organisms (Complex Components)
- **AudioPlayer**: Full-featured music player with controls and progress tracking

## 🎨 Design Tokens

### Colors
- **Primary**: #0088cc (Rdio-inspired blue)
- **Neutrals**: White, off-white, grays, charcoal
- **Accents**: Teal, amber, green, coral for ratings and highlights
- **System**: Error, success, warning states

### Typography
- **Font**: SF Pro Display
- **Scale**: Giant (40px) → Caption (12px)
- **Weights**: Ultralight (200) → Bold (700)

### Spacing
- **Grid**: 8px base unit
- **Scale**: 4px → 48px (xs → xxxl)

### Mobile Dimensions
- **Container**: 375×812px (iPhone 12 Mini)
- **Touch Targets**: 44px minimum
- **Safe Areas**: Handled automatically

## 📱 Mobile-First Design

All components are designed mobile-first for music collaboration apps:

- **Touch-friendly**: 44px minimum touch targets
- **Swipe gestures**: Track rating via swipe interactions
- **Bottom navigation**: Thumb-zone accessibility
- **Responsive**: Adapts to different screen sizes

## 🎵 Music App Features

### Track Management
- Play/pause controls with visual feedback
- Album art display with fallbacks
- Duration formatting and progress tracking
- Like/Love rating system with swipe gestures

### Collaboration
- Ensemble vs. artist attribution
- Badge notifications for new content
- Touch-optimized interface elements

### Audio Playback
- Full-screen audio player experience
- Progress scrubbing and volume control
- Next/previous track navigation

## 🔧 Usage Examples

### Basic Button
```tsx
import { Button } from '@/components/atoms/Button';

<Button variant="primary" icon={<Plus />}>
  Upload Track
</Button>
```

### Track Card with Rating
```tsx
import { TrackCard } from '@/components/molecules/TrackCard';

<TrackCard
  title="Summer Nights"
  artist="Alex Chen"
  duration="3:42"
  rating="love"
  onRate={(rating) => console.log(rating)}
  onPlayPause={() => console.log('play')}
/>
```

### Audio Player
```tsx
import { AudioPlayer } from '@/components/organisms/AudioPlayer';

<AudioPlayer
  isOpen={true}
  track={{
    title: "Summer Nights",
    artist: "Alex Chen",
    duration: 222
  }}
  isPlaying={true}
  onPlayPause={() => setIsPlaying(!isPlaying)}
/>
```

## 🎯 Interactive Stories

### All Components Include:
- **Default states**: Basic usage examples
- **All variants**: Different styles and sizes
- **Interactive states**: Hover, focus, active, disabled
- **Error states**: Validation and error handling
- **Loading states**: Progress and loading indicators
- **Edge cases**: Long content, empty states, etc.

### Special Features:
- **Interactive playground**: Test components together
- **Accessibility examples**: Screen reader support, keyboard navigation
- **Responsive showcase**: Mobile, tablet, desktop views
- **Design token reference**: Colors, spacing, typography
- **Real-world examples**: Music app use cases

## 🏃‍♂️ Getting Started

1. **Browse Components**: Start with the Design System Overview
2. **View Atomic Components**: Understand basic building blocks
3. **Explore Molecules**: See how atoms combine
4. **Try Organisms**: Experience complex interactions
5. **Use Interactive Playground**: Test component combinations

## 📐 Design Principles

### Music-First
- Optimized for audio collaboration workflows
- Track-centric information hierarchy
- Gesture-based rating system

### Touch-Friendly
- Minimum 44px touch targets
- Swipe gesture support
- Thumb-zone navigation placement

### Accessible
- WCAG 2.1 AA compliance
- Screen reader optimization
- Keyboard navigation support
- High contrast ratios

### Consistent
- Rdio-inspired design language
- Cohesive color palette
- Systematic spacing and typography

## 🔄 Component States

Each component documents these states where applicable:

- **Default**: Standard appearance
- **Hover**: Mouse hover feedback
- **Active/Pressed**: Touch feedback
- **Focus**: Keyboard navigation highlight
- **Disabled**: Non-interactive state
- **Loading**: Progress indication
- **Error**: Validation failure
- **Success**: Successful action

## 📱 Responsive Behavior

Components adapt to different screen sizes:

- **375px**: Base mobile (iPhone 12 Mini)
- **390px**: Standard mobile (iPhone 12)
- **768px**: Tablet (iPad)
- **1024px+**: Desktop

## 🎨 Customization

### Design Tokens
All components use centralized design tokens for:
- Colors and gradients
- Typography scales
- Spacing systems
- Shadow definitions
- Border radius values

### CSS Custom Properties
Components support CSS custom property overrides:
```css
:root {
  --primary: #0088cc;
  --button-radius: 20px;
  --shadow-default: 0px 2px 6px rgba(0, 0, 0, 0.08);
}
```

## 🧪 Testing Stories

Stories include test scenarios for:
- User interactions (click, swipe, type)
- Edge cases (empty states, long content)
- Accessibility (screen readers, keyboard)
- Visual regression (different states)
- Performance (large lists, animations)

This comprehensive Storybook serves as both documentation and testing environment for the complete CoreTet Design System.