// Mock Next.js server modules before importing
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      headers: options?.headers || {},
    })),
  },
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    headers: {
      get: jest.fn().mockReturnValue('127.0.0.1'),
    },
  })),
}));

jest.mock('@/lib/ratelimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({
    success: true,
    remaining: 99,
    reset: Date.now() + 3600000,
    limit: 100,
  }),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { GET } from '../route';
import { NextRequest } from 'next/server';

describe('Health API route', () => {
  it('should return 200 status with ok status', async () => {
    const request = new NextRequest('http://localhost/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.timestamp).toBe('string');
  });

  it('should return a valid ISO timestamp', async () => {
    const request = new NextRequest('http://localhost/api/health');
    const response = await GET(request);
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });
});
