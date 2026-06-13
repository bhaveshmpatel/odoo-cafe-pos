import { Router, Request, Response } from 'express';
import prisma from '@repo/database';
import { ApiResult, IProduct, ICategory, IFloor, IDiningTable, IPromotion, PromotionType, DiscountType } from '@repo/shared-types';

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

export default router;
