import { checkRateLimit } from '../ratelimit';

describe('Rate Limiter', () => {
  // Use unique identifiers for each test to avoid state pollution
  const getUniqueId = () => `test-${Date.now()}-${Math.random()}`;

  it('should allow first request', async () => {
    const result = await checkRateLimit(getUniqueId());

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4); // 5 max - 1 used
    expect(result.reset).toBeGreaterThan(Date.now());
  });

  it('should allow multiple requests up to limit', async () => {
    const identifier = getUniqueId();

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(identifier);
      expect(result.success).toBe(true);
    }

    // 6th request should be blocked
    const result = await checkRateLimit(identifier);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should return correct remaining count', async () => {
    const identifier = getUniqueId();

    const result1 = await checkRateLimit(identifier);
    expect(result1.remaining).toBe(4);

    const result2 = await checkRateLimit(identifier);
    expect(result2.remaining).toBe(3);

    const result3 = await checkRateLimit(identifier);
    expect(result3.remaining).toBe(2);
  });

  it('should track different identifiers separately', async () => {
    const id1 = getUniqueId();
    const id2 = getUniqueId();

    // Fill up limit for id1
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(id1);
    }

    // id2 should still have full limit
    const result = await checkRateLimit(id2);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should return reset timestamp in the future', async () => {
    const before = Date.now();
    const result = await checkRateLimit(getUniqueId());
    const after = Date.now();

    expect(result.reset).toBeGreaterThan(before);
    // Reset should be about 1 hour from now
    expect(result.reset).toBeGreaterThan(after);
    expect(result.reset).toBeLessThanOrEqual(after + 3600000 + 1000); // 1 hour + small buffer
  });
});
