import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Coffee, LayoutDashboard } from 'lucide-react';

export default function PosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-surface-soft overflow-hidden">
      {/* Mini Sidebar */}
      <nav className="w-16 h-full bg-surface-dark flex flex-col items-center py-6 gap-8 border-r border-surface-dark-elevated shadow-subtle shrink-0 z-50">
        <Link href="/pos" className="text-brand-accent p-3 bg-brand-accent/10 rounded-xl hover:bg-brand-accent/20 transition-colors">
          <Coffee size={24} />
        </Link>
        <Link href="/kds" className="text-on-dark-soft p-3 rounded-xl hover:bg-surface-dark-elevated hover:text-on-dark transition-colors">
          <LayoutDashboard size={24} />
        </Link>
        <div className="mt-auto">
          <Link href="/admin" className="text-on-dark-soft p-3 rounded-xl hover:bg-surface-dark-elevated hover:text-on-dark transition-colors">
            <Home size={24} />
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
