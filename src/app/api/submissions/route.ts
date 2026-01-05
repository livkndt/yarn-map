import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const eventSubmissionSchema = z.object({
  entityType: z.literal('Event'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().min(1, 'Location is required').max(200),
  address: z.string().min(1, 'Address is required').max(500),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  submitterEmail: z.string().email().optional().or(z.literal('')),
  submitterName: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  honeypot: z.string().optional(),
});

const shopSubmissionSchema = z.object({
  entityType: z.literal('Shop'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  postcode: z
    .string()
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      'Invalid UK postcode format',
    ),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  submitterEmail: z.string().email().optional().or(z.literal('')),
  submitterName: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  honeypot: z.string().optional(),
});

const submissionSchema = z.discriminatedUnion('entityType', [
  eventSubmissionSchema,
  shopSubmissionSchema,
]);

// POST /api/submissions - Submit a new event or shop
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `submission:${ip}`;

    // Use strict rate limiting (5 per hour)
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

    const data = submissionSchema.parse(body);

    // Check for duplicate submissions: same name + address + same IP within last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Find recent submissions with the same name and address
    const recentSubmissions = await db.submission.findMany({
      where: {
        entityType: data.entityType,
        name: data.name,
        address: data.address,
        createdAt: {
          gte: oneDayAgo,
        },
      },
      select: {
        id: true,
      },
    });

    // Check if any of these submissions were created by the same IP
    if (recentSubmissions.length > 0) {
      const submissionIds = recentSubmissions.map((s) => s.id);
      const duplicateAuditLog = await db.auditLog.findFirst({
        where: {
          action: 'submission.create',
          resourceId: {
            in: submissionIds,
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
              'You have already submitted this item recently. Please wait before submitting again.',
          },
          { status: 429 },
        );
      }
    }

    // Prepare submission data
    const submissionData: any = {
      entityType: data.entityType,
      name: data.name,
      description: data.description || null,
      address: data.address,
      submitterEmail: data.submitterEmail || null,
      submitterName: data.submitterName || null,
      notes: data.notes || null,
      status: 'pending',
    };

    if (data.entityType === 'Event') {
      submissionData.startDate = data.startDate
        ? new Date(data.startDate)
        : null;
      submissionData.endDate = data.endDate ? new Date(data.endDate) : null;
      submissionData.location = data.location;
      submissionData.latitude = data.latitude
        ? parseFloat(data.latitude)
        : null;
      submissionData.longitude = data.longitude
        ? parseFloat(data.longitude)
        : null;
      submissionData.website = data.website || null;
    } else {
      // Shop
      submissionData.city = data.city;
      submissionData.postcode = data.postcode;
      submissionData.latitude = data.latitude
        ? parseFloat(data.latitude)
        : null;
      submissionData.longitude = data.longitude
        ? parseFloat(data.longitude)
        : null;
      submissionData.website = data.website || null;
      submissionData.phone = data.phone || null;
    }

    const submission = await db.submission.create({
      data: submissionData,
    });

    // Audit logging
    await logAudit({
      action: 'submission.create',
      resourceId: submission.id,
      metadata: { entityType: submission.entityType },
      ipAddress: ip,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in submission', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    logger.error('Error creating submission', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: 'Failed to submit. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// GET /api/submissions - List all submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `submissions:list:${ip}`;
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

    const [submissions, total] = await Promise.all([
      db.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.submission.count({ where }),
    ]);

    return NextResponse.json({
      submissions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error fetching submissions', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 },
    );
  }
}
