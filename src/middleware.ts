import { auth } from "@/lib/auth/middleware"
import { NextResponse } from "next/server"

const PROTECTED_PATTERNS = ['/admin', '/preview', '/api/admin']
const PUBLIC_PATTERNS = ['/api/auth', '/auth', '/_next', '/favicon.ico']

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Skip public routes
  if (PUBLIC_PATTERNS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }
  
  // Check if route needs protection
  const isProtected = PROTECTED_PATTERNS.some(p => pathname.startsWith(p))
  if (!isProtected) {
    return NextResponse.next()
  }
  
  // Dev bypass
  if (process.env.AUTH_DISABLED === 'true' && process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }
  
  // Check authentication
  if (!req.auth) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
