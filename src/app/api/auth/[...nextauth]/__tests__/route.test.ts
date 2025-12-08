// Mock Next.js server modules before importing
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {},
  NextResponse: class NextResponse {},
}));

// Mock auth handlers
jest.mock('@/lib/auth', () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

import { GET, POST } from '../route';
import { handlers } from '@/lib/auth';

describe('Auth API route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export GET handler', () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe('function');
  });

  it('should export POST handler', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
  });

  it('should call handlers.GET when GET is called', async () => {
    (handlers.GET as jest.Mock).mockResolvedValue(new Response());
    await GET(new Request('http://localhost/api/auth/session'));
    expect(handlers.GET).toHaveBeenCalled();
  });

  it('should call handlers.POST when POST is called', async () => {
    (handlers.POST as jest.Mock).mockResolvedValue(new Response());
    await POST(new Request('http://localhost/api/auth/signin'));
    expect(handlers.POST).toHaveBeenCalled();
  });
});
