import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only initialize Redis and Ratelimit once
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Define different rate limiters for different use cases
const defaultRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(100, '1h'), // 100 requests per hour
  analytics: true,
  prefix: 'ratelimit:default',
});

const strictRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5, '1h'), // 5 requests per hour
  analytics: true,
  prefix: 'ratelimit:strict',
});

const veryStrictRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(2, '1h'), // 2 requests per hour
  analytics: true,
  prefix: 'ratelimit:very_strict',
});

const adminRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(50, '1h'), // 50 requests per hour for admin actions
  analytics: true,
  prefix: 'ratelimit:admin',
});

interface RateLimitConfig {
  limiter: Ratelimit;
  maxRequests: number;
  window: string;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  default: { limiter: defaultRatelimit, maxRequests: 100, window: '1h' },
  strict: { limiter: strictRatelimit, maxRequests: 5, window: '1h' },
  veryStrict: { limiter: veryStrictRatelimit, maxRequests: 2, window: '1h' },
  admin: { limiter: adminRatelimit, maxRequests: 50, window: '1h' },
};

export async function checkRateLimit(
  identifier: string,
  type: 'default' | 'strict' | 'veryStrict' | 'admin' = 'default',
): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}> {
  // If environment variables are missing, bypass rate limiting in development
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing',
      );
    }
    return {
      success: true,
      remaining: 999,
      reset: Date.now() + 3600000,
      limit: 1000,
    };
  }

  const config = rateLimitConfigs[type];
  if (!config) {
    throw new Error(`Unknown rate limit type: ${type}`);
  }

  const { success, limit, remaining, reset } =
    await config.limiter.limit(identifier);

  return { success, remaining, reset, limit };
}
