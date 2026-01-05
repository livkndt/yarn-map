import { NextRequest } from 'next/server';
import { GET } from '../route';
import { checkRateLimit } from '@/lib/ratelimit';

jest.mock('@/lib/ratelimit', () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Health API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when healthy', async () => {
    (checkRateLimit as jest.Mock).mockResolvedValue({
      success: true,
      remaining: 99,
      reset: Date.now() + 3600000,
      limit: 100,
    });

    const request = new NextRequest('http://localhost/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  it('should return 429 when rate limited', async () => {
    (checkRateLimit as jest.Mock).mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 3600000,
      limit: 100,
    });

    const request = new NextRequest('http://localhost/api/health');
    const response = await GET(request);

    expect(response.status).toBe(429);
  });

  it('should return 500 on internal error', async () => {
    (checkRateLimit as jest.Mock).mockRejectedValue(new Error('Test error'));

    const request = new NextRequest('http://localhost/api/health');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
