#!/bin/bash
# Database Backup Script for CoreTet
# Run this BEFORE applying MVP migrations
# Date: 2025-12-05

set -e  # Exit on error

BACKUP_DIR="database-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/coretet_backup_${TIMESTAMP}.sql"

echo "🔐 CoreTet Database Backup"
echo "=========================="
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if we're linked to Supabase project
echo "📡 Checking Supabase project link..."
if ! supabase status 2>/dev/null | grep -q "tvvztlizyciaafqkigwe"; then
    echo "⚠️  Not linked to Supabase project. Attempting to link..."
    supabase link --project-ref tvvztlizyciaafqkigwe
fi

echo ""
echo "💾 Creating database backup..."
echo "   File: ${BACKUP_FILE}"
echo ""

# Dump the entire database schema and data
supabase db dump --linked -f "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backup completed successfully!"
    echo ""
    echo "📊 Backup details:"
    ls -lh "${BACKUP_FILE}"
    echo ""
    echo "🔒 Backup location: ${BACKUP_FILE}"
    echo ""
    echo "To restore from this backup (if needed):"
    echo "   psql <connection-string> -f ${BACKUP_FILE}"
    echo ""
    echo "⚠️  Important: Keep this backup safe until migrations are verified!"
else
    echo ""
    echo "❌ Backup failed!"
    echo ""
    echo "Alternative: Use Supabase Dashboard"
    echo "   1. Go to https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe"
    echo "   2. Settings → Database → Backups"
    echo "   3. Create manual backup"
    exit 1
fi
