# 🔧 Server Fix Guide

## Quick Fix (Choose Your OS)

### Windows (PowerShell)
```powershell
.\fix-server.ps1
```

### Mac/Linux (Bash)
```bash
chmod +x fix-server.sh
./fix-server.sh
```

### Manual Fix (All Platforms)

#### Step 1: Stop the Server
Press `Ctrl+C` in the terminal where the server is running.

#### Step 2: Clear Cache
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next

# Mac/Linux
rm -rf .next
```

#### Step 3: Check Environment Variables
Make sure `.env.local` exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Step 4: Reinstall Dependencies (if needed)
```bash
# Only if you're having module issues
rm -rf node_modules
npm install
```

#### Step 5: Restart Server
```bash
npm run dev
```

## Common Issues & Fixes

### Issue 1: Port 3000 Already in Use

**Fix:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 4000
```

### Issue 2: Missing Environment Variables

**Error:** `Missing Supabase environment variables!`

**Fix:**
1. Create `.env.local` in project root
2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart server

### Issue 3: Module Not Found Errors

**Fix:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Issue 4: TypeScript Errors

**Fix:**
```bash
# Check for type errors
npm run type-check

# If errors, they may not prevent server from starting
# But fix them for production builds
```

### Issue 5: React Version Mismatch

**Error:** `Failed to read a RSC payload`

**Fix:**
```bash
# Clear cache
rm -rf .next
npm run dev
```

### Issue 6: Webpack Cache Warning

**Warning:** `Serializing big strings impacts performance`

**Status:** This is just a performance suggestion, not an error. You can ignore it.

## Verification Checklist

After fixing, verify:

- [ ] Server starts without errors
- [ ] No port conflicts
- [ ] `.env.local` exists with correct values
- [ ] Can access `http://localhost:3000`
- [ ] No module not found errors
- [ ] TypeScript compiles (warnings OK, errors need fixing)

## Still Having Issues?

1. **Check the terminal output** - Look for specific error messages
2. **Check browser console** - Look for client-side errors
3. **Verify Supabase connection** - Check your credentials
4. **Check Next.js version** - Should be 15.5.6
5. **Check Node.js version** - Should be 18+

## Getting Help

If issues persist:
1. Share the exact error message
2. Share your `package.json` dependencies
3. Share your `.env.local` structure (without actual keys)
4. Share the terminal output

## Prevention

To avoid issues:
- ✅ Always stop server with `Ctrl+C` before restarting
- ✅ Clear `.next` cache when making config changes
- ✅ Keep dependencies updated
- ✅ Use `.env.local` for environment variables
- ✅ Don't commit `.env.local` to git

