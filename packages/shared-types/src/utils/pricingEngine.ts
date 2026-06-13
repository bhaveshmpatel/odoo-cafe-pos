import { PromotionType, DiscountType, IPromotion, CartItem, PricingResult, AppliedPromotion } from '../index';

/**
 * Evaluates order total and applies automated promotions.
 *
 * Execution Order:
 * 1. Base Subtotal
 * 2. Product Minimum Quantity Promos
 * 3. Order Minimum Amount Promos
 * 4. Manual Coupons
 * 5. Tax Calculation
 * 6. Grand Total
 *
 * @param cartItems - Array of active items in the cart
 * @param activePromotions - Array of all currently active promotions
 * @param appliedCouponCode - Optional manual coupon code applied by cashier
 * @param taxRate - Percentage tax rate (e.g., 5 for 5%)
 * @returns The final pricing breakdown
 */
export const calculateOrderTotal = (
  cartItems: CartItem[],
  activePromotions: IPromotion[],
  appliedCouponCode?: string | null,
  taxRate: number = 5
): PricingResult => {
  // 1. Base Subtotal
  let subtotal = 0;
  // Deep copy cart items to adjust unit prices/totals based on product promos if needed
  // But standard POS usually just calculates discount as a separate line item.
  for (const item of cartItems) {
    subtotal += item.total_price;
  }

  let totalDiscount = 0;
  const appliedPromotions: AppliedPromotion[] = [];

  // Group promos by type
  const minQtyPromos = activePromotions.filter(p => p.type === PromotionType.MIN_QUANTITY);
  const minAmtPromos = activePromotions.filter(p => p.type === PromotionType.MIN_AMOUNT);
  const couponPromos = activePromotions.filter(p => p.type === PromotionType.COUPON);

  // 2. Product Minimum Quantity Promos
  for (const item of cartItems) {
    // Find if there's a min qty promo for this product
    const promo = minQtyPromos.find(p => p.product_id === item.product_id);
    if (promo && promo.min_quantity && item.quantity >= promo.min_quantity) {
      let itemDiscount = 0;
      const promoDiscountValue = Number(promo.discount_value);

      if (promo.discount_type === DiscountType.PERCENTAGE) {
        itemDiscount = item.total_price * (promoDiscountValue / 100);
      } else if (promo.discount_type === DiscountType.FIXED) {
        // Apply fixed discount per qualifying quantity or overall? Usually overall for the line item.
        itemDiscount = promoDiscountValue;
      }

      // Ensure discount doesn't exceed item total
      itemDiscount = Math.min(itemDiscount, item.total_price);

      if (itemDiscount > 0) {
        totalDiscount += itemDiscount;
        appliedPromotions.push({
          promotion_id: promo.id,
          promotion_name: promo.name,
          discount_amount: itemDiscount,
          type: PromotionType.MIN_QUANTITY,
        });
      }
    }
  }

  // 3. Order Minimum Amount Promos
  // Note: Min amount usually applies to Subtotal before other discounts, or after?
  // We'll evaluate based on base subtotal.
  for (const promo of minAmtPromos) {
    const minAmt = Number(promo.min_order_amount);
    if (promo.min_order_amount && subtotal >= minAmt) {
      let amtDiscount = 0;
      const promoDiscountValue = Number(promo.discount_value);

      if (promo.discount_type === DiscountType.PERCENTAGE) {
        amtDiscount = subtotal * (promoDiscountValue / 100);
      } else if (promo.discount_type === DiscountType.FIXED) {
        amtDiscount = promoDiscountValue;
      }

      if (amtDiscount > 0) {
        totalDiscount += amtDiscount;
        appliedPromotions.push({
          promotion_id: promo.id,
          promotion_name: promo.name,
          discount_amount: amtDiscount,
          type: PromotionType.MIN_AMOUNT,
        });
        // We typically only apply ONE min amount promo (the best one), but we'll apply all that match for simplicity,
        // or break if we only want one. Let's just apply all matching for now.
      }
    }
  }

  // 4. Manual Coupons
  if (appliedCouponCode) {
    const coupon = couponPromos.find(p => p.coupon_code === appliedCouponCode);
    if (coupon) {
      let couponDiscount = 0;
      const promoDiscountValue = Number(coupon.discount_value);

      if (coupon.discount_type === DiscountType.PERCENTAGE) {
        couponDiscount = subtotal * (promoDiscountValue / 100);
      } else if (coupon.discount_type === DiscountType.FIXED) {
        couponDiscount = promoDiscountValue;
      }

      if (couponDiscount > 0) {
        totalDiscount += couponDiscount;
        appliedPromotions.push({
          promotion_id: coupon.id,
          promotion_name: coupon.name,
          discount_amount: couponDiscount,
          type: PromotionType.COUPON,
        });
      }
    }
  }

  // Ensure total discount doesn't exceed subtotal
  totalDiscount = Math.min(totalDiscount, subtotal);

  // 5. Calculate Tax
  const taxableAmount = subtotal - totalDiscount;
  const taxTotal = taxableAmount * (taxRate / 100);

  // 6. Grand Total
  const grandTotal = taxableAmount + taxTotal;

  // Helper to round to 2 decimals
  const round2 = (num: number) => Math.round(num * 100) / 100;

  return {
    subtotal: round2(subtotal),
    discount_total: round2(totalDiscount),
    applied_promotions: appliedPromotions.map(p => ({ ...p, discount_amount: round2(p.discount_amount) })),
    tax_rate: taxRate,
    tax_total: round2(taxTotal),
    grand_total: round2(grandTotal),
  };
};
