import { Router, Request, Response } from 'express';
import prisma from '@repo/database';
import { ApiResult, ICategory, IProduct, IPromotion, IOrder, PromotionType, DiscountType, OrderStatus } from '@repo/shared-types';
import { calculateOrderTotal } from '@repo/shared-types';

const router: Router = Router();

// ==========================================
// Menu Data for POS Terminal
// ==========================================
router.get('/menu', async (req: Request, res: Response) => {
  try {
    const [categories, products, promotions] = await Promise.all([
      prisma.category.findMany({ where: { is_active: true }, orderBy: { sort_order: 'asc' } }),
      prisma.product.findMany({ where: { is_available: true }, orderBy: { name: 'asc' } }),
      prisma.promotion.findMany({ where: { is_active: true } }),
    ]);

    // Format Data
    const formattedCategories = categories.map(c => ({
      ...c,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
    }));

    const formattedProducts = products.map(p => ({
      ...p,
      price: p.price.toString(),
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
    }));

    const formattedPromotions = promotions.map(p => ({
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

    res.json({
      success: true,
      data: {
        categories: formattedCategories,
        products: formattedProducts,
        promotions: formattedPromotions,
      }
    });
  } catch (error) {
    console.error("Error fetching POS menu:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu data' });
  }
});

// ==========================================
// Floor Plans & Tables
// ==========================================
router.get('/floors', async (req: Request, res: Response) => {
  try {
    const floors = await prisma.floor.findMany({
      include: {
        tables: true
      },
      orderBy: { created_at: 'asc' }
    });
    
    // Format dates to string
    const formattedFloors = floors.map(floor => ({
      ...floor,
      created_at: floor.created_at.toISOString(),
      updated_at: floor.updated_at.toISOString(),
      tables: floor.tables.map(table => ({
        ...table,
        created_at: table.created_at.toISOString(),
        updated_at: table.updated_at.toISOString()
      }))
    }));

    res.json({ success: true, data: formattedFloors });
  } catch (error) {
    console.error("Error fetching floors:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch floors' });
  }
});

// ==========================================
// ==========================================
// Order History
// ==========================================
router.get('/history', async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.userId;
    const orders = await prisma.order.findMany({
      where: user_id ? { user_id } : undefined, // Get all orders if not specified, or just current user
      include: {
        items: {
          include: { product: true }
        },
        customer: true,
        diningTable: true
      },
      orderBy: { created_at: 'desc' },
      take: 50 // Limit to last 50 for performance
    });

    const formattedOrders = orders.map(o => ({
      ...o,
      subtotal: o.subtotal.toString(),
      discount_total: o.discount_total.toString(),
      tax_total: o.tax_total.toString(),
      grand_total: o.grand_total.toString(),
      created_at: o.created_at.toISOString(),
      updated_at: o.updated_at.toISOString(),
      items: o.items.map(i => ({
        ...i,
        unit_price: i.unit_price.toString(),
        total_price: i.total_price.toString(),
        created_at: i.created_at.toISOString(),
        updated_at: i.updated_at.toISOString(),
      }))
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch order history' });
  }
});

// ==========================================
// Active Orders for KDS
// ==========================================
router.get('/active-orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED'] }
      },
      include: {
        items: {
          include: { product: true }
        },
        customer: true,
        diningTable: true
      },
      orderBy: { created_at: 'asc' }
    });

    const formattedOrders = orders.map(o => ({
      ...o,
      subtotal: o.subtotal.toString(),
      discount_total: o.discount_total.toString(),
      tax_total: o.tax_total.toString(),
      grand_total: o.grand_total.toString(),
      created_at: o.created_at.toISOString(),
      updated_at: o.updated_at.toISOString(),
      items: o.items.map(i => ({
        ...i,
        unit_price: i.unit_price.toString(),
        total_price: i.total_price.toString(),
        created_at: i.created_at.toISOString(),
        updated_at: i.updated_at.toISOString(),
      }))
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("Error fetching active orders:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch active orders' });
  }
});

// ==========================================
// Customers Autocomplete
// ==========================================
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search && typeof search === 'string') {
      whereClause = {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      };
    }
    
    const customers = await prisma.customer.findMany({
      where: whereClause,
      take: 10,
      orderBy: { created_at: 'desc' }
    });
    
    const formattedCustomers = customers.map(c => ({
      ...c,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
    }));

    res.json({ success: true, data: formattedCustomers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
});

// ==========================================
// Create Order
// ==========================================
router.post('/orders', async (req: Request, res: Response<ApiResult<IOrder>>) => {
  const { cartItems, appliedCouponCode, dining_table_id, customer_id, customer_details } = req.body;
  const user_id = (req as any).user?.userId; // Set by authMiddleware

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart items are required' });
  }

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'User ID missing. Are you logged in?' });
  }

  try {
    // Re-calculate totals on the server to prevent client-side tampering
    const activePromotions = await prisma.promotion.findMany({ where: { is_active: true } });
    
    // Map promos for pricing engine
    const mappedPromos: IPromotion[] = activePromotions.map(p => ({
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

    const pricing = calculateOrderTotal(cartItems, mappedPromos, appliedCouponCode);

    let final_customer_id = customer_id;
    if (!final_customer_id && customer_details && customer_details.full_name) {
      // Find or create customer by phone or create new
      if (customer_details.phone) {
        const existing = await prisma.customer.findFirst({ where: { phone: customer_details.phone } });
        if (existing) {
          final_customer_id = existing.id;
        }
      }
      
      if (!final_customer_id) {
        const newCustomer = await prisma.customer.create({
          data: { 
            full_name: customer_details.full_name, 
            phone: customer_details.phone || null, 
            email: customer_details.email || null 
          }
        });
        final_customer_id = newCustomer.id;
      }
    }

    // Create the order in DB
    const order = await prisma.order.create({
      data: {
        user_id,
        dining_table_id,
        customer_id: final_customer_id,
        status: 'PENDING',
        subtotal: pricing.subtotal,
        discount_total: pricing.discount_total,
        tax_total: pricing.tax_total,
        grand_total: pricing.grand_total,
        items: {
          create: cartItems.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            item_status: 'QUEUED',
          }))
        }
      },
      include: { 
        items: {
          include: { product: true }
        },
        customer: true,
        diningTable: true
      }
    });

    // Update sales_count and decrement stock for products
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.product_id },
        data: {
          sales_count: { increment: item.quantity },
          stock_quantity: { decrement: item.quantity }
        }
      });
    }

    const formattedOrder = {
      ...order,
      subtotal: order.subtotal.toString(),
      discount_total: order.discount_total.toString(),
      tax_total: order.tax_total.toString(),
      grand_total: order.grand_total.toString(),
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      status: order.status as OrderStatus,
      items: order.items.map((item: any) => ({
        ...item,
        unit_price: item.unit_price.toString(),
        total_price: item.total_price.toString(),
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
      }))
    } as unknown as IOrder;

    res.status(201).json({ success: true, data: formattedOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

export default router;
