import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

jest.mock('@/lib/db', () => ({
  db: {
    report: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Reports API Route [id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/reports/[id]', () => {
    it('should update report status when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockReport = {
        id: '1',
        status: 'reviewed',
      };

      (mockDb.report.update as jest.Mock).mockResolvedValue(mockReport);

      const request = new NextRequest('http://localhost/api/reports/1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'reviewed',
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
      expect(mockDb.report.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'reviewed' },
      });
    });

    it('should reject unauthenticated requests', async () => {
      (mockAuth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/reports/1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'reviewed' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate status values', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });

      const request = new NextRequest('http://localhost/api/reports/1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'invalid-status',
        }),
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
