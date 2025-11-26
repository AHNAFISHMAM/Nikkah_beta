# NikahPrep - Islamic Marriage Preparation Platform

A comprehensive web application for Muslim couples preparing for marriage, built with React, Vite, Supabase, and Tailwind CSS.

## Features

### 1. Marriage Readiness Checklist
- 31 checklist items across 5 categories:
  - Spiritual Preparation (7 items)
  - Financial Preparation (6 items)
  - Family & Social (6 items)
  - Personal Development (6 items)
  - Future Planning (6 items)
- Track completion status
- Add personal notes
- Mark items for discussion with partner
- Per-category and overall progress tracking

### 2. Financial Planning Tools
- **Monthly Budget Calculator**: Track income and expenses with visual pie charts
- **Mahr Tracker**: Manage mahr amount, payment status, and deferred schedule
- **Wedding Budget Planner**: Plan and track wedding expenses across 7 categories
- **Savings Goals Tracker**: Set and monitor emergency fund, house, and other savings goals

### 3. Pre-Marriage Learning Modules
- 5 comprehensive modules with full Islamic content:
  1. Islamic Marriage Foundations
  2. Communication & Conflict Resolution
  3. Intimacy & Family Planning
  4. Financial Harmony
  5. Family & In-Laws
- Mark modules as complete
- Add personal notes and reflections

### 4. Discussion Prompts
- 16+ guided conversation topics
- Categories: Household, Financial, Living, Family Planning, Communication, Career, Education, Social, Parenting, Decision Making, Health, Lifestyle, Spiritual
- Record answers and discussion notes
- Track which topics have been discussed

### 5. Resources Library
- Curated Islamic resources across 6 categories:
  - Books (marriage preparation guides)
  - Scholarly resources (lectures, articles)
  - Counseling services
  - Islamic finance resources
  - Duas and supplications
  - Pre-marriage courses
- Featured resources section

### 6. Comprehensive Dashboard
- Overall readiness score
- Wedding date countdown
- Budget summary
- Learning progress
- Pending tasks overview

## Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui patterns
- **Charts**: Recharts
- **Routing**: React Router v7
- **Deployment**: Vercel, Netlify, or any static host

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd "C:\Users\Lenovo\Downloads\CODE\build fast\Nikkah beta"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new Supabase project at [supabase.com](https://supabase.com)

   b. Copy the SQL from `supabase-schema.sql` and run it in the Supabase SQL Editor
      - This will create all tables, RLS policies, and seed data

   c. Get your Supabase credentials:
      - Go to Project Settings → API
      - Copy the `Project URL`
      - Copy the `anon/public` key

4. **Configure environment variables**

   Create a `.env` or `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SITE_URL=http://localhost:5173
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:5173](http://localhost:5173) (Vite default port)

## Database Schema

The application uses 13 Supabase tables:

1. **profiles** - User profile information
2. **checklist_categories** - Checklist category definitions
3. **checklist_items** - Individual checklist items (31 seeded)
4. **user_checklist_status** - User's checklist progress
5. **budgets** - Monthly budget data
6. **mahr** - Mahr tracking information
7. **wedding_budget** - Wedding expense planning
8. **savings_goals** - Savings goal tracking
9. **modules** - Learning module content (5 modules with full Islamic content)
10. **module_notes** - User's module progress and notes
11. **discussion_prompts** - Discussion topic prompts (16 seeded)
12. **user_discussion_answers** - User's discussion responses
13. **resources** - Curated Islamic resources (20+ seeded)

All tables have Row Level Security (RLS) policies implemented for data protection.

## Running the Application

### Local Development
```bash
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173)

### Production Build
```bash
npm run build
npm run preview
```
The optimized production build will be available for preview. For deployment, upload the `dist/` folder to your hosting provider.

### Deployment Options

You can deploy this Vite application to any static hosting platform:

- **Vercel** - Automatic deployments from GitHub
- **Netlify** - Drag & drop or Git integration
- **GitHub Pages** - Free static hosting
- **Cloudflare Pages** - Fast global CDN
- **Self-hosted** - Upload `dist/` folder to any web server

For static hosting:
1. Run `npm run build` to create production build
2. Upload the `dist/` folder to your hosting provider
3. Configure environment variables in your hosting dashboard
4. Set up redirect rules for client-side routing (all routes → index.html)

## Project Structure

```
├── src/
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Landing page
│   │   ├── Login.tsx     # Login page
│   │   ├── Signup.tsx    # Signup page
│   │   ├── ProfileSetup.tsx
│   │   └── dashboard/    # Protected dashboard pages
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── financial/    # Financial tool components
│   │   └── ...
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configs
│   │   ├── supabase.ts   # Supabase client
│   │   └── utils.ts      # Helper functions
│   ├── layouts/          # Layout components
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── migrations/           # SQL migration files
├── supabase-schema.sql   # Complete database schema
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies
```

## Features Implementation Details

### Authentication
- Email/password authentication via Supabase
- Protected routes using React Router and AuthContext
- Automatic redirect for unauthenticated users

### Real-time Updates
- React Query for data fetching and caching
- Optimistic UI updates for better UX
- Supabase real-time subscriptions (optional)

### Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints
- Collapsible navigation for mobile

### Islamic Theme
- Purple (#7C3AED), Gold (#D4AF37), Green (#10B981) color palette
- Islamic calligraphy elements
- Respectful and dignified design

## Security

- Row Level Security (RLS) enabled on all user data tables
- Server-side data fetching for sensitive operations
- Authentication required for all dashboard routes
- Environment variables for sensitive credentials

## Customization

### Adding More Checklist Items

1. Insert into `checklist_items` table via Supabase:
   ```sql
   INSERT INTO checklist_items (category_id, title, description, order_index)
   VALUES (
     (SELECT id FROM checklist_categories WHERE name = 'Category Name'),
     'Item Title',
     'Item Description',
     next_order_index
   );
   ```

### Adding Resources

1. Insert into `resources` table via Supabase:
   ```sql
   INSERT INTO resources (title, description, url, category, is_featured, order_index)
   VALUES (
     'Resource Title',
     'Description',
     'https://example.com',
     'Books',
     false,
     next_order_index
   );
   ```

## Support

For issues or questions, please review the code comments and Supabase documentation.

## License

This is a private project.

---

May Allah bless all marriages with love, mercy, and barakah. Ameen.
