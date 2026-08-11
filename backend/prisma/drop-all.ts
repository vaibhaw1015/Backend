import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Dropping all tables and types in PostgreSQL database...');
  
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ChallanItem" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Challan" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "StockMovement" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Product" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "FollowUpNote" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Customer" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User" CASCADE;`);
  
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "CustomerType" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "CustomerStatus" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "MovementType" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "ChallanStatus" CASCADE;`);
  
  console.log('✅ All tables and types dropped successfully. Database is now empty.');
}

main()
  .catch((e) => {
    console.error('❌ Error dropping tables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
