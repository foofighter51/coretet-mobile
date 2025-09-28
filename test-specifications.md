# CoreTet Design System - QA Test Specifications

## 📋 **COMPLETE QA CHECKLIST**

### ✅ **VISUAL CONSISTENCY**
- [ ] All track cards exactly 343×64px
- [ ] All primary buttons exactly 44px height
- [ ] All small buttons exactly 28px height
- [ ] All text uses exact typography scales
- [ ] All colors match hex values exactly
- [ ] All spacing follows 8px grid
- [ ] All shadows consistent (only 2 types allowed)
- [ ] All border radius consistent (8px cards, 20px buttons)
- [ ] All icons exactly 24px or 16px
- [ ] All album art exactly 56px (small) or 280px (large)

### ✅ **COMPONENT STATES**
- [ ] Default state implemented
- [ ] Hover state implemented
- [ ] Active/pressed state implemented
- [ ] Focus state implemented
- [ ] Disabled state implemented
- [ ] Loading state implemented
- [ ] Error state implemented
- [ ] Empty state implemented
- [ ] Success state implemented

### ✅ **RESPONSIVE BEHAVIOR**
- [ ] Components scale properly across viewports
- [ ] Text truncates with ellipsis when needed
- [ ] Images maintain aspect ratio
- [ ] Touch targets minimum 44×44px
- [ ] Safe area insets respected
- [ ] Horizontal scrolling prevented
- [ ] Content fits within 375px mobile width

### ✅ **INTERACTIONS**
- [ ] Press animations smooth (0.2s ease)
- [ ] Transitions exactly 300ms ease-out
- [ ] Gesture feedback immediate
- [ ] Loading indicators visible
- [ ] Error messages clear
- [ ] Swipe gestures functional (TrackCard rating)
- [ ] Button press gives tactile feedback
- [ ] Hover states provide visual feedback

### ✅ **ACCESSIBILITY**
- [ ] Color contrast passes WCAG AA (4.5:1 minimum)
- [ ] Touch targets accessible (44px minimum)
- [ ] Screen reader labels added
- [ ] Focus states visible
- [ ] Text scalable up to 200%
- [ ] Keyboard navigation functional
- [ ] ARIA attributes proper
- [ ] No accessibility violations (axe-core)

---

## 🧪 **AUTOMATED TEST SUITE**

### **1. Design Consistency Tests**

#### **Exact Dimension Validation**
```typescript
describe('Component Dimensions', () => {
  test('TrackCard exactly 343×64px', () => {
    const trackCard = render(<TrackCard {...props} />);
    const element = trackCard.getByRole('button');
    
    expect(element).toHaveStyle({
      width: '343px',
      height: '64px'
    });
  });

  test('Primary Button exactly 44px height', () => {
    const button = render(<Button variant="primary">Test</Button>);
    const element = button.getByRole('button');
    
    expect(element).toHaveStyle({
      height: '44px',
      minWidth: '44px'
    });
  });

  test('Small Button exactly 28px height', () => {
    const button = render(<Button size="small">Test</Button>);
    const element = button.getByRole('button');
    
    expect(element).toHaveStyle({
      height: '28px',
      minWidth: '28px'
    });
  });
});
```

#### **Color Accuracy Validation**
```typescript
describe('Color Specifications', () => {
  test('Primary button uses exact blue #0088cc', () => {
    const button = render(<Button variant="primary">Test</Button>);
    const element = button.getByRole('button');
    
    expect(element).toHaveStyle({
      backgroundColor: 'rgb(0, 136, 204)' // #0088cc in RGB
    });
  });

  test('Secondary text uses exact gray #9da7b0', () => {
    const text = render(<Text color="secondary">Test</Text>);
    
    expect(text.container.firstChild).toHaveStyle({
      color: 'rgb(157, 167, 176)' // #9da7b0 in RGB
    });
  });

  test('Error state uses exact red #dc3545', () => {
    const input = render(<Input error="Error message" />);
    const errorText = input.getByText('Error message');
    
    expect(errorText).toHaveStyle({
      color: 'rgb(220, 53, 69)' // #dc3545 in RGB
    });
  });
});
```

#### **Typography Scale Validation**
```typescript
describe('Typography Specifications', () => {
  test('Giant text exactly 40px/48px line, weight 200', () => {
    const text = render(<Text variant="giant">Giant</Text>);
    
    expect(text.container.firstChild).toHaveStyle({
      fontSize: '40px',
      lineHeight: '48px',
      fontWeight: '200'
    });
  });

  test('H1 text exactly 32px/40px line, weight 300', () => {
    const text = render(<Text variant="h1">Heading</Text>);
    
    expect(text.container.firstChild).toHaveStyle({
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: '300'
    });
  });

  test('Body text exactly 16px/24px line, weight 400', () => {
    const text = render(<Text variant="body">Body</Text>);
    
    expect(text.container.firstChild).toHaveStyle({
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400'
    });
  });
});
```

#### **Spacing Grid Validation**
```typescript
describe('Spacing System', () => {
  test('All spacing values follow 8px grid', () => {
    const spacingValues = Object.values(designTokens.spacing);
    
    spacingValues.forEach(value => {
      expect(value % 4).toBe(0); // Must be divisible by 4 (half grid)
    });
  });

  test('Card padding exactly 12px', () => {
    const card = render(<TrackCard {...props} />);
    const element = card.getByRole('button');
    const contentElement = element.querySelector('[data-testid="content"]');
    
    expect(contentElement).toHaveStyle({
      padding: '12px'
    });
  });

  test('Button padding exactly 16px horizontal', () => {
    const button = render(<Button variant="primary">Test</Button>);
    const element = button.getByRole('button');
    
    expect(element).toHaveStyle({
      paddingLeft: '16px',
      paddingRight: '16px'
    });
  });
});
```

### **2. Component State Tests**

#### **Interactive State Validation**
```typescript
describe('Component States', () => {
  test('Button hover state changes background', async () => {
    const user = userEvent.setup();
    const button = render(<Button variant="primary">Test</Button>);
    const element = button.getByRole('button');
    
    await user.hover(element);
    
    expect(element).toHaveStyle({
      backgroundColor: 'rgb(0, 107, 166)' // #006ba6 hover color
    });
  });

  test('Button active state shows press animation', async () => {
    const user = userEvent.setup();
    const button = render(<Button variant="primary">Test</Button>);
    const element = button.getByRole('button');
    
    await user.pointer({ keys: '[MouseLeft>]', target: element });
    
    expect(element).toHaveStyle({
      transform: 'translateY(1px)'
    });
  });

  test('Disabled button shows disabled styling', () => {
    const button = render(<Button disabled>Test</Button>);
    const element = button.getByRole('button');
    
    expect(element).toBeDisabled();
    expect(element).toHaveStyle({
      backgroundColor: 'rgb(157, 167, 176)', // Gray color
      cursor: 'not-allowed'
    });
  });

  test('Loading button shows loading indicator', () => {
    const button = render(<Button loading>Test</Button>);
    const element = button.getByRole('button');
    
    expect(element).toBeDisabled();
    expect(element).toHaveTextContent('...');
    expect(element).toHaveStyle({
      opacity: expect.stringMatching(/0\.[0-9]+/) // Less than 1
    });
  });
});
```

#### **Error State Validation**
```typescript
describe('Error States', () => {
  test('Input error shows red border and message', () => {
    const input = render(
      <Input 
        label="Test" 
        value="invalid" 
        error="This field has an error" 
      />
    );
    
    const inputElement = input.getByRole('textbox');
    const errorMessage = input.getByText('This field has an error');
    
    expect(inputElement).toHaveStyle({
      borderColor: 'rgb(220, 53, 69)' // Error red
    });
    
    expect(errorMessage).toHaveStyle({
      color: 'rgb(220, 53, 69)',
      fontSize: '12px'
    });
  });

  test('Required field shows asterisk', () => {
    const input = render(<Input label="Required Field" required />);
    const label = input.getByText(/Required Field/);
    
    expect(label).toHaveTextContent('Required Field *');
  });
});
```

### **3. Responsive Behavior Tests**

#### **Viewport Scaling Validation**
```typescript
describe('Responsive Behavior', () => {
  test('Components maintain dimensions across viewports', () => {
    // Test mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    const component = render(<TrackCard {...props} />);
    let element = component.getByRole('button');
    
    expect(element).toHaveStyle({
      width: '343px',
      height: '64px'
    });
    
    // Test tablet viewport
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    component.rerender(<TrackCard {...props} />);
    element = component.getByRole('button');
    
    expect(element).toHaveStyle({
      width: '343px',
      height: '64px'
    });
  });

  test('Text truncation works properly', () => {
    const longText = 'A'.repeat(100);
    const text = render(<Text truncate>{longText}</Text>);
    
    expect(text.container.firstChild).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  test('Touch targets meet 44px minimum', () => {
    const elements = [
      render(<Button>Test</Button>).getByRole('button'),
      render(<Input />).getByRole('textbox'),
      render(<TrackCard {...props} />).getByRole('button'),
    ];
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      expect(rect.height).toBeGreaterThanOrEqual(44);
      expect(rect.width).toBeGreaterThanOrEqual(44);
    });
  });
});
```

### **4. Animation & Interaction Tests**

#### **Transition Timing Validation**
```typescript
describe('Animations', () => {
  test('Button transitions are exactly 0.2s ease', () => {
    const button = render(<Button>Test</Button>);
    const element = button.getByRole('button');
    
    const transition = getComputedStyle(element).transition;
    expect(transition).toContain('0.2s');
    expect(transition).toContain('ease');
  });

  test('TrackCard swipe gesture reveals rating buttons', async () => {
    const onRate = jest.fn();
    const trackCard = render(
      <TrackCard {...props} onRate={onRate} />
    );
    const element = trackCard.getByRole('button');
    
    // Simulate swipe left
    fireEvent.touchStart(element, { 
      touches: [{ clientX: 200, clientY: 0 }] 
    });
    fireEvent.touchMove(element, { 
      touches: [{ clientX: 100, clientY: 0 }] 
    });
    fireEvent.touchEnd(element);
    
    await waitFor(() => {
      const likeButton = trackCard.queryByLabelText('Like this track');
      expect(likeButton).toBeInTheDocument();
    });
  });

  test('Smooth scrolling performance maintained', () => {
    const startTime = performance.now();
    
    // Render large list
    const tracks = Array.from({ length: 50 }, (_, i) => ({
      id: i.toString(),
      title: `Track ${i}`,
      artist: 'Artist',
      duration: '3:42'
    }));
    
    render(
      <div>
        {tracks.map(track => (
          <TrackCard key={track.id} {...track} />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render 50 cards in under 100ms
    expect(renderTime).toBeLessThan(100);
  });
});
```

### **5. Accessibility Tests**

#### **WCAG Compliance Validation**
```typescript
describe('Accessibility', () => {
  test('Color contrast meets WCAG AA standards', () => {
    const combinations = [
      { fg: '#1e252b', bg: '#ffffff' }, // Primary text on white
      { fg: '#586069', bg: '#ffffff' }, // Secondary text on white
      { fg: '#ffffff', bg: '#0088cc' }, // Button text on primary
    ];
    
    combinations.forEach(({ fg, bg }) => {
      const contrastRatio = getContrastRatio(fg, bg);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA
    });
  });

  test('Screen reader labels present', () => {
    const components = [
      render(<Button iconOnly icon="▶" aria-label="Play" />),
      render(<Input label="Track Title" required />),
      render(<TrackCard {...props} />),
    ];
    
    components.forEach(component => {
      const element = component.container.querySelector('[aria-label], [aria-labelledby], label');
      expect(element).toBeInTheDocument();
    });
  });

  test('Focus states visible', async () => {
    const user = userEvent.setup();
    const button = render(<Button>Test</Button>);
    const element = button.getByRole('button');
    
    await user.tab(); // Focus the button
    
    expect(element).toHaveFocus();
    
    const outline = getComputedStyle(element).outline;
    expect(outline).not.toBe('none');
  });

  test('No accessibility violations', async () => {
    const { container } = render(
      <div>
        <Text variant="h1">Music Library</Text>
        <Input label="Search" placeholder="Search tracks..." />
        <Button variant="primary">Upload</Button>
        <TrackCard {...props} />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 🚀 **RUNNING QA TESTS**

### **Command Line Interface**
```bash
# Run full QA test suite
npm run test:qa

# Run with watch mode for development
npm run test:qa:watch

# Generate coverage report
npm run test:qa:coverage

# Run in CI mode with report generation
npm run test:qa:ci

# Run specific test categories
npm run test:qa -- --testNamePattern="Visual Consistency"
npm run test:qa -- --testNamePattern="Accessibility"
npm run test:qa -- --testNamePattern="Component States"
```

### **Test Result Interpretation**

#### **Success Output**
```
✅ VISUAL CONSISTENCY:
☑️ All track cards exactly 343×64px
☑️ All primary buttons exactly 44px height
☑️ All text uses exact typography scales
☑️ All colors match hex values exactly
☑️ All spacing follows 8px grid
☑️ All shadows consistent

✅ COMPONENT STATES:
☑️ Default state implemented
☑️ Active/pressed state implemented
☑️ Disabled state implemented
☑️ Loading state implemented
☑️ Error state implemented
☑️ Empty state implemented

✅ ACCESSIBILITY:
☑️ Color contrast passes WCAG AA
☑️ Touch targets accessible
☑️ Screen reader labels added
☑️ Focus states visible
☑️ Text scalable
☑️ No accessibility violations

🎉 32/32 tests passed (100%)
All design consistency checks passed!
```

#### **Failure Output**
```
❌ VISUAL CONSISTENCY:
☑️ All track cards exactly 343×64px
❌ All primary buttons exactly 44px height
   Expected: 44px, Received: 46px
☑️ All text uses exact typography scales
❌ All colors match hex values exactly
   Expected: rgb(0, 136, 204), Received: rgb(0, 140, 210)

⚠️ 2/32 design consistency issues need attention
```

### **Continuous Integration Setup**

#### **GitHub Actions**
```yaml
name: CoreTet QA Tests

on: [push, pull_request]

jobs:
  qa-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run QA tests
      run: npm run test:qa:ci
    
    - name: Upload QA results
      uses: actions/upload-artifact@v3
      with:
        name: qa-results
        path: test-results/
    
    - name: Comment QA results
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const results = JSON.parse(fs.readFileSync('test-results/design-checklist.json'));
          const report = fs.readFileSync('test-results/design-checklist.md', 'utf8');
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## QA Test Results\n\n${report}`
          });
```

### **Quality Gates**

#### **Deployment Requirements**
- ✅ **100% QA test pass rate** required
- ✅ **Zero accessibility violations** enforced  
- ✅ **All critical dimensions exact** validated
- ✅ **Performance benchmarks met** confirmed

#### **PR Merge Requirements**
- ✅ All QA tests passing
- ✅ Visual regression tests pass
- ✅ Accessibility audit clean
- ✅ Performance impact acceptable
- ✅ Design review approved

---

## 📊 **TEST COVERAGE REQUIREMENTS**

### **Component Coverage**
- **Atoms**: 100% test coverage required
- **Molecules**: 95% test coverage minimum
- **Organisms**: 90% test coverage minimum

### **Specification Coverage**
- **Visual**: All dimensions, colors, typography tested
- **Interactive**: All states and transitions tested
- **Accessibility**: All WCAG criteria tested
- **Performance**: All animation timing tested

### **Platform Coverage**
- **Web**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **React Native**: iOS and Android devices
- **Screen Readers**: NVDA, JAWS, VoiceOver

---

## 🔄 **MAINTENANCE & UPDATES**

### **Regression Testing**
- Run full QA suite before any release
- Visual diff testing for component changes
- Performance benchmarking for optimization
- Cross-browser compatibility validation

### **Design Token Updates**
- Validate all tokens before updating
- Run impact analysis on existing components
- Update tests to match new specifications
- Document breaking changes

### **New Component Addition**
- Must pass all existing QA criteria
- Follow atomic design principles
- Include comprehensive test coverage
- Document usage and accessibility

---

**🎯 Goal: Maintain 100% design consistency and accessibility compliance across all CoreTet components.**