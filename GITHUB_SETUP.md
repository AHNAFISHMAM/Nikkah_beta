# GitHub Setup Guide

## ✅ Initial Setup Complete

Your repository has been initialized with:
- ✅ Git repository initialized
- ✅ Initial commit created (130 files)
- ✅ GitHub Actions workflows configured
- ✅ Updated README with correct Vite/React info

## 🔗 Connect to GitHub

### Option 1: Create New Repository on GitHub

1. **Go to GitHub** and create a new repository:
   - Visit: https://github.com/new
   - Repository name: `Nikkah_beta`
   - Description: "Islamic Marriage Preparation Platform"
   - Choose **Private** or **Public**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

2. **Connect your local repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Nikkah_beta.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Use GitHub CLI (if installed)

```bash
gh repo create Nikkah_beta --private --source=. --remote=origin --push
```

## 🔐 Configure Git User (Optional)

Update your git user info for this repository:

```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

Or set globally:
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

## 🚀 GitHub Actions Setup

The CI/CD workflows are ready. To enable them:

1. **Add Secrets** (if deploying):
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Add these secrets:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
     - `VERCEL_TOKEN` (optional) - For Vercel deployment
     - `VERCEL_ORG_ID` (optional) - For Vercel deployment
     - `VERCEL_PROJECT_ID` (optional) - For Vercel deployment

2. **Workflows included**:
   - **CI** (`ci.yml`): Runs tests and builds on every push/PR
   - **Deploy** (`deploy.yml`): Deploys to Vercel on main branch pushes

## 📝 Next Steps

1. Push your code to GitHub (see commands above)
2. Set up branch protection (optional):
   - Go to: `Settings` → `Branches`
   - Add rule for `main` branch
   - Require pull request reviews
   - Require status checks to pass

3. Enable GitHub Pages (if needed):
   - Go to: `Settings` → `Pages`
   - Source: `GitHub Actions`
   - The workflow will handle deployment

## 🔄 Daily Workflow

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
```

## 📦 Branch Strategy (Recommended)

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add feature"

# Push and create PR
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub to merge into `main`.

---

**Note**: Make sure your `.env` file is in `.gitignore` (it already is) and never commit sensitive keys!

