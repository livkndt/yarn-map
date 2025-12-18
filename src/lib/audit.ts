import { db } from './db';
import { logger } from './logger';

export interface AuditOptions {
  action: string;
  userId?: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
}

/**
 * Log admin actions to the database for auditing purposes.
 */
export async function logAudit(options: AuditOptions) {
  try {
    await db.auditLog.create({
      data: {
        action: options.action,
        userId: options.userId,
        resourceId: options.resourceId,
        metadata: options.metadata || {},
        ipAddress: options.ipAddress,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    // Fail gracefully but log the error
    logger.error('Failed to create audit log', error);
  }
}
