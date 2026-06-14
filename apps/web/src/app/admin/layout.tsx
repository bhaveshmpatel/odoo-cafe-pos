import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Map, Package, Tags, TicketPercent, LogOut, Users, BarChart2 } from "lucide-react";
import { AdminProviders } from "./AdminProviders";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      <div className="flex h-screen w-screen bg-canvas overflow-hidden print:h-auto print:w-auto print:overflow-visible print:bg-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface-card border-r border-hairline flex flex-col shadow-sm z-20 print:hidden">
        <div className="p-6 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner overflow-hidden border border-hairline bg-white">
              <img src="/image.png" alt="Odoo Cafe" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink leading-tight">Odoo Cafe</h1>
              <p className="text-xs text-muted font-medium">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavLink href="/admin/floors" icon={<Map size={20} />} label="Floor Plan" />
          <NavLink href="/admin/reports" icon={<BarChart2 size={20} />} label="Reports" />
          
          <div className="mt-4 mb-1 px-3 text-xs font-bold text-muted uppercase tracking-wider">Inventory</div>
          <NavLink href="/admin/products" icon={<Package size={20} />} label="Products" />
          <NavLink href="/admin/categories" icon={<Tags size={20} />} label="Categories" />
          <NavLink href="/admin/promotions" icon={<TicketPercent size={20} />} label="Promotions" />

          <div className="mt-4 mb-1 px-3 text-xs font-bold text-muted uppercase tracking-wider">Audience</div>
          <NavLink href="/admin/customers" icon={<Users size={20} />} label="Customers" />

          <div className="mt-4 mb-1 px-3 text-xs font-bold text-muted uppercase tracking-wider">Staff</div>
          <NavLink href="/admin/users" icon={<Users size={20} />} label="Users" />
        </nav>

        <div className="p-4 border-t border-hairline flex flex-col gap-2">
          <Link href="/terminal" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-brand hover:bg-brand/10 transition-colors font-medium">
            <LayoutDashboard size={20} />
            POS Terminal
          </Link>
          <Link href="/kds" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors font-medium">
            <Map size={20} />
            Kitchen Display
          </Link>
          <div className="w-full h-px bg-hairline my-1"></div>
          <Link href="/signin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error/10 transition-colors font-medium">
            <LogOut size={20} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-soft/30 print:overflow-visible print:bg-white">
        <div className="flex-1 overflow-y-auto print:overflow-visible">
          {children}
        </div>
      </main>
      
    </div>
    </AdminProviders>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  // We'll use a basic style for now. In a real app we'd use usePathname to highlight the active link.
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink/80 hover:bg-brand/10 hover:text-brand font-medium transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
