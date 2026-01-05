import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';

jest.mock('@/lib/db', () => ({
  db: {
    submission: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
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

jest.mock('@/lib/audit', () => ({
  logAudit: jest.fn(),
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

describe('Submissions API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 3600000,
      limit: 5,
    });
    // Default mocks for duplicate detection
    (mockDb.submission.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.auditLog.findFirst as jest.Mock).mockResolvedValue(null);
  });

  describe('POST /api/submissions', () => {
    it('should create shop submission successfully', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const mockSubmission = {
        id: '1',
        entityType: 'Shop',
        name: 'Test Shop',
        address: '123 Test St',
        city: 'London',
        postcode: 'SW1A 1AA',
        status: 'pending',
      };

      (mockDb.submission.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.submission.create as jest.Mock).mockResolvedValue(mockSubmission);

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Shop',
          name: 'Test Shop',
          address: '123 Test St',
          city: 'London',
          postcode: 'SW1A 1AA',
          description: 'A test shop',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockDb.submission.create).toHaveBeenCalled();
    });

    it('should create event submission successfully', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const mockSubmission = {
        id: '2',
        entityType: 'Event',
        name: 'Test Event',
        address: '123 Test St',
        location: 'London',
        status: 'pending',
      };

      (mockDb.submission.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.submission.create as jest.Mock).mockResolvedValue(mockSubmission);

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Event',
          name: 'Test Event',
          address: '123 Test St',
          location: 'London',
          startDate: '2024-12-31T10:00:00',
          description: 'A test event',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockDb.submission.create).toHaveBeenCalled();
    });

    it('should reject when rate limit exceeded', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Shop',
          name: 'Test Shop',
          address: '123 Test St',
          city: 'London',
          postcode: 'SW1A 1AA',
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

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Shop',
          // Missing required fields
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should reject duplicate submissions from same IP within 24 hours', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      (mockDb.submission.findMany as jest.Mock).mockResolvedValue([
        { id: 'submission-1' },
      ]);
      (mockDb.auditLog.findFirst as jest.Mock).mockResolvedValue({
        id: 'audit-1',
        ipAddress: '192.168.1.1',
      });

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Shop',
          name: 'Test Shop',
          address: '123 Test St',
          city: 'London',
          postcode: 'SW1A 1AA',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('already submitted');
      expect(mockDb.submission.create).not.toHaveBeenCalled();
    });

    it('should silently reject spam (honeypot filled)', async () => {
      (mockCheckRateLimit as jest.Mock).mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const request = new NextRequest('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Shop',
          name: 'Test Shop',
          address: '123 Test St',
          city: 'London',
          postcode: 'SW1A 1AA',
          honeypot: 'filled', // Spam indicator
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDb.submission.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/submissions', () => {
    it('should return submissions when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockSubmissions = [
        {
          id: '1',
          entityType: 'Shop',
          name: 'Test Shop',
          status: 'pending',
        },
      ];

      (mockDb.submission.findMany as jest.Mock).mockResolvedValue(
        mockSubmissions,
      );
      (mockDb.submission.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/submissions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.submissions).toHaveLength(1);
      expect(data.total).toBe(1);
    });

    it('should filter by status', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      (mockDb.submission.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.submission.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost/api/submissions?status=pending',
      );
      await GET(request);

      expect(mockDb.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
          }),
        }),
      );
    });

    it('should reject unauthenticated requests', async () => {
      (mockAuth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/submissions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
