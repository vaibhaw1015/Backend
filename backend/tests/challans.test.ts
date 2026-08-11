import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma';
import jwt from 'jsonwebtoken';
import { Role, CustomerType, ChallanStatus } from '@prisma/client';

const app = createApp();

describe('Challans API Business Logic', () => {
  let adminToken: string;
  let testCustomer: any;
  let testProduct: any;

  beforeAll(async () => {
    // 1. Create an admin user for authentication
    const user = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'testadmin@fundsroom.com',
        passwordHash: 'hashedpassword',
        role: Role.ADMIN,
      },
    });

    adminToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'fundsroom-jwt-3f48a1dbe2b75a1c0d48ff99c4d96a782b1c4e97',
      { expiresIn: '1h' }
    );

    // 2. Create a test customer
    testCustomer = await prisma.customer.create({
      data: {
        name: 'Test Customer',
        businessName: 'Test Business LLC',
        email: 'customer@test.com',
        mobile: '1234567890',
        customerType: CustomerType.RETAIL,
        address: '123 Test St',
      },
    });

    // 3. Create a test product with 5 stock
    testProduct = await prisma.product.create({
      data: {
        name: 'Test ERP Product',
        sku: 'TEST-SKU-01',
        category: 'TEST',
        unitPrice: 100.0,
        currentStock: 5,
        location: 'A1',
      },
    });
  });

  it('should reject a CONFIRMED challan if requested quantity exceeds current stock', async () => {
    // Request 10, but only 5 in stock
    const res = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId: testCustomer.id,
        status: ChallanStatus.CONFIRMED,
        items: [
          {
            productId: testProduct.id,
            quantity: 10,
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Insufficient Stock');
    expect(res.body.details[0].requested).toBe(10);
    expect(res.body.details[0].available).toBe(5);

    // Verify stock was NOT reduced
    const productAfter = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(productAfter?.currentStock).toBe(5);

    // Verify challan was NOT created
    const challans = await prisma.challan.findMany({ where: { customerId: testCustomer.id } });
    expect(challans.length).toBe(0);
  });

  it('should successfully create a DRAFT challan even if requested quantity exceeds stock', async () => {
    // Request 10, but only 5 in stock. It should succeed because it's just a DRAFT.
    const res = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId: testCustomer.id,
        status: ChallanStatus.DRAFT,
        items: [
          {
            productId: testProduct.id,
            quantity: 10,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(ChallanStatus.DRAFT);
    expect(res.body.totalQuantity).toBe(10);

    // Verify stock was NOT reduced
    const productAfter = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(productAfter?.currentStock).toBe(5);
  });

  it('should successfully CONFIRM a challan and reduce stock if enough is available', async () => {
    // Request 3, we have 5 in stock.
    const res = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId: testCustomer.id,
        status: ChallanStatus.CONFIRMED,
        items: [
          {
            productId: testProduct.id,
            quantity: 3,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(ChallanStatus.CONFIRMED);

    // Verify stock was correctly reduced from 5 to 2
    const productAfter = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(productAfter?.currentStock).toBe(2);

    // Verify a stock movement record was created
    const movements = await prisma.stockMovement.findMany({ where: { productId: testProduct.id } });
    expect(movements.length).toBe(1);
    expect(movements[0].quantityChanged).toBe(-3);
  });
});
