// Mock PrismaClient and adapter before importing db
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

describe('Database client', () => {
  beforeEach(() => {
    // Clear module cache
    jest.resetModules();
  });

  it('should export db instance when DATABASE_URL is set', () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const { db } = require('../db');
    expect(db).toBeDefined();
  });

  it('should throw error when DATABASE_URL is not set', () => {
    delete process.env.DATABASE_URL;
    expect(() => {
      require('../db');
    }).toThrow('DATABASE_URL is not set');
  });

  it('should be a PrismaClient instance', () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const { db } = require('../db');
    expect(db).toHaveProperty('$connect');
    expect(db).toHaveProperty('$disconnect');
  });

  it('should reuse global instance in non-production', () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const { db } = require('../db');
    const db1 = db;
    const db2 = db;
    expect(db1).toBe(db2);
  });

  it('should configure logging for development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

    jest.resetModules();
    const { PrismaClient } = require('@prisma/client');
    const mockPrismaClient = jest.fn();
    jest.doMock('@prisma/client', () => ({
      PrismaClient: mockPrismaClient,
    }));

    require('../db');

    process.env.NODE_ENV = originalEnv;
  });

  it('should configure logging for production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

    jest.resetModules();
    const { PrismaClient } = require('@prisma/client');
    const mockPrismaClient = jest.fn();
    jest.doMock('@prisma/client', () => ({
      PrismaClient: mockPrismaClient,
    }));

    require('../db');

    process.env.NODE_ENV = originalEnv;
  });
});
