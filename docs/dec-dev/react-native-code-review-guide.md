# React Native Codebase Review & Cleanup Guide

Use this guide to systematically review and clean up your React Native app before releasing to testers. Work through each phase sequentially, allowing Claude to implement fixes as you go.

---

## Phase 1: Codebase Audit

### 1.1 Architecture Overview
```
Analyze this React Native codebase and provide:
1. Overall architecture pattern (Redux, Context, MobX, Zustand, etc.)
2. Folder structure assessment - is it logical and scalable?
3. Navigation structure overview
4. List of all third-party dependencies with brief notes on whether each is actively maintained
```

### 1.2 Dead Code Detection
```
Find and list:
1. Unused components (defined but never imported/rendered)
2. Unused functions and variables
3. Unused style definitions
4. Unused imports in each file
5. Any orphaned files not connected to the app
Then remove all confirmed dead code.
```

### 1.3 TODO/FIXME Audit
```
Find all TODO, FIXME, HACK, and XXX comments in the codebase. 
List them with file locations and assess which ones are:
- Critical (must fix before testers)
- Important (should fix soon)
- Minor (can defer)
```

---

## Phase 2: Code Quality & Consistency

### 2.1 Component Quality Review
```
Review all React Native components for:
1. Components over 200 lines that should be split
2. Components with too many props (prop drilling issues)
3. Missing or incorrect PropTypes/TypeScript types
4. Inline styles that should be in StyleSheet
5. Anonymous functions in render that cause re-renders
6. Missing keys in list renders

Fix the critical issues found.
```

### 2.2 State Management Audit
```
Review state management for:
1. State that should be lifted up or pushed down
2. Unnecessary re-renders from poor state structure
3. Missing memoization (useMemo, useCallback, React.memo)
4. Async state without loading/error states
5. State that should be derived rather than stored

Implement fixes for any issues found.
```

### 2.3 Code Duplication
```
Identify duplicated logic across the codebase:
1. Similar components that could share a base
2. Repeated API call patterns needing a custom hook
3. Duplicate utility functions
4. Repeated style patterns needing shared styles
5. Copy-pasted validation logic

Refactor the top 5 worst offenders into shared code.
```

### 2.4 Hardcoded Values
```
Find and extract to constants/config:
1. API URLs and endpoints
2. Magic numbers
3. Color values not in a theme
4. Hardcoded strings (especially user-facing text)
5. Timeout/interval durations
6. Dimension values that should be responsive
```

---

## Phase 3: Error Handling & Edge Cases

### 3.1 Error Handling Audit
```
Review error handling throughout the app:
1. API calls without try/catch or .catch()
2. Errors caught but silently swallowed
3. Missing error boundaries around component trees
4. console.log/console.error that should be proper logging
5. Errors without user-friendly messages

Implement proper error handling for all API calls and add error boundaries where needed.
```

### 3.2 Loading & Empty States
```
For every screen and data-fetching component, verify:
1. Loading state exists and shows appropriate UI
2. Empty state exists when data array is empty
3. Error state exists with retry option
4. Skeleton loaders or spinners are consistent

List any screens missing these states and implement them.
```

### 3.3 Edge Case Handling
```
Review and test handling for:
1. Null/undefined data from API responses
2. Optional chaining where needed (obj?.property)
3. Default values for missing data
4. Array operations on potentially undefined arrays
5. Text truncation for long content

Fix any unsafe access patterns found.
```

---

## Phase 4: Performance Optimization

### 4.1 List Performance
```
Review all FlatList, SectionList, and ScrollView usage:
1. FlatLists missing keyExtractor
2. FlatLists missing getItemLayout (for fixed-height items)
3. Missing removeClippedSubviews on long lists
4. Missing windowSize or maxToRenderPerBatch tuning
5. ScrollViews that should be FlatLists
6. Heavy components in renderItem without React.memo

Implement performance optimizations for all lists.
```

### 4.2 Image Optimization
```
Review image handling:
1. Images without width/height causing layout shift
2. Large images not using resizeMode properly
3. Missing image caching (react-native-fast-image or similar)
4. Images loaded at full resolution when thumbnails needed
5. Missing placeholder/loading states for remote images

Implement fixes and recommend any needed packages.
```

### 4.3 Memory & Performance Leaks
```
Check for common memory leaks:
1. useEffect missing cleanup functions
2. Event listeners not removed on unmount
3. Timers (setTimeout/setInterval) not cleared
4. Subscriptions not unsubscribed
5. Animated values not cleaned up

Fix all memory leaks found.
```

### 4.4 Bundle Size
```
Analyze bundle size concerns:
1. Large dependencies that could be replaced with lighter alternatives
2. Imports that pull in entire libraries (import _ from 'lodash' vs import get from 'lodash/get')
3. Assets (images, fonts) that are unusually large
4. Development dependencies accidentally in production

Provide recommendations and implement easy wins.
```

---

## Phase 5: Security Review

### 5.1 Sensitive Data Audit
```
Check for security issues:
1. API keys or secrets in the code (should be in .env)
2. Sensitive data stored in AsyncStorage (should use encrypted storage)
3. Sensitive data logged to console
4. Passwords or tokens visible in state/props
5. .env file committed to git (check .gitignore)

Flag all issues and implement secure alternatives.
```

### 5.2 Input Validation
```
Review all user inputs:
1. Text inputs without validation
2. Missing input sanitization
3. SQL injection or XSS vulnerabilities in any webviews
4. Deep links without parameter validation
5. Missing rate limiting awareness on auth flows

Implement validation for all user inputs.
```

---

## Phase 6: Navigation & UX Polish

### 6.1 Navigation Review
```
Review navigation implementation:
1. Back button behavior on all screens
2. Deep linking configuration and testing
3. Navigation state persistence (if needed)
4. Gesture handling conflicts
5. Header configurations are consistent
6. Tab bar behavior and badges

Fix any navigation issues found.
```

### 6.2 Accessibility Audit
```
Review accessibility:
1. Missing accessibilityLabel on touchables and images
2. Missing accessibilityRole definitions
3. Touch targets smaller than 44x44 points
4. Color contrast issues
5. Missing accessibilityHint for complex actions

Add accessibility props to all interactive elements.
```

---

## Phase 7: Platform-Specific Issues

### 7.1 iOS Specific
```
Review iOS-specific concerns:
1. Safe area handling (notch, home indicator)
2. Keyboard avoiding behavior
3. iOS-specific permissions in Info.plist
4. App Transport Security exceptions needed
5. Status bar style handling

Fix any iOS-specific issues.
```

### 7.2 Android Specific
```
Review Android-specific concerns:
1. Android back button handling
2. Android permissions in AndroidManifest.xml
3. Elevation/shadow differences
4. Android-specific keyboard behavior
5. Different status bar handling
6. Splash screen configuration

Fix any Android-specific issues.
```

---

## Phase 8: Testing Readiness

### 8.1 Crash Prevention
```
Simulate and review behavior for:
1. Rapid button tapping (double-submit prevention)
2. Rotating device during async operations
3. Backgrounding app during API calls
4. Low memory warnings
5. Network request timeouts

Implement guards against crashes for each scenario.
```

### 8.2 Offline Behavior
```
Review offline handling:
1. What happens when network is lost?
2. Are failed requests queued or retried?
3. Is there offline indication to users?
4. Does the app crash or gracefully degrade?
5. Is any data cached for offline viewing?

Implement minimum viable offline handling.
```

### 8.3 Authentication Edge Cases
```
Review auth flows:
1. Token expiration handling
2. Refresh token logic
3. Logout clears all sensitive data
4. Deep links when not authenticated
5. Multiple device session handling

Fix any auth edge cases.
```

---

## Phase 9: Final Cleanup

### 9.1 Code Formatting
```
Ensure code consistency:
1. Run prettier/eslint --fix on entire codebase
2. Fix any remaining linter warnings
3. Ensure consistent naming conventions
4. Remove all console.log statements (or replace with proper logger)
5. Ensure consistent file naming

Apply all formatting fixes.
```

### 9.2 Documentation
```
Add/update essential documentation:
1. README with setup instructions
2. Environment variable documentation
3. Key architectural decisions
4. Known issues or limitations
5. Build and deployment instructions
```

### 9.3 Generate Issue Summary
```
Create a final summary of:
1. All issues found and fixed during this review
2. Any remaining issues that were deferred
3. Technical debt to address post-launch
4. Recommended improvements for v2
5. Any dependencies that need updating

Format as a markdown document for the team.
```

---

## Quick Commands Reference

Copy-paste these for rapid checks:

| Check | Command |
|-------|---------|
| Find console.logs | `Find all console.log statements and list their locations` |
| Check types | `List all 'any' types in TypeScript files` |
| Find large files | `List all files over 300 lines, sorted by size` |
| Unused packages | `Compare package.json dependencies against actual imports and list unused packages` |
| Style audit | `Find all inline styles and components not using StyleSheet` |

---

## Notes

- Work through each phase completely before moving to the next
- Commit after each major section so you can revert if needed  
- Test the app after significant refactors
- Prioritize user-facing issues over internal code quality for launch
- Some issues can be logged for post-launch if time is tight
