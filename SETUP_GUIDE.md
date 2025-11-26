# NikahPrep Setup Guide

Complete step-by-step guide to set up and deploy NikahPrep.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `nikahprep` (or your choice)
   - Database Password: (generate a strong password and save it)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

## Step 2: Set Up Database

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the `supabase-schema.sql` file from this project
4. Copy ALL the SQL content (it's a large file with 1000+ lines)
5. Paste it into the SQL Editor
6. Click "Run" button (or press Ctrl/Cmd + Enter)
7. Wait for execution to complete
8. You should see "Success. No rows returned"

### What This Creates:
- 13 database tables with proper relationships
- Row Level Security policies for data protection
- 31 checklist items across 5 categories
- 5 complete learning modules with Islamic content
- 16 discussion prompts
- 20+ curated Islamic resources

## Step 3: Get Supabase Credentials

1. In Supabase dashboard, click "Project Settings" (gear icon) in bottom left
2. Click "API" in the settings menu
3. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
4. Keep this page open, you'll need these values next

## Step 4: Configure Environment Variables

1. In your project folder, create a file called `.env.local`
2. Add these two lines (replace with your actual values from Step 3):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

**IMPORTANT**: Never commit `.env.local` to git - it's already in `.gitignore`

## Step 5: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (Next.js, Supabase, Tailwind, etc.)

## Step 6: Run Development Server

```bash
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Get Started" or "Sign Up"
3. Create a new account with your email and password
4. Complete the profile setup form
5. You should be redirected to the dashboard

### Test Each Feature:
- ✅ Dashboard - Check if widgets load
- ✅ Readiness Checklist - Mark items complete, add notes
- ✅ Financial Planning - Enter budget data
- ✅ Learning Modules - Read a module, mark complete
- ✅ Discussion Prompts - Answer a prompt
- ✅ Resources - View curated links

## Step 8: Production Build (Optional)

If you want to run a production build locally:

```bash
npm run build
npm start
```

The optimized production build will run on [http://localhost:3000](http://localhost:3000)

## Step 9: Deployment Options (Optional)

If you want to deploy NikahPrep to a server, you have several options:

### Option 1: Self-Hosted VPS (DigitalOcean, AWS EC2, Linode, etc.)

1. Set up a server with Node.js 18+
2. Clone your repository to the server
3. Install dependencies: `npm install`
4. Create `.env.local` with your Supabase credentials
5. Build the application: `npm run build`
6. Run with PM2 or similar:
   ```bash
   npm install -g pm2
   pm2 start npm --name "nikahprep" -- start
   pm2 save
   ```
7. Set up nginx as reverse proxy (optional)

### Option 2: Docker Container

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t nikahprep .
docker run -p 3000:3000 --env-file .env.local nikahprep
```

### Option 3: Cloud Platforms

Deploy to platforms that support Node.js:
- **Railway**: Connect GitHub repo, add env vars, deploy
- **Render**: Web service, add build command `npm run build`
- **Heroku**: Add Procfile: `web: npm start`
- **DigitalOcean App Platform**: Connect repo and configure

For any platform:
1. Ensure environment variables are set
2. Build command: `npm run build`
3. Start command: `npm start`

## Step 10: Post-Setup Verification

1. Open your app (locally or deployed)
2. Sign up with a test account
3. Complete profile setup
4. Test each feature:
   - Dashboard widgets load correctly
   - Checklist items can be marked complete
   - Financial tools accept and save data
   - Modules display content
   - Discussion prompts can be answered
   - Resources library displays links
5. Verify data persists in Supabase

## Troubleshooting

### Build Errors

If you get errors during `npm run build`:

1. Check that all dependencies are installed:
   ```bash
   npm install
   ```

2. Make sure environment variables are set in `.env.local`

3. Try deleting `.next` folder and rebuilding:
   ```bash
   rm -rf .next
   npm run build
   ```

### Supabase Connection Errors

If you see "Invalid API key" or connection errors:

1. Verify your `.env.local` has correct values
2. Make sure there are no extra spaces or quotes
3. Restart the dev server after changing `.env.local`

### Database Errors

If you see "relation does not exist" errors:

1. Make sure you ran the ENTIRE `supabase-schema.sql` file
2. Check the SQL Editor for error messages
3. Try running the schema again (it's safe to run multiple times)

### Authentication Not Working

1. Check Supabase dashboard → Authentication → Settings
2. Ensure "Enable Email Signup" is ON
3. Check "Site URL" is set to your deployment URL
4. For local dev, add `http://localhost:3000` to "Redirect URLs"

### Row Level Security Errors

If you can't see your data:

1. The schema includes RLS policies - they should work automatically
2. Make sure you're logged in with the same account
3. Check Supabase dashboard → Table Editor to verify data exists

## Database Backup

To backup your Supabase database:

1. Go to Supabase dashboard → Database → Backups
2. Click "Create backup"
3. Backups are created daily automatically on paid plans

## Updating the Application

To add new features or update existing ones:

1. Make your code changes
2. Test locally with `npm run dev`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel will automatically deploy your changes

## Custom Domain (Optional)

To add your own domain:

1. Go to Vercel dashboard → your project → Settings → Domains
2. Enter your domain name
3. Follow the DNS configuration instructions
4. Update Supabase "Site URL" and "Redirect URLs" to your new domain

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel Docs**: https://vercel.com/docs

## Success Checklist

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] App running locally at localhost:3000
- [ ] Can sign up and login
- [ ] Dashboard loads with widgets
- [ ] Checklist items can be marked complete
- [ ] Financial tools accept input
- [ ] Modules display content
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production site accessible
- [ ] Authentication works in production
- [ ] Data persists correctly

---

Congratulations! Your NikahPrep application is now live. May it benefit many couples preparing for marriage. Barakallahu Feekum!
