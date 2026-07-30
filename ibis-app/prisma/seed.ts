import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding IBIS RICE database...');

  const passwordHash = await bcrypt.hash('Ibis2026!', 10);

  // 1. Create Default Users for Each Role
  await prisma.user.upsert({
    where: { email: 'field@ibisrice.com' },
    update: {},
    create: {
      name: 'Sokha (Field Inspector)',
      email: 'field@ibisrice.com',
      password: passwordHash,
      role: 'FIELD',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'warehouse@ibisrice.com' },
    update: {},
    create: {
      name: 'Bopha (Warehouse Scale Operator)',
      email: 'warehouse@ibisrice.com',
      password: passwordHash,
      role: 'WAREHOUSE',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'finance@ibisrice.com' },
    update: {},
    create: {
      name: 'Channa (Finance Officer)',
      email: 'finance@ibisrice.com',
      password: passwordHash,
      role: 'FINANCE',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@ibisrice.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@ibisrice.com',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Seed Default Target Villages
  const defaultVillages = ['Bra', 'Damnak Kantout', 'Dan', 'Dang Phlet', 'Kampenh'];
  for (const villageName of defaultVillages) {
    await prisma.village.upsert({
      where: { name: villageName },
      update: {},
      create: {
        name: villageName,
        district: 'Chhaeb',
        province: 'Preah Vihear',
        status: 'ACTIVE',
      },
    });
  }

  // 3. Seed Default Commercial Banks in Cambodia
  const defaultBanks = [
    { name: 'ABA Bank', code: 'ABA' },
    { name: 'ACLEDA Bank', code: 'ACL' },
    { name: 'Canadia Bank', code: 'CAN' },
    { name: 'Sathapana Bank', code: 'STP' },
    { name: 'Wing Bank', code: 'WING' },
    { name: 'PRASAC Microfinance', code: 'PRASAC' },
    { name: 'AMK Microfinance', code: 'AMK' },
    { name: 'Hattha Bank', code: 'HTB' },
    { name: 'Campu Bank (Public Bank)', code: 'CPB' },
  ];

  for (const bank of defaultBanks) {
    await prisma.bank.upsert({
      where: { name: bank.name },
      update: {},
      create: {
        name: bank.name,
        code: bank.code,
        status: 'ACTIVE',
      },
    });
  }

  // 4. Seed Default Paddy Price Specifications
  const defaultPriceSpecs = [
    { variety: 'Phka Rumduol', grade: 'A1', basePrice: 1650, organicBonus: 100, maxMoisture: 14.0, maxForeignMatter: 5.0 },
    { variety: 'Phka Rumduol', grade: 'A2', basePrice: 1550, organicBonus: 100, maxMoisture: 14.5, maxForeignMatter: 5.0 },
    { variety: 'Phka Rumduol', grade: 'B', basePrice: 1450, organicBonus: 50, maxMoisture: 15.0, maxForeignMatter: 6.0 },
    { variety: 'Red Jasmine', grade: 'A1', basePrice: 1600, organicBonus: 100, maxMoisture: 14.0, maxForeignMatter: 5.0 },
    { variety: 'White Rice', grade: 'A1', basePrice: 1350, organicBonus: 50, maxMoisture: 14.0, maxForeignMatter: 5.0 },
  ];

  for (const spec of defaultPriceSpecs) {
    await prisma.paddyPriceSpec.upsert({
      where: {
        variety_grade: {
          variety: spec.variety,
          grade: spec.grade,
        },
      },
      update: spec,
      create: spec,
    });
  }

  console.log('✅ Created initial accounts for all 4 roles');
  console.log('✅ Seeded initial target villages, commercial banks & paddy price specifications');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
