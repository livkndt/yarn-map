import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
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
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reporterEmail: z.string().email().optional().or(z.literal('')),
  honeypot: z.string().optional(), // Spam prevention
});

// POST /api/reports - Submit a report (rate limited)
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `report:${ip}`;

    const rateLimit = await checkRateLimit(identifier);
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

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    console.error('Error creating report:', error);
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
