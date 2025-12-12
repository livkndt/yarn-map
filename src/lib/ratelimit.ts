// Simple in-memory rate limiter
// For production, consider using @upstash/ratelimit with Redis

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS = 5;

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      reset: newEntry.resetTime,
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: MAX_REQUESTS - entry.count,
    reset: entry.resetTime,
  };
}

// Clean up old entries periodically (optional, for memory management)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, RATE_LIMIT_WINDOW);
}
