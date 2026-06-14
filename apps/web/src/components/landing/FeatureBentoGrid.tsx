"use client";

import { motion, Variants } from "framer-motion";
import { WifiOff, Database, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Lightning-Fast Offline Checkout",
    description: "Built with local-first architecture. Keep taking orders and processing transactions even when your internet drops. Background sync restores everything automatically when you're back online.",
    icon: <WifiOff size={24} />,
    colSpan: "md:col-span-2",
  },
  {
    title: "Deep Odoo Inventory Sync",
    description: "Real-time ingredient tracking and stock management. Never sell what you don't have.",
    icon: <Database size={24} />,
    colSpan: "md:col-span-1",
  },
  {
    title: "Live Cafe Analytics",
    description: "Make data-driven decisions with real-time insights into sales velocity, peak hours, and staff efficiency metrics.",
    icon: <BarChart3 size={24} />,
    colSpan: "md:col-span-3",
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function FeatureBentoGrid() {
  return (
    <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Engineered for Reliability
        </h2>
        <p className="text-lg text-muted-foreground">
          Core application pillars designed to keep your cafe running seamlessly.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]"
      >
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, borderColor: "rgba(16, 185, 129, 0.3)" }}
            transition={{ duration: 0.2 }}
            className={`group relative p-8 rounded-2xl bg-white border border-foreground/5 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] ${feature.colSpan}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-emerald-400/80 mb-6 group-hover:scale-110 group-hover:text-emerald-400 transition-all duration-300 relative z-10">
              {feature.icon}
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
