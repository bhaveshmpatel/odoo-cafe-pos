import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { IOrder, OrderStatus, ItemStatus } from '@repo/shared-types';

// Custom IndexedDB storage adapter for Zustand
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => (await get(name)) || null,
  setItem: async (name: string, value: string): Promise<void> => await set(name, value),
  removeItem: async (name: string): Promise<void> => await del(name),
};

interface KdsState {
  activeOrders: IOrder[];
  orderHistory: IOrder[];

  // Set the initial bulk orders from a server fetch
  setInitialOrders: (orders: IOrder[]) => void;

  // Add a new incoming order from the POS
  addOrder: (order: IOrder) => void;

  // Update order stage
  updateOrderStage: (orderId: string, newStatus: OrderStatus) => void;

  // Strike an individual item
  strikeItem: (orderId: string, itemId: string, newStatus: ItemStatus) => void;

  // Move an order from active to history
  bumpOrder: (orderId: string) => void;

  // Move an order from history to active
  recallOrder: (orderId: string) => void;
}

export const useKdsStore = create<KdsState>()(
  persist(
    (set) => ({
      activeOrders: [],
      orderHistory: [],

      setInitialOrders: (orders) => 
        set((state) => {
          // Merge incoming orders from the server with any existing un-bumped orders in local state
          const newMap = new Map(state.activeOrders.map(o => [o.id, o]));
          orders.forEach(o => {
            // Only add if it's not already completed/bumped
            if (o.status !== OrderStatus.COMPLETED) {
              newMap.set(o.id, o);
            }
          });
          return { activeOrders: Array.from(newMap.values()) };
        }),

      addOrder: (order) =>
        set((state) => {
          if (state.activeOrders.some(o => o.id === order.id)) return state;
          return { activeOrders: [...state.activeOrders, order] };
        }),

      updateOrderStage: (orderId, newStatus) =>
        set((state) => ({
          activeOrders: state.activeOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        })),

      strikeItem: (orderId, itemId, newStatus) =>
        set((state) => ({
          activeOrders: state.activeOrders.map(order => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              items: order.items?.map(item => 
                item.id === itemId ? { ...item, item_status: newStatus } : item
              )
            };
          })
        })),

      bumpOrder: (orderId) =>
        set((state) => {
          const orderIndex = state.activeOrders.findIndex(o => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...state.activeOrders[orderIndex], status: OrderStatus.COMPLETED };
          const activeOrders = [...state.activeOrders];
          activeOrders.splice(orderIndex, 1);

          const orderHistory = [order, ...state.orderHistory].slice(0, 50); // Keep last 50

          return { activeOrders, orderHistory };
        }),

      recallOrder: (orderId) =>
        set((state) => {
          const orderIndex = state.orderHistory.findIndex(o => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...state.orderHistory[orderIndex], status: OrderStatus.PREPARING };
          const orderHistory = [...state.orderHistory];
          orderHistory.splice(orderIndex, 1);

          return { 
            activeOrders: [...state.activeOrders, order],
            orderHistory 
          };
        }),
    }),
    {
      name: 'kds-storage',
      storage: createJSONStorage(() => idbStorage),
      // Optionally ignore things you don't want to persist
    }
  )
);
