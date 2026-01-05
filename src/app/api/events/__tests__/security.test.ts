import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    event: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/ratelimit', () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockDb = db as any;
const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockRateLimit = checkRateLimit as jest.MockedFunction<
  typeof checkRateLimit
>;

describe('Events API Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should block GET requests when rate limit exceeded', async () => {
      mockRateLimit.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 3600000,
        limit: 100,
      });

      const request = new NextRequest('http://localhost/api/events');
      const response = await GET(request);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toContain('Too many requests');
    });

    it('should block POST requests when rate limit exceeded', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin' } });
      mockRateLimit.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 3600000,
        limit: 2,
      });

      const request = new NextRequest('http://localhost/api/events', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(429);
    });
  });

  describe('Authentication', () => {
    it('should block unauthorized POST requests', async () => {
      mockAuth.mockResolvedValue(null);
      mockRateLimit.mockResolvedValue({
        success: true,
        remaining: 1,
        reset: Date.now() + 3600000,
        limit: 2,
      });

      const request = new NextRequest('http://localhost/api/events', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Audit Logging', () => {
    it('should record audit log on successful creation', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin-123' } });
      mockRateLimit.mockResolvedValue({
        success: true,
        remaining: 1,
        reset: Date.now() + 3600000,
        limit: 2,
      });
      mockDb.event.create.mockResolvedValue({
        id: 'event-123',
        name: 'Test Event',
        location: 'London',
      });

      const request = new NextRequest('http://localhost/api/events', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Event',
          startDate: '2026-01-01T10:00:00Z',
          location: 'London',
          address: '123 Test St',
          latitude: 51.5,
          longitude: -0.1,
          source: 'manual',
        }),
      });
      await POST(request);

      expect(mockDb.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'event.create',
            userId: 'admin-123',
            resourceId: 'event-123',
          }),
        }),
      );
    });
  });
});
