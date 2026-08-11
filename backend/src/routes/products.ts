import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { Role, MovementType } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  unitPrice: z.number().positive('Unit price must be a positive number'),
  currentStock: z.number().int().nonnegative().default(0),
  minStockAlert: z.number().int().nonnegative().default(0),
  location: z.string().min(1, 'Location is required'),
});

const stockAdjustmentSchema = z.object({
  quantityChanged: z.number().int('Quantity must be an integer').refine(val => val !== 0, 'Quantity cannot be 0'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

const inventoryReadRoles = [Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS];
const inventoryWriteRoles = [Role.ADMIN, Role.WAREHOUSE];

// GET /api/products - Retrieve products (support search, category and low stock alerts)
router.get('/', authenticateJWT, requireRole(inventoryReadRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, lowStock, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {};

    if (category) {
      whereClause.category = String(category);
    }

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { sku: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    if (lowStock === 'true') {
      const allProducts = await prisma.product.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
      });
      
      const lowStockProducts = allProducts.filter(p => p.currentStock <= p.minStockAlert);
      const paginated = lowStockProducts.slice(skip, skip + limitNumber);
      
      return res.status(200).json({
        data: paginated,
        total: lowStockProducts.length,
        page: pageNumber,
        limit: limitNumber,
      });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
        skip,
        take: limitNumber,
      }),
      prisma.product.count({ where: whereClause })
    ]);

    return res.status(200).json({
      data: products,
      total,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/products/:id - Get specific product details + movement logs
router.get('/:id', authenticateJWT, requireRole(inventoryReadRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', authenticateJWT, requireRole(inventoryWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = productSchema.parse(req.body);

    const existingProduct = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingProduct) {
      return res.status(400).json({ error: 'Bad Request', message: 'Product SKU already exists' });
    }

    const createdBy = req.user?.name || 'System';

    // Create product and log initial stock movement if currentStock > 0
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: validatedData.name,
          sku: validatedData.sku,
          category: validatedData.category,
          unitPrice: validatedData.unitPrice,
          currentStock: validatedData.currentStock,
          minStockAlert: validatedData.minStockAlert,
          location: validatedData.location,
        },
      });

      if (validatedData.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: p.id,
            quantityChanged: validatedData.currentStock,
            movementType: MovementType.IN,
            reason: 'Initial stock intake on creation',
            createdBy,
          },
        });
      }

      return p;
    });

    return res.status(201).json(product);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// PUT /api/products/:id - Update product specs
router.put('/:id', authenticateJWT, requireRole(inventoryWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = productSchema.parse(req.body);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found' });
    }

    // Check SKU conflicts with other products
    const skuConflict = await prisma.product.findFirst({
      where: {
        sku: validatedData.sku,
        NOT: { id },
      },
    });

    if (skuConflict) {
      return res.status(400).json({ error: 'Bad Request', message: 'Product SKU already in use' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        sku: validatedData.sku,
        category: validatedData.category,
        unitPrice: validatedData.unitPrice,
        minStockAlert: validatedData.minStockAlert,
        location: validatedData.location,
        // currentStock should not be directly updated via PUT; should use POST /stock adjustment endpoint to audit properly
      },
    });

    return res.status(200).json(updatedProduct);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/products/:id/movements - Get movement logs for a product
router.get('/:id/movements', authenticateJWT, requireRole(inventoryReadRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found' });
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId: id },
      orderBy: { timestamp: 'desc' },
    });

    return res.status(200).json(movements);
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/products/:id/stock-movements - Adjust stock level manually (logged to movement history)
router.post('/:id/stock-movements', authenticateJWT, requireRole(inventoryWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = stockAdjustmentSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found' });
    }

    const newStock = product.currentStock + validatedData.quantityChanged;

    if (newStock < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Insufficient stock. Cannot adjust by ${validatedData.quantityChanged}. Current stock is ${product.currentStock}.`,
      });
    }

    const movementType = validatedData.quantityChanged > 0 ? MovementType.IN : MovementType.OUT;
    const createdBy = req.user?.name || 'System';

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { currentStock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId: id,
          quantityChanged: validatedData.quantityChanged,
          movementType,
          reason: validatedData.reason,
          createdBy,
        },
      }),
    ]);

    return res.status(200).json({ product: updatedProduct, movement });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
