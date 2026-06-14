import { ReactNode } from "react";

export default function KdsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen bg-canvas overflow-hidden flex flex-col">
      {/* Top Header for KDS */}
      <header className="bg-ink text-canvas py-3 px-6 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-3">
            <img src="/image.png" alt="Odoo Cafe Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
            <h1 className="text-xl font-bold tracking-tight">Odoo Cafe <span className="font-medium opacity-80">| Kitchen Display System</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium opacity-80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse"></span>
            Live Updates Active
          </div>
        </div>
      </header>
      
      {/* Main Kanban Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
