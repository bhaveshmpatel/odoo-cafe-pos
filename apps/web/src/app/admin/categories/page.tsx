"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { ICategory } from "@repo/shared-types";

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#2196F3");
  const [newSortOrder, setNewSortOrder] = useState(0);

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
      
      const res = await fetch(`${apiUrl}/api/admin/categories`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success) setCategories(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newColor) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: newName,
          color: newColor,
          sort_order: newSortOrder,
          is_active: true
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setCategories([...categories, json.data].sort((a, b) => a.sort_order - b.sort_order));
          setIsAdding(false);
          setNewName("");
          setNewColor("#2196F3");
          setNewSortOrder(0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete category? Make sure no products are using it!")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert("Cannot delete category. It might be in use.");
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
          <h1 className="text-3xl font-bold text-ink">Categories</h1>
          <p className="text-muted">Organize your products.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-brand text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-surface-card p-6 rounded-2xl border border-hairline shadow-sm flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in">
          <h2 className="text-lg font-bold text-ink">New Category</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted mb-1">Name</label>
              <input 
                type="text" 
                required 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                placeholder="e.g. Hot Drinks"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-muted mb-1">Color</label>
              <div className="flex items-center gap-2 bg-surface-soft border border-hairline rounded-lg p-1.5 focus-within:border-brand">
                <input 
                  type="color" 
                  required 
                  value={newColor} 
                  onChange={e => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                />
                <span className="text-sm font-medium text-ink uppercase">{newColor}</span>
              </div>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-muted mb-1">Sort Order</label>
              <input 
                type="number" 
                required 
                value={newSortOrder} 
                onChange={e => setNewSortOrder(parseInt(e.target.value))}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
              />
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
              <th className="px-6 py-4">Color</th>
              <th className="px-6 py-4 text-center">Sort Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-surface-soft/50 transition-colors">
                <td className="px-6 py-4 font-medium text-ink">{category.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category.color }}></span>
                    <span className="text-muted font-mono text-sm uppercase">{category.color}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-medium text-muted">{category.sort_order}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted font-medium">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
