# RLS Troubleshooting Guide

If you're still getting the RLS error after running `supabase-fix-rls.sql`, follow these steps:

## Step 1: Verify Trigger is Installed

Run this in Supabase SQL Editor:

```sql
-- Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
```

**Expected Result**: Should return one row with the trigger details.

## Step 2: Verify Function Exists

```sql
-- Check if function exists and has SECURITY DEFINER
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proowner::regrole as owner
FROM pg_proc
WHERE proname = 'handle_new_user';
```

**Expected Result**: 
- `is_security_definer` should be `true`
- `owner` should be `postgres` or a superuser

## Step 3: Test the Function Manually

```sql
-- Test if function can insert (this should work)
SELECT public.handle_new_user() FROM (
  SELECT 
    gen_random_uuid() as id,
    'test@example.com' as email,
    '{}'::jsonb as raw_user_meta_data
) AS test_user;
```

## Step 4: Check RLS Policies

```sql
-- View all policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**Expected**: Should see SELECT, UPDATE, and INSERT policies.

## Step 5: Alternative Fix - Temporarily Allow Service Role

If the trigger still doesn't work, you can temporarily allow service_role to insert:

```sql
-- Allow service_role to insert profiles (for trigger function)
CREATE POLICY IF NOT EXISTS "Service role can insert profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);
```

**Note**: This is less secure but will work. The SECURITY DEFINER approach is preferred.

## Step 6: Manual Profile Creation (Last Resort)

If nothing works, you can manually create profiles in the signup action:

Update `app/actions/auth.ts` to create profile after signup:

```typescript
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('first_name') as string,
      },
    },
  }

  const { error, data: authData } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  // If trigger didn't work, manually create profile
  if (authData?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: formData.get('first_name') as string || '',
      })
      .select()
      .single()

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('Profile creation error:', profileError)
      // Don't fail signup if profile creation fails
    }
  }

  revalidatePath('/', 'layout')
  redirect('/profile-setup')
}
```

## Common Issues

### Issue: "permission denied for table profiles"
**Solution**: The function owner needs proper permissions. Run:
```sql
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
```

### Issue: Trigger not firing
**Solution**: Check if trigger is enabled:
```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- tgenabled should be 'O' (enabled)
```

### Issue: Function exists but RLS still blocks
**Solution**: Ensure function has SECURITY DEFINER:
```sql
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
```

## Quick Fix Script

Run this complete fix script:

```sql
-- Complete RLS Fix Script
BEGIN;

-- Drop and recreate function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Set owner to postgres
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Verify
SELECT 'Trigger installed successfully!' as status;
```

---

**If you're still having issues**, the manual profile creation in the signup action (Step 6) will definitely work as a fallback.


