'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PricingResult } from '@repo/shared-types';
import { usePosStore } from '@/store/usePosStore';
import { fetcher } from '@/lib/api';
import { X, CheckCircle, Smartphone, Banknote, CreditCard } from 'lucide-react';
import { io } from 'socket.io-client';

interface PaymentModalProps {
  onClose: () => void;
  pricing: PricingResult;
  appliedCoupon: string;
}

type PaymentMethod = 'CASH' | 'CARD' | 'UPI';

export default function PaymentModal({ onClose, pricing, appliedCoupon }: PaymentModalProps) {
  const { activeTableId, getActiveCart, clearCart } = usePosStore();
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const cart = getActiveCart();
  const grandTotal = pricing.grand_total;
  
  // Dynamic UPI URL
  // Format: upi://pay?pa=[upi_id]&pn=OdooCafe&am=[grand_total]&cu=INR
  const upiId = 'odoocafe@upi'; // Normally from env/config
  const upiUrl = `upi://pay?pa=${upiId}&pn=OdooCafe&am=${grandTotal.toFixed(2)}&cu=INR`;

  const handleProcessPayment = async () => {
    if (!activeTableId) return;
    setIsProcessing(true);

    try {
      // 1. Submit Order to API
      const response = await fetcher('/api/pos/orders', {
        method: 'POST',
        body: JSON.stringify({
          cartItems: cart,
          appliedCouponCode: appliedCoupon || null,
          dining_table_id: activeTableId,
          customer_id: null, // Optionally add customer selection later
        }),
      });

      const newOrder = response.data;

      // 2. Emit Socket Event for KDS
      // (Wait, Socket.io is best initialized centrally, but for simplicity here)
      const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      socket.emit('pos_send_order', {
        order: newOrder,
        items: newOrder.items,
        table_id: activeTableId,
      });

      // 3. Clear cart and show success
      clearCart(activeTableId);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        // Disconnect socket after a short delay
        socket.disconnect();
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cashAmount = Number(cashReceived) || 0;
  const change = Math.max(0, cashAmount - grandTotal);
  const canCheckout = method !== 'CASH' || cashAmount >= grandTotal;

  if (success) {
    return (
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-canvas w-full max-w-md p-8 rounded-2xl shadow-card flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-success" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Payment Successful!</h2>
          <p className="text-muted">Order sent to KDS successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-canvas w-full max-w-3xl flex rounded-2xl shadow-card overflow-hidden">
        
        {/* Left: Summary */}
        <div className="w-1/2 bg-surface-soft p-8 border-r border-hairline flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-primary">Checkout</h2>
            <button onClick={onClose} className="p-2 hover:bg-surface-strong rounded-full transition-colors">
              <X size={24} className="text-body" />
            </button>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between text-body text-lg">
              <span>Items ({cart.length})</span>
              <span>₹{pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.discount_total > 0 && (
              <div className="flex justify-between text-success text-lg">
                <span>Discounts</span>
                <span>-₹{pricing.discount_total.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-body text-lg">
              <span>Tax ({pricing.tax_rate}%)</span>
              <span>₹{pricing.tax_total.toFixed(2)}</span>
            </div>
            <div className="border-t border-hairline pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl text-primary">Amount Due</span>
                <span className="font-bold text-3xl text-brand-accent">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Methods */}
        <div className="w-1/2 bg-canvas p-8 flex flex-col">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Payment Method</h3>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => setMethod('CASH')}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                method === 'CASH' ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' : 'border-hairline text-body hover:border-brand-accent/50'
              }`}
            >
              <Banknote size={24} />
              <span className="font-medium text-sm">Cash</span>
            </button>
            <button
              onClick={() => setMethod('CARD')}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                method === 'CARD' ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' : 'border-hairline text-body hover:border-brand-accent/50'
              }`}
            >
              <CreditCard size={24} />
              <span className="font-medium text-sm">Card</span>
            </button>
            <button
              onClick={() => setMethod('UPI')}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                method === 'UPI' ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' : 'border-hairline text-body hover:border-brand-accent/50'
              }`}
            >
              <Smartphone size={24} />
              <span className="font-medium text-sm">UPI</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {method === 'CASH' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-body mb-2">Cash Received (₹)</label>
                  <input
                    type="number"
                    autoFocus
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full text-2xl p-4 bg-surface-soft border border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    placeholder={grandTotal.toFixed(2)}
                  />
                </div>
                {cashAmount > 0 && (
                  <div className="flex justify-between items-center p-4 bg-success/10 rounded-xl border border-success/20">
                    <span className="font-medium text-success">Change to return</span>
                    <span className="font-bold text-xl text-success">₹{change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {method === 'CARD' && (
              <div className="text-center text-muted">
                <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                <p>Send amount to card terminal...</p>
              </div>
            )}

            {method === 'UPI' && (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-xl border border-hairline shadow-sm">
                  <QRCodeSVG value={upiUrl} size={160} level="M" />
                </div>
                <p className="mt-4 text-sm font-medium text-body">Scan with any UPI App</p>
                <p className="text-xs text-muted mt-1">odoocafe@upi</p>
              </div>
            )}
          </div>

          <button
            onClick={handleProcessPayment}
            disabled={!canCheckout || isProcessing}
            className="w-full mt-8 py-4 bg-brand-accent text-on-primary rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isProcessing ? 'Processing...' : `Confirm & Pay ₹${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
