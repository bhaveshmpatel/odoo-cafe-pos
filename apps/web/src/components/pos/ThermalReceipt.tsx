"use client";

import { CartItem, PricingResult } from "@repo/shared-types";

interface Props {
  cartItems: CartItem[];
  pricing: PricingResult;
  orderNumber: string;
  paymentMethod: string;
}

export function ThermalReceipt({ cartItems, pricing, orderNumber, paymentMethod }: Props) {
  return (
    // 'hidden' on screen, 'block' when printing. Max width 80mm standard.
    <div className="hidden print:block print:fixed print:inset-0 print:z-[99999] print:bg-white print:w-screen print:h-screen print:text-black font-mono text-xs p-8">
      <div className="max-w-[80mm] mx-auto">
      <div className="text-center font-bold text-lg mb-2">
        ☕ ODOO CAFE
      </div>
      <div className="text-center text-xs mb-4">
        123 Coffee Street, Tech District<br/>
        Tax ID: 12-3456789
      </div>
      
      <div className="border-b border-dashed border-black mb-2 pb-2 flex justify-between">
        <span>Order #{orderNumber}</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
      
      <div className="mb-2">
        {cartItems.map(item => (
          <div key={`${item.product_id}-${item.modifiers?.join(',')}`} className="mb-1 flex flex-col">
            <div className="flex justify-between">
              <span className="font-medium">{item.quantity}x {item.product_name}</span>
              <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="pl-4 text-[10px] text-gray-800">
                {item.modifiers.map(m => `+ ${m}`).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="border-t border-dashed border-black mt-2 pt-2">
        <div className="flex justify-between mb-1">
          <span>Subtotal</span>
          <span>${pricing.subtotal.toFixed(2)}</span>
        </div>
        {pricing.discount_total > 0 && (
          <div className="flex justify-between mb-1">
            <span>Discount</span>
            <span>-${pricing.discount_total.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between mb-1">
          <span>Tax</span>
          <span>${pricing.tax_total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="border-t border-black mt-2 pt-2 flex justify-between font-bold text-sm">
        <span>GRAND TOTAL</span>
        <span>${pricing.grand_total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>Payment Method</span>
        <span className="uppercase">{paymentMethod}</span>
      </div>
      
      <div className="text-center mt-6 text-[10px]">
        Thank you for your visit!<br/>
        Please come again.
      </div>
      </div>
    </div>
  );
}
