import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .toLowerCase()
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

async function resolveAccess(email: string) {
  const lower = email.toLowerCase();
  const isAdmin = adminEmails.includes(lower);
  const access = await prisma.categoryAccess.findMany({ where: { emails: { has: lower } } });
  return { isAdmin, editableCategories: access.map((a) => a.category) };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email;
        const { isAdmin, editableCategories } = await resolveAccess(session.user.email ?? "");
        session.user.isAdmin = isAdmin;
        session.user.editableCategories = editableCategories;
      }
      return session;
    },
  },
});
