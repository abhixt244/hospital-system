import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const patientId = parseInt(id);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { bed: { include: { ward: true } } },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Patient GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const patientId = parseInt(id);
    const body = await request.json();
    const { name, age, contact, diagnosis, priority, doctor, notes } = body;

    const existing = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = parseInt(age, 10);
    if (contact !== undefined) updateData.contact = contact;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (priority !== undefined) updateData.priority = priority;
    if (doctor !== undefined) updateData.doctor = doctor;
    if (notes !== undefined) updateData.notes = notes;

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: updateData,
      include: { bed: { include: { ward: true } } },
    });

    await prisma.activityLog.create({
      data: {
        action: 'PATIENT_UPDATED',
        details: `Patient ${updatedPatient.name} information updated`,
        entityType: 'PATIENT',
        entityId: patientId,
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error('Patient PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
