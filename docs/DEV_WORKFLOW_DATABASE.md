# Database Development Workflow

**How to maintain consistency between database schema and TypeScript code**

---

## Quick Start

### First Time Setup

1. **Install Supabase CLI** (if not already installed)
```bash
brew install supabase/tap/supabase
# OR
npm install -g supabase
```

2. **Login to Supabase**
```bash
supabase login
```

3. **Set your project ID**
```bash
# Find your project ID: Supabase Dashboard → Project Settings → General
# Add to .env.local:
echo "SUPABASE_PROJECT_ID=your-project-id-here" >> .env.local
```

4. **Generate initial types**
```bash
npm run db:types
```

---

## Daily Workflow

### Scenario 1: Making a Schema Change

**Steps:**

1. **Make change in Supabase Dashboard**
   - Go to SQL Editor
   - Write your migration (e.g., add column, create table)
   - Run the SQL

2. **Save the migration**
   ```bash
   # Save your SQL in /migrations/ folder
   # Example: migrations/2025-11-07_add_member_notes.sql
   ```

3. **Regenerate TypeScript types**
   ```bash
   npm run db:types
   ```

4. **Update documentation**
   - Update `/docs/DATABASE_SCHEMA.md` with new columns/tables
   - Add comments to your code

5. **Update your code**
   ```typescript
   // Use the new types!
   import { Database } from '../lib/database.types';
   type BandMember = Database['public']['Tables']['band_members']['Row'];
   ```

6. **Test your changes**
   ```bash
   npm run build  # Catch any type errors
   ```

7. **Commit everything together**
   ```bash
   git add lib/database.types.ts
   git add docs/DATABASE_SCHEMA.md
   git add migrations/2025-11-07_add_member_notes.sql
   git add src/your-updated-code.ts
   git commit -m "feat: add notes field to band members"
   ```

---

### Scenario 2: Working on Existing Code

**Before you start coding:**

1. **Check if types are up to date**
   ```bash
   npm run db:types:check
   ```

2. **If out of date, regenerate**
   ```bash
   npm run db:types
   ```

3. **Use the generated types**
   ```typescript
   import { Database } from '../lib/database.types';

   // Get type-safe table definitions
   type Tables = Database['public']['Tables'];
   type BandInvite = Tables['band_invites']['Row'];
   type BandInviteInsert = Tables['band_invites']['Insert'];
   type BandInviteUpdate = Tables['band_invites']['Update'];
   ```

---

## Best Practices

### ✅ DO

- **Always use generated types** instead of hardcoding column names
- **Run `npm run db:types`** after any schema changes
- **Commit type files with code changes** together
- **Check documentation** in `/docs/DATABASE_SCHEMA.md` when unsure
- **Test database operations** after regenerating types
- **Use TypeScript autocomplete** to discover available columns

### ❌ DON'T

- **Never manually edit** `lib/database.types.ts`
- **Don't hardcode column names** without checking schema
- **Don't skip type regeneration** after schema changes
- **Don't commit code** without committing updated types
- **Don't assume column names** - always verify

---

## Example: Type-Safe Database Operation

### Bad (Error-Prone) ❌

```typescript
// No type safety - easy to make mistakes!
const { data, error } = await supabase
  .from('band_invites')
  .insert({
    invited_email: email,  // ❌ Wrong column name!
    invite_token: token,   // ❌ Wrong column name!
    accepted_by: userId,   // ❌ Column doesn't exist!
  });
```

### Good (Type-Safe) ✅

```typescript
import { Database } from '../lib/database.types';

type BandInviteInsert = Database['public']['Tables']['band_invites']['Insert'];

// TypeScript will catch errors!
const inviteData: BandInviteInsert = {
  band_id: bandId,
  email: email,          // ✅ Correct - autocomplete helps
  invited_by: userId,
  token: token,          // ✅ Correct
  status: 'pending',
  expires_at: expiryDate,
  // accepted_by: userId // ❌ TypeScript error: Property doesn't exist!
};

const { data, error } = await supabase
  .from('band_invites')
  .insert(inviteData);
```

---

## Troubleshooting

### "Column doesn't exist" error

```bash
# 1. Check if you regenerated types
npm run db:types

# 2. Check the schema documentation
cat docs/DATABASE_SCHEMA.md | grep -A 10 "your_table_name"

# 3. Check Supabase Dashboard
# → Table Editor → View your table structure
```

### "Type error" after schema change

```bash
# 1. Regenerate types
npm run db:types

# 2. Find where types changed
git diff lib/database.types.ts

# 3. Update your code to match new types
# TypeScript errors will guide you
```

### "Permission denied" / RLS errors

```bash
# 1. Check if you're authenticated
# 2. Check RLS policies in Supabase Dashboard → Authentication → Policies
# 3. Verify your user has correct permissions in band_members
```

---

## NPM Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run db:types` | Regenerate TypeScript types from Supabase schema |
| `npm run db:types:check` | Check if types are up to date (CI/CD) |

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Check Database Types

on: [push, pull_request]

jobs:
  check-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Check if database types are up to date
        run: npm run db:types:check
        env:
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

---

## File Structure

```
coretet-band/
├── lib/
│   ├── database.types.ts          # ✅ Auto-generated (DO NOT EDIT)
│   └── supabase.ts                # Database operations
├── docs/
│   ├── DATABASE_SCHEMA.md         # Human-readable schema docs
│   └── DEV_WORKFLOW_DATABASE.md   # This file
├── migrations/
│   ├── 001-create-bands-system.sql
│   ├── 002-create-personal-bands.sql
│   └── 2025-11-07_your_migration.sql
└── scripts/
    └── generate-types.sh          # Type generation script
```

---

## Common Patterns

### Pattern 1: Creating a New Table

```sql
-- 1. migrations/add_band_notes.sql
CREATE TABLE band_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_band_notes_band_id ON band_notes(band_id);
```

```bash
# 2. Regenerate types
npm run db:types
```

```typescript
// 3. Use in code
import { Database } from '../lib/database.types';

type BandNote = Database['public']['Tables']['band_notes']['Row'];

export const db = {
  bandNotes: {
    async create(note: Database['public']['Tables']['band_notes']['Insert']) {
      const { data, error } = await supabase
        .from('band_notes')
        .insert(note)
        .select()
        .single();

      return { data, error };
    },
  },
};
```

### Pattern 2: Adding a Column

```sql
-- 1. migrations/add_last_active.sql
ALTER TABLE band_members
ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
```

```bash
# 2. Regenerate types
npm run db:types
```

```typescript
// 3. TypeScript now knows about the new column!
type BandMember = Database['public']['Tables']['band_members']['Row'];
// BandMember.last_active_at is now available ✅
```

---

## Summary

1. **Schema changes** → Supabase Dashboard
2. **Save migration** → `/migrations/` folder
3. **Regenerate types** → `npm run db:types`
4. **Update docs** → `/docs/DATABASE_SCHEMA.md`
5. **Write code** → Use generated types
6. **Test** → `npm run build`
7. **Commit** → All files together

**Golden Rule:** Never trust your memory - trust the types! 🎯
