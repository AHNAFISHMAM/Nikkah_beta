# Branch Protection Setup Guide

## 🛡️ Protect Your Main Branch

Branch protection rules help maintain code quality and prevent accidental changes to your main branch.

## Step-by-Step Setup

### 1. Navigate to Branch Protection
1. Go to: https://github.com/AHNAFISHMAM/Nikkah_beta/settings/branches
2. Under **"Branch protection rules"**, click **"Add rule"**

### 2. Configure Branch Name Pattern
- **Branch name pattern**: `main`
- This will protect your main branch

### 3. Recommended Settings

#### ✅ Required Settings (Recommended)
- [x] **Require a pull request before merging**
  - [x] Require approvals: `1` (or more)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (if you have a CODEOWNERS file)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Select status checks:
    - `test (18.x)` - Tests on Node 18
    - `test (20.x)` - Tests on Node 20
    - `build` - Build verification

- [x] **Require conversation resolution before merging**
  - All comments and review suggestions must be addressed

- [x] **Do not allow bypassing the above settings**
  - Even admins must follow these rules

#### ⚪ Optional Settings
- [ ] **Require linear history** - Prevents merge commits
- [ ] **Require signed commits** - Requires GPG signed commits
- [ ] **Require deployments to succeed before merging** - If using deployments
- [ ] **Lock branch** - Prevents all changes (use sparingly)

### 4. Save the Rule
- Click **"Create"** or **"Save changes"**

## 🔄 Workflow After Protection

### Making Changes
1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub:
   - Go to: https://github.com/AHNAFISHMAM/Nikkah_beta/pulls
   - Click **"New Pull Request"**
   - Select your feature branch → main
   - Add description and reviewers
   - Wait for CI checks to pass
   - Get approval
   - Merge the PR

### Direct Pushes (If Needed)
If you need to push directly to main (not recommended):
- You'll need to temporarily disable branch protection
- Or use the bypass option (if enabled)

## 📋 Best Practices

1. **Always use Pull Requests** for code changes
2. **Review your own code** before requesting reviews
3. **Write clear PR descriptions** explaining what changed
4. **Keep PRs small** - easier to review and merge
5. **Fix CI failures** before requesting review

## 🎯 Alternative: Simpler Protection

If you want lighter protection:
- [x] Require pull request before merging
- [x] Require status checks to pass
- [ ] Allow force pushes (not recommended)
- [ ] Allow deletions (not recommended)

## ✅ Verification

After setting up:
1. Try to push directly to main (should be blocked)
2. Create a test branch and PR
3. Verify that status checks run
4. Verify that approval is required

---

**Note**: These settings help maintain code quality and prevent accidental breaking changes!

