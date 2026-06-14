"use client";

import { useState, useMemo, useEffect } from "react";
import { X, IndianRupee, CreditCard, QrCode, CheckCircle2, Loader2, Tag, UserCircle, Search, Plus } from "lucide-react";
import { PricingResult, CartItem, IPromotion, DiscountType, PromotionType, calculateOrderTotal } from "@repo/shared-types";
import { usePosStore } from "@/store/usePosStore";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { ThermalReceipt } from "./ThermalReceipt";

interface Props {
  onClose: () => void;
  cartItems: CartItem[];
  basePricing: PricingResult; // Without modal-specific overrides
  promotions: IPromotion[];
  token: string;
}

export function PaymentModal({ onClose, cartItems, basePricing, promotions, token }: Props) {
  const [method, setMethod] = useState<"CASH" | "CARD" | "UPI">("CASH");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Advanced Pricing Overrides
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  
  const [manualDiscountType, setManualDiscountType] = useState<DiscountType | null>(null);
  const [manualDiscountValue, setManualDiscountValue] = useState<number | null>(null);

  const activeTableId = usePosStore((state) => state.activeTableId);
  const clearCart = usePosStore((state) => state.clearCart);
  const setActiveTable = usePosStore((state) => state.setActiveTable);
  
  // Customer State
  const activeCustomer = usePosStore((state) => activeTableId ? state.activeCustomers[activeTableId] : null);
  const setCustomer = usePosStore((state) => state.setCustomer);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({ full_name: "", phone: "", email: "" });

  const router = useRouter();

  // Handle Autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (customerSearch.length >= 2) {
        setIsSearchingCustomer(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/pos/customers?search=${encodeURIComponent(customerSearch)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setCustomerSuggestions(data.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingCustomer(false);
        }
      } else {
        setCustomerSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch, token]);

  const eligiblePromotions = useMemo(() => {
    return promotions.filter(promo => {
      if (promo.type === PromotionType.MIN_AMOUNT) {
        return promo.min_order_amount && basePricing.subtotal >= Number(promo.min_order_amount);
      }
      if (promo.type === PromotionType.MIN_QUANTITY) {
        if (!promo.product_id || !promo.min_quantity) return false;
        return cartItems.some(item => item.product_id === promo.product_id && item.quantity >= promo.min_quantity!);
      }
      if (promo.type === PromotionType.COUPON) {
        if (promo.min_order_amount && basePricing.subtotal < Number(promo.min_order_amount)) return false;
        if (promo.min_quantity && promo.product_id) {
          const hasQty = cartItems.some(item => item.product_id === promo.product_id && item.quantity >= promo.min_quantity!);
          if (!hasQty) return false;
        }
        return true;
      }
      return true;
    });
  }, [promotions, basePricing.subtotal, cartItems]);

  // Dynamic Pricing Calculation
  const pricing = useMemo(() => {
    return calculateOrderTotal(
      cartItems, 
      promotions, 
      appliedCouponCode, 
      manualDiscountType, 
      manualDiscountValue
    );
  }, [cartItems, promotions, appliedCouponCode, manualDiscountType, manualDiscountValue]);

  const change = Math.max(0, parseFloat(cashTendered || "0") - pricing.grand_total);
  
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/pos/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems,
          dining_table_id: activeTableId,
          appliedCouponCode,
          customer_id: activeCustomer?.id,
          customer_details: !activeCustomer?.id && activeCustomer?.full_name ? activeCustomer : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        
        // Emit WebSocket Event to KDS
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
        socket.emit('pos_send_order', { order: data.data });
        
        // Print Receipt after DOM updates to success screen
        setTimeout(() => {
          window.print();
        }, 150);

        setTimeout(() => {
          if (activeTableId) clearCart(activeTableId);
          socket.disconnect();
          setIsSuccess(false);
          setActiveTable(null);
          onClose();
          router.refresh();
        }, 2000);
      } else {
        alert("Payment failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsProcessing(false);
    }
  };





  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 print:bg-transparent print:backdrop-blur-none">
        <div className="bg-gradient-to-b from-white to-slate-50 rounded-[2rem] shadow-2xl w-full max-w-sm p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 transform-gpu border border-white/50 relative overflow-hidden print:hidden">
          {/* Confetti-like gradient background blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
            <div className="absolute top-20 -right-10 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight relative z-10">Payment Successful</h2>
          <p className="text-slate-500 mb-8 font-medium relative z-10">The order has been dispatched to the kitchen.</p>
          
          <div className="bg-white rounded-2xl p-5 w-full shadow-sm border border-slate-100 mb-2 relative z-10">
            <div className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Total Paid</div>
            <div className="text-4xl font-black text-slate-800">{formatCurrency(pricing.grand_total)}</div>
          </div>
          
          {method === 'CASH' && change > 0 && (
            <div className="bg-emerald-50 rounded-xl p-4 w-full border border-emerald-100 relative z-10">
              <div className="text-sm text-emerald-600/70 font-bold uppercase tracking-widest mb-1">Change Due</div>
              <div className="text-2xl text-emerald-600 font-black">{formatCurrency(change)}</div>
            </div>
          )}
        </div>
        
        {/* Hidden thermal receipt for printing */}
        <ThermalReceipt cartItems={cartItems} pricing={pricing} orderNumber={Math.floor(Math.random() * 10000).toString()} paymentMethod={method} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex overflow-hidden animate-in zoom-in-95 duration-300 h-auto min-h-[500px] border border-white/40">
        
        {/* Left Side: Summary & Promotions */}
        <div className="w-1/2 bg-slate-50 p-6 flex flex-col relative z-10 border-r border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Checkout</h2>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
            {/* Customer Assignment */}
            <div className="bg-white rounded-2xl p-5 mb-4 border border-slate-200 shadow-sm transition-all hover:shadow-md relative">
              <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <UserCircle size={14} className="text-indigo-500" /> Customer
              </h3>

              {activeCustomer ? (
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                  <div>
                    <div className="font-bold text-indigo-900">{activeCustomer.full_name}</div>
                    <div className="text-xs text-indigo-700 font-medium">
                      {activeCustomer.phone || "No phone"} • {activeCustomer.email || "No email"}
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(activeTableId) setCustomer(activeTableId, null); }}
                    className="text-indigo-400 hover:text-indigo-600 p-1 bg-white rounded-lg shadow-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Customer Name or Phone"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setCustomerForm({...customerForm, full_name: e.target.value});
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                    />
                    {isSearchingCustomer && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Loader2 size={16} className="text-indigo-500 animate-spin" />
                      </div>
                    )}
                    
                    {/* Suggestions Dropdown */}
                    {customerSuggestions.length > 0 && customerSearch.length >= 2 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">Suggestions</div>
                        {customerSuggestions.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              if(activeTableId) setCustomer(activeTableId, c);
                              setCustomerSearch("");
                              setCustomerSuggestions([]);
                            }}
                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0"
                          >
                            <div className="font-bold text-slate-800 text-sm">{c.full_name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{c.phone || 'No phone'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Phone (Optional)"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                      className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                      className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  
                  <button 
                    disabled={!customerSearch}
                    onClick={() => {
                      if(activeTableId) setCustomer(activeTableId, {
                        full_name: customerSearch,
                        phone: customerForm.phone,
                        email: customerForm.email
                      });
                      setCustomerSearch("");
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors text-sm disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200"
                  >
                    Set as Customer
                  </button>
                </div>
              )}
            </div>

            {/* Promotions Engine */}
            <div className="bg-white rounded-2xl p-5 mb-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} className="text-indigo-500" /> Discounts & Promos
              </h3>
              
              <div className="flex flex-col gap-2 mb-5">
                <select
                  value={appliedCouponCode || ""}
                  onChange={e => {
                    const code = e.target.value;
                    if (code) {
                      setAppliedCouponCode(code);
                    } else {
                      setAppliedCouponCode(null);
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="">Select a promotion...</option>
                  {eligiblePromotions.map(promo => (
                    <option key={promo.id} value={promo.coupon_code || promo.id}>
                      {promo.name} - {promo.discount_type === DiscountType.PERCENTAGE ? `${promo.discount_value}%` : `₹${promo.discount_value}`} Off
                    </option>
                  ))}
                </select>
              </div>

              {/* No longer need applied coupon display since the select shows it, but keeping manual discount buttons */}

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setManualDiscountType(DiscountType.PERCENTAGE); setManualDiscountValue(10); }}
                  className={`py-3 border rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    manualDiscountType === DiscountType.PERCENTAGE ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  10% Off
                </button>
                <button 
                  onClick={() => { setManualDiscountType(DiscountType.FIXED); setManualDiscountValue(5); }}
                  className={`py-3 border rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    manualDiscountType === DiscountType.FIXED ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  ₹5 Off
                </button>
                {manualDiscountType && (
                  <button 
                    onClick={() => { setManualDiscountType(null); setManualDiscountValue(null); }}
                    className="col-span-2 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors mt-1"
                  >
                    Remove Manual Discount
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-500 font-medium text-sm">
                  <span>Subtotal</span>
                  <span className="text-slate-700">{formatCurrency(pricing.subtotal)}</span>
                </div>
                {pricing.discount_total > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold text-sm">
                    <span>Discount</span>
                    <span>-{formatCurrency(pricing.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 font-medium text-sm">
                  <span>Tax ({pricing.tax_rate.toFixed(2)}%)</span>
                  <span className="text-slate-700">{formatCurrency(pricing.tax_total)}</span>
                </div>
                <div className="w-full h-px bg-slate-100 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  <span className="text-4xl font-black text-slate-800 tracking-tight">{formatCurrency(pricing.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Methods & Numpad */}
        <div className="w-1/2 p-6 flex flex-col bg-white relative z-20">
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors group">
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6 border border-slate-200/50 shadow-inner">
            <button
              onClick={() => setMethod("CASH")}
              className={`flex flex-col items-center gap-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                method === "CASH" ? "bg-white text-indigo-600 shadow-md transform scale-[1.02]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <IndianRupee size={24} className={method === "CASH" ? "text-indigo-600" : "text-slate-400"} />
              Cash
            </button>
            <button
              onClick={() => setMethod("CARD")}
              className={`flex flex-col items-center gap-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                method === "CARD" ? "bg-white text-indigo-600 shadow-md transform scale-[1.02]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <CreditCard size={24} className={method === "CARD" ? "text-indigo-600" : "text-slate-400"} />
              Card
            </button>
            <button
              onClick={() => setMethod("UPI")}
              className={`flex flex-col items-center gap-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                method === "UPI" ? "bg-white text-indigo-600 shadow-md transform scale-[1.02]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <QrCode size={24} className={method === "UPI" ? "text-indigo-600" : "text-slate-400"} />
              UPI
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {method === "CASH" && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 text-center">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Amount Due</div>
                  <div className="text-5xl font-black text-slate-800 tracking-tight">{formatCurrency(pricing.grand_total)}</div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Cash Tendered</label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-2xl font-bold px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                  />
                  {change > 0 && (
                    <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex justify-between items-center">
                      <span className="font-bold text-sm">Change:</span>
                      <span className="text-xl font-black">{formatCurrency(change)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(method === "CARD" || method === "UPI") && (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 shadow-inner p-6 text-center mb-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-6 relative">
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin opacity-20"></div>
                  {method === "CARD" ? <CreditCard size={36} className="text-indigo-500" /> : <QrCode size={36} className="text-indigo-500" />}
                </div>
                <p className="text-xl font-extrabold text-slate-800 mb-2">Ready for {method} payment</p>
                <p className="text-4xl font-black text-indigo-600 tracking-tight">{formatCurrency(pricing.grand_total)}</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing || (method === "CASH" && parseFloat(cashTendered || "0") < pricing.grand_total)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:from-slate-400 disabled:to-slate-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98] mt-auto"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={28} /> : `Complete Payment • ${formatCurrency(pricing.grand_total)}`}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
