import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/beds
 * List beds with optional filters: ward (wardId), status, floor, type.
 * Includes related ward and patient data. Sorted by bedNumber.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ward = searchParams.get('ward');
    const status = searchParams.get('status');
    const floor = searchParams.get('floor');
    const type = searchParams.get('type');

    // Build dynamic where clause from query params
    const where = {};
    if (ward) where.wardId = ward;
    if (status) where.status = status;
    if (type) where.bedType = type;
    if (floor) {
      where.ward = { floor: parseInt(floor, 10) };
    }

    const beds = await prisma.bed.findMany({
      where,
      include: {
        ward: true,
        patient: true,
      },
      orderBy: { bedNumber: 'asc' },
    });

    return NextResponse.json(beds);
  } catch (error) {
    console.error('Beds GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beds' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beds
 * Create a new bed. Admin-only.
 * Body: { wardId, bedNumber, bedType }
 */
export async function POST(request) {
  try {
    // Verify the user is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { wardId, bedNumber, bedType } = body;

    // Validate required fields
    if (!wardId || !bedNumber || !bedType) {
      return NextResponse.json(
        { error: 'Missing required fields: wardId, bedNumber, bedType' },
        { status: 400 }
      );
    }

    // Check for duplicate bed number within the same ward
    const existing = await prisma.bed.findFirst({
      where: { wardId, bedNumber },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Bed number ${bedNumber} already exists in this ward` },
        { status: 409 }
      );
    }

    const bed = await prisma.bed.create({
      data: {
        wardId,
        bedNumber,
        bedType,
        status: 'AVAILABLE',
      },
      include: { ward: true },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'BED_CREATED',
        details: `Bed ${bedNumber} created in ward`,
        entityType: 'BED',
        entityId: bed.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(bed, { status: 201 });
  } catch (error) {
    console.error('Beds POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create bed' },
      { status: 500 }
    );
  }
}
