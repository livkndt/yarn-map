import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  region: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  source: z.string().optional().nullable(),
});

// GET /api/events/[id] - Single event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `events:detail:${ip}`;
    const rateLimit = await checkRateLimit(identifier, 'default'); // 100 requests per hour

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const { id } = await params;
    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const response = NextResponse.json(event);

    // Reduced cache time to ensure fresh data, but still allow bfcache
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=30',
    );

    return response;
  } catch (error) {
    logger.error('Error fetching event', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 },
    );
  }
}

// PATCH /api/events/[id] - Update event (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for admin actions
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `admin:event:update:${ip}`;
    const rateLimit = await checkRateLimit(identifier, 'veryStrict');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateEventSchema.parse(body);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.startDate !== undefined)
      updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined)
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.region !== undefined) updateData.region = data.region || null;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.website !== undefined) updateData.website = data.website || null;
    if (data.source !== undefined) updateData.source = data.source;

    const event = await db.event.update({
      where: { id },
      data: updateData,
    });

    // Audit logging
    await logAudit({
      action: 'event.update',
      userId: session.user?.id,
      resourceId: event.id,
      metadata: { name: event.name },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    logger.error('Error updating event', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 },
    );
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for admin actions
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const identifier = `admin:event:delete:${ip}`;
    const rateLimit = await checkRateLimit(identifier, 'veryStrict');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const { id } = await params;
    await db.event.delete({
      where: { id },
    });

    // Audit logging
    await logAudit({
      action: 'event.delete',
      userId: session.user?.id,
      resourceId: id,
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting event', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 },
    );
  }
}
