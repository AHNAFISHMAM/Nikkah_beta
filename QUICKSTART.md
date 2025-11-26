# ⚡ Quick Start - Fix Missing Environment Variables

## The Error You're Seeing

```
Error: Your project's URL and Key are required to create a Supabase client!
```

## Quick Fix (2 minutes)

1. **Get your Supabase credentials:**
   - Go to: https://supabase.com/dashboard/project/_/settings/api
   - Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy your **anon/public key** (long string starting with `eyJ...`)

2. **Create `.env.local` file in the project root:**
   ```bash
   # In the project root directory, create a file named: .env.local
   ```

3. **Add these two lines (replace with your actual values):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Save the file and restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

## Example `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

## Important Notes

- ✅ The `.env.local` file is already in `.gitignore` - it won't be committed
- ✅ Never share your Supabase keys publicly
- ✅ You need to restart the dev server after creating/updating `.env.local`
- ✅ Make sure there are no spaces around the `=` sign
- ✅ Don't use quotes around the values

## Still Having Issues?

1. Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
2. Make sure the file is in the project root (same folder as `package.json`)
3. Restart your dev server completely
4. Check for typos in the variable names

## Full Setup Guide

For complete setup instructions including database schema setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

