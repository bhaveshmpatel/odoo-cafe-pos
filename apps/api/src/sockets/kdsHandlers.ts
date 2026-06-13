import { Server as SocketIOServer, Socket } from 'socket.io';
import { KdsNewOrderPayload, KdsStrikeItemPayload, KdsUpdateStagePayload, OrderStatus, ItemStatus } from '@repo/shared-types';
import prisma from '@repo/database';

export const setupKdsSockets = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // POS -> Server: New order created
    // Server -> KDS: Broadcast new order
    socket.on('pos_send_order', (payload: KdsNewOrderPayload) => {
      console.log(`📥 Received pos_send_order: ${payload.order.id}`);
      // Broadcast to all clients (including KDS)
      io.emit('new_kds_order', payload);
    });

    // KDS -> Server: Update order stage (e.g. TO_COOK -> PREPARING)
    socket.on('kds_update_stage', async (payload: KdsUpdateStagePayload) => {
      console.log(`📥 Received kds_update_stage: Order ${payload.order_id} to ${payload.new_status}`);
      try {
        await prisma.order.update({
          where: { id: payload.order_id },
          data: { status: payload.new_status as string as any }, // Prisma enum type workaround
        });
        // Broadcast the update so all KDS screens stay in sync
        io.emit('kds_update_stage', payload);
      } catch (error) {
        console.error(`❌ Error updating order stage:`, error);
      }
    });

    // KDS -> Server: Strike off a specific item
    socket.on('kds_strike_item', async (payload: KdsStrikeItemPayload) => {
      console.log(`📥 Received kds_strike_item: Item ${payload.order_item_id} to ${payload.new_item_status}`);
      try {
        await prisma.orderItem.update({
          where: { id: payload.order_item_id },
          data: { item_status: payload.new_item_status as string as any },
        });
        // Broadcast item strike
        io.emit('kds_strike_item', payload);
      } catch (error) {
        console.error(`❌ Error updating item status:`, error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
