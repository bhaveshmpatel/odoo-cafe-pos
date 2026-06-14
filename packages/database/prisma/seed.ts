import { PrismaClient, UserRole, TableShape, PaymentType, PromotionType, DiscountType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Helpers ───────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ─── Seed Data ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Users ──────────────────────────────────────────────────────────────

  const adminPassword = await hashPassword('admin123');
  const employeePassword = await hashPassword('pos123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cafe.com' },
    update: {},
    create: {
      email: 'admin@cafe.com',
      password_hash: adminPassword,
      full_name: 'Admin Owner',
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ User: ${admin.full_name} (${admin.role})`);

  const employee = await prisma.user.upsert({
    where: { email: 'employee@cafe.com' },
    update: {},
    create: {
      email: 'employee@cafe.com',
      password_hash: employeePassword,
      full_name: 'Jane Cashier',
      role: UserRole.EMPLOYEE,
    },
  });
  console.log(`✅ User: ${employee.full_name} (${employee.role})`);

  // ── Categories ─────────────────────────────────────────────────────────

  const categoriesData = [
    { name: 'Hot Beverages', color: '#ef4444', sort_order: 1 },
    { name: 'Cold Beverages', color: '#3b82f6', sort_order: 2 },
    { name: 'Snacks', color: '#f59e0b', sort_order: 3 },
    { name: 'Main Course', color: '#10b981', sort_order: 4 },
    { name: 'Desserts', color: '#8b5cf6', sort_order: 5 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { color: cat.color, sort_order: cat.sort_order },
      create: cat,
    });
    categories[cat.name] = category.id;
    console.log(`✅ Category: ${category.name}`);
  }

  // ── Products ───────────────────────────────────────────────────────────

  const productsData: { name: string; price: number; category: string; description: string; image_url: string }[] = [];
  
  const unsplashImages = {
    'Hot Beverages': [
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80',
    ],
    'Cold Beverages': [
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
    ],
    'Snacks': [
      'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=80', // fries
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80', // sandwich
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', // burger
    ],
    'Main Course': [
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=400&q=80', // pasta
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', // pizza
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', // meat
    ],
    'Desserts': [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', // cake
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80', // desert
      'https://images.unsplash.com/photo-1563805042-7684c8e9e5cb?auto=format&fit=crop&w=400&q=80', // ice cream
    ]
  };

  const adjectives = ['Classic', 'Premium', 'Signature', 'Spicy', 'Sweet', 'Tangy', 'Roasted', 'Creamy', 'Iced', 'Deluxe'];
  const baseItems: Record<string, string[]> = {
    'Hot Beverages': ['Espresso', 'Latte', 'Cappuccino', 'Mocha', 'Americano', 'Macchiato', 'Tea', 'Hot Chocolate'],
    'Cold Beverages': ['Frappe', 'Cold Brew', 'Smoothie', 'Iced Tea', 'Lemonade', 'Shake', 'Cooler', 'Mojito'],
    'Snacks': ['Fries', 'Burger', 'Sandwich', 'Nachos', 'Tacos', 'Wings', 'Wrap', 'Samosa'],
    'Main Course': ['Pizza', 'Pasta', 'Steak', 'Curry', 'Biryani', 'Noodles', 'Bowl', 'Salad'],
    'Desserts': ['Cake', 'Brownie', 'Ice Cream', 'Waffle', 'Crepe', 'Tart', 'Pudding', 'Cheesecake']
  };

  // Generate exactly 200 products evenly distributed across categories (40 per category)
  for (const cat of categoriesData) {
    const items = baseItems[cat.name] || ['Item'];
    const images = unsplashImages[cat.name as keyof typeof unsplashImages] || unsplashImages['Snacks'];
    for (let i = 1; i <= 40; i++) {
      const adj = adjectives[i % adjectives.length];
      const base = items[i % items.length];
      const img = images[i % images.length];
      productsData.push({
        name: `${adj} ${base} ${i}`,
        price: Math.floor(Math.random() * 400) + 50,
        category: cat.name,
        description: `Experience our delicious ${adj.toLowerCase()} ${base.toLowerCase()}, freshly prepared.`,
        image_url: img
      });
    }
  }

  const productIds: Record<string, string> = {};
  for (const prod of productsData) {
    const product = await prisma.product.upsert({
      where: {
        // Use a compound where approach: find by name (we create a helper index below)
        id: (await prisma.product.findFirst({ where: { name: prod.name } }))?.id ?? '',
      },
      update: {
        price: prod.price,
        description: prod.description,
        category_id: categories[prod.category]!,
        image_url: prod.image_url,
      },
      create: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        category_id: categories[prod.category]!,
        image_url: prod.image_url,
      },
    });
    productIds[prod.name] = product.id;
    console.log(`✅ Product: ${product.name} — ₹${product.price}`);
  }

  // ── Floors ─────────────────────────────────────────────────────────────

  const groundFloor = await prisma.floor.upsert({
    where: { name: 'Ground Floor' },
    update: {},
    create: { name: 'Ground Floor', sort_order: 1 },
  });
  console.log(`✅ Floor: ${groundFloor.name}`);

  const firstFloor = await prisma.floor.upsert({
    where: { name: 'First Floor' },
    update: {},
    create: { name: 'First Floor', sort_order: 2 },
  });
  console.log(`✅ Floor: ${firstFloor.name}`);

  // ── Dining Tables ─────────────────────────────────────────────────────

  const tablesData = [
    // Ground Floor — tables 1-4
    {
      table_number: 1, floor_id: groundFloor.id,
      pos_x: 50, pos_y: 50, width: 120, height: 80,
      shape: TableShape.RECTANGLE, capacity: 4,
    },
    {
      table_number: 2, floor_id: groundFloor.id,
      pos_x: 200, pos_y: 50, width: 100, height: 100,
      shape: TableShape.CIRCLE, capacity: 2,
    },
    {
      table_number: 3, floor_id: groundFloor.id,
      pos_x: 350, pos_y: 50, width: 100, height: 100,
      shape: TableShape.SQUARE, capacity: 4,
    },
    {
      table_number: 4, floor_id: groundFloor.id,
      pos_x: 50, pos_y: 200, width: 160, height: 80,
      shape: TableShape.RECTANGLE, capacity: 6,
    },
    // First Floor — tables 1-2
    {
      table_number: 1, floor_id: firstFloor.id,
      pos_x: 50, pos_y: 50, width: 120, height: 120,
      shape: TableShape.CIRCLE, capacity: 4,
    },
    {
      table_number: 2, floor_id: firstFloor.id,
      pos_x: 220, pos_y: 50, width: 140, height: 80,
      shape: TableShape.RECTANGLE, capacity: 6,
    },
  ];

  for (const tbl of tablesData) {
    const table = await prisma.diningTable.upsert({
      where: {
        floor_id_table_number: {
          floor_id: tbl.floor_id,
          table_number: tbl.table_number,
        },
      },
      update: {
        pos_x: tbl.pos_x,
        pos_y: tbl.pos_y,
        width: tbl.width,
        height: tbl.height,
        shape: tbl.shape,
        capacity: tbl.capacity,
      },
      create: tbl,
    });
    console.log(`✅ Table #${table.table_number} on floor ${tbl.floor_id === groundFloor.id ? 'Ground' : 'First'}`);
  }

  // ── Payment Methods ───────────────────────────────────────────────────

  const paymentMethodsData = [
    { name: 'Cash', type: PaymentType.CASH },
    { name: 'Card', type: PaymentType.CARD },
    { name: 'UPI', type: PaymentType.UPI },
  ];

  for (const pm of paymentMethodsData) {
    const method = await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: { type: pm.type },
      create: pm,
    });
    console.log(`✅ Payment Method: ${method.name} (${method.type})`);
  }

  // ── Promotions ────────────────────────────────────────────────────────

  // Promotion 1: Buy 3 Espressos, get 10% off
  const espressoPromo = await prisma.promotion.upsert({
    where: { coupon_code: 'ESPRESSO3' },
    update: {},
    create: {
      name: 'Buy 3 Espressos — 10% Off',
      description: 'Purchase 3 or more Espressos and receive 10% discount on those items.',
      type: PromotionType.MIN_QUANTITY,
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 10,
      min_quantity: 3,
      coupon_code: 'ESPRESSO3',
      product_id: productIds['Espresso'],
      is_active: true,
    },
  });
  console.log(`✅ Promotion: ${espressoPromo.name}`);

  // Promotion 2: Orders above ₹500, get ₹50 off
  const orderPromo = await prisma.promotion.upsert({
    where: { coupon_code: 'FLAT50' },
    update: {},
    create: {
      name: 'Flat ₹50 Off on Orders Above ₹500',
      description: 'Get ₹50 off when your order total exceeds ₹500.',
      type: PromotionType.MIN_AMOUNT,
      discount_type: DiscountType.FIXED,
      discount_value: 50,
      min_order_amount: 500,
      coupon_code: 'FLAT50',
      is_active: true,
    },
  });
  console.log(`✅ Promotion: ${orderPromo.name}`);

  console.log('\n🎉 Seeding completed successfully!');
}

// ─── Execute ───────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
