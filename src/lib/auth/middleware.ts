/**
 * Edge-compatible Auth Configuration for Middleware
 * 
 * This is a minimal NextAuth configuration that works in Edge Runtime.
 * It does NOT include the Prisma-based signIn callback (that runs only during
 * actual sign-in, handled by the API route with the full config.ts).
 * 
 * Use this for middleware session checking only.
 */
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // No callbacks that require database access
  // The full signIn callback with allowlist check is in config.ts
  // and runs during actual OAuth flow via API routes
})
