import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateShopSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  postcode: z
    .string()
    .regex(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i)
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

// GET /api/shops/[id] - Single shop details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const shop = await db.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop' },
      { status: 500 },
    );
  }
}

// PATCH /api/shops/[id] - Update shop (admin only)
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
    const data = updateShopSchema.parse(body);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.postcode !== undefined)
      updateData.postcode = data.postcode.toUpperCase();
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.website !== undefined) updateData.website = data.website || null;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.source !== undefined) updateData.source = data.source;

    const shop = await db.shop.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(shop);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Failed to update shop' },
      { status: 500 },
    );
  }
}

// DELETE /api/shops/[id] - Delete shop (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.shop.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { error: 'Failed to delete shop' },
      { status: 500 },
    );
  }
}
