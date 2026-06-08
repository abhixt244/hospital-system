import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const resourceId = parseInt(id);
    const body = await request.json();
    const { total, available } = body;

    if (available === undefined && total === undefined) {
      return NextResponse.json({ error: 'At least one of total or available must be provided' }, { status: 400 });
    }

    const currentResource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!currentResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const updateData = {};
    if (available !== undefined) updateData.available = parseInt(available, 10);
    if (total !== undefined) updateData.total = parseInt(total, 10);

    const newTotal = updateData.total ?? currentResource.total;
    const newAvailable = updateData.available ?? currentResource.available;
    if (newAvailable > newTotal) {
      return NextResponse.json({ error: 'Available count cannot exceed total count' }, { status: 400 });
    }

    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        action: 'RESOURCE_UPDATED',
        details: `Resource "${currentResource.name}" updated: available ${currentResource.available} → ${updatedResource.available}`,
        entityType: 'RESOURCE',
        entityId: resourceId,
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('Resource PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
