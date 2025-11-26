# Enable Supabase Realtime - Step-by-Step Guide

## Overview
This guide shows you how to enable Supabase Realtime replication for your database tables to enable real-time collaboration features in NikahPrep.

---

## Prerequisites

1. ✅ SQL files have been created:
   - `supabase-couples-table.sql`
   - `supabase-partner-rls-policies.sql`

2. ✅ You have access to your Supabase Dashboard

---

## Step 1: Run SQL Migration Files

### 1.1 Create Couples Table
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy entire contents of `supabase-couples-table.sql`
5. Paste and click **Run**
6. Verify success message: "✅ Couples table created successfully!"

### 1.2 Update RLS Policies
1. In SQL Editor, click **New Query**
2. Copy entire contents of `supabase-partner-rls-policies.sql`
3. Paste and click **Run**
4. Verify success message: "✅ Partner data sharing RLS policies created!"

---

## Step 2: Enable Realtime Replication

### Navigate to Database Replication
1. In Supabase Dashboard, go to **Database** (left sidebar)
2. Click on **Replication** tab
3. You'll see a list of all tables

### Enable Realtime for These Tables:

Check the **Realtime** toggle for each of these tables:

#### User Data Tables:
- [ ] `user_checklist_status`
- [ ] `user_discussion_answers`
- [ ] `module_notes`

#### Financial Tables:
- [ ] `budgets`
- [ ] `wedding_budget`
- [ ] `savings_goals`
- [ ] `mahr`

#### Partner Linkage:
- [ ] `couples`

#### Optional (for advanced features):
- [ ] `profiles` (if you want real-time profile updates)

### Visual Guide:
```
Database > Replication
┌─────────────────────────┬──────────┬──────────────┐
│ Table                   │ Source   │ Realtime     │
├─────────────────────────┼──────────┼──────────────┤
│ user_checklist_status   │ ●        │ ✓ ENABLED    │
│ user_discussion_answers │ ●        │ ✓ ENABLED    │
│ module_notes            │ ●        │ ✓ ENABLED    │
│ budgets                 │ ●        │ ✓ ENABLED    │
│ wedding_budget          │ ●        │ ✓ ENABLED    │
│ savings_goals           │ ●        │ ✓ ENABLED    │
│ mahr                    │ ●        │ ✓ ENABLED    │
│ couples                 │ ●        │ ✓ ENABLED    │
└─────────────────────────┴──────────┴──────────────┘
```

---

## Step 3: Configure Realtime Settings (Optional)

### Check Realtime Limits
1. Go to **Project Settings** → **API**
2. Scroll to **Realtime** section
3. Default limits:
   - Max connections: 200
   - Max channels per client: 100
   - Max events per second: 100

These defaults are sufficient for NikahPrep.

### Enable Presence (for online status)
1. In **Project Settings** → **API**
2. Find **Realtime** section
3. Ensure **Presence** is enabled (should be by default)

---

## Step 4: Verify Realtime is Working

### Test in SQL Editor
Run this query to verify replication is enabled:

```sql
SELECT schemaname, tablename,
       bool_or(pubname = 'supabase_realtime') as realtime_enabled
FROM pg_publication_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_checklist_status',
    'user_discussion_answers',
    'module_notes',
    'budgets',
    'wedding_budget',
    'savings_goals',
    'mahr',
    'couples'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;
```

**Expected Output:**
All tables should show `realtime_enabled = true`

---

## Step 5: Test Real-Time Connection (Optional)

### Test in Browser Console
1. Open your app: `npm run dev`
2. Open browser DevTools Console
3. Paste this test code:

```javascript
// Get Supabase client
const supabase = window.__supabaseClient || createClient()

// Test connection
const channel = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_checklist_status'
  }, (payload) => {
    console.log('Real-time update received:', payload)
  })
  .subscribe((status) => {
    console.log('Subscription status:', status)
  })

// Should log: "Subscription status: SUBSCRIBED"
```

If you see "SUBSCRIBED", Realtime is working!

---

## Troubleshooting

### Issue: "Realtime not available"
**Solution:** Ensure you're on a Supabase plan that includes Realtime (Free tier includes it)

### Issue: "Error: no pg_publication found"
**Solution:** Run this SQL:
```sql
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE user_checklist_status;
-- Add other tables...
```

### Issue: "TIMED_OUT" status
**Solution:**
1. Check Project Settings → API → Realtime is enabled
2. Verify RLS policies allow SELECT
3. Check browser console for errors

### Issue: "CHANNEL_ERROR"
**Solution:**
1. Verify table names are correct (case-sensitive)
2. Check that Realtime is enabled for the specific table
3. Ensure you have SELECT permission via RLS

---

## Security Checklist

Before going to production:

- [ ] RLS policies are set up correctly
- [ ] Partners can only see each other's data (not all users)
- [ ] Sensitive tables (like payments) are NOT exposed to Realtime
- [ ] Rate limiting is configured
- [ ] You've tested with two different user accounts

---

## Next Steps

After enabling Realtime:

1. ✅ **Couples table created**
2. ✅ **RLS policies updated**
3. ✅ **Realtime enabled** ← You are here
4. ⏭️ **Implement real-time features in components**
5. ⏭️ **Add debouncing to inputs**
6. ⏭️ **Add presence indicators**
7. ⏭️ **Test with partner accounts**

---

## Quick Reference

### Enable Realtime for a Table:
```
Database → Replication → Toggle "Realtime" for table
```

### Check if Realtime is Enabled:
```sql
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

### Subscribe to Changes (in code):
```typescript
supabase
  .channel('channel-name')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'table_name'
  }, handler)
  .subscribe()
```

---

**Status:** 📋 Manual steps required
**Time Required:** 5-10 minutes
**Difficulty:** Easy

Once complete, real-time features will be ready to use!
