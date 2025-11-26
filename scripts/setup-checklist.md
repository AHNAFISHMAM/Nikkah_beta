# ✅ Setup Checklist

Use this checklist to ensure everything is properly configured.

## 🔐 GitHub Secrets (Required for CI/CD)

- [ ] Go to: https://github.com/AHNAFISHMAM/Nikkah_beta/settings/secrets/actions
- [ ] Add `VITE_SUPABASE_URL`
- [ ] Add `VITE_SUPABASE_ANON_KEY`
- [ ] Verify secrets are added (should see 2 secrets)

## 🛡️ Branch Protection

- [ ] Go to: https://github.com/AHNAFISHMAM/Nikkah_beta/settings/branches
- [ ] Add rule for `main` branch
- [ ] Enable "Require pull request before merging"
- [ ] Enable "Require status checks to pass"
- [ ] Enable "Require approvals" (1 or more)
- [ ] Save the rule

## 📝 Repository Information

- [ ] Go to: https://github.com/AHNAFISHMAM/Nikkah_beta
- [ ] Click ⚙️ next to "About"
- [ ] Add description: "Islamic Marriage Preparation Platform - Built with React, Vite, TypeScript, and Supabase"
- [ ] Add topics: `react`, `vite`, `typescript`, `supabase`, `islamic`, `marriage-preparation`

## 🔧 Local Environment

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in `VITE_SUPABASE_URL`
- [ ] Fill in `VITE_SUPABASE_ANON_KEY`
- [ ] Verify: `npm run verify`

## ✅ Verification

- [ ] Run: `npm run verify` (should pass all checks)
- [ ] Run: `npm run github:status` (check sync status)
- [ ] Push a test commit to verify GitHub Actions work
- [ ] Check: https://github.com/AHNAFISHMAM/Nikkah_beta/actions

## 🚀 Optional Enhancements

- [ ] Add LICENSE file
- [ ] Enable GitHub Discussions
- [ ] Set up GitHub Pages (if needed)
- [ ] Configure Dependabot
- [ ] Add repository badges to README

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

