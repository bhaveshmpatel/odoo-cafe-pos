import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, ICategory, IProduct, IPromotion, calculateOrderTotal, PricingResult } from '@repo/shared-types';

interface MenuData {
  categories: ICategory[];
  products: IProduct[];
  promotions: IPromotion[];
}

interface PosState {
  // Active UI State
  activeFloorId: string | null;
  activeTableId: string | null;
  
  // Data State
  menuData: MenuData;
  carts: Record<string, CartItem[]>; // tableId -> CartItem[]
  
  // Actions
  setMenuData: (data: MenuData) => void;
  setActiveTable: (floorId: string | null, tableId: string | null) => void;
  
  // Cart Actions for Active Table
  addItemToCart: (product: IProduct) => void;
  removeItemFromCart: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: (tableId: string) => void;

  // Computed / Getter Helpers
  getActiveCart: () => CartItem[];
  getActiveCartPricing: (couponCode?: string) => PricingResult;
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      activeFloorId: null,
      activeTableId: null,
      menuData: {
        categories: [],
        products: [],
        promotions: [],
      },
      carts: {},

      setMenuData: (data) => set({ menuData: data }),
      
      setActiveTable: (floorId, tableId) => set({ activeFloorId: floorId, activeTableId: tableId }),

      addItemToCart: (product) => {
        const { activeTableId, carts } = get();
        if (!activeTableId) return;

        const tableCart = carts[activeTableId] || [];
        const existingItemIndex = tableCart.findIndex(item => item.product_id === product.id);

        const newCart = [...tableCart];
        if (existingItemIndex >= 0) {
          const item = newCart[existingItemIndex];
          if (item) {
            const newQuantity = item.quantity + 1;
            newCart[existingItemIndex] = {
              ...item,
              quantity: newQuantity,
              total_price: newQuantity * Number(item.unit_price)
            } as CartItem;
          }
        } else {
          newCart.push({
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            unit_price: Number(product.price),
            total_price: Number(product.price),
          });
        }

        set({ carts: { ...carts, [activeTableId]: newCart } });
      },

      removeItemFromCart: (productId) => {
        const { activeTableId, carts } = get();
        if (!activeTableId) return;

        const tableCart = carts[activeTableId] || [];
        const newCart = tableCart.filter(item => item.product_id !== productId);
        
        set({ carts: { ...carts, [activeTableId]: newCart } });
      },

      updateItemQuantity: (productId, quantity) => {
        const { activeTableId, carts } = get();
        if (!activeTableId) return;

        const tableCart = carts[activeTableId] || [];
        if (quantity <= 0) {
          get().removeItemFromCart(productId);
          return;
        }

        const newCart = tableCart.map(item => 
          item.product_id === productId 
            ? { ...item, quantity, total_price: quantity * Number(item.unit_price) }
            : item
        );

        set({ carts: { ...carts, [activeTableId]: newCart } });
      },

      clearCart: (tableId) => {
        const { carts } = get();
        const newCarts = { ...carts };
        delete newCarts[tableId];
        set({ carts: newCarts });
      },

      getActiveCart: () => {
        const { activeTableId, carts } = get();
        if (!activeTableId) return [];
        return carts[activeTableId] || [];
      },

      getActiveCartPricing: (couponCode?: string) => {
        const { getActiveCart, menuData } = get();
        const cart = getActiveCart();
        return calculateOrderTotal(cart, menuData.promotions, couponCode || null);
      }
    }),
    {
      name: 'odoocafe-pos-storage',
      // Only persist carts and active table state, not menu data which should be fresh
      partialize: (state) => ({ 
        carts: state.carts,
        activeTableId: state.activeTableId,
        activeFloorId: state.activeFloorId
      }),
    }
  )
);
