import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/dashboard
 * Returns aggregate statistics for the hospital dashboard:
 * - Bed counts by status
 * - Patient counts (admitted, critical)
 * - Resource totals
 * - Occupancy rate
 * - Per-ward breakdowns
 * - Recent activity log
 */
export async function GET() {
  try {
    // Run all aggregate queries in parallel for performance
    const [
      totalBeds,
      availableBeds,
      occupiedBeds,
      maintenanceBeds,
      totalPatients,
      criticalPatients,
      resourceAggregates,
      wardStats,
      recentActivity,
    ] = await Promise.all([
      // Total bed count
      prisma.bed.count(),

      // Available beds
      prisma.bed.count({ where: { status: 'AVAILABLE' } }),

      // Occupied beds
      prisma.bed.count({ where: { status: 'OCCUPIED' } }),

      // Maintenance beds
      prisma.bed.count({ where: { status: 'MAINTENANCE' } }),

      // Total admitted patients
      prisma.patient.count({ where: { status: 'ADMITTED' } }),

      // Critical admitted patients
      prisma.patient.count({
        where: { priority: 'CRITICAL', status: 'ADMITTED' },
      }),

      // Resource aggregates (total and available sums)
      prisma.resource.aggregate({
        _sum: {
          total: true,
          available: true,
        },
      }),

      // Ward-level bed stats grouped by ward and status
      prisma.ward.findMany({
        include: {
          beds: {
            select: { status: true },
          },
        },
      }),

      // Last 10 activity log entries
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate occupancy rate
    const occupancyRate =
      totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0.0';

    // Transform ward data into per-ward bed status counts
    const formattedWardStats = wardStats.map((ward) => {
      const statusCounts = { AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0, RESERVED: 0 };
      ward.beds.forEach((bed) => {
        statusCounts[bed.status] = (statusCounts[bed.status] || 0) + 1;
      });
      return {
        id: ward.id,
        name: ward.name,
        floor: ward.floor,
        totalBeds: ward.beds.length,
        ...statusCounts,
      };
    });

    return NextResponse.json({
      totalBeds,
      availableBeds,
      occupiedBeds,
      maintenanceBeds,
      totalPatients,
      criticalPatients,
      totalResources: resourceAggregates._sum.total || 0,
      availableResources: resourceAggregates._sum.available || 0,
      occupancyRate: parseFloat(occupancyRate),
      wardStats: formattedWardStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
