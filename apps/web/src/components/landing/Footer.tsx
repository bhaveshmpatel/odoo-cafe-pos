import Link from "next/link";
import { Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-foreground/5 bg-background pt-16 pb-8 px-6 text-muted-foreground">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-foreground text-background">
              <Coffee size={18} />
            </div>
            <span className="font-semibold tracking-tight text-lg text-foreground">
              Odoo Cafe
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            The next-generation point of sale built specifically for high-volume cafes.
            Offline resilient, blazing fast, and beautifully designed.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground text-sm">Product</h4>
            <Link href="#features" className="text-sm hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#analytics" className="text-sm hover:text-foreground transition-colors">Analytics</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground text-sm">Company</h4>
            <Link href="#" className="text-sm hover:text-foreground transition-colors">About</Link>
            <Link href="#" className="text-sm hover:text-foreground transition-colors">Blog</Link>
            <Link href="#" className="text-sm hover:text-foreground transition-colors">Contact</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground text-sm">Legal</h4>
            <Link href="#" className="text-sm hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-foreground/5 text-sm">
        <p>© {new Date().getFullYear()} Odoo Cafe POS. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          {/* Social Links would go here */}
          <div className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
