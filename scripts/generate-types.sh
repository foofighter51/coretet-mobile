#!/bin/bash

# Generate TypeScript types from Supabase schema
# This script pulls the latest database schema and generates TypeScript types

set -e  # Exit on error

echo "🔄 Generating TypeScript types from Supabase schema..."
echo ""

# Check if SUPABASE_PROJECT_ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "❌ Error: SUPABASE_PROJECT_ID environment variable is not set"
  echo ""
  echo "To fix this:"
  echo "1. Find your project ID in Supabase Dashboard → Project Settings → General"
  echo "2. Add to your .env.local file:"
  echo "   SUPABASE_PROJECT_ID=your-project-id"
  echo ""
  exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Error: Supabase CLI is not installed"
  echo ""
  echo "Install with: npm install -g supabase"
  echo "Or with Homebrew: brew install supabase/tap/supabase"
  echo ""
  exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
  echo "⚠️  You need to login to Supabase CLI first"
  echo ""
  echo "Run: supabase login"
  echo ""
  exit 1
fi

echo "📦 Fetching schema from project: $SUPABASE_PROJECT_ID"
echo ""

# Generate types
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > lib/database.types.ts

if [ $? -eq 0 ]; then
  echo "✅ Successfully generated types in lib/database.types.ts"
  echo ""
  echo "📝 Next steps:"
  echo "1. Review the generated types"
  echo "2. Update your supabase.ts file to use these types"
  echo "3. Commit the changes: git add lib/database.types.ts"
  echo ""
else
  echo "❌ Failed to generate types"
  exit 1
fi
