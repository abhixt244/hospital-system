import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/alerts
 * List alerts with optional resolved filter.
 * Query: resolved ('true' or 'false')
 * Ordered by priority (CRITICAL first) then createdAt desc.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');

    const where = {};
    if (resolved === 'true') where.resolved = true;
    if (resolved === 'false') where.resolved = false;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Alerts GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts
 * Create a new alert.
 * Body: { title, message, priority, wardId?, patientId? }
 * Creates activity log and notifications for all admins and doctors.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, message, priority, wardId, patientId } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message' },
        { status: 400 }
      );
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const alertPriority = priority || 'MEDIUM';
    if (!validPriorities.includes(alertPriority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    const alert = await prisma.alert.create({
      data: {
        title,
        message,
        priority: alertPriority,
        wardId: wardId || null,
        patientId: patientId || null,
        createdBy: parseInt(session.user.id),
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'ALERT_CREATED',
        details: `Alert "${title}" created with ${alertPriority} priority`,
        entityType: 'ALERT',
        entityId: alert.id,
        userId: parseInt(session.user.id),
      },
    });

    // Notify all admins and doctors
    try {
      const recipients = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'DOCTOR'] } },
        select: { id: true },
      });

      if (recipients.length > 0) {
        await prisma.notification.createMany({
          data: recipients.map((user) => ({
            userId: user.id,
            title: `Alert: ${title}`,
            message: message,
            type: 'ALERT',
          })),
        });
      }
    } catch (notifError) {
      console.error('Failed to create alert notifications:', notifError);
    }

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Alerts POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
