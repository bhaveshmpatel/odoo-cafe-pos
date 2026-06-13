"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Coffee } from "lucide-react";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-background/80 border-b border-foreground/5"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-foreground text-white">
          <Coffee size={18} />
        </div>
        <span className="font-semibold tracking-tight text-lg text-foreground">
          Odoo Cafe
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link href="#features" className="hover:text-foreground transition-colors">
          Features
        </Link>
        <Link href="#analytics" className="hover:text-foreground transition-colors">
          Analytics
        </Link>
        <Link href="#hardware" className="hover:text-foreground transition-colors">
          Hardware
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium hover:text-foreground transition-colors hidden sm:block"
        >
          Sign In
        </Link>
        <Link href="/signup">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm font-medium rounded-md bg-foreground text-white hover:bg-white/90 transition-colors"
          >
            Book a Demo
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}
