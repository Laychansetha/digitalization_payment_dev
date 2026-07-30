import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const profiles = await db.farmerProfile.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching farmer profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch farmer profiles.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      familyCode,
      farmerName,
      village,
      phone,
      paymentMethod,
      bankName,
      accountNumber,
      accountHolder,
      relationship,
      bankDocumentUrl,
      notes,
    } = body;

    if (!familyCode || !farmerName) {
      return NextResponse.json({ error: 'Family code and farmer name are required.' }, { status: 400 });
    }

    const normCode = familyCode.toUpperCase().trim();

    const profile = await db.farmerProfile.create({
      data: {
        familyCode: normCode,
        farmerName: farmerName.trim(),
        village: village || '',
        phone: phone || '',
        paymentMethod: paymentMethod || 'Bank Transfer',
        bankName: paymentMethod === 'Bank Transfer' ? bankName : (paymentMethod === 'Cash' ? 'Cash' : bankName),
        accountNumber: paymentMethod === 'Bank Transfer' ? (accountNumber || '—') : '—',
        accountHolder: paymentMethod === 'Bank Transfer' ? (accountHolder || farmerName) : farmerName,
        relationship: relationship || 'Self',
        bankDocumentUrl: bankDocumentUrl || null,
        notes: notes || '',
        createdBy: userId,
      },
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        userId,
        userName: session.user?.name || 'Unknown User',
        userRole: (session.user as { role: 'FIELD' | 'WAREHOUSE' | 'FINANCE' | 'ADMIN' }).role || 'FIELD',
        action: 'CREATE',
        entityType: 'FarmerProfile',
        entityId: profile.id,
        details: JSON.stringify({ familyCode: normCode, farmerName, bankName, accountNumber, hasBankPhoto: Boolean(bankDocumentUrl) }),
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error creating farmer profile:', error);
    return NextResponse.json({ error: 'Failed to save farmer payment profile.' }, { status: 500 });
  }
}
