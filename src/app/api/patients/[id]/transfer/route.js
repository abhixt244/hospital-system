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
    const body = await request.json();
    const { newBedId } = body;

    if (!newBedId) {
      return NextResponse.json({ error: 'Missing required field: newBedId' }, { status: 400 });
    }

    const parsedNewBedId = parseInt(newBedId);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { bed: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    if (patient.status !== 'ADMITTED') {
      return NextResponse.json({ error: 'Only admitted patients can be transferred' }, { status: 400 });
    }

    const newBed = await prisma.bed.findUnique({
      where: { id: parsedNewBedId },
      include: { ward: true },
    });

    if (!newBed) {
      return NextResponse.json({ error: 'Destination bed not found' }, { status: 404 });
    }
    if (newBed.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Destination bed is not available' }, { status: 409 });
    }

    const transferred = await prisma.$transaction(async (tx) => {
      if (patient.bedId) {
        await tx.bed.update({
          where: { id: patient.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      await tx.bed.update({
        where: { id: parsedNewBedId },
        data: { status: 'OCCUPIED' },
      });

      const updatedPatient = await tx.patient.update({
        where: { id: patientId },
        data: { bedId: parsedNewBedId },
        include: { bed: { include: { ward: true } } },
      });

      await tx.activityLog.create({
        data: {
          action: 'PATIENT_TRANSFERRED',
          details: `Patient ${patient.name} transferred to bed ${newBed.bedNumber} in ${newBed.ward.name}`,
          entityType: 'PATIENT',
          entityId: patientId,
          userId: parseInt(session.user.id),
        },
      });

      return updatedPatient;
    });

    return NextResponse.json(transferred);
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: 'Failed to transfer patient' }, { status: 500 });
  }
}
