-- WARNING: This will DELETE all existing data!
-- Only use if you want to completely reset the database

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS user_discussion_answers CASCADE;
DROP TABLE IF EXISTS module_notes CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS wedding_budget CASCADE;
DROP TABLE IF EXISTS mahr CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS user_checklist_status CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS checklist_categories CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS discussion_prompts CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Now you can run the full supabase-schema.sql
