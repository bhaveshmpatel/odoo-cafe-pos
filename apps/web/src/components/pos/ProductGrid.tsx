"use client";

import { useState, useEffect, useRef } from "react";
import { ICategory, IProduct } from "@repo/shared-types";
import { usePosStore } from "@/store/usePosStore";
import { Plus, Search } from "lucide-react";
import { ModifiersModal } from "./ModifiersModal";

interface Props {
  categories: ICategory[];
  products: IProduct[];
}

export function ProductGrid({ categories, products }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "bestsellers" | "newest" | "price_asc" | "price_desc">("default");

  const activeTableId = usePosStore((state) => state.activeTableId);
  const addToCart = usePosStore((state) => state.addToCart);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategoryId === "all" || p.category_id === activeCategoryId;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "bestsellers") {
      // Sort by actual sales_count descending
      return (b.sales_count || 0) - (a.sales_count || 0);
    }
    if (sortBy === "newest") {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortBy === "price_asc") {
      return parseFloat(a.price as string) - parseFloat(b.price as string);
    }
    if (sortBy === "price_desc") {
      return parseFloat(b.price as string) - parseFloat(a.price as string);
    }
    return 0;
  });

  const observerTarget = useRef<HTMLDivElement>(null);
  const [displayCount, setDisplayCount] = useState(24);

  useEffect(() => {
    setDisplayCount(24);
  }, [activeCategoryId, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + 24);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [filteredProducts?.length]);
  
  const activeCategory = categories.find(c => c.id === activeCategoryId);

  const [selectedProductForMods, setSelectedProductForMods] = useState<IProduct | null>(null);

  const handleProductClick = (product: IProduct) => {
    if (!activeTableId) {
      alert("Please select a table first.");
      return;
    }
    if (product.stock_quantity <= 0) return;
    
    setSelectedProductForMods(product);
  };

  const handleAddWithMods = (modifiers: string[]) => {
    if (!selectedProductForMods || !activeTableId) return;
    
    addToCart(activeTableId, {
      product_id: selectedProductForMods.id,
      product_name: selectedProductForMods.name,
      unit_price: parseFloat(selectedProductForMods.price),
      quantity: 1,
      total_price: parseFloat(selectedProductForMods.price),
      category_color: activeCategory?.color,
      modifiers: modifiers,
    });
    
    setSelectedProductForMods(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Category Tabs & Search */}
      <div className="flex flex-col gap-3 p-4 border-b border-hairline bg-canvas/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-soft border border-hairline rounded-lg text-sm text-ink outline-none focus:border-brand transition-colors"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-surface-soft border border-hairline rounded-lg text-sm text-ink outline-none focus:border-brand transition-colors appearance-none cursor-pointer"
          >
            <option value="default">Default Sort</option>
            <option value="bestsellers">Bestsellers</option>
            <option value="newest">Newly Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setActiveCategoryId("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border ${
              activeCategoryId === "all" 
                ? "bg-ink text-canvas border-transparent" 
                : "bg-surface-card text-ink border-hairline hover:bg-surface-soft"
            }`}
          >
            All Products
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border ${
                activeCategoryId === category.id 
                  ? "text-on-primary border-transparent" 
                  : "bg-surface-card text-ink border-hairline hover:bg-surface-soft"
              }`}
              style={{ 
                backgroundColor: activeCategoryId === category.id ? category.color : undefined,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-surface-soft">
        {!activeTableId && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/20 text-warning text-sm rounded-lg flex items-center justify-center">
            Please select a table to start taking an order.
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.slice(0, displayCount).map(product => {
            const isOutOfStock = product.stock_quantity <= 0;
            const productCategory = categories.find(c => c.id === product.category_id);
            return (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                disabled={isOutOfStock}
                className={`flex flex-col text-left bg-canvas rounded-xl border border-hairline overflow-hidden hover:shadow-md transition-shadow group relative ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ borderTopColor: productCategory?.color || activeCategory?.color, borderTopWidth: '4px' }}
              >
                {product.image_url ? (
                  <div className={`h-32 w-full bg-surface-soft relative ${isOutOfStock ? 'grayscale' : ''}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className={`h-24 w-full bg-surface-soft flex items-center justify-center text-muted font-medium text-xs uppercase tracking-wider ${isOutOfStock ? 'grayscale' : ''}`}>
                    No Image
                  </div>
                )}
                
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <span className="font-medium text-ink line-clamp-2 text-sm">{product.name}</span>
                  <span className="font-semibold text-brand-accent mt-2">₹{parseFloat(product.price).toFixed(2)}</span>
                </div>

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-ink/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-error text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Out of Stock</span>
                  </div>
                )}

                {/* Hover overlay add button */}
                {!isOutOfStock && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-canvas rounded-full p-1 shadow-sm border border-hairline">
                    <Plus className="w-4 h-4 text-ink" />
                  </div>
                )}
              </button>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted">
              <p>No products found matching your search.</p>
            </div>
          )}
        </div>
        {/* Lazy Loading Sentinel */}
        {displayCount < filteredProducts.length && (
          <div ref={observerTarget} className="w-full h-10 mt-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {selectedProductForMods && (
        <ModifiersModal 
          product={selectedProductForMods} 
          onClose={() => setSelectedProductForMods(null)} 
          onAdd={handleAddWithMods} 
        />
      )}
    </div>
  );
}
