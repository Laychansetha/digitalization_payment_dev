import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await db.purchaseRecord.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Purchase record not found.' }, { status: 404 });
    }

    // Locking check: Only allow editing if status is PENDING and not assigned to transport
    if (existing.status !== 'PENDING' || existing.transportRecordId) {
      return NextResponse.json(
        { error: 'Cannot edit purchase record. This record has already been assigned to transport or dispatched.' },
        { status: 400 }
      );
    }

    const {
      familyCode,
      farmerName,
      village,
      seedBorrowed,
      seedDeduction,
      signatureFarmer,
      signatureStaff,
      specsRecordId,
      items,
    } = body;

    const item = items?.[0] || {};
    const sacksCount = item.sacks || 0;
    const totalWeightKg = item.quantity || 0;
    const totalPaddyValue = item.totalValue || 0;
    const seedDeductionVal = seedDeduction || 0;
    const netPaymentToFarmer = Math.max(0, totalPaddyValue - seedDeductionVal);

    // Update Purchase Record
    const updatedRecord = await db.purchaseRecord.update({
      where: { id },
      data: {
        familyCode: (familyCode || existing.familyCode).toUpperCase().trim(),
        farmerName: (farmerName || existing.farmerName).trim(),
        village: village || existing.village,
        totalWeight: totalWeightKg,
        totalPayment: totalPaddyValue,
        seedBorrowed: parseFloat(seedBorrowed) || 0,
        seedDeduction: seedDeductionVal,
        netPayment: netPaymentToFarmer,
        signatureFarmer: signatureFarmer || existing.signatureFarmer,
        signatureStaff: signatureStaff || existing.signatureStaff,
        specsRecordId: specsRecordId || existing.specsRecordId,
      },
    });

    // Update or Create Item
    if (existing.items && existing.items.length > 0) {
      await db.purchaseItem.update({
        where: { id: existing.items[0].id },
        data: {
          variety: item.variety || 'Red Jasmine',
          grade: item.grade || 'A1',
          standardPrice: item.standardPrice || 1997.5,
          additionalPrice: item.additionalPrice || 0,
          finalPrice: item.finalPrice || 1997.5,
          sacks: sacksCount,
          quantity: totalWeightKg,
          totalValue: totalPaddyValue,
          sackWeights: JSON.stringify(item.sackWeights || []),
        },
      });
    } else {
      await db.purchaseItem.create({
        data: {
          purchaseId: id,
          variety: item.variety || 'Red Jasmine',
          grade: item.grade || 'A1',
          standardPrice: item.standardPrice || 1997.5,
          additionalPrice: item.additionalPrice || 0,
          finalPrice: item.finalPrice || 1997.5,
          sacks: sacksCount,
          quantity: totalWeightKg,
          totalValue: totalPaddyValue,
          sackWeights: JSON.stringify(item.sackWeights || []),
        },
      });
    }

    // Audit Log
    await db.auditLog.create({
      data: {
        userId,
        userName: session.user?.name || 'Unknown User',
        userRole: ((session.user as { role?: string })?.role as any) || 'FIELD',
        action: 'UPDATE',
        entityType: 'PurchaseRecord',
        entityId: id,
        details: JSON.stringify({
          familyCode: updatedRecord.familyCode,
          farmerName: updatedRecord.farmerName,
          totalWeight: totalWeightKg,
          netPayment: netPaymentToFarmer,
        }),
      },
    });

    const fullRecord = await db.purchaseRecord.findUnique({
      where: { id },
      include: { items: true },
    });

    return NextResponse.json(fullRecord);
  } catch (error) {
    console.error('Error updating purchase record:', error);
    return NextResponse.json({ error: 'Failed to update purchase record.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;
    const userId = (session?.user as { id?: string })?.id;

    if (!session || !userId || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin role required to delete purchase records.' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await db.purchaseRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Purchase record not found.' }, { status: 404 });
    }

    await db.purchaseRecord.delete({
      where: { id },
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        userId,
        userName: session.user?.name || 'Admin',
        userRole: 'ADMIN',
        action: 'DELETE',
        entityType: 'PurchaseRecord',
        entityId: id,
        details: JSON.stringify({ familyCode: existing.familyCode, farmerName: existing.farmerName }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase record:', error);
    return NextResponse.json({ error: 'Failed to delete purchase record.' }, { status: 500 });
  }
}
