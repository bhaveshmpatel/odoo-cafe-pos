import { ReactNode } from "react";
import { Coffee, Wifi } from "lucide-react";
import { auth } from "@/auth";

export default async function PosLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="flex h-screen flex-col bg-surface-soft text-ink overflow-hidden print:h-auto print:overflow-visible print:bg-white selection:bg-brand-accent selection:text-white">
      <header className="flex h-14 items-center justify-between border-b border-hairline bg-canvas px-4 shadow-sm z-50 print:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent shadow-sm">
            <Coffee className="h-4 w-4 text-on-primary" />
          </div>
          <span className="font-semibold text-ink">Odoo Cafe POS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
            <Wifi className="h-3 w-3" />
            <span>Online</span>
          </div>
          <div className="text-sm font-medium text-muted border-l border-hairline pl-4">
            {session?.user?.name || "Staff"}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
