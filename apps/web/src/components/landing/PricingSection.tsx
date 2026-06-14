"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const includedFeatures = [
  "Unlimited orders and transactions",
  "Real-time kitchen display sync",
  "Offline resilience & background sync",
  "Basic multi-table floor plans",
  "Standard email support",
];

export function PricingSection() {
  return (
    <section className="w-full py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16 w-full">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-4">
          Start for free, then pay a flat monthly fee as your cafe scales. No hidden transaction fees.
        </p>
      </div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl border border-foreground/10 bg-white p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12 justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 z-10">
          <h3 className="text-2xl font-semibold text-foreground mb-6">Pro Plan</h3>
          <ul className="space-y-4 mb-8">
            {includedFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center items-start md:items-end w-full md:w-64 z-10 border-t border-foreground/10 md:border-t-0 md:border-l md:pl-12 pt-8 md:pt-0">
          <p className="text-sm font-medium text-muted-foreground mb-2">Starting at</p>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-5xl font-bold tracking-tight text-foreground">$49</span>
            <span className="text-muted-foreground mb-1">/mo</span>
          </div>
          <Link href="/signup" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-6 text-sm font-semibold rounded-lg bg-foreground text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all"
            >
              Get Started Free
            </motion.button>
          </Link>
          <p className="text-xs text-muted-foreground text-center w-full mt-4">
            No credit card required
          </p>
        </div>
      </motion.div>
    </section>
  );
}
