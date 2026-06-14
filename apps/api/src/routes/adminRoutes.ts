import { Router, Request, Response } from 'express';
import prisma from '@repo/database';
import { ApiResult, IProduct, ICategory, IFloor, IDiningTable, IPromotion, PromotionType, DiscountType, IUser, UserRole } from '@repo/shared-types';
import bcrypt from 'bcrypt';

const router: Router = Router();

// ==========================================
// Products
// ==========================================
router.get('/products', async (req: Request, res: Response<ApiResult<IProduct[]>>) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    const formatted = products.map(p => ({
      ...p,
      price: p.price.toString(),
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
      category: p.category ? {
        ...p.category,
        created_at: p.category.created_at.toISOString(),
        updated_at: p.category.updated_at.toISOString(),
      } : undefined
    }));
    res.json({ success: true, data: formatted as IProduct[] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req: Request, res: Response<ApiResult<IProduct>>) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    const formatted = {
      ...product,
      price: product.price.toString(),
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
    };
    res.status(201).json({ success: true, data: formatted as IProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req: Request, res: Response<ApiResult<IProduct>>) => {
  try {
    const product = await prisma.product.update({ 
      where: { id: req.params.id as string }, 
      data: req.body 
    });
    const formatted = {
      ...product,
      price: product.price.toString(),
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
    };
    res.json({ success: true, data: formatted as IProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

// ==========================================
// Categories
// ==========================================
router.get('/categories', async (req: Request, res: Response<ApiResult<ICategory[]>>) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { sort_order: 'asc' } });
    const formatted = categories.map(c => ({
      ...c,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req: Request, res: Response<ApiResult<ICategory>>) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    const formatted = {
      ...category,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    };
    res.status(201).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

router.put('/categories/:id', async (req: Request, res: Response<ApiResult<ICategory>>) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    const formatted = {
      ...category,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    };
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

// ==========================================
// Floors & Tables
// ==========================================
router.get('/floors', async (req: Request, res: Response<ApiResult<IFloor[]>>) => {
  try {
    const floors = await prisma.floor.findMany({
      include: { tables: true },
      orderBy: { sort_order: 'asc' }
    });
    const formatted = floors.map(f => ({
      ...f,
      created_at: f.created_at.toISOString(),
      updated_at: f.updated_at.toISOString(),
      tables: f.tables.map((t: any) => ({
        ...t,
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
      }))
    }));
    res.json({ success: true, data: formatted as IFloor[] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch floors' });
  }
});

router.put('/floors/tables/:id', async (req: Request, res: Response) => {
  try {
    const { pos_x, pos_y, is_active } = req.body;
    const updateData: any = {};
    if (pos_x !== undefined) updateData.pos_x = pos_x;
    if (pos_y !== undefined) updateData.pos_y = pos_y;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    const table = await prisma.diningTable.update({
      where: { id: req.params.id as string },
      data: updateData
    });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update table' });
  }
});

router.post('/floors', async (req: Request, res: Response) => {
  try {
    const { name, sort_order } = req.body;
    const floor = await prisma.floor.create({
      data: { name, sort_order }
    });
    res.status(201).json({ success: true, data: floor });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create floor' });
  }
});

router.post('/floors/tables', async (req: Request, res: Response) => {
  try {
    const table = await prisma.diningTable.create({
      data: req.body
    });
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create table' });
  }
});

router.delete('/floors/tables/:id', async (req: Request, res: Response) => {
  try {
    await prisma.diningTable.delete({
      where: { id: req.params.id as string }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete table' });
  }
});

// ==========================================
// Promotions
// ==========================================
router.get('/promotions', async (req: Request, res: Response<ApiResult<IPromotion[]>>) => {
  try {
    const promotions = await prisma.promotion.findMany();
    const formatted = promotions.map(p => ({
      ...p,
      discount_value: p.discount_value.toString(),
      min_order_amount: p.min_order_amount?.toString() || null,
      starts_at: p.starts_at?.toISOString() || null,
      ends_at: p.ends_at?.toISOString() || null,
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
      type: p.type as PromotionType,
      discount_type: p.discount_type as DiscountType,
    }));
    res.json({ success: true, data: formatted as IPromotion[] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch promotions' });
  }
});

router.post('/promotions', async (req: Request, res: Response) => {
  try {
    const { name, type, discount_type, discount_value, min_order_amount, starts_at, ends_at } = req.body;
    const promotion = await prisma.promotion.create({
      data: {
        name,
        type,
        discount_type,
        discount_value,
        min_order_amount,
        starts_at: starts_at ? new Date(starts_at) : null,
        ends_at: ends_at ? new Date(ends_at) : null,
        is_active: true
      }
    });
    const formatted = {
      ...promotion,
      discount_value: promotion.discount_value.toString(),
      min_order_amount: promotion.min_order_amount?.toString() || null,
      starts_at: promotion.starts_at?.toISOString() || null,
      ends_at: promotion.ends_at?.toISOString() || null,
      created_at: promotion.created_at.toISOString(),
      updated_at: promotion.updated_at.toISOString(),
    };
    res.status(201).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create promotion' });
  }
});

router.delete('/promotions/:id', async (req: Request, res: Response) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete promotion' });
  }
});

// ==========================================
// Analytics
// ==========================================
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Top Products and Categories
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: 'COMPLETED' }
      },
      include: { 
        product: {
          include: { category: true }
        } 
      }
    });

    const productSales: Record<string, { name: string, sales: number }> = {};
    const categorySales: Record<string, { name: string, sales: number }> = {};
    
    orderItems.forEach(item => {
      if (item.product) {
        // Track product sales
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { name: item.product.name, sales: 0 };
        }
        productSales[item.product_id].sales += item.quantity;

        // Track category sales
        const catId = item.product.category_id || 'unknown';
        const catName = item.product.category?.name || 'Uncategorized';
        if (!categorySales[catId]) {
          categorySales[catId] = { name: catName, sales: 0 };
        }
        categorySales[catId].sales += item.quantity;
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    const topCategoryList = Object.values(categorySales)
      .sort((a, b) => b.sales - a.sales);
      
    const topCategory = topCategoryList.length > 0 ? topCategoryList[0] : null;
    const topProduct = topProducts.length > 0 ? topProducts[0] : null;

    // Revenue Trend (Last 7 days for simplicity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        created_at: { gte: thirtyDaysAgo }
      },
      select: { created_at: true, grand_total: true }
    });

    const revenueMap: Record<string, number> = {};
    orders.forEach(o => {
      const dateStr = o.created_at.toISOString().split('T')[0];
      revenueMap[dateStr] = (revenueMap[dateStr] || 0) + Number(o.grand_total);
    });

    const revenueTrend = Object.keys(revenueMap)
      .sort()
      .map(date => ({ date, revenue: revenueMap[date] }));

    res.json({ success: true, data: { topProducts, revenueTrend, topCategory, topProduct } });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// ==========================================
// Users
// ==========================================
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, full_name: true, role: true, is_active: true, created_at: true, updated_at: true
      }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        full_name,
        role: role || UserRole.EMPLOYEE,
        is_active: true
      },
      select: {
        id: true, email: true, full_name: true, role: true, is_active: true, created_at: true, updated_at: true
      }
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { role, is_active } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { role, is_active },
      select: {
        id: true, email: true, full_name: true, role: true, is_active: true, created_at: true, updated_at: true
      }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// ==========================================
// Customers
// ==========================================
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    const formatted = customers.map(c => ({
      ...c,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
});

router.post('/customers', async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone } = req.body;
    
    // basic email uniqueness check
    if (email) {
      const existing = await prisma.customer.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Customer with this email already exists' });
      }
    }

    const customer = await prisma.customer.create({
      data: { full_name, email, phone }
    });

    res.status(201).json({ success: true, data: {
      ...customer,
      created_at: customer.created_at.toISOString(),
      updated_at: customer.updated_at.toISOString(),
    } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create customer' });
  }
});

router.put('/customers/:id', async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: { full_name, email, phone }
    });
    res.json({ success: true, data: {
      ...customer,
      created_at: customer.created_at.toISOString(),
      updated_at: customer.updated_at.toISOString(),
    } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update customer' });
  }
});

router.delete('/customers/:id', async (req: Request, res: Response) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id as string }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete customer' });
  }
});

// ==========================================
// Reports
// ==========================================
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId, sessionId, productId } = req.query;

    // Build the order filter
    const orderWhere: any = {};
    if (startDate) {
      orderWhere.created_at = { ...orderWhere.created_at, gte: new Date(startDate as string) };
    }
    if (endDate) {
      orderWhere.created_at = { ...orderWhere.created_at, lte: new Date(endDate as string) };
    }
    if (userId) {
      orderWhere.user_id = userId;
    }

    // If session is provided, fetch session to get its time bounds and user
    if (sessionId) {
      const session = await prisma.shiftSession.findUnique({ where: { id: sessionId as string } });
      if (session) {
        orderWhere.user_id = session.user_id;
        orderWhere.created_at = {
          gte: session.start_time,
          ...(session.end_time ? { lte: session.end_time } : {})
        };
      }
    }

    // Fetch matching orders
    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    let total_revenue = 0;
    let total_orders = orders.length;
    
    // Aggregate products
    const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};

    for (const order of orders) {
      let orderRevenueAdded = false;

      for (const item of order.items) {
        if (productId && item.product_id !== productId) continue;
        
        if (!orderRevenueAdded && !productId) {
           total_revenue += Number(order.grand_total);
           orderRevenueAdded = true;
        }

        if (productId) {
           total_revenue += Number(item.total_price);
        }

        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productStats[item.product_id].quantity += item.quantity;
        productStats[item.product_id].revenue += Number(item.total_price);
      }
    }

    if (productId) {
      total_orders = orders.filter(o => o.items.some(i => i.product_id === productId)).length;
    }

    res.json({
      success: true,
      data: {
        total_revenue,
        total_orders,
        product_breakdown: Object.values(productStats).sort((a, b) => b.revenue - a.revenue)
      }
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

router.get('/reports/filters', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, full_name: true } });
    const sessions = await prisma.shiftSession.findMany({
      include: { user: { select: { full_name: true } } },
      orderBy: { start_time: 'desc' },
      take: 50
    });
    const products = await prisma.product.findMany({ select: { id: true, name: true } });

    res.json({
      success: true,
      data: {
        users,
        sessions: sessions.map(s => ({
          id: s.id,
          label: `${s.user.full_name} (${new Date(s.start_time).toLocaleString()})`
        })),
        products
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch filters' });
  }
});

export default router;
