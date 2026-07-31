import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve all purchase records that are NOT yet assigned to a transport truck
    const unassignedPurchases = await db.purchaseRecord.findMany({
      where: {
        transportRecordId: null,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(unassignedPurchases);
  } catch (error) {
    console.error('Error fetching unassigned purchase records:', error);
    return NextResponse.json({ error: 'Failed to fetch unassigned purchase records.' }, { status: 500 });
  }
}
