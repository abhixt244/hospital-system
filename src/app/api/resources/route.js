import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/resources
 * List all resources, optionally filtered by category.
 * Query: category (string)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = {};
    if (category) where.category = category;

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Resources GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
