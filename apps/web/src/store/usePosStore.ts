import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { CartItem } from '@repo/shared-types';

// Custom IndexedDB storage adapter for Zustand
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => (await get(name)) || null,
  setItem: async (name: string, value: string): Promise<void> => await set(name, value),
  removeItem: async (name: string): Promise<void> => await del(name),
};

export interface DraftOrder {
  id: string;
  name: string;
  items: CartItem[];
  timestamp: number;
}

interface PosState {
  carts: Record<string, CartItem[]>; // tableId -> cart
  activeCustomers: Record<string, { id?: string; full_name: string; phone?: string; email?: string }>; // tableId -> customer details
  activeTableId: string | null;
  activeTableName: string | null;
  activeFloorId: string | null;
  draftOrders: DraftOrder[];
  
  // Actions
  setActiveTable: (tableId: string | null, tableName?: string | null) => void;
  setActiveFloor: (floorId: string | null) => void;
  setCustomer: (tableId: string, customer: { id?: string; full_name: string; phone?: string; email?: string } | null) => void;
  addToCart: (tableId: string, item: CartItem) => void;
  removeFromCart: (tableId: string, productId: string, modifiers?: string[]) => void;
  updateQuantity: (tableId: string, productId: string, delta: number, modifiers?: string[]) => void;
  clearCart: (tableId: string) => void;

  // Drafts
  saveAsDraft: (tableId: string, draftName: string) => void;
  resumeDraft: (tableId: string, draftId: string) => void;
  deleteDraft: (draftId: string) => void;
}

// Helper to compare items (product_id + modifiers)
const isSameItem = (item1: CartItem, item2: CartItem) => {
  if (item1.product_id !== item2.product_id) return false;
  
  const mods1 = item1.modifiers || [];
  const mods2 = item2.modifiers || [];
  
  if (mods1.length !== mods2.length) return false;
  const sorted1 = [...mods1].sort();
  const sorted2 = [...mods2].sort();
  return sorted1.every((val, index) => val === sorted2[index]);
};

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      carts: {},
      activeCustomers: {},
      activeTableId: null,
      activeTableName: null,
      activeFloorId: null,
      draftOrders: [],

      setActiveTable: (tableId, tableName) => set({ activeTableId: tableId, activeTableName: tableName || null }),
      
      setActiveFloor: (floorId) => set({ activeFloorId: floorId }),

      setCustomer: (tableId, customer) => set((state) => {
        if (!customer) {
          const newCustomers = { ...state.activeCustomers };
          delete newCustomers[tableId];
          return { activeCustomers: newCustomers };
        }
        return { activeCustomers: { ...state.activeCustomers, [tableId]: customer } };
      }),

      addToCart: (tableId, item) => set((state) => {
        const tableCart = state.carts[tableId] || [];
        const existingItemIndex = tableCart.findIndex(i => isSameItem(i, item));
        
        const newCart = [...tableCart];
        
        if (existingItemIndex >= 0) {
          const existing = newCart[existingItemIndex]!;
          newCart[existingItemIndex] = {
            ...existing,
            quantity: existing.quantity + item.quantity,
            total_price: (existing.quantity + item.quantity) * existing.unit_price,
          } as CartItem;
        } else {
          newCart.push({ ...item, modifiers: item.modifiers || [] });
        }
        
        return { carts: { ...state.carts, [tableId]: newCart } };
      }),

      removeFromCart: (tableId, productId, modifiers = []) => set((state) => {
        const tableCart = state.carts[tableId] || [];
        // Match by product_id and modifiers
        const newCart = tableCart.filter(i => !isSameItem(i, { product_id: productId, modifiers } as CartItem));
        return { carts: { ...state.carts, [tableId]: newCart } };
      }),

      updateQuantity: (tableId, productId, delta, modifiers = []) => set((state) => {
        const tableCart = state.carts[tableId] || [];
        const newCart = tableCart.map(item => {
          if (isSameItem(item, { product_id: productId, modifiers } as CartItem)) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: newQuantity,
              total_price: newQuantity * item.unit_price,
            };
          }
          return item;
        });
        return { carts: { ...state.carts, [tableId]: newCart } };
      }),

      clearCart: (tableId) => set((state) => {
        const newCarts = { ...state.carts };
        delete newCarts[tableId];
        const newCustomers = { ...state.activeCustomers };
        delete newCustomers[tableId];
        return { carts: newCarts, activeCustomers: newCustomers };
      }),

      saveAsDraft: (tableId, draftName) => {
        const { carts, draftOrders } = get();
        const activeCart = carts[tableId] || [];
        if (activeCart.length === 0) return;
        
        const newDraft: DraftOrder = {
          id: crypto.randomUUID(),
          name: draftName,
          items: activeCart,
          timestamp: Date.now(),
        };

        const newCarts = { ...carts };
        delete newCarts[tableId]; // Clear the cart when saved as draft

        set({ draftOrders: [...draftOrders, newDraft], carts: newCarts });
      },

      resumeDraft: (tableId, draftId) => {
        const { draftOrders, carts } = get();
        const draft = draftOrders.find((d) => d.id === draftId);
        if (draft) {
          set({
            carts: { ...carts, [tableId]: draft.items },
            draftOrders: draftOrders.filter((d) => d.id !== draftId),
          });
        }
      },

      deleteDraft: (draftId) => {
        const { draftOrders } = get();
        set({
          draftOrders: draftOrders.filter((d) => d.id !== draftId),
        });
      }
    }),
    {
      name: 'pos-storage',
      storage: createJSONStorage(() => idbStorage), // Uses IndexedDB!
      onRehydrateStorage: () => (state) => {
        if (state && Object.keys(state.carts).length > 0) {
          console.log("Restored active POS session from IndexedDB.");
          // Can be hooked up to a global toast system later
        }
      },
    }
  )
);
