# Running Migrations on Prisma Postgres

**Important**: Migrations are no longer run automatically during build to avoid build failures. You need to run them manually after deployment.

If your tables aren't showing up in Prisma Console, you need to run migrations manually.

## Option 1: Run Migrations via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:

   ```bash
   netlify login
   ```

3. **Navigate to your project directory**:

   ```bash
   cd /path/to/yarn-map
   ```

4. **Link to your Netlify site** (if not already linked):

   ```bash
   netlify link
   ```

   - Select your site from the list

5. **Run migrations with DATABASE_URL from Netlify**:

   ```bash
   DATABASE_URL="$(netlify env:get DATABASE_URL)" npx prisma migrate deploy
   ```

   This gets the DATABASE_URL from Netlify and runs migrations in one command.

## Option 2: Run Migrations Directly with Connection String

1. **Get your Prisma Postgres connection string**:
   - Go to Prisma Console: https://www.prisma.io/console
   - Select your project
   - Go to Settings → Database
   - Copy the connection string

2. **Run migrations with the connection string**:
   ```bash
   DATABASE_URL="your-connection-string-here" npx prisma migrate deploy
   ```

## Option 3: Use Prisma Studio to Verify

After running migrations, you can verify tables exist:

```bash
# Set DATABASE_URL first
export DATABASE_URL="your-connection-string"

# Or use .env.local from Netlify
source .env.local

# Open Prisma Studio
npx prisma studio
```

This will open a browser interface where you can see all your tables.

## Verify Migrations Ran

After running migrations, check:

1. **In Prisma Console**:
   - Go to your project → Database
   - You should see tables: `events`, `shops`, `reports`

2. **Via SQL query** (if you have database access):
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

## Troubleshooting

**"Migration already applied"**

- This means migrations ran successfully
- Check if tables exist in Prisma Console

**"No migrations found"**

- Make sure `prisma/migrations` folder is committed to git
- Verify migrations exist: `ls prisma/migrations/`

**"Connection refused"**

- Verify DATABASE_URL is correct
- Check that the database is accessible
- Ensure SSL is enabled if required

**"Table already exists"**

- Tables might already be created
- Check Prisma Console to verify
