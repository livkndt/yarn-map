import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createEventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    })
    .optional()
    .nullable(),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  region: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  website: z
    .union([z.string().url('Invalid website URL'), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? null : val))
    .nullable(),
  source: z.string().optional().nullable(),
});

// GET /api/events - List all events with filters
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `events:list:${ip}`;
    const rateLimit = await checkRateLimit(identifier, 'default'); // 100 requests per hour

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const upcoming = searchParams.get('upcoming') === 'true';
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Debug logging (only in development or when DEBUG env var is set)
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      logger.info('Events API request', {
        upcoming,
        location,
        search,
        limit,
        offset,
        startDate,
        endDate,
      });
    }

    const where: any = {};

    if (upcoming) {
      where.startDate = {
        gte: new Date(),
      };
    }

    if (location) {
      // Check if it's a known region name
      const knownRegions = [
        'London',
        'Scotland',
        'Northern Ireland',
        'Wales',
        'North',
        'Midlands',
        'South',
      ];

      if (knownRegions.includes(location)) {
        // Filter by region field from database
        where.region = location;
        // Always log in production to help debug filtering issues
        logger.info('Filtering by region', {
          region: location,
          whereClause: JSON.stringify(where),
        });
      } else {
        // If it's not a region, filter by location (city name)
        where.location = {
          contains: location,
          mode: 'insensitive',
        };
        logger.info('Filtering by location (city)', {
          location,
          whereClause: JSON.stringify(where),
        });
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate) {
      where.startDate = {
        ...where.startDate,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.endDate = {
        lte: new Date(endDate),
      };
    }

    // Always log in production to help debug filtering issues
    logger.info('Database query', {
      where: JSON.stringify(where),
      limit,
      offset,
    });

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        take: limit,
        skip: offset,
      }),
      db.event.count({ where }),
    ]);

    // Always log results in production to help debug
    logger.info('Database query results', {
      eventsCount: events.length,
      total,
      eventRegions: events.map((e) => e.region),
      eventIds: events.map((e) => e.id),
    });

    // Ensure dates are properly serialized as ISO strings
    const serializedEvents = events.map((event) => {
      const serialized: any = { ...event };

      if (event.startDate) {
        serialized.startDate =
          event.startDate instanceof Date
            ? event.startDate.toISOString()
            : event.startDate;
      }

      if (event.endDate !== undefined && event.endDate !== null) {
        serialized.endDate =
          event.endDate instanceof Date
            ? event.endDate.toISOString()
            : event.endDate;
      } else {
        serialized.endDate = null;
      }

      if (event.createdAt) {
        serialized.createdAt =
          event.createdAt instanceof Date
            ? event.createdAt.toISOString()
            : event.createdAt;
      }

      if (event.updatedAt) {
        serialized.updatedAt =
          event.updatedAt instanceof Date
            ? event.updatedAt.toISOString()
            : event.updatedAt;
      }

      return serialized;
    });

    const response = NextResponse.json({
      events: serializedEvents,
      total,
      limit,
      offset,
    });

    // Disable all caching for now - we can add it back later when needed
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    logger.error('Error fetching events', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 },
    );
  }
}

// POST /api/events - Create event (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for admin actions - use user ID instead of IP for better limits
    const userId = session.user?.id || 'unknown';
    const identifier = `admin:event:create:${userId}`;
    const rateLimit = await checkRateLimit(identifier, 'admin');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const data = createEventSchema.parse(body);

    const event = await db.event.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location,
        address: data.address,
        region: data.region || null,
        latitude: data.latitude,
        longitude: data.longitude,
        website: data.website || null,
        source: data.source,
      },
    });

    // Audit logging
    await logAudit({
      action: 'event.create',
      userId: session.user?.id,
      resourceId: event.id,
      metadata: { name: event.name },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Event validation error', { errors: error.errors });
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }
    logger.error('Error creating event', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 },
    );
  }
}
