# Push to GitHub - Step by Step Guide

## ✅ Prerequisites Check
- ✅ Git repository initialized
- ✅ All files committed
- ✅ Working tree clean
- ✅ On `main` branch

## 🚀 Method 1: Manual Setup (Recommended)

### Step 1: Create Repository on GitHub

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `Nikkah_beta`
3. **Description**: `Islamic Marriage Preparation Platform - Built with React, Vite, and Supabase`
4. **Visibility**: Choose **Private** (recommended) or **Public**
5. **⚠️ IMPORTANT**: 
   - ❌ DO NOT check "Add a README file"
   - ❌ DO NOT check "Add .gitignore"
   - ❌ DO NOT check "Choose a license"
   - (We already have these files)
6. Click **"Create repository"**

### Step 2: Copy Your Repository URL

After creating, GitHub will show you a page with setup instructions. Copy the HTTPS URL:
- It will look like: `https://github.com/YOUR_USERNAME/Nikkah_beta.git`

### Step 3: Connect and Push

Run these commands in your terminal (replace `YOUR_USERNAME` with your actual GitHub username):

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/Nikkah_beta.git

# Verify remote was added
git remote -v

# Ensure you're on main branch
git branch -M main

# Push to GitHub (first time)
git push -u origin main
```

### Step 4: Verify

1. Go to: https://github.com/YOUR_USERNAME/Nikkah_beta
2. You should see all your files there!

---

## 🔐 Method 2: Using GitHub CLI (Optional - Faster)

If you install GitHub CLI, you can do it all in one command:

```bash
# Install GitHub CLI first: https://cli.github.com/
gh repo create Nikkah_beta --private --source=. --remote=origin --push
```

---

## 📋 Best Practices Checklist

### ✅ Before Pushing
- [x] All code is committed
- [x] `.env` files are in `.gitignore` (already done)
- [x] `node_modules` is ignored (already done)
- [x] Sensitive data is not committed

### ✅ After Pushing
- [ ] Set up branch protection rules
- [ ] Add repository description and topics
- [ ] Configure GitHub Actions secrets (if deploying)
- [ ] Add collaborators (if needed)

---

## 🔒 Security Best Practices

1. **Never commit**:
   - `.env` files ✅ (already in .gitignore)
   - API keys or secrets
   - Personal credentials

2. **Use GitHub Secrets** for:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Deployment tokens

3. **Enable branch protection**:
   - Go to: Settings → Branches
   - Add rule for `main` branch
   - Require pull request reviews
   - Require status checks

---

## 🎯 Next Steps After Pushing

1. **Set up GitHub Actions Secrets**:
   - Go to: Settings → Secrets and variables → Actions
   - Add: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. **Enable GitHub Pages** (if needed):
   - Settings → Pages → Source: GitHub Actions

3. **Add repository topics**:
   - Click ⚙️ next to "About"
   - Add: `react`, `vite`, `typescript`, `supabase`, `islamic`, `marriage-preparation`

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/Nikkah_beta.git
```

### Error: "Authentication failed"
- Use a Personal Access Token instead of password
- Generate token: Settings → Developer settings → Personal access tokens → Tokens (classic)
- Use token as password when pushing

### Error: "Permission denied"
- Make sure you're logged into GitHub
- Check repository name matches exactly
- Verify you have write access to the repository

---

**Ready to push? Follow Step 1-3 above!** 🚀

