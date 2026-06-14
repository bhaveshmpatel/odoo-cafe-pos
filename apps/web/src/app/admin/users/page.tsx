"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, UserCircle, Shield, Ban, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { IUser, UserRole } from "@repo/shared-types";

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: UserRole.EMPLOYEE
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session) fetchUsers();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;
      if (!token) return;

      const res = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;

      const res = await fetch(`${apiUrl}/api/admin/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        setFormData({ full_name: "", email: "", password: "", role: UserRole.EMPLOYEE });
        fetchUsers();
      } else {
        setErrorMsg(data.error || "Failed to create user");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;

      const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeUserRole = async (id: string, newRole: UserRole) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;

      const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers();
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
    <div className="flex flex-col h-full animate-in fade-in p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Staff Management</h1>
          <p className="text-muted mt-2 font-medium">Create and manage employee access roles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-on-primary px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      <div className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left">
          <thead className="bg-surface-soft border-b border-hairline">
            <tr>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider">User</th>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider">Role</th>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider">Status</th>
              <th className="p-4 font-bold text-muted uppercase text-xs tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted font-medium">No users found.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-ink">{user.full_name}</div>
                        <div className="text-sm text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={user.role}
                      onChange={(e) => changeUserRole(user.id, e.target.value as UserRole)}
                      className="bg-surface-soft border border-hairline rounded-lg px-3 py-1.5 text-sm font-bold text-ink outline-none focus:border-brand"
                    >
                      <option value={UserRole.EMPLOYEE}>Employee</option>
                      <option value={UserRole.ADMIN}>Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.is_active ? 'bg-success/10 text-success-dark' : 'bg-error/10 text-error-dark'
                    }`}>
                      {user.is_active ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                      {user.is_active ? 'Active' : 'Disabled'}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        user.is_active 
                          ? 'text-error hover:bg-error/10' 
                          : 'text-success hover:bg-success/10'
                      }`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-canvas w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-ink mb-6">Add New Staff</h2>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-error/10 text-error-dark rounded-lg text-sm font-bold border border-error/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-surface-soft border border-hairline rounded-xl px-4 py-2.5 text-ink outline-none focus:border-brand"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-surface-soft border border-hairline rounded-xl px-4 py-2.5 text-ink outline-none focus:border-brand"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">Password</label>
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-surface-soft border border-hairline rounded-xl px-4 py-2.5 text-ink outline-none focus:border-brand"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.EMPLOYEE})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                      formData.role === UserRole.EMPLOYEE 
                        ? 'border-brand bg-brand/5 text-brand' 
                        : 'border-hairline text-muted hover:border-brand/30'
                    }`}
                  >
                    <UserCircle size={18} />
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.ADMIN})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                      formData.role === UserRole.ADMIN 
                        ? 'border-brand bg-brand/5 text-brand' 
                        : 'border-hairline text-muted hover:border-brand/30'
                    }`}
                  >
                    <Shield size={18} />
                    Admin
                  </button>
                </div>
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
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
