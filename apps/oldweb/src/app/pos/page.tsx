'use client';

import { useEffect, useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { fetcher } from '@/lib/api';
import FloorPopup from '@/components/pos/FloorPopup';
import ProductGrid from '@/components/pos/ProductGrid';
import CartSummary from '@/components/pos/CartSummary';
import { LayoutGrid } from 'lucide-react';

export default function PosPage() {
  const { setMenuData, activeTableId } = usePosStore();
  const [isFloorPopupOpen, setIsFloorPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch menu data and hydrate store
    fetcher('/api/pos/menu')
      .then((res) => {
        setMenuData({
          categories: res.data.categories,
          products: res.data.products,
          promotions: res.data.promotions,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load menu:', err);
        setLoading(false);
      });
  }, [setMenuData]);

  // If no table is selected, force open the floor popup
  useEffect(() => {
    if (!loading && !activeTableId) {
      setIsFloorPopupOpen(true);
    }
  }, [loading, activeTableId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-soft">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Top Floating Button for Tables */}
      <div className="absolute top-4 right-[400px] z-20">
        <button
          onClick={() => setIsFloorPopupOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full font-medium shadow-card hover:bg-primary-active transition-all"
        >
          <LayoutGrid size={18} />
          {activeTableId ? `Table #${activeTableId.slice(-4)}` : 'Select Table'}
        </button>
      </div>

      <ProductGrid />
      <CartSummary />

      {isFloorPopupOpen && <FloorPopup onClose={() => setIsFloorPopupOpen(false)} />}
    </div>
  );
}
