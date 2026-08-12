import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma';
import jwt from 'jsonwebtoken';
import { Role, CustomerType } from '@prisma/client';

const app = createApp();

describe('Customers API', () => {
  let adminToken: string;
  let warehouseToken: string;
  let testCustomerId: string;

  beforeAll(async () => {
    const adminUser = await prisma.user.create({
      data: { name: 'Admin', email: 'admin_cust@test.com', passwordHash: 'hash', role: Role.ADMIN },
    });
    
    const warehouseUser = await prisma.user.create({
      data: { name: 'Warehouse', email: 'warehouse_cust@test.com', passwordHash: 'hash', role: Role.WAREHOUSE },
    });

    const jwtSecret = process.env.JWT_SECRET || 'fundsroom-jwt-3f48a1dbe2b75a1c0d48ff99c4d96a782b1c4e97';
    adminToken = jwt.sign({ userId: adminUser.id, email: adminUser.email, role: adminUser.role, name: adminUser.name }, jwtSecret);
    warehouseToken = jwt.sign({ userId: warehouseUser.id, email: warehouseUser.email, role: warehouseUser.role, name: warehouseUser.name }, jwtSecret);
  });

  it('Admin should be able to create a customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe',
        businessName: 'Doe Enterprises',
        email: 'john@doe.com',
        mobile: '9876543210',
        customerType: CustomerType.DISTRIBUTOR,
        address: '456 Market St',
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('john@doe.com');
    testCustomerId = res.body.id;
  });

  it('Warehouse role should NOT be able to view customers', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${warehouseToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('Admin should be able to view customers', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
