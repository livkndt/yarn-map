import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const updateSubmissionSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  rejectionReason: z.string().max(1000).optional(),
});

// PATCH /api/submissions/[id] - Update submission status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateSubmissionSchema.parse(body);

    // Get the submission
    const submission = await db.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      );
    }

    // If approving, create the actual entity
    if (data.status === 'approved' && submission.status === 'pending') {
      if (submission.entityType === 'Event') {
        // Create event from submission
        const event = await db.event.create({
          data: {
            name: submission.name,
            description: submission.description,
            startDate: submission.startDate || new Date(),
            endDate: submission.endDate,
            location: submission.location || 'Unknown',
            address: submission.address,
            latitude: submission.latitude,
            longitude: submission.longitude,
            website: submission.website,
            source: 'user_submission',
          },
        });

        // Update submission with reviewed info
        await db.submission.update({
          where: { id },
          data: {
            status: 'approved',
            reviewedBy: session.user?.id || 'admin',
            reviewedAt: new Date(),
          },
        });

        // Audit logging
        await logAudit({
          action: 'submission.approve',
          userId: session.user?.id,
          resourceId: id,
          metadata: {
            entityType: 'Event',
            createdEventId: event.id,
          },
          ipAddress:
            request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        });

        return NextResponse.json({
          ...submission,
          status: 'approved',
          reviewedBy: session.user?.id || 'admin',
          reviewedAt: new Date(),
          createdEntity: event,
        });
      } else {
        // Create shop from submission
        if (!submission.city || !submission.postcode) {
          return NextResponse.json(
            {
              error: 'Cannot approve shop submission: missing city or postcode',
            },
            { status: 400 },
          );
        }

        const shop = await db.shop.create({
          data: {
            name: submission.name,
            description: submission.description,
            address: submission.address,
            city: submission.city,
            postcode: submission.postcode,
            latitude: submission.latitude,
            longitude: submission.longitude,
            website: submission.website,
            phone: submission.phone,
            source: 'user_submission',
          },
        });

        // Update submission with reviewed info
        await db.submission.update({
          where: { id },
          data: {
            status: 'approved',
            reviewedBy: session.user?.id || 'admin',
            reviewedAt: new Date(),
          },
        });

        // Audit logging
        await logAudit({
          action: 'submission.approve',
          userId: session.user?.id,
          resourceId: id,
          metadata: {
            entityType: 'Shop',
            createdShopId: shop.id,
          },
          ipAddress:
            request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        });

        return NextResponse.json({
          ...submission,
          status: 'approved',
          reviewedBy: session.user?.id || 'admin',
          reviewedAt: new Date(),
          createdEntity: shop,
        });
      }
    }

    // For rejection or other status updates
    const updatedSubmission = await db.submission.update({
      where: { id },
      data: {
        status: data.status,
        rejectionReason: data.rejectionReason || null,
        reviewedBy: session.user?.id || 'admin',
        reviewedAt: new Date(),
      },
    });

    // Audit logging
    await logAudit({
      action: 'submission.update_status',
      userId: session.user?.id,
      resourceId: id,
      metadata: { status: data.status },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    logger.error('Error updating submission', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 },
    );
  }
}
