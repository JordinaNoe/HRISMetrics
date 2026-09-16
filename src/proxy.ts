import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the Edge-safe auth config only (no Prisma) so this can run in the
// middleware runtime.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  // Protect everything except the sign-in page, NextAuth's own routes, and
  // static assets.
  matcher: ["/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)"],
};
