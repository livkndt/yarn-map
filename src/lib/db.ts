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
// Optimized for production performance
const poolConfig: any = {
  connectionString,
  max: process.env.NODE_ENV === 'production' ? 20 : 10, // More connections in production
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: process.env.NODE_ENV === 'production' ? 10000 : 5000, // Longer timeout in production for network latency
  allowExitOnIdle: true, // Allow the process to exit if the pool is idle
};

// Only add SSL config if connection string doesn't already specify it
// Most production DBs include SSL in the connection string (e.g., ?sslmode=require)
if (
  process.env.NODE_ENV === 'production' &&
  !connectionString.includes('sslmode')
) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = globalForPrisma.pool ?? new Pool(poolConfig);

// Reuse pool in all environments for better performance
globalForPrisma.pool = pool;

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

// Reuse db instance in all environments for better performance
globalForPrisma.prisma = db;
