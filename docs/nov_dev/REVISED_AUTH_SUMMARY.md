# Authentication Model - REVISED (2025-11-18)

## ✅ CORRECT Model: Email+Password+Phone for Admins

Based on clarification, the authentication model is:

### Account Owners (Admin Users)
- **Sign Up**: Email + Password + Phone Number
- **Sign In**: Email + Password
- **Phone Verification**: SMS OTP during signup
- **Use Case**: Web app power users, batch uploads, band management
- **Primary Platform**: Desktop web app

### SMS Share Recipients
- **Access**: SMS access code only
- **No Account**: Can listen without signing up
- **Use Case**: Mobile collaborators, lightweight listening
- **Upgrade Path**: Can create account later (claims all previous shares)

---

## Key Requirements

✅ **Both email AND phone are required** for account owners
✅ **Email for authentication** (login, password reset, receipts)
✅ **Phone for sharing** (SMS playlist codes)
✅ **SMS recipients** can access without account
✅ **Account linking** - SMS recipient creates account with same phone → auto-claims shares

---

## Database Schema

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY REFERENCES auth.users(id),

  -- BOTH required
  email TEXT UNIQUE NOT NULL,           -- For auth, receipts, notifications
  phone_number TEXT UNIQUE NOT NULL,    -- For SMS sharing (E.164 format)

  name TEXT NOT NULL,
  tier TEXT DEFAULT 'free',
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 1073741824,
  -- ... other columns
);
```

---

## Sign-Up Flow

```
1. User visits web app → Clicks "Create Account"
   ↓
2. Form fields:
   - Email Address (required)
   - Password (required)
   - Display Name (required)
   - Phone Number (required - "Required for sharing playlists")
   ↓
3. Submit → Create Supabase Auth user (email + password)
   ↓
4. Send SMS OTP to phone number
   ↓
5. User enters 6-digit code
   ↓
6. Verify OTP → Create profile record
   ↓
7. Check for existing SMS shares with this phone → Auto-link
   ↓
8. User lands in dashboard
```

---

## SMS Sharing Flow

```
ACCOUNT OWNER (shares):
1. Creates playlist
2. Clicks "Share Playlist"
3. Enters phone numbers of recipients
4. Each receives SMS with access code

SMS RECIPIENT (receives):
1. Receives SMS: "Code: A7K9M2, Link: coretet.app/listen/xyz"
2. Opens link, enters code
3. Can listen without account
4. Sees banner: "Create account to save this playlist"
5. OPTIONAL: Creates account
   - Email + Password + Phone (MUST be same phone from SMS)
   - All previous SMS shares auto-linked to account
```

---

## Account Linking Logic

When SMS recipient creates account:

```typescript
// 1. User creates account with:
email: "collaborator@example.com"
password: "••••••••"
phone: "+15551234567"  // Same phone that received SMS shares

// 2. After phone verification, backend runs:
const phoneHash = hashPhoneNumber("+15551234567");

// 3. Find all SMS shares sent to this phone
const shares = await findAccessGrants(phoneHash);
// Returns: [playlist_A, playlist_B, playlist_C]

// 4. Create playlist_followers records
await linkPlaylists(userId, [playlist_A, playlist_B, playlist_C]);

// 5. User now sees all 3 playlists in "Shared with Me" tab
```

---

## Key Differences from Original Design

| Aspect | Original (Phone-First) | REVISED (Dual Auth) |
|--------|----------------------|------------------|
| **Account Auth** | Phone + SMS OTP | Email + Password |
| **Email Required?** | No (optional) | Yes (required) |
| **Phone Required?** | Yes (primary) | Yes (for sharing) |
| **Sign-Up Fields** | Phone only | Email + Password + Phone |
| **Sign-In Method** | Phone + OTP | Email + Password |
| **Use Case** | Mobile-first | Web app admins |
| **SMS Recipients** | Same | Same (no change) |

---

## Benefits of Revised Model

✅ **Email for professional use** - Password resets, receipts, notifications
✅ **Web app focused** - Email login familiar for desktop users
✅ **Phone for sharing** - SMS codes for low-friction collaboration
✅ **Account linking** - SMS recipients can upgrade, claim shares
✅ **Dual identity** - Email for auth, phone for sharing

---

## Implementation Checklist

### Phase 1: Database (Week 1)
- [ ] Add `phone_number` column to `profiles` (unique, not null)
- [ ] Keep `email` as required (do not make nullable)
- [ ] Create `playlist_followers` table
- [ ] Update `playlist_access_grants` with `claimed_by`, `claimed_at`

### Phase 2: Auth Service (Week 1)
- [ ] Sign-up: Email + Password + Phone (with SMS OTP verification)
- [ ] Sign-in: Email + Password
- [ ] Phone normalization function (E.164 format)
- [ ] Phone hashing function (SHA-256)
- [ ] SMS share → account linking logic

### Phase 3: UI Components (Week 2)
- [ ] Sign-up form: Email + Password + Name + Phone
- [ ] SMS OTP verification screen
- [ ] Sign-in form: Email + Password
- [ ] "Create Account" banner for SMS recipients
- [ ] "Shared with Me" tab for linked playlists

### Phase 4: SMS Sharing (Week 2)
- [ ] Share playlist modal (enter phone numbers)
- [ ] Access code generation (6-character)
- [ ] Access code entry screen (recipient view)
- [ ] Playlist player for SMS recipients
- [ ] Account linking on signup

---

## Files Updated

- ✅ `/docs/nov_dev/USER_IDENTITY_AND_AUTH.md` - Complete revised architecture
- ✅ `/docs/nov_dev/BACKEND_UX_PRIORITIES.md` - Updated Priority 1.0
- ✅ `/docs/nov_dev/REVISED_AUTH_SUMMARY.md` - This file
- ✅ `/src/components/molecules/AudioUploader.tsx` - Removed fake compression

---

## Next Steps

1. **Review** [USER_IDENTITY_AND_AUTH.md](USER_IDENTITY_AND_AUTH.md) for complete flows
2. **Implement** database migration (add phone_number column)
3. **Build** phone utility functions (normalize, format, hash)
4. **Update** auth service for email+password+phone signup
5. **Create** SMS OTP verification flow
6. **Test** account linking (SMS → account creation)

---

**This revised model correctly matches your requirements! ✅**

- Admin users: Email + Password + Phone ✅
- SMS recipients: Phone-only access ✅
- Web app focused for admins ✅
- Mobile/SMS focused for collaborators ✅
