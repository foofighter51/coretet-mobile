# CoreTet User Access Control System

## Overview
This document outlines the user access control system for CoreTet, designed to handle both open testing and waitlist-based beta phases.

## User Access Levels

### 1. **Open Testing Phase** (Current)
- **Anyone** can sign up with email and get immediate access
- **Purpose**: Bug testing, feature validation, initial feedback
- **Duration**: Until ready for beta launch

### 2. **Waitlist Beta Phase** (Future)
- **Invitation-only** access via admin-controlled invitations
- **Purpose**: Controlled rollout, quality user experience, word-of-mouth growth
- **Process**: Waitlist → Admin approval → Invitation sent → User signs up

## Database Schema

### `user_access_control` Table
```sql
CREATE TABLE user_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('blocked', 'waitlist', 'invited', 'active')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  waitlist_position INTEGER,
  waitlist_joined_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX idx_user_access_email ON user_access_control(email);
CREATE INDEX idx_user_access_level ON user_access_control(access_level);
```

### `app_settings` Table
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial settings
INSERT INTO app_settings (setting_key, setting_value) VALUES
('access_mode', '{"mode": "open_testing", "description": "Anyone can sign up"}'),
('beta_batch_size', '{"size": 50, "description": "Number of users invited per batch"}');
```

## Access Control Logic

### Phase 1: Open Testing
```typescript
// Anyone can sign up - no restrictions
const checkAccess = (email: string) => {
  return { allowed: true, reason: 'open_testing' };
}
```

### Phase 2: Waitlist Beta
```typescript
const checkAccess = async (email: string) => {
  const userAccess = await getUserAccessControl(email);

  if (!userAccess) {
    // New user - add to waitlist
    await addToWaitlist(email);
    return {
      allowed: false,
      reason: 'waitlist',
      message: 'Added to waitlist. You\'ll be notified when invited.'
    };
  }

  switch (userAccess.access_level) {
    case 'invited':
    case 'active':
      return { allowed: true, reason: 'invited' };
    case 'waitlist':
      return {
        allowed: false,
        reason: 'waitlist',
        position: userAccess.waitlist_position,
        message: `You're #${userAccess.waitlist_position} on the waitlist.`
      };
    case 'blocked':
      return {
        allowed: false,
        reason: 'blocked',
        message: 'Access denied.'
      };
  }
}
```

## User Journey Flows

### Open Testing Phase
1. User enters email
2. ✅ **Immediate OTP sent**
3. User verifies code
4. User completes onboarding
5. User accesses full app

### Waitlist Beta Phase
1. User enters email
2. **System checks access control**
   - **New user**: Added to waitlist, shown position
   - **Waitlisted**: Shown current position
   - **Invited**: ✅ OTP sent immediately
   - **Blocked**: Access denied
3. **For invited users**: Same flow as open testing

## Admin Management Interface

### Waitlist Management
- View all waitlisted users
- Batch invite users (e.g., invite next 50)
- Individual user management (promote, block, etc.)
- Waitlist analytics (conversion rates, etc.)

### Access Control
- Switch between open/waitlist modes
- Set batch invitation sizes
- Export user lists
- Monitor signup patterns

## Implementation Phases

### Phase 1: Database Setup ✅
- Create user_access_control table
- Create app_settings table
- Add RLS policies

### Phase 2: Access Control Service
- Create UserAccessService
- Implement access checking logic
- Add waitlist management functions

### Phase 3: UI Integration
- Add access control to auth flow
- Create waitlist notification screens
- Add admin interface

### Phase 4: Admin Dashboard
- Waitlist management interface
- User promotion/blocking tools
- Analytics and reporting

## Configuration

### Environment Variables
```env
# Access control mode: 'open_testing' | 'waitlist_beta'
VITE_ACCESS_MODE=open_testing

# Admin emails (comma-separated)
VITE_ADMIN_EMAILS=admin@coretet.com,team@coretet.com
```

### Feature Flags
- `ENABLE_WAITLIST`: Toggle waitlist functionality
- `ENABLE_ADMIN_INTERFACE`: Show admin tools to authorized users
- `BETA_BATCH_SIZE`: Number of users to invite per batch

## Benefits

### For Open Testing
- ✅ **Zero friction** - immediate access for testers
- ✅ **Fast feedback** - no barriers to trying the app
- ✅ **Bug discovery** - more users = more edge cases found

### For Waitlist Beta
- ✅ **Quality control** - curated user experience
- ✅ **Gradual scaling** - manageable user growth
- ✅ **Exclusivity** - creates desire and word-of-mouth
- ✅ **Resource management** - prevents server overload

## Future Considerations

### Invitation Codes
- Generate unique invitation codes for sharing
- Track invitation source (referral system)
- Set expiration dates on invitations

### User Tiers
- **Premium beta users**: Early access to new features
- **Community moderators**: Help manage user feedback
- **Band leaders**: Priority access for music group organizers

### Analytics
- Waitlist conversion rates
- User engagement by invitation batch
- Geographic distribution of signups