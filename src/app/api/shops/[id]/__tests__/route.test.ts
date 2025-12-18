import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

jest.mock('@/lib/db', () => ({
  db: {
    shop: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Shops API Route [id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/shops/[id]', () => {
    it('should return shop by id', async () => {
      const mockShop = {
        id: '1',
        name: 'Test Shop',
        city: 'London',
        postcode: 'SW1A 1AA',
      };

      (mockDb.shop.findUnique as jest.Mock).mockResolvedValue(mockShop);

      const request = new NextRequest('http://localhost/api/shops/1');
      const response = await GET(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent shop', async () => {
      (mockDb.shop.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/shops/999');
      const response = await GET(request, {
        params: Promise.resolve({ id: '999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Shop not found');
    });
  });

  describe('PATCH /api/shops/[id]', () => {
    it('should update shop when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockShop = {
        id: '1',
        name: 'Updated Shop',
        city: 'London',
      };

      (mockDb.shop.update as jest.Mock).mockResolvedValue(mockShop);

      const request = new NextRequest('http://localhost/api/shops/1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Shop',
        }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/shops/[id]', () => {
    it('should delete shop when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      (mockDb.shop.delete as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/shops/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
