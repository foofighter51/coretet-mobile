# CoreTet Design System Tokens

## Overview
This directory contains the complete design token system for the CoreTet music collaboration app, extracted from the working application CSS system.

## Token Files

### 📄 `colors.json`
Complete color palette organized by functional categories:
- **Primary**: Main brand blue with hover states and light variations
- **Neutral**: Grayscale palette from white to charcoal
- **Functional**: Border, divider, and shadow colors
- **Accent**: Teal, amber, green, and coral accent colors
- **System**: Error, warning, success, and info colors

### 📄 `typography.json`
Full typography scale with SF Pro Display specifications:
- **Font Family**: SF Pro Display with system fallbacks
- **Font Weights**: Ultralight (200) to Bold (700)
- **Text Styles**: Giant headers (40px) to captions (12px)
- **Line Heights**: Optimized for mobile readability
- **Letter Spacing**: Precise spacing for each style

### 📄 `spacing.json`
Spacing system and dimensions:
- **Scale**: 4px base unit with 8px grid system
- **Dimensions**: Mobile-first component sizes
- **Layout**: Screen padding, card spacing, section gaps
- **Border Radius**: Consistent corner radius values

### 📄 `design-tokens.json`
Complete combined token system in a single file for easy import.

## Usage Examples

### CSS Custom Properties
```css
:root {
  --color-primary: #0088cc;
  --font-size-body: 16px;
  --spacing-lg: 16px;
  --radius-card: 8px;
}
```

### Tailwind Configuration
```js
module.exports = {
  theme: {
    colors: {
      primary: {
        blue: '#0088cc',
        hover: '#006ba6'
      }
    },
    fontSize: {
      body: '16px',
      caption: '12px'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      lg: '16px'
    }
  }
}
```

### React/JavaScript
```js
import tokens from './design-tokens.json';

const primaryColor = tokens.colors.primary.blue; // #0088cc
const bodySize = tokens.typography.styles.body.fontSize; // 16
const cardRadius = tokens.spacing.borderRadius.card; // 8
```

## Design Principles

### Color System
- **Primary Blue (#0088cc)**: Inspired by classic Rdio brand
- **Neutral Palette**: Clean whites and grays for content hierarchy
- **Accent Colors**: Semantic colors for ratings and status indicators
- **Functional Colors**: Borders, dividers, and shadows for subtle structure

### Typography Scale
- **SF Pro Display**: Apple's system font for clean, modern appearance
- **40px Giant Headers**: Ultra-light weight for hero text
- **16px Body Text**: Optimal readability on mobile devices
- **12px Captions**: Metadata and secondary information
- **Precise Line Heights**: Calculated for mobile-first design

### Spacing System
- **8px Grid**: Consistent spacing based on 8px increments
- **Mobile-First Dimensions**: 375px mobile width foundation
- **Component Sizing**: Exact measurements for cards, buttons, icons
- **Touch-Friendly**: 44px minimum touch targets

## Token Structure

### Naming Convention
- **Semantic Names**: Colors and spacing named by purpose, not appearance
- **Hierarchical Structure**: Organized by category and subcategory
- **Consistent Casing**: camelCase for JavaScript compatibility

### Value Format
- **Colors**: Hex values for precise color matching
- **Spacing**: Pixel values for exact positioning
- **Typography**: Pixel sizes with unitless line heights
- **Weights**: Numeric values (200-700) for font weights

## Implementation Notes

### Mobile-First Design
All tokens are optimized for mobile experience:
- 375px base mobile width
- Touch-friendly button heights (44px minimum)
- Readable font sizes (16px body minimum)
- Adequate spacing for finger targets

### Consistency Guarantees
These tokens are extracted from the working CoreTet application CSS, ensuring:
- **Visual Consistency**: Exact color matching across all components
- **Spacing Precision**: Mathematically consistent spacing relationships
- **Typography Harmony**: Carefully balanced text size relationships
- **Cross-Platform Compatibility**: Works across web, iOS, and Android

## File Formats

### JSON Structure
```json
{
  "name": "Token Category",
  "version": "1.0.0",
  "tokenName": {
    "subCategory": "value"
  }
}
```

### Token Types
- **Colors**: Hex values (#0088cc)
- **Dimensions**: Pixel values (16, 24, 44)
- **Typography**: Font sizes, weights, line heights
- **Spacing**: Layout spacing and component dimensions
- **Shadows**: CSS box-shadow values
- **Border Radius**: Corner radius values

## Maintenance

### Versioning
- **Version 1.0.0**: Initial release matching current application
- **Semantic Versioning**: Major.Minor.Patch for future updates
- **Breaking Changes**: Major version increments for incompatible changes

### Updates
When updating tokens:
1. Update source CSS variables in `/styles/globals.css`
2. Extract new values to JSON files
3. Update version numbers
4. Test across all components
5. Document changes in release notes

This token system ensures design consistency and enables efficient scaling of the CoreTet design system across platforms.