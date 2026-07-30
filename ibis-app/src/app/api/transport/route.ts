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

    const transports = await db.transportRecord.findMany({
      include: {
        purchases: {
          include: {
            items: true,
          },
        },
        lots: true,
        intake: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(transports);
  } catch (error) {
    console.error('Error fetching transport records:', error);
    return NextResponse.json({ error: 'Failed to fetch transport records.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      driverName,
      plateNumber,
      mobileNumber,
      loadingLocation,
      destinationWarehouse,
      notes,
      truckCleaned,
      selectedPurchaseIds, // Array of purchase IDs assigned to this truck
    } = body;

    if (!driverName || !plateNumber) {
      return NextResponse.json({ error: 'Driver name and plate number are required.' }, { status: 400 });
    }

    if (!selectedPurchaseIds || !Array.isArray(selectedPurchaseIds) || selectedPurchaseIds.length === 0) {
      return NextResponse.json({ error: 'Please select at least one purchase record to assign to this truck.' }, { status: 400 });
    }

    // Fetch details of selected purchase records
    const purchasesToAssign = await db.purchaseRecord.findMany({
      where: {
        id: { in: selectedPurchaseIds },
      },
      include: {
        items: true,
      },
    });

    if (purchasesToAssign.length === 0) {
      return NextResponse.json({ error: 'Selected purchase records were not found.' }, { status: 404 });
    }

    // Calculate totals
    const totalSacks = purchasesToAssign.reduce((sum, p) => sum + (p.items?.[0]?.sacks || 0), 0);
    const totalFieldWeight = purchasesToAssign.reduce((sum, p) => sum + p.totalWeight, 0);

    // Create Transport Record
    const transport = await db.transportRecord.create({
      data: {
        driverName,
        plateNumber,
        mobileNumber: mobileNumber || null,
        truckCleaned: truckCleaned ?? true,
        loadingLocation: loadingLocation || 'Chhaeb Buying Station',
        destinationWarehouse: destinationWarehouse || 'Central Mill Warehouse, Preah Vihear',
        notes: notes || null,
        totalSacks,
        totalFieldWeight,
        fieldStaffName: session.user?.name || 'Field Inspector',
        fieldStaffDate: new Date().toISOString().split('T')[0],
        fieldStaffTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'EN_ROUTE',
        createdBy: userId,
        lots: {
          create: purchasesToAssign.map((p) => ({
            variety: p.items?.[0]?.variety || 'Red Jasmine',
            familyCode: p.familyCode,
            farmerName: p.farmerName,
            village: p.village,
            sacks: p.items?.[0]?.sacks || 0,
            weight: p.totalWeight,
            purchaseRecordId: p.id,
          })),
        },
      },
    });

    // 6. LINK ALL SELECTED PURCHASE RECORDS & MARK AS "IN_TRANSIT"
    await db.purchaseRecord.updateMany({
      where: {
        id: { in: selectedPurchaseIds },
      },
      data: {
        transportRecordId: transport.id,
        status: 'IN_TRANSIT',
      },
    });

    // Security Audit Log
    await db.auditLog.create({
      data: {
        userId,
        userName: session.user?.name || 'Field Staff',
        userRole: (session.user as { role?: any })?.role || 'FIELD',
        action: 'CREATE',
        entityType: 'TransportRecord',
        entityId: transport.id,
        details: JSON.stringify({
          driverName,
          plateNumber,
          totalSacks,
          totalFieldWeight,
          purchaseCount: purchasesToAssign.length,
        }),
      },
    });

    return NextResponse.json(transport, { status: 201 });
  } catch (error) {
    console.error('Error creating transport record:', error);
    return NextResponse.json({ error: 'Failed to create transport record.' }, { status: 500 });
  }
}
