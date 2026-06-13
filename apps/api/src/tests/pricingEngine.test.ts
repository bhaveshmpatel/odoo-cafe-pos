import { PromotionType, DiscountType, IPromotion, CartItem } from '@repo/shared-types';
import { calculateOrderTotal } from '../utils/pricingEngine.js';

// Mock Data
const cartItems: CartItem[] = [
  { product_id: 'prod1', product_name: 'Espresso', unit_price: 120, quantity: 3, total_price: 360 }, // 3 Espressos
  { product_id: 'prod2', product_name: 'Samosa', unit_price: 40, quantity: 2, total_price: 80 },    // 2 Samosas
]; // Base Subtotal: 440

const activePromotions: IPromotion[] = [
  {
    id: 'promo1',
    name: 'Buy 3 Espressos 10% Off',
    type: PromotionType.MIN_QUANTITY,
    discount_type: DiscountType.PERCENTAGE,
    discount_value: '10', // 10% off
    min_quantity: 3,
    min_order_amount: null,
    coupon_code: null,
    product_id: 'prod1',
    description: null,
    is_active: true,
    starts_at: null,
    ends_at: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: 'promo2',
    name: 'Flat 50 Off on 400+',
    type: PromotionType.MIN_AMOUNT,
    discount_type: DiscountType.FIXED,
    discount_value: '50', // 50 off
    min_quantity: null,
    min_order_amount: '400',
    coupon_code: null,
    product_id: null,
    description: null,
    is_active: true,
    starts_at: null,
    ends_at: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: 'promo3',
    name: 'Coupon 20% Off',
    type: PromotionType.COUPON,
    discount_type: DiscountType.PERCENTAGE,
    discount_value: '20', // 20% off
    min_quantity: null,
    min_order_amount: null,
    coupon_code: 'WINTER20',
    product_id: null,
    description: null,
    is_active: true,
    starts_at: null,
    ends_at: null,
    created_at: '',
    updated_at: ''
  }
];

const result1 = calculateOrderTotal(cartItems, activePromotions, null, 5);
console.log('Result 1 (No Coupon):', JSON.stringify(result1, null, 2));
// Expected: Subtotal 440
// Promo 1 (Min Qty): 10% off 360 = 36
// Promo 2 (Min Amt): 50 off
// Total Discount: 86
// Taxable: 440 - 86 = 354
// Tax (5%): 17.70
// Grand Total: 371.70

const result2 = calculateOrderTotal(cartItems, activePromotions, 'WINTER20', 5);
console.log('Result 2 (With Coupon):', JSON.stringify(result2, null, 2));
// Expected: Same as above + Coupon (20% off 440 = 88)
// Total Discount: 86 + 88 = 174
// Taxable: 440 - 174 = 266
// Tax (5%): 13.30
// Grand Total: 279.30
