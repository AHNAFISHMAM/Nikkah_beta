# Environment Variables Setup

## 📋 Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
# Your Supabase project URL
# Find it in: Supabase Dashboard → Project Settings → API → Project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key
# Find it in: Supabase Dashboard → Project Settings → API → Project API keys → anon public
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Site URL for SEO and social sharing
VITE_SITE_URL=http://localhost:5173
```

## 🔍 Where to Find Your Supabase Credentials

### 1. Supabase Project URL
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to: **Settings** → **API**
4. Copy the **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)

### 2. Supabase Anon Key
1. In the same **Settings** → **API** page
2. Under **Project API keys**
3. Copy the **`anon` `public`** key (not the `service_role` key!)

## ⚠️ Important Notes

- ✅ **DO** commit `.env.example` (template file)
- ❌ **DON'T** commit `.env.local` (your actual secrets)
- ✅ `.env.local` is already in `.gitignore`
- ✅ Use `.env.local` for local development
- ✅ Use GitHub Secrets for CI/CD (see `.github/SETUP_SECRETS.md`)

## 🧪 Verify Setup

After creating `.env.local`, verify it works:

```bash
# Start the dev server
npm run dev

# The app should connect to Supabase without errors
```

## 🔐 For GitHub Actions

For CI/CD, add these as GitHub Secrets (not in `.env.local`):
- Go to: https://github.com/AHNAFISHMAM/Nikkah_beta/settings/secrets/actions
- Add: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

See `.github/SETUP_SECRETS.md` for detailed instructions.

