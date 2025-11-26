# Quick Fix for RLS Error

## Immediate Solution

The signup action now has a **fallback mechanism** that will create the profile manually if the database trigger fails.

**You still need to run the SQL fix**, but if it doesn't work immediately, the app will handle it.

## Steps to Fix

### Option 1: Run the SQL Fix (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `supabase-fix-rls.sql`
3. Click "Run"
4. Verify success message appears
5. Try signing up again

### Option 2: Use the Fallback (Already Implemented)

The code now automatically creates profiles if the trigger fails. **Just restart your dev server**:

```bash
# Stop server (Ctrl+C)
npm run dev
```

The fallback will handle profile creation automatically.

## Verify It's Working

1. Try signing up with a new email
2. Check browser console - should see no RLS errors
3. After signup, you should be redirected to profile-setup
4. Profile should be created automatically

## If Still Not Working

Check `RLS_TROUBLESHOOTING.md` for detailed debugging steps.

---

**The app now has both:**
- ✅ Database trigger (automatic, preferred)
- ✅ Code fallback (manual, backup)

This ensures signup works even if the trigger isn't set up yet.

