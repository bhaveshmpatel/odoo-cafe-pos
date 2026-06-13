import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      apiToken: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    apiToken: string;
  }
}

// Bypass TS inference portability issue with NextAuth providers
const authResult = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.data) {
          return {
            id: data.data.user.id,
            name: data.data.user.full_name,
            email: data.data.user.email,
            role: data.data.user.role,
            apiToken: data.data.token,
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // If logging in with Google, we need to sync with our backend
      if (account?.provider === 'google') {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: account.providerAccountId,
            }),
          });
          
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            // Attach the backend token to the NextAuth user object
            // so we can access it in the jwt callback
            user.id = data.data.user.id;
            user.role = data.data.user.role;
            (user as any).apiToken = data.data.token;
            return true;
          }
          return false;
        } catch (e) {
          console.error("Google sync error:", e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.apiToken = (user as any).apiToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.apiToken = token.apiToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' }
}) as any;

export const { handlers, signIn, signOut, auth } = authResult;
