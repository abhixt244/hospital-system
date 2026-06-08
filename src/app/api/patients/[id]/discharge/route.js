import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const patientId = parseInt(id);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { bed: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    if (patient.status === 'DISCHARGED') {
      return NextResponse.json({ error: 'Patient is already discharged' }, { status: 400 });
    }

    const discharged = await prisma.$transaction(async (tx) => {
      if (patient.bedId) {
        await tx.bed.update({
          where: { id: patient.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      const updatedPatient = await tx.patient.update({
        where: { id: patientId },
        data: {
          status: 'DISCHARGED',
          dischargedAt: new Date(),
          bedId: null,
        },
        include: { bed: { include: { ward: true } } },
      });

      await tx.activityLog.create({
        data: {
          action: 'PATIENT_DISCHARGED',
          details: `Patient ${patient.name} has been discharged`,
          entityType: 'PATIENT',
          entityId: patientId,
          userId: parseInt(session.user.id),
        },
      });

      return updatedPatient;
    });

    try {
      const relevantUsers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'DOCTOR'] } },
        select: { id: true },
      });
      if (relevantUsers.length > 0) {
        await prisma.notification.createMany({
          data: relevantUsers.map((user) => ({
            userId: user.id,
            title: 'Patient Discharged',
            message: `${patient.name} has been discharged. ${patient.bedId ? 'Bed is now available.' : ''}`,
            type: 'PATIENT_DISCHARGED',
          })),
        });
      }
    } catch (notifError) {
      console.error('Failed to create discharge notifications:', notifError);
    }

    return NextResponse.json(discharged);
  } catch (error) {
    console.error('Discharge error:', error);
    return NextResponse.json({ error: 'Failed to discharge patient' }, { status: 500 });
  }
}
