'use client';

import { useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { Trash2, Plus, Minus, Tag, CreditCard } from 'lucide-react';
import PaymentModal from './PaymentModal';

export default function CartSummary() {
  const { activeTableId, getActiveCart, getActiveCartPricing, updateItemQuantity, clearCart } = usePosStore();
  const cart = getActiveCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const pricing = getActiveCartPricing(appliedCoupon);

  if (!activeTableId) {
    return (
      <div className="w-96 bg-canvas border-l border-hairline flex flex-col items-center justify-center p-8 shrink-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-10">
        <div className="w-16 h-16 bg-surface-strong rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🍽️</span>
        </div>
        <p className="text-muted text-center">Please select a table to start an order.</p>
      </div>
    );
  }

  return (
    <div className="w-96 bg-canvas border-l border-hairline flex flex-col shrink-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-10 h-full">
      {/* Header */}
      <div className="p-4 border-b border-hairline bg-surface-soft flex justify-between items-center shrink-0">
        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
          Table #{activeTableId.slice(-4)}
        </h3>
        <button 
          onClick={() => clearCart(activeTableId)}
          className="text-error/80 hover:text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
          title="Clear Cart"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted">
            Cart is empty
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product_id} className="flex gap-3 bg-surface-soft p-3 rounded-xl border border-hairline">
              <div className="flex-1">
                <h4 className="font-medium text-primary text-sm">{item.product_name}</h4>
                <p className="text-muted text-xs">₹{item.unit_price}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-bold text-primary">₹{item.total_price}</span>
                <div className="flex items-center gap-2 mt-2 bg-canvas rounded-lg border border-hairline p-0.5 shadow-sm">
                  <button 
                    onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-body hover:bg-surface-strong rounded"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-body hover:bg-surface-strong rounded"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pricing Summary */}
      <div className="bg-surface-soft p-4 border-t border-hairline shrink-0">
        {/* Coupon Input */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Coupon code" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-hairline rounded-lg focus:outline-none focus:border-brand-accent uppercase"
            />
          </div>
          <button 
            onClick={() => setAppliedCoupon(couponCode)}
            className="px-4 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-body">
            <span>Subtotal</span>
            <span className="font-medium">₹{pricing.subtotal.toFixed(2)}</span>
          </div>
          
          {pricing.applied_promotions.map((promo, idx) => (
            <div key={idx} className="flex justify-between text-success">
              <span>{promo.promotion_name}</span>
              <span className="font-medium">-₹{promo.discount_amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between text-body">
            <span>Tax ({pricing.tax_rate}%)</span>
            <span className="font-medium">₹{pricing.tax_total.toFixed(2)}</span>
          </div>

          <div className="border-t border-hairline pt-3 mt-3 flex justify-between items-center">
            <span className="font-bold text-lg text-primary">Total</span>
            <span className="font-bold text-2xl text-brand-accent">₹{pricing.grand_total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button 
          disabled={cart.length === 0}
          onClick={() => setIsPaymentOpen(true)}
          className="w-full mt-4 py-4 bg-brand-accent text-on-primary rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <CreditCard size={20} />
          Charge ₹{pricing.grand_total.toFixed(2)}
        </button>
      </div>

      {isPaymentOpen && (
        <PaymentModal 
          onClose={() => setIsPaymentOpen(false)} 
          pricing={pricing} 
          appliedCoupon={appliedCoupon}
        />
      )}
    </div>
  );
}
