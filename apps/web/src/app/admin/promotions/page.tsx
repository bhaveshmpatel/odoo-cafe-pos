"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { IPromotion, PromotionType, DiscountType } from "@repo/shared-types";

export default function AdminPromotionsPage() {
  const { data: session } = useSession();
  
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<PromotionType>(PromotionType.MIN_AMOUNT);
  const [newDiscountType, setNewDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [newDiscountValue, setNewDiscountValue] = useState("");
  const [newMinOrderAmount, setNewMinOrderAmount] = useState("");

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
      
      const res = await fetch(`${apiUrl}/api/admin/promotions`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success) setPromotions(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDiscountValue) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/promotions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: newName,
          type: newType,
          discount_type: newDiscountType,
          discount_value: parseFloat(newDiscountValue),
          min_order_amount: newMinOrderAmount ? parseFloat(newMinOrderAmount) : null,
          is_active: true
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPromotions([...promotions, json.data]);
          setIsAdding(false);
          setNewName("");
          setNewDiscountValue("");
          setNewMinOrderAmount("");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete promotion?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setPromotions(promotions.filter(p => p.id !== id));
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
          <h1 className="text-3xl font-bold text-ink">Promotions</h1>
          <p className="text-muted">Active discounts and offers.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-brand text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors"
        >
          <Plus size={18} />
          Add Promotion
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-surface-card p-6 rounded-2xl border border-hairline shadow-sm flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in">
          <h2 className="text-lg font-bold text-ink">New Promotion</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Name</label>
              <input 
                type="text" 
                required 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                placeholder="e.g. Summer Sale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Trigger Type</label>
              <select 
                value={newType} 
                onChange={e => setNewType(e.target.value as PromotionType)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
              >
                {Object.values(PromotionType).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Discount Type</label>
              <select 
                value={newDiscountType} 
                onChange={e => setNewDiscountType(e.target.value as DiscountType)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
              >
                {Object.values(DiscountType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Discount Value</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={newDiscountValue} 
                onChange={e => setNewDiscountValue(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                placeholder={newDiscountType === DiscountType.PERCENTAGE ? "10" : "5.00"}
              />
            </div>
            {(newType === PromotionType.MIN_AMOUNT) && (
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Min Order Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newMinOrderAmount} 
                  onChange={e => setNewMinOrderAmount(e.target.value)}
                  className="w-full bg-surface-soft border border-hairline rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  placeholder="e.g. 50.00"
                />
              </div>
            )}
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
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Discount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {promotions.map(promo => (
              <tr key={promo.id} className="hover:bg-surface-soft/50 transition-colors">
                <td className="px-6 py-4 font-medium text-ink">{promo.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-accent/10 text-brand-accent text-xs font-semibold">
                    {promo.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-ink">
                  {promo.discount_type === DiscountType.PERCENTAGE 
                    ? `${promo.discount_value}%` 
                    : `$${parseFloat(promo.discount_value as string).toFixed(2)}`}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted font-medium">No promotions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
