import { PromotionType, DiscountType, IPromotion, CartItem, PricingResult, AppliedPromotion } from '../index';

/**
 * Evaluates order total and applies automated promotions.
 *
 * Execution Order:
 * 1. Base Subtotal
 * 2. Product Minimum Quantity Promos
 * 3. Order Minimum Amount Promos
 * 4. Manual Coupons
 * 4a. Manual Overrides
 * 5. Tax Calculation
 * 6. Grand Total
 *
 * @param cartItems - Array of active items in the cart
 * @param activePromotions - Array of all currently active promotions
 * @param appliedCouponCode - Optional manual coupon code applied by cashier
 * @param manualDiscountType - Optional manual override discount type
 * @param manualDiscountValue - Optional manual override discount value
 * @param taxRate - Percentage tax rate (e.g., 5 for 5%)
 * @returns The final pricing breakdown
 */
export const calculateOrderTotal = (
  cartItems: CartItem[],
  activePromotions: IPromotion[],
  appliedCouponCode?: string | null,
  manualDiscountType?: DiscountType | null,
  manualDiscountValue?: number | null,
  taxRate: number = 5
): PricingResult => {
  // 1. Base Subtotal
  let subtotal = 0;
  // Deep copy cart items to adjust unit prices/totals based on product promos if needed
  // But standard POS usually just calculates discount as a separate line item.
  for (const item of cartItems) {
    subtotal += item.total_price;
  }

  // 2. Evaluate all potential promotions independently
  const potentialPromotions = new Map<string, AppliedPromotion>();

  // Helper to add or update a potential promo
  const addPotentialPromo = (promo: AppliedPromotion) => {
    if (potentialPromotions.has(promo.promotion_id)) {
      const existing = potentialPromotions.get(promo.promotion_id)!;
      existing.discount_amount += promo.discount_amount;
    } else {
      potentialPromotions.set(promo.promotion_id, promo);
    }
  };

  // Group promos by type
  const minQtyPromos = activePromotions.filter(p => p.type === PromotionType.MIN_QUANTITY);
  const minAmtPromos = activePromotions.filter(p => p.type === PromotionType.MIN_AMOUNT);

  // A. Product Minimum Quantity Promos
  for (const item of cartItems) {
    const promo = minQtyPromos.find(p => p.product_id === item.product_id);
    if (promo && promo.min_quantity && item.quantity >= promo.min_quantity) {
      let itemDiscount = 0;
      const promoDiscountValue = Number(promo.discount_value);

      if (promo.discount_type === DiscountType.PERCENTAGE) {
        itemDiscount = item.total_price * (promoDiscountValue / 100);
      } else if (promo.discount_type === DiscountType.FIXED) {
        itemDiscount = promoDiscountValue;
      }

      itemDiscount = Math.min(itemDiscount, item.total_price);

      if (itemDiscount > 0) {
        addPotentialPromo({
          promotion_id: promo.id,
          promotion_name: promo.name,
          discount_amount: itemDiscount,
          type: PromotionType.MIN_QUANTITY,
        });
      }
    }
  }

  // B. Order Minimum Amount Promos
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
        addPotentialPromo({
          promotion_id: promo.id,
          promotion_name: promo.name,
          discount_amount: amtDiscount,
          type: PromotionType.MIN_AMOUNT,
        });
      }
    }
  }

  // C. Manual Coupons from Dropdown
  if (appliedCouponCode) {
    const coupon = activePromotions.find(p => p.coupon_code === appliedCouponCode || p.id === appliedCouponCode);
    if (coupon) {
      let couponDiscount = 0;
      const promoDiscountValue = Number(coupon.discount_value);

      if (coupon.discount_type === DiscountType.PERCENTAGE) {
        couponDiscount = subtotal * (promoDiscountValue / 100);
      } else if (coupon.discount_type === DiscountType.FIXED) {
        couponDiscount = promoDiscountValue;
      }

      if (couponDiscount > 0) {
        addPotentialPromo({
          promotion_id: coupon.id,
          promotion_name: coupon.name,
          discount_amount: couponDiscount,
          type: PromotionType.COUPON,
        });
      }
    }
  }

  // D. Manual Overrides (Cashier custom discount)
  if (manualDiscountType && manualDiscountValue) {
    let overrideDiscount = 0;
    if (manualDiscountType === DiscountType.PERCENTAGE) {
      overrideDiscount = subtotal * (manualDiscountValue / 100);
    } else if (manualDiscountType === DiscountType.FIXED) {
      overrideDiscount = manualDiscountValue;
    }
    
    if (overrideDiscount > 0) {
      addPotentialPromo({
        promotion_id: "MANUAL_OVERRIDE",
        promotion_name: "Manual Discount",
        discount_amount: overrideDiscount,
        type: PromotionType.COUPON,
      });
    }
  }

  // 3. Pick the SINGLE best promotion (Highest Discount Amount)
  let bestPromotion: AppliedPromotion | null = null;
  let totalDiscount = 0;
  const appliedPromotions: AppliedPromotion[] = [];

  for (const promo of potentialPromotions.values()) {
    if (!bestPromotion || promo.discount_amount > bestPromotion.discount_amount) {
      bestPromotion = promo;
    }
  }

  if (bestPromotion) {
    totalDiscount = Math.min(bestPromotion.discount_amount, subtotal);
    bestPromotion.discount_amount = totalDiscount;
    appliedPromotions.push(bestPromotion);
  }

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
