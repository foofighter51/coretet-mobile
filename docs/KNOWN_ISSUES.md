# Known Issues

## iOS Keyboard Whitespace Issue

**Status:** Known limitation - Not blocking, cosmetic issue
**Severity:** Low
**Platforms Affected:** iOS Safari/WebView (Capacitor)
**Build:** 18+

### Description
After interacting with keyboard inputs (creating playlists, creating bands, adding comments), excess whitespace may appear above the app header on iOS devices. This creates a gap between the status bar and the app content.

### Root Cause
iOS Safari/WebView changes the viewport height when the software keyboard appears and doesn't always restore it correctly when the keyboard dismisses. This is a known iOS WebView limitation that affects many hybrid apps.

### Attempted Solutions
Multiple approaches were attempted without complete success:
- `env(safe-area-inset-top)` for dynamic safe area handling
- Fixed pixel padding values (44px)
- `100vh` vs `100dvh` viewport units
- Disabling body scroll manipulation
- Scroll locking with position: fixed
- Input scrollIntoView on keyboard focus
- Viewport meta tag adjustments

None fully resolved the issue across all keyboard interaction scenarios.

### Workaround
Users can tap/scroll within the app to trigger a layout recalculation, which usually resolves the whitespace temporarily. The issue is cosmetic and doesn't prevent app functionality.

### Future Solutions to Explore
1. **Capacitor Keyboard Plugin** - Use `@capacitor/keyboard` to listen for show/hide events and manually adjust layout
2. **Native iOS handling** - Implement viewport management at the native iOS layer rather than web layer
3. **iOS 18+ updates** - Monitor for Safari/WebView improvements in future iOS versions

### Related Files
- `/Users/exleymini/Apps/coretet-band/docs/MODAL_AUDIT_REPORT.md` - Comprehensive modal audit
- `/Users/exleymini/Apps/coretet-band/src/components/ui/BaseModal.tsx` - Unified modal system (scroll lock disabled for iOS)
- `/Users/exleymini/Apps/coretet-band/src/components/screens/MainDashboard.tsx` - Header safe area handling

### Decision
**Accepted as known limitation (2025-10-29)** - Focus resources on Phase 1 user-facing features rather than continuing to address this cosmetic iOS quirk. Will revisit in future sprint if user feedback indicates it's a significant issue.

---

## iOS Typing Suggestions Popup

**Status:** Mitigated
**Severity:** Low
**Platforms Affected:** iOS

### Description
iOS shows "Speed up your typing by sliding your finger across the letters" tip when user first interacts with text inputs.

### Solution
Added autocomplete attributes to suppress: `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`, `spellCheck="false"`

### Status
Fixed in Build 18+
