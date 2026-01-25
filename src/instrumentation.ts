/**
 * Next.js instrumentation hook.
 * Runs once when the server starts.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateAuthConfig } = await import('@/lib/auth/validate')
    await validateAuthConfig()
  }
}
