import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Define routes that require authentication
const protectedRoutes = ['/pos', '/kds', '/admin'];

import { NextRequest } from "next/server"

export default auth((req: NextRequest & { auth?: any }) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !isLoggedIn) {
    // Redirect to login if trying to access a protected route without being logged in
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // If logged in and trying to access login/signup, redirect to POS
  if (isLoggedIn && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/pos', req.nextUrl));
  }

  return NextResponse.next();
})

export const config = {
  // Matcher ignoring static files, api routes, and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
