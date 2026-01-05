import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';

jest.mock('@/lib/db', () => ({
  db: {
    report: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
    },
    shop: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
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
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<
  typeof checkRateLimit
>;

describe('Reports API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 3600000,
      limit: 5,
    });
    // Default mocks for entity existence checks
    (mockDb.event.findUnique as jest.Mock).mockResolvedValue({ id: 'event-1' });
    (mockDb.shop.findUnique as jest.Mock).mockResolvedValue(null);
    // Default mocks for duplicate detection
    (mockDb.report.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.auditLog.findFirst as jest.Mock).mockResolvedValue(null);
  });

  describe('POST /api/reports', () => {
    it('should create report successfully for Event', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const mockReport = {
        id: '1',
        entityType: 'Event',
        entityId: 'event-1',
        issueType: 'Incorrect information',
        status: 'pending',
      };

      (mockDb.event.findUnique as jest.Mock).mockResolvedValue({
        id: 'event-1',
      });
      (mockDb.report.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.report.create as jest.Mock).mockResolvedValue(mockReport);

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Event',
          entityId: 'event-1',
          issueType: 'Incorrect information',
          description: 'This is a test report',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockDb.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-1' },
      });
      expect(mockDb.report.create).toHaveBeenCalled();
    });

    it('should create report successfully for Shop', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const mockReport = {
        id: '2',
        entityType: 'Shop',
        entityId: 'shop-1',
        issueType: 'Incorrect information',
        status: 'pending',
      };

      (mockDb.shop.findUnique as jest.Mock).mockResolvedValue({ id: 'shop-1' });
      (mockDb.report.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.report.create as jest.Mock).mockResolvedValue(mockReport);

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Shop',
          entityId: 'shop-1',
          issueType: 'Incorrect information',
          description: 'This is a test report',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockDb.shop.findUnique).toHaveBeenCalledWith({
        where: { id: 'shop-1' },
      });
      expect(mockDb.report.create).toHaveBeenCalled();
    });

    it('should reject when rate limit exceeded', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Event',
          entityId: 'event-1',
          issueType: 'Incorrect information',
          description: 'This is a test report',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many requests');
    });

    it('should validate required fields', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          // Missing required fields
          entityType: 'Event',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should reject report if entity does not exist', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      (mockDb.event.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Event',
          entityId: 'non-existent-event',
          issueType: 'Incorrect information',
          description: 'This is a test report',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('does not exist');
    });

    it('should reject duplicate reports from same IP within 24 hours', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      (mockDb.event.findUnique as jest.Mock).mockResolvedValue({
        id: 'event-1',
      });
      (mockDb.report.findMany as jest.Mock).mockResolvedValue([
        { id: 'report-1' },
      ]);
      (mockDb.auditLog.findFirst as jest.Mock).mockResolvedValue({
        id: 'audit-1',
        ipAddress: '192.168.1.1',
      });

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Event',
          entityId: 'event-1',
          issueType: 'Incorrect information',
          description: 'This is a duplicate report',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('already reported');
      expect(mockDb.report.create).not.toHaveBeenCalled();
    });

    it('should reject description exceeding max length', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const longDescription = 'a'.repeat(2001);

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Event',
          entityId: 'event-1',
          issueType: 'Incorrect information',
          description: longDescription,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should silently reject spam (honeypot filled)', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Event',
          entityId: 'event-1',
          issueType: 'Incorrect information',
          description: 'This is spam',
          honeypot: 'filled', // Spam indicator
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDb.report.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/reports', () => {
    it('should return reports when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockReports = [
        {
          id: '1',
          entityType: 'Event',
          entityId: 'event-1',
          status: 'pending',
        },
      ];

      (mockDb.report.findMany as jest.Mock).mockResolvedValue(mockReports);
      (mockDb.report.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toHaveLength(1);
      expect(data.total).toBe(1);
    });

    it('should filter by status', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      (mockDb.report.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.report.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost/api/reports?status=pending',
      );
      await GET(request);

      expect(mockDb.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
          }),
        }),
      );
    });

    it('should reject unauthenticated requests', async () => {
      (mockAuth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
