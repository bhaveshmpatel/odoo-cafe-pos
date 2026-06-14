"use client";

import { useEffect } from "react";
import { useKdsSocket } from "@/hooks/useKdsSocket";
import { KanbanBoard } from "@/components/kds/KanbanBoard";
import { IOrder } from "@repo/shared-types";
import { useKdsStore } from "@/store/useKdsStore";

export function KdsClient({ initialOrders }: { initialOrders: IOrder[] }) {
  const { emitUpdateStage, emitStrikeItem } = useKdsSocket();
  const { activeOrders, orderHistory, setInitialOrders, recallOrder, bumpOrder } = useKdsStore();
  
  useEffect(() => {
    setInitialOrders(initialOrders);
  }, [initialOrders, setInitialOrders]);
  
  return (
    <KanbanBoard 
      orders={activeOrders} 
      orderHistory={orderHistory}
      onUpdateStage={emitUpdateStage} 
      onStrikeItem={emitStrikeItem} 
      onRecallOrder={recallOrder}
    />
  );
}
