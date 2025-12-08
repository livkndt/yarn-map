# Yarn Map

A full-stack Next.js 16 web application for discovering fiber arts events and yarn shops across the UK.

## Overview

Yarn Map is a directory platform that helps users find:

- **Events**: Knitting circles, crochet workshops, yarn festivals, and fiber arts events
- **Shops**: Independent yarn shops with locations, contact information, and specialties

The platform features a clean, modern UI with a warm aesthetic, built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, and shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19.2.1
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Vercel Postgres with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest + React Testing Library

## Prerequisites

- **Node.js** 18.17 or later
- **npm** (project uses npm scripts)
- **Docker** (to run Postgres locally)
- **Git** (for version control)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd yarn-map
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables (match the Docker connection string below):

```env
# Database connection string (Dockerized Postgres)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yarnmap?schema=public"

# NextAuth.js secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"

# Application URL
NEXTAUTH_URL="http://localhost:3000"

# Admin password for authentication
ADMIN_PASSWORD="your-secure-admin-password-here"
```

### 4. Run Postgres via Docker (local)

```bash
docker run --name yarnmap-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yarnmap \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Run Database Migrations

Generate Prisma Client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

This will:

- Generate the Prisma Client
- Create the database tables (events, shops, reports)

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public routes with nav/footer
│   │   ├── layout.tsx     # Public layout
│   │   ├── page.tsx       # Homepage
│   │   ├── events/        # Events directory
│   │   └── shops/         # Shops directory
│   ├── admin/             # Admin routes
│   │   ├── layout.tsx     # Protected admin layout
│   │   ├── page.tsx       # Login page
│   │   └── dashboard/     # Admin dashboard
│   └── api/               # API routes
│       ├── auth/          # NextAuth.js routes
│       └── health/        # Health check
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── nav.tsx            # Main navigation
│   └── footer.tsx         # Footer component
├── lib/
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Database Schema

### Events Table

- `id` (String, Primary Key)
- `name` (String)
- `description` (Text, Optional)
- `start_date` (DateTime)
- `end_date` (DateTime, Optional)
- `location` (String)
- `address` (String)
- `latitude` (Float, Optional)
- `longitude` (Float, Optional)
- `website` (String, Optional)
- `source` (String, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Shops Table

- `id` (String, Primary Key)
- `name` (String)
- `description` (Text, Optional)
- `address` (String)
- `city` (String)
- `postcode` (String)
- `latitude` (Float, Optional)
- `longitude` (Float, Optional)
- `website` (String, Optional)
- `phone` (String, Optional)
- `source` (String, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Reports Table

- `id` (String, Primary Key)
- `entity_type` (String) - 'event' or 'shop'
- `entity_id` (String)
- `issue_type` (String)
- `description` (Text, Optional)
- `reporter_email` (String, Optional)
- `status` (String, Default: 'pending')
- `created_at` (DateTime)

## Authentication

The admin section is protected with NextAuth.js v5 using a credentials provider. To access the admin dashboard:

1. Navigate to `/admin`
2. Enter any email address
3. Enter the password set in `ADMIN_PASSWORD` environment variable

**Note**: In production, consider implementing proper user management with hashed passwords and user accounts in the database.

## Deployment

### Deploying to Netlify

#### Step 1: Push your code to GitHub

Make sure your code is pushed to a GitHub repository.

#### Step 2: Import your project to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Netlify will detect it's a Next.js project automatically

#### Step 3: Set up your PostgreSQL Database

**Recommended: Use Netlify's Prisma Postgres Integration** (Easiest!)

This is the simplest option - Netlify automatically creates and manages your database:

1. **Install Prisma Postgres Extension**:
   - Go to https://www.netlify.com/integrations/prisma/
   - Click **"Enable integration"** to add it to your Netlify team

2. **Connect Netlify to Prisma**:
   - Go to https://www.prisma.io/console and sign in
   - Select your workspace (or create one)
   - Navigate to **"Integrations"** section
   - Create a new **Netlify integration token**
   - Copy the generated token
   - In Netlify: Go to **Team settings** → Find **Prisma Postgres extension** → Paste token in "Integration Token" field → Save

3. **Configure for Your Site**:
   - In your Netlify site dashboard, go to **Extensions**
   - Click on **"Prisma Postgres"**
   - Choose the Prisma project you want to link
   - Configure for **Production** and **Preview** environments
   - Save settings
   - **Done!** The extension automatically creates a Prisma Postgres instance and sets `DATABASE_URL` for you

**Alternative: External Database Providers** (if you prefer not to use Prisma Postgres):

- [Supabase](https://supabase.com) (free tier available)
- [Neon](https://neon.tech) (serverless Postgres, free tier available)
- [Railway](https://railway.app) (free tier available)
- [Render](https://render.com) (free tier available)

If using an external provider, you'll receive a connection string in the format:

```
postgresql://user:password@host:port/database?sslmode=require
```

#### Step 4: Configure Environment Variables

Go to your Netlify site **Site settings** → **Environment variables** and add:

1. **`DATABASE_URL`**
   - **If using Prisma Postgres extension**: This is automatically set - you don't need to add it manually!
   - **If using external provider**: Your PostgreSQL connection string from Step 3
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - Make sure to add it for **Production**, **Deploy previews**, and **Branch deploys** (only if using external provider)

2. **`NEXTAUTH_SECRET`** (or `AUTH_SECRET` for NextAuth v5)
   - Generate a secure secret:
     ```bash
     openssl rand -base64 32
     ```
   - Copy the output and paste it as the value
   - Add it for all scopes (Production, Deploy previews, Branch deploys)

3. **`NEXTAUTH_URL`** (or `AUTH_URL` for NextAuth v5)
   - For Production: `https://your-app.netlify.app` (or your custom domain)
   - For Deploy previews: Leave empty or use `https://deploy-preview-XXX--your-app.netlify.app`
   - For Branch deploys: Leave empty or use `https://branch-name--your-app.netlify.app`
   - For Local development: `http://localhost:3000`

4. **`ADMIN_PASSWORD`**
   - Set a secure password for admin login
   - This is the password you'll use to access `/admin`
   - Add it for all scopes

#### Step 5: Configure Build Settings

The `netlify.toml` file is already configured, but verify these settings in Netlify:

1. Go to **Site settings** → **Build & deploy**
2. Verify:
   - **Build command**: `npm run build` (or leave empty to use netlify.toml)
   - **Publish directory**: `.next` (Netlify Next.js plugin handles this automatically)
   - **Node version**: `20` (set in netlify.toml)

#### Step 6: Database Migrations

The build script automatically runs migrations during deployment:

- `prisma generate` - Generates Prisma Client (runs in postinstall)
- `prisma migrate deploy` - Applies pending migrations
- `next build` - Builds your Next.js app

**First deployment**: After your first deployment:

1. Check the build logs in Netlify dashboard
2. Look for "Applying migration..." messages
3. If migrations fail, you can run them manually:

   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Pull environment variables
   netlify env:pull .env.local

   # Run migrations
   npx prisma migrate deploy
   ```

#### Step 7: Deploy

1. Click **"Deploy site"** in Netlify
2. Netlify will automatically:
   - Install dependencies
   - Generate Prisma Client (via postinstall script)
   - Run database migrations (via build script)
   - Build your Next.js app
   - Deploy to production

3. **Future deployments**: Netlify will automatically deploy on every push to your main branch

#### Step 8: Verify Deployment

1. Visit your deployment URL (e.g., `https://your-app.netlify.app`)
2. Test the admin login at `https://your-app.netlify.app/admin`
3. Check that database connections are working

### Build Configuration

The project is configured for Netlify deployment via `netlify.toml`:

- **Build Command**: `npm run build` (which runs `prisma generate && prisma migrate deploy && next build`)
- **Publish Directory**: `.next` (handled by `@netlify/plugin-nextjs`)
- **Node Version**: `20`
- **Plugins**: `@netlify/plugin-nextjs` (automatically installed)

### Troubleshooting

**Database connection issues:**

- Verify `DATABASE_URL` is set correctly in Environment Variables
- Check that your database is accessible from the internet (not localhost)
- Ensure SSL mode is enabled (`?sslmode=require` in connection string)
- Check database provider's firewall/whitelist settings

**Build failures:**

- Check build logs for specific errors
- Verify Node version is 20
- Ensure all environment variables are set
- Check that Prisma migrations are valid

**Authentication issues:**

- Verify `NEXTAUTH_SECRET` (or `AUTH_SECRET`) is set
- Check that `NEXTAUTH_URL` matches your deployment URL exactly
- Ensure `ADMIN_PASSWORD` is set

**Migration issues:**

- Check build logs for migration errors
- Run migrations manually: `npx prisma migrate deploy`
- Verify your Prisma schema is correct
- Ensure database user has migration permissions

**Next.js plugin issues:**

- The `@netlify/plugin-nextjs` plugin should be automatically detected
- If not, it will be installed during the first build
- Check that `netlify.toml` is in your repository root

## Development Guidelines

- **Server Components**: Use Server Components by default. Only use `'use client'` when necessary (interactivity, hooks, browser APIs)
- **TypeScript**: All code should be properly typed. Use strict mode.
- **Styling**: Use Tailwind CSS utility classes. Follow the design system defined in `tailwind.config.ts`
- **Code Formatting**: Run `npm run format` before committing
- **Linting**: Fix all ESLint errors before committing
- **Testing**: Write tests for new components and features. Maintain test coverage above 85%
- **Commits**: Follow Conventional Commits format (e.g., `feat: add new feature`, `fix: resolve bug`)

## Testing

The project uses Jest and React Testing Library for testing. Test coverage thresholds are enforced:

- **Statements**: 85%
- **Branches**: 60%
- **Functions**: 75%
- **Lines**: 85%

Tests run automatically on commit via pre-commit hooks. If coverage drops below thresholds, the commit will fail.

To run tests:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Design System

### Colors

- **Background**: Cream (#FDF6F0)
- **Primary**: Deep Teal (#0F6B6B)
- **Secondary/Accent**: Terracotta (#D4816B)
- **Foreground**: Dark Gray (#1a1a1a)

### Typography

- **Headings**: DM Sans
- **Body**: Inter

### Components

- Rounded corners: `rounded-lg`
- Subtle shadows on cards
- Mobile-first responsive design

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Write tests for new features
5. Run `npm test` to ensure all tests pass
6. Run `npm run test:coverage` to verify coverage thresholds are met
7. Submit a pull request

**Note**: Pre-commit hooks will automatically:

- Lint and format staged files
- Run tests with coverage
- Validate commit message format (Conventional Commits)

## License

[Add your license here]

## Support

For issues, questions, or contributions, please open an issue on the repository.
