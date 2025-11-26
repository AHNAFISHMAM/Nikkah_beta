-- =============================================
-- PARTNER DATA SHARING - RLS POLICIES
-- =============================================
-- Run this AFTER creating couples table
-- Enables partners to see each other's data for real-time collaboration

-- =============================================
-- USER CHECKLIST STATUS - Partner Access
-- =============================================

-- Drop existing SELECT policy if needed
DROP POLICY IF EXISTS "Users can view partner checklist" ON user_checklist_status;

-- Allow users to see partner's checklist
CREATE POLICY "Users can view partner checklist"
  ON user_checklist_status FOR SELECT
  USING (
    auth.uid() = user_id  -- Own data
    OR EXISTS (  -- OR partner's data
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- =============================================
-- USER DISCUSSION ANSWERS - Partner Access
-- =============================================

DROP POLICY IF EXISTS "Users can view partner discussion answers" ON user_discussion_answers;

CREATE POLICY "Users can view partner discussion answers"
  ON user_discussion_answers FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- =============================================
-- MODULE NOTES - Partner Access
-- =============================================

DROP POLICY IF EXISTS "Users can view partner module notes" ON module_notes;

CREATE POLICY "Users can view partner module notes"
  ON module_notes FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- =============================================
-- BUDGETS - Partner Access
-- =============================================

DROP POLICY IF EXISTS "Users can view partner budget" ON budgets;
DROP POLICY IF EXISTS "Users can update partner budget" ON budgets;

-- Read access
CREATE POLICY "Users can view partner budget"
  ON budgets FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- Write access (partners can edit shared budget)
CREATE POLICY "Users can update partner budget"
  ON budgets FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- =============================================
-- WEDDING BUDGET - Partner Access
-- =============================================

DROP POLICY IF EXISTS "Users can view partner wedding budget" ON wedding_budget;
DROP POLICY IF EXISTS "Users can update partner wedding budget" ON wedding_budget;

CREATE POLICY "Users can view partner wedding budget"
  ON wedding_budget FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

CREATE POLICY "Users can update partner wedding budget"
  ON wedding_budget FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- =============================================
-- SAVINGS GOALS - Partner Access
-- =============================================

DROP POLICY IF EXISTS "Users can view partner savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update partner savings goals" ON savings_goals;

CREATE POLICY "Users can view partner savings goals"
  ON savings_goals FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

CREATE POLICY "Users can update partner savings goals"
  ON savings_goals FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- =============================================
-- MAHR - Partner Access
-- =============================================

DROP POLICY IF EXISTS "Users can view partner mahr" ON mahr;
DROP POLICY IF EXISTS "Users can update partner mahr" ON mahr;

CREATE POLICY "Users can view partner mahr"
  ON mahr FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

CREATE POLICY "Users can update partner mahr"
  ON mahr FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = user_id)
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )
  );

-- =============================================
-- PROFILES - Partner Access (Read Only)
-- =============================================

DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;

CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id  -- Own profile
    OR EXISTS (  -- OR partner's profile
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() AND user2_id = id)
         OR (user2_id = auth.uid() AND user1_id = id)
    )
  );

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify policies are created:
/*
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_checklist_status', 'user_discussion_answers',
                    'module_notes', 'budgets', 'wedding_budget',
                    'savings_goals', 'mahr', 'profiles')
ORDER BY tablename, policyname;
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Partner data sharing RLS policies created!';
  RAISE NOTICE 'Partners can now see and edit each others data.';
  RAISE NOTICE 'Next: Enable Supabase Realtime for tables.';
END $$;
