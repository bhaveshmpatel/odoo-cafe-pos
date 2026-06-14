"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { IProduct, ICategory } from "@repo/shared-types";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;
      if (!token) return;
      
      const [prodRes, catRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/admin/categories`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (prodRes.ok) {
        const json = await prodRes.json();
        if (json.success) setProducts(json.data);
      }
      if (catRes.ok) {
        const json = await catRes.json();
        if (json.success) {
          setCategories(json.data);
          if (json.data.length > 0) setNewCategoryId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newCategoryId) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: newName,
          price: parseFloat(newPrice),
          category_id: newCategoryId,
          is_available: true
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setProducts([...products, json.data]);
          setIsAdding(false);
          setNewName("");
          setNewPrice("");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Products</h1>
          <p className="text-muted">Manage inventory items.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-brand text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-surface-card p-6 rounded-2xl border border-hairline shadow-sm flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in">
          <h2 className="text-lg font-bold text-ink">New Product</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted mb-1">Name</label>
              <input 
                type="text" 
                required 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                placeholder="e.g. Latte"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-muted mb-1">Price</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={newPrice} 
                onChange={e => setNewPrice(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                placeholder="0.00"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-muted mb-1">Category</label>
              <select 
                required 
                value={newCategoryId} 
                onChange={e => setNewCategoryId(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg font-medium text-muted hover:bg-surface-soft transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg font-medium bg-ink text-on-primary hover:opacity-90 transition-opacity">Save</button>
          </div>
        </form>
      )}

      <div className="bg-surface-card border border-hairline rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-soft text-muted text-sm uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-surface-soft/50 transition-colors">
                <td className="px-6 py-4 font-medium text-ink">{product.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${product.category?.color || '#ccc'}30`, color: product.category?.color || '#666' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: product.category?.color || '#ccc' }}></span>
                    {product.category?.name || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-ink">${parseFloat(product.price as string).toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted font-medium">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
