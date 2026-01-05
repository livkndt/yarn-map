import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createReportSchema = z.object({
  entityType: z.enum(['Event', 'Shop']),
  entityId: z.string().min(1),
  issueType: z.enum([
    'Incorrect information',
    'Event/shop no longer exists',
    'Duplicate entry',
    'Spam',
    'Other',
  ]),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  reporterEmail: z.string().email().nullable().optional().or(z.literal('')),
  honeypot: z.string().optional(), // Spam prevention
});

// POST /api/reports - Submit a report (rate limited)
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `report:${ip}`;

    // Use stricter rate limiting for reports (5 per hour instead of 100)
    const rateLimit = await checkRateLimit(identifier, 'strict');
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          reset: rateLimit.reset,
        },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Check honeypot field (should be empty for real users)
    if (body.honeypot && body.honeypot !== '') {
      // Silently reject spam
      return NextResponse.json({ success: true });
    }

    const data = createReportSchema.parse(body);

    // Verify that the entity exists
    const entityExists =
      data.entityType === 'Event'
        ? await db.event.findUnique({ where: { id: data.entityId } })
        : await db.shop.findUnique({ where: { id: data.entityId } });

    if (!entityExists) {
      return NextResponse.json(
        { error: 'The entity you are trying to report does not exist.' },
        { status: 404 },
      );
    }

    // Check for duplicate reports: same entity + same IP within last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Find all recent reports for this entity
    const recentReports = await db.report.findMany({
      where: {
        entityType: data.entityType,
        entityId: data.entityId,
        createdAt: {
          gte: oneDayAgo,
        },
      },
      select: {
        id: true,
      },
    });

    // Check if any of these reports were created by the same IP
    if (recentReports.length > 0) {
      const reportIds = recentReports.map((r) => r.id);
      const duplicateAuditLog = await db.auditLog.findFirst({
        where: {
          action: 'report.create',
          resourceId: {
            in: reportIds,
          },
          ipAddress: ip,
          timestamp: {
            gte: oneDayAgo,
          },
        },
      });

      if (duplicateAuditLog) {
        return NextResponse.json(
          {
            error:
              'You have already reported this item recently. Please wait before submitting another report.',
          },
          { status: 429 },
        );
      }
    }

    const report = await db.report.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        issueType: data.issueType,
        description: data.description,
        reporterEmail: data.reporterEmail || null,
        status: 'pending',
      },
    });

    // Audit logging
    await logAudit({
      action: 'report.create',
      resourceId: report.id,
      metadata: { entityType: report.entityType },
      ipAddress: ip,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    logger.error('Error creating report', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 },
    );
  }
}

// GET /api/reports - List all reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `reports:list:${ip}`;
    const rateLimit = await checkRateLimit(identifier, 'default');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const entityType = searchParams.get('entityType');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 },
    );
  }
}
