import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const bedId = parseInt(id);

    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: { ward: true, patient: true },
    });

    if (!bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 });
    }

    return NextResponse.json(bed);
  } catch (error) {
    console.error('Bed GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bed' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bedId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const currentBed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!currentBed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 });
    }

    const updatedBed = await prisma.bed.update({
      where: { id: bedId },
      data: { status },
      include: { ward: true, patient: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'BED_STATUS_UPDATED',
        details: `Bed ${currentBed.bedNumber} status changed from ${currentBed.status} to ${status}`,
        entityType: 'BED',
        entityId: bedId,
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(updatedBed);
  } catch (error) {
    console.error('Bed PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update bed' }, { status: 500 });
  }
}
