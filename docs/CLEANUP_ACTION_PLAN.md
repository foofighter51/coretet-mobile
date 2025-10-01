# CoreTet Band - Cleanup Action Plan
**Created:** 2025-09-29
**Status:** Ready for Execution

## 🎯 Quick Wins (Complete These First)

### Session 1: Dead Code Removal (1 hour)
**Impact:** Remove 3,000+ lines of unused code

```bash
# Delete unused Supabase Auth implementation
rm src/contexts/AuthContext.tsx
rm src/utils/supabaseAuthService.ts
rm src/utils/authErrorHandler.ts
rm src/utils/userAccessService.ts

# Delete unused authentication screens
rm src/components/screens/EmailPasswordScreen.tsx
rm src/components/screens/ForgotPasswordScreen.tsx
rm src/components/screens/MagicLinkVerificationScreen.tsx
rm src/components/screens/PasswordResetScreen.tsx
rm src/components/screens/CodeVerificationScreen.tsx

# Archive old app implementations
mv src/App-original.tsx archive/old-auth-system/
```

**Verification:** Run `npm run build` - should compile without errors

---

### Session 2: Fix UUID Generation (30 minutes)
**Impact:** Prevent profile collisions

**File:** `src/utils/clerkSupabaseSync.ts`

**Replace lines 9-24 with:**
```typescript
static generateUUIDFromClerkId(clerkId: string): string {
  // Use Web Crypto API for deterministic UUID generation
  const encoder = new TextEncoder();
  const data = encoder.encode(clerkId);

  // Create SHA-256 hash
  const hashPromise = crypto.subtle.digest('SHA-256', data);

  // Format as UUID v5 (name-based)
  return hashPromise.then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `${hashHex.substring(0,8)}-${hashHex.substring(8,12)}-5${hashHex.substring(13,16)}-${hashHex.substring(16,20)}-${hashHex.substring(20,32)}`;
  });
}
```

**Note:** This makes the function async. Update all callers.

**Alternative (synchronous using deterministic approach):**
```typescript
static generateUUIDFromClerkId(clerkId: string): string {
  // Use a namespace UUID approach
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Standard UUID namespace

  // Simple but deterministic hash that maintains full UUID entropy
  const str = namespace + clerkId;
  let hash = '';

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash += char.toString(16).padStart(2, '0');
  }

  // Pad to ensure we have enough characters
  while (hash.length < 32) {
    hash += hash;
  }

  // Format as UUID v5
  return `${hash.substring(0,8)}-${hash.substring(8,12)}-5${hash.substring(13,16)}-a${hash.substring(17,20)}-${hash.substring(20,32)}`;
}
```

**Test:** Verify same Clerk ID always generates same UUID

---

### Session 3: Add Error Boundary (45 minutes)
**Impact:** Prevent full app crashes

**Create:** `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h1>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{
                fontSize: '12px',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                overflow: 'auto'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update:** `src/main.tsx`

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

---

### Session 4: Fix Band Creator Auto-Add (30 minutes)
**Impact:** Band creators can access their own bands

**File:** `src/contexts/BandContext.tsx`

**Update `createBand` function (around line 94):**

```typescript
const createBand = async (bandData: Omit<Band, 'id' | 'createdAt'>) => {
  try {
    setLoading(true);
    setError(null);

    const { user } = useUser();
    if (!user) throw new Error('User not authenticated');

    // Generate Supabase UUID from Clerk ID
    const supabaseUserId = ClerkSupabaseSync.generateUUIDFromClerkId(user.id);

    // Create ensemble
    const { data, error } = await db.ensembles.create({
      name: bandData.name,
      description: bandData.description,
    });

    if (error) throw error;

    // Auto-add creator as owner
    const { error: memberError } = await supabase
      .from('ensemble_members')
      .insert({
        ensemble_id: data.id,
        user_id: supabaseUserId,
        role: 'owner',
      });

    if (memberError) {
      console.error('Failed to add creator to band:', memberError);
      // Don't fail the whole operation, just log
    }

    await fetchUserBands();
    return { success: true, band: data };
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create band');
    return { success: false, error: err };
  } finally {
    setLoading(false);
  }
};
```

---

### Session 5: Delete Dangerous SQL Scripts (5 minutes)
**Impact:** Prevent accidental security bypasses

```bash
rm scripts/disable-rls.sql
rm scripts/disable-rls-temporarily.sql
```

**Note:** RLS is already disabled in production. Need to re-enable it properly.

---

## 🔐 Security Sprint (Week 1)

### Day 1: API Key Rotation
**Time:** 2 hours

1. **Rotate Clerk Keys:**
   - Go to https://dashboard.clerk.com
   - Regenerate Secret Key and Publishable Key
   - Update .env.local (locally only, never commit)

2. **Rotate Supabase Keys:**
   - Go to Supabase Dashboard → Settings → API
   - Regenerate anon key and service_role key
   - Update Edge Function secrets:
     ```bash
     supabase secrets set SERVICE_ROLE_KEY="new_key_here"
     ```

3. **Rotate Gemini API Key:**
   - Go to Google AI Studio
   - Regenerate API key
   - Update .env.local

4. **Update .gitignore:**
   ```bash
   echo ".env.local" >> .gitignore
   echo ".env.*.local" >> .gitignore
   ```

5. **Remove .env.local from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

---

### Day 2-3: Re-enable RLS (2 days)

**Step 1: Create Clerk-Compatible RLS Policies**

Run in Supabase SQL Editor:

```sql
-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Service role can do anything (for Edge Functions)
CREATE POLICY "Service role full access"
  ON profiles FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
```

**Step 2: Configure Clerk JWT Template**

In Clerk Dashboard:
1. Go to JWT Templates
2. Create "Supabase" template
3. Add custom claims:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "phone": "{{user.primary_phone_number}}"
   }
   ```

**Step 3: Update Supabase to Accept Clerk JWTs**

In Supabase Dashboard → Authentication → Settings:
1. Add Clerk as external provider
2. Set JWKS URL to Clerk's endpoint
3. Configure JWT validation

---

### Day 4: Force Edge Function Usage (1 day)

**Update `src/utils/clerkSupabaseSync.ts`:**

```typescript
// Remove syncUserProfileDirect() method
// Keep only syncUserProfile() which calls Edge Function

static async syncUserProfile(
  clerkUser: User,
  sessionToken: string
): Promise<{success: boolean; profile?: any; error?: string}> {
  const { data, error } = await supabase.functions.invoke('create-profile', {
    body: {
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      phone_number: clerkUser.primaryPhoneNumber?.phoneNumber || '',
    },
    headers: {
      'x-clerk-token': sessionToken,
    },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, profile: data.profile };
}
```

**Update `src/App.tsx`:**

```typescript
// Change back to:
const sessionToken = await getToken({ template: 'supabase' });
const result = await ClerkSupabaseSync.syncUserProfile(user, sessionToken);
```

---

## 📝 Documentation Sprint (Week 2)

### Update README.md

Replace current README with:

```markdown
# CoreTet Band Collaboration Platform

A real-time music collaboration platform for bands to share, review, and iterate on audio recordings.

## Features

- 🎵 Audio file upload and playback
- 👥 Band management with invite codes
- 💬 Comments and ratings on recordings
- 📱 Mobile-responsive design
- 🔐 Secure authentication via Clerk

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Authentication:** Clerk (phone/SMS)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Hosting:** TBD

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account

### Environment Variables

Create `.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
npm run dev
```

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Architecture

- `/src/features` - Feature-based organization
- `/src/shared` - Shared components and utilities
- `/lib` - External service clients (Supabase, Clerk)
- `/supabase/functions` - Edge Functions for secure operations

## Security

- Row Level Security (RLS) enabled on all tables
- JWT validation via Clerk
- All database writes through Edge Functions
- API keys stored in environment variables (never committed)

## Contributing

See CONTRIBUTING.md for guidelines.

## License

Proprietary - All rights reserved
```

---

## 🧪 Testing Sprint (Month 2)

### Setup Testing Infrastructure

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Create `vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
```

### Priority Test Coverage

1. **Authentication Flow** (critical)
2. **Band Creation/Joining** (critical)
3. **Audio Upload** (critical)
4. **Error Handling** (high)
5. **UI Components** (medium)

---

## 📊 Success Metrics

### Week 1 Targets
- [ ] 0 exposed API keys
- [ ] RLS enabled on all tables
- [ ] 0 dead code files
- [ ] UUID collision risk eliminated

### Month 1 Targets
- [ ] All writes through Edge Functions
- [ ] Error boundaries in place
- [ ] Documentation complete
- [ ] 0 critical security issues

### Month 3 Targets
- [ ] >70% test coverage
- [ ] <10,000 total lines of code
- [ ] Production ready
- [ ] External security audit passed

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All API keys rotated
- [ ] RLS enabled and tested
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Error monitoring set up (Sentry)
- [ ] Database backups configured
- [ ] SSL certificates valid
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] GDPR compliance reviewed

---

**Next Session:** Start with Session 1 (Dead Code Removal)