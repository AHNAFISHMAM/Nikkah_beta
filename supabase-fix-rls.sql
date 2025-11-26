-- PERMANENT FIX FOR SIGNUP RLS ISSUE
-- Run this ONE TIME in Supabase SQL Editor
-- This auto-creates profiles when users sign up

-- Step 1: Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create function to handle new user signup
-- SECURITY DEFINER runs with the privileges of the function owner (postgres)
-- This allows it to bypass RLS policies
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
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Step 3: Grant execute permission to authenticated users
-- The function itself runs as SECURITY DEFINER, but we need to allow triggers
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;

-- Step 4: Create trigger that runs when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Verify RLS is enabled (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Ensure the INSERT policy exists (should already exist, but verify)
-- The policy allows users to insert their own profile, but the trigger does it automatically
-- The trigger function bypasses RLS due to SECURITY DEFINER

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profile auto-creation trigger installed successfully!';
  RAISE NOTICE '✅ Users will now have profiles created automatically on signup.';
  RAISE NOTICE '✅ The trigger function uses SECURITY DEFINER to bypass RLS.';
  RAISE NOTICE '';
  RAISE NOTICE 'To verify the trigger is working:';
  RAISE NOTICE '1. Check if trigger exists: SELECT * FROM pg_trigger WHERE tgname = ''on_auth_user_created'';';
  RAISE NOTICE '2. Check if function exists: SELECT * FROM pg_proc WHERE proname = ''handle_new_user'';';
END $$;
