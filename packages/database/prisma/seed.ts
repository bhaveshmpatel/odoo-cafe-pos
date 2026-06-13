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

  const productsData = [
    // Hot Beverages
    { name: 'Espresso', price: 120, category: 'Hot Beverages', description: 'Rich and bold single-shot espresso' },
    { name: 'Cappuccino', price: 150, category: 'Hot Beverages', description: 'Classic cappuccino with steamed milk foam' },
    { name: 'Latte', price: 160, category: 'Hot Beverages', description: 'Smooth espresso with velvety steamed milk' },
    // Cold Beverages
    { name: 'Iced Latte', price: 180, category: 'Cold Beverages', description: 'Chilled espresso over ice with cold milk' },
    { name: 'Cold Brew', price: 200, category: 'Cold Beverages', description: '18-hour slow-steeped cold brew coffee' },
    { name: 'Mango Smoothie', price: 160, category: 'Cold Beverages', description: 'Fresh mango blended with yoghurt' },
    // Snacks
    { name: 'Samosa', price: 40, category: 'Snacks', description: 'Crispy pastry filled with spiced potatoes' },
    { name: 'Veg Sandwich', price: 90, category: 'Snacks', description: 'Grilled sandwich with fresh vegetables' },
    { name: 'French Fries', price: 100, category: 'Snacks', description: 'Crispy golden fries with seasoning' },
    // Main Course
    { name: 'Paneer Tikka', price: 280, category: 'Main Course', description: 'Marinated cottage cheese grilled to perfection' },
    { name: 'Butter Chicken', price: 320, category: 'Main Course', description: 'Tender chicken in creamy tomato gravy' },
    { name: 'Veg Biryani', price: 240, category: 'Main Course', description: 'Fragrant basmati rice with mixed vegetables' },
    // Desserts
    { name: 'Chocolate Brownie', price: 160, category: 'Desserts', description: 'Warm fudgy brownie with chocolate chips' },
    { name: 'Gulab Jamun', price: 80, category: 'Desserts', description: 'Soft milk-solid dumplings in rose syrup' },
    { name: 'Cheesecake Slice', price: 220, category: 'Desserts', description: 'New York-style baked cheesecake' },
  ];

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
      },
      create: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        category_id: categories[prod.category]!,
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
