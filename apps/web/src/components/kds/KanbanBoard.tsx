"use client";

import { useState, useMemo } from "react";
import { IOrder, OrderStatus, ItemStatus } from "@repo/shared-types";
import { TicketCard } from "./TicketCard";
import { History, X, RotateCcw, LogOut } from "lucide-react";

interface Props {
  orders: IOrder[];
  orderHistory?: IOrder[];
  onUpdateStage: (orderId: string, newStatus: OrderStatus, orderNumber?: number) => void;
  onStrikeItem: (orderId: string, itemId: string, newStatus: ItemStatus) => void;
  onRecallOrder?: (orderId: string) => void;
}

export function KanbanBoard({ orders, orderHistory = [], onUpdateStage, onStrikeItem, onRecallOrder }: Props) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // Filter active orders based on their status
  const toCookOrders = orders.filter(o => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.PENDING);
  const preparingOrders = orders.filter(o => o.status === OrderStatus.PREPARING);
  // Bring back completed orders column, or if they are in history, just map the active orders that are marked completed but not bumped?
  // Wait, in my store bumpOrder removes it from activeOrders and puts it in orderHistory.
  // We can show `orderHistory` as the "Prepared" column, or change the logic so COMPLETED is still active, and only bumped is in history.
  // Let's change the store or just show orderHistory in the Completed column.
  const completedOrders = orderHistory.slice(0, 20); // show up to 20 recently completed in the column

  // Master Prep List Calculation
  const masterPrepList = useMemo(() => {
    const counts: Record<string, number> = {};
    const active = [...toCookOrders, ...preparingOrders];
    
    active.forEach(order => {
      order.items?.forEach(item => {
        if (item.item_status !== ItemStatus.COMPLETED) {
          const name = item.product?.name || "Unknown";
          counts[name] = (counts[name] || 0) + item.quantity;
        }
      });
    });
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [toCookOrders, preparingOrders]);

  return (
    <div className="flex flex-col h-full w-full bg-canvas overflow-hidden text-ink">
      
      {/* EXPO HEADER - Master Prep List */}
      <div className="bg-surface-card border-b border-hairline p-3 shadow-sm z-20 flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar flex-1 mr-4 pb-1">
          <div className="text-sm font-bold text-muted uppercase tracking-widest shrink-0">
            🔥 To Cook:
          </div>
          {masterPrepList.length === 0 ? (
            <span className="text-muted font-medium">No pending items</span>
          ) : (
            masterPrepList.map(([name, count]) => (
              <div key={name} className="flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-lg shrink-0 border border-brand/20">
                <span className="font-bold text-lg">{count}</span>
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 bg-ink hover:bg-ink-dark text-on-primary px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <History size={18} />
            History
          </button>
          
          <button 
            onClick={() => setIsSignOutOpen(true)}
            className="flex items-center gap-2 bg-error/10 hover:bg-error/20 text-error px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {isSignOutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <div className="bg-canvas p-6 rounded-2xl shadow-xl max-w-sm w-full flex flex-col gap-4 animate-in zoom-in-95">
            <h2 className="text-xl font-black text-ink">Confirm Sign Out</h2>
            <p className="text-muted font-medium">Are you sure you want to sign out of the Kitchen Display?</p>
            <div className="flex items-center gap-3 mt-4">
              <button 
                onClick={() => setIsSignOutOpen(false)}
                className="flex-1 py-2.5 rounded-lg font-bold text-ink bg-surface-soft hover:bg-surface-strong transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  import("next-auth/react").then((mod) => {
                    mod.signOut({ callbackUrl: '/signin' });
                  });
                }}
                className="flex-1 py-2.5 rounded-lg font-bold text-white bg-error hover:bg-error/90 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Column 1: To Cook */}
        <div className="flex-1 flex flex-col h-full border-r border-hairline bg-surface-soft/30">
          <div className="bg-surface-card p-4 border-b border-hairline flex items-center justify-between shadow-sm z-10">
            <h2 className="text-xl font-bold text-ink">To Cook</h2>
            <div className="bg-ink text-on-primary px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {toCookOrders.length}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {toCookOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted font-medium text-lg">
                No orders waiting
              </div>
            ) : (
              toCookOrders.map(order => (
                <TicketCard 
                  key={order.id} 
                  order={order} 
                  onUpdateStage={onUpdateStage}
                  onStrikeItem={onStrikeItem}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="flex-1 flex flex-col h-full border-r border-hairline bg-brand-accent/5">
          <div className="bg-brand-accent/10 p-4 border-b border-hairline flex items-center justify-between shadow-sm z-10">
            <h2 className="text-xl font-bold text-brand-accent">Preparing</h2>
            <div className="bg-brand-accent text-on-primary px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {preparingOrders.length}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-brand-accent/60 font-medium text-lg">
                Nothing currently preparing
              </div>
            ) : (
              preparingOrders.map(order => (
                <TicketCard 
                  key={order.id} 
                  order={order} 
                  onUpdateStage={onUpdateStage}
                  onStrikeItem={onStrikeItem}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Prepared/Completed */}
        <div className="flex-1 flex flex-col h-full bg-success/5">
          <div className="bg-success/10 p-4 border-b border-hairline flex items-center justify-between shadow-sm z-10">
            <h2 className="text-xl font-bold text-success-dark">Prepared</h2>
            <div className="bg-success text-on-primary px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {completedOrders.length}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {completedOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-success/60 font-medium text-lg">
                No orders prepared yet
              </div>
            ) : (
              completedOrders.map(order => (
                <TicketCard 
                  key={order.id} 
                  order={order} 
                  onUpdateStage={onUpdateStage}
                  onStrikeItem={onStrikeItem}
                />
              ))
            )}
          </div>
        </div>

        {/* HISTORY DRAWER */}
        {isHistoryOpen && (
          <div className="absolute top-0 right-0 h-full w-96 bg-surface-card border-l border-hairline shadow-2xl z-30 flex flex-col animate-in slide-in-from-right-10 duration-200">
            <div className="p-4 border-b border-hairline flex items-center justify-between bg-surface-soft">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <History className="text-brand" size={20} /> Bumped Orders History
              </h2>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 hover:bg-surface-strong rounded-full text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
              {orderHistory.length === 0 ? (
                <div className="text-center text-muted font-medium mt-10">No bumped orders yet</div>
              ) : (
                orderHistory.map(order => (
                  <div key={order.id} className="bg-surface-soft rounded-lg p-3 border border-hairline shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-lg text-ink">#{order.order_number}</div>
                      {onRecallOrder && (
                        <button 
                          onClick={() => {
                            onRecallOrder(order.id);
                            // Also tell backend to revert to preparing
                            onUpdateStage(order.id, OrderStatus.PREPARING);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold bg-brand/10 text-brand hover:bg-brand/20 px-2 py-1 rounded transition-colors"
                        >
                          <RotateCcw size={14} /> Recall
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-muted">
                      {order.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
