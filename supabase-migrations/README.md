# Database Migrations

This directory contains database migration files for version control and incremental updates.

## Migration Files

### Initial Setup (Run in order)

1. **supabase-schema.sql** - Main schema with all tables, constraints, and initial RLS policies
2. **supabase-fix-rls.sql** - Profile auto-creation trigger (run after schema)
3. **supabase-indexes.sql** - Performance indexes (run after schema)
4. **supabase-rls-policies.sql** - Comprehensive RLS policies (can replace policies in schema.sql)
5. **supabase-functions.sql** - Database functions and triggers (run after schema)
6. **supabase-views.sql** - Database views for reporting (run after schema)

## Migration Best Practices

### When to Create a Migration

- Adding new tables or columns
- Modifying existing table structures
- Adding or changing indexes
- Updating RLS policies
- Creating new functions or triggers
- Data transformations

### Migration Naming Convention

Use timestamped filenames:
```
YYYYMMDDHHMMSS_description.sql
```

Example:
```
20250115120000_add_user_preferences_table.sql
```

### Migration Structure

Each migration should:
1. Be idempotent (safe to run multiple times)
2. Include rollback instructions in comments
3. Use `IF NOT EXISTS` / `IF EXISTS` clauses
4. Include verification queries

### Example Migration Template

```sql
-- Migration: Add user preferences table
-- Date: 2025-01-15
-- Description: Adds user_preferences table for storing user settings

-- Forward migration
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" 
ON user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON user_preferences FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Rollback (if needed):
-- DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
-- DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
-- DROP TABLE IF EXISTS user_preferences;
```

## Running Migrations

### In Supabase Dashboard

1. Go to SQL Editor
2. Copy migration SQL
3. Run the query
4. Verify results

### Using Supabase CLI

```bash
# Initialize migrations (if not done)
supabase init

# Create new migration
supabase migration new add_user_preferences_table

# Apply migrations
supabase db push

# Reset database (development only)
supabase db reset
```

## Current Migration Status

✅ **Completed:**
- Initial schema setup
- RLS policies
- Indexes
- Functions and triggers
- Views

## Notes

- Always test migrations in a development environment first
- Backup production database before running migrations
- Review migration SQL carefully before executing
- Keep migrations small and focused on one change

