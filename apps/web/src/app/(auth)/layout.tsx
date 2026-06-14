export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-canvas text-ink overflow-hidden selection:bg-brand-accent selection:text-white">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-badge-violet rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-badge-emerald rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dnum4rilw/image/upload/v1709425402/grid-pattern_q5m9xw.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>

      <main className="relative z-10 w-full max-w-md px-4 py-8 sm:px-6 sm:py-12">
        <div className="bg-canvas/80 backdrop-blur-2xl border border-hairline rounded-3xl p-8 shadow-2xl shadow-ink/5">
          {children}
        </div>
      </main>
    </div>
  );
}
