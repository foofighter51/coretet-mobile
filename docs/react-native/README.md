# CoreTet React Native Component Library

A complete React Native component library implementing the CoreTet design system with exact token values, animations, and TypeScript support.

## Installation

```bash
npm install react-native-reanimated react-native-gesture-handler
```

For iOS, run:
```bash
cd ios && pod install
```

## Usage

```tsx
import { TrackCard, Button, Input, TabBar } from './react-native/components';
import { tokens } from './react-native/tokens';

// Use components with full TypeScript support
<TrackCard
  title="Summer Nights"
  duration="3:42"
  isPlaying={false}
  rating="like"
  onPlayPause={() => console.log('Play/Pause')}
  onRate={(rating) => console.log('Rated:', rating)}
/>
```

## Components

### TrackCard
Full-featured track card with swipe-to-rate functionality:
- **States**: default, playing, disabled
- **Animations**: Swipe gestures, scale feedback
- **Features**: Play/pause, rating (like/love), duration display

```tsx
<TrackCard
  title="Track Title"
  duration="3:42"
  isPlaying={false}
  rating="none"
  onPlayPause={() => {}}
  onRate={(rating) => {}}
/>
```

### Button
Animated button with primary/secondary variants:
- **Variants**: primary, secondary
- **Sizes**: default, small
- **States**: default, disabled, loading
- **Animations**: Scale on press

```tsx
<Button
  title="Upload Track"
  variant="primary"
  size="default"
  onPress={() => {}}
/>
```

### Input
Animated input field with validation:
- **Features**: Label, placeholder, error states
- **Types**: text, password, multiline
- **Animations**: Border color transitions
- **Validation**: Error messages with styling

```tsx
<Input
  label="Track Title"
  placeholder="Enter track name..."
  value={value}
  onChangeText={setValue}
  error={error}
/>
```

### TabBar
Animated tab bar with badges:
- **Features**: Icons, labels, badge notifications
- **Animations**: Color transitions, background changes
- **States**: active, inactive, disabled

```tsx
<TabBar
  tabs={[
    { id: 'tracks', label: 'Tracks', icon: '🎵', badge: 5 },
    { id: 'bands', label: 'Bands', icon: '👥' }
  ]}
  activeTab="tracks"
  onTabChange={setActiveTab}
/>
```

### Card
Flexible container with variants and press feedback:
- **Variants**: default, elevated, outlined
- **Features**: Optional press handling
- **Animations**: Scale feedback on press

```tsx
<Card variant="elevated" pressable onPress={() => {}}>
  <Text>Card Content</Text>
</Card>
```

### LoadingSpinner
Animated loading indicator:
- **Sizes**: small, medium, large
- **Customizable**: Color, size
- **Animation**: Smooth rotation

```tsx
<LoadingSpinner
  size="medium"
  color={tokens.colors.primary.blue}
/>
```

### Avatar
User avatar with fallback initials:
- **Sources**: Image URL or initials
- **Sizes**: small, medium, large
- **Customizable**: Colors, borders

```tsx
<Avatar
  source="https://..."
  initials="AC"
  size="medium"
/>
```

### EmptyState
Empty state with icon and action:
- **Features**: Icon, title, description, action button
- **Responsive**: Adapts to container

```tsx
<EmptyState
  icon="🎵"
  title="No tracks yet"
  description="Upload your first track to get started"
  actionLabel="Upload Track"
  onAction={() => {}}
/>
```

## Design Tokens

Access the complete CoreTet design system:

```tsx
import { tokens } from './react-native/tokens';

// Colors
tokens.colors.primary.blue        // #0088cc
tokens.colors.neutral.white       // #ffffff
tokens.colors.accent.teal          // #17a2b8

// Typography
tokens.typography.h1.fontSize      // 32
tokens.typography.body.lineHeight  // 24

// Spacing
tokens.spacing.lg                  // 16
tokens.spacing.xl                  // 24

// Dimensions
tokens.dimensions.button.height    // 44
tokens.dimensions.icon.default     // 24

// Shadows
tokens.shadows.default             // Complete shadow object
tokens.shadows.elevated            // Elevated shadow object
```

## Animation Features

### Gesture Support
- **TrackCard**: Swipe left to reveal rating buttons
- **Button**: Scale feedback on press
- **Input**: Border color transitions

### Performance
- All animations use `useNativeDriver: true` where possible
- Smooth 60fps animations on iOS and Android
- Optimized for React Native performance

## TypeScript Support

Complete TypeScript interfaces for all components:

```tsx
interface TrackCardProps {
  title: string;
  duration: string;
  isPlaying?: boolean;
  rating?: 'none' | 'like' | 'love';
  disabled?: boolean;
  onPlayPause?: () => void;
  onRate?: (rating: 'like' | 'love') => void;
}
```

## Platform Compatibility

- **iOS**: Full support with native animations
- **Android**: Full support with gesture handling
- **React Native**: 0.64+
- **Dependencies**: react-native-reanimated, react-native-gesture-handler

## Design System Compliance

All components strictly follow the CoreTet design system:
- **Colors**: Exact hex values from design tokens
- **Typography**: SF Pro Display with exact sizes and weights
- **Spacing**: 8px grid system
- **Shadows**: iOS/Android appropriate shadow values
- **Accessibility**: VoiceOver and TalkBack support

## Example App Structure

```tsx
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { TrackCard, TabBar, Button } from './react-native/components';
import { tokens } from './react-native/tokens';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.neutral.offWhite }}>
      <ScrollView>
        <TrackCard
          title="Summer Nights"
          duration="3:42"
          onPlayPause={() => {}}
          onRate={(rating) => {}}
        />
      </ScrollView>
      
      <TabBar
        tabs={[
          { id: 'tracks', label: 'Tracks', icon: '🎵' },
          { id: 'bands', label: 'Bands', icon: '👥' }
        ]}
        activeTab="tracks"
        onTabChange={setActiveTab}
      />
    </SafeAreaView>
  );
}
```

This React Native component library provides a complete implementation of your CoreTet design system with native animations, gesture support, and TypeScript interfaces.