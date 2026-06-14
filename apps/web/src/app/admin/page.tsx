"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated" && session) {
      const fetchAnalytics = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
          const token = (session.user as any)?.token;
          if (!token) return;
          
          const res = await fetch(`${apiUrl}/api/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              setData(json.data);
            }
          }
        } catch (err) {
          console.error("Failed to load analytics", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [status, session, router]);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  const { topProducts, revenueTrend, topCategory, topProduct } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      
      <div>
        <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
        <p className="text-muted">Overview of your cafe's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-card p-6 rounded-2xl border border-hairline shadow-sm flex flex-col justify-center">
          <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Top Selling Product</p>
          {topProduct ? (
            <div>
              <h3 className="text-3xl font-black text-ink">{topProduct.name}</h3>
              <p className="text-brand font-medium mt-1">{topProduct.sales} units sold</p>
            </div>
          ) : (
            <p className="text-muted">No data</p>
          )}
        </div>

        <div className="bg-surface-card p-6 rounded-2xl border border-hairline shadow-sm flex flex-col justify-center">
          <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Top Category</p>
          {topCategory ? (
            <div>
              <h3 className="text-3xl font-black text-ink">{topCategory.name}</h3>
              <p className="text-brand font-medium mt-1">{topCategory.sales} items sold</p>
            </div>
          ) : (
            <p className="text-muted">No data</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Trend Line Chart */}
        <div className="bg-surface-card p-6 rounded-2xl border border-hairline shadow-sm">
          <h2 className="text-xl font-bold text-ink mb-6">Revenue Trend (Last 30 Days)</h2>
          <div className="h-[300px] w-full">
            {revenueTrend && revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(val) => `$${val}`}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#3b82f6" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted">No revenue data available</div>
            )}
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-surface-card p-6 rounded-2xl border border-hairline shadow-sm">
          <h2 className="text-xl font-bold text-ink mb-6">Top Selling Products</h2>
          <div className="h-[300px] w-full">
            {topProducts && topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                  <XAxis 
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [value, 'Units Sold']}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted">No sales data available</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
