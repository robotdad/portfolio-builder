import { prisma } from '@/lib/prisma'

/**
 * Validate auth configuration on startup.
 * In production, this will throw fatal errors if:
 * - AUTH_DISABLED=true (security violation)
 * - AllowedEmail table is empty (no admins configured)
 * - Required OAuth env vars are missing
 */
export async function validateAuthConfig() {
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isProduction) {
    // Skip validation in development
    return
  }

  // 1. Check AUTH_DISABLED is not true in production
  if (process.env.AUTH_DISABLED === 'true') {
    throw new Error('FATAL: AUTH_DISABLED=true is not allowed in production')
  }

  // 2. Check allowlist is not empty
  const allowedCount = await prisma.allowedEmail.count()
  if (allowedCount === 0) {
    throw new Error('FATAL: No allowed emails configured. Run: npm run db:seed-admin <email>')
  }

  // 3. Check required OAuth env vars
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'AUTH_SECRET']
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`FATAL: Missing required environment variables: ${missing.join(', ')}`)
  }
}
