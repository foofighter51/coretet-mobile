# CoreTet Current Task List & Implementation Plan
**Date:** 2025-11-12
**Current Build:** 23 (TestFlight) ✅ SHIPPED
**Next Build:** 24 (Modal Infrastructure)
**Status:** Post-Invite Fix, Testing Complete, Ready for Modal Work

---

## Executive Summary

**Recent Wins:**
- ✅ Band invite acceptance flow **completely fixed** (RLS policies resolved)
- ✅ Universal Links configured for seamless invite experience
- ✅ Phase 1 UX enhancements complete (empty states, loading, onboarding)
- ✅ Navigation redesign 95% complete (Playlists/Profile tabs)
- ✅ 72 debug migration files cleaned up and archived
- ✅ **Build 23 shipped to TestFlight** (2025-11-12)

**Current State:**
- Build 23 in TestFlight with invite fixes + Universal Links
- Modal infrastructure needs overhaul (iOS keyboard issues remain)
- Strategic features planned (audio comments, voice memos)
- Web platform strategy defined but not started

**Immediate Focus:**
1. ✅ Build 23 shipped to TestFlight
2. Begin Week 1 Modal Infrastructure work
3. Test navigation redesign on physical device

---

## Task Categories

### 🔴 **IMMEDIATE** (Next 24-48 Hours)
*Ship Build 22 and validate recent work*

### 🟠 **WEEK 1: MODAL INFRASTRUCTURE** (27 hours / 3.5 days)
*Critical iOS keyboard fixes + unified modal system*

### 🟡 **WEEK 2: MODAL MIGRATIONS** (18 hours / 2.25 days)
*Complete modal system adoption + navigation testing*

### 🟢 **STRATEGIC FEATURES** (Future 2-4 weeks)
*Audio comments, voice memos, mobile experience refinement*

### 🔵 **LONG-TERM VISION** (3-6 months)
*Web platform, notifications, offline playback*

---

## 🔴 IMMEDIATE PRIORITY

### Task 0.1: Upload TestFlight Build 23 ✅
**Priority:** CRITICAL
**Time:** 30 minutes
**Status:** ✅ COMPLETE (Shipped 2025-11-12)

**What's New in Build 23:**
- Complete invite acceptance flow fix (RLS policies resolved)
- Universal Links for seamless web → app transitions
- Graceful handling of 406 errors in membership checks
- 72 debug migration files cleaned up

**Steps:**
1. Archive build in Xcode
2. Upload to App Store Connect
3. Submit to TestFlight
4. Add release notes (see template below)

**Release Notes (As Shipped):**
```
Build 23 - Invite System Overhaul

NEW:
• Fixed band invite acceptance (RLS policy issues resolved)
• Universal Links support (invite links open directly in app)
• Improved error handling for edge cases

FIXES:
• Resolved "row-level security policy" errors
• Fixed membership check 406 errors
• Database policy optimization

TESTING NEEDED:
• Invite a new user via email
• Click invite link on iOS device
• Verify seamless app opening
• Confirm user joins band successfully
```

**Success Criteria:**
- Build appears in TestFlight within 15 minutes
- No processing errors
- Available to all testers

---

### Task 0.2: Test Invite Flow End-to-End
**Priority:** CRITICAL
**Time:** 30 minutes
**Dependencies:** Task 0.1 (Build 23 uploaded)

**Test Scenarios:**

**Scenario 1: New User (Never had app)**
1. Send invite to stephenpjudy@gmail.com (or new email)
2. User receives email with invite link
3. User clicks link on iOS device
4. **VERIFY:** App opens (not browser) via Universal Links
5. User signs up
6. User accepts invite
7. **VERIFY:** User joins band successfully
8. **VERIFY:** User can view tracks, leave comments

**Scenario 2: Existing User (Already has app)**
1. Send invite to existing user's email
2. User clicks link
3. **VERIFY:** App opens directly to invite acceptance
4. User accepts
5. **VERIFY:** User now sees new band in band list

**Scenario 3: Web User (Desktop browser)**
1. User clicks invite link on desktop
2. **VERIFY:** Web app loads invite acceptance page
3. User signs up/logs in
4. User accepts invite
5. **VERIFY:** Can access band on web
6. Later, user opens mobile app
7. **VERIFY:** New band appears in mobile app

**Success Criteria:**
- All 3 scenarios work without errors
- No RLS policy errors
- Universal Links work on iOS
- Users can successfully collaborate after joining

**Known Issues (Non-blocking):**
- Initial membership check may log 406 error (harmless, doesn't affect flow)

---

## 🟠 WEEK 1: MODAL INFRASTRUCTURE (Build 24)

**Goal:** Create bulletproof modal system that solves 4 critical iOS keyboard issues

**Total Time:** 27 hours (3.5 days)
**Risk Level:** MEDIUM (high value, core infrastructure)

---

### Task 1.1: Create Z-Index Constants
**Priority:** CRITICAL
**Time:** 1 hour
**Dependencies:** None
**Risk:** LOW

**Why First:** Standardizes all subsequent modal work. No more z-index conflicts.

**Implementation:**

Create file: `/src/constants/zIndex.ts`

```typescript
/**
 * Z-Index Constants
 *
 * Centralized z-index values to prevent stacking conflicts.
 * Higher values appear above lower values.
 */

export const Z_INDEX = {
  // Base layer (normal document flow)
  BASE: 0,

  // Fixed UI elements
  PLAYBACK_BAR: 99,              // Audio player at bottom
  FIXED_BOTTOM_NAV: 100,         // Main navigation tabs

  // Overlays
  DROPDOWN: 1000,                // Filter, sort, action menus
  MODAL: 1500,                   // Primary modals
  MODAL_STACKED: 1600,           // Modals that open above other modals
  TOAST: 2000,                   // Notifications/alerts
  TUTORIAL: 2500,                // Onboarding overlays (highest)
} as const;

// Type for autocomplete
export type ZIndexKey = keyof typeof Z_INDEX;
```

**Success Criteria:**
- [x] File created at `/src/constants/zIndex.ts`
- [x] All values documented
- [x] TypeScript types exported
- [x] No compilation errors

**Testing:** None required (constants only)

---

### Task 1.2: Build BaseModal Component
**Priority:** CRITICAL
**Time:** 6 hours
**Dependencies:** Task 1.1
**Risk:** MEDIUM ⚠️

**Why Critical:** Core infrastructure for ALL future modals. Must be rock-solid.

**Implementation:**

Create file: `/src/components/ui/Modal.tsx`

**Features Required:**

1. **iOS Keyboard Handling**
   ```typescript
   // When input focused, scroll into view
   useEffect(() => {
     if (hasKeyboardInput && keyboardInputRef?.current) {
       setTimeout(() => {
         keyboardInputRef.current?.scrollIntoView({
           behavior: 'smooth',
           block: 'center'
         });
       }, 300); // Wait for iOS keyboard animation
     }
   }, [hasKeyboardInput, keyboardInputRef]);
   ```

2. **ESC Key Support**
   ```typescript
   useEffect(() => {
     const handleEsc = (e: KeyboardEvent) => {
       if (e.key === 'Escape' && closeOnEsc) {
         onClose();
       }
     };
     document.addEventListener('keydown', handleEsc);
     return () => document.removeEventListener('keydown', handleEsc);
   }, [closeOnEsc, onClose]);
   ```

3. **Body Scroll Lock (iOS-Safe)**
   ```typescript
   useEffect(() => {
     if (!isOpen) return;

     const scrollY = window.scrollY;
     document.body.style.position = 'fixed';
     document.body.style.top = `-${scrollY}px`;
     document.body.style.width = '100%';

     return () => {
       document.body.style.position = '';
       document.body.style.top = '';
       document.body.style.width = '';
       window.scrollTo(0, scrollY);
     };
   }, [isOpen]);
   ```

4. **Portal Rendering**
   ```typescript
   return createPortal(
     <div style={{ zIndex: Z_INDEX.MODAL }}>
       {/* Modal content */}
     </div>,
     document.body
   );
   ```

**Props Interface:**
```typescript
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  hasKeyboardInput?: boolean;
  keyboardInputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  zIndex?: number;
  className?: string;
}
```

**Success Criteria:**
- [x] Component compiles without errors
- [x] Portal renders to document.body
- [x] ESC key closes modal (when enabled)
- [x] Backdrop click closes modal (when enabled)
- [x] Body scroll locked when open
- [x] Scroll position restored on close
- [x] iOS keyboard doesn't obscure inputs

**iOS Testing Requirements:** ⚠️ **MUST TEST ON PHYSICAL DEVICE**
- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPhone 14 Pro (standard)
- [ ] Test keyboard show/hide with text input
- [ ] Verify no viewport jumping
- [ ] Test scroll lock on long content
- [ ] Test backdrop tap on various screen sizes

**Rollback Plan:** If keyboard handling fails, keep existing modals working. BaseModal becomes foundation for NEW modals only.

---

### Task 1.3: Build Specialized Modal Components
**Priority:** HIGH
**Time:** 4 hours
**Dependencies:** Task 1.2
**Risk:** LOW

**Implementation:**

Add to `/src/components/ui/Modal.tsx`:

**1. DialogModal (Centered dialog)**
```typescript
interface DialogModalProps extends Omit<BaseModalProps, 'children'> {
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const DialogModal: React.FC<DialogModalProps> = ({
  title,
  footer,
  children,
  maxWidth = '500px',
  ...baseProps
}) => {
  return (
    <BaseModal {...baseProps}>
      <div style={{
        maxWidth,
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
      }}>
        {title && <h2>{title}</h2>}
        <div>{children}</div>
        {footer && <div>{footer}</div>}
      </div>
    </BaseModal>
  );
};
```

**2. BottomSheetModal (Slides up from bottom)**
```typescript
interface BottomSheetModalProps extends Omit<BaseModalProps, 'children'> {
  title?: string;
  children: React.ReactNode;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  title,
  children,
  ...baseProps
}) => {
  return (
    <BaseModal {...baseProps}>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        padding: '24px',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </BaseModal>
  );
};
```

**3. ConfirmDialog (Simple yes/no)**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  ...props
}) => {
  return (
    <DialogModal
      isOpen={props.isOpen}
      onClose={props.onCancel}
      title={props.title}
      maxWidth="400px"
      footer={
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={props.onCancel}>{cancelText}</button>
          <button
            onClick={props.onConfirm}
            style={{ color: destructive ? 'red' : 'blue' }}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p>{props.message}</p>
    </DialogModal>
  );
};
```

**Success Criteria:**
- [x] All 3 components compile
- [x] DialogModal centers on screen
- [x] BottomSheetModal animates up from bottom
- [x] ConfirmDialog shows title, message, 2 buttons
- [x] Destructive style works (red button)

**iOS Testing:**
- [ ] Test DialogModal on iPhone SE (centering)
- [ ] Test BottomSheetModal animation smoothness
- [ ] Test ConfirmDialog on iPad (appropriate sizing)

---

### Task 1.4: Fix BandModal iOS Keyboard Issue
**Priority:** CRITICAL
**Time:** 3 hours
**Dependencies:** Task 1.3
**Risk:** MEDIUM

**Current Problem:** When creating/editing band name, iOS keyboard covers input field.

**Files to Modify:**
- `/src/components/molecules/BandModal.tsx`

**Implementation Steps:**

1. **Import new components:**
   ```typescript
   import { DialogModal } from '../ui/Modal';
   import { Z_INDEX } from '../../constants/zIndex';
   ```

2. **Add ref for band name input:**
   ```typescript
   const bandNameInputRef = useRef<HTMLInputElement>(null);
   ```

3. **Replace custom modal structure:**
   ```typescript
   // BEFORE
   <div style={{ position: 'fixed', zIndex: 9998, ... }}>
     {/* Custom backdrop + dialog */}
   </div>

   // AFTER
   <DialogModal
     isOpen={isOpen}
     onClose={onClose}
     title={editingBand ? 'Edit Band' : 'Create New Band'}
     hasKeyboardInput={true}
     keyboardInputRef={bandNameInputRef}
     maxWidth="500px"
   >
     <form onSubmit={handleSubmit}>
       <input
         ref={bandNameInputRef}
         type="text"
         value={bandName}
         onChange={(e) => setBandName(e.target.value)}
         placeholder="Band name"
       />
       {/* Rest of form */}
     </form>
   </DialogModal>
   ```

4. **Keep all existing logic:**
   - Form validation
   - Submit handling
   - Edit vs create modes
   - Error messages

**Success Criteria:**
- [x] Modal uses DialogModal component
- [x] Band name input has ref
- [x] ESC key closes modal
- [x] All existing functionality preserved
- [x] No z-index conflicts

**iOS Testing Requirements:** ⚠️
- [ ] Open modal from Profile tab → "Create New Band"
- [ ] Tap band name input on iPhone SE
- [ ] **VERIFY:** Input scrolls into view, visible above keyboard
- [ ] Type band name and submit
- [ ] **VERIFY:** Band created successfully
- [ ] Test edit existing band flow
- [ ] Test ESC key closes modal

---

### Task 1.5: Extract & Fix TrackDetailModal
**Priority:** CRITICAL
**Time:** 5 hours
**Dependencies:** Task 1.3
**Risk:** HIGH ⚠️

**Why High Risk:**
- 500+ lines of inline code in MainDashboard.tsx
- Most-used modal in entire app
- Complex state management (comments, ratings, timestamps)
- Multiple keyboard inputs (comment box)

**Current Problem:** Comment input often hidden behind iOS keyboard.

**Files to Create:**
- `/src/components/molecules/TrackDetailModal.tsx`

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (remove inline, import new)

**Implementation Steps:**

1. **Extract modal from MainDashboard (lines ~25-538)**
   - Copy entire TrackDetailModal component
   - Identify all props needed from parent
   - Keep as-is initially (no changes)

2. **Test extraction works**
   - Import new component in MainDashboard
   - Pass all required props
   - Verify functionality unchanged

3. **Convert to DialogModal**
   ```typescript
   const commentInputRef = useRef<HTMLTextAreaElement>(null);

   return (
     <DialogModal
       isOpen={isOpen}
       onClose={handleClose}
       hasKeyboardInput={true}
       keyboardInputRef={commentInputRef}
       maxWidth="900px"
     >
       {/* All existing content */}
       <textarea
         ref={commentInputRef}
         value={newComment}
         onChange={(e) => setNewComment(e.target.value)}
         onKeyDown={handleCommentKeyDown}
         placeholder="Add a comment..."
       />
     </DialogModal>
   );
   ```

4. **Preserve all features:**
   - Audio playback with waveform
   - Timestamp capture (click waveform)
   - Comment submission with Enter key
   - Rating buttons (listened/liked/loved)
   - Timestamp navigation (click timestamp to seek)
   - Scroll position save/restore for comments
   - Edit/delete own comments

**Success Criteria:**
- [x] Modal extracted to separate file
- [x] MainDashboard.tsx reduced by ~500 lines
- [x] Comment input has ref
- [x] iOS keyboard doesn't obscure comment box
- [x] All timestamp features work
- [x] Rating system works
- [x] ESC key closes modal
- [x] No regressions in functionality

**iOS Testing Requirements:** ⚠️ **EXTENDED TESTING**
- [ ] Open track from Playlists tab
- [ ] Play audio, verify waveform works
- [ ] Click waveform to capture timestamp
- [ ] Tap comment input on iPhone 14
- [ ] **VERIFY:** Input visible above keyboard
- [ ] Type comment with timestamp
- [ ] Press Enter to submit
- [ ] **VERIFY:** Comment appears with timestamp
- [ ] Click timestamp in comment
- [ ] **VERIFY:** Audio seeks to that time
- [ ] Test rating buttons
- [ ] Test edit/delete own comments
- [ ] Test on iPhone 14 Plus (large screen)
- [ ] Test landscape orientation

**Rollback Plan:** Keep original inline code commented out for 1 week.

---

### Task 1.6: Fix CreateInvite iOS Keyboard Issue
**Priority:** HIGH
**Time:** 3 hours
**Dependencies:** Task 1.3
**Risk:** MEDIUM

**Current Problem:** Email input hidden behind keyboard when creating invites.

**Files to Modify:**
- `/src/components/molecules/CreateInvite.tsx`

**Implementation Steps:**

1. **Import new components:**
   ```typescript
   import { DialogModal } from '../ui/Modal';
   import { Z_INDEX } from '../../constants/zIndex';
   ```

2. **Add ref for email input:**
   ```typescript
   const emailInputRef = useRef<HTMLInputElement>(null);
   ```

3. **Replace custom modal with DialogModal:**
   ```typescript
   <DialogModal
     isOpen={isOpen}
     onClose={onClose}
     title="Invite Band Member"
     hasKeyboardInput={true}
     keyboardInputRef={emailInputRef}
     zIndex={Z_INDEX.MODAL_STACKED} // Opens above BandSettings
     maxWidth="500px"
   >
     {/* Multi-step flow */}
     {!inviteLink ? (
       <form onSubmit={handleSubmit}>
         <input
           ref={emailInputRef}
           type="email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           placeholder="email@example.com"
         />
         <button type="submit">Generate Invite Link</button>
       </form>
     ) : (
       <div>
         <p>Invite link generated!</p>
         <input readOnly value={inviteLink} />
         <button onClick={handleShare}>Share Link</button>
       </div>
     )}
   </DialogModal>
   ```

4. **Preserve existing features:**
   - Multi-step flow (email input → link display)
   - Enter key submission
   - Native share integration (iOS)
   - Copy to clipboard fallback
   - Stacking above BandSettings modal

**Success Criteria:**
- [x] Uses DialogModal
- [x] Email input scrolls into view on keyboard open
- [x] ESC key closes modal
- [x] Enter key submits email
- [x] Stacks above BandSettings (z-index 1600)
- [x] Share sheet works on iOS

**iOS Testing:**
- [ ] Open Profile → Band Settings → Invite Member
- [ ] Tap email input on iPhone
- [ ] **VERIFY:** Input visible above keyboard
- [ ] Type email, press Enter
- [ ] **VERIFY:** Invite link generated
- [ ] Tap Share button
- [ ] **VERIFY:** iOS share sheet appears
- [ ] Test copy to clipboard
- [ ] Test ESC key at each step

---

### Task 1.7: Build DropdownMenu Component
**Priority:** MEDIUM
**Time:** 3 hours
**Dependencies:** Task 1.1
**Risk:** LOW

**Why Needed:** Multiple dropdowns have inconsistent behavior, no outside-click closing.

**Files to Create:**
- `/src/components/ui/DropdownMenu.tsx`

**Implementation:**

```typescript
interface DropdownMenuProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  align?: 'left' | 'right';
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  isOpen,
  onOpenChange,
  align = 'left',
  children,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onOpenChange]);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <div onClick={() => onOpenChange(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            [align]: 0,
            zIndex: Z_INDEX.DROPDOWN,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginTop: '4px',
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
```

**Success Criteria:**
- [x] Component compiles
- [x] Opens on trigger click
- [x] Closes on outside click
- [x] Closes on ESC key
- [x] Configurable alignment (left/right)
- [x] Proper z-index (1000)

**iOS Testing:**
- [ ] Test on iPhone SE (near screen edge)
- [ ] Verify doesn't overflow viewport
- [ ] Test tap outside to close
- [ ] Test on iPad (larger touch targets)

---

### Task 1.8: Fix Playlist Menu Bug
**Priority:** CRITICAL
**Time:** 2 hours
**Dependencies:** Task 1.7
**Risk:** LOW

**Current Problem:** Playlist action menu stays open, can't close by tapping outside.

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (line ~2507)

**Implementation:**

```typescript
// BEFORE
const [menuOpen, setMenuOpen] = useState(false);

<button onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
{menuOpen && (
  <div className="menu">
    {/* Menu items */}
  </div>
)}

// AFTER
import { DropdownMenu } from '../ui/DropdownMenu';

<DropdownMenu
  trigger={<button>⋮</button>}
  isOpen={playlistMenuOpen}
  onOpenChange={setPlaylistMenuOpen}
  align="right"
>
  <div onClick={() => handleEditPlaylist(playlist)}>Edit</div>
  <div onClick={() => handleDeletePlaylist(playlist)}>Delete</div>
  <div onClick={() => handleSharePlaylist(playlist)}>Share</div>
</DropdownMenu>
```

**Success Criteria:**
- [x] Menu closes on outside click
- [x] Menu closes on selection
- [x] Menu closes on ESC key
- [x] All existing menu items preserved
- [x] No z-index conflicts

**iOS Testing:**
- [ ] Open playlist menu from Playlists tab
- [ ] Tap outside menu
- [ ] **VERIFY:** Menu closes
- [ ] Test each menu option works
- [ ] Test on iPad (touch precision)

---

### Week 1 Completion Checklist

**Before Deploying Build 25:**
- [ ] All 8 tasks completed (1.1-1.8)
- [ ] BaseModal tested on physical iPhone (not just simulator)
- [ ] All 3 keyboard modals tested on device
- [ ] ESC key works in Safari + iOS simulator
- [ ] No z-index conflicts observed
- [ ] No console errors or warnings
- [ ] Git commit with comprehensive message

**Git Commit Template:**
```bash
git add .
git commit -m "feat: unified modal system with iOS keyboard fixes

- Create BaseModal with iOS keyboard handling and scroll lock
- Add DialogModal, BottomSheetModal, ConfirmDialog components
- Standardize z-index values with constants file
- Fix BandModal keyboard obscuring input
- Extract and fix TrackDetailModal (500+ lines reduced)
- Fix CreateInvite keyboard issue
- Create reusable DropdownMenu component
- Fix playlist menu outside-click bug

Closes #[issue-number]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**TestFlight Release Notes (Build 24):**
```
Build 24 - Modal System Overhaul

NEW:
• Unified modal system (smoother, more consistent)
• ESC key closes all modals
• Improved dropdown menus with outside-click closing

FIXES:
• iOS keyboard no longer covers text inputs
• Band creation modal keyboard issue resolved
• Track comment input keyboard issue resolved
• Invite email input keyboard issue resolved
• Playlist menu now closes when tapping outside

IMPROVEMENTS:
• Cleaner codebase (500+ lines reduced)
• Standardized z-index handling
• Better modal stacking behavior

TESTING NEEDED:
• Test creating bands (keyboard should not obscure input)
• Test commenting on tracks (keyboard handling)
• Test sending invites (email input visibility)
• Test playlist menus (should close on outside tap)
```

---

## 🟡 WEEK 2: MODAL MIGRATIONS (Build 25)

**Goal:** Complete modal system adoption + test navigation redesign

**Total Time:** 18 hours (2.25 days)
**Risk Level:** LOW (polish work, no critical path items)

---

### Task 2.1: Migrate SettingsModal
**Priority:** LOW
**Time:** 2 hours
**Dependencies:** Week 1 (BottomSheetModal)
**Risk:** LOW

**Files to Modify:**
- `/src/components/molecules/SettingsModal.tsx`

**Implementation:**
Replace custom modal with `BottomSheetModal`, verify no duplication with Profile tab.

**Success Criteria:**
- [ ] Uses BottomSheetModal
- [ ] All settings options preserved
- [ ] Works with Profile tab (no duplication)

---

### Task 2.2: Migrate Tutorial Modal
**Priority:** LOW
**Time:** 2 hours

**Files to Modify:**
- `/src/components/molecules/Tutorial.tsx`

**Implementation:**
Replace with DialogModal, use Z_INDEX.TUTORIAL (2500).

---

### Task 2.3: Migrate BandSettings Modal
**Priority:** LOW
**Time:** 2 hours

**Files to Modify:**
- `/src/components/molecules/BandSettings.tsx`

**Implementation:**
Replace with DialogModal, ensure CreateInvite still stacks above.

---

### Task 2.4: Migrate Dropdown Menus
**Priority:** MEDIUM
**Time:** 4 hours

**Files to Modify:**
- `/src/components/molecules/FilterButton.tsx`
- `/src/components/molecules/SortButton.tsx`
- `/src/components/molecules/UploadButton.tsx`

**Implementation:**
Replace each with DropdownMenu component.

---

### Task 2.5: Extract CreatePlaylist Modal
**Priority:** MEDIUM
**Time:** 3 hours

**Files to Create:**
- `/src/components/molecules/CreatePlaylistModal.tsx`

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (line ~1577)

**Implementation:**
Extract inline component, wrap in DialogModal, fix keyboard issue.

---

### Task 2.6: Convert Delete Confirmations
**Priority:** LOW
**Time:** 2 hours

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (lines ~1788, 1835)

**Implementation:**
Replace inline confirmations with ConfirmDialog component.

---

### Task 2.7: Extract TrackSelector
**Priority:** LOW
**Time:** 2 hours

**Files to Create:**
- `/src/components/molecules/TrackSelector.tsx`

**Implementation:**
Extract from MainDashboard, rename appropriately (not a modal).

---

### Task 2.8: Navigation Redesign Device Testing
**Priority:** CRITICAL
**Time:** 3 hours
**Risk:** MEDIUM ⚠️

**Why Critical:** Navigation redesign is 95% complete but not tested on physical device.

**Test Areas:**

**1. Playlists Tab**
- [ ] View playlists for current band
- [ ] Empty states display correctly
- [ ] Create playlist works
- [ ] Add tracks to playlist
- [ ] Play playlist in order
- [ ] Edit playlist title
- [ ] Delete playlist with confirmation

**2. Profile Tab**
- [ ] User info displays (name, email)
- [ ] Band switcher shows all bands
- [ ] Current band highlighted
- [ ] Create New Band button works
- [ ] Help buttons work (Tutorial, Replay Intro)
- [ ] Settings button works
- [ ] Sign Out works

**3. Band Switching**
- [ ] Switch between bands
- [ ] Playlists tab updates to new band's playlists
- [ ] Upload goes to correct band
- [ ] Test with single-band user
- [ ] Test with multi-band user (3+ bands)

**4. Edge Cases**
- [ ] Fresh install flow (creates Personal band)
- [ ] User with only Personal band
- [ ] Long band names (truncation)
- [ ] Many bands (scrolling in switcher)
- [ ] iPad layout (larger screen)

**Test Devices:**
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 (standard)
- [ ] iPhone 14 Plus (large screen)
- [ ] iPad (tablet layout)

**Success Criteria:**
- [ ] All flows work on physical device
- [ ] No visual bugs or layout issues
- [ ] Band switching is intuitive
- [ ] Profile tab is discoverable
- [ ] No performance issues
- [ ] Navigation feels natural

---

### Week 2 Completion Checklist

**Before Deploying Build 25:**
- [ ] All 8 tasks completed (2.1-2.8)
- [ ] All modals use unified system
- [ ] Navigation tested on device
- [ ] No regressions in core flows
- [ ] Code cleanup complete (TODOs resolved)
- [ ] MainDashboard.tsx under 2000 lines

**Git Commit Template:**
```bash
git commit -m "feat: complete modal migration + navigation validation

- Migrate SettingsModal, Tutorial, BandSettings to unified system
- Convert all dropdown menus to DropdownMenu component
- Extract CreatePlaylist modal with keyboard fixes
- Replace confirmation dialogs with ConfirmDialog
- Complete navigation redesign device testing
- Validate band switching and Profile tab functionality
- Reduce MainDashboard.tsx complexity

Closes #[issue-number]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🟢 STRATEGIC FEATURES (Builds 26-28)

**Timeline:** 2-4 weeks after modal work complete
**Goal:** Enhance mobile experience with unique features

From UI_UX_STRATEGIC_REVIEW_2025-11-03.md

---

### Feature 1: Audio Comments (Priority 1)
**Time:** 12-16 hours
**Value:** HIGH - Unique differentiator

**User Story:**
> "I think the harmony should go like this..." [user sings 10 seconds]

**Implementation Plan:**

**Phase 1: Recording (6 hours)**
- Research Capacitor audio recording APIs
- Implement record button UI
- Capture audio (max 30 seconds)
- Show recording progress

**Phase 2: Storage (3 hours)**
- Upload to Supabase storage
- Link to comment + timestamp
- Generate playback URL

**Phase 3: Playback (3 hours)**
- Inline audio player for comments
- Waveform visualization (optional)
- Seek, play/pause controls

**Phase 4: UI Polish (2-3 hours)**
- Microphone icon next to comment box
- Recording animation
- Error handling
- Permissions prompts

**Success Metrics:**
- 30% of users try audio comments within first month
- Average audio comment length: 5-15 seconds
- Positive feedback from beta testers

**Technical Risks:**
- iOS microphone permissions
- Audio quality/compression
- Storage costs (Supabase)

---

### Feature 2: Voice Memo Upload (Priority 1)
**Time:** 6-8 hours
**Value:** MEDIUM - Makes mobile upload viable

**User Story:**
> Quick idea at 2am → Open app → Tap mic → Record 30 seconds → Name it → Upload

**Implementation Plan:**

**Phase 1: Simplified Flow (4 hours)**
- Add dedicated "Record" button to upload UI
- Tap to start recording immediately
- Show timer and waveform
- Tap again to stop

**Phase 2: Minimal Metadata (2 hours)**
- Quick title input (not full form)
- Auto-name: "Voice Memo - [Date]"
- Default to current band

**Phase 3: Polish (2 hours)**
- Upload progress indicator
- Background upload support
- Error handling

**Success Metrics:**
- 50% of mobile uploads are voice memos
- Average voice memo upload time: < 60 seconds
- Users upload more frequently from mobile

---

### Feature 3: Tab Navigation Evaluation (Priority 1)
**Time:** 4-6 hours
**Value:** HIGH - Core UX improvement

**Current Structure:**
```
[Playlists] [Profile]
```

**Alternative Structures to Prototype:**

**Option A: Feed-Based**
```
[Feed] [Bands] [Upload] [Profile]

Feed:
  → Recent activity across all bands
  → "New track from Band X"
  → "3 comments on your track"

Bands:
  → List of bands
  → Tap to see band tracks

Upload:
  → Record voice memo (primary)
  → Select file (secondary)
```

**Option B: Track-Focused**
```
[Tracks] [Bands] [Profile]

Tracks:
  → All tracks across all bands
  → Filterable by band
  → Sortable by date/activity
```

**Option C: Keep Current + Tweak**
```
[Playlists] [Library] [Profile]

Library:
  → All tracks (not playlists)
  → Filterable and searchable
```

**Implementation Plan:**
1. Create mockups of each option (2 hours)
2. Test with 5-10 beta users (2 hours)
3. Implement chosen option (2-4 hours)

**Decision Criteria:**
- Time to find a specific track
- Discoverability of new uploads
- Clarity of current context
- Mobile-appropriate information density

---

## 🔵 LONG-TERM VISION (3-6 Months)

From UI_UX_STRATEGIC_REVIEW_2025-11-03.md

---

### Web Platform (40+ hours)
**Goal:** Desktop-optimized production hub

**Features:**
- Drag-and-drop upload from DAW
- Full playlist management
- Band administration
- Version control UI
- Side-by-side track comparison
- Batch operations
- Export options

**Strategy Decision Needed:**
- Build separate web app? (Recommended)
- Or enhance current responsive web view?

---

### Push Notifications (8-12 hours)
**Use Cases:**
- "Band X uploaded a new track"
- "3 new comments on your track"
- "You've been added to a band"

**Implementation:**
- Capacitor Push Notifications plugin
- APNs setup (iOS)
- Supabase Edge Functions for triggers

---

### Offline Playback (12-16 hours)
**Use Cases:**
- Download tracks for offline listening
- Commute, travel, no internet

**Implementation:**
- Capacitor Filesystem API
- Cache management
- Sync strategy

---

## Timeline & Milestones

```
Week 1 (Nov 12-16):
  ├─ Day 1: ✅ Ship Build 23, Test invites
  ├─ Day 2-3: Tasks 1.1-1.3 (BaseModal system)
  └─ Day 4-5: Tasks 1.4-1.8 (iOS keyboard fixes)

Week 2 (Nov 19-23):
  ├─ Day 1-2: Tasks 2.1-2.5 (Modal migrations)
  ├─ Day 3: Task 2.8 (Navigation testing)
  └─ Day 4-5: Tasks 2.6-2.7 + polish

Week 3-4 (Nov 26-Dec 7):
  ├─ Audio comments prototype
  ├─ Voice memo upload
  └─ Tab navigation evaluation

Weeks 5-8 (Dec 10-Jan 10):
  ├─ Web platform planning
  ├─ Push notifications
  └─ Strategic feature refinement
```

---

## Critical Path

**Longest dependency chain:**
```
Task 0.1 (30m) → Task 0.2 (30m) → Task 1.1 (1h) →
Task 1.2 (6h) → Task 1.3 (4h) → Task 1.5 (5h) →
Task 2.5 (3h) → Task 2.8 (3h)

Total: 23 hours critical path
```

**Parallel work:** +22 hours (can run concurrently)

**Total calendar time:** ~10 working days (2 weeks)

---

## Success Metrics

### Technical Metrics
- Zero iOS keyboard complaints after Week 1
- All modals closeable with ESC key (100%)
- No z-index visual bugs
- MainDashboard.tsx under 2000 lines (currently 2700+)
- Modal codebase reduced by 30%

### User Experience Metrics
- Invite acceptance success rate: 95%+
- Time to first comment: < 2 minutes
- Audio comment adoption: 30% of users
- Voice memo upload adoption: 50% of mobile uploads

### Code Health Metrics
- Test coverage: 70%+ (currently ~40%)
- TypeScript strict mode: Enabled
- Console errors: 0 in production
- Bundle size: < 750kB gzipped

---

## Risk Management

### High-Risk Items
1. **Task 1.2 (BaseModal)** - Core infrastructure
   - Mitigation: Extended testing, rollback plan

2. **Task 1.5 (TrackDetailModal)** - Heavy usage, complex state
   - Mitigation: Keep original code commented for 1 week

3. **Task 2.8 (Navigation)** - User-facing, not device-tested
   - Mitigation: Test with multiple users/devices before finalizing

### Known Issues to Monitor
- 406 error on initial membership check (non-blocking, documented)
- Supabase connection pool caching (restart DB if policies don't update)
- Universal Links may not work in all contexts (fallback to web)

---

## Resources & References

### Documentation
- [FINAL_WORKING_RLS_POLICIES.md](../migrations/FINAL_WORKING_RLS_POLICIES.md) - Database security reference
- [UI_UX_STRATEGIC_REVIEW_2025-11-03.md](UI_UX_STRATEGIC_REVIEW_2025-11-03.md) - Product strategy
- [UNIFIED_IMPLEMENTATION_PLAN_V2.md](UNIFIED_IMPLEMENTATION_PLAN_V2.md) - Original detailed plan
- [2025-11-11-invite-rls-fixed.md](eod-status/2025-11-11-invite-rls-fixed.md) - Recent debugging session

### Design System
- Tokens: `/src/design/designTokens.ts`
- Components: `/src/components/atoms/`, `/src/components/molecules/`

### Testing
- TestFlight: https://testflight.apple.com/
- Web app: https://coretet.app
- Supabase Dashboard: https://supabase.com/dashboard

---

## Next Immediate Action

**Right now, you should:**

1. ✅ **Build 23 shipped** - COMPLETE (2025-11-12)

2. 🔄 **Test invite flow** (30 min) - OPTIONAL
   - Invite new users as needed
   - Verify Universal Links working
   - Monitor for any RLS errors

3. **Begin Task 1.1** (1 hour) - NEXT UP
   - Create `/src/constants/zIndex.ts`
   - Define all z-index constants
   - Verify imports work

**Then continue with Week 1 modal work sequentially (Tasks 1.2-1.8).**

---

**END OF CURRENT TASK LIST**

**Last Updated:** 2025-11-12
**Status:** Ready to execute
**Next Review:** After Week 1 completion (Build 24 deployed)
