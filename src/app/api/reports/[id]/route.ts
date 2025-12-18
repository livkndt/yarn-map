import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const updateReportSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved']),
});

// PATCH /api/reports/[id] - Update report status (admin only)
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
    const data = updateReportSchema.parse(body);

    const report = await db.report.update({
      where: { id },
      data: {
        status: data.status,
      },
    });

    // Audit logging
    await logAudit({
      action: 'report.update_status',
      userId: session.user?.id,
      resourceId: id,
      metadata: { status: data.status },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 },
    );
  }
}
