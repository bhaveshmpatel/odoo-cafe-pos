import Link from 'next/link';
import { ArrowRight, Zap, WifiOff, CreditCard, MonitorSmartphone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-hairline/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-canvas font-bold">O</div>
            <span className="font-bold text-xl tracking-tight text-primary">OdooCafe</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-body">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it works</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-body hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="px-5 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-full hover:bg-primary-active transition-colors shadow-subtle hover:shadow-card hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline text-sm font-medium text-body mb-8">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            Now in public beta
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-[1.05] mb-8">
            The next-generation <br className="hidden md:block"/> point of sale system.
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Blazing fast, offline-resilient, and beautifully designed for modern cafes. 
            Sync orders instantly to the kitchen and accept payments via UPI seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary text-lg font-medium rounded-full hover:bg-primary-active transition-all shadow-subtle hover:shadow-card hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Start for free <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-surface-soft text-primary text-lg font-medium rounded-full hover:bg-hairline-soft transition-colors border border-hairline">
              Explore features
            </Link>
          </div>
        </section>

        {/* Product UI Preview (Aesthetic Card) */}
        <section className="px-6 pb-32 max-w-7xl mx-auto">
          <div className="rounded-2xl p-4 bg-surface-soft border border-hairline shadow-card mx-auto max-w-5xl">
            <div className="rounded-xl border border-hairline bg-canvas h-[500px] overflow-hidden flex items-center justify-center relative shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-soft/50 pointer-events-none"></div>
              {/* Mock UI snippet */}
              <div className="w-[80%] h-[80%] bg-surface-soft rounded-xl border border-hairline flex flex-col shadow-subtle overflow-hidden">
                <div className="h-12 border-b border-hairline bg-canvas flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/80"></div>
                  <div className="w-3 h-3 rounded-full bg-warning/80"></div>
                  <div className="w-3 h-3 rounded-full bg-success/80"></div>
                </div>
                <div className="flex-1 flex p-4 gap-4">
                  <div className="flex-1 bg-canvas rounded-lg border border-hairline p-4 space-y-4">
                    <div className="w-1/3 h-6 bg-surface-strong rounded-md"></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-24 bg-surface-strong rounded-lg"></div>
                      <div className="h-24 bg-surface-strong rounded-lg"></div>
                      <div className="h-24 bg-surface-strong rounded-lg"></div>
                    </div>
                  </div>
                  <div className="w-64 bg-canvas rounded-lg border border-hairline p-4 flex flex-col">
                    <div className="w-1/2 h-6 bg-surface-strong rounded-md mb-4"></div>
                    <div className="flex-1 space-y-3">
                       <div className="h-10 bg-surface-soft rounded-md"></div>
                       <div className="h-10 bg-surface-soft rounded-md"></div>
                    </div>
                    <div className="h-12 bg-primary rounded-md mt-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-surface-soft px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-4">Everything you need to run your cafe.</h2>
              <p className="text-lg text-muted">No bloated features. Just pure speed and reliability.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Zap size={24} />, title: "Real-time KDS", desc: "Instantly fire tickets to the kitchen display via WebSockets." },
                { icon: <WifiOff size={24} />, title: "Offline Resilient", desc: "Keep taking orders even when the internet drops. Syncs when back online." },
                { icon: <MonitorSmartphone size={24} />, title: "Floor Management", desc: "Visual multi-table mapping mapped precisely to your cafe's layout." },
                { icon: <CreditCard size={24} />, title: "Dynamic UPI", desc: "Generate custom UPI QR codes for zero-touch rapid payments." }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-canvas rounded-2xl border border-hairline shadow-subtle hover:shadow-card transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{f.title}</h3>
                  <p className="text-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer (Dark) */}
      <footer className="bg-surface-dark text-on-dark py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 border-b border-surface-dark-elevated pb-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-on-dark rounded-lg flex items-center justify-center text-surface-dark font-bold">O</div>
              <span className="font-bold text-xl tracking-tight text-on-dark">OdooCafe</span>
            </div>
            <p className="text-on-dark-soft max-w-sm">The modern operating system for your cafe. Beautiful, fast, and reliable.</p>
          </div>
          <div className="flex gap-16 md:justify-end">
            <div className="space-y-4">
              <h4 className="font-semibold text-on-dark">Product</h4>
              <div className="flex flex-col gap-3 text-on-dark-soft">
                <Link href="#" className="hover:text-on-dark transition-colors">POS Terminal</Link>
                <Link href="#" className="hover:text-on-dark transition-colors">Kitchen Display</Link>
                <Link href="#" className="hover:text-on-dark transition-colors">Admin Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-on-dark-soft text-sm">
          <p>© 2026 OdooCafe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
