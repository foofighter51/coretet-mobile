# Implementation Plan: Beta Onboarding + Web Interface

## Overview
Transform CoreTet's authentication system to support beta testing with invite codes (bypassing email verification), and create an admin-only web interface for desktop users alongside the existing mobile app.

## Key Design Decisions
Based on exploration and user input:

1. **Invite Code System**: Single-use codes (1 code = 1 beta tester) for better tracking and accountability
2. **Web Interface Access**: Admin-only (users with `is_admin=true`) to focus beta testing scope
3. **Priority Features**: Bulk file upload (drag & drop) + Advanced playlist organization (grid/multi-column view)
4. **Architecture**: Extend existing monolith with responsive design and admin route guards (faster time to market, reuse 80% of existing code)
5. **Email Verification Bypass**: Use Supabase Edge Function with service role key to auto-confirm users with valid invite codes

## Summary
- **10 new files** to create (migrations, components, utilities)
- **5 existing files** to modify (auth screens, landing page, main dashboard, routing, styles)
- **~4 weeks** estimated timeline (split across invite system, marketing website, and web interface)
- **Goal**: Enable controlled beta testing with simplified onboarding + provide admins with desktop-optimized tools for content management

---

## Priority 1: Simplified Beta Onboarding with Invite Codes

### Current State Analysis
- **Email verification is enforced by Supabase** at the auth service level
- Users cannot login until they click the confirmation email link
- `AcceptInvite.tsx` already bypasses email verification for band invites
- Existing `band_invites` table uses UUID tokens (not human-friendly codes)
- `user_access_control` table exists for waitlist management

### Implementation Strategy

#### Phase 1A: Create Invite Code System

**1. Database Schema: Add `beta_invite_codes` table**

Create new migration: `supabase/migrations/[timestamp]_create_beta_invite_codes.sql`

**Design Decision**: Single-use codes (1 code per user) for better tracking and accountability

```sql
CREATE TABLE beta_invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  max_uses INTEGER DEFAULT 1, -- Single-use by default
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '90 days',
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT code_format CHECK (code ~ '^[A-Z0-9]{6,12}$')
);

-- Track who used which codes
CREATE TABLE beta_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_id UUID REFERENCES beta_invite_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(code_id, user_id)
);

-- RLS Policies
ALTER TABLE beta_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_usage ENABLE ROW LEVEL SECURITY;

-- Admins can view all codes
CREATE POLICY "Admins can manage invite codes"
  ON beta_invite_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()::TEXT
      AND is_admin = TRUE
    )
  );

-- Anyone can check if a code is valid (read-only for verification)
CREATE POLICY "Anyone can verify codes"
  ON beta_invite_codes FOR SELECT
  USING (is_active = TRUE AND expires_at > NOW());

-- Track usage
CREATE POLICY "Users can view their code usage"
  ON beta_code_usage FOR SELECT
  USING (user_id = auth.uid()::TEXT);
```

**Files to create:**
- `supabase/migrations/[timestamp]_create_beta_invite_codes.sql`

**2. Generate TypeScript types**

Run after migration:
```bash
npm run db:types
```

**3. Create invite code service**

Create: `src/utils/inviteCodeService.ts`

```typescript
import { supabase } from '../lib/supabase';

export interface InviteCodeValidation {
  valid: boolean;
  code?: string;
  error?: string;
  metadata?: any;
}

export const inviteCodeService = {
  // Verify code is valid
  async verifyCode(code: string): Promise<InviteCodeValidation> {
    const { data, error } = await supabase
      .from('beta_invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid or expired code' };
    }

    if (data.current_uses >= data.max_uses) {
      return { valid: false, error: 'Code has reached maximum uses' };
    }

    return { valid: true, code: data.code, metadata: data.metadata };
  },

  // Mark code as used
  async useCode(code: string, userId: string) {
    const { data: codeData } = await supabase
      .from('beta_invite_codes')
      .select('id, current_uses')
      .eq('code', code.toUpperCase())
      .single();

    if (!codeData) return { error: 'Code not found' };

    // Record usage
    await supabase
      .from('beta_code_usage')
      .insert({ code_id: codeData.id, user_id: userId });

    // Increment usage count
    await supabase
      .from('beta_invite_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    return { success: true };
  },

  // Admin: Generate new invite code
  async generateCode(options: {
    maxUses?: number;
    expiresInDays?: number;
    metadata?: any;
  }) {
    const code = generateRandomCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 90));

    const { data, error } = await supabase
      .from('beta_invite_codes')
      .insert({
        code,
        max_uses: options.maxUses || 1,
        expires_at: expiresAt.toISOString(),
        metadata: options.metadata || {},
      })
      .select()
      .single();

    return { data, error };
  },
};

function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude I, O, 0, 1
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

**Files to create:**
- `src/utils/inviteCodeService.ts`

#### Phase 1B: Modify Signup Flow

**4. Add invite code input to PhoneAuthScreen**

Modify: `src/components/screens/PhoneAuthScreen.tsx`

Add state for invite code:
```typescript
const [inviteCode, setInviteCode] = useState('');
const [codeValidated, setCodeValidated] = useState(false);
```

Add invite code input field (after email/password fields):
```tsx
<input
  type="text"
  placeholder="Beta Invite Code"
  value={inviteCode}
  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
  style={{ /* existing input styles */ }}
/>
<button onClick={handleValidateCode}>Validate Code</button>
```

Modify signup handler to skip email verification if valid code:
```typescript
const handleSignUp = async () => {
  // Validate invite code first
  if (!codeValidated) {
    const validation = await inviteCodeService.verifyCode(inviteCode);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
  }

  // Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        invite_code: inviteCode, // Store in user metadata
      },
    },
  });

  if (error) {
    setError(error.message);
    return;
  }

  // Mark code as used
  if (data.user) {
    await inviteCodeService.useCode(inviteCode, data.user.id);

    // Create profile immediately (don't wait for email confirmation)
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
    });

    // Auto-confirm user (admin operation - requires service role key)
    // This will be handled server-side via Supabase function

    // Navigate directly to onboarding
    setCurrentScreen('onboarding');
  }
};
```

**Files to modify:**
- `src/components/screens/PhoneAuthScreen.tsx`

**5. Create Supabase Edge Function to auto-confirm users with valid codes**

Create: `supabase/functions/confirm-beta-user/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { userId, inviteCode } = await req.json();

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Verify code is valid
  const { data: codeData } = await supabaseAdmin
    .from('beta_invite_codes')
    .select('*')
    .eq('code', inviteCode)
    .eq('is_active', true)
    .single();

  if (!codeData) {
    return new Response(JSON.stringify({ error: 'Invalid code' }), { status: 400 });
  }

  // Auto-confirm user email using admin client
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

**Files to create:**
- `supabase/functions/confirm-beta-user/index.ts`

Deploy with: `supabase functions deploy confirm-beta-user`

#### Phase 1C: Admin Interface for Code Management

**6. Create admin screen for generating/managing codes**

Create: `src/components/screens/AdminInviteCodesScreen.tsx`

```tsx
export function AdminInviteCodesScreen() {
  const [codes, setCodes] = useState([]);
  const [maxUses, setMaxUses] = useState(1);

  const handleGenerateCode = async () => {
    const result = await inviteCodeService.generateCode({ maxUses });
    if (result.data) {
      setCodes([result.data, ...codes]);
    }
  };

  return (
    <div>
      <h1>Beta Invite Codes</h1>
      <button onClick={handleGenerateCode}>Generate New Code</button>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Uses</th>
            <th>Max Uses</th>
            <th>Expires</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(code => (
            <tr key={code.id}>
              <td>{code.code}</td>
              <td>{code.current_uses}</td>
              <td>{code.max_uses}</td>
              <td>{new Date(code.expires_at).toLocaleDateString()}</td>
              <td>{code.is_active ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Add route in `src/App.tsx`:
```tsx
<Route path="/admin/codes" element={<AdminInviteCodesScreen />} />
```

**Files to create:**
- `src/components/screens/AdminInviteCodesScreen.tsx`

**Files to modify:**
- `src/App.tsx`

---

## Priority 2: Web Interface for Desktop Users

### Current State Analysis
- App is mobile-first with fixed `maxWidth: 425px` on all screens
- Single build output serves both web and mobile
- Capacitor differentiates native vs web via `Capacitor.isNativePlatform()`
- Existing `NewLandingPage.tsx` is desktop-optimized (maxWidth: 1200px)
- No responsive layouts for the main app

### Implementation Strategy: Admin-Only Web Interface

**Design Decisions**:
- **Admin-only access**: Only users with `is_admin=true` can access web interface
- **Priority features**: Bulk file upload (drag & drop) + Advanced playlist organization (grid/multi-column)
- **Architecture**: Extend existing monolith with responsive design, admin-gated routes
- **Rationale**: Faster time to market, reuse existing code, focused beta testing with admins

#### Phase 2A: Create Marketing Website with Waitlist

**7. Enhance NewLandingPage with waitlist form**

Modify: `src/components/screens/NewLandingPage.tsx`

Add waitlist signup section:
```tsx
const [waitlistEmail, setWaitlistEmail] = useState('');
const [submitted, setSubmitted] = useState(false);

const handleWaitlistSignup = async (e) => {
  e.preventDefault();

  const { error } = await supabase
    .from('user_access_control')
    .insert({
      email: waitlistEmail,
      access_level: 'waitlist',
      waitlist_joined_at: new Date().toISOString(),
    });

  if (!error) {
    setSubmitted(true);
  }
};

// Add to render:
<section style={{ background: '#1a2332', padding: '60px 20px' }}>
  <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
    <h2>Join the Beta Waitlist</h2>
    <p>Be among the first to try CoreTet when we launch</p>

    {submitted ? (
      <div style={{ color: '#e9a63c', fontSize: '18px' }}>
        Thanks! We'll send you an invite code soon.
      </div>
    ) : (
      <form onSubmit={handleWaitlistSignup}>
        <input
          type="email"
          placeholder="Your email address"
          value={waitlistEmail}
          onChange={(e) => setWaitlistEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            marginBottom: '16px',
          }}
        />
        <button type="submit" style={{ /* CTA button styles */ }}>
          Join Waitlist
        </button>
      </form>
    )}
  </div>
</section>
```

**Files to modify:**
- `src/components/screens/NewLandingPage.tsx`

#### Phase 2B: Add Admin Route Protection

**8. Create admin route guard**

Create: `src/components/guards/AdminRouteGuard.tsx`

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (!profile?.is_admin) {
      navigate('/app');
    }
  }, [user, profile, navigate]);

  if (!user || !profile?.is_admin) {
    return null;
  }

  return <>{children}</>;
}
```

Update `src/App.tsx` to protect admin routes:

```tsx
<Route path="/admin/*" element={
  <AdminRouteGuard>
    <Routes>
      <Route path="codes" element={<AdminInviteCodesScreen />} />
      <Route path="dashboard" element={<AdminDashboard />} />
    </Routes>
  </AdminRouteGuard>
} />
```

**Files to create:**
- `src/components/guards/AdminRouteGuard.tsx`

**Files to modify:**
- `src/App.tsx`

#### Phase 2C: Create Responsive Layout System

**9. Create responsive layout components**

Create: `src/hooks/useResponsive.ts`

```typescript
import { useState, useEffect } from 'react';

export function useResponsive() {
  const [viewport, setViewport] = useState({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
```

**Files to create:**
- `src/hooks/useResponsive.ts`

**10. Create desktop navigation component**

Create: `src/components/layouts/DesktopNavigation.tsx`

```tsx
import { useDesignTokens } from '../../design/useDesignTokens';
import { Music, Users, Settings, LogOut } from 'lucide-react';

export function DesktopNavigation({ activePage, onNavigate }) {
  const designTokens = useDesignTokens();

  const navItems = [
    { id: 'library', label: 'Library', icon: Music },
    { id: 'playlists', label: 'Playlists', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav style={{
      width: '240px',
      height: '100vh',
      backgroundColor: designTokens.colors.surface.secondary,
      borderRight: `1px solid ${designTokens.colors.borders.subtle}`,
      padding: designTokens.spacing.lg,
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{ marginBottom: '40px' }}>
        <img src="/logo.png" alt="CoreTet" style={{ width: '120px' }} />
      </div>

      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            width: '100%',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: activePage === item.id
              ? designTokens.colors.surface.primary
              : 'transparent',
            color: designTokens.colors.text.primary,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          <item.icon size={20} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
```

**Files to create:**
- `src/components/layouts/DesktopNavigation.tsx`

**11. Create responsive wrapper for MainDashboard**

Create: `src/components/layouts/ResponsiveLayout.tsx`

```tsx
import { useResponsive } from '../../hooks/useResponsive';
import { DesktopNavigation } from './DesktopNavigation';
import { TabBar } from '../molecules/TabBar';
import { Capacitor } from '@capacitor/core';

export function ResponsiveLayout({ children, currentTab, onTabChange }) {
  const { isDesktop, isMobile } = useResponsive();
  const isNative = Capacitor.isNativePlatform();

  // Force mobile layout for native apps
  if (isNative) {
    return (
      <div style={{ width: '100%', maxWidth: '425px', margin: '0 auto' }}>
        {children}
        <TabBar activeTab={currentTab} onTabChange={onTabChange} />
      </div>
    );
  }

  // Desktop layout
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <DesktopNavigation activePage={currentTab} onNavigate={onTabChange} />
        <main style={{
          marginLeft: '240px',
          flex: 1,
          overflow: 'auto',
          padding: '40px',
        }}>
          {children}
        </main>
      </div>
    );
  }

  // Mobile web layout
  return (
    <div style={{ width: '100%', maxWidth: '425px', margin: '0 auto' }}>
      {children}
      <TabBar activeTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
}
```

**Files to create:**
- `src/components/layouts/ResponsiveLayout.tsx`

#### Phase 2D: Desktop-Optimized Features

**12. Create multi-column playlist grid view**

Create: `src/components/organisms/PlaylistGridView.tsx`

```tsx
import { useDesignTokens } from '../../design/useDesignTokens';
import { useResponsive } from '../../hooks/useResponsive';

export function PlaylistGridView({ playlists, onSelectPlaylist }) {
  const designTokens = useDesignTokens();
  const { isDesktop } = useResponsive();

  const columns = isDesktop ? 3 : 1;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: designTokens.spacing.lg,
      padding: designTokens.spacing.lg,
    }}>
      {playlists.map(playlist => (
        <div
          key={playlist.id}
          onClick={() => onSelectPlaylist(playlist)}
          style={{
            backgroundColor: designTokens.colors.surface.primary,
            borderRadius: designTokens.borderRadius.lg,
            padding: designTokens.spacing.lg,
            cursor: 'pointer',
            border: `1px solid ${designTokens.colors.borders.subtle}`,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h3 style={{ color: designTokens.colors.text.primary }}>
            {playlist.title}
          </h3>
          <p style={{ color: designTokens.colors.text.secondary }}>
            {playlist.track_count || 0} tracks
          </p>
          <p style={{
            color: designTokens.colors.text.tertiary,
            fontSize: '14px',
          }}>
            Updated {new Date(playlist.updated_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**Files to create:**
- `src/components/organisms/PlaylistGridView.tsx`

**13. Wrap MainDashboard in ResponsiveLayout**

Modify: `src/components/screens/MainDashboard.tsx`

Find the outermost container (around line 1200):
```tsx
// OLD:
<div style={{
  width: '100%',
  maxWidth: '425px',
  height: '100vh',
  // ...
}}>

// NEW:
<ResponsiveLayout currentTab={activeTab} onTabChange={setActiveTab}>
  <div style={{
    width: '100%',
    height: '100%', // Remove maxWidth for desktop
    // ...
  }}>
```

Remove TabBar from mobile view (now handled by ResponsiveLayout):
```tsx
// DELETE this section:
{!Capacitor.isNativePlatform() && (
  <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
)}
```

**Files to modify:**
- `src/components/screens/MainDashboard.tsx`

**14. Create desktop-optimized track upload component**

Create: `src/components/molecules/BulkAudioUploader.tsx`

```tsx
import { useState } from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { Upload } from 'lucide-react';

export function BulkAudioUploader({ bandId, onUploadComplete }) {
  const designTokens = useDesignTokens();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('audio/')
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const uploadFiles = async () => {
    setUploading(true);

    for (const file of files) {
      // Upload logic (reuse from AudioUploader.tsx)
      const formData = new FormData();
      formData.append('file', file);

      // Track progress
      setProgress(prev => ({ ...prev, [file.name]: 0 }));

      // Upload to Supabase storage + create track record
      // ... (implementation details)

      setProgress(prev => ({ ...prev, [file.name]: 100 }));
    }

    setUploading(false);
    onUploadComplete();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: `2px dashed ${designTokens.colors.borders.subtle}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: designTokens.colors.surface.primary,
      }}
    >
      <Upload size={48} color={designTokens.colors.text.tertiary} />
      <h3>Drag & drop audio files here</h3>
      <p style={{ color: designTokens.colors.text.secondary }}>
        or click to browse
      </p>

      <input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label htmlFor="file-input">
        <button>Browse Files</button>
      </label>

      {files.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>{files.length} files selected</h4>
          <button onClick={uploadFiles} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload All'}
          </button>

          {uploading && (
            <div>
              {files.map(file => (
                <div key={file.name}>
                  {file.name}: {progress[file.name] || 0}%
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Files to create:**
- `src/components/molecules/BulkAudioUploader.tsx`

**15. Add desktop features to MainDashboard**

Modify: `src/components/screens/MainDashboard.tsx`

Add conditional rendering for desktop features:
```tsx
const { isDesktop } = useResponsive();

// Playlist view - use grid on desktop
{isDesktop ? (
  <PlaylistGridView
    playlists={setLists}
    onSelectPlaylist={handleSelectPlaylist}
  />
) : (
  // Existing mobile list view
)}

// Upload section - bulk upload on desktop
{isDesktop ? (
  <BulkAudioUploader bandId={selectedBandId} onUploadComplete={refreshTracks} />
) : (
  <AudioUploader bandId={selectedBandId} onUploadComplete={refreshTracks} />
)}
```

**Files to modify:**
- `src/components/screens/MainDashboard.tsx`

#### Phase 2E: Add Media Queries for Polish

**16. Add responsive CSS utilities**

Modify: `src/styles.css`

```css
/* Existing mobile-first styles... */

/* Tablet and up */
@media (min-width: 768px) {
  .track-row {
    padding: 16px 24px;
  }

  .modal {
    max-width: 600px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .track-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .modal {
    max-width: 800px;
  }

  .desktop-sidebar {
    display: block;
  }

  .mobile-tab-bar {
    display: none;
  }
}

/* Ultra-wide */
@media (min-width: 1440px) {
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

**Files to modify:**
- `src/styles.css`

---

## Critical Files Summary

### New Files to Create
1. `supabase/migrations/[timestamp]_create_beta_invite_codes.sql`
2. `supabase/functions/confirm-beta-user/index.ts`
3. `src/utils/inviteCodeService.ts`
4. `src/components/screens/AdminInviteCodesScreen.tsx`
5. `src/components/guards/AdminRouteGuard.tsx`
6. `src/hooks/useResponsive.ts`
7. `src/components/layouts/DesktopNavigation.tsx`
8. `src/components/layouts/ResponsiveLayout.tsx`
9. `src/components/organisms/PlaylistGridView.tsx`
10. `src/components/molecules/BulkAudioUploader.tsx`

### Existing Files to Modify
1. `src/components/screens/PhoneAuthScreen.tsx` - Add invite code input
2. `src/components/screens/NewLandingPage.tsx` - Add waitlist form
3. `src/components/screens/MainDashboard.tsx` - Wrap in ResponsiveLayout, add desktop features
4. `src/App.tsx` - Add admin routes
5. `src/styles.css` - Add responsive media queries
6. `lib/database.types.ts` - Regenerate after migration

---

## Implementation Order

### Week 1: Beta Invite System
1. Create database migration (30 min)
2. Generate TypeScript types (5 min)
3. Create inviteCodeService.ts (1 hour)
4. Modify PhoneAuthScreen (2 hours)
5. Create Supabase Edge Function (1 hour)
6. Create AdminInviteCodesScreen (2 hours)
7. Test invite code flow end-to-end (1 hour)

### Week 2: Marketing Website
1. Enhance NewLandingPage with waitlist (2 hours)
2. Test waitlist signup (30 min)
3. Create email template for invite codes (1 hour)

### Week 3: Web Interface Foundation
1. Create useResponsive hook (30 min)
2. Create DesktopNavigation component (2 hours)
3. Create ResponsiveLayout wrapper (2 hours)
4. Test layouts on different screen sizes (1 hour)

### Week 4: Desktop Features
1. Modify MainDashboard to use ResponsiveLayout (2 hours)
2. Create BulkAudioUploader (4 hours)
3. Add responsive CSS (2 hours)
4. Test desktop upload flow (2 hours)
5. Polish and bug fixes (4 hours)

---

## Verification & Testing

### Invite Code System Testing
1. **Admin flow:**
   - Navigate to `/admin/codes`
   - Generate new invite code
   - Verify code appears in list
   - Copy code for testing

2. **Signup flow:**
   - Navigate to signup page
   - Enter email, password, and invite code
   - Click "Sign Up"
   - Verify user is created without email confirmation
   - Verify redirect to onboarding screen
   - Complete onboarding with name entry

3. **Code validation:**
   - Try signup with invalid code → should show error
   - Try signup with expired code → should show error
   - Use same code twice (if max_uses=1) → second attempt should fail

4. **Database verification:**
   - Check `beta_invite_codes` table shows incremented `current_uses`
   - Check `beta_code_usage` table has record of user + code
   - Check `profiles` table has new user record
   - Check user can login immediately without email confirmation

### Waitlist Testing
1. Navigate to homepage (not logged in)
2. Scroll to waitlist section
3. Enter email and submit
4. Verify success message
5. Check `user_access_control` table for new record with `access_level='waitlist'`

### Web Interface Testing
1. **Responsive layout:**
   - Open app in browser
   - Resize window: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
   - Verify navigation changes appropriately
   - Verify TabBar hides on desktop, shows on mobile

2. **Desktop navigation:**
   - Click each nav item (Library, Playlists, Settings)
   - Verify active state highlighting
   - Verify content area updates

3. **Bulk upload:**
   - Navigate to upload section on desktop
   - Drag multiple audio files onto drop zone
   - Verify files appear in list
   - Click "Upload All"
   - Verify progress indicators
   - Verify tracks appear in library after upload

4. **Cross-platform consistency:**
   - Test same user account on mobile app (iOS)
   - Test same user account on web (desktop)
   - Verify data syncs (tracks, playlists, ratings)

### Edge Cases
- Try accessing admin pages without `is_admin=true` → should redirect/error
- Try using invite code after it expires
- Try signup without invite code → should still work with email verification
- Test offline behavior on web vs mobile
- Test file upload limits (file size, file type validation)

---

## Security Considerations

1. **Invite codes are case-insensitive** - Always convert to uppercase
2. **RLS policies protect admin operations** - Only `is_admin=true` users can generate codes
3. **Edge function uses service role key** - Stored securely in Supabase environment
4. **Rate limiting** - Consider adding rate limits to code generation and validation
5. **Audit logging** - `beta_code_usage` table tracks who used which codes

---

## Rollback Plan

If issues arise:
1. **Disable invite code feature** - Set `is_active=false` on all codes
2. **Revert to email verification** - Remove invite code input from PhoneAuthScreen
3. **Database cleanup** - Drop tables with `DROP TABLE beta_invite_codes CASCADE;`
4. **Edge function** - Delete with `supabase functions delete confirm-beta-user`

---

## Future Enhancements

### Phase 3 (Post-Beta):
- Batch invite code generation (generate 100 codes at once)
- Email automation (send invite codes to waitlist automatically)
- Analytics dashboard (track code usage, conversion rates)
- Referral system (users can generate codes for friends)
- Advanced desktop features:
  - Multi-track waveform editor
  - Playlist collaboration (live editing)
  - Keyboard shortcuts
  - Desktop notifications
