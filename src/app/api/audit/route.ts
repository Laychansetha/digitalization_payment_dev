import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const logs = await db.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs.' }, { status: 500 });
  }
}
