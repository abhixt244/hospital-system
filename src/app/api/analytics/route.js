import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics
 * Returns analytics data for charts and dashboards.
 * Query: range ('7d', '30d', '90d') – defaults to '7d'
 *
 * Returns:
 * - admissionsByDay: daily admission counts
 * - dischargesByDay: daily discharge counts
 * - occupancyByWard: per-ward occupancy percentages
 * - priorityBreakdown: admitted patient counts per priority
 * - bedTypeUtilization: occupied vs total per bed type
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Determine the start date from the range
    const rangeMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = rangeMap[range] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Run all queries in parallel
    const [
      admissionsRaw,
      dischargesRaw,
      wards,
      priorityRaw,
      bedTypeRaw,
    ] = await Promise.all([
      // Admissions grouped by day using raw SQL (MySQL DATE function)
      prisma.$queryRaw`
        SELECT DATE(admittedAt) as date, COUNT(*) as count
        FROM Patient
        WHERE admittedAt >= ${startDate}
        GROUP BY DATE(admittedAt)
        ORDER BY date ASC
      `,

      // Discharges grouped by day
      prisma.$queryRaw`
        SELECT DATE(dischargedAt) as date, COUNT(*) as count
        FROM Patient
        WHERE dischargedAt >= ${startDate}
          AND dischargedAt IS NOT NULL
        GROUP BY DATE(dischargedAt)
        ORDER BY date ASC
      `,

      // Ward data with bed statuses for occupancy calculation
      prisma.ward.findMany({
        include: {
          beds: {
            select: { status: true },
          },
        },
      }),

      // Priority breakdown for admitted patients
      prisma.patient.groupBy({
        by: ['priority'],
        where: { status: 'ADMITTED' },
        _count: { id: true },
      }),

      // Bed type utilization
      prisma.bed.groupBy({
        by: ['bedType', 'status'],
        _count: { id: true },
      }),
    ]);

    // ─── Format admissions by day ───────────────────────────────────
    // Fill in missing days with 0 counts for a complete time series
    const admissionsByDay = fillDateSeries(admissionsRaw, days);

    // ─── Format discharges by day ───────────────────────────────────
    const dischargesByDay = fillDateSeries(dischargesRaw, days);

    // ─── Occupancy by ward ──────────────────────────────────────────
    const occupancyByWard = wards.map((ward) => {
      const totalBeds = ward.beds.length;
      const occupiedBeds = ward.beds.filter((b) => b.status === 'OCCUPIED').length;
      return {
        ward: ward.name,
        wardId: ward.id,
        totalBeds,
        occupiedBeds,
        occupancyRate: totalBeds > 0
          ? parseFloat(((occupiedBeds / totalBeds) * 100).toFixed(1))
          : 0,
      };
    });

    // ─── Priority breakdown ─────────────────────────────────────────
    const priorityOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const priorityBreakdown = priorityOrder.map((level) => {
      const match = priorityRaw.find((p) => p.priority === level);
      return {
        priority: level,
        count: match ? match._count.id : 0,
      };
    });

    // ─── Bed type utilization ───────────────────────────────────────
    // Pivot the grouped data into { type, occupied, total } objects
    const bedTypeMap = {};
    bedTypeRaw.forEach(({ bedType, status, _count }) => {
      if (!bedTypeMap[bedType]) {
        bedTypeMap[bedType] = { type: bedType, occupied: 0, total: 0 };
      }
      bedTypeMap[bedType].total += _count.id;
      if (status === 'OCCUPIED') {
        bedTypeMap[bedType].occupied += _count.id;
      }
    });
    const bedTypeUtilization = Object.values(bedTypeMap);

    return NextResponse.json({
      admissionsByDay,
      dischargesByDay,
      occupancyByWard,
      priorityBreakdown,
      bedTypeUtilization,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

/**
 * Fills in a complete date series from the raw SQL results,
 * inserting 0 for any day that has no data. This makes the
 * output ready for Chart.js without client-side gap-filling.
 */
function fillDateSeries(rawData, days) {
  // Create a map from date string → count
  const dataMap = {};
  rawData.forEach((row) => {
    // row.date may be a Date object or string depending on the driver
    const dateStr =
      row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date).split('T')[0];
    dataMap[dateStr] = Number(row.count);
  });

  // Generate the full series
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    series.push({
      date: key,
      count: dataMap[key] || 0,
    });
  }

  return series;
}
