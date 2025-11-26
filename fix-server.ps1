# PowerShell script to fix Next.js server issues
# Run this in PowerShell: .\fix-server.ps1

Write-Host "🔧 Fixing Next.js Server Issues..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running processes on port 3000
Write-Host "1. Checking for processes on port 3000..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Write-Host "   Found process on port 3000. Stopping..." -ForegroundColor Yellow
    Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Step 2: Clear Next.js cache
Write-Host "2. Clearing Next.js cache (.next folder)..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clear" -ForegroundColor Gray
}

# Step 3: Clear node_modules and reinstall (optional - uncomment if needed)
# Write-Host "3. Reinstalling dependencies..." -ForegroundColor Yellow
# if (Test-Path "node_modules") {
#     Remove-Item -Recurse -Force "node_modules"
# }
# Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
# npm install

# Step 4: Check for .env.local
Write-Host "3. Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env.local not found!" -ForegroundColor Red
    Write-Host "   Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
}

# Step 5: Type check
Write-Host "4. Running type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Type check passed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Type errors found (may not prevent server from starting)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Fix complete! Starting dev server..." -ForegroundColor Green
Write-Host ""
Write-Host "Starting: npm run dev" -ForegroundColor Cyan
Write-Host ""

# Start the dev server
npm run dev

