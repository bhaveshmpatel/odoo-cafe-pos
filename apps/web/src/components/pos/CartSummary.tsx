"use client";

import { useState } from "react";
import { IPromotion, calculateOrderTotal } from "@repo/shared-types";
import { usePosStore } from "@/store/usePosStore";
import { Plus, Minus, Trash2, MapPin } from "lucide-react";
import { PaymentModal } from "./PaymentModal";

interface Props {
  promotions: IPromotion[];
  onOpenFloor: () => void;
  token: string;
}

export function CartSummary({ promotions, onOpenFloor, token }: Props) {
  const activeTableId = usePosStore((state) => state.activeTableId);
  const activeTableName = usePosStore((state) => state.activeTableName);
  const carts = usePosStore((state) => state.carts);
  const updateQuantity = usePosStore((state) => state.updateQuantity);
  const removeFromCart = usePosStore((state) => state.removeFromCart);
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const cartItems = activeTableId ? carts[activeTableId] || [] : [];
  
  // Calculate base totals (no manual overrides yet, those happen in the PaymentModal)
  const basePricing = calculateOrderTotal(cartItems, promotions, null);

  return (
    <>
      <div className="flex flex-col h-full bg-surface-card border-l border-hairline print:hidden">
        {/* Header */}
        <div className="p-4 border-b border-hairline bg-canvas flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-ink">Current Order</h2>
            <p className="text-xs text-muted">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>
          <button 
            onClick={onOpenFloor}
            className="flex items-center gap-2 bg-surface-soft hover:bg-surface-strong px-3 py-1.5 rounded-lg border border-hairline transition-colors"
          >
            <MapPin className="w-4 h-4 text-brand-accent" />
            <span className="text-sm font-medium text-ink">
              {activeTableName ? activeTableName : (activeTableId ? `Table ${activeTableId.slice(0,4)}` : "Select Table")}
            </span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product_id} className="flex flex-col bg-canvas p-3 rounded-xl border border-hairline">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {item.category_color && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.category_color }} />
                    )}
                    <span className="font-medium text-sm text-ink">{item.product_name}</span>
                  </div>
                  <span className="font-semibold text-sm text-ink">₹{item.total_price.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted">₹{item.unit_price.toFixed(2)} each</span>
                  <div className="flex items-center gap-3 bg-surface-soft rounded-lg border border-hairline p-1">
                    <button 
                      onClick={() => item.quantity === 1 ? removeFromCart(activeTableId!, item.product_id) : updateQuantity(activeTableId!, item.product_id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-canvas rounded shadow-sm text-ink hover:text-error transition-colors"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    </button>
                    <span className="text-sm font-medium w-4 text-center text-ink">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(activeTableId!, item.product_id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-canvas rounded shadow-sm text-ink hover:text-brand-accent transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary */}
        <div className="p-4 bg-canvas border-t border-hairline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-ink font-medium">₹{basePricing.subtotal.toFixed(2)}</span>
            </div>
            
            {basePricing.discount_total > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span className="font-medium">-₹{basePricing.discount_total.toFixed(2)}</span>
              </div>
            )}
            
            {basePricing.applied_promotions.map(promo => (
              <div key={promo.promotion_id} className="flex justify-between text-xs text-success pl-2">
                <span>↳ {promo.promotion_name}</span>
              </div>
            ))}

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">Tax ({basePricing.tax_rate}%)</span>
              <span className="font-semibold text-ink">₹{basePricing.tax_total.toFixed(2)}</span>
            </div>
            
            <div className="h-px w-full bg-hairline my-1" />
            
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-ink">Total</span>
              <span className="text-2xl font-bold text-ink">₹{basePricing.grand_total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsPaymentOpen(true)}
            disabled={cartItems.length === 0}
            className="w-full bg-brand-accent text-on-primary py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pay ₹{basePricing.grand_total.toFixed(2)}
          </button>
        </div>
      </div>

      {isPaymentOpen && (
        <PaymentModal 
          onClose={() => setIsPaymentOpen(false)} 
          cartItems={cartItems}
          basePricing={basePricing}
          promotions={promotions}
          token={token}
        />
      )}
    </>
  );
}
