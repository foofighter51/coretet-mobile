# Fix band_invites Table Schema

## Issue

The `band_invites` table exists but has an old schema. It needs to be updated to match the new Phase 3B design with `invite_token` column.

## Solution

Drop and recreate the table with the correct schema.

## Steps

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Copy the SQL below and paste it
3. Click **Run**

## SQL to Run

```sql
-- =====================================================
-- DROP AND RECREATE BAND_INVITES TABLE
-- =====================================================

-- Drop existing table (CASCADE removes dependent objects like policies)
DROP TABLE IF EXISTS band_invites CASCADE;

-- Create new table with correct schema
CREATE TABLE band_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  invited_by TEXT NOT NULL,
  invited_email TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for performance
CREATE INDEX idx_band_invites_band_id ON band_invites(band_id);
CREATE INDEX idx_band_invites_token ON band_invites(invite_token);
CREATE INDEX idx_band_invites_email ON band_invites(invited_email);
CREATE INDEX idx_band_invites_status ON band_invites(status);

-- Enable RLS
ALTER TABLE band_invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR BAND_INVITES
-- =====================================================

-- 1. Band members can view invites for their band
CREATE POLICY "Band members can view their band invites"
  ON band_invites FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members WHERE user_id = auth.uid()::TEXT
    )
  );

-- 2. Band admins can create invites (owner or admin role)
CREATE POLICY "Band admins can create invites"
  ON band_invites FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('admin', 'owner')
    )
  );

-- 3. Admins can revoke (delete) pending invites
CREATE POLICY "Band admins can delete pending invites"
  ON band_invites FOR DELETE
  USING (
    status = 'pending'
    AND band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('admin', 'owner')
    )
  );

-- 4. Anyone with valid token can view invite (for acceptance page)
CREATE POLICY "Anyone can view invite with valid token"
  ON band_invites FOR SELECT
  USING (
    invite_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
  );

-- 5. Authenticated users can accept invites (update status)
CREATE POLICY "Users can accept invites"
  ON band_invites FOR UPDATE
  USING (
    invite_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    status IN ('accepted', 'expired')
    AND accepted_by = auth.uid()::TEXT
  );
```

## Verify

Run this to verify the table was created correctly:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'band_invites'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'band_invites';

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY policyname;
```

### Expected Results

**Columns (10 total):**
- id (uuid)
- band_id (uuid)
- invited_by (text)
- invited_email (text)
- invite_token (text)
- status (text)
- created_at (timestamp with time zone)
- accepted_at (timestamp with time zone)
- accepted_by (text)
- expires_at (timestamp with time zone)

**Indexes (5 total):**
- band_invites_pkey (PRIMARY KEY on id)
- idx_band_invites_band_id
- idx_band_invites_token
- idx_band_invites_email
- idx_band_invites_status

**RLS Policies (5 total):**
1. Anyone can view invite with valid token (SELECT)
2. Band admins can create invites (INSERT)
3. Band admins can delete pending invites (DELETE)
4. Band members can view their band invites (SELECT)
5. Users can accept invites (UPDATE)

## Notes

- **Data Loss:** This will delete any existing invites in the table. If you have important invite data, export it first.
- **Owner Role:** Updated policy to allow both 'admin' and 'owner' roles to create/delete invites
