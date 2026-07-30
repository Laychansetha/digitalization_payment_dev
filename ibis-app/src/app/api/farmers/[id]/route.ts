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
    const userRole = (session?.user as { role?: string })?.role;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await db.farmerProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Farmer profile not found.' }, { status: 404 });
    }

    const updated = await db.farmerProfile.update({
      where: { id },
      data: {
        accountHolder: body.accountHolder !== undefined ? body.accountHolder : existing.accountHolder,
        relationship: body.relationship !== undefined ? body.relationship : existing.relationship,
        paymentMethod: body.paymentMethod !== undefined ? body.paymentMethod : existing.paymentMethod,
        bankName: body.bankName !== undefined ? body.bankName : existing.bankName,
        accountNumber: body.accountNumber !== undefined ? body.accountNumber : existing.accountNumber,
        bankDocumentUrl: body.bankDocumentUrl !== undefined ? body.bankDocumentUrl : existing.bankDocumentUrl,
        village: body.village !== undefined ? body.village : existing.village,
        phone: body.phone !== undefined ? body.phone : existing.phone,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
    });

    // Create Audit Log
    await db.auditLog.create({
      data: {
        userId,
        userName: session.user?.name || 'User',
        userRole: (userRole as any) || 'FIELD',
        action: 'UPDATE',
        entityType: 'FarmerProfile',
        entityId: id,
        details: JSON.stringify({
          familyCode: updated.familyCode,
          farmerName: updated.farmerName,
          bankName: updated.bankName,
          accountNumber: updated.accountNumber,
          accountHolder: updated.accountHolder,
          relationship: updated.relationship,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating farmer profile:', error);
    return NextResponse.json({ error: 'Failed to update farmer profile.' }, { status: 500 });
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
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required to delete farmer profiles.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await db.farmerProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Farmer profile not found.' }, { status: 404 });
    }

    await db.farmerProfile.delete({
      where: { id },
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        userId,
        userName: session.user?.name || 'Admin',
        userRole: 'ADMIN',
        action: 'DELETE',
        entityType: 'FarmerProfile',
        entityId: id,
        details: JSON.stringify({
          familyCode: existing.familyCode,
          farmerName: existing.farmerName,
          bankName: existing.bankName,
          accountNumber: existing.accountNumber,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting farmer profile:', error);
    return NextResponse.json({ error: 'Failed to delete farmer profile.' }, { status: 500 });
  }
}
