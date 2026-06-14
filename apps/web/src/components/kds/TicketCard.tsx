"use client";

import { useState, useEffect } from "react";
import { IOrder, OrderStatus, ItemStatus } from "@repo/shared-types";
import { CheckCircle2, Circle, Clock, Utensils, ShoppingBag } from "lucide-react";

interface Props {
  order: IOrder;
  onUpdateStage: (orderId: string, newStatus: OrderStatus, orderNumber?: number) => void;
  onStrikeItem: (orderId: string, itemId: string, newStatus: ItemStatus) => void;
}

export function TicketCard({ order, onUpdateStage, onStrikeItem }: Props) {
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  useEffect(() => {
    const start = new Date(order.created_at).getTime();
    
    const updateTime = () => {
      const now = new Date().getTime();
      const diff = now - start;
      const minutes = Math.floor(diff / 60000);
      setElapsedMinutes(minutes);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Check every 10 seconds for smoothness
    return () => clearInterval(interval);
  }, [order.created_at]);

  const handleHeaderClick = () => {
    let nextStatus = order.status;
    if (order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PENDING) {
      nextStatus = OrderStatus.PREPARING;
    } else if (order.status === OrderStatus.PREPARING) {
      nextStatus = OrderStatus.COMPLETED;
    }
    
    if (nextStatus !== order.status) {
      onUpdateStage(order.id, nextStatus, order.order_number);
    }
  };

  // Determine Urgency Styles
  let headerColor = "bg-success/10 text-success-dark border-success/20";
  let timerIconColor = "text-success";
  let borderPulse = "border-hairline";
  
  if (elapsedMinutes >= 15) {
    headerColor = "bg-error/10 text-error border-error/30";
    timerIconColor = "text-error";
    borderPulse = "border-error/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse";
  } else if (elapsedMinutes >= 10) {
    headerColor = "bg-warning/10 text-warning-dark border-warning/30";
    timerIconColor = "text-warning";
    borderPulse = "border-warning/50";
  }

  const isDineIn = !!order.dining_table_id;

  return (
    <div className={`bg-surface-card rounded-xl shadow-sm flex flex-col overflow-hidden mb-5 transition-all animate-in fade-in slide-in-from-bottom-4 border-2 ${borderPulse}`}>
      {/* Header */}
      <div 
        onClick={handleHeaderClick}
        className={`${headerColor} p-4 border-b flex flex-col gap-2 cursor-pointer hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center justify-between">
          <div className="font-black text-2xl tracking-tight">
            #{order.order_number}
          </div>
          <div className="flex items-center gap-1.5 text-lg font-bold bg-surface-card px-3 py-1.5 rounded-lg shadow-sm text-ink">
            <Clock className={`w-5 h-5 ${timerIconColor}`} />
            {elapsedMinutes}m
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex items-center gap-2 mt-1">
          {isDineIn ? (
            <span className="flex items-center gap-1.5 bg-brand text-on-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              <Utensils size={14} /> Dine-In {order.diningTable ? `(T${order.diningTable.table_number})` : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-brand-accent text-on-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              <ShoppingBag size={14} /> Takeaway
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="p-2 flex flex-col gap-1.5 bg-surface-soft">
        {order.items?.map(item => {
          const isCompleted = item.item_status === ItemStatus.COMPLETED;
          
          return (
            <div 
              key={item.id}
              onClick={() => onStrikeItem(
                order.id, 
                item.id, 
                isCompleted ? ItemStatus.QUEUED : ItemStatus.COMPLETED
              )}
              className={`
                flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all shadow-sm
                ${isCompleted ? 'bg-surface-strong border-hairline opacity-60 scale-[0.98]' : 'bg-surface-card border-transparent hover:border-brand/30'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-success drop-shadow-sm" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={`font-black text-xl tracking-tight ${isCompleted ? 'line-through text-muted' : 'text-ink'}`}>
                    <span className="text-brand mr-2">{item.quantity}x</span> 
                    {item.product?.name || 'Unknown Product'}
                  </span>
                  
                  {/* Modifiers & Notes (High Contrast) */}
                  {(!isCompleted && (item.modifiers?.length > 0 || item.notes)) && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {item.modifiers?.map((mod, idx) => (
                        <div key={idx} className="inline-block bg-error/10 text-error text-sm font-extrabold uppercase px-2 py-1 rounded w-fit border border-error/20">
                          + {mod}
                        </div>
                      ))}
                      {item.notes && (
                        <div className="inline-block bg-warning/10 text-warning-dark text-sm font-extrabold uppercase px-2 py-1 rounded w-fit border border-warning/20">
                          NOTE: {item.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer / Meta */}
      {(order.customer || order.notes) && (
        <div className="p-4 bg-surface-card border-t-2 border-hairline flex flex-col gap-2">
          {order.customer && (
            <div className="text-sm font-medium text-muted">
              Customer: <span className="font-bold text-ink">{order.customer.full_name}</span>
            </div>
          )}
          {order.notes && (
            <div className="text-sm font-extrabold text-error bg-error/5 p-2 rounded-lg border border-error/10">
              ORDER NOTE: {order.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
