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

const mockDb = db as any;
const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockRateLimit = checkRateLimit as jest.MockedFunction<
  typeof checkRateLimit
>;

describe('Events API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      success: true,
      remaining: 99,
      reset: Date.now() + 3600000,
      limit: 100,
    });
  });

  describe('GET /api/events', () => {
    it('should return events with default pagination', async () => {
      const mockEvents = [
        {
          id: '1',
          name: 'Test Event',
          startDate: new Date('2026-01-01'),
          location: 'London',
        },
      ];

      (mockDb.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
      (mockDb.event.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/events');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(data.limit).toBe(50);
      expect(data.offset).toBe(0);
    });

    it('should filter by upcoming events', async () => {
      (mockDb.event.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.event.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost/api/events?upcoming=true',
      );
      await GET(request);

      expect(mockDb.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('should filter by location', async () => {
      (mockDb.event.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.event.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost/api/events?location=London',
      );
      await GET(request);

      expect(mockDb.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: expect.objectContaining({
              contains: 'London',
              mode: 'insensitive',
            }),
          }),
        }),
      );
    });

    it('should search by name or description', async () => {
      (mockDb.event.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.event.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost/api/events?search=yarn',
      );
      await GET(request);

      expect(mockDb.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({
                  contains: 'yarn',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      (mockDb.event.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const request = new NextRequest('http://localhost/api/events');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch events');
    });
  });

  describe('POST /api/events', () => {
    it('should create event when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockEvent = {
        id: '1',
        name: 'New Event',
        startDate: new Date('2026-01-01'),
        location: 'London',
        address: '123 Street',
      };

      (mockDb.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost/api/events', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Event',
          startDate: '2026-01-01T00:00:00Z',
          location: 'London',
          address: '123 Street',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New Event');
    });

    it('should reject unauthenticated requests', async () => {
      (mockAuth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/events', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Event',
          startDate: '2026-01-01T00:00:00Z',
          location: 'London',
          address: '123 Street',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate required fields', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });

      const request = new NextRequest('http://localhost/api/events', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields like startDate, location, address
          name: 'New Event',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });
  });
});
