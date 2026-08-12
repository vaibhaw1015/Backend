import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const app = createApp();

describe('Products API', () => {
  let adminToken: string;
  let testProductId: string;

  beforeAll(async () => {
    const adminUser = await prisma.user.create({
      data: { name: 'Admin', email: 'admin_prod@test.com', passwordHash: 'hash', role: Role.ADMIN },
    });
    
    const jwtSecret = process.env.JWT_SECRET || 'fundsroom-jwt-3f48a1dbe2b75a1c0d48ff99c4d96a782b1c4e97';
    adminToken = jwt.sign({ userId: adminUser.id, email: adminUser.email, role: adminUser.role, name: adminUser.name }, jwtSecret);
  });

  it('Admin should be able to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Bulk Fertilizer',
        sku: 'FERT-001',
        category: 'AGRICULTURE',
        unitPrice: 50.00,
        currentStock: 100,
        minStockAlert: 20,
        location: 'Warehouse A',
      });

    expect(res.status).toBe(201);
    expect(res.body.sku).toBe('FERT-001');
    expect(res.body.currentStock).toBe(100);
    testProductId = res.body.id;
  });

  it('should prevent creating a product with a duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Another Fertilizer',
        sku: 'FERT-001', // Duplicate
        category: 'AGRICULTURE',
        unitPrice: 60.00,
        currentStock: 50,
        minStockAlert: 10,
        location: 'Warehouse B',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad Request');
  });

  it('should fetch the list of products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].sku).toBeDefined();
  });
});
