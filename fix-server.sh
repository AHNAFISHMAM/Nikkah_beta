#!/bin/bash
# Bash script to fix Next.js server issues
# Run this: chmod +x fix-server.sh && ./fix-server.sh

echo "🔧 Fixing Next.js Server Issues..."
echo ""

# Step 1: Kill any process on port 3000
echo "1. Checking for processes on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   Found process on port 3000. Stopping..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Step 2: Clear Next.js cache
echo "2. Clearing Next.js cache (.next folder)..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "   ✅ Cache cleared"
else
    echo "   ℹ️  No cache to clear"
fi

# Step 3: Clear node_modules and reinstall (optional - uncomment if needed)
# echo "3. Reinstalling dependencies..."
# rm -rf node_modules
# rm -f package-lock.json
# npm install

# Step 4: Check for .env.local
echo "3. Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local found"
else
    echo "   ⚠️  .env.local not found!"
    echo "   Please create .env.local with your Supabase credentials"
fi

# Step 5: Type check
echo "4. Running type check..."
npm run type-check
if [ $? -eq 0 ]; then
    echo "   ✅ Type check passed"
else
    echo "   ⚠️  Type errors found (may not prevent server from starting)"
fi

echo ""
echo "✅ Fix complete! Starting dev server..."
echo ""
echo "Starting: npm run dev"
echo ""

# Start the dev server
npm run dev

