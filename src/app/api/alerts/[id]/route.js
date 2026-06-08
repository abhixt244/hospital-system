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
    const alertId = parseInt(id);

    const existing = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    if (existing.resolved) {
      return NextResponse.json({ error: 'Alert is already resolved' }, { status: 400 });
    }

    const resolvedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: parseInt(session.user.id),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'ALERT_RESOLVED',
        details: `Alert "${existing.title}" resolved`,
        entityType: 'ALERT',
        entityId: alertId,
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(resolvedAlert);
  } catch (error) {
    console.error('Alert PATCH error:', error);
    return NextResponse.json({ error: 'Failed to resolve alert' }, { status: 500 });
  }
}
