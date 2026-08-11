import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { Role, CustomerType, CustomerStatus } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(2, 'Business Name must be at least 2 characters'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  notes: z.string().optional().nullable(),
});

const noteSchema = z.object({
  note: z.string().min(5, 'Note must be at least 5 characters'),
});

// Helper role checks: WAREHOUSE is not allowed for CRM operations
const crmRoles = [Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE];
const crmWriteRoles = [Role.ADMIN, Role.SALES];

// GET /api/customers - Retrieve all customers with search/filters
router.get('/', authenticateJWT, requireRole(crmRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, type, page = '1', limit = '10' } = req.query;
    const whereClause: any = {};
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    if (status) {
      whereClause.status = status as CustomerStatus;
    }
    if (type) {
      whereClause.customerType = type as CustomerType;
    }

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { businessName: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { mobile: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        _count: {
          select: { challans: true, followUpNotes: true }
        }
      }
    });
    const total = await prisma.customer.count({ where: whereClause });
    return res.status(200).json({ data: customers, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/customers/:id - Retrieve specific customer details & timeline
router.get('/:id', authenticateJWT, requireRole(crmRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUpNotes: {
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Not Found', message: 'Customer not found' });
    }

    return res.status(200).json(customer);
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/customers - Create new customer
router.post('/', authenticateJWT, requireRole(crmWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = customerSchema.parse(req.body);

    const customer = await prisma.customer.create({
      data: {
        name: validatedData.name,
        mobile: validatedData.mobile,
        email: validatedData.email,
        businessName: validatedData.businessName,
        gstNumber: validatedData.gstNumber,
        customerType: validatedData.customerType,
        address: validatedData.address,
        status: validatedData.status,
        notes: validatedData.notes,
      },
    });

    return res.status(201).json(customer);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', authenticateJWT, requireRole(crmWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = customerSchema.parse(req.body);

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Not Found', message: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: validatedData.name,
        mobile: validatedData.mobile,
        email: validatedData.email,
        businessName: validatedData.businessName,
        gstNumber: validatedData.gstNumber,
        customerType: validatedData.customerType,
        address: validatedData.address,
        status: validatedData.status,
        notes: validatedData.notes,
      },
    });

    return res.status(200).json(updatedCustomer);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/customers/:id/notes - Add follow-up CRM note
router.post('/:id/follow-ups', authenticateJWT, requireRole(crmWriteRoles), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = noteSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Not Found', message: 'Customer not found' });
    }

    const userName = req.user?.name || 'System';

    // Transaction to write note and update customer follow-up timestamp
    const [followUpNote] = await prisma.$transaction([
      prisma.followUpNote.create({
        data: {
          customerId: id,
          note: validatedData.note,
          createdBy: userName,
        },
      }),
      prisma.customer.update({
        where: { id },
        data: {
          followUpDate: new Date(),
        },
      }),
    ]);

    return res.status(201).json(followUpNote);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
