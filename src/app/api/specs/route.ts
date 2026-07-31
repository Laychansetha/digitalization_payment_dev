import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const specs = await db.specsRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(specs);
  } catch (error) {
    console.error('Error fetching specs:', error);
    return NextResponse.json({ error: 'Failed to fetch specs records.' }, { status: 500 });
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
      paddyType,
      selectedGrade,
      isOrganic,
      moisture,
      foreignMatter,
      purity,
      impurity,
      wholeGrain,
      brokenRice,
      isValid,
      basePrice,
      organicBonus,
      finalPrice,
      bestQualifyingGrade,
    } = body;

    if (!familyCode || !farmerName || !paddyType || !selectedGrade) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const spec = await db.specsRecord.create({
      data: {
        familyCode: familyCode.toUpperCase().trim(),
        farmerName: farmerName.trim(),
        village: village || '',
        paddyType,
        selectedGrade,
        isOrganic: Boolean(isOrganic),
        moisture: parseFloat(moisture) || 0,
        foreignMatter: parseFloat(foreignMatter) || 0,
        purity: purity !== undefined && purity !== null ? parseFloat(purity) : null,
        impurity: impurity !== undefined && impurity !== null ? parseFloat(impurity) : null,
        wholeGrain: wholeGrain !== undefined && wholeGrain !== null ? parseFloat(wholeGrain) : null,
        brokenRice: brokenRice !== undefined && brokenRice !== null ? parseFloat(brokenRice) : null,
        isValid: Boolean(isValid),
        basePrice: parseFloat(basePrice) || 0,
        organicBonus: parseFloat(organicBonus) || 0,
        finalPrice: parseFloat(finalPrice) || 0,
        bestQualifyingGrade: bestQualifyingGrade || selectedGrade,
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
        entityType: 'SpecsRecord',
        entityId: spec.id,
        details: JSON.stringify({ familyCode, farmerName, paddyType, selectedGrade, finalPrice }),
      },
    });

    return NextResponse.json(spec, { status: 201 });
  } catch (error) {
    console.error('Error creating specs record:', error);
    return NextResponse.json({ error: 'Failed to create specs record.' }, { status: 500 });
  }
}
