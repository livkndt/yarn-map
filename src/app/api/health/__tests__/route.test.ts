// Mock Next.js server modules before importing
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: async () => data,
      status: 200,
    })),
  },
}));

import { GET } from '../route';

describe('Health API route', () => {
  it('should return 200 status with ok status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.timestamp).toBe('string');
  });

  it('should return a valid ISO timestamp', async () => {
    const response = await GET();
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });

  it('should return current timestamp', async () => {
    const before = new Date();
    const response = await GET();
    const data = await response.json();
    const after = new Date();

    const timestamp = new Date(data.timestamp);
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
