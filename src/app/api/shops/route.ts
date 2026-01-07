import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createShopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z
    .string()
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      'Invalid UK postcode format',
    ),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().optional(),
});

// GET /api/shops - List all shops with filters
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `shops:list:${ip}`;
    const rateLimit = await checkRateLimit(identifier, 'default'); // 100 requests per hour

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = {};

    // Filter by region if provided (takes precedence over city)
    if (region && region !== 'All Regions') {
      where.region = region;
    } else if (city && city !== 'All Regions') {
      // Fall back to city filtering if region not provided
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [shops, total] = await Promise.all([
      db.shop.findMany({
        where,
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      db.shop.count({ where }),
    ]);

    const response = NextResponse.json({
      shops,
      total,
      limit,
      offset,
    });

    // Disable caching when filters are present to avoid stale filtered results
    // Only cache when no filters are applied (default list view)
    const hasFilters = city || region || search;

    if (hasFilters) {
      // No caching for filtered queries to ensure fresh results
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate',
      );
      // Ensure different query params get different cache entries
      response.headers.set('Vary', 'Accept, Accept-Encoding');
    } else {
      // Light caching for unfiltered default queries
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=30',
      );
      response.headers.set('Vary', 'Accept, Accept-Encoding');
    }

    return response;
  } catch (error) {
    logger.error('Error fetching shops', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 },
    );
  }
}

// POST /api/shops - Create shop (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for admin actions
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `admin:shop:create:${ip}`;
    const rateLimit = await checkRateLimit(identifier, 'veryStrict');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const data = createShopSchema.parse(body);

    const shop = await db.shop.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        postcode: data.postcode.toUpperCase(),
        latitude: data.latitude,
        longitude: data.longitude,
        website: data.website || null,
        phone: data.phone,
        source: data.source,
      },
    });

    // Audit logging
    await logAudit({
      action: 'shop.create',
      userId: session.user?.id,
      resourceId: shop.id,
      metadata: { name: shop.name },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    logger.error('Error creating shop', error);
    return NextResponse.json(
      { error: 'Failed to create shop' },
      { status: 500 },
    );
  }
}
