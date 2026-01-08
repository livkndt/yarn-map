import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';

jest.mock('@/lib/db', () => ({
  db: {
    event: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

describe('Events API Route [id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      success: true,
      remaining: 199,
      reset: Date.now() + 3600000,
      limit: 200,
    });
  });

  describe('Rate Limiting', () => {
    it('should block GET when rate limit exceeded', async () => {
      mockRateLimit.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 3600000,
        limit: 100,
      });

      const request = new NextRequest('http://localhost/api/events/1');
      const response = await GET(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(429);
    });
  });

  describe('Audit Logging', () => {
    it('should record audit log on update', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin-1' } });
      mockDb.event.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      });
      await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(mockDb.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'event.update',
            userId: 'admin-1',
            resourceId: '1',
          }),
        }),
      );
    });

    it('should record audit log on delete', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin-1' } });

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'DELETE',
      });
      await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(mockDb.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'event.delete',
            userId: 'admin-1',
            resourceId: '1',
          }),
        }),
      );
    });
  });

  describe('GET /api/events/[id]', () => {
    it('should return event by id', async () => {
      const mockEvent = {
        id: '1',
        name: 'Test Event',
        startDate: new Date('2026-01-01'),
        location: 'London',
      };

      (mockDb.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost/api/events/1');
      const response = await GET(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Test Event');
      expect(mockDb.event.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return 404 for non-existent event', async () => {
      (mockDb.event.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/events/999');
      const response = await GET(request, {
        params: Promise.resolve({ id: '999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Event not found');
    });
  });

  describe('PATCH /api/events/[id]', () => {
    it('should update event when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockEvent = {
        id: '1',
        name: 'Updated Event',
        startDate: new Date('2026-01-01'),
        location: 'London',
      };

      (mockDb.event.update as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Event',
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
    });

    it('should reject unauthenticated requests', async () => {
      (mockAuth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should update event region field', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockEvent = {
        id: '1',
        name: 'Test Event',
        startDate: new Date('2026-01-01'),
        location: 'London',
        region: 'Scotland',
      };

      (mockDb.event.update as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'PATCH',
        body: JSON.stringify({
          region: 'Scotland',
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
      expect(mockDb.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            region: 'Scotland',
          }),
        }),
      );
    });

    it('should update event region to null', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockEvent = {
        id: '1',
        name: 'Test Event',
        startDate: new Date('2026-01-01'),
        location: 'London',
        region: null,
      };

      (mockDb.event.update as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'PATCH',
        body: JSON.stringify({
          region: null,
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
      expect(mockDb.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            region: null,
          }),
        }),
      );
    });
  });

  describe('DELETE /api/events/[id]', () => {
    it('should delete event when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      (mockDb.event.delete as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDb.event.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should reject unauthenticated requests', async () => {
      (mockAuth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/events/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
