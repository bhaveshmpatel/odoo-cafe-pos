import { Router, Request, Response } from 'express';
import prisma from '@repo/database';
import { ApiResult, ICategory, IProduct, IPromotion, IOrder, PromotionType, DiscountType, OrderStatus } from '@repo/shared-types';
import { calculateOrderTotal } from '../utils/pricingEngine.js';

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
    res.status(500).json({ success: false, error: 'Failed to fetch menu data' });
  }
});

// ==========================================
// Create Order
// ==========================================
router.post('/orders', async (req: Request, res: Response<ApiResult<IOrder>>) => {
  const { cartItems, appliedCouponCode, dining_table_id, customer_id } = req.body;
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

    // Create the order in DB
    const order = await prisma.order.create({
      data: {
        user_id,
        dining_table_id,
        customer_id,
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
      include: { items: true }
    });

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
