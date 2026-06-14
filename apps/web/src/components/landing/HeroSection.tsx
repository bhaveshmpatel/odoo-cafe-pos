"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
      {/* Subtle radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium border rounded-full bg-background/50 border-foreground/10 text-foreground">
          <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Odoo Cafe POS 2.0 is now live
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
          The Point of Sale Built <br className="hidden md:block" />
          for High-Volume Cafes.
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
          Lightning-fast checkouts, real-time inventory sync, and intelligent analytics.
          A premium architectural design language for modern cafe operations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-foreground text-white shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.15)] transition-shadow"
            >
              Get Started Free <ArrowRight size={16} />
            </motion.button>
          </Link>
          <Link href="#demo">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg border border-foreground/10 bg-background hover:bg-foreground/5 transition-colors text-foreground"
            >
              <PlayCircle size={16} /> Watch Demo
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Spring Animated Dashboard Mockup */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        className="relative z-10 w-full max-w-5xl mt-20 rounded-2xl border border-foreground/10 bg-white shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none z-20 h-32 bottom-0" />
        
        {/* Mockup Header */}
        <div className="h-10 border-b border-foreground/5 bg-gray-100 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
        </div>

        {/* Mockup Body */}
        <div className="h-[400px] md:h-[600px] flex bg-white p-4 gap-4">
          {/* Main Grid */}
          <div className="flex-1 bg-gray-50 rounded-lg border border-foreground/5 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="w-32 h-6 bg-foreground/10 rounded-md" />
              <div className="w-24 h-6 bg-foreground/5 rounded-md" />
            </div>
            <div className="grid grid-cols-3 gap-3 flex-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-foreground/5 rounded-lg border border-foreground/5 p-4 flex flex-col justify-end">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 mb-auto" />
                  <div className="w-3/4 h-4 bg-foreground/20 rounded mb-2" />
                  <div className="w-1/2 h-3 bg-foreground/10 rounded" />
                </div>
              ))}
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-64 md:w-80 bg-gray-50 rounded-lg border border-foreground/5 p-4 flex flex-col gap-4">
            <div className="w-1/2 h-5 bg-foreground/10 rounded" />
            <div className="flex-1 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded bg-foreground/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-full h-2.5 bg-foreground/10 rounded" />
                    <div className="w-2/3 h-2 bg-foreground/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500 font-medium text-sm border border-emerald-500/30">
              Pay $24.50
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
