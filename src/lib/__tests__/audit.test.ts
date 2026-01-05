import { logAudit } from '../audit';
import { db } from '../db';
import { logger } from '../logger';

jest.mock('../db', () => ({
  db: {
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Audit Logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an audit log entry', async () => {
    const auditData = {
      action: 'test.action',
      userId: 'user-123',
      resourceId: 'resource-456',
      metadata: { key: 'value' },
      ipAddress: '127.0.0.1',
    };

    (db.auditLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });

    await logAudit(auditData);

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'test.action',
        userId: 'user-123',
        resourceId: 'resource-456',
        metadata: { key: 'value' },
        ipAddress: '127.0.0.1',
        timestamp: expect.any(Date),
      },
    });
    expect(logger.info).toHaveBeenCalled();
    const infoCall = logger.info as jest.Mock;
    expect(infoCall.mock.calls[0][0]).toBe('Audit log recorded');
    expect(infoCall.mock.calls[0][1]).toMatchObject({
      action: 'test.action',
      userId: 'user-123',
    });
  });

  it('should handle errors gracefully', async () => {
    const auditData = { action: 'test.error' };
    const error = new Error('DB Error');
    (db.auditLog.create as jest.Mock).mockRejectedValue(error);

    await logAudit(auditData);

    expect(db.auditLog.create).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
    const errorCall = logger.error as jest.Mock;
    expect(errorCall.mock.calls[0][0]).toBe('Failed to record audit log');
  });
});
