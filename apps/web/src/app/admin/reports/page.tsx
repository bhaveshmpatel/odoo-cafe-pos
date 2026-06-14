"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Calendar, User, Clock, Package, Download, Loader2, FileText, Search } from "lucide-react";
import { ReportPrintView } from "@/components/admin/ReportPrintView";
import { useSession } from "next-auth/react";

interface ReportData {
  total_revenue: number;
  total_orders: number;
  product_breakdown: { name: string; quantity: number; revenue: number }[];
}

interface FilterOptions {
  users: { id: string; full_name: string }[];
  sessions: { id: string; label: string }[];
  products: { id: string; name: string }[];
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token;

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "",
    sessionId: "",
    productId: ""
  });
  
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadOptions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/reports/filters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOptions(data.data);
        }
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    loadOptions();
  }, [token]);

  const generateReport = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.sessionId) params.append("sessionId", filters.sessionId);
      if (filters.productId) params.append("productId", filters.productId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        alert("Failed to generate report.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating report");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 pb-32">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Sales Reports</h1>
          <p className="text-muted">Generate detailed analytics and export to PDF.</p>
        </div>
        {reportData && (
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-brand text-on-primary px-5 py-2.5 rounded-lg font-semibold hover:bg-brand/90 transition-all shadow-md shadow-brand/20"
          >
            <Download size={18} />
            Export to PDF
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:hidden">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-hairline">
            <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
              <Search size={18} className="text-brand" />
              Filter Criteria
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input 
                    type="date" 
                    value={filters.startDate}
                    onChange={e => setFilters({...filters, startDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input 
                    type="date" 
                    value={filters.endDate}
                    onChange={e => setFilters({...filters, endDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Staff Member</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <select 
                    value={filters.userId}
                    onChange={e => setFilters({...filters, userId: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none"
                  >
                    <option value="">All Staff</option>
                    {options?.users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Shift Session</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <select 
                    value={filters.sessionId}
                    onChange={e => setFilters({...filters, sessionId: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none"
                  >
                    <option value="">All Sessions</option>
                    {options?.sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Product Filter</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <select 
                    value={filters.productId}
                    onChange={e => setFilters({...filters, productId: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none"
                  >
                    <option value="">All Products</option>
                    {options?.products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={generateReport}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-ink text-canvas py-3 rounded-xl font-bold hover:bg-ink/90 transition-colors disabled:opacity-70 mt-6"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {reportData ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-hairline flex flex-col justify-center">
                  <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Total Revenue</p>
                  <p className="text-4xl font-black text-brand-accent">{formatCurrency(reportData.total_revenue)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-hairline flex flex-col justify-center">
                  <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Total Orders</p>
                  <p className="text-4xl font-black text-ink">{reportData.total_orders}</p>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-hairline overflow-hidden">
                <div className="p-6 border-b border-hairline flex items-center justify-between">
                  <h3 className="font-bold text-ink text-lg">Product Breakdown</h3>
                </div>
                {reportData.product_breakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-soft text-muted font-bold uppercase text-xs tracking-wider">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">Product</th>
                          <th className="px-6 py-4 text-right">Quantity Sold</th>
                          <th className="px-6 py-4 text-right rounded-tr-lg">Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline">
                        {reportData.product_breakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-soft/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-ink">{item.name}</td>
                            <td className="px-6 py-4 text-right text-muted">{item.quantity}</td>
                            <td className="px-6 py-4 text-right font-bold text-brand-accent">{formatCurrency(item.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No product sales found for the selected criteria.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted bg-white rounded-2xl border border-hairline border-dashed">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-lg">Report Viewer</p>
              <p className="text-sm">Select filters and click Generate Report.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print Layout */}
      {reportData && (
        <ReportPrintView 
          data={reportData} 
          filters={filters}
          options={options}
        />
      )}
    </div>
  );
}
