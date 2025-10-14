# Add Foreign Key for band_invites.invited_by

## Issue

The `band_invites` table is missing a foreign key relationship to `profiles` table for the `invited_by` column. This is needed to fetch the inviter's name.

## Fix

Run this SQL in Supabase SQL Editor:

---

-- Add foreign key constraint for invited_by column
ALTER TABLE band_invites
ADD CONSTRAINT band_invites_invited_by_fkey
FOREIGN KEY (invited_by)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- Also add foreign key for accepted_by column (for consistency)
ALTER TABLE band_invites
ADD CONSTRAINT band_invites_accepted_by_fkey
FOREIGN KEY (accepted_by)
REFERENCES profiles(id)
ON DELETE SET NULL;

---

## Verify

Run this to verify the foreign keys were added:

```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'band_invites';
```

You should see:
- `band_invites_band_id_fkey` → bands(id)
- `band_invites_invited_by_fkey` → profiles(id)
- `band_invites_accepted_by_fkey` → profiles(id)
