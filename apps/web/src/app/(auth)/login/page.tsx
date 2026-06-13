'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/pos');
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/pos' });
  };

  return (
    <div className="w-full max-w-md bg-canvas rounded-2xl shadow-card border border-hairline p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-canvas font-bold mx-auto mb-4 text-xl">O</div>
        <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
        <p className="text-muted mt-2">Enter your credentials to access the POS.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center font-medium">
          {error}
        </div>
      )}

      <button 
        onClick={handleGoogleSignIn}
        className="w-full py-3 px-4 bg-canvas border border-hairline rounded-xl flex items-center justify-center gap-3 text-body font-medium hover:bg-surface-soft hover:shadow-subtle transition-all mb-6"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-hairline"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-canvas text-muted">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-body mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-soft border border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              placeholder="name@cafe.com"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-body mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-soft border border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className="w-full py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary-active transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>Sign in <ArrowRight size={20} /></>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-body">
        Don't have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
