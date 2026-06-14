'use client';

import { useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { Search } from 'lucide-react';

export default function ProductGrid() {
  const { menuData, addItemToCart } = usePosStore();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = menuData.products.filter((product) => {
    const matchesCategory = activeCategoryId ? product.category_id === activeCategoryId : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-soft overflow-hidden">
      {/* Header & Search */}
      <div className="p-4 bg-canvas border-b border-hairline shrink-0 flex gap-4 items-center shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-soft border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar shrink-0 border-b border-hairline bg-canvas">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
            activeCategoryId === null
              ? 'bg-primary text-on-primary shadow-subtle'
              : 'bg-surface-strong text-body hover:bg-surface-dark/10'
          }`}
        >
          All Items
        </button>
        {menuData.categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategoryId(category.id)}
            className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-colors shadow-subtle`}
            style={{
              backgroundColor: activeCategoryId === category.id ? category.color : '#f3f4f6',
              color: activeCategoryId === category.id ? '#fff' : '#374151',
              border: `1px solid ${activeCategoryId === category.id ? 'transparent' : category.color + '40'}`
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted space-y-2">
            <Search size={48} className="opacity-20" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const category = menuData.categories.find(c => c.id === product.category_id);
              
              return (
                <button
                  key={product.id}
                  onClick={() => addItemToCart(product)}
                  className="bg-canvas border border-hairline rounded-xl p-4 flex flex-col text-left shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all group"
                >
                  <div 
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-on-primary font-bold shadow-sm"
                    style={{ backgroundColor: category?.color || '#3b82f6' }}
                  >
                    {product.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-semibold text-primary line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors">
                    {product.name}
                  </h4>
                  <div className="mt-auto pt-3 flex items-end justify-between w-full">
                    <span className="font-bold text-success text-lg">₹{Number(product.price)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
