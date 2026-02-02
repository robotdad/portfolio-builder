/**
 * Prisma Client Singleton
 *
 * Provides a single, shared instance of the Prisma client for database access
 * throughout the application.
 *
 * Why a singleton? In development, Next.js hot reloads clear the Node.js module
 * cache on every change. Without this pattern, each reload would create a new
 * PrismaClient instance, quickly exhausting database connections. By storing
 * the client on `globalThis` (which persists across hot reloads), we reuse the
 * same connection pool.
 *
 * How it works:
 * 1. Check if a PrismaClient already exists on globalThis
 * 2. If not, create one with the SQLite adapter (libsql)
 * 3. In development, store it on globalThis for reuse
 * 4. In production, each cold start creates a fresh client (no global caching needed)
 *
 * Used by: API routes, server components, and any server-side database operations
 *
 * @example
 * import { prisma } from '@/lib/prisma'
 * const users = await prisma.user.findMany()
 */
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
  const libsql = createClient({ url: databaseUrl })
  const adapter = new PrismaLibSql(libsql)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
