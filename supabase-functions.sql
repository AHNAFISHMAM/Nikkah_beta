-- =============================================
-- DATABASE FUNCTIONS & TRIGGERS
-- =============================================
-- Run this after supabase-schema.sql
-- Contains helper functions and triggers for data integrity

-- =============================================
-- UPDATE TIMESTAMP FUNCTION
-- =============================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply triggers to all tables with updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_checklist_status_updated_at ON user_checklist_status;
CREATE TRIGGER update_user_checklist_status_updated_at 
BEFORE UPDATE ON user_checklist_status 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at 
BEFORE UPDATE ON budgets 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mahr_updated_at ON mahr;
CREATE TRIGGER update_mahr_updated_at 
BEFORE UPDATE ON mahr 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wedding_budget_updated_at ON wedding_budget;
CREATE TRIGGER update_wedding_budget_updated_at 
BEFORE UPDATE ON wedding_budget 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON savings_goals;
CREATE TRIGGER update_savings_goals_updated_at 
BEFORE UPDATE ON savings_goals 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_module_notes_updated_at ON module_notes;
CREATE TRIGGER update_module_notes_updated_at 
BEFORE UPDATE ON module_notes 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_discussion_answers_updated_at ON user_discussion_answers;
CREATE TRIGGER update_user_discussion_answers_updated_at 
BEFORE UPDATE ON user_discussion_answers 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROFILE AUTO-CREATION FUNCTION
-- =============================================
-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-create profile with first_name from metadata or empty string
  -- SECURITY DEFINER allows this to bypass RLS
  INSERT INTO public.profiles (id, first_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- VALIDATION FUNCTIONS
-- =============================================

-- Function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Function to validate partner email matches another user
CREATE OR REPLACE FUNCTION validate_partner_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If partner_email is set, validate it exists in profiles
  IF NEW.partner_email IS NOT NULL AND NEW.partner_email != '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id IN (SELECT id FROM auth.users WHERE email = NEW.partner_email)
    ) THEN
      RAISE WARNING 'Partner email % does not exist in system', NEW.partner_email;
      -- Note: We allow this but warn, as partner might sign up later
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply partner email validation trigger
DROP TRIGGER IF EXISTS validate_partner_email_trigger ON profiles;
CREATE TRIGGER validate_partner_email_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_partner_email();

-- =============================================
-- HELPER FUNCTIONS FOR COMMON QUERIES
-- =============================================

-- Function to get user's checklist completion percentage
CREATE OR REPLACE FUNCTION get_user_checklist_completion(user_uuid UUID)
RETURNS TABLE(
  total_items BIGINT,
  completed_items BIGINT,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH total AS (
    SELECT COUNT(*)::BIGINT as count
    FROM checklist_items
    WHERE is_custom = false OR created_by = user_uuid
  ),
  completed AS (
    SELECT COUNT(*)::BIGINT as count
    FROM user_checklist_status ucs
    JOIN checklist_items ci ON ci.id = ucs.checklist_item_id
    WHERE ucs.user_id = user_uuid 
      AND ucs.is_completed = true
      AND (ci.is_custom = false OR ci.created_by = user_uuid)
  )
  SELECT 
    t.count as total_items,
    COALESCE(c.count, 0) as completed_items,
    CASE 
      WHEN t.count > 0 THEN ROUND((COALESCE(c.count, 0)::NUMERIC / t.count::NUMERIC) * 100, 2)
      ELSE 0
    END as completion_percentage
  FROM total t
  CROSS JOIN completed c;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_checklist_completion(UUID) TO authenticated;

-- Function to get user's module completion percentage
CREATE OR REPLACE FUNCTION get_user_module_completion(user_uuid UUID)
RETURNS TABLE(
  total_modules BIGINT,
  completed_modules BIGINT,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH total AS (
    SELECT COUNT(*)::BIGINT as count
    FROM modules
  ),
  completed AS (
    SELECT COUNT(*)::BIGINT as count
    FROM module_notes
    WHERE user_id = user_uuid AND is_completed = true
  )
  SELECT 
    t.count as total_modules,
    COALESCE(c.count, 0) as completed_modules,
    CASE 
      WHEN t.count > 0 THEN ROUND((COALESCE(c.count, 0)::NUMERIC / t.count::NUMERIC) * 100, 2)
      ELSE 0
    END as completion_percentage
  FROM total t
  CROSS JOIN completed c;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_module_completion(UUID) TO authenticated;

-- Function to get user's discussion completion percentage
CREATE OR REPLACE FUNCTION get_user_discussion_completion(user_uuid UUID)
RETURNS TABLE(
  total_prompts BIGINT,
  discussed_prompts BIGINT,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH total AS (
    SELECT COUNT(*)::BIGINT as count
    FROM discussion_prompts
  ),
  discussed AS (
    SELECT COUNT(*)::BIGINT as count
    FROM user_discussion_answers
    WHERE user_id = user_uuid AND is_discussed = true
  )
  SELECT 
    t.count as total_prompts,
    COALESCE(d.count, 0) as discussed_prompts,
    CASE 
      WHEN t.count > 0 THEN ROUND((COALESCE(d.count, 0)::NUMERIC / t.count::NUMERIC) * 100, 2)
      ELSE 0
    END as completion_percentage
  FROM total t
  CROSS JOIN discussed d;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_discussion_completion(UUID) TO authenticated;

-- =============================================
-- DATA INTEGRITY FUNCTIONS
-- =============================================

-- Function to ensure completed_at is set when is_completed becomes true
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- For checklist status
  IF TG_TABLE_NAME = 'user_checklist_status' THEN
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
      NEW.completed_at = NOW();
    ELSIF NEW.is_completed = false THEN
      NEW.completed_at = NULL;
    END IF;
  END IF;
  
  -- For module notes
  IF TG_TABLE_NAME = 'module_notes' THEN
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
      NEW.completed_at = NOW();
    ELSIF NEW.is_completed = false THEN
      NEW.completed_at = NULL;
    END IF;
  END IF;
  
  -- For discussion answers
  IF TG_TABLE_NAME = 'user_discussion_answers' THEN
    IF NEW.is_discussed = true AND OLD.is_discussed = false THEN
      NEW.discussed_at = NOW();
    ELSIF NEW.is_discussed = false THEN
      NEW.discussed_at = NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply completed_at triggers
DROP TRIGGER IF EXISTS set_checklist_completed_at ON user_checklist_status;
CREATE TRIGGER set_checklist_completed_at
  BEFORE UPDATE ON user_checklist_status
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

DROP TRIGGER IF EXISTS set_module_completed_at ON module_notes;
CREATE TRIGGER set_module_completed_at
  BEFORE UPDATE ON module_notes
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

DROP TRIGGER IF EXISTS set_discussion_discussed_at ON user_discussion_answers;
CREATE TRIGGER set_discussion_discussed_at
  BEFORE UPDATE ON user_discussion_answers
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- =============================================
-- VERIFICATION
-- =============================================
-- View all functions:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- ORDER BY routine_name;

-- View all triggers:
-- SELECT trigger_name, event_object_table, action_statement 
-- FROM information_schema.triggers 
-- WHERE trigger_schema = 'public' 
-- ORDER BY event_object_table, trigger_name;

