"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, UserCircle, Search, Mail, Phone, CalendarDays } from "lucide-react";
import { useSession } from "next-auth/react";

export default function CustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: "", full_name: "", phone: "", email: "" });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session) fetchCustomers();
  }, [session]);

  const fetchCustomers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;
      if (!token) return;

      const res = await fetch(`${apiUrl}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;

      const url = formData.id 
        ? `${apiUrl}/api/admin/customers/${formData.id}` 
        : `${apiUrl}/api/admin/customers`;
      
      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone || null,
          email: formData.email || null
        })
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        setFormData({ id: "", full_name: "", phone: "", email: "" });
        fetchCustomers();
      } else {
        setErrorMsg(data.error || "Failed to save customer");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;

      const res = await fetch(`${apiUrl}/api/admin/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (c: any) => {
    setFormData({
      id: c.id,
      full_name: c.full_name,
      phone: c.phone || "",
      email: c.email || ""
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Customer Database</h1>
          <p className="text-muted mt-2 font-medium">Manage your restaurant's patrons.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: "", full_name: "", phone: "", email: "" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-on-primary px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          New Customer
        </button>
      </div>

      <div className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left">
          <thead className="bg-surface-soft border-b border-hairline">
            <tr>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider">Customer</th>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider">Contact</th>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider">Joined</th>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted font-medium">No customers found.</td>
              </tr>
            ) : (
              customers.map(c => (
                <tr key={c.id} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        <UserCircle size={24} />
                      </div>
                      <div className="font-bold text-ink">{c.full_name}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-sm text-muted">
                      {c.phone && <div className="flex items-center gap-2"><Phone size={14} /> {c.phone}</div>}
                      {c.email && <div className="flex items-center gap-2"><Mail size={14} /> {c.email}</div>}
                      {!c.phone && !c.email && <span>No contact info</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <CalendarDays size={14} />
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal(c)}
                      className="text-sm font-bold text-brand hover:text-brand-dark px-3 py-1.5 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCustomer(c.id)}
                      className="text-sm font-bold text-error hover:text-error-dark px-3 py-1.5 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-canvas w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-ink mb-6">{formData.id ? "Edit Customer" : "New Customer"}</h2>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-error/10 text-error-dark rounded-lg text-sm font-bold border border-error/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-surface-soft border border-hairline rounded-xl px-4 py-2.5 text-ink outline-none focus:border-brand"
                  placeholder="e.g. Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-surface-soft border border-hairline rounded-xl px-4 py-2.5 text-ink outline-none focus:border-brand"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-surface-soft border border-hairline rounded-xl px-4 py-2.5 text-ink outline-none focus:border-brand"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-hairline">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-ink bg-surface-soft hover:bg-surface-strong transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-brand hover:bg-brand-dark transition-colors flex justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
