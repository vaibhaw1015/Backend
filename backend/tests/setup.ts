import { beforeAll, beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/prisma';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Force test environment
process.env.NODE_ENV = 'test';

// If running locally without CI, try to load .env.test if it exists, otherwise fallback
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(() => {
  // We expect DATABASE_URL to point to a test database here
  if (!process.env.DATABASE_URL?.includes('test') && !process.env.CI) {
    console.error("CRITICAL ERROR: DATABASE_URL doesn't seem to point to a test database.");
    console.error("To protect your production data, tests have been aborted.");
    process.exit(1);
  }
  
  // Apply migrations to the test database
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'ignore' });
  } catch (error) {
    console.error('Failed to push prisma schema to test db', error);
  }
});

beforeEach(async () => {
  // Truncate tables before each test for isolation
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
