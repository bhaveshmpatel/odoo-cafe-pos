import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { AuthButton } from '../auth/AuthButton';
import { auth } from '@/auth';

export async function TopNav() {
  const session = await auth();

  return (
    <header className="h-16 bg-canvas/70 backdrop-blur-lg border-b border-hairline-soft sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto w-full h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink font-display font-semibold text-title-md hover:opacity-80 transition-opacity">
          <Coffee className="w-6 h-6 text-brand-accent" />
          <span>Odoo Cafe</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-body">
          <Link href="#features" className="hover:text-ink transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-ink transition-colors">How it Works</Link>
        </nav>

        <div className="flex items-center gap-6">
          {session?.user ? (
            <Link href="/admin" className="text-sm font-medium text-ink hover:text-brand-accent transition-colors">
              Dashboard
            </Link>
          ) : null}
          <AuthButton session={session} />
        </div>
      </div>
    </header>
  );
}
