# GitHub Actions Secrets Setup Guide

## 🔐 Required Secrets for CI/CD

Your GitHub Actions workflows need these secrets to build and deploy successfully.

## Step-by-Step Setup

### 1. Navigate to Secrets Settings
1. Go to: https://github.com/AHNAFISHMAM/Nikkah_beta/settings/secrets/actions
2. Click **"New repository secret"**

### 2. Add Required Secrets

#### Secret 1: `VITE_SUPABASE_URL`
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Your Supabase project URL
  - Format: `https://xxxxxxxxxxxxx.supabase.co`
  - Find it in: Supabase Dashboard → Project Settings → API → Project URL
- Click **"Add secret"**

#### Secret 2: `VITE_SUPABASE_ANON_KEY`
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon/public key
  - Find it in: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`
- Click **"Add secret"**

### 3. Optional: Vercel Deployment Secrets

If you want to deploy to Vercel automatically:

#### Secret 3: `VERCEL_TOKEN`
- **Name**: `VERCEL_TOKEN`
- **Value**: Your Vercel access token
  - Get it from: https://vercel.com/account/tokens
  - Create a new token with full access

#### Secret 4: `VERCEL_ORG_ID`
- **Name**: `VERCEL_ORG_ID`
- **Value**: Your Vercel organization ID
  - Find it in: Vercel Dashboard → Settings → General → Team ID

#### Secret 5: `VERCEL_PROJECT_ID`
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: Your Vercel project ID
  - Find it in: Vercel project settings → General → Project ID

## ✅ Verification

After adding secrets:
1. Go to: https://github.com/AHNAFISHMAM/Nikkah_beta/actions
2. Push a commit or manually trigger a workflow
3. Check that the workflow runs successfully

## 🔒 Security Best Practices

- ✅ Never commit secrets to the repository
- ✅ Use GitHub Secrets for all sensitive data
- ✅ Rotate secrets periodically
- ✅ Use different secrets for different environments (dev/staging/prod)

## 📝 Quick Reference

| Secret Name | Required | Purpose |
|------------|----------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase API key |
| `VERCEL_TOKEN` | ⚪ Optional | Vercel deployment |
| `VERCEL_ORG_ID` | ⚪ Optional | Vercel organization |
| `VERCEL_PROJECT_ID` | ⚪ Optional | Vercel project |

---

**Need help?** Check your Supabase dashboard or Vercel settings for these values.

