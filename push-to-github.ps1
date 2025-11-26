# PowerShell script to push to GitHub
# Run this script: .\push-to-github.ps1

Write-Host "🚀 GitHub Push Setup Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $remove = Read-Host "Do you want to remove it and add a new one? (y/n)"
    if ($remove -eq "y" -or $remove -eq "Y") {
        git remote remove origin
        Write-Host "✅ Removed existing remote" -ForegroundColor Green
    } else {
        Write-Host "❌ Exiting. Please configure remote manually." -ForegroundColor Red
        exit
    }
}

# Get GitHub username
Write-Host ""
Write-Host "📝 Enter your GitHub username:" -ForegroundColor Yellow
$username = Read-Host "Username"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username cannot be empty!" -ForegroundColor Red
    exit
}

# Repository name
$repoName = "Nikkah_beta"
$repoUrl = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "🔗 Repository URL will be: $repoUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Make sure you've created the repository on GitHub first!" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/new" -ForegroundColor Yellow
Write-Host "   Name: $repoName" -ForegroundColor Yellow
Write-Host "   DO NOT initialize with README, .gitignore, or license" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Have you created the repository? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "❌ Please create the repository first, then run this script again." -ForegroundColor Red
    exit
}

# Add remote
Write-Host ""
Write-Host "📡 Adding remote origin..." -ForegroundColor Cyan
git remote add origin $repoUrl

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add remote. It might already exist." -ForegroundColor Red
    exit
}

Write-Host "✅ Remote added successfully" -ForegroundColor Green

# Verify remote
Write-Host ""
Write-Host "🔍 Verifying remote..." -ForegroundColor Cyan
git remote -v

# Ensure on main branch
Write-Host ""
Write-Host "🌿 Ensuring we're on main branch..." -ForegroundColor Cyan
git branch -M main

# Push
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "   (You may be prompted for credentials)" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCESS! Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "   View it at: https://github.com/$username/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Set up branch protection rules" -ForegroundColor White
    Write-Host "   2. Add GitHub Actions secrets (if deploying)" -ForegroundColor White
    Write-Host "   3. Add repository topics and description" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host "   - Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "   - Authentication failed (use Personal Access Token)" -ForegroundColor White
    Write-Host "   - Network connection issue" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tip: If authentication fails, use a Personal Access Token:" -ForegroundColor Yellow
    Write-Host "   Settings → Developer settings → Personal access tokens" -ForegroundColor White
}

