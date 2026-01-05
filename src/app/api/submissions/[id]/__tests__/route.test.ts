import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

jest.mock('@/lib/db', () => ({
  db: {
    submission: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    event: {
      create: jest.fn(),
    },
    shop: {
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

describe('Submissions API Route [id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/submissions/[id]', () => {
    it('should approve shop submission and create shop', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockSubmission = {
        id: '1',
        entityType: 'Shop',
        name: 'Test Shop',
        address: '123 Test St',
        city: 'London',
        postcode: 'SW1A 1AA',
        status: 'pending',
        description: null,
        latitude: null,
        longitude: null,
        website: null,
        phone: null,
      };

      const mockShop = {
        id: 'shop-1',
        name: 'Test Shop',
      };

      (mockDb.submission.findUnique as jest.Mock).mockResolvedValue(
        mockSubmission,
      );
      (mockDb.shop.create as jest.Mock).mockResolvedValue(mockShop);
      (mockDb.submission.update as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        status: 'approved',
        reviewedBy: 'admin',
        reviewedAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/submissions/1', {
        method: 'PATCH',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          status: 'approved',
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
      expect(mockDb.shop.create).toHaveBeenCalled();
      expect(mockDb.submission.update).toHaveBeenCalled();
    });

    it('should approve event submission and create event', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockSubmission = {
        id: '2',
        entityType: 'Event',
        name: 'Test Event',
        address: '123 Test St',
        location: 'London',
        status: 'pending',
        description: null,
        startDate: new Date('2024-12-31'),
        endDate: null,
        latitude: null,
        longitude: null,
        website: null,
      };

      const mockEvent = {
        id: 'event-1',
        name: 'Test Event',
      };

      (mockDb.submission.findUnique as jest.Mock).mockResolvedValue(
        mockSubmission,
      );
      (mockDb.event.create as jest.Mock).mockResolvedValue(mockEvent);
      (mockDb.submission.update as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        status: 'approved',
        reviewedBy: 'admin',
        reviewedAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/submissions/2', {
        method: 'PATCH',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          status: 'approved',
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '2' }),
      });

      expect(response.status).toBe(200);
      expect(mockDb.event.create).toHaveBeenCalled();
      expect(mockDb.submission.update).toHaveBeenCalled();
    });

    it('should reject submission', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockSubmission = {
        id: '1',
        entityType: 'Shop',
        status: 'pending',
      };

      (mockDb.submission.findUnique as jest.Mock).mockResolvedValue(
        mockSubmission,
      );
      (mockDb.submission.update as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        status: 'rejected',
        rejectionReason: 'Not suitable',
        reviewedBy: 'admin',
        reviewedAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/submissions/1', {
        method: 'PATCH',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: 'Not suitable',
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
      expect(mockDb.submission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            status: 'rejected',
            rejectionReason: 'Not suitable',
          }),
        }),
      );
    });

    it('should reject unauthenticated requests', async () => {
      (mockAuth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/submissions/1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if submission not found', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      (mockDb.submission.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/submissions/999', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Submission not found');
    });

    it('should validate status values', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockSubmission = {
        id: '1',
        status: 'pending',
      };

      (mockDb.submission.findUnique as jest.Mock).mockResolvedValue(
        mockSubmission,
      );

      const request = new NextRequest('http://localhost/api/submissions/1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'invalid_status' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });
  });
});
