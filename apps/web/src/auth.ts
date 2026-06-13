import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const nextAuthOptions = {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  secret: process.env.AUTH_SECRET,
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          if (data.success && data.data?.user) {
            return {
              id: data.data.user.id,
              name: data.data.user.full_name,
              email: data.data.user.email,
              role: data.data.user.role,
              token: data.data.token,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: any) {
      if (user) {
        if (account?.provider === "google") {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email, name: user.name }),
            });
            const data = await res.json();
            if (data.success && data.data?.user) {
              token.id = data.data.user.id;
              token.role = data.data.user.role;
              token.token = data.data.token;
            }
          } catch (error) {
            console.error("Google Auth backend sync error:", error);
          }
        } else {
          token.id = user.id;
          token.role = user.role;
          token.token = user.token;
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.token = token.token as string;
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/terminal');
      
      if (isDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

const nextAuth = NextAuth(nextAuthOptions);

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signIn: any = nextAuth.signIn;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signOut: any = nextAuth.signOut;
