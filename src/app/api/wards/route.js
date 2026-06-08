import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/wards
 * List all wards with bed counts grouped by status.
 * Each ward includes: totalBeds, available, occupied, maintenance, reserved counts.
 */
export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          select: { status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform the raw bed arrays into aggregated counts
    const wardsWithStats = wards.map((ward) => {
      const statusCounts = {
        AVAILABLE: 0,
        OCCUPIED: 0,
        MAINTENANCE: 0,
        RESERVED: 0,
      };

      ward.beds.forEach((bed) => {
        statusCounts[bed.status] = (statusCounts[bed.status] || 0) + 1;
      });

      // Destructure beds out so we don't send the raw array
      const { beds, ...wardData } = ward;

      return {
        ...wardData,
        totalBeds: beds.length,
        availableBeds: statusCounts.AVAILABLE,
        occupiedBeds: statusCounts.OCCUPIED,
        maintenanceBeds: statusCounts.MAINTENANCE,
        reservedBeds: statusCounts.RESERVED,
      };
    });

    return NextResponse.json(wardsWithStats);
  } catch (error) {
    console.error('Wards GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wards' },
      { status: 500 }
    );
  }
}
