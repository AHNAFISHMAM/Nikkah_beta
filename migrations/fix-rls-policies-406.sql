-- Fix for 406 errors on financial tables
-- Run this in Supabase SQL Editor if 406 errors persist
-- This ensures RLS policies are correctly set up

-- Verify RLS is enabled
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mahr ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Recreate SELECT policies with explicit permissions
DROP POLICY IF EXISTS "Users can view own budget" ON budgets;
CREATE POLICY "Users can view own budget" 
ON budgets FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own mahr" ON mahr;
CREATE POLICY "Users can view own mahr" 
ON mahr FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own wedding budget" ON wedding_budget;
CREATE POLICY "Users can view own wedding budget" 
ON wedding_budget FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own savings goals" ON savings_goals;
CREATE POLICY "Users can view own savings goals" 
ON savings_goals FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Verify policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('budgets', 'mahr', 'wedding_budget', 'savings_goals')
ORDER BY tablename, policyname;

