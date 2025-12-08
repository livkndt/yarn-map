# Yarn Map

A full-stack Next.js 14 web application for discovering fiber arts events and yarn shops across the UK.

## Overview

Yarn Map is a directory platform that helps users find:

- **Events**: Knitting circles, crochet workshops, yarn festivals, and fiber arts events
- **Shops**: Independent yarn shops with locations, contact information, and specialties

The platform features a clean, modern UI with a warm aesthetic, built with Next.js 14 App Router, TypeScript, Tailwind CSS, and shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Vercel Postgres with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Code Quality**: ESLint + Prettier

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

### Deploying to Vercel

1. **Push your code to GitHub**

2. **Import your project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Set up Vercel Postgres**
   - In your Vercel project dashboard, go to the "Storage" tab
   - Create a new Postgres database
   - The connection string will be automatically added to your environment variables

4. **Configure Environment Variables**
   - In your Vercel project settings, add all environment variables from `.env.example`
   - Generate a secure `NEXTAUTH_SECRET`:
     ```bash
     openssl rand -base64 32
     ```
   - Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

5. **Run Database Migrations**
   - After deployment, run migrations using Vercel CLI or add a build script:
     ```bash
     vercel env pull .env.local
     npx prisma migrate deploy
     ```

6. **Deploy**
   - Vercel will automatically deploy on every push to your main branch

### Build Configuration

The project is configured for Vercel deployment. The build command is automatically set to `next build`, and the output directory is `.next`.

## Development Guidelines

- **Server Components**: Use Server Components by default. Only use `'use client'` when necessary (interactivity, hooks, browser APIs)
- **TypeScript**: All code should be properly typed. Use strict mode.
- **Styling**: Use Tailwind CSS utility classes. Follow the design system defined in `tailwind.config.ts`
- **Code Formatting**: Run `npm run format` before committing
- **Linting**: Fix all ESLint errors before committing

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
4. Test your changes locally
5. Submit a pull request

## License

[Add your license here]

## Support

For issues, questions, or contributions, please open an issue on the repository.
