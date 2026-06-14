"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ShoppingCart } from "lucide-react";

type ViewType = "cashier" | "manager";

export function InteractiveTabs() {
  const [activeView, setActiveView] = useState<ViewType>("cashier");

  return (
    <section id="analytics" className="py-24 px-6 bg-gray-100 border-y border-foreground/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            A Interface for Every Role
          </h2>
          <p className="text-lg text-muted-foreground">
            Switch seamlessly between high-speed checkout and deep managerial insights.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex p-1 bg-white border border-foreground/10 rounded-full">
            <button
              onClick={() => setActiveView("cashier")}
              className={`relative flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-colors z-10 ${
                activeView === "cashier" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeView === "cashier" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-foreground rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <ShoppingCart size={16} /> Cashier Screen
            </button>

            <button
              onClick={() => setActiveView("manager")}
              className={`relative flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-colors z-10 ${
                activeView === "manager" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeView === "manager" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-foreground rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <LayoutDashboard size={16} /> Manager Analytics
            </button>
          </div>
        </div>

        <div className="relative h-[400px] md:h-[500px] bg-white border border-foreground/10 rounded-2xl overflow-hidden flex items-center justify-center">
          {activeView === "cashier" ? (
            <motion.div
              key="cashier"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col p-6"
            >
               <div className="w-1/3 h-8 bg-foreground/5 rounded-md mb-6" />
               <div className="flex-1 flex gap-6">
                 <div className="flex-1 grid grid-cols-4 gap-4">
                   {[...Array(12)].map((_, i) => (
                     <div key={i} className="bg-foreground/5 rounded-lg border border-foreground/5" />
                   ))}
                 </div>
                 <div className="w-72 bg-foreground/5 rounded-lg border border-foreground/5 flex flex-col justify-between p-4">
                    <div className="space-y-3">
                      <div className="h-10 bg-foreground/10 rounded-md" />
                      <div className="h-10 bg-foreground/10 rounded-md" />
                      <div className="h-10 bg-foreground/10 rounded-md" />
                    </div>
                    <div className="h-16 bg-emerald-500/20 rounded-md border border-emerald-500/30" />
                 </div>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key="manager"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col p-6"
            >
              <div className="flex gap-4 mb-6">
                 <div className="w-1/4 h-24 bg-foreground/5 rounded-xl border border-foreground/5" />
                 <div className="w-1/4 h-24 bg-foreground/5 rounded-xl border border-foreground/5" />
                 <div className="w-1/4 h-24 bg-foreground/5 rounded-xl border border-foreground/5" />
                 <div className="w-1/4 h-24 bg-emerald-500/10 rounded-xl border border-emerald-500/20" />
              </div>
              <div className="flex-1 flex gap-4">
                 <div className="w-2/3 bg-foreground/5 rounded-xl border border-foreground/5" />
                 <div className="w-1/3 bg-foreground/5 rounded-xl border border-foreground/5" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
