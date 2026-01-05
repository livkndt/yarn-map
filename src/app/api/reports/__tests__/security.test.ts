import { NextRequest } from 'next/server';
import { POST } from '../route';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAudit } from '@/lib/audit';

// Mock dependencies
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

jest.mock('@/lib/audit', () => ({
  logAudit: jest.fn(),
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
const mockRateLimit = checkRateLimit as jest.MockedFunction<
  typeof checkRateLimit
>;
const mockLogAudit = logAudit as jest.MockedFunction<typeof logAudit>;

describe('Reports API Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for entity existence checks
    (mockDb.event.findUnique as jest.Mock).mockResolvedValue({ id: '123' });
    (mockDb.shop.findUnique as jest.Mock).mockResolvedValue(null);
    // Default mocks for duplicate detection
    (mockDb.report.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.auditLog.findFirst as jest.Mock).mockResolvedValue(null);
  });

  describe('Rate Limiting', () => {
    it('should block report submission when rate limit exceeded', async () => {
      mockRateLimit.mockResolvedValue({
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
          entityId: '123',
          issueType: 'Spam',
          description: 'This is spam',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(429);
    });
  });

  describe('Spam Prevention', () => {
    it('should silently reject reports with honeypot filled', async () => {
      mockRateLimit.mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          entityType: 'Event',
          entityId: '123',
          issueType: 'Spam',
          description: 'This is spam',
          honeypot: 'bot-detected',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(mockDb.report.create).not.toHaveBeenCalled();
    });
  });

  describe('Audit Logging', () => {
    it('should record audit log on report creation', async () => {
      mockRateLimit.mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });
      (mockDb.shop.findUnique as jest.Mock).mockResolvedValue({
        id: 'shop-123',
      });
      (mockDb.report.findMany as jest.Mock).mockResolvedValue([]);
      mockDb.report.create.mockResolvedValue({
        id: 'report-123',
        entityType: 'Shop',
        issueType: 'Other',
      });

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          entityType: 'Shop',
          entityId: 'shop-123',
          issueType: 'Other',
          description: 'Valid report description',
        }),
      });
      await POST(request);

      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'report.create',
          resourceId: 'report-123',
        }),
      );
    });
  });

  describe('Duplicate Prevention', () => {
    it('should prevent duplicate reports from same IP for same entity', async () => {
      mockRateLimit.mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 3600000,
        limit: 5,
      });
      (mockDb.event.findUnique as jest.Mock).mockResolvedValue({
        id: 'event-123',
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
          entityId: 'event-123',
          issueType: 'Spam',
          description: 'Duplicate report attempt',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('already reported');
      expect(mockDb.report.create).not.toHaveBeenCalled();
    });
  });

  describe('Entity Validation', () => {
    it('should reject report for non-existent entity', async () => {
      mockRateLimit.mockResolvedValue({
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
          entityId: 'non-existent',
          issueType: 'Spam',
          description: 'Report for non-existent entity',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('does not exist');
      expect(mockDb.report.create).not.toHaveBeenCalled();
    });
  });
});
