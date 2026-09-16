import type { NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN || "").toLowerCase().trim();
const devLoginEnabled = process.env.ALLOW_DEV_LOGIN === "true";

function emailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  if (!allowedDomain) return true; // no restriction configured
  return email.toLowerCase().endsWith("@" + allowedDomain);
}

// Edge-safe subset of the NextAuth config: no Prisma/database access here so
// it can run in the middleware (Edge) runtime. The full config in `auth.ts`
// extends this with DB-backed role resolution for use in server
// components/route handlers.
export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
    // Local-only fallback so the app can be exercised without a real Azure
    // AD app registration. Never enabled unless ALLOW_DEV_LOGIN=true — keep
    // that unset in any shared/production environment.
    ...(devLoginEnabled
      ? [
          Credentials({
            id: "dev-login",
            name: "Dev login (local only)",
            credentials: { email: { label: "Email", type: "text" } },
            async authorize(credentials) {
              const email = String(credentials?.email || "").trim();
              if (!email) return null;
              return { id: email, email, name: email.split("@")[0] };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    signIn({ user }) {
      return emailAllowed(user.email);
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
} satisfies NextAuthConfig;

export const devLoginAllowed = devLoginEnabled;
