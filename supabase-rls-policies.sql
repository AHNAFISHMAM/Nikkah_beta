-- =============================================
-- COMPREHENSIVE RLS POLICIES
-- =============================================
-- Run this after supabase-schema.sql
-- This file contains ALL RLS policies with best practices

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_checklist_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mahr ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discussion_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES (if re-running)
-- =============================================
-- Uncomment if you need to reset all policies
-- DO $$ 
-- DECLARE
--   r RECORD;
-- BEGIN
--   FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own profile" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own profile" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can delete own profile" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Anyone can view checklist categories" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Anyone can view checklist items" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can create custom checklist items" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own checklist status" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own checklist status" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own checklist status" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can delete own checklist status" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own budget" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own budget" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own budget" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own mahr" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own mahr" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own mahr" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own wedding budget" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own wedding budget" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own wedding budget" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own savings goals" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own savings goals" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own savings goals" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Anyone can view modules" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own module notes" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own module notes" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own module notes" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Anyone can view discussion prompts" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can view own discussion answers" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can insert own discussion answers" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Users can update own discussion answers" ON ' || quote_ident(r.tablename);
--     EXECUTE 'DROP POLICY IF EXISTS "Anyone can view resources" ON ' || quote_ident(r.tablename);
--   END LOOP;
-- END $$;

-- =============================================
-- PROFILES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Note: DELETE is handled by CASCADE from auth.users

-- =============================================
-- CHECKLIST CATEGORIES POLICIES (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view checklist categories" ON checklist_categories;
CREATE POLICY "Anyone can view checklist categories" 
ON checklist_categories FOR SELECT 
USING (true);

-- Only service role can modify (no policies for INSERT/UPDATE/DELETE for regular users)

-- =============================================
-- CHECKLIST ITEMS POLICIES
-- =============================================
-- Public read for all items
DROP POLICY IF EXISTS "Anyone can view checklist items" ON checklist_items;
CREATE POLICY "Anyone can view checklist items" 
ON checklist_items FOR SELECT 
USING (true);

-- Users can create custom items
DROP POLICY IF EXISTS "Users can create custom checklist items" ON checklist_items;
CREATE POLICY "Users can create custom checklist items" 
ON checklist_items FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = created_by 
  AND is_custom = true
);

-- Users can update their own custom items
DROP POLICY IF EXISTS "Users can update own custom checklist items" ON checklist_items;
CREATE POLICY "Users can update own custom checklist items" 
ON checklist_items FOR UPDATE 
USING (auth.uid() = created_by AND is_custom = true)
WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Users can delete their own custom items
DROP POLICY IF EXISTS "Users can delete own custom checklist items" ON checklist_items;
CREATE POLICY "Users can delete own custom checklist items" 
ON checklist_items FOR DELETE 
USING (auth.uid() = created_by AND is_custom = true);

-- =============================================
-- USER CHECKLIST STATUS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own checklist status" ON user_checklist_status;
CREATE POLICY "Users can view own checklist status" 
ON user_checklist_status FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own checklist status" ON user_checklist_status;
CREATE POLICY "Users can insert own checklist status" 
ON user_checklist_status FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own checklist status" ON user_checklist_status;
CREATE POLICY "Users can update own checklist status" 
ON user_checklist_status FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own checklist status" ON user_checklist_status;
CREATE POLICY "Users can delete own checklist status" 
ON user_checklist_status FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================
-- BUDGETS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own budget" ON budgets;
CREATE POLICY "Users can view own budget" 
ON budgets FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budget" ON budgets;
CREATE POLICY "Users can insert own budget" 
ON budgets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budget" ON budgets;
CREATE POLICY "Users can update own budget" 
ON budgets FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: DELETE not needed as budgets are typically not deleted, just updated

-- =============================================
-- MAHR POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own mahr" ON mahr;
CREATE POLICY "Users can view own mahr" 
ON mahr FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mahr" ON mahr;
CREATE POLICY "Users can insert own mahr" 
ON mahr FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mahr" ON mahr;
CREATE POLICY "Users can update own mahr" 
ON mahr FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- WEDDING BUDGET POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own wedding budget" ON wedding_budget;
CREATE POLICY "Users can view own wedding budget" 
ON wedding_budget FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wedding budget" ON wedding_budget;
CREATE POLICY "Users can insert own wedding budget" 
ON wedding_budget FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wedding budget" ON wedding_budget;
CREATE POLICY "Users can update own wedding budget" 
ON wedding_budget FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SAVINGS GOALS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own savings goals" ON savings_goals;
CREATE POLICY "Users can view own savings goals" 
ON savings_goals FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings goals" ON savings_goals;
CREATE POLICY "Users can insert own savings goals" 
ON savings_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own savings goals" ON savings_goals;
CREATE POLICY "Users can update own savings goals" 
ON savings_goals FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- MODULES POLICIES (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view modules" ON modules;
CREATE POLICY "Anyone can view modules" 
ON modules FOR SELECT 
USING (true);

-- Only service role can modify modules

-- =============================================
-- MODULE NOTES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own module notes" ON module_notes;
CREATE POLICY "Users can view own module notes" 
ON module_notes FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own module notes" ON module_notes;
CREATE POLICY "Users can insert own module notes" 
ON module_notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own module notes" ON module_notes;
CREATE POLICY "Users can update own module notes" 
ON module_notes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: DELETE not typically needed for module notes

-- =============================================
-- DISCUSSION PROMPTS POLICIES (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view discussion prompts" ON discussion_prompts;
CREATE POLICY "Anyone can view discussion prompts" 
ON discussion_prompts FOR SELECT 
USING (true);

-- Only service role can modify prompts

-- =============================================
-- USER DISCUSSION ANSWERS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own discussion answers" ON user_discussion_answers;
CREATE POLICY "Users can view own discussion answers" 
ON user_discussion_answers FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own discussion answers" ON user_discussion_answers;
CREATE POLICY "Users can insert own discussion answers" 
ON user_discussion_answers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own discussion answers" ON user_discussion_answers;
CREATE POLICY "Users can update own discussion answers" 
ON user_discussion_answers FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: DELETE not typically needed for discussion answers

-- =============================================
-- RESOURCES POLICIES (Public Read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
CREATE POLICY "Anyone can view resources" 
ON resources FOR SELECT 
USING (true);

-- Only service role can modify resources

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify policies are set up correctly:

-- View all RLS policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Check which tables have RLS enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

