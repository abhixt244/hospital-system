import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/patients
 * List patients with optional filters and pagination.
 * Query: search (name), status, priority, page (default 1), limit (default 20)
 * Returns: { patients, total, page, totalPages }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Build dynamic filter
    const where = {};
    if (search) {
      where.name = { contains: search };
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Fetch patients and total count in parallel
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          bed: {
            include: { ward: true },
          },
        },
        orderBy: { admittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    return NextResponse.json({
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Patients GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * Admit a new patient.
 * Body: { name, age, gender, contact, diagnosis, bedId, priority, doctor, notes }
 * If bedId is provided, marks that bed as OCCUPIED.
 * Creates activity log and notifications.
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
    const { name, age, gender, contact, diagnosis, bedId, priority, doctor, notes } = body;

    // Validate required fields
    if (!name || !age || !gender || !diagnosis) {
      return NextResponse.json(
        { error: 'Missing required fields: name, age, gender, diagnosis' },
        { status: 400 }
      );
    }

    // If a bed is specified, verify it's available
    if (bedId) {
      const bed = await prisma.bed.findUnique({ where: { id: parseInt(bedId) } });
      if (!bed) {
        return NextResponse.json(
          { error: 'Specified bed not found' },
          { status: 404 }
        );
      }
      if (bed.status !== 'AVAILABLE') {
        return NextResponse.json(
          { error: 'Specified bed is not available' },
          { status: 409 }
        );
      }
    }

    // Use a transaction to ensure atomicity
    const patient = await prisma.$transaction(async (tx) => {
      // Create the patient record
      const newPatient = await tx.patient.create({
        data: {
          name,
          age: parseInt(age, 10),
          gender,
          contact: contact || null,
          diagnosis,
          bedId: bedId ? parseInt(bedId) : null,
          priority: priority || 'MEDIUM',
          doctor: doctor || null,
          notes: notes || null,
          status: 'ADMITTED',
        },
        include: {
          bed: { include: { ward: true } },
        },
      });

      // Mark the assigned bed as occupied
      if (bedId) {
        await tx.bed.update({
          where: { id: parseInt(bedId) },
          data: { status: 'OCCUPIED' },
        });
      }

      // Log the admission activity
      await tx.activityLog.create({
        data: {
          action: 'PATIENT_ADMITTED',
          details: `Patient ${name} admitted${bedId ? ` and assigned to bed` : ''}`,
          entityType: 'PATIENT',
          entityId: newPatient.id,
          userId: parseInt(session.user.id),
        },
      });

      return newPatient;
    });

    // Create notifications for admins and doctors (outside transaction for non-critical path)
    try {
      const relevantUsers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'DOCTOR'] } },
        select: { id: true },
      });

      if (relevantUsers.length > 0) {
        await prisma.notification.createMany({
          data: relevantUsers.map((user) => ({
            userId: user.id,
            title: 'New Patient Admitted',
            message: `${name} has been admitted${priority === 'CRITICAL' ? ' (CRITICAL priority)' : ''}.`,
            type: 'PATIENT_ADMITTED',
          })),
        });
      }
    } catch (notifError) {
      // Notification failures should not break the response
      console.error('Failed to create notifications:', notifError);
    }

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Patients POST error:', error);
    return NextResponse.json(
      { error: 'Failed to admit patient' },
      { status: 500 }
    );
  }
}
