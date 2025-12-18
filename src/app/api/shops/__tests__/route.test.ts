import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

jest.mock('@/lib/db', () => ({
  db: {
    shop: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Shops API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/shops', () => {
    it('should return shops with default pagination', async () => {
      const mockShops = [
        {
          id: '1',
          name: 'Test Shop',
          city: 'London',
          postcode: 'SW1A 1AA',
        },
      ];

      (mockDb.shop.findMany as jest.Mock).mockResolvedValue(mockShops);
      (mockDb.shop.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/shops');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.shops).toHaveLength(1);
      expect(data.total).toBe(1);
    });

    it('should filter by city', async () => {
      (mockDb.shop.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.shop.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/shops?city=London');
      await GET(request);

      expect(mockDb.shop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: expect.objectContaining({
              contains: 'London',
              mode: 'insensitive',
            }),
          }),
        }),
      );
    });

    it('should search by name, description, city, or address', async () => {
      (mockDb.shop.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.shop.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/shops?search=yarn');
      await GET(request);

      expect(mockDb.shop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('POST /api/shops', () => {
    it('should create shop when authenticated', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
      const mockShop = {
        id: '1',
        name: 'New Shop',
        city: 'London',
        postcode: 'SW1A 1AA',
        latitude: 51.5074,
        longitude: -0.1278,
      };

      (mockDb.shop.create as jest.Mock).mockResolvedValue(mockShop);

      const request = new NextRequest('http://localhost/api/shops', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Shop',
          address: '123 Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          latitude: 51.5074,
          longitude: -0.1278,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should validate UK postcode format', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });

      const request = new NextRequest('http://localhost/api/shops', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Shop',
          address: '123 Street',
          city: 'London',
          postcode: 'INVALID',
          latitude: 51.5074,
          longitude: -0.1278,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should validate latitude and longitude ranges', async () => {
      (mockAuth as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });

      const request = new NextRequest('http://localhost/api/shops', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Shop',
          address: '123 Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          latitude: 100, // Invalid (should be -90 to 90)
          longitude: -0.1278,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });
  });
});
