import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { Role, ChallanStatus, MovementType } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
});

const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid Customer ID'),
  status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
  items: z.array(challanItemSchema).min(1, 'At least one item is required'),
});

const salesReadRoles = [Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS];
const salesWriteRoles = [Role.ADMIN, Role.SALES];

// GET /api/challans
router.get('/', authenticateJWT, requireRole(salesReadRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { status, customerId } = req.query;
    const whereClause: any = {};
    if (status) whereClause.status = status as ChallanStatus;
    if (customerId) whereClause.customerId = String(customerId);

    const challans = await prisma.challan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, businessName: true } },
      },
    });

    return res.status(200).json(challans);
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/challans/:id
router.get('/:id', authenticateJWT, requireRole(salesReadRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });

    if (!challan) return res.status(404).json({ error: 'Not Found', message: 'Challan not found' });
    return res.status(200).json(challan);
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/challans
router.post('/', authenticateJWT, requireRole(salesWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createChallanSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({
      where: { id: validatedData.customerId },
    });

    if (!customer) return res.status(404).json({ error: 'Not Found', message: 'Customer not found' });

    const createdBy = req.user?.name || 'System';
    const year = new Date().getFullYear();

    const result = await prisma.$transaction(async (tx) => {
      // Generate sequential challan number safely in TX
      const count = await tx.challan.count({
        where: { challanNumber: { startsWith: `CH-${year}-` } }
      });
      const challanNumber = `CH-${year}-${String(count + 1).padStart(5, '0')}`;

      // Fetch products and validate stock if CONFIRMED
      const itemsData = [];
      const shortProducts = [];

      for (const item of validatedData.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found with ID ${item.productId}`);

        if (validatedData.status === ChallanStatus.CONFIRMED) {
          if (product.currentStock < item.quantity) {
            shortProducts.push({
              product: product.name,
              sku: product.sku,
              requested: item.quantity,
              available: product.currentStock
            });
          }
        }

        itemsData.push({
          productId: item.productId,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity,
        });
      }

      if (shortProducts.length > 0) {
        throw new Error(JSON.stringify({ type: 'STOCK_SHORTAGE', details: shortProducts }));
      }

      const totalQuantity = itemsData.reduce((sum, item) => sum + item.quantity, 0);

      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: validatedData.customerId,
          status: validatedData.status,
          totalQuantity,
          createdBy,
          items: {
            create: itemsData
          }
        },
        include: { items: true }
      });

      // Deduct stock if CONFIRMED
      if (validatedData.status === ChallanStatus.CONFIRMED) {
        for (const item of itemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });
          
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: -item.quantity,
              movementType: MovementType.OUT,
              reason: `Challan ${challanNumber}`,
              createdBy,
            }
          });
        }
      }

      return challan;
    });

    return res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.errors });
    if (error.message.includes('STOCK_SHORTAGE')) {
      const parsed = JSON.parse(error.message);
      return res.status(400).json({ error: 'Insufficient Stock', details: parsed.details });
    }
    return res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

// PUT /api/challans/:id/confirm
router.put('/:id/confirm', authenticateJWT, requireRole(salesWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userName = req.user?.name || 'System';

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({ where: { id }, include: { items: true } });
      if (!challan) throw new Error('NOT_FOUND');
      if (challan.status !== ChallanStatus.DRAFT) throw new Error('INVALID_STATE');

      const shortProducts = [];
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.skuSnapshot} no longer exists.`);
        
        if (product.currentStock < item.quantity) {
          shortProducts.push({
            product: product.name,
            sku: product.sku,
            requested: item.quantity,
            available: product.currentStock
          });
        }
      }

      if (shortProducts.length > 0) {
        throw new Error(JSON.stringify({ type: 'STOCK_SHORTAGE', details: shortProducts }));
      }

      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } }
        });
        
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: -item.quantity,
            movementType: MovementType.OUT,
            reason: `Challan ${challan.challanNumber}`,
            createdBy: userName,
          }
        });
      }

      return tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CONFIRMED }
      });
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Not Found', message: 'Challan not found' });
    if (error.message === 'INVALID_STATE') return res.status(400).json({ error: 'Bad Request', message: 'Only DRAFT challans can be confirmed' });
    if (error.message.includes('STOCK_SHORTAGE')) {
      const parsed = JSON.parse(error.message);
      return res.status(400).json({ error: 'Insufficient Stock', details: parsed.details });
    }
    return res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

// PUT /api/challans/:id/cancel
router.put('/:id/cancel', authenticateJWT, requireRole([Role.ADMIN, Role.ACCOUNTS]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userName = req.user?.name || 'System';

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({ where: { id }, include: { items: true } });
      if (!challan) throw new Error('NOT_FOUND');
      if (challan.status === ChallanStatus.CANCELLED) return challan; // Idempotent

      if (challan.status === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { currentStock: { increment: item.quantity } }
            });
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantityChanged: item.quantity,
                movementType: MovementType.IN,
                reason: `Challan ${challan.challanNumber} Cancelled`,
                createdBy: userName,
              }
            });
          }
        }
      }

      return tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CANCELLED }
      });
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Not Found', message: 'Challan not found' });
    return res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

export default router;
