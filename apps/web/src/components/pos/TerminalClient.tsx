"use client";

import { useState, useEffect, useRef } from "react";
import { ICategory, IProduct, IPromotion, OrderStatus, KdsUpdateStagePayload } from "@repo/shared-types";
import { io, Socket } from "socket.io-client";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartSummary } from "@/components/pos/CartSummary";
import { FloorPopup } from "@/components/pos/FloorPopup";
import { ShiftModal } from "@/components/pos/ShiftModal";
import { OrderHistorySlideOver } from "@/components/pos/OrderHistorySlideOver";
import { usePosStore, DraftOrder } from "@/store/usePosStore";
import { Clock, LogOut, Save, History, Play, Bell } from "lucide-react";

interface Props {
  categories: ICategory[];
  products: IProduct[];
  promotions: IPromotion[];
  token: string;
  userRole?: string;
}

export function TerminalClient({ categories, products, promotions, token, userRole }: Props) {
  const [isFloorPopupOpen, setIsFloorPopupOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  
  const [draftName, setDraftName] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  // Custom Toasts for Order Prepared
  const [readyOrders, setReadyOrders] = useState<{id: string, orderNumber: string, timestamp: number}[]>([]);
  const [isReadyOpen, setIsReadyOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const activeTableId = usePosStore((state) => state.activeTableId);
  const saveAsDraft = usePosStore((state) => state.saveAsDraft);
  const resumeDraft = usePosStore((state) => state.resumeDraft);
  const draftOrders = usePosStore((state) => state.draftOrders);
  const carts = usePosStore((state) => state.carts);

  // Check shift on mount
  useEffect(() => {
    const checkShift = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/pos/shifts/current`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && !data.data) {
          // No open shift
          setShiftModalOpen(true);
          setIsClosingShift(false);
        }
      } catch (err) {}
    };
    checkShift();
  }, [token]);

  // WebSocket for POS Toasts
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
    const socket = io(apiUrl);
    socketRef.current = socket;

    socket.on('kds_update_stage', (payload: KdsUpdateStagePayload) => {
      if (payload.new_status === OrderStatus.COMPLETED) {
        setReadyOrders(prev => {
          if (prev.find(o => o.id === payload.order_id)) return prev;
          return [{
            id: payload.order_id,
            orderNumber: payload.order_number?.toString() || payload.order_id.slice(-4),
            timestamp: Date.now()
          }, ...prev];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSaveDraft = () => {
    if (!activeTableId || !draftName) return;
    saveAsDraft(activeTableId, draftName);
    setIsSavingDraft(false);
    setDraftName("");
  };

  const removeReadyOrder = (id: string) => {
    setReadyOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="flex h-full w-full">
      <OrderHistorySlideOver 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        token={token} 
      />
      {/* Left side: Products & Header */}
      <div className="flex-1 flex flex-col h-full border-r border-hairline bg-canvas relative print:hidden">
        {/* Terminal Header */}
        <div className="h-14 shrink-0 bg-surface-card border-b border-hairline flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/image.png" alt="Odoo Cafe Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
              <h1 className="font-black text-xl text-ink tracking-tight ml-1">ODOO POS</h1>
            </div>
            <div className="h-6 w-px bg-hairline"></div>
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 text-sm font-bold text-muted hover:text-ink transition-colors"
            >
              <Clock size={16} />
              History
            </button>
            <button 
              onClick={() => setIsDraftsOpen(!isDraftsOpen)}
              className="flex items-center gap-2 text-sm font-bold text-muted hover:text-ink transition-colors"
            >
              <History size={16} />
              Drafts ({draftOrders.length})
            </button>
            <button 
              onClick={() => setIsReadyOpen(!isReadyOpen)}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                readyOrders.length > 0 ? 'text-success hover:text-success-dark' : 'text-muted hover:text-ink'
              }`}
            >
              <Bell size={16} />
              Ready ({readyOrders.length})
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="/kds"
              className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Kitchen Screen
            </a>
            {userRole === "ADMIN" && (
              <a 
                href="/admin"
                className="flex items-center gap-2 text-sm font-bold text-brand bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut size={16} className="rotate-180" />
                Admin Portal
              </a>
            )}
            <button 
              onClick={() => { setIsClosingShift(true); setShiftModalOpen(true); }}
              className="flex items-center gap-2 text-sm font-bold text-error/80 hover:text-error bg-error/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Close Shift
            </button>
            <button 
              onClick={() => setIsSignOutOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors ml-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Sign Out Confirmation Modal */}
        {isSignOutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm">
            <div className="bg-canvas p-6 rounded-2xl shadow-xl max-w-sm w-full flex flex-col gap-4 animate-in zoom-in-95">
              <h2 className="text-xl font-black text-ink">Confirm Sign Out</h2>
              <p className="text-muted font-medium">Are you sure you want to sign out of the POS Terminal?</p>
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

        <ProductGrid categories={categories} products={products} />

        {/* Drafts Sidebar Overlay */}
        {isDraftsOpen && (
          <div className="absolute top-14 left-0 bottom-0 w-80 bg-surface-card border-r border-hairline shadow-2xl z-20 flex flex-col animate-in slide-in-from-left-8">
            <div className="p-4 border-b border-hairline bg-surface-soft flex items-center justify-between">
              <h2 className="font-bold text-ink">Saved Drafts</h2>
              <button onClick={() => setIsDraftsOpen(false)} className="text-muted hover:text-ink">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {draftOrders.length === 0 ? (
                <div className="text-center text-muted text-sm mt-8">No saved drafts.</div>
              ) : (
                draftOrders.map(draft => (
                  <div key={draft.id} className="bg-canvas border border-hairline rounded-xl p-4 shadow-sm hover:border-brand/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-ink">{draft.name}</h3>
                      <span className="text-xs text-muted font-medium bg-surface-soft px-2 py-1 rounded-md">
                        {new Date(draft.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="text-sm text-muted mb-3">{draft.items.length} items</div>
                    <button 
                      onClick={() => {
                        if (activeTableId) {
                          resumeDraft(activeTableId, draft.id);
                          setIsDraftsOpen(false);
                        } else {
                          alert("Please select a table first to resume this draft.");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-brand/10 text-brand rounded-lg font-bold text-sm hover:bg-brand/20 transition-colors"
                    >
                      <Play size={14} /> Resume Order
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Ready Orders Queue Overlay */}
        {isReadyOpen && (
          <div className="absolute top-14 left-80 bottom-0 w-80 bg-surface-card border-r border-hairline shadow-2xl z-20 flex flex-col animate-in slide-in-from-left-8">
            <div className="p-4 border-b border-hairline bg-surface-soft flex items-center justify-between">
              <h2 className="font-bold text-success-dark flex items-center gap-2">
                <Bell size={18} className="text-success" /> Prepared Orders
              </h2>
              <button onClick={() => setIsReadyOpen(false)} className="text-muted hover:text-ink">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {readyOrders.length === 0 ? (
                <div className="text-center text-muted text-sm mt-8">No prepared orders waiting.</div>
              ) : (
                readyOrders.map(order => (
                  <div key={order.id} className="bg-success/5 border border-success/20 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-success-dark text-lg">Order #{order.orderNumber}</h3>
                      <span className="text-xs text-success font-medium">
                        {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeReadyOrder(order.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-success text-on-primary rounded-lg font-bold text-sm hover:opacity-90 transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right side: Cart Summary */}
      <div className="w-96 flex-shrink-0 h-full bg-surface-card flex flex-col relative z-10">
         <CartSummary promotions={promotions} token={token} onOpenFloor={() => setIsFloorPopupOpen(true)} />
         
         {/* Draft Save Action */}
         {activeTableId && (carts[activeTableId]?.length || 0) > 0 && (
           <div className="px-4 pb-4 bg-surface-card">
             {isSavingDraft ? (
               <div className="flex gap-2 animate-in slide-in-from-bottom-2">
                 <input 
                   autoFocus
                   type="text" 
                   value={draftName}
                   onChange={e => setDraftName(e.target.value)}
                   placeholder="Draft Name (e.g. John)" 
                   className="flex-1 px-3 py-2 bg-surface-soft border border-hairline rounded-lg text-sm outline-none focus:border-brand"
                 />
                 <button onClick={handleSaveDraft} className="bg-brand text-on-primary px-3 py-2 rounded-lg font-bold text-sm">Save</button>
                 <button onClick={() => setIsSavingDraft(false)} className="bg-surface-soft text-ink px-3 py-2 rounded-lg font-bold text-sm">Cancel</button>
               </div>
             ) : (
               <button 
                 onClick={() => setIsSavingDraft(true)}
                 className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-soft hover:bg-surface-strong border border-hairline rounded-xl font-bold text-sm text-ink transition-colors"
               >
                 <Save size={16} /> Save as Draft
               </button>
             )}
           </div>
         )}
      </div>

      {isFloorPopupOpen && (
         <FloorPopup token={token} onClose={() => setIsFloorPopupOpen(false)} />
      )}

      <ShiftModal 
        token={token}
        isOpen={shiftModalOpen}
        isClosingShift={isClosingShift}
        onClose={() => {
          if (isClosingShift) setShiftModalOpen(false);
          // Cannot close open shift modal until successful
        }}
        onShiftOpen={() => setShiftModalOpen(false)}
      />
    </div>
  );
}
