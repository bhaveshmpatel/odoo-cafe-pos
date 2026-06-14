"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin"); // Or wherever the default post-login route is
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/image.png" alt="Odoo Cafe Logo" className="h-16 w-auto mb-2 object-contain drop-shadow-md" />
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="text-sm text-muted">
          Enter your credentials to access the terminal
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error border border-error/20">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            className="flex h-11 w-full rounded-lg border border-hairline bg-surface-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="flex h-11 w-full rounded-lg border border-hairline bg-surface-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="group mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-on-primary shadow-lg transition-all hover:opacity-90 hover:shadow-brand-accent/25 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:pointer-events-none disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-hairline" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-canvas px-2 text-muted">
            Or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/admin" })}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-hairline bg-surface-card px-4 py-2 text-sm font-medium text-ink shadow-sm transition-all hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:pointer-events-none disabled:opacity-50"
        disabled={isLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </button>

      <div className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-accent hover:opacity-80 transition-opacity font-medium hover:underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
