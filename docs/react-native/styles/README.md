# CoreTet React Native Style System

A comprehensive React Native StyleSheet implementation of the CoreTet design system with exact token values, utility functions, and organized style modules.

## Overview

This style system provides:
- **Exact Design Token Values**: All colors, typography, spacing, and dimensions from the CoreTet design system
- **Organized Style Modules**: Global, component, and layout styles in separate files
- **Utility Functions**: Helper functions for creating dynamic styles
- **TypeScript Support**: Full type safety and IntelliSense
- **Performance Optimized**: All styles pre-compiled with StyleSheet.create()

## File Structure

```
/react-native/styles/
├── index.ts              # Main exports and utility functions
├── globalStyles.ts       # Global styles (typography, containers, etc.)
├── componentStyles.ts    # Component-specific styles
├── layoutStyles.ts       # Layout and spacing utilities
└── README.md            # This documentation
```

## Usage

### Basic Import and Usage

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles, componentStyles, layoutStyles } from './styles';

export const MyComponent = () => {
  return (
    <View style={[globalStyles.screen, layoutStyles.paddingLG]}>
      <Text style={globalStyles.h1}>Welcome to CoreTet</Text>
      <View style={componentStyles.cardDefault}>
        <Text style={globalStyles.body}>This is a card component</Text>
      </View>
    </View>
  );
};
```

### Using Utility Functions

```tsx
import { createButtonStyle, createTextStyle, getColor, getSpacing } from './styles';

const MyButton = ({ variant, onPress }) => {
  return (
    <TouchableOpacity 
      style={createButtonStyle(variant, 'default', 'default')}
      onPress={onPress}
    >
      <Text style={createTextStyle('button', getColor('neutral', 'white'))}>
        CLICK ME
      </Text>
    </TouchableOpacity>
  );
};
```

## Style Modules

### 🌐 globalStyles.ts

Contains foundational styles used across the entire application:

**Typography Styles:**
```tsx
globalStyles.h1          // 32px, weight 300, charcoal
globalStyles.h2          // 24px, weight 400, charcoal  
globalStyles.h3          // 20px, weight 500, charcoal
globalStyles.body        // 16px, weight 400, dark gray
globalStyles.bodySmall   // 14px, weight 400, dark gray
globalStyles.caption     // 12px, weight 400, gray
globalStyles.buttonText  // 14px, weight 600, uppercase
```

**Container Styles:**
```tsx
globalStyles.screen           // Full screen container
globalStyles.screenContent    // Screen with padding
globalStyles.mobileContainer  // 375px mobile container
globalStyles.card            // Standard card styling
globalStyles.cardElevated    // Card with elevated shadow
```

**Input Styles:**
```tsx
globalStyles.inputField      // Standard input field
globalStyles.inputLabel      // Input field label
globalStyles.inputError      // Error message text
```

### 🧩 componentStyles.ts

Component-specific styles organized by component type:

**TrackCard Styles:**
```tsx
componentStyles.trackCardBase         // Base track card
componentStyles.trackCardContent      // Inner content layout
componentStyles.trackCardPlaying      // Playing state (blue border)
componentStyles.trackCardTitle        // Track title text
componentStyles.trackCardDuration     // Duration text
componentStyles.trackCardRatingButton // Swipe rating buttons
```

**Button Styles:**
```tsx
componentStyles.buttonBase           // Base button layout
componentStyles.buttonPrimary        // Primary button (blue)
componentStyles.buttonSecondary      // Secondary button (outlined)
componentStyles.buttonTextPrimary    // Primary button text
componentStyles.buttonTextSecondary  // Secondary button text
```

**TabBar Styles:**
```tsx
componentStyles.tabBarContainer      // Tab bar container
componentStyles.tabBarItem          // Individual tab item
componentStyles.tabBarLabel         // Tab label text
componentStyles.tabBarBadge         // Notification badge
```

### 📐 layoutStyles.ts

Layout and spacing utilities for consistent positioning:

**Screen Layouts:**
```tsx
layoutStyles.screenContainer        // Full screen layout
layoutStyles.screenContent         // Content with padding
layoutStyles.screenContentCentered // Centered content layout
```

**Spacing Utilities:**
```tsx
layoutStyles.paddingLG      // 16px padding
layoutStyles.marginXL       // 24px margin
layoutStyles.gapMD          // 12px gap
layoutStyles.spacingLG      // 16px padding all sides
```

**Flex Utilities:**
```tsx
layoutStyles.flexRow        // Row direction
layoutStyles.flexCenter     // Center content
layoutStyles.flexBetween    // Space between
layoutStyles.flex1          // Flex: 1
```

## Utility Functions

### Style Creation Functions

**createButtonStyle(variant, size, state)**
```tsx
// Create primary button
const primaryButton = createButtonStyle('primary', 'default', 'default');

// Create small secondary button
const smallButton = createButtonStyle('secondary', 'small', 'default');

// Create disabled primary button
const disabledButton = createButtonStyle('primary', 'default', 'disabled');
```

**createInputStyle(state)**
```tsx
// Default input
const defaultInput = createInputStyle('default');

// Focused input (blue border)
const focusedInput = createInputStyle('focused');

// Error input (red border)
const errorInput = createInputStyle('error');
```

**createCardStyle(variant)**
```tsx
// Default card with shadow
const defaultCard = createCardStyle('default');

// Elevated card (stronger shadow)
const elevatedCard = createCardStyle('elevated');

// Outlined card (border instead of shadow)
const outlinedCard = createCardStyle('outlined');
```

### Token Access Functions

**getColor(category, shade)**
```tsx
const primaryBlue = getColor('primary', 'blue');        // #0088cc
const neutralGray = getColor('neutral', 'gray');        // #9da7b0
const accentTeal = getColor('accent', 'teal');          // #17a2b8
```

**getSpacing(size)**
```tsx
const smallSpacing = getSpacing('sm');    // 8
const largeSpacing = getSpacing('lg');    // 16
const extraLarge = getSpacing('xl');      // 24
```

**getTypographyStyle(style)**
```tsx
const h1Style = getTypographyStyle('h1');
// Returns: { fontFamily: 'SF Pro Display', fontSize: 32, lineHeight: 40, fontWeight: '300' }

const bodyStyle = getTypographyStyle('body');
// Returns: { fontFamily: 'SF Pro Display', fontSize: 16, lineHeight: 24, fontWeight: '400' }
```

## Design Token Values

### Colors
```tsx
// Primary Colors
tokens.colors.primary.blue           // #0088cc
tokens.colors.primary.blueHover      // #006ba6
tokens.colors.primary.blueLight      // #e8f4f8
tokens.colors.primary.blueUltraLight // #f5fafe

// Neutral Colors
tokens.colors.neutral.white          // #ffffff
tokens.colors.neutral.offWhite       // #fafbfc
tokens.colors.neutral.lightGray      // #f4f5f7
tokens.colors.neutral.gray           // #9da7b0
tokens.colors.neutral.darkGray       // #586069
tokens.colors.neutral.charcoal       // #1e252b

// Accent Colors
tokens.colors.accent.teal            // #17a2b8
tokens.colors.accent.amber           // #ffc107
tokens.colors.accent.green           // #28a745
tokens.colors.accent.coral           // #fd7e14
```

### Typography
```tsx
// Font Weights
tokens.typography.fontWeights.ultralight  // 200
tokens.typography.fontWeights.light       // 300
tokens.typography.fontWeights.normal      // 400
tokens.typography.fontWeights.medium      // 500
tokens.typography.fontWeights.semibold    // 600
tokens.typography.fontWeights.bold        // 700

// Text Styles
tokens.typography.giant.fontSize          // 40
tokens.typography.h1.fontSize             // 32
tokens.typography.h2.fontSize             // 24
tokens.typography.body.fontSize           // 16
tokens.typography.caption.fontSize        // 12
```

### Spacing
```tsx
tokens.spacing.xs     // 4
tokens.spacing.sm     // 8
tokens.spacing.md     // 12
tokens.spacing.lg     // 16
tokens.spacing.xl     // 24
tokens.spacing.xxl    // 32
tokens.spacing.xxxl   // 48
```

### Dimensions
```tsx
tokens.dimensions.mobile.width           // 375
tokens.dimensions.trackCard.width        // 343
tokens.dimensions.trackCard.height       // 64
tokens.dimensions.button.height          // 44
tokens.dimensions.button.heightSmall     // 28
tokens.dimensions.icon.default           // 24
tokens.dimensions.icon.small             // 16
tokens.dimensions.avatar                 // 40
```

### Shadows
```tsx
tokens.shadows.default = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2  // Android
}

tokens.shadows.elevated = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 4  // Android
}
```

## Common Patterns

### Screen Layout
```tsx
import { globalStyles, layoutStyles } from './styles';

export const MyScreen = () => (
  <View style={globalStyles.screen}>
    <View style={layoutStyles.screenContent}>
      <Text style={globalStyles.h1}>Screen Title</Text>
      {/* Content here */}
    </View>
  </View>
);
```

### Card with Content
```tsx
import { componentStyles, globalStyles } from './styles';

export const ContentCard = ({ title, description }) => (
  <View style={componentStyles.cardDefault}>
    <Text style={globalStyles.h3}>{title}</Text>
    <Text style={globalStyles.body}>{description}</Text>
  </View>
);
```

### Button with Dynamic State
```tsx
import { createButtonStyle, createTextStyle } from './styles';

export const DynamicButton = ({ variant, disabled, onPress, title }) => {
  const buttonStyle = createButtonStyle(
    variant, 
    'default', 
    disabled ? 'disabled' : 'default'
  );
  
  const textColor = variant === 'primary' ? 'white' : 'blue';
  const textStyle = createTextStyle('button', getColor('neutral', textColor));

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};
```

### Form Layout
```tsx
import { layoutStyles, globalStyles, createInputStyle } from './styles';

export const FormExample = () => (
  <View style={layoutStyles.formContainer}>
    <View style={layoutStyles.formField}>
      <Text style={globalStyles.inputLabel}>Track Title</Text>
      <TextInput style={createInputStyle('default')} />
    </View>
    <View style={layoutStyles.formActions}>
      <TouchableOpacity style={createButtonStyle('primary')}>
        <Text style={createTextStyle('button', 'white')}>SAVE</Text>
      </TouchableOpacity>
    </View>
  </View>
);
```

## Performance Notes

- All styles are created using `StyleSheet.create()` for optimal performance
- Utility functions return style objects that can be cached
- Use style composition with arrays: `style={[baseStyle, conditionalStyle]}`
- Avoid creating styles in render methods; use the provided utilities instead

## Migration from Web

If migrating from the web Tailwind CSS version:

```css
/* Web CSS */
.bg-rdio-primary → tokens.colors.primary.blue
.text-h1 → globalStyles.h1
.p-lg → layoutStyles.paddingLG
.shadow-default → tokens.shadows.default
```

## Contributing

When adding new styles:
1. Use exact token values from the design system
2. Follow the existing naming conventions
3. Add styles to the appropriate module (global, component, or layout)
4. Create utility functions for dynamic styles
5. Update this documentation with examples

This React Native style system ensures perfect consistency with the CoreTet design system while providing the flexibility and performance needed for mobile applications.