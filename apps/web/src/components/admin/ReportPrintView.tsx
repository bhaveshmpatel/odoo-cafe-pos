import { formatCurrency } from "@/lib/utils";

interface ReportData {
  total_revenue: number;
  total_orders: number;
  product_breakdown: { name: string; quantity: number; revenue: number }[];
}

interface ReportPrintViewProps {
  data: ReportData;
  filters: any;
  options: any;
}

export function ReportPrintView({ data, filters, options }: ReportPrintViewProps) {
  const getFilterLabel = (key: string, val: string) => {
    if (!val) return "All";
    if (key === "userId") return options?.users.find((u: any) => u.id === val)?.full_name || val;
    if (key === "sessionId") return options?.sessions.find((s: any) => s.id === val)?.label || val;
    if (key === "productId") return options?.products.find((p: any) => p.id === val)?.name || val;
    return val;
  };

  return (
    <div className="hidden print:block absolute inset-0 w-full text-black bg-white z-50">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Odoo Cafe Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Odoo Cafe POS</h1>
              <p className="text-gray-500 font-medium">Sales Analytics Report</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500 font-medium">
            Generated on: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Filters Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div><span className="font-bold text-gray-700">Start Date:</span> {filters.startDate || "Any"}</div>
          <div><span className="font-bold text-gray-700">End Date:</span> {filters.endDate || "Any"}</div>
          <div><span className="font-bold text-gray-700">Staff:</span> {getFilterLabel("userId", filters.userId)}</div>
          <div><span className="font-bold text-gray-700">Session:</span> {getFilterLabel("sessionId", filters.sessionId)}</div>
          <div className="col-span-2"><span className="font-bold text-gray-700">Product Filter:</span> {getFilterLabel("productId", filters.productId)}</div>
        </div>
      </div>

      {/* Summary Totals */}
      <div className="flex gap-8 mb-8">
        <div className="flex-1 border border-black rounded-xl p-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-1">Total Revenue</h2>
          <p className="text-4xl font-black">{formatCurrency(data.total_revenue)}</p>
        </div>
        <div className="flex-1 border border-black rounded-xl p-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-1">Total Orders</h2>
          <p className="text-4xl font-black">{data.total_orders}</p>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 border-b border-black pb-1">Product Breakdown</h3>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-3 px-2 font-bold">Product Name</th>
              <th className="py-3 px-2 text-right font-bold">Quantity Sold</th>
              <th className="py-3 px-2 text-right font-bold">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.product_breakdown.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="py-3 px-2">{item.name}</td>
                <td className="py-3 px-2 text-right">{item.quantity}</td>
                <td className="py-3 px-2 text-right font-bold">{formatCurrency(item.revenue)}</td>
              </tr>
            ))}
            {data.product_breakdown.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500 italic">No products found for this criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t border-gray-200">
        End of Report • Odoo Cafe POS Internal Documentation
      </div>
    </div>
  );
}
