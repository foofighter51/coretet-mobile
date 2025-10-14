# Phase 3B: Band Invite System

## Overview

Add invite functionality to allow band admins to invite users to join their bands. This builds on Phase 3A's security model where band content is only visible to members.

## User Flow

### Inviting Users (Admin)
1. Admin taps "Band Settings" button (new gear icon in Band tab header)
2. Sees "Band Settings" modal with sections:
   - **Band Info** (name, description, created date)
   - **Members** (list of current members with roles)
   - **Invite New Member** (button)
3. Taps "Invite New Member"
4. Enters invitee's email address
5. System generates unique invite link
6. Admin can:
   - Copy link to clipboard
   - Share via iOS share sheet
7. Invite appears in "Pending Invites" section

### Accepting Invites (Invitee)
1. Invitee receives invite link (via message, email, etc.)
2. Opens link in browser or app
3. If not logged in: Prompted to sign up/login
4. If logged in: Sees "Join Band" confirmation screen
5. Shows band name and inviter info
6. Taps "Join Band"
7. Added to `band_members` table
8. Redirect to Band tab showing new band content

## Database Schema

### New Table: `band_invites`
```sql
CREATE TABLE band_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  invited_by TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_band_invites_band_id ON band_invites(band_id);
CREATE INDEX idx_band_invites_token ON band_invites(invite_token);
CREATE INDEX idx_band_invites_email ON band_invites(invited_email);
```

### RLS Policies for `band_invites`
```sql
-- Band members can view invites for their band
CREATE POLICY "Band members can view their band invites"
  ON band_invites FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members WHERE user_id = auth.uid()::TEXT
    )
  );

-- Band admins can create invites
CREATE POLICY "Band admins can create invites"
  ON band_invites FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role = 'admin'
    )
  );

-- Admins can revoke (delete) pending invites
CREATE POLICY "Band admins can delete pending invites"
  ON band_invites FOR DELETE
  USING (
    status = 'pending'
    AND band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role = 'admin'
    )
  );

-- Anyone with valid token can view invite (for acceptance)
CREATE POLICY "Anyone can view invite with valid token"
  ON band_invites FOR SELECT
  USING (
    invite_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
  );

-- Authenticated users can update invites they're accepting
CREATE POLICY "Users can accept invites"
  ON band_invites FOR UPDATE
  USING (
    invite_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    status = 'accepted'
    AND accepted_by = auth.uid()::TEXT
  );
```

## UI Components

### 1. Band Settings Button (MainDashboard.tsx)
- Add gear icon to Band tab header (next to band name)
- Only visible when `activeTab === 'band'` and user is admin
- Opens Band Settings modal

### 2. Band Settings Modal (new: BandSettings.tsx)
**Sections:**
- **Band Info**
  - Band name
  - Description
  - Created date
  - Member count
- **Members**
  - List of current members
  - Show role (admin/member)
  - Admin badge for admins
- **Invite New Member** (admins only)
  - Button to open invite modal
- **Pending Invites** (admins only)
  - List of pending invites
  - Show email, invited by, created date
  - Revoke button per invite

### 3. Create Invite Modal (new: CreateInvite.tsx)
- Email input field
- "Generate Invite" button
- Shows generated link in copyable text field
- Copy button (copies to clipboard)
- Share button (iOS share sheet)
- Shows success message on creation

### 4. Accept Invite Screen (new: AcceptInvite.tsx)
- Shown when user opens invite link
- Displays:
  - Band name
  - Invited by (name)
  - "Join Band" button
  - Cancel button
- On accept:
  - Updates invite status to 'accepted'
  - Creates `band_members` record
  - Switches to Band tab
  - Shows success message

## API Functions (lib/supabase.ts)

### Band Invites Namespace
```typescript
bandInvites: {
  // Create new invite
  async create(bandId: string, invitedBy: string, invitedEmail: string)

  // Get invite by token (for acceptance page)
  async getByToken(token: string)

  // Accept invite
  async accept(token: string, userId: string)

  // Revoke (delete) invite
  async revoke(inviteId: string)

  // List invites for band
  async listForBand(bandId: string)
}
```

## Implementation Steps

1. **Database Setup**
   - Create `band_invites` table
   - Add RLS policies
   - Test policies with sample data

2. **API Functions**
   - Implement all `bandInvites` functions in lib/supabase.ts
   - Add invite token generation (crypto.randomUUID())
   - Add email validation

3. **Band Settings UI**
   - Create BandSettings.tsx component
   - Add gear icon button to MainDashboard
   - Implement members list
   - Implement pending invites list

4. **Create Invite Flow**
   - Create CreateInvite.tsx modal
   - Implement invite generation
   - Add clipboard copy
   - Add iOS share sheet integration

5. **Accept Invite Flow**
   - Create AcceptInvite.tsx screen
   - Handle deep linking (open app from invite link)
   - Implement join band logic
   - Add error handling (expired, invalid, already member)

6. **Testing**
   - Test invite creation as admin
   - Test invite acceptance as new user
   - Test expired invites
   - Test revoked invites
   - Test already-member case

## Security Considerations

- Only admins can create invites (enforced by RLS)
- Invite tokens are UUIDs (cryptographically random)
- Invites expire after 7 days
- Accepted invites cannot be reused
- Email validation prevents spam
- RLS ensures users can only see invites they should access

## Future Enhancements (Not in Phase 3B)

- Email sending (via Supabase Auth emails or external service)
- Role selection during invite (admin vs member)
- Invite expiration customization
- Bulk invite creation
- Invite usage limits
