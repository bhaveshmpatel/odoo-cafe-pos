import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  KdsNewOrderPayload, 
  KdsUpdateStagePayload, 
  KdsStrikeItemPayload,
  OrderStatus,
  ItemStatus
} from '@repo/shared-types';
import { useKdsStore } from '../store/useKdsStore';

export function useKdsSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { addOrder, updateOrderStage, strikeItem, bumpOrder } = useKdsStore();

  useEffect(() => {
    // Initialize socket connection
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
    const socket = io(apiUrl);
    socketRef.current = socket;

    // Listeners
    socket.on('new_kds_order', (payload: KdsNewOrderPayload) => {
      // Zustand de-duplicates internally
      addOrder(payload.order);
    });

    socket.on('kds_update_stage', (payload: KdsUpdateStagePayload) => {
      if (payload.new_status === OrderStatus.COMPLETED) {
        bumpOrder(payload.order_id);
      } else {
        updateOrderStage(payload.order_id, payload.new_status);
      }
    });

    socket.on('kds_strike_item', (payload: KdsStrikeItemPayload) => {
      strikeItem(payload.order_id, payload.order_item_id, payload.new_item_status);
    });

    return () => {
      socket.disconnect();
    };
  }, [addOrder, updateOrderStage, strikeItem, bumpOrder]);

  const emitUpdateStage = (orderId: string, newStatus: OrderStatus, orderNumber?: number) => {
    // Optimistic update
    if (newStatus === OrderStatus.COMPLETED) {
      bumpOrder(orderId);
    } else {
      updateOrderStage(orderId, newStatus);
    }
    // Emit
    if (socketRef.current) {
      socketRef.current.emit('kds_update_stage', { 
        order_id: orderId, 
        new_status: newStatus,
        order_number: orderNumber 
      });
    }
  };

  const emitStrikeItem = (orderId: string, orderItemId: string, newStatus: ItemStatus) => {
    // Optimistic update
    strikeItem(orderId, orderItemId, newStatus);
    // Emit
    if (socketRef.current) {
      socketRef.current.emit('kds_strike_item', { 
        order_id: orderId, 
        order_item_id: orderItemId, 
        new_item_status: newStatus 
      });
    }
  };

  return { emitUpdateStage, emitStrikeItem };
}
