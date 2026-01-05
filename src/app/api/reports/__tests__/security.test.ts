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
    auditLog: {
      create: jest.fn(),
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
        body: JSON.stringify({ name: 'Spam' }),
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
      mockDb.report.create.mockResolvedValue({
        id: 'report-123',
        entityType: 'Shop',
        issueType: 'Other',
      });

      const request = new NextRequest('http://localhost/api/reports', {
        method: 'POST',
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
});
