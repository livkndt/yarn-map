import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Log database connection info in development (without exposing credentials)
if (process.env.NODE_ENV === 'development') {
  const dbInfo = connectionString.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  console.log('[DB] Connecting to:', dbInfo);
}

// Create a connection pool with limits for security and stability
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Slightly longer timeout for resilience
    allowExitOnIdle: true, // Allow the process to exit if the pool is idle
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
