#!/bin/bash

# Apply Band Content RLS Policies Migration
# This script applies the RLS policies to secure band content

echo "🔒 Applying Band Content RLS Policies..."
echo "This will secure band-scoped content while keeping personal content shareable."
echo ""

# Check if SUPABASE_DB_PASSWORD is set
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ Error: SUPABASE_DB_PASSWORD environment variable not set"
    echo "Please set it with: export SUPABASE_DB_PASSWORD='your-password'"
    exit 1
fi

# Database connection string
DB_URL="postgresql://postgres.tvvztlizyciaafqkigwe:$SUPABASE_DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Apply migration
psql "$DB_URL" -f supabase/migrations/20251013_band_content_rls_policies.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🔍 Verifying policies..."
    psql "$DB_URL" -c "SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('tracks', 'playlists', 'playlist_tracks', 'ratings', 'comments') ORDER BY tablename, policyname;"
else
    echo ""
    echo "❌ Migration failed. Check the errors above."
    exit 1
fi
