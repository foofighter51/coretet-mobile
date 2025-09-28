# CoreTet Design System - QA Testing Suite

Comprehensive test suite to verify design consistency across the CoreTet Design System.

## 🎯 Purpose

This testing suite programmatically validates every aspect of the design system to ensure:
- **Visual Consistency**: Exact dimensions, colors, typography, spacing, and shadows
- **Component States**: All interactive states function correctly
- **Responsive Behavior**: Proper scaling, truncation, and touch targets
- **Interactions**: Smooth animations and immediate feedback
- **Accessibility**: WCAG compliance and screen reader support

## 📋 QA Checklist Coverage

### ✅ VISUAL CONSISTENCY
- [ ] All track cards exactly 343x64px
- [ ] All primary buttons exactly 44px height  
- [ ] All text uses exact typography scales
- [ ] All colors match hex values exactly
- [ ] All spacing follows 8px grid
- [ ] All shadows consistent

### ✅ COMPONENT STATES
- [ ] Default state implemented
- [ ] Active/pressed state implemented
- [ ] Disabled state implemented
- [ ] Loading state implemented
- [ ] Error state implemented
- [ ] Empty state implemented

### ✅ RESPONSIVE BEHAVIOR
- [ ] Components scale properly
- [ ] Text truncates with ellipsis
- [ ] Images maintain aspect ratio
- [ ] Touch targets minimum 44x44px
- [ ] Safe area insets respected

### ✅ INTERACTIONS
- [ ] Press animations smooth
- [ ] Transitions 300ms ease-out
- [ ] Gesture feedback immediate
- [ ] Loading indicators visible
- [ ] Error messages clear

### ✅ ACCESSIBILITY
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets accessible
- [ ] Screen reader labels added
- [ ] Focus states visible
- [ ] Text scalable

## 🚀 Running Tests

### Basic QA Test Run
```bash
npm run test:qa
```

### Watch Mode (Development)
```bash
npm run test:qa:watch
```

### Coverage Report
```bash
npm run test:qa:coverage
```

### CI/CD Integration
```bash
npm run test:qa:ci
```

## 📊 Test Results

After running tests, results are generated in `test-results/`:

- **`design-checklist.md`**: Human-readable checklist with ✅/❌ status
- **`design-checklist.json`**: Machine-readable results for CI/CD
- **`junit.xml`**: JUnit format for CI integration
- **`coverage/`**: Code coverage reports

## 🔧 Test Structure

### Core Test Files

**`design-consistency.test.tsx`**
- Main QA test suite
- Validates all checklist items
- Uses real DOM measurements
- Includes accessibility auditing

**`test-utils.tsx`**
- Custom render functions
- Design token validators
- Animation testing utilities
- Gesture simulation helpers

**`setup.ts`**
- Global test configuration
- JSDOM polyfills
- Mock implementations
- CoreTet-specific defaults

## 🎨 Design Token Validation

The test suite validates exact design tokens:

```typescript
// Color validation
expect(isColorMatch(
  getComputedStyleValue(element, 'background-color'),
  colors.primary.blue // #0088cc
)).toBe(true);

// Dimension validation
expect(validateDimensions(element, 343, 64)).toBe(true);

// Typography validation
expect(validateTypography(element, {
  size: '40px',
  weight: '200',
  lineHeight: '48px'
})).toBe(true);
```

## 📱 Mobile-First Testing

All tests run in a mobile-first environment:
- **375px** viewport width (iPhone 12 Mini)
- **Touch target** validation (44px minimum)
- **Gesture simulation** for swipe interactions
- **Safe area** handling verification

## ♿ Accessibility Testing

Comprehensive accessibility validation:
- **axe-core** integration for WCAG compliance
- **Color contrast** ratio checking
- **Focus management** validation
- **Screen reader** label verification
- **Keyboard navigation** testing

## 🎭 Component State Testing

Each component is tested in all states:

```typescript
// Test all button states
test('✓ All button states functional', () => {
  // Default state
  expect(button).toBeEnabled();
  
  // Hover state
  fireEvent.mouseEnter(button);
  expect(getTransform(button)).toBeDefined();
  
  // Disabled state
  rerender(<Button disabled>Disabled</Button>);
  expect(button).toBeDisabled();
  
  // Loading state
  rerender(<Button loading>Loading</Button>);
  expect(button).toHaveTextContent('...');
});
```

## 🎪 Animation & Interaction Testing

Validates smooth user experiences:

```typescript
// Test press animations
test('✓ Press animations smooth', () => {
  const transition = getComputedStyleValue(element, 'transition');
  expect(transition).toContain('0.2s ease');
  
  fireEvent.mouseDown(element);
  expect(getTransform(element)).toBe('translateY(1px)');
});

// Test swipe gestures  
test('✓ Swipe gestures responsive', () => {
  simulateSwipe(trackCard, 'left', 100);
  expect(onRate).toHaveBeenCalledWith('like');
});
```

## 📐 Responsive Testing

Ensures components work across screen sizes:

```typescript
// Test responsive scaling
test('✓ Components scale properly', () => {
  setViewportSize(375, 812); // Mobile
  expect(validateResponsiveBreakpoint(element, 375)).toBe(true);
  
  setViewportSize(768, 1024); // Tablet
  expect(element.getBoundingClientRect().width).toBeLessThanOrEqual(768);
});
```

## 🚨 Error Handling

Tests validate error states and edge cases:

```typescript
// Test error boundaries
test('✓ Error states handled gracefully', () => {
  const ThrowError = () => { throw new Error('Test error'); };
  
  render(
    <TestErrorBoundary>
      <ThrowError />
    </TestErrorBoundary>
  );
  
  expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
});
```

## 🔄 Continuous Integration

### GitHub Actions Integration

```yaml
- name: Run Design QA Tests
  run: npm run test:qa:ci
  
- name: Upload QA Results
  uses: actions/upload-artifact@v3
  with:
    name: qa-results
    path: test-results/
```

### Quality Gates

Tests can be configured as quality gates:
- **95%+ pass rate** required for deployment
- **Zero accessibility violations** enforced
- **All critical dimensions** must be exact

## 🛠️ Customization

### Adding New Checklist Items

1. Add test to `design-consistency.test.tsx`
2. Update `test-results-processor.js` mapping
3. Run tests to validate new criteria

### Custom Validation Functions

Create validators in `test-utils.tsx`:

```typescript
export const validateCustomProperty = (
  element: Element, 
  expectedValue: string
): boolean => {
  const computed = getComputedStyleValue(element, 'custom-property');
  return computed === expectedValue;
};
```

## 📚 Best Practices

### Writing QA Tests

1. **Test Real Behavior**: Use actual DOM measurements
2. **Mobile First**: Always test mobile viewport first
3. **Exact Values**: Validate exact pixel dimensions and hex colors
4. **All States**: Test default, hover, active, disabled, loading, error
5. **Accessibility**: Include axe-core validation in every test

### Debugging Failed Tests

1. **Check Console**: Look for specific failure messages
2. **Inspect Elements**: Use browser dev tools to verify computed styles
3. **Validate Tokens**: Ensure design tokens match expected values
4. **Test Isolation**: Run individual tests to isolate issues

## 🎯 Goals

This QA testing suite ensures:
- **100% Design Consistency** across all components
- **Zero Accessibility Violations** in production
- **Pixel-Perfect** implementation of design specifications  
- **Smooth User Experience** with proper animations and feedback
- **Mobile-Optimized** interface that works on all devices

The automated QA process catches design regressions before they reach users, maintaining the high quality standards of the CoreTet Design System.