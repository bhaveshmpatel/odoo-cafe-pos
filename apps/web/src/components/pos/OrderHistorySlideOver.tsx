"use client";

import { useEffect, useState } from "react";
import { X, Clock, Receipt, RefreshCw } from "lucide-react";
import { IOrder } from "@repo/shared-types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export function OrderHistorySlideOver({ isOpen, onClose, token }: Props) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/pos/history`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch order history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 text-slate-800">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold">Past Orders</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchOrders}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {loading ? (
            <div className="text-center text-slate-500 mt-10">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-slate-500 mt-10 flex flex-col items-center">
              <Receipt className="w-12 h-12 mb-3 text-slate-300" />
              <p>No orders found for this shift.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white border rounded-xl p-4 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Order #{order.order_number}</span>
                    <div className="text-sm font-medium text-slate-800 mt-1">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(parseFloat(order.grand_total as string))}
                    </span>
                    <div className={`text-xs mt-1 font-medium ${
                      order.status === 'COMPLETED' ? 'text-green-600' :
                      order.status === 'PENDING' ? 'text-amber-500' :
                      'text-indigo-600'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-slate-600">
                      <span>{item.quantity}x {item.product?.name || 'Unknown'}</span>
                      <span>{formatCurrency(parseFloat(item.total_price))}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
