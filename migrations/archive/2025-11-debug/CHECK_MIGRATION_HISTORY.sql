-- Check what migrations are recorded in Supabase's migration history table
SELECT version, name, statements
FROM supabase_migrations.schema_migrations
ORDER BY version;
