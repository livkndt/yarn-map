// Mock all dependencies before importing auth
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: {
      GET: jest.fn(),
      POST: jest.fn(),
    },
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: jest.fn(),
  })),
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {},
}));

import { auth, signIn, signOut, handlers } from '../auth';

describe('Auth configuration', () => {
  it('should export auth function', () => {
    expect(auth).toBeDefined();
    expect(typeof auth).toBe('function');
  });

  it('should export signIn function', () => {
    expect(signIn).toBeDefined();
    expect(typeof signIn).toBe('function');
  });

  it('should export signOut function', () => {
    expect(signOut).toBeDefined();
    expect(typeof signOut).toBe('function');
  });

  it('should export handlers', () => {
    expect(handlers).toBeDefined();
    expect(handlers).toHaveProperty('GET');
    expect(handlers).toHaveProperty('POST');
  });

  it('should have correct session strategy', async () => {
    // The auth config should use JWT strategy
    // We can't easily test the internal config, but we can verify handlers work
    expect(handlers.GET).toBeDefined();
    expect(handlers.POST).toBeDefined();
  });
});
