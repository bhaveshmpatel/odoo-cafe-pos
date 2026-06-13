import Link from 'next/link';
import { ArrowRight, Zap, WifiOff, CreditCard, MonitorSmartphone, Layers, Globe, ShieldCheck } from 'lucide-react';
import ParallaxBackground from '@/components/landing/ParallaxBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-dark text-on-dark flex flex-col font-sans selection:bg-brand-accent/30 selection:text-brand-accent overflow-x-hidden">
      
      {/* Modern Glassmorphic Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-dark/40 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-surface-dark/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-accent to-violet-500 rounded-xl flex items-center justify-center text-white font-bold shadow-glow transition-transform group-hover:scale-105">O</div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">OdooCafe</span>
          </div>
          <nav className="hidden md:flex gap-10 text-sm font-medium text-on-dark-soft">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-on-dark-soft hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="relative px-6 py-2.5 bg-white text-surface-dark text-sm font-semibold rounded-full hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Massive Hero Section */}
        <section className="relative pt-40 pb-32 px-6 text-center max-w-7xl mx-auto min-h-[90vh] flex flex-col items-center justify-center z-10">
          <ParallaxBackground />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-white mb-8 animate-float-delayed shadow-xl">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
              Introducing OdooCafe POS 2.0
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-[1.1] mb-8 max-w-4xl mx-auto">
              The next-generation <br className="hidden md:block"/> point of sale.
            </h1>
            
            <p className="text-xl md:text-2xl text-on-dark-soft max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Blazing fast, offline-resilient, and beautifully designed for modern cafes. 
              Sync orders instantly and accept payments seamlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto">
              <Link href="/signup" className="group relative w-full sm:w-auto px-8 py-4 bg-brand-accent text-white text-lg font-semibold rounded-full transition-all shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
                <span className="relative z-10 flex items-center gap-2">Start for free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white text-lg font-medium rounded-full hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-sm">
                Explore features
              </Link>
            </div>
          </div>
        </section>

        {/* 3D Mock UI Preview */}
        <section className="px-6 pb-40 max-w-7xl mx-auto relative z-20">
          <div className="relative mx-auto max-w-6xl perspective-[2000px]">
            {/* The 3D transformed container */}
            <div 
              className="rounded-2xl border border-white/10 bg-surface-dark-elevated shadow-[0_40px_100px_rgba(0,0,0,0.8)] mx-auto h-[600px] overflow-hidden flex flex-col relative transition-transform duration-700 hover:rotate-0 rotate-x-[15deg] rotate-y-[-5deg] scale-[0.95] hover:scale-100 group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Glassmorphic Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-50"></div>
              
              {/* Browser Header */}
              <div className="h-12 border-b border-white/5 bg-black/40 flex items-center px-6 gap-2 backdrop-blur-md">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-error/90 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-warning/90 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-success/90 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="mx-auto w-1/3 h-6 bg-white/5 rounded-md border border-white/5"></div>
              </div>
              
              {/* Fake UI Body */}
              <div className="flex-1 flex bg-surface-dark p-6 gap-6">
                {/* Main Content Area */}
                <div className="flex-1 bg-surface-dark-elevated rounded-xl border border-white/5 p-6 space-y-6 shadow-inner flex flex-col">
                  {/* Header Row */}
                  <div className="flex justify-between items-center">
                    <div className="w-48 h-8 bg-white/10 rounded-lg"></div>
                    <div className="flex gap-3">
                      <div className="w-32 h-8 bg-white/5 rounded-lg border border-white/5"></div>
                      <div className="w-10 h-8 bg-brand-accent/20 rounded-lg border border-brand-accent/30 text-brand-accent flex items-center justify-center">
                         <Globe size={16} />
                      </div>
                    </div>
                  </div>
                  {/* Grid */}
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-end group-hover:bg-white/10 transition-colors duration-500 delay-[calc(50ms*var(--i))] relative overflow-hidden" style={{'--i': i} as React.CSSProperties}>
                         <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/5"></div>
                         <div className="w-3/4 h-5 bg-white/10 rounded-md mb-2"></div>
                         <div className="w-1/3 h-4 bg-brand-accent/50 rounded-md"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sidebar */}
                <div className="w-80 bg-surface-dark-elevated rounded-xl border border-white/5 p-6 flex flex-col shadow-inner">
                  <div className="w-1/2 h-6 bg-white/10 rounded-md mb-8"></div>
                  <div className="flex-1 space-y-4">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5"></div>
                          <div className="flex-1 space-y-2">
                            <div className="w-full h-3 bg-white/10 rounded"></div>
                            <div className="w-2/3 h-3 bg-white/5 rounded"></div>
                          </div>
                          <div className="w-12 h-4 bg-success/20 rounded-sm"></div>
                       </div>
                     ))}
                  </div>
                  <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between">
                       <div className="w-1/3 h-4 bg-white/5 rounded"></div>
                       <div className="w-1/4 h-4 bg-white/10 rounded"></div>
                    </div>
                    <div className="h-14 bg-brand-accent rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center">
                       <div className="w-1/3 h-5 bg-white/50 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Ambient Glow behind the UI */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-brand-accent/20 blur-[120px] -z-10 pointer-events-none"></div>
          </div>
        </section>

        {/* Modern Bento Grid Features */}
        <section id="features" className="py-32 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">Built for the future.</h2>
              <p className="text-xl text-on-dark-soft max-w-2xl mx-auto">Everything you need to run your cafe, beautifully packed into one blazing fast platform.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              
              {/* Large Feature 1 */}
              <div className="md:col-span-2 md:row-span-2 relative bg-surface-dark-elevated rounded-3xl border border-white/10 overflow-hidden group hover:border-brand-accent/50 transition-colors shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-[60%] h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="p-10 h-full flex flex-col justify-end relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-brand-accent/20 text-brand-accent flex items-center justify-center mb-8 backdrop-blur-md border border-brand-accent/30 group-hover:scale-110 transition-transform">
                    <Zap size={32} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Real-time KDS Sync</h3>
                  <p className="text-lg text-on-dark-soft max-w-md">Instantly fire tickets to the kitchen display via low-latency WebSockets. No more lost orders or delayed tickets.</p>
                </div>
              </div>

              {/* Square Feature 1 */}
              <div className="relative bg-surface-dark-elevated rounded-3xl border border-white/10 overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-xl p-8 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center backdrop-blur-md border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <WifiOff size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Offline Resilient</h3>
                  <p className="text-on-dark-soft leading-relaxed">Keep taking orders even when the internet drops. Background sync restores everything automatically.</p>
                </div>
              </div>

              {/* Square Feature 2 */}
              <div className="relative bg-surface-dark-elevated rounded-3xl border border-white/10 overflow-hidden group hover:border-violet-500/50 transition-colors shadow-xl p-8 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center backdrop-blur-md border border-violet-500/20 group-hover:scale-110 transition-transform">
                  <MonitorSmartphone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Floor Management</h3>
                  <p className="text-on-dark-soft leading-relaxed">Visual multi-table mapping mapped precisely to your cafe&apos;s layout. Drag and drop with ease.</p>
                </div>
              </div>
              
              {/* Wide Feature */}
              <div className="md:col-span-3 relative bg-surface-dark-elevated rounded-3xl border border-white/10 overflow-hidden group hover:border-orange-500/50 transition-colors shadow-xl flex flex-col md:flex-row items-center p-10 gap-10">
                 <div className="flex-1 space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center backdrop-blur-md border border-orange-500/20 group-hover:scale-110 transition-transform">
                      <CreditCard size={28} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">Dynamic UPI Integration</h3>
                    <p className="text-lg text-on-dark-soft max-w-xl">Generate custom UPI QR codes for zero-touch rapid payments directly at the table or counter. Seamlessly integrated into the checkout flow.</p>
                 </div>
                 <div className="w-full md:w-[400px] h-[200px] bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                    <div className="w-32 h-32 bg-white rounded-xl p-2 animate-pulse">
                       {/* Mock QR */}
                       <div className="w-full h-full bg-black/80 rounded-lg"></div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Modern Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 text-on-dark py-24 px-6 relative z-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 border-b border-white/10 pb-16 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-extrabold text-xl">O</div>
              <span className="font-bold text-2xl tracking-tight text-white">OdooCafe</span>
            </div>
            <p className="text-on-dark-soft max-w-sm text-lg leading-relaxed mb-8">The modern operating system for your cafe. Beautiful, fast, and remarkably reliable.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Globe size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><ShieldCheck size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Layers size={18} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            <div className="space-y-6">
              <h4 className="font-semibold text-white tracking-wide">Product</h4>
              <div className="flex flex-col gap-4 text-on-dark-soft">
                <Link href="#" className="hover:text-brand-accent transition-colors">POS Terminal</Link>
                <Link href="#" className="hover:text-brand-accent transition-colors">Kitchen Display</Link>
                <Link href="#" className="hover:text-brand-accent transition-colors">Admin Dashboard</Link>
                <Link href="#" className="hover:text-brand-accent transition-colors">Integrations</Link>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="font-semibold text-white tracking-wide">Company</h4>
              <div className="flex flex-col gap-4 text-on-dark-soft">
                <Link href="#" className="hover:text-brand-accent transition-colors">About</Link>
                <Link href="#" className="hover:text-brand-accent transition-colors">Blog</Link>
                <Link href="#" className="hover:text-brand-accent transition-colors">Careers</Link>
                <Link href="#" className="hover:text-brand-accent transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-on-dark-soft text-sm">
          <p>© {new Date().getFullYear()} OdooCafe. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
