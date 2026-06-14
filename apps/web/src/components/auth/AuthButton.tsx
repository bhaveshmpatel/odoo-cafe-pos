"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

export function AuthButton({ session }: { session: { user?: { name?: string | null, email?: string | null, image?: string | null } } | null }) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-body">
          {session.user.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center">
              <User className="w-4 h-4 text-muted" />
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink bg-surface-soft hover:bg-surface-strong rounded-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link 
        href="/signin" 
        className="px-5 py-2.5 text-sm font-semibold text-ink bg-canvas border border-hairline hover:bg-surface-soft rounded-full transition-all hover:-translate-y-0.5 hover:shadow-sm"
      >
        Log in
      </Link>
      <Link 
        href="/signup" 
        className="px-5 py-2.5 text-sm font-semibold text-on-primary bg-primary hover:bg-primary-active rounded-full transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
      >
        Sign up
      </Link>
    </div>
  );
}
