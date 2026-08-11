import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data in reverse order of dependencies
  await prisma.challanItem.deleteMany({});
  await prisma.challan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.followUpNote.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Existing data cleared.');

  // 2. Seed Users
  const passwordHash = bcrypt.hashSync('Password123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@fundsroom.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'CRM Sales Exec',
      email: 'sales@fundsroom.com',
      passwordHash,
      role: Role.SALES,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Warehouse Keeper',
      email: 'warehouse@fundsroom.com',
      passwordHash,
      role: Role.WAREHOUSE,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Accounts Manager',
      email: 'accounts@fundsroom.com',
      passwordHash,
      role: Role.ACCOUNTS,
    },
  });

  console.log('👤 Users seeded successfully:', {
    admin: adminUser.email,
    sales: salesUser.email,
    warehouse: warehouseUser.email,
    accounts: accountsUser.email,
  });

  // 3. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Doe',
      mobile: '9876543210',
      email: 'john@acme.com',
      businessName: 'Acme Corp',
      gstNumber: '27AAAAA1111A1Z1',
      customerType: CustomerType.DISTRIBUTOR,
      address: '123 Business Park, Sector 4, Mumbai, MH',
      status: CustomerStatus.ACTIVE,
      notes: 'Key distributor for western region.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Jane Smith',
      mobile: '9123456789',
      email: 'jane@retailstore.com',
      businessName: 'Retail Express',
      gstNumber: '27BBBBB2222B2Z2',
      customerType: CustomerType.RETAIL,
      address: 'Shop No. 5, Central Plaza, Pune, MH',
      status: CustomerStatus.ACTIVE,
      notes: 'Regular retail customer. Prefers Widget A.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'David Lee',
      mobile: '9988776655',
      email: 'david@globalexports.com',
      businessName: 'Global Exports Ltd',
      gstNumber: undefined,
      customerType: CustomerType.WHOLESALE,
      address: 'Suite 801, Trade Tower, Bangalore, KA',
      status: CustomerStatus.LEAD,
      notes: 'New wholesale lead from web inquiry. Wants pricing options.',
    },
  });

  console.log('🤝 Customers seeded successfully.');

  // 4. Seed Follow Up Notes for Lead
  await prisma.followUpNote.createMany({
    data: [
      {
        customerId: customer3.id,
        note: 'First call: Customer is interested in wholesale shipments of Widget A. Requested catalog.',
        createdBy: salesUser.name,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        customerId: customer3.id,
        note: 'Follow-up: Shared product catalog and custom price sheet.',
        createdBy: salesUser.name,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ],
  });

  console.log('📝 Customer Follow-Up Notes seeded successfully.');

  // 5. Seed Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Premium Widget A',
      sku: 'WIDG-A-001',
      category: 'Widgets',
      unitPrice: 12.50,
      currentStock: 150,
      minStockAlert: 50,
      location: 'Aisle A, Shelf 3',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Industrial Widget B',
      sku: 'WIDG-B-002',
      category: 'Widgets',
      unitPrice: 25.00,
      currentStock: 30, // Low stock since minStockAlert is 40
      minStockAlert: 40,
      location: 'Aisle B, Shelf 1',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Super Gadget X',
      sku: 'GDGT-X-999',
      category: 'Gadgets',
      unitPrice: 99.99,
      currentStock: 20,
      minStockAlert: 10,
      location: 'Aisle C, Shelf 2',
    },
  });

  console.log('📦 Products seeded successfully.');

  // 6. Seed Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product1.id,
        quantityChanged: 150,
        movementType: MovementType.IN,
        reason: 'Initial warehouse stocking',
        createdBy: warehouseUser.name,
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product2.id,
        quantityChanged: 50,
        movementType: MovementType.IN,
        reason: 'Initial warehouse stocking',
        createdBy: warehouseUser.name,
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product2.id,
        quantityChanged: -20,
        movementType: MovementType.OUT,
        reason: 'Damaged stock discarded',
        createdBy: warehouseUser.name,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product3.id,
        quantityChanged: 20,
        movementType: MovementType.IN,
        reason: 'Initial warehouse stocking',
        createdBy: warehouseUser.name,
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('🔄 Stock Movements seeded successfully.');

  // 7. Seed Challans
  // Challan 1: Draft
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-20260810-0001',
      customerId: customer1.id,
      status: ChallanStatus.DRAFT,
      totalQuantity: 15,
      createdBy: salesUser.name,
    },
  });

  await prisma.challanItem.createMany({
    data: [
      {
        challanId: challan1.id,
        productId: product1.id,
        productNameSnapshot: product1.name,
        skuSnapshot: product1.sku,
        unitPriceSnapshot: product1.unitPrice,
        quantity: 10,
      },
      {
        challanId: challan1.id,
        productId: product2.id,
        productNameSnapshot: product2.name,
        skuSnapshot: product2.sku,
        unitPriceSnapshot: product2.unitPrice,
        quantity: 5,
      },
    ],
  });

  // Challan 2: Confirmed (stock should be already reduced in seed values, or we reflect that)
  const challan2 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-20260809-0002',
      customerId: customer2.id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: 20,
      createdBy: salesUser.name,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.challanItem.createMany({
    data: [
      {
        challanId: challan2.id,
        productId: product1.id,
        productNameSnapshot: product1.name,
        skuSnapshot: product1.sku,
        unitPriceSnapshot: product1.unitPrice,
        quantity: 20,
      },
    ],
  });

  console.log('📄 Challans seeded successfully.');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
