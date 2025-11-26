# Supabase Setup Checklist ✅

**Complete these steps to fix login/signup issues**

---

## ✅ Step 1: Set Up Database Tables

1. Go to https://supabase.com/dashboard
2. Select your project: `yjqkmvmwbbubievalfhh`
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Open `supabase-schema.sql` from your project folder
6. Copy **ALL** content (1425 lines)
7. Paste into SQL Editor
8. Click **RUN** (or press Ctrl+Enter)
9. Wait for "Success. No rows returned"

**Verify it worked:**
- Go to **Table Editor** (left sidebar)
- You should see tables: `profiles`, `checklist_categories`, `modules`, etc.

---

## ✅ Step 2: Configure Email Settings

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click **Email** provider
3. Find "**Confirm email**" setting
4. **Turn it OFF** (for testing - you can enable later)
5. Click **Save**

**Why?** With email confirmation ON, you need to click a link in your email before you can login. Turning it OFF allows immediate access for testing.

---

## ✅ Step 3: Configure URLs

1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/**
   http://localhost:3000/dashboard
   ```
3. Set **Site URL** to:
   ```
   http://localhost:3000
   ```
4. Click **Save**

---

## ✅ Step 4: Verify Environment Variables

1. Check that `.env.local` exists in your project root
2. It should contain:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yjqkmvmwbbubievalfhh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. These values should match what's in Supabase **Settings → API**

---

## ✅ Step 5: Restart Your Dev Server

1. Stop your dev server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

---

## ✅ Step 6: Test Signup

1. Go to http://localhost:3000/signup
2. Fill in:
   - First Name: `Test`
   - Email: `test@example.com`
   - Password: `password123`
3. Click **Create Account**

**What should happen:**
- ✅ SUCCESS: Redirects to `/profile-setup`
- ❌ ERROR: Shows red error message on page

---

## 🔍 If You See an Error Message

Now that error messages are visible, you'll see exactly what's wrong:

### Common Errors:

**"relation 'profiles' does not exist"**
→ Database not set up. Go back to Step 1.

**"User already registered"**
→ Email already used. Try a different email or login instead.

**"Invalid login credentials"**
→ Wrong password. Check your password.

**"Email not confirmed"**
→ Email confirmation is ON. Go to Step 2 to turn it OFF.

---

## ✅ Step 7: Test Login

1. Go to http://localhost:3000/login
2. Use the email/password you signed up with
3. Click **Sign In**

**What should happen:**
- ✅ SUCCESS: Redirects to `/dashboard`
- ❌ ERROR: Shows error message

---

## 🎯 Quick Troubleshooting

### "Nothing happens" (page just reloads)
→ Check browser console (F12 → Console tab) for errors

### Database table errors
→ Make sure you ran the ENTIRE `supabase-schema.sql` file

### Email confirmation issues
→ Check Authentication → Email Confirmations setting

### Still stuck?
1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy any error messages
4. Share them for help

---

## ✅ Success Checklist

Once working, you should be able to:
- [ ] Sign up with new email
- [ ] See profile setup page
- [ ] Complete profile setup
- [ ] Reach dashboard
- [ ] See your checklist
- [ ] Add budget data
- [ ] View modules

---

**After completing all steps, signup/login should work perfectly!**

The error messages are now visible, so you'll know exactly what's wrong if something fails.
