# Database Development - README Section

**Add this section to your main README.md:**

---

## Database Development

### Schema Consistency

This project uses automated TypeScript type generation to maintain consistency between the Supabase database schema and application code.

#### Quick Start

```bash
# After making schema changes in Supabase:
npm run db:types

# Check if types are up to date:
npm run db:types:check
```

#### Documentation

- **[Database Schema Reference](docs/DATABASE_SCHEMA.md)** - Complete table definitions
- **[Developer Workflow](docs/DEV_WORKFLOW_DATABASE.md)** - How to work with database
- **[Setup Guide](docs/SCHEMA_CONSISTENCY_SETUP.md)** - Implementation details

#### Workflow

1. Make schema changes in Supabase Dashboard
2. Run `npm run db:types` to update TypeScript types
3. Update [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
4. Use generated types in your code
5. Commit types + code together

#### Type-Safe Database Operations

```typescript
import { Database } from './lib/database.types';

// Get type-safe table definitions
type BandMember = Database['public']['Tables']['band_members']['Row'];
type BandMemberInsert = Database['public']['Tables']['band_members']['Insert'];

// TypeScript catches errors at compile time
const member: BandMemberInsert = {
  band_id: bandId,
  user_id: userId,
  role: 'member',
  // TypeScript autocomplete shows all valid columns
};
```

---

**Copy the section above into your main README.md under a "Database Development" heading.**
