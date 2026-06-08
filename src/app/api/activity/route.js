import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/activity
 * List recent activity log entries.
 * Query: limit (default 20, max 100)
 * Ordered by createdAt desc.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    );

    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Activity GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }
}
